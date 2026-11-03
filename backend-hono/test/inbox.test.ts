/** Ports of MessagingTest, BroadcastAuthorizationTest, inbox parts of PartyTest/ProjectInvitationTest, SocialBoundariesTest. */
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import * as schema from "../src/db/schema";
import { app } from "../src/app";
import { call, db, makeLecturer, makeProject, makeUser, tokenFor } from "./helpers";

describe("inbox", () => {
  it("accepting a party invitation joins the party", async () => {
    const leader = await makeUser();
    const friend = await makeUser({ expertise: "Data Expert" });
    const friendToken = await tokenFor(friend);
    await call(`/api/users/${friend.tagname}/invite/party`, { method: "POST", token: await tokenFor(leader) });

    const inbox = await call("/api/inbox", { token: friendToken });
    expect(inbox.json.unread_count).toBe(1);
    const item = inbox.json.items[0];
    expect(item).toMatchObject({ category: "Team Invitation", is_read: false, team: { status: "Pending" }, project: null, message: null });

    const res = await call(`/api/inbox/${item.uuid}/respond`, { method: "POST", token: friendToken, body: { accept: true } });
    expect(res.json).toEqual({ message: "Invitation accepted." });
    const members = await db.select().from(schema.teamMembers).where(eq(schema.teamMembers.member_id, friend.id));
    expect(members[0]).toMatchObject({ expertise: "Data Expert" });
    expect((await call("/api/inbox", { token: friendToken })).json.items[0]).toMatchObject({ is_read: true, team: { status: "Accepted" } });
  });

  it("a missing accept declines, and someone else's item is refused", async () => {
    const leader = await makeUser();
    const friend = await makeUser();
    await call(`/api/users/${friend.tagname}/invite/party`, { method: "POST", token: await tokenFor(leader) });
    const [row] = await db.select().from(schema.inboxes);
    const other = await call(`/api/inbox/${row!.id}/respond`, { method: "POST", token: await tokenFor(await makeUser()), body: { accept: true } });
    expect(other.status).toBe(403);
    expect((await call(`/api/inbox/${row!.id}/respond`, { method: "POST", token: await tokenFor(friend) })).json).toEqual({
      message: "Invitation declined.",
    });
    expect(await db.select().from(schema.teamMembers).where(eq(schema.teamMembers.member_id, friend.id))).toHaveLength(0);
  });

  it("accepting a project invitation puts the student straight on the project", async () => {
    const lecturer = await makeLecturer();
    const project = await makeProject(lecturer);
    const student = await makeUser();
    await call(`/api/my/projects/${project.project_url}/invite/${student.tagname}`, { method: "POST", token: await tokenFor(lecturer) });
    const [row] = await db.select().from(schema.inboxes);
    await call(`/api/inbox/${row!.id}/respond`, { method: "POST", token: await tokenFor(student), body: { accept: "1" } });
    const [box] = await db.select().from(schema.projectBoxes).where(eq(schema.projectBoxes.user_id, student.id));
    expect(box!.status).toBe("Waiting to Start");
  });

  it("marks an item read", async () => {
    const leader = await makeUser();
    const friend = await makeUser();
    await call(`/api/users/${friend.tagname}/invite/party`, { method: "POST", token: await tokenFor(leader) });
    const [row] = await db.select().from(schema.inboxes);
    expect((await call(`/api/inbox/${row!.id}/read`, { method: "POST", token: await tokenFor(friend) })).json).toEqual({ message: "Marked as read." });
    expect((await call("/api/inbox/not-a-uuid/read", { method: "POST", token: await tokenFor(friend) })).json.message).toBe(
      "The route api/inbox/not-a-uuid/read could not be found.",
    );
  });
});

describe("messaging", () => {
  it("sends, strips html, keeps one notification per conversation and lists threads", async () => {
    const ada = await makeUser();
    const bo = await makeUser();
    const adaToken = await tokenFor(ada);
    const boToken = await tokenFor(bo);

    const sent = await call(`/api/messages/${bo.tagname}`, {
      method: "POST",
      token: adaToken,
      body: { message: "hello <script>alert(1)</script> there", sender_id: bo.id },
    });
    expect(sent.status).toBe(201);
    expect(sent.json.message).toMatchObject({ message: "hello alert(1) there", is_mine: true });
    await call(`/api/messages/${bo.tagname}`, { method: "POST", token: adaToken, body: { message: "second" } });

    const notes = await db.select().from(schema.inboxes).where(eq(schema.inboxes.recipient_id, bo.id));
    expect(notes).toHaveLength(1);
    expect((await call("/api/user", { token: boToken })).json.unread_inbox_count).toBe(1);

    const thread = await call(`/api/messages/${ada.tagname}`, { token: boToken });
    expect(thread.json.messages.map((m: any) => [m.message, m.is_mine])).toEqual([
      ["hello alert(1) there", false],
      ["second", false],
    ]);
    expect((await call("/api/user", { token: boToken })).json.unread_inbox_count).toBe(0);

    const list = await call("/api/messages", { token: adaToken });
    expect(list.json.conversations).toEqual([expect.objectContaining({ last_message: "second", with: expect.objectContaining({ uuid: bo.id }) })]);
    expect(await db.select().from(schema.messageHeaders)).toHaveLength(1);
  });

  it("refuses blank, overlong and self messages", async () => {
    const ada = await makeUser();
    const token = await tokenFor(ada);
    const bo = await makeUser();
    expect((await call(`/api/messages/${bo.tagname}`, { method: "POST", token, body: { message: "   " } })).json.errors.message).toEqual([
      "The message field is required.",
    ]);
    expect((await call(`/api/messages/${bo.tagname}`, { method: "POST", token, body: { message: "x".repeat(5001) } })).status).toBe(422);
    expect((await call(`/api/messages/${ada.tagname}`, { method: "POST", token, body: { message: "hi" } })).json).toEqual({
      message: "You cannot message yourself.",
    });
  });
});

describe("realtime", () => {
  it("signs only your own private channel", async () => {
    const user = await makeUser();
    const token = await tokenFor(user);
    const auth = (channel_name: string) => call("/broadcasting/auth", { method: "POST", token, body: { socket_id: "123.456", channel_name } });

    const ok = await auth(`private-user.${user.id}`);
    expect(ok.json.auth).toMatch(/^phive:[0-9a-f]{64}$/);
    expect((await auth(`private-user.${(await makeUser()).id}`)).json).toEqual({ message: "" });
    expect((await auth("private-user.not-a-real-uuid")).status).toBe(403);
    expect((await call("/broadcasting/auth", { method: "POST", body: { socket_id: "1.1", channel_name: "x" } })).status).toBe(401);
  });

  it("delivers a new message to the recipient's open socket", async () => {
    const ada = await makeUser();
    const bo = await makeUser();
    const boToken = await tokenFor(bo);

    const upgrade = await app.request("http://localhost:8787/app/phive?protocol=7", { headers: { Upgrade: "websocket" } }, env);
    const ws = upgrade.webSocket!;
    ws.accept();
    const frames: any[] = [];
    let wake: () => void = () => {};
    ws.addEventListener("message", (e) => {
      frames.push(JSON.parse(e.data as string));
      wake();
    });
    const next = () => new Promise<void>((resolve) => (wake = resolve));

    await next();
    const socketId = JSON.parse(frames[0].data).socket_id;
    const channel = `private-user.${bo.id}`;
    const { json } = await call("/broadcasting/auth", { method: "POST", token: boToken, body: { socket_id: socketId, channel_name: channel } });
    ws.send(JSON.stringify({ event: "pusher:subscribe", data: { auth: json.auth, channel } }));
    await next();
    expect(frames[1]).toMatchObject({ event: "pusher_internal:subscription_succeeded", channel });

    const arrived = next();
    await call(`/api/messages/${bo.tagname}`, { method: "POST", token: await tokenFor(ada), body: { message: "ping" } });
    await arrived;
    expect(frames[2].event).toBe("message.sent");
    expect(JSON.parse(frames[2].data)).toMatchObject({ message: "ping", sender_uuid: ada.id, created_at: expect.stringMatching(/\+00:00$/) });
    ws.close();
  });
});

