# Contract: collaboration, realtime, demo data, admin

Source of truth: `backend/` (Laravel 13). Where this file and the PHP disagree, the PHP wins; fix this file.
Files read: `app/Http/Controllers/Api/{Party,Application,ProjectBox,Shortlist,ProjectWorkflow,Inbox,Message,ProjectInvitation,ProjectManagement}Controller.php`, `app/Models/*`, `app/Enums/*`, `app/Policies/ProjectPolicy.php`, `app/Http/Resources/*`, `app/Support/*`, `app/Events/MessageSent.php`, `routes/{api,channels,console}.php`, `bootstrap/app.php`, `config/{reverb,phive}.php`, framework default `config/broadcasting.php`, migrations, seeders, factories, `app/Console/Commands/*`, `app/Filament/**`, `app/Providers/Filament/AdminPanelProvider.php`, and `tests/Feature/*`.

Test citations use `TestClass::method` (all under `backend/tests/Feature/`).

---

## 0. Cross-cutting rules for this slice

### 0.1 Auth
- Every endpoint here is inside `auth:sanctum` (bearer token). Missing/invalid token → **401** `{"message":"Unauthenticated."}` (`MessagingTest::guests_cannot_message`).
- Order of checks Laravel applies: **route regex match → auth (401) → route-model binding (404) → controller checks** in the order listed per endpoint. Validation runs where the endpoint says it does, often *after* business checks.

### 0.2 Error JSON (APP_DEBUG=false)
| Source | Status | Body |
|---|---|---|
| `abort(code, 'msg')` | code | `{"message":"msg"}` |
| `abort(403)` with no message | 403 | `{"message":""}` (empty string, not "Forbidden") |
| `$this->authorize('update', $project)` fails | 403 | `{"message":"This action is unauthorized."}` |
| Route-model binding miss | 404 | `{"message":"No query results for model [App\\Models\\<Model>] <key>"}` (JSON-escaped backslashes; the string is `No query results for model [App\Models\User] sometag`) |
| `->firstOrFail()` with no ids (only in kick) | 404 | `{"message":"No query results for model [App\\Models\\Team]."}` (trailing period, no key) |
| URL fails a `whereUuid` constraint | 404 | `{"message":"The route <path> could not be found."}` where `<path>` has no leading slash, e.g. `api/inbox/abc/read` |
| Validation | 422 | `{"message":"<first error>[ (and N more error|errors)]","errors":{"<field>":["..."]}}` |
| Uncaught exception (e.g. unique-index violation) | 500 | `{"message":"Server Error"}` |

The frontend surfaces `message` and `errors` (`frontend/src/lib/api.ts`), so the strings matter.

### 0.3 Input normalisation (Laravel global middleware, applies to JSON bodies)
- `TrimStrings`: every string input is trimmed.
- `ConvertEmptyStringsToNull`: `""` after trim becomes `null`. So `"   "` fails `required` (`SocialBoundariesTest::a_blank_message_is_rejected`).
- `$request->boolean('accept')` = PHP `filter_var(v, FILTER_VALIDATE_BOOLEAN)`: true only for `true`, `1`, `"1"`, `"true"`, `"on"`, `"yes"` (case-insensitive). Anything else, **including a missing key**, is `false`.

### 0.4 Validation messages used here (Laravel `en` defaults)
`:attribute` = field path with `_` replaced by a space (`self_describe` → `self describe`, `members.0.member_uuid` → `members.0.member uuid`). Error keys keep the raw path (`participants.0.score`).
- required: `The :attribute field is required.`
- string: `The :attribute field must be a string.`
- max (string): `The :attribute field must not be greater than :max characters.` (length = characters, `mb_strlen`)
- array: `The :attribute field must be an array.`
- min (array): `The :attribute field must have at least :min items.`
- uuid: `The :attribute field must be a valid UUID.` (8-4-4-4-12 hex, any version)
- enum: `The selected :attribute is invalid.`
- numeric: `The :attribute field must be a number.`
- min (numeric): `The :attribute field must be at least :min.`
- max (numeric): `The :attribute field must not be greater than :max.`
- A present `null` for a non-`nullable` rule like `array` still fails that rule.

### 0.5 Serialisation
- Timestamps in REST JSON: Carbon → `"YYYY-MM-DDTHH:MM:SS.000000Z"` (UTC, six zero microsecond digits; app timezone is `UTC`, columns have second precision). Nullable timestamps → `null`.
- The broadcast payload uses a **different** format: `"YYYY-MM-DDTHH:MM:SS+00:00"` (§6.3).
- Booleans (`is_read`, `is_open_hiring`, `is_leader`, `is_mine`, `can_confirm`, `reward.certificate`, `reward.salary`) are JSON booleans. D1 stores 0/1, so convert them.
- `leaderboards.points` is an integer. `score` / `overall_score` are **strings** (§10.6).
- `name` = `trim(first_name + " " + last_name)`.
- Enum columns serialise as their string value (§1).

### 0.6 `UserSummary` (UserSummaryResource), used everywhere below
```json
{"uuid":"…","tagname":"…","first_name":"…","last_name":"…","name":"…","role":"Student|Lecturer","photo_url":"<url>|null","expertise":"<Expertise>|null"}
```
`finished_project_count` is only added when the query did `withCount('finishedProjects')`. **No endpoint in this slice does, so the key is absent.** `photo_url` = `storedFileUrl(users.photo_url)` (§10.12).

### 0.7 `ProjectResource` as returned inside `GET /api/project-box`
Only `user` is eager-loaded, so the conditional keys are **absent** (not null): `is_wished`, `skills`, `requirements`, `team`, `review`.
```json
{
  "uuid":"…","title":"…|null","description":"…|null","project_url":"…|null",
  "status":"Draft|Hiring|Ongoing|Finished","thumbnail":"<url>|null",
  "applicant_type":"Individual|Team|Individual & Team","max_person":"<string>","level_applicant":"Easy|Medium|Hard|Expert|null",
  "looking_for":["UI/UX Designer","Frontend Engineer","Backend Engineer","Data Expert"],
  "reward":{"certificate":true,"salary":false,"currency":"IDR","amount":"<salary_amount>","payment_type":"person"},
  "is_open_hiring":true,
  "start_time":"…|null","finish_time":"…|null","created_at":"…",
  "user": UserSummary
}
```
`looking_for` is in that fixed order, filtered by the booleans `ui_ux_designer`, `front_end_engineer`, `back_end_engineer`, `data_expert`. `thumbnail` = `storedFileUrl(projects.thumbnail)`.

### 0.8 `ProjectTeamResource` (nested as `team` in `GET /api/projects/{project_url}`, owned by the projects spec)
```json
{"uuid":"…","leader": UserSummary|null,"members":[{"expertise":"<Expertise>|null","score":"<string>|null","assessment":"…|null","user": UserSummary}]}
```
- The detail endpoint loads `projectTeam.leader` and `projectTeam.members.member`. No team → `"team": null`.
- **`leader` is `null` in practice**: nothing in the API ever sets `project_teams.leader_id` (`start()` and the project invitation both create the team with `leader_id` null). Only admin/test data sets it (`ProjectTeamVisibilityTest`).
- `members` order: no ORDER BY (use insertion order).

### 0.9 `updated_at` touching
Eloquent bulk `->update()` and model `->update()` set `updated_at = now()` on tables that have timestamps. Tables **with** timestamps: `projects`, `individual_applicants`, `team_applicants`, `project_boxes`, `project_invitations`, `team_invitations`, `message_bodies`, `inboxes`. Tables **without** timestamps (never write created_at/updated_at): `teams`, `team_members`, `project_teams`, `project_team_members`, `applicant_team_members`, `project_reviews`, `leaderboards`, `message_headers`. A model `update()`/`updateOrCreate()` whose values do not change the row issues no UPDATE, so `updated_at` stays put. `firstOrCreate` on an existing row writes nothing.

---

## 1. Enums (exact string values)

| Enum | Values |
|---|---|
| `ApplicationStatus` (individual_applicants.status, team_applicants.status; DB default `Applying`) | `Applying`, `Waiting`, `Fixed`, `Rejected` (`Rejected` is never written by any endpoint) |
| `ProjectBoxStatus` (project_boxes.status; DB default `Waiting`) | `Draft`, `Hiring`, `Waiting`, `Confirmation`, `Accepted`, `Rejected`, `Waiting to Start`, `Project Started`, `Ongoing`, `Finished`, `Bail Out` |
| `ProjectStatus` (projects.status; DB default `Draft`) | `Draft`, `Hiring`, `Ongoing`, `Finished` |
| `InvitationStatus` (team_invitations / project_invitations .status; DB default `Pending`) | `Pending`, `Accepted`, `Rejected` |
| `InboxCategory` (inboxes.category) | `Message`, `Team Invitation`, `Project Invitation` |
| `Expertise` | `UI/UX Designer`, `Frontend Engineer`, `Backend Engineer`, `Data Expert` |
| `ApplicantType` (projects.applicant_type; DB default `Individual & Team`) | `Individual`, `Team`, `Individual & Team` |
| `ProjectLevel` (projects.level_applicant, nullable) | `Easy`, `Medium`, `Hard`, `Expert` |
| `UserRole` | `Student`, `Lecturer` |
| `Level` (derived) | `Rookie`, `Amateur`, `Superior`, `Expert` |

Box statuses by side: the lecturer box uses `Draft`, `Hiring`, `Confirmation`, `Ongoing`, `Finished`. Student boxes use `Waiting`, `Accepted`, `Rejected`, `Waiting to Start`, `Project Started`, `Finished`, `Bail Out` (frontend `project-box/box-list.tsx` filter lists).

---

## 2. Tables touched (Laravel schema; the Hono version keeps names, with a UUIDv7 PK)

All have `uuid` (unique, non-null, UUIDv7, set on insert).

| Table | Columns | Unique / cascade |
|---|---|---|
| `teams` (a student's "party") | id, leader_id→users | **no unique on leader_id** (one-per-leader enforced only by `firstOrCreate`); cascade on user delete |
| `team_members` | id, team_id, member_id→users, expertise (nullable) | unique (team_id, member_id) |
| `team_invitations` | id, team_id, from_id, to_id, status, timestamps | unique (team_id, from_id, to_id) |
| `individual_applicants` | id, project_id, from_id (student), to_id (project owner), expertise (not null), status, self_describe, apply_reason (text, nullable), timestamps | unique (project_id, from_id, to_id) |
| `team_applicants` | id, project_id, from_id (leader), to_id, status, self_describe, apply_reason, timestamps | unique (project_id, from_id, to_id) |
| `applicant_team_members` | id, team_applicant_id, member_id, expertise (not null) | unique (team_applicant_id, member_id); **cascade-deleted with team_applicants** |
| `project_boxes` | id, project_id, user_id, status, timestamps | unique (project_id, user_id) |
| `project_teams` | id, project_id, leader_id (nullable) | **no unique on project_id** (`firstOrCreate`) |
| `project_team_members` | id, project_team_id, member_id, expertise (nullable), assessment (text), score (varchar, nullable) | unique (project_team_id, member_id) |
| `project_reviews` | id, project_id, overall_score (varchar), overall_review (text), project_result (**varchar(255)**) | none (`updateOrCreate` by project_id) |
| `project_invitations` | id, project_id, from_id, to_id, status, timestamps | unique (project_id, from_id, to_id) |
| `leaderboards` | id, user_id, expertise, points int default 0 | unique (user_id, expertise) |
| `message_headers` | id, user_one_id, user_two_id | unique (user_one_id, user_two_id) |
| `message_bodies` | id, message_header_id, sender_id, recipient_id, message text, timestamps | index (message_header_id, created_at) |
| `inboxes` | id, recipient_id, sender_id, team_invitation_id?, project_invitation_id?, message_body_id?, category, is_read bool default false, timestamps | index (recipient_id, is_read); **cascade-deleted with any referenced invitation/message body** |

Every FK is `ON DELETE CASCADE` except `project_teams.leader_id` (`SET NULL`). Deleting a project cascades boxes, applications, invitations, teams and reviews.

---

## 3. Party (`PartyController`)

`Party` object (used by GET and invite/kick responses):
```json
{"uuid":"<team uuid>","leader": UserSummary,"members":[{"expertise":"<Expertise>|null","is_leader":true,"user": UserSummary}]}
```
- `members` includes the leader (`is_leader` = `member_id === team.leader_id`).
- `members[].expertise` is `team_members.expertise`: the user's expertise **copied when they joined**, not their current one.
- Members order: no ORDER BY (use insertion order, team_members id asc).

### 3.1 `GET /api/party`
- Binding: none. No role check: lecturers get `{"led":null,"member_of":[]}`.
- `led` = the team where `leader_id = me` (first match), else `null`. It stays null until the user's first invite, because parties are created lazily.
- `member_of` = teams where `leader_id != me` AND a `team_members` row (team, me) exists. No ORDER BY (use teams id asc).
- **200** `{"led": Party|null, "member_of": [Party]}`
- Test: `PartyTest::the_party_endpoint_separates_led_from_member_of`.
- Frontend reads: `led` (null check), `led.members[].{is_leader, expertise, user.{uuid,tagname,photo_url,name}}`, `member_of[].{uuid, members[].{is_leader, expertise, user.*}}`. `leader` is not read. The apply page reads `led.members[].{user.uuid,user.name,expertise}`.

### 3.2 `POST /api/users/{tagname}/invite/party`
- Binding `{user}` = `users.tagname` (exact match) → 404 `No query results for model [App\Models\User] <tagname>`.
- Body: none.
- Checks, in order:
  1. sender role ≠ Student → **403** `Only students form parties.` (`PartyTest::lecturers_do_not_form_parties`)
  2. target = sender → **422** `You are already in your own party.` (`PartyTest::you_cannot_invite_yourself`)
  3. target role ≠ Student → **422** `Only students can join a party.`
- Transaction, in order:
  1. `teams` firstOrCreate `{leader_id: sender}`.
  2. `team_members` firstOrCreate `(team_id, member_id: sender)`, inserting with `expertise = sender.expertise`.
  3. If `team_members (team, target)` exists → **422** `They are already in your party.` and roll back.
  4. `team_invitations` firstOrCreate `(team_id, from_id: sender, to_id: target)`; a new row gets status `Pending`. **An existing row of any status is reused unchanged.**
  5. `inboxes` firstOrCreate by `team_invitation_id`; a new row gets `{recipient_id: target, sender_id: sender, category: "Team Invitation", is_read: false}`. **An existing row is reused unchanged** (keeps its is_read and created_at).
- Broadcasts: none.
- **200** `{"message":"Invitation sent to <target.name>.","party": Party}`
- Tests: `PartyTest::inviting_creates_the_party_with_the_leader_in_it` (team created; leader is a member; invitee is **not** a member yet; inbox row with category `Team Invitation`).
- Frontend reads: `message` (success banner); on error, `message`. The handle is stripped of a leading `@` client-side.
- Consequence: re-inviting someone who declined, or who was kicked or left, returns 200 and creates nothing. The old invitation keeps its `Rejected`/`Accepted` status, so the inbox row shows no buttons (the frontend shows buttons only when the status is `Pending`).

### 3.3 `DELETE /api/party/members/{tagname}`
- Binding `{user}` by tagname → 404 as above.
- Checks, in order:
  1. caller leads no team → **404** `No query results for model [App\Models\Team].` (`SocialBoundariesTest::only_a_leader_can_remove_someone_from_a_party`: both a non-leader member and an outsider get 404, and the party is untouched)
  2. target = caller → **422** `Disband the party instead of kicking yourself.`
- Write: `DELETE FROM team_members WHERE team_id = <caller's team> AND member_id = target`. Zero rows is still a success. `team_invitations` and `inboxes` are untouched.
- **200** `{"message":"<target.name> has been removed from your party.","party": Party}`
- Test: `PartyTest::a_leader_can_kick_a_member`.
- Frontend: the response is ignored (server action then revalidates).

### 3.4 `DELETE /api/party/{team_uuid}/leave`
- Route constraint `whereUuid('team')`; a non-UUID gets 404 route-not-found. Binding: `teams.uuid` → 404 `No query results for model [App\Models\Team] <uuid>`.
- Checks: `team.leader_id = me` → **422** `A leader cannot leave their own party.` (`SocialBoundariesTest::a_leader_cannot_leave_their_own_party`)
- Write: `DELETE team_members WHERE team_id AND member_id = me`. There is no check that the caller was a member; zero rows is still 200.
- **200** `{"message":"You left the party."}`

---

## 4. Applications (`ApplicationController`)

### 4.0 Shared gate `assertCanApply` (both apply routes, in order)
1. caller role ≠ Student → **403** `Only students apply to projects.` (`ApplicationTest::lecturers_cannot_apply`; a lecturer applying to their own project also gets 403, from `ApplicationTest::a_lecturer_cannot_apply_to_their_own_project`)
2. `project.user_id = caller` → **422** `You cannot apply to your own project.` (only reachable if a student owns a project, e.g. via admin)
3. NOT (`status = 'Hiring'` AND `is_open_hiring`) → **422** `This project is not accepting applications.` (`ApplicationTest::a_closed_project_rejects_applications`, `::a_finished_project_rejects_applications`). Drafts resolve through binding and get this **422, not 404**.
4. an `individual_applicants` OR `team_applicants` row exists with `(project_id, from_id = caller)` → **409** `You have already applied to this project.` (`ApplicationTest::applying_twice_is_a_conflict`). This only checks `from_id`: a student listed as a *member* of someone else's team application can still apply individually.

Binding `{project}` = `projects.project_url` (exact; every status) → 404 `No query results for model [App\Models\Project] <project_url>`.

`openProjectBox(user)`: `project_boxes` firstOrCreate on `(project_id, user_id)` only, inserting status `Waiting`. **An existing box keeps its status** (Accepted, Bail Out, Rejected and so on).

### 4.1 `POST /api/projects/{project_url}/apply/individual`
- Order: gate (4.0) → `applicant_type = 'Team'` → **422** `This project only accepts team applications.` (`ApplicationTest::a_team_only_project_rejects_individual_applications`) → validation.
- Validation (verbatim):
  ```
  'expertise'     => ['required', Rule::enum(Expertise::class)],
  'self_describe' => ['nullable', 'string', 'max:2000'],
  'apply_reason'  => ['nullable', 'string', 'max:2000'],
  ```
- Transaction:
  1. INSERT `individual_applicants {project_id, from_id: caller, to_id: project.user_id, expertise, self_describe, apply_reason}` with status `Applying` (DB default).
  2. `openProjectBox(caller)` gives a `Waiting` box for a new row.
- **201** `{"message":"Application submitted."}`
- Test: `ApplicationTest::a_student_can_apply_individually` (applicant row; box status `Waiting`).
- Frontend sends `{expertise, self_describe: v||null, apply_reason: v||null}`, reads `message` and `errors.expertise[0]`, then redirects to `/projects/<url>?applied=1`.

### 4.2 `POST /api/projects/{project_url}/apply/team`
- Order: gate (4.0) → `applicant_type = 'Individual'` → **422** `This project only accepts individual applications.` → caller leads no team → **422** `Build a party before applying as a team.` (`ApplicationTest::applying_as_a_team_needs_a_party`) → validation → membership check.
- Validation (verbatim):
  ```
  'self_describe'         => ['nullable', 'string', 'max:2000'],
  'apply_reason'          => ['nullable', 'string', 'max:2000'],
  'members'               => ['required', 'array', 'min:1'],
  'members.*.member_uuid' => ['required', 'uuid'],
  'members.*.expertise'   => ['required', Rule::enum(Expertise::class)],
  ```
- Membership: the party = users with a `team_members` row in the caller's team, **the leader included**. Any `member_uuid` not in it → **422** `Every applicant has to be a member of your party.`, with nothing written (`ApplicationTest::you_cannot_list_someone_outside_your_party`).
- Transaction:
  1. INSERT `team_applicants {project_id, from_id: leader, to_id: project.user_id, self_describe, apply_reason}` with status `Applying`.
  2. For each listed member, in order: INSERT `applicant_team_members {team_applicant_id, member_id, expertise}`, then `openProjectBox(member)`.
- The leader is **not** added automatically. If the leader does not list themselves, they get no box and no applicant_team_members row.
- A duplicate `member_uuid` in `members` hits the unique (team_applicant_id, member_id) index → 500 in Laravel. The frontend cannot send duplicates.
- **201** `{"message":"Team application submitted."}`
- Test: `ApplicationTest::a_leader_can_apply_with_their_party` (2 members listed → 2 boxes).
- Frontend sends `{members:[{member_uuid, expertise}], self_describe, apply_reason}`, built from `expertise[<user uuid>]` selects; empty selections are dropped client-side.

### 4.3 `DELETE /api/projects/{project_url}/apply`
- No role check, no body.
- Looks up the `individual_applicants` and `team_applicants` rows with `(project_id, from_id = caller)`. Neither exists → **404** `You have not applied to this project.` (`ApplicationTest::withdrawing_without_applying_is_a_404`)
- Transaction:
  1. DELETE the individual applicant (if any).
  2. DELETE the team applicant (if any); FK cascade deletes its `applicant_team_members`.
  3. DELETE `project_boxes WHERE project_id AND user_id = caller AND status = 'Waiting'`.
- There is **no status guard**, so a `Waiting`/`Fixed` application can be withdrawn. A non-`Waiting` caller box (e.g. `Accepted`) **survives**. Team members' boxes (other users) are **not** deleted.
- **200** `{"message":"Application withdrawn."}`
- Test: `ApplicationTest::an_application_can_be_withdrawn` (0 applicants, 0 boxes).
- Frontend: `withdrawApplication` exists in `app/actions/apply.ts` but nothing in the UI calls it right now.

---

## 5. Project box, shortlist, start, review

### 5.1 `GET /api/project-box`
- Rows: `project_boxes WHERE user_id = me ORDER BY created_at DESC` (no tiebreak in Laravel; use `id DESC`). Each row includes the project and its owner.
- **200**
  ```json
  {"boxes":[{"uuid":"…","status":"<ProjectBoxStatus>","can_confirm":false,"updated_at":"…","project": ProjectResource(§0.7)}]}
  ```
  `can_confirm` = `status === 'Accepted'`.
- Lecturers see one row per project they own, created by `POST /my/projects` and kept in sync by update/publish/close (lecturer-projects spec). Seeded projects have none (§11.1).
- Test: `ProjectWorkflowTest::the_project_box_lists_what_you_are_involved_in` (`boxes.0.status` = `Waiting`, `can_confirm` = false).
- Frontend reads: `uuid, status, can_confirm`, `project.{project_url, thumbnail, title, created_at, description, max_person, reward.{salary,certificate,currency,amount}}`. Actions by status: `can_confirm` → Agree/Decline; `Project Started` → link to `/projects/<url>/dashboard`; lecturer `Draft` → publish/edit/cancel; `Hiring` → edit/close/shortlist; `Ongoing` → review.

### 5.2 `POST /api/project-box/{uuid}/confirm`
- Route `whereUuid`. Binding `project_boxes.uuid` → 404 `No query results for model [App\Models\ProjectBox] <uuid>`.
- Body: `{accept: bool}`, parsed per §0.3. **Missing `accept` means bail out.**
- Checks, in order:
  1. `box.user_id ≠ me` → **403** `{"message":""}` (`ProjectWorkflowTest::you_cannot_confirm_someone_elses_seat`)
  2. `box.status ≠ 'Accepted'` → **409** `There is nothing to confirm on this project yet.` (`ProjectWorkflowTest::confirming_before_being_shortlisted_is_a_conflict`)
- Write: `box.status = accept ? 'Waiting to Start' : 'Bail Out'`. Applications and other boxes are untouched. The docblock's "fixes their other pending applications" is **not implemented**.
- **200** `{"message":"You are on the team, waiting for the lecturer to start."}` or `{"message":"You withdrew from this project."}`
- Tests: `ProjectWorkflowTest::a_student_confirms_their_seat`, `::a_student_can_bail_out_instead`.

### 5.3 Authorization for `my/projects/{project_url}/*` (shortlist, start, review)
- Binding `projects.project_url`, any status → 404 as §4.
- `ProjectPolicy::update`: allowed if `user.is_admin` (the `before()` hook bypasses all checks), else `role = 'Lecturer' AND user.id = project.user_id`. Otherwise **403** `This action is unauthorized.` (`ProjectWorkflowTest::another_lecturer_cannot_see_the_shortlist`; `ProjectPolicyTest`).
- When an admin acts on someone else's project, "the lecturer box" still means the box of `project.user_id` (the owner).

### 5.4 `GET /api/my/projects/{project_url}/shortlist`
- Auth per 5.3. No project status check.
- **200**
  ```json
  {
    "individuals":[{"uuid":"…","status":"<ApplicationStatus>","expertise":"<Expertise>","self_describe":"…|null","apply_reason":"…|null","user": UserSummary}],
    "teams":[{"uuid":"…","status":"<ApplicationStatus>","self_describe":"…|null","apply_reason":"…|null","leader": UserSummary,
              "members":[{"expertise":"<Expertise>","user": UserSummary}]}]
  }
  ```
  `individuals[].user` = the applicant (from_id); `teams[].leader` = from_id; `members` = applicant_team_members. No ORDER BY anywhere (use id asc).
- Test: `ProjectWorkflowTest::the_lecturer_sees_who_applied` (`individuals.0.user.tagname`).
- Frontend reads: `uuid, status` (anything ≠ `Applying` starts pre-selected), `expertise, self_describe, apply_reason, user.*`, `teams[].leader`, `teams[].members[].{expertise, user.{uuid,photo_url,name}}`.

### 5.5 `POST /api/my/projects/{project_url}/shortlist`
- Auth per 5.3. **No project status guard.**
- Validation (verbatim):
  ```
  'individual_uuids'   => ['array'],
  'individual_uuids.*' => ['uuid'],
  'team_uuids'         => ['array'],
  'team_uuids.*'       => ['uuid'],
  ```
- Both lists missing or empty → **422** `Pick at least one applicant to shortlist.` (`ProjectWorkflowTest::shortlisting_nobody_is_rejected`, which sends `individual_uuids: []`)
- Transaction:
  1. `chosen = []`.
  2. If `individual_uuids` is non-empty: select `individual_applicants WHERE project_id = this AND uuid IN (…)` and set their status to `Waiting`. Add their `from_id` to `chosen`.
  3. If `team_uuids` is non-empty: select `team_applicants WHERE project_id = this AND uuid IN (…)` and set their status to `Waiting`. Add each `from_id` (leader) and all their `applicant_team_members.member_id` to `chosen`.
  4. `UPDATE project_boxes SET status='Accepted' WHERE project_id AND user_id IN unique(chosen)`. This **overwrites any current status**, including `Bail Out`, `Waiting to Start` and `Project Started`. Users in `chosen` without a box are skipped (no insert).
  5. `UPDATE project_boxes SET status='Confirmation' WHERE project_id AND user_id = project.user_id`. This runs even if no uuid matched.
- The update is additive: applicants not picked are left unchanged (no `Rejected`). `projects.status` and `is_open_hiring` are unchanged, so the project stays `Hiring` and keeps accepting applications.
- UUIDs from another project are silently ignored and the response is still 200 (`ProjectBoundariesTest::a_lecturer_cannot_shortlist_an_applicant_from_another_project`).
- **200** `{"message":"Applicants shortlisted."}`
- Test: `ProjectWorkflowTest::shortlisting_moves_the_applicant_and_the_project_forward` (applicant `Waiting`, student box `Accepted`, lecturer box `Confirmation`).
- Frontend sends both arrays, possibly empty, with selections from both tabs.

### 5.6 `POST /api/my/projects/{project_url}/start`
- Auth per 5.3. No body.
- Checks, in order:
  1. `project.status = 'Ongoing'` → **409** `This project has already started.` (`Draft`/`Hiring`/`Finished` are **not** blocked.)
  2. `confirmed` = `user_id`s of `project_boxes WHERE project_id AND status = 'Waiting to Start'`. If empty → **422** `Nobody has confirmed yet, so there is no team to start with.` (`ProjectWorkflowTest::starting_without_anyone_confirmed_is_rejected`)
- Transaction, in order:
  1. `projects`: `status='Ongoing'`, `is_open_hiring=false`, `start_time=now`.
  2. `project_teams` firstOrCreate `{project_id}` (leader_id stays null).
  3. `expertise` map = `individual_applicants WHERE project_id AND from_id IN confirmed` → `from_id → expertise`.
  4. For each confirmed user: `project_team_members` firstOrCreate `(project_team_id, member_id)`, inserting `expertise = map[user] ?? null`. Team-application members and invited students get **null** expertise; `applicant_team_members.expertise` is *not* used.
  5. `project_boxes` for confirmed users → `Project Started`.
  6. `project_boxes` for `project.user_id` → `Ongoing` (no insert if missing).
  7. Every other box of this project (user not in confirmed and not the owner) → `Rejected`. That covers `Waiting`, `Accepted`, `Bail Out` and, on a restarted project, `Finished`.
  8. `individual_applicants WHERE project_id AND from_id IN confirmed` → `Fixed`.
  9. `team_applicants WHERE project_id AND from_id IN confirmed` → `Fixed`. This only applies if the *leader* is among the confirmed users.
  10. Other applications are unchanged (none set to `Rejected`).
- **200** `{"message":"Project started."}`
- Tests: `ProjectWorkflowTest::starting_forms_the_team_and_closes_hiring` (Ongoing, `is_open_hiring` false, `start_time` set, team member with expertise `Frontend Engineer`, applicant `Fixed`), `::unconfirmed_applicants_are_released_when_the_project_starts` (a `Waiting` box becomes `Rejected`).
- Frontend: the "Start Project" button shows on `/my/projects` when `project.status === 'Hiring'`. The response is ignored.

### 5.7 `GET /api/my/projects/{project_url}/review`
- Auth per 5.3. No status check.
- **200**
  ```json
  {
    "participants":[{"member_uuid":"<users.uuid>","expertise":"<Expertise>|null","score":"<string>|null","assessment":"…|null","user": UserSummary}],
    "review": <raw project_reviews row>|null
  }
  ```
  - `participants` = `project_team_members` of the project's team (no ORDER BY). No team, or an empty team, → `[]`. `member_uuid` is the **user** uuid; `member_id` must not appear (`ProjectWorkflowTest::the_review_form_identifies_participants_by_the_uuid_review_expects`).
  - `review` is the **raw Eloquent model**, not a resource: every column, so `{"id":<int>,"project_id":<int>,"overall_score":"…","overall_review":"…|null","project_result":"…|null","uuid":"…"}`. See Open questions.
- Frontend reads: `participants[].{member_uuid, expertise, score, assessment, user.{photo_url,name,expertise}}`; `review` is typed but unread. Form field names are `participants[<member_uuid>][expertise|score|assessment]`.

### 5.8 `POST /api/my/projects/{project_url}/review`
- Auth per 5.3.
- Checks, in order:
  1. `project.status ≠ 'Ongoing'` → **409** `Only an ongoing project can be reviewed.` This check runs **before validation** (`ProjectWorkflowTest::a_project_that_has_not_started_cannot_be_reviewed`).
  2. Validation (verbatim):
     ```
     'overall_score'              => ['required', 'numeric', 'min:0', 'max:5'],
     'overall_review'             => ['nullable', 'string', 'max:5000'],
     'project_result'             => ['nullable', 'string', 'max:2000'],
     'participants'               => ['required', 'array', 'min:1'],
     'participants.*.member_uuid' => ['required', 'uuid'],
     'participants.*.expertise'   => ['required', Rule::enum(Expertise::class)],
     'participants.*.score'       => ['required', 'numeric', 'min:0', 'max:5'],
     'participants.*.assessment'  => ['nullable', 'string', 'max:2000'],
     ```
     `ProjectBoundariesTest::a_score_above_five_is_rejected` expects error keys `overall_score` and `participants.0.score`.
  3. No `project_teams` row → **409** `This project has no team to review.`
  4. Any `member_uuid` not a member of that team → **422** `Everyone scored has to be on this project team.` Nothing is written and the project stays Ongoing (`ProjectBoundariesTest::a_lecturer_cannot_score_someone_who_is_not_on_the_team`).
- `level = level_applicant ? ProjectLevel::tryFrom(level_applicant) : null`. With a null, empty or unknown level, **no points are awarded** (everything else still happens).
- Transaction, in order:
  1. `projects`: `status='Finished'`, `finish_time=now`.
  2. `project_boxes WHERE project_id AND status IN ('Project Started','Ongoing')` → `Finished`.
  3. `project_reviews` updateOrCreate by `project_id`: `{overall_score: str(overall_score), overall_review ?? null, project_result ?? null}`.
  4. For each participant, in request order:
     - `project_team_members` updateOrCreate `(project_team_id, member_id)`: `{expertise, score: str(score), assessment ?? null}`.
     - If level: `award = round_half_away((overall/5) * (score/5) * level.points)`. Then `leaderboards` firstOrCreate `(user_id, expertise = participant.expertise)` with `points: 0`, and `UPDATE leaderboards SET points = points + award`.
- Participants left out of the request keep `score` null and earn nothing, but their boxes still become `Finished`. A member listed twice is scored twice: the last write wins on the team row, and points are added twice.
- **200** `{"message":"Review posted and points awarded."}`
- Tests: `ProjectWorkflowTest::reviewing_finishes_the_project_and_awards_points` (Hard, 5 and 4 → 3200; student box `Finished`; `score` stored `"4"`), `::points_are_created_for_a_student_with_no_board_row_yet` (Hard, 5/5 → 4000), `ProjectBoundariesTest::reviewing_cannot_award_more_than_the_level_allows` (Easy, 5/5 → 2000).
- Frontend sends `overall_score`, `score` and `expertise` as **strings** from FormData, plus `overall_review||null`, `project_result||null`, `assessment||null`. It redirects to `/my/projects` on success.

---

## 6. Inbox (`InboxController`)

`InboxItem`:
```json
{
  "uuid":"…","category":"Message|Team Invitation|Project Invitation","is_read":false,"created_at":"…",
  "sender": UserSummary,
  "team":    {"uuid":"<team uuid>","leader": UserSummary,"status":"Pending|Accepted|Rejected"} | null,
  "project": {"title":"…|null","project_url":"…|null","status":"Pending|Accepted|Rejected"} | null,
  "message": "<message_bodies.message>" | null
}
```
- `team` is non-null iff `team_invitation_id` resolves to an invitation whose team exists. `team.status` is the **team invitation's** status.
- `project` is non-null iff `project_invitation_id` resolves to an invitation whose project exists. `project.status` is the **project invitation's** status.
- `message` is the linked message body text (Message rows only), otherwise null.

### 6.1 `GET /api/inbox`
- Rows: `inboxes WHERE recipient_id = me ORDER BY created_at DESC` (no tiebreak; use id DESC). Unpaginated.
- **200** `{"unread_count": <count of the returned rows with is_read=false>, "items":[InboxItem]}`
- Test: `PartyTest::accepting_an_invitation_joins_the_party` (`unread_count` = 1 after one invite).
- Frontend reads: `items[].{uuid, category, is_read, sender.{tagname,photo_url,name}, team.status, project.{status,title,project_url}, message}`. Buttons appear only when `(team ?? project).status === 'Pending'`; "mark read" appears when `!is_read`. If `message` contains `"img"` the preview reads "Sent an image". `unread_count` is typed but unused; the header badge uses `GET /api/user` → `unread_inbox_count` (the same count: `inboxes WHERE recipient_id = me AND is_read = false`).

### 6.2 `POST /api/inbox/{uuid}/read`
- Route `whereUuid`. Binding `inboxes.uuid` → 404 `No query results for model [App\Models\Inbox] <uuid>`.
- `recipient_id ≠ me` → **403** `{"message":""}`.
- Write: `is_read = true`.
- **200** `{"message":"Marked as read."}`

### 6.3 `POST /api/inbox/{uuid}/respond`
- Route, binding and **403** `{"message":""}` ownership check as 6.2 (`PartyTest::you_cannot_respond_to_someone_elses_invitation`).
- Body: `{accept: bool}` per §0.3 (missing means decline). `status = accept ? 'Accepted' : 'Rejected'`.
- Transaction by `category`:
  - `Team Invitation`: no invitation → **422** `That invitation no longer exists.` Otherwise set `team_invitations.status = status`. If accepted: `team_members` firstOrCreate `(team_id, member_id: me)`, inserting `expertise = me.expertise`.
  - `Project Invitation`: no invitation → **422** `That invitation no longer exists.` Otherwise set `project_invitations.status = status`. If accepted: `project_boxes` **updateOrCreate** `(project_id, user_id: invitation.to_id)` with `status='Waiting to Start'`. This **overwrites any existing status** and skips `Accepted` and confirm entirely.
  - `Message` → **422** `This message cannot be responded to.` (rolled back; is_read unchanged).
  - Then set `inboxes.is_read = true`.
- There is **no "still Pending" check**: an invitation can be answered again and flipped. Declining after accepting does **not** remove the team membership or the box.
- **200** `{"message":"Invitation accepted."}` or `{"message":"Invitation declined."}`
- Tests: `PartyTest::accepting_an_invitation_joins_the_party`, `::declining_leaves_the_party_unchanged`; `ProjectInvitationTest::accepting_puts_the_student_straight_on_the_project` (invitation `Accepted`, box `Waiting to Start`), `::declining_does_not_create_a_project_box`.

### 6.4 Where inbox rows come from
| Category | Created by | Uniqueness |
|---|---|---|
| `Team Invitation` | `POST users/{tagname}/invite/party` (§3.2) | one per team invitation (firstOrCreate) |
| `Project Invitation` | `POST my/projects/{project_url}/invite/{tagname}` (projects spec; summary below) | one per project invitation |
| `Message` | `POST messages/{tagname}` (§7.3) | one per (recipient, sender): deleted and re-inserted on every message |

`POST /api/my/projects/{project_url}/invite/{tagname}` (summary for the inbox flow; the full spec lives with lecturer projects). Checks, in order:
1. 403 `This action is unauthorized.`
2. target = me → 422 `You cannot invite yourself.`
3. target not Student → 422 `Only students can be invited to a project.`
4. Runs `project_teams` firstOrCreate `{project_id}` **outside the transaction, before the next check**, so an empty team appears and `GET /projects/{url}` then returns `team: {uuid, leader:null, members:[]}`.
5. Target already in that team → 422 `They are already on this project team.`
6. Transaction: `project_invitations` firstOrCreate `(project_id, from_id, to_id)` (Pending), then `inboxes` firstOrCreate by `project_invitation_id` with `{recipient_id, sender_id, category:'Project Invitation'}`.

Response **200** `{"message":"Invitation sent to <name>."}`. There is no project status check. Inviting twice creates one invitation and one inbox row (`ProjectInvitationTest::inviting_twice_does_not_duplicate_the_invitation`).

---

## 7. Messages (`MessageController`)

### 7.0 Conversation pairing
- One `message_headers` row per unordered pair: `user_one_id = min(a, b)`, `user_two_id = max(a, b)` (Laravel compares integer ids). `between(a, b)` = firstOrCreate on that normalised pair.
- One header is shared whichever side starts (`MessagingTest::the_conversation_row_is_shared_regardless_of_who_starts_it`).
- Anyone can message anyone (student or lecturer). There is no role check.

### 7.1 `GET /api/messages`
- Headers where `user_one_id = me OR user_two_id = me`. For each, `other = user_one_id === me ? userTwo : userOne`, and the latest message = `ORDER BY created_at DESC, id DESC LIMIT 1` per header.
- Sort: `last_message_at` DESC (PHP stable sort); headers with no messages (null) sort **last**, in DB order.
- **200**
  ```json
  {"conversations":[{"with": UserSummary,"last_message":"…|null","last_message_at":"…|null"}]}
  ```
- Headers with no messages exist because `GET /api/messages/{tagname}` creates the header (7.2). Merely opening someone's thread therefore puts an empty conversation (`last_message: null`) in **both** users' lists.
- Test: `MessagingTest::the_conversation_list_shows_the_latest_message`.
- Frontend reads: `with.{uuid,tagname,photo_url,name}`, `last_message` (shows "No messages yet" when null), `last_message_at` (relative time).

### 7.2 `GET /api/messages/{tagname}`
- Binding `users.tagname` → 404 `No query results for model [App\Models\User] <tagname>`. The frontend turns a 404 into `notFound()`.
- target = me → **422** `You cannot message yourself.`
- Writes:
  1. `between(me, target)` **inserts a header if missing**.
  2. `UPDATE inboxes SET is_read = true WHERE recipient_id = me AND sender_id = target AND category = 'Message'`.
- Messages: that header's bodies `ORDER BY created_at ASC` (no tiebreak; use id ASC).
- **200**
  ```json
  {"with": UserSummary(target),"messages":[{"uuid":"…","message":"…","is_mine":true,"created_at":"…"}]}
  ```
  `is_mine` = `sender_id === me`.
- Tests: `MessagingTest::a_thread_reads_oldest_first_and_marks_who_said_what`, `::reading_a_thread_marks_its_notification_read`, `::a_thread_is_not_readable_by_anyone_else` (the nosy user gets their own empty thread: `messages: []`, and a second header now exists).
- Frontend reads: `with.{tagname,name,uuid,photo_url}`, `messages[].{uuid,message,is_mine}`.

### 7.3 `POST /api/messages/{tagname}`
- Binding as 7.2. target = me → **422** `You cannot message yourself.` (`MessagingTest::you_cannot_message_yourself`), then validation.
- Validation (verbatim): `'message' => ['required', 'string', 'max:5000']`, applied to the trimmed value *before* tag stripping (`SocialBoundariesTest::a_blank_message_is_rejected`, `::an_overlong_message_is_rejected` with 5001 chars).
- Sender and recipient come only from the token and the URL; body fields such as `sender_id` and `recipient_id` are ignored (`SocialBoundariesTest::the_sender_comes_from_the_token_not_the_payload`).
- Transaction:
  1. `between(sender, target)`.
  2. INSERT `message_bodies {message_header_id, sender_id, recipient_id: target, message: strip_tags(message)}`. The result may be `""` and is not re-validated (`MessagingTest::html_is_stripped_from_a_message`: `hello <script>alert(1)</script> there` → `hello alert(1) there`).
  3. `DELETE inboxes WHERE recipient_id = target AND sender_id = sender AND category = 'Message'` (read or not).
  4. INSERT `inboxes {recipient_id: target, sender_id: sender, message_body_id: body.id, category: 'Message', is_read: false}`. That leaves one notification per conversation (`MessagingTest::only_one_unread_notification_is_kept_per_conversation`).
- After commit: broadcast `MessageSent` (§8), best-effort. Any exception is caught and logged at warning level as `Could not broadcast message` with `{message_uuid, exception}`. The response is unaffected (`MessagingTest::a_message_still_sends_when_broadcasting_is_down`: still 201, body and inbox rows exist).
- **201** `{"message":{"uuid":"…","message":"<stored text>","is_mine":true,"created_at":"…"}}` (`MessagingTest::a_user_can_send_a_message`)
- Frontend sends a trimmed `message`, refuses empty input client-side, and ignores the success body (it revalidates the page).

---

## 8. Realtime

### 8.1 Server configuration
- Driver: `BROADCAST_CONNECTION`. The framework default is `null` (no `config/broadcasting.php` in the app). `.env.example` sets `reverb`; phpunit uses `null`. Reverb credentials: `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET`, `REVERB_HOST`, `REVERB_PORT` (default 443), `REVERB_SCHEME` (default https).
- `config/reverb.php` (app entry): `allowed_origins ['*']`, `ping_interval 60`, `activity_timeout 30`, `max_message_size 10000`, `max_request_size 10000`, `accept_client_events_from 'members'`, rate limiting off, scaling off. Server binds `0.0.0.0:8080`.

### 8.2 Channels (`routes/channels.php`)
| Logical name | Wire name | Authorised when |
|---|---|---|
| `user.{uuid}` | `private-user.{uuid}` | `auth_user.uuid === {uuid}` (exact string) |

No other channels exist: no presence channels and no public channels. Pattern matching: `{uuid}` = `[^.]+`, anchored.

### 8.3 Events
Only one: `App\Events\MessageSent` (`ShouldBroadcastNow`, sent synchronously during the request).
- Fires: once per successful `POST /api/messages/{tagname}`, after the DB transaction commits.
- Channel: `private-user.<recipient uuid>` (the **recipient only**; the sender's channel gets nothing).
- Event name (`broadcastAs`): `message.sent`.
- Payload (`broadcastWith`), exactly:
  ```json
  {"uuid":"<message_bodies.uuid>","message":"<stored, tag-stripped text>","sender_uuid":"<sender users.uuid>","created_at":"2026-11-04T10:20:30+00:00"}
  ```
  `created_at` uses `toIso8601String()`: `+00:00`, no fractional seconds. This differs from the REST format.
- `->toOthers()` excludes the socket in the request's `X-Socket-ID` header. The frontend never sends that header (messages go through a Next server action), so nothing is excluded.
- Pusher-protocol frame the client receives: `{"event":"message.sent","channel":"private-user.<uuid>","data":"<payload as JSON string>"}`.

### 8.4 Channel authorisation endpoint (Laravel)
- `GET|POST /broadcasting/auth`, **not under `/api`**. Middleware: `auth:sanctum` only. Errors render as JSON (`bootstrap/app.php` `shouldRenderJsonWhen` matches `broadcasting/*`).
- Input: `socket_id`, `channel_name` (JSON, form or query).
- Responses (Reverb/Pusher driver):
  - No or invalid token → **401** `{"message":"Unauthenticated."}` (`BroadcastAuthorizationTest::a_guest_cannot_subscribe_to_anything`)
  - Empty `channel_name`, an unregistered channel, or the callback returns false → **403** `{"message":""}` (`::a_user_cannot_subscribe_to_someone_elses_channel`, `::an_unknown_channel_is_refused` with `private-user.not-a-real-uuid`, `::the_internal_id_is_not_a_valid_channel_key` with `private-user.<int id>`)
  - Authorised `private-*` → **200** `{"auth":"<REVERB_APP_KEY>:<hex HMAC-SHA256(secret, socket_id + ":" + channel_name)>"}` (`::a_user_can_subscribe_to_their_own_channel` asserts the `auth` key)
  - `socket_id` not matching `/\A\d+\.\d+\z/`, or a channel name not matching `/\A#?[-a-zA-Z0-9_=@,.;]+\z/` → Pusher library exception → **500** `{"message":"Server Error"}`
  - With the `null` driver: **200**, empty body.

### 8.5 Frontend (must keep working unchanged)
- `frontend/src/lib/echo.ts`: `new Echo({broadcaster:"reverb", Pusher, key: NEXT_PUBLIC_REVERB_APP_KEY, wsHost: NEXT_PUBLIC_REVERB_HOST ?? window.location.hostname, wsPort: Number(NEXT_PUBLIC_REVERB_PORT ?? 8080), wssPort: Number(NEXT_PUBLIC_REVERB_PORT ?? 443), forceTLS: (NEXT_PUBLIC_REVERB_SCHEME ?? "http") === "https", enabledTransports:["ws","wss"], authEndpoint:"/api/broadcasting/auth"})`. No key means no Echo, and realtime is silently off.
  - pusher-js therefore connects to `ws[s]://<host>:<port>/app/<key>?protocol=7&client=js&version=<pusher-js version>&flash=false` and needs: `pusher:connection_established` (`socket_id`, `activity_timeout`), `pusher:subscribe` with `auth` for `private-` channels, `pusher_internal:subscription_succeeded`, `pusher:ping`/`pusher:pong`, and `pusher:unsubscribe`.
- The only subscriber is `frontend/src/app/(site)/messages/[tagname]/thread.tsx`:
  - `echo.private(\`user.${viewerUuid}\`)` → wire `private-user.<viewer uuid>`.
  - `channel.listen(".message.sent", …)`: the leading dot means no namespace, so the wire event must be exactly `message.sent`.
  - Reads `event.uuid`, `event.message`, `event.sender_uuid`, `event.created_at`. Appends `{...event, is_mine:false}` only if `sender_uuid === partner.uuid` and the uuid is not already listed.
  - On unmount it calls `echo.leave(\`user.${viewerUuid}\`)`.
- Auth proxy `frontend/src/app/api/broadcasting/auth/route.ts` (`POST` only):
  1. No session token cookie → `401 {"message":"Unauthenticated."}`.
  2. Reads **form data** `socket_id` and `channel_name` (pusher-js posts `application/x-www-form-urlencoded`). Either missing → `422 {"message":"Missing channel details."}`.
  3. `fetch(\`${API_URL}/broadcasting/auth\`, {method:"POST", headers:{Accept:"application/json","Content-Type":"application/json",Authorization:\`Bearer ${token}\`}, body: JSON.stringify({socket_id, channel_name})})`.
  4. Upstream non-2xx → `{"message":"Channel authorisation failed."}` with the upstream status. Otherwise it returns the upstream JSON body verbatim.
  - So the Hono backend must serve **`POST /broadcasting/auth`** at the root (no `/api`), accept a JSON body, and return parseable JSON (the empty body from the `null` driver would break `response.json()` in the proxy).

---

## 9. Lifecycle, end to end

Actors: lecturer **L** (owner), students **S1** (individual), **S2** (party leader), **S3** (S2's party member).

| Step | Call | DB effect | Box statuses after (L / S1 / S2 / S3) | Project |
|---|---|---|---|---|
| 0a | L `POST /my/projects` with `publish` truthy (or draft, then `POST /my/projects/{u}/publish`) | project created; lecturer box upserted (`Hiring`, or `Draft` while a draft) | Hiring / – / – / – | `Hiring`, `is_open_hiring=true` |
| 0b | S2 `POST /users/S3/invite/party` | team(S2), team_members(S2), team_invitation Pending, inbox `Team Invitation` → S3 | unchanged | |
| 0c | S3 `POST /inbox/{uuid}/respond {accept:true}` | invitation Accepted, team_members(S3), inbox read | unchanged | |
| 1a | S1 `POST /projects/{u}/apply/individual` | individual_applicants(S1, `Applying`) | Hiring / Waiting / – / – | |
| 1b | S2 `POST /projects/{u}/apply/team` with S2 and S3 listed | team_applicants(S2, `Applying`), applicant_team_members ×2 | Hiring / Waiting / Waiting / Waiting | |
| 1c (optional) | L `POST /my/projects/{u}/close` | `is_open_hiring=false`; lecturer box → `Confirmation` | Confirmation / … | still `Hiring`, closed |
| 2 | L `POST /my/projects/{u}/shortlist {individual_uuids:[S1 app], team_uuids:[S2 app]}` | both apps → `Waiting` | Confirmation / Accepted / Accepted / Accepted | unchanged (`Hiring`) |
| 2-alt | L `POST /my/projects/{u}/invite/S4`, then S4 accepts in the inbox | project_invitation Accepted; box(S4) upserted `Waiting to Start` | S4: Waiting to Start | (empty project_team created at invite time) |
| 3 | S1 `confirm {accept:true}`, S2 `confirm {accept:true}`, S3 `confirm {accept:false}` | box updates only | Confirmation / Waiting to Start / Waiting to Start / Bail Out | |
| 4 | L `POST /my/projects/{u}/start` | project_team; members S1 (expertise from their application), S2 (**null**); S1 app → `Fixed`, S2 team app → `Fixed` | Ongoing / Project Started / Project Started / **Rejected** | `Ongoing`, `is_open_hiring=false`, `start_time=now` |
| 5 | L `GET /my/projects/{u}/review` → participants S1, S2 | none | unchanged | |
| 6 | L `POST /my/projects/{u}/review` (overall 4.5; S1 score 4, S2 score 5; Medium) | review row; team member rows scored; leaderboards: S1 += round(0.9·0.8·2500)=1800, S2 += round(0.9·1.0·2500)=2250 on the posted expertise boards | **Finished** / Finished / Finished / Rejected | `Finished`, `finish_time=now` |

Notes:
- After step 6, `Finished` boxes feed the public profile's finished projects and `finished_project_count` (profile spec).
- Application rows are never set to `Rejected`; the statuses of passed-over applicants stay `Applying`/`Waiting`.
- The project remains `Hiring` throughout shortlist and confirm, so new applications are accepted until `close` or `start`.
- Editing the project (`PATCH /my/projects/{u}`) at any point rewrites `status` to Hiring/Draft and the lecturer box to Hiring/Draft (lecturer-projects spec). There is no guard against doing that on an Ongoing project.

---

## 10. Shared logic (formulas and constants)

1. **Project level pool**: `Easy=2000`, `Medium=2500`, `Hard=4000`, `Expert=5000`.
2. **Award**: `award = round((overall_score / 5) * (member_score / 5) * pool)`, computed in float64 in exactly that order. PHP `round` rounds half away from zero, and inputs are ≥0, so use `Math.floor(x + 0.5)` (or `Math.round`). Because `pool/25` ∈ {80,100,160,200}, the award = `overall * score * {80|100|160|200}`. Maximum per participant = pool. Examples: Hard 5/4 → 3200; Hard 5/5 → 4000; Easy 5/5 → 2000.
3. **Leaderboard write**: insert `(user_id, expertise=posted participant expertise, points=0)` if missing, then `points = points + award`. One row per (user, expertise).
4. **User points / level** (`UserResource`, profile spec): `points = max(leaderboards.points)` for the user (0 if none). `Level.forPoints(p)`: `p < 2501` → Rookie, `< 7501` → Amateur, `< 15001` → Superior, else Expert.
5. **ApplicantType**: `allowsIndividual = type !== 'Team'`; `allowsTeam = type !== 'Individual'`.
6. **Score storage**: `str(v)` = the trimmed input string if a string was sent (so `"4.50"` stays `"4.50"`), else `String(number)` (`4` → `"4"`, `4.5` → `"4.5"`). Applies to `overall_score` and participant `score`.
7. **`can_confirm`** = `box.status === 'Accepted'`.
8. **Conversation key**: `(min(a,b), max(a,b))`.
9. **Message notification**: delete the prior `Message` inbox row(s) for (recipient, sender), then insert a fresh one (new uuid, `created_at=now`, unread), so the conversation jumps to the top of the inbox.
10. **`strip_tags`** (PHP semantics): removes `<…>` tags, HTML comments and PHP tags. A `<` followed by whitespace is kept literally; an unclosed tag strips to the end of the string. Applied after trim and validation.
11. **UUID route constraint** (`whereUuid`): `^[\da-fA-F]{8}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{12}$` on `party/{team}`, `project-box/{projectBox}` and `inbox/{inbox}`.
12. **`storedFileUrl(path)`**: `null` → `null`; a value starting `http://` or `https://` → as-is; otherwise the public-disk URL for the relative path (`/storage/<path>` on the API origin; media spec). Upload directories: `avatars`, `cv`, `project-thumbnails`.
13. **Route keys**: User → `tagname`; Project → `project_url`; Team, ProjectBox, Inbox → `uuid`.
14. **Broadcast HMAC**: `auth = key + ":" + hex(HMAC_SHA256(secret, socket_id + ":" + channel_name))`.
15. **Ordering defaults** where Laravel has no ORDER BY: insertion order (id ASC). Where Laravel orders by `created_at` only, add `id` in the same direction as the tiebreak.

---

## 11. Demo data

### 11.1 Seeders (`database/seeders`)
`DatabaseSeeder` (runs with `WithoutModelEvents`; see Open question 1) calls `AdminSeeder` first and then creates the rest.

Fixed accounts (password for all: bcrypt `password`; `email_verified_at = now`):
| email | first / last | tagname | role | expertise | is_admin |
|---|---|---|---|---|---|
| `env ADMIN_EMAIL` ‖ `admin@phive.test` | PHive / Admin | `admin` | Lecturer | null | **true** (password `env ADMIN_PASSWORD` ‖ `password`; `updateOrCreate` by email; every other column null/default) |
| `lecturer@phive.test` | Test / Lecturer | `lecturer` | Lecturer | null | false |
| `student@phive.test` | Test / Student | `student` | Student | `Frontend Engineer` | false |

Generated accounts (Faker, random every run):
- 4 lecturers: email `<username>@<domainword>.ac.id`, expertise null.
- 20 students: email `<safeEmail>` (example.com/.org/.net), expertise = random Expertise.
- Factory defaults for every user (the fixed Test accounts included): `tagname = lower(slug(first+last, no separator)) + unique int 1..99999` (overridden for the fixed accounts); `identity_number` = 10 random digits; `university = "<Company> University"`; `faculty = "Computer Science"`; `major = "Informatics"`; `location` = city; `biography` = paragraph; `is_open_hired = false`; `is_admin = false`; photo/cv/links null.

Per student (all 21: 20 generated + Test Student):
- 3 distinct `user_skills` from `[Vue, React, Laravel, Figma, Postgres, Python]`.
- 1 `leaderboards` row `(user, user.expertise)` with `points` = random 0..500.

15 projects, each owned by a random lecturer from {4 generated + Test Lecturer} (**never the admin**):
- `title` = Title Case of 4 random words; `description` = 3 paragraphs joined by `\n\n`; `status = 'Hiring'`; `applicant_type = 'Individual & Team'`; `max_person` = `'2'..'6'`; `level_applicant` = random Easy/Medium/Hard/Expert; the 4 expertise booleans random; `certificate = true`; `salary` random; `is_open_hiring = true`; `currency = 'IDR'`; `salary_amount` = `'500000'..'5000000'`; `payment_type = 'person'`; `project_url = slug(title) + '-' + 8 random lowercase alphanumerics`; thumbnail, start_time, finish_time null.
- 3 distinct `project_skills` from `[Vue, React, Laravel, Figma, Postgres]`.
- 3 `project_requirements`, each `ucfirst(fake sentence)`.

**Not seeded**: lecturer `project_boxes` (so `/project-box` is empty for every seeded project, though `/my/projects` lists them), teams, applications, invitations, inboxes, messages, project teams, reviews, wishlists, experiences.

Row counts: users 27, user_skills 63, leaderboards 21, projects 15, project_skills 45, project_requirements 45.

Factory states (tests only): `ProjectFactory::draft()` (status Draft, project_url **null**), `::finished()` (Finished, closed, start −3 months, finish −1 month); `UserFactory::lecturer()`, `::student()`, `::unverified()`, `::admin()`.

The frontend has its **own** offline fixtures (`frontend/src/lib/fixtures.ts`, `DEMO_DATA=auto|always|never`) for public reads when the API is unreachable. They are unrelated to the backend seed.

### 11.2 `phive:demo-reset` (`DemoResetCommand`)
- Options: `--force` (skip the prompt), `--keep-uploads`.
- `config('phive.demo_mode')` (`DEMO_MODE`, default false) is false → prints the error `Refusing to run: DEMO_MODE is not enabled. This command deletes every row.` and exits **1** with nothing touched (`DemoResetTest::it_refuses_to_run_when_demo_mode_is_off`).
- Interactive without `--force`: confirm `This deletes everything in [<db>] and reseeds. Continue?` (default No). No → `Cancelled.`, exit 0.
- Steps:
  1. `migrate:fresh --force` drops **every** table: users, tokens, sessions, cache, jobs, all domain data.
  2. `db:seed --force` (11.1).
  3. Unless `--keep-uploads`: delete the public-disk directories `avatars`, `cv` and `project-thumbnails`.
  4. `cache:clear`.
  5. Prints `Demo reset. Seeded accounts use the password "password".`
- Schedule (`routes/console.php`): **registered only when DEMO_MODE is true** → `phive:demo-reset --force` daily at `DEMO_RESET_AT` (default `03:00`) in the app timezone (UTC), `withoutOverlapping()`, `onOneServer()` (`DemoResetTest::the_nightly_schedule_only_exists_in_demo_mode`, `::demo_mode_is_off_unless_explicitly_enabled`).
- Hono equivalent (PLAN.md): a cron trigger gated on `DEMO_MODE`. It should truncate every table (token/session tables included), apply the seed, and clear the R2 prefixes `avatars/`, `cv/` and `project-thumbnails/`.

### 11.3 `phive:install` (`InstallCommand`), for reference only
Copies `.env.example` → `.env` (unless it exists or `--force`), `key:generate`, an optional interactive DB driver prompt (pgsql/mysql/sqlite/keep) written into `.env`, `migrate --force`, seeds if `--seed` or the user confirms, then `storage:link`. Options: `--force`, `--seed`, `--no-interaction-defaults`. Sub-commands run in a fresh PHP process so the rewritten `.env` takes effect. Nothing to port beyond "migrate, then optionally seed".

---

## 12. Admin panel (Filament 5), inventory only, not ported

- Panel `admin` at `/admin`, `web` session guard (a bearer token does not get in), Filament login page at `/admin/login`, brand `PHive Admin`. Access requires `users.is_admin = true`; everyone else gets 403 after login, lecturers included (`AdminPanelTest`: guest → redirect `/admin/login`; admin → 200; student/lecturer → 403; bearer → redirect; `is_admin` defaults to false).
- Dashboard widgets: `PlatformOverview` (counts: Students, Lecturers, projects Hiring / Ongoing / Finished / Draft), `AccountWidget`, `FilamentInfoWidget`.
- Resources (every one has List with search, Create, Edit, a per-row Edit action, a header Delete on the edit page, and a bulk Delete):

| Resource (nav group) | Editable fields |
|---|---|
| Users (People) | first_name*, last_name*, role* (Student/Lecturer), tagname, identity_number, email*, email_verified_at, password (hashed on save; required on create; blank = unchanged on edit), photo_url (disk path), expertise, university, faculty, major, location, biography, is_open_hired, behance, github, linkedin, dribbble, website (url), cv_url (disk path), is_admin |
| Teams (People) | leader_id* |
| Leaderboards (People) | user_id*, expertise*, points* (numeric, default 0) |
| Projects (Projects) | user_id*, title, description, status* (default Draft), applicant_type* (default Individual & Team), max_person* (default Not Specified), thumbnail (path), level_applicant (free text), the 4 expertise toggles, certificate, salary, is_open_hiring, currency* (IDR), salary_amount* ('0'), payment_type* ('person'), project_url (validated as a URL), start_time, finish_time |
| Project Boxes (Projects) | project_id*, user_id*, status* (default Waiting) |

  (`*` = required.)
- Admin edits bypass all API side effects: no lecturer-box sync and no status transitions. `ProjectPolicy::before` gives admins full access, which also lets an admin act on any project through `my/projects/*` in the API (`ProjectPolicyTest::an_administrator_can_edit_another_lecturers_project_through_the_api`).

---

## 13. Open questions

1. **The demo seed looks broken in Laravel.** `DatabaseSeeder` uses `WithoutModelEvents`, which turns off the `creating` hook that `HasUuid` uses to fill `uuid`, and `uuid` is NOT NULL with no default. The first insert (AdminSeeder's admin user) should therefore fail. In `phive:demo-reset` that happens *after* `migrate:fresh`, so the nightly reset would leave an empty schema. I have not run it, because running commands was out of scope. Check on a scratch DB with `php artisan db:seed`. For Hono: write explicit UUIDs in the SQL seed.
2. **`GET my/projects/{u}/review` → `review` is a raw model** with integer `id` and `project_id`. Hono has UUID PKs (PLAN.md). The frontend never reads `review`. Options: emit `{uuid, project_id:<project uuid>, overall_score, overall_review, project_result}` and drop `id`, or return the public-detail shape. Decide and record here.
3. **Conversation pair ordering under UUID PKs.** Laravel orders the pair by integer id. If existing Laravel data is migrated, pairs ordered by int id will not always match `min/max` by UUID string, so a lookup on one ordering can miss the existing row and create a reversed duplicate (the unique index does not catch it). Either re-normalise headers during migration or look up both orderings.
4. `project_reviews.project_result` is varchar(255) but validation allows 2000. Postgres → 500 above 255 characters; SQLite/D1 stores it fine. Keep `max:2000` (D1 behaviour) or tighten it?
5. Re-inviting to a party after a decline, kick or leave is a silent no-op (the old invitation and inbox row are reused). Keep as is, or reset to `Pending`/unread?
6. `inbox respond` has no `Pending` guard and declining after accepting does not undo membership or the box. Keep?
7. `withdraw` deletes only the caller's `Waiting` box and has no status guard. A team withdrawal leaves members' `Waiting` boxes orphaned, and a withdrawn-but-`Accepted` student can still confirm and be started.
8. `shortlist` has no project status guard and overwrites any box status with `Accepted`, plus the lecturer box with `Confirmation`, even on Ongoing projects. `start` does not block Draft/Finished projects: restarting a Finished one with a stray `Waiting to Start` box flips every other `Finished` box to `Rejected`, which wipes portfolio entries.
9. Team-application members and invited students join the project team with `expertise = null` (only individual applications carry expertise). Intended?
10. Team applications do not require the leader to list themselves, and duplicate `member_uuid` values give a 500 in Laravel. Should Hono return 500 too, or 422?
11. Accepting a project invitation on an already-started project yields a `Waiting to Start` box that can never be started (start → 409).
12. The seed creates no lecturer `project_boxes`, so seeded projects never appear in a lecturer's Project Box. Should the Hono seed add them (`Hiring`)? That would be a deviation from Laravel.
13. Realtime transport: PLAN.md picks a `RealtimeHub` Durable Object that speaks Pusher protocol 7. It must accept pusher-js at `/app/<key>`, verify the §10.14 HMAC on private subscribe, and expose an internal trigger the message endpoint calls after commit (best-effort, never failing the request). Confirm the host/port the frontend's `NEXT_PUBLIC_REVERB_*` will point at.
14. D1 must enforce `ON DELETE CASCADE` for `applicant_team_members` (team withdrawal) and for inbox rows when invitations or message bodies go away. Otherwise delete them explicitly.
15. Float edge: `numeric` accepts arbitrary decimals (e.g. `3.33`), so awards can land near .5 boundaries. PHP 8.3 `round()` pre-rounding and JS can differ in the last unit. This is very unlikely with the form's inputs; accept it?
