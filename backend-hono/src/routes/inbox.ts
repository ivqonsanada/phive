/** Inbox, direct messages, realtime channel auth and the WebSocket endpoint. */
import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
import { type Context, Hono } from "hono";

import {
  inboxes,
  messageBodies,
  messageHeaders,
  projectBoxes,
  projectInvitations,
  projects,
  teamInvitations,
  teamMembers,
  teams,
} from "../db/schema";
import { InboxCategory, InvitationStatus, ProjectBoxStatus } from "../domain/enums";
import type { AppEnv, Bindings, Database } from "../env";
import { currentUser, requireUser } from "../lib/auth";
import { abort, HttpError, iso, modelNotFound, readInput } from "../lib/http";
import { isUuid } from "../lib/uuid";
import { max, required, string, validate } from "../lib/validator";
import { signChannel } from "../realtime/hub";
import { userSummary } from "../resources";
import { usersById } from "../resources/load";
import { userByTagname } from "./party";
import { phpBoolean } from "./workflow";

// Mounted at /api beside public routes, so auth is per route.
export const inboxRoutes = new Hono<AppEnv>();
export const realtimeRoutes = new Hono<AppEnv>();

const routeNotFound = (c: Context) => abort(404, `The route ${c.req.path.replace(/^\//, "")} could not be found.`);

async function ownInbox(c: Context<AppEnv>) {
  const id = c.req.param("inbox") ?? "";
  if (!isUuid(id)) routeNotFound(c);
  const [row] = await c.get("db").select().from(inboxes).where(eq(inboxes.id, id)).limit(1);
  if (!row) modelNotFound("Inbox", id);
  if (row.recipient_id !== currentUser(c).id) abort(403);
  return row;
}

inboxRoutes.get("/inbox", requireUser, async (c) => {
  const db = c.get("db");
  const me = currentUser(c);
  const rows = await db.select().from(inboxes).where(eq(inboxes.recipient_id, me.id)).orderBy(desc(inboxes.created_at), desc(inboxes.id));

  const ids = <K extends keyof (typeof rows)[number]>(key: K) => rows.map((r) => r[key]).filter((v): v is NonNullable<typeof v> => Boolean(v)) as string[];
  const [teamInvites, projectInvites, bodies] = await Promise.all([
    ids("team_invitation_id").length
      ? db.select({ invite: teamInvitations, team: teams }).from(teamInvitations).innerJoin(teams, eq(teams.id, teamInvitations.team_id)).where(inArray(teamInvitations.id, ids("team_invitation_id")))
      : [],
    ids("project_invitation_id").length
      ? db
          .select({ invite: projectInvitations, project: projects })
          .from(projectInvitations)
          .innerJoin(projects, eq(projects.id, projectInvitations.project_id))
          .where(inArray(projectInvitations.id, ids("project_invitation_id")))
      : [],
    ids("message_body_id").length ? db.select().from(messageBodies).where(inArray(messageBodies.id, ids("message_body_id"))) : [],
  ]);
  const people = await usersById(db, [...rows.map((r) => r.sender_id), ...teamInvites.map((t) => t.team.leader_id)]);

  return c.json({
    unread_count: rows.filter((r) => !r.is_read).length,
    items: rows.map((r) => {
      const team = teamInvites.find((t) => t.invite.id === r.team_invitation_id);
      const project = projectInvites.find((p) => p.invite.id === r.project_invitation_id);
      return {
        uuid: r.id,
        category: r.category,
        is_read: Boolean(r.is_read),
        created_at: iso(r.created_at),
        sender: userSummary(c.env, people.get(r.sender_id)!),
        team: team ? { uuid: team.team.id, leader: userSummary(c.env, people.get(team.team.leader_id)!), status: team.invite.status } : null,
        project: project ? { title: project.project.title, project_url: project.project.project_url, status: project.invite.status } : null,
        message: bodies.find((b) => b.id === r.message_body_id)?.message ?? null,
      };
    }),
  });
});

inboxRoutes.post("/inbox/:inbox/read", requireUser, async (c) => {
  const row = await ownInbox(c);
  await c.get("db").update(inboxes).set({ is_read: true, updated_at: new Date() }).where(eq(inboxes.id, row.id));
  return c.json({ message: "Marked as read." });
});

inboxRoutes.post("/inbox/:inbox/respond", requireUser, async (c) => {
  const db = c.get("db");
  const me = currentUser(c);
  const row = await ownInbox(c);
  // A missing `accept` declines, as $request->boolean() reads it.
  const accept = phpBoolean((await readInput(c)).accept);
  const status = accept ? InvitationStatus.Accepted : InvitationStatus.Rejected;
  const now = new Date();
  const markRead = db.update(inboxes).set({ is_read: true, updated_at: now }).where(eq(inboxes.id, row.id));

  if (row.category === InboxCategory.TeamInvitation) {
    const [invite] = row.team_invitation_id ? await db.select().from(teamInvitations).where(eq(teamInvitations.id, row.team_invitation_id)) : [];
    if (!invite) throw new HttpError(422, "That invitation no longer exists.");
    await db.batch([
      db.update(teamInvitations).set({ status, updated_at: now }).where(eq(teamInvitations.id, invite.id)),
      ...(accept ? [db.insert(teamMembers).values({ team_id: invite.team_id, member_id: me.id, expertise: me.expertise }).onConflictDoNothing()] : []),
      markRead,
    ]);
  } else if (row.category === InboxCategory.ProjectInvitation) {
    const [invite] = row.project_invitation_id ? await db.select().from(projectInvitations).where(eq(projectInvitations.id, row.project_invitation_id)) : [];
    if (!invite) throw new HttpError(422, "That invitation no longer exists.");
    await db.batch([
      db.update(projectInvitations).set({ status, updated_at: now }).where(eq(projectInvitations.id, invite.id)),
      ...(accept
        ? [
            db
              .insert(projectBoxes)
              .values({ project_id: invite.project_id, user_id: invite.to_id, status: ProjectBoxStatus.WaitingToStart })
              .onConflictDoUpdate({ target: [projectBoxes.project_id, projectBoxes.user_id], set: { status: ProjectBoxStatus.WaitingToStart, updated_at: now } }),
          ]
        : []),
      markRead,
    ]);
  } else {
    throw new HttpError(422, "This message cannot be responded to.");
  }

  return c.json({ message: accept ? "Invitation accepted." : "Invitation declined." });
});

/** One conversation per unordered pair, created on first use. */
async function between(db: Database, a: string, b: string) {
  const [one, two] = a < b ? [a, b] : [b, a];
  await db.insert(messageHeaders).values({ user_one_id: one, user_two_id: two }).onConflictDoNothing();
  const [header] = await db
    .select()
    .from(messageHeaders)
    .where(and(eq(messageHeaders.user_one_id, one), eq(messageHeaders.user_two_id, two)));
  return header!;
}

const presentMessage = (m: typeof messageBodies.$inferSelect, me: string) => ({
  uuid: m.id,
  message: m.message,
  is_mine: m.sender_id === me,
  created_at: iso(m.created_at),
});

/** PHP's strip_tags, close enough for chat text: tags and comments go, text stays. */
export const stripTags = (value: string) =>
  value.replace(/<!--[\s\S]*?(-->|$)/g, "").replace(/<\?[\s\S]*?(\?>|$)/g, "").replace(/<\/?[a-zA-Z!][^>]*(>|$)/g, "");

inboxRoutes.get("/messages", requireUser, async (c) => {
  const db = c.get("db");
  const me = currentUser(c).id;
  const headers = await db
    .select()
    .from(messageHeaders)
    .where(or(eq(messageHeaders.user_one_id, me), eq(messageHeaders.user_two_id, me)))
    .orderBy(asc(messageHeaders.id));
  const others = headers.map((h) => (h.user_one_id === me ? h.user_two_id : h.user_one_id));
  const people = await usersById(db, others);

  const latest = await Promise.all(
    headers.map(async (h) => {
      const [last] = await db
        .select()
        .from(messageBodies)
        .where(eq(messageBodies.message_header_id, h.id))
        .orderBy(desc(messageBodies.created_at), desc(messageBodies.id))
        .limit(1);
      return last ?? null;
    }),
  );

  const conversations = headers.map((_, i) => ({
    with: userSummary(c.env, people.get(others[i]!)!),
    last_message: latest[i]?.message ?? null,
    last_message_at: iso(latest[i]?.created_at),
    sortKey: latest[i]?.created_at?.getTime() ?? null,
  }));
  // Newest first; empty conversations last, in their original order.
  conversations.sort((a, b) => (a.sortKey === null ? (b.sortKey === null ? 0 : 1) : b.sortKey === null ? -1 : b.sortKey - a.sortKey));

  return c.json({ conversations: conversations.map(({ sortKey: _, ...rest }) => rest) });
});

inboxRoutes.get("/messages/:tagname", requireUser, async (c) => {
  const db = c.get("db");
  const me = currentUser(c);
  const target = await userByTagname(db, c.req.param("tagname"));
  if (target.id === me.id) throw new HttpError(422, "You cannot message yourself.");

  const header = await between(db, me.id, target.id);
  await db
    .update(inboxes)
    .set({ is_read: true, updated_at: new Date() })
    .where(and(eq(inboxes.recipient_id, me.id), eq(inboxes.sender_id, target.id), eq(inboxes.category, InboxCategory.Message)));
  const messages = await db
    .select()
    .from(messageBodies)
    .where(eq(messageBodies.message_header_id, header.id))
    .orderBy(asc(messageBodies.created_at), asc(messageBodies.id));

  return c.json({ with: userSummary(c.env, target), messages: messages.map((m) => presentMessage(m, me.id)) });
});

/** Best effort, like Laravel's: a hub that is down never fails the send. */
async function broadcast(env: Bindings, channel: string, event: string, payload: unknown) {
  try {
    await env.REALTIME.get(env.REALTIME.idFromName("hub")).publish(channel, event, payload);
  } catch (error) {
    console.warn("Could not broadcast message", error);
  }
}

inboxRoutes.post("/messages/:tagname", requireUser, async (c) => {
  const db = c.get("db");
  const me = currentUser(c);
  const target = await userByTagname(db, c.req.param("tagname"));
  if (target.id === me.id) throw new HttpError(422, "You cannot message yourself.");
  const data = await validate(await readInput(c), { message: [required(), string(), max(5000)] });

  const header = await between(db, me.id, target.id);
  const [body] = await db
    .insert(messageBodies)
    .values({ message_header_id: header.id, sender_id: me.id, recipient_id: target.id, message: stripTags(data.message as string) })
    .returning();
  // One notification per conversation: the newest message replaces the last one.
  await db.batch([
    db.delete(inboxes).where(and(eq(inboxes.recipient_id, target.id), eq(inboxes.sender_id, me.id), eq(inboxes.category, InboxCategory.Message))),
    db.insert(inboxes).values({ recipient_id: target.id, sender_id: me.id, message_body_id: body!.id, category: InboxCategory.Message }),
  ]);

  c.executionCtx.waitUntil(
    broadcast(c.env, `private-user.${target.id}`, "message.sent", {
      uuid: body!.id,
      message: body!.message,
      sender_uuid: me.id,
      // toIso8601String(): no fraction, explicit offset — unlike the REST format.
      created_at: body!.created_at!.toISOString().replace(/\.\d{3}Z$/, "+00:00"),
    }),
  );

  return c.json({ message: presentMessage(body!, me.id) }, 201);
});

/** POST /broadcasting/auth: signs a private-user channel for its owner only. */
realtimeRoutes.on(["GET", "POST"], "/broadcasting/auth", requireUser, async (c) => {
  const me = currentUser(c);
  const input = await readInput(c);
  const channel = String(input.channel_name ?? "");
  const socketId = String(input.socket_id ?? "");

  const name = channel.replace(/^(private-encrypted-|private-|presence-)/, "");
  const owner = /^user\.([^.]+)$/.exec(name)?.[1];
  if (!channel || !owner || owner !== me.id || !channel.startsWith("private-")) abort(403);
  if (!/^\d+\.\d+$/.test(socketId) || !/^#?[-a-zA-Z0-9_=@,.;]+$/.test(channel)) {
    throw new Error("Invalid socket id or channel name");
  }

  return c.json({ auth: await signChannel(c.env.REALTIME_APP_KEY, c.env.APP_KEY, socketId, channel) });
});

/** pusher-js connects here: ws[s]://<api host>/app/<key>?protocol=7&... */
realtimeRoutes.get("/app/:key", (c) => {
  if (c.req.param("key") !== c.env.REALTIME_APP_KEY) return c.text("Unknown app key", 404);
  return c.env.REALTIME.get(c.env.REALTIME.idFromName("hub")).fetch(c.req.raw);
});
