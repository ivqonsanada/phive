# Contract: projects slice

Source of truth: `backend/` (Laravel 13.23, prod = Postgres, `APP_DEBUG=false`). Everything below is what the Laravel app actually does, quirks included. Where the frontend (`frontend/src`) reads a field, it is listed under **Frontend reads**. Deliberate-divergence candidates are collected in **Open questions**.

Laravel files: `routes/api.php`, `Http/Controllers/Api/{HomeController,ProjectController,LeaderboardController,WishlistController,ProjectManagementController,ProjectInvitationController,Settings/MediaController}.php`, `Http/Requests/SaveProjectRequest.php`, `Http/Resources/*`, `Policies/ProjectPolicy.php`, `Models/*`, `Enums/*`, `Support/{ProjectUrl,StoredFile}.php`, `config/phive.php`, `Providers/AppServiceProvider.php` (`JsonResource::withoutWrapping()`).

---

## 0. Conventions (apply to every endpoint below)

### 0.1 Auth
- Bearer token (`Authorization: Bearer <sanctum token>`). No cookie/stateful auth.
- **Public** routes (`home`, `projects`, `projects/{p}`, `projects/{p}/similar`, `leaderboards`): token optional. Missing or invalid token means guest. Never 401.
- **Protected** routes (`auth:sanctum`): no or invalid token returns `401 {"message":"Unauthenticated."}`.
- No `verified` middleware: unverified emails can use every endpoint here.
- No throttle on any route in this slice.

### 0.2 Input normalisation (global middleware, runs before validation)
1. `TrimStrings`: every string value in the query string and in the body (JSON or form, recursively into arrays) is trimmed (Unicode whitespace plus U+FEFF, U+200B, U+200E). Exempt keys: `password`, `password_confirmation`, `current_password`. None of them appear in this slice.
2. `ConvertEmptyStringsToNull`: every `""` (after trimming) becomes `null`, recursively, in the query and the body.

So `"title": "   "` becomes `null`, `skills: ["", "x"]` becomes `[null, "x"]`, and `?query=` becomes `query=null`.

### 0.3 Check order
- Generic: 401 (auth) → 404 (route-model binding) → controller body.
- `POST my/projects` / `PATCH my/projects/{p}` (FormRequest): 401 → 404 → **422 validation → 403 policy**. A non-owner or a student sending an invalid body gets 422, not 403.
- `POST/DELETE .../thumbnail`, `publish`, `close`, `DELETE`, `invite`: 401 → 404 → 403 → then the endpoint's own checks or validation.

### 0.4 Route-model binding
- `{project}` resolves by `projects.project_url = <segment>` (exact, case-sensitive). It resolves drafts too. Unknown → `404 {"message":"No query results for model [App\\Models\\Project] <segment>"}`. The decoded string is `No query results for model [App\Models\Project] <segment>`.
- `{user}` (invite route) resolves by `users.tagname = <segment>`. Unknown → `404 {"message":"No query results for model [App\\Models\\User] <segment>"}`.
- With two params, `project` is resolved first.

### 0.5 Error envelopes (prod, debug off)
| Case | Status | Body |
|---|---|---|
| unauthenticated | 401 | `{"message":"Unauthenticated."}` |
| policy denied (`$this->authorize`) | 403 | `{"message":"This action is unauthorized."}` |
| `abort(code, 'msg')` | code | `{"message":"msg"}` |
| `abort(404)` with no message | 404 | `{"message":""}` |
| validation | 422 | `{"message": <summary>, "errors": {<field>: [<msg>, ...]}}` |
| unhandled exception / DB constraint violation | 500 | `{"message":"Server Error"}` |

Validation `message` = first error message, plus ` (and 1 more error)` or ` (and N more errors)` for the remaining count across all fields. `errors` keys follow rule-definition order. After-hook errors (see 4.2) are appended last. The frontend reads `message` and `errors[field][0]`.

Attribute display names in messages: `_` becomes a space (`salary_amount` → `salary amount`). Wildcard items keep the raw dotted key (`skills.0`).

### 0.6 Serialisation
- `JsonResource::withoutWrapping()`: a single resource is a bare object, and a non-paginated collection is a bare JSON array. Only the paginator (`GET /projects`) wraps in `{data, links, meta}`.
- Dates: Carbon JSON gives `YYYY-MM-DDTHH:mm:ss.SSSSSSZ` in UTC, **6 fractional digits**, for example `"2026-11-04T10:20:30.000000Z"`. DB columns have second precision, so the fraction is always `.000000`. JS `toISOString()` (3 digits) is wrong. Pad to 6.
- Enums serialise to their string value. Booleans are real JSON booleans (D1 stores 0/1, so convert).
- Keys whose relation was not loaded are **omitted** (not `null`). A loaded-but-empty to-one relation is `null`.
- `updated_at` and internal integer `id`s are never exposed.

### 0.7 ProjectPolicy (`app/Policies/ProjectPolicy.php`)
- `before`: `users.is_admin = true` → allow everything (any role, any project). `ProjectPolicyTest::an_administrator_can_manage_any_project`, `::the_admin_flag_and_not_the_role_is_what_grants_it` (an admin **student** can update), `::an_administrator_can_edit_another_lecturers_project_through_the_api`.
- `create`: `role = 'Lecturer'`.
- `update`: `role = 'Lecturer' AND user.id = project.user_id`.
- `delete`: same as `update`.
- `viewAny`/`view` exist but **no endpoint in this slice calls them**.
- On denial: `403 {"message":"This action is unauthorized."}`.

---

## 1. Resource shapes

### 1.1 ProjectResource (key order as emitted)
| key | type | notes |
|---|---|---|
| `uuid` | string | UUIDv7 |
| `title` | string\|null | |
| `description` | string\|null | |
| `project_url` | string\|null | null only on legacy or factory drafts |
| `status` | `"Draft"`\|`"Hiring"`\|`"Ongoing"`\|`"Finished"` | |
| `thumbnail` | string\|null | absolute URL, see 7.3 |
| `applicant_type` | `"Individual"`\|`"Team"`\|`"Individual & Team"` | DB default `"Individual & Team"` |
| `max_person` | string | free text ≤50; DB default `"Not Specified"` |
| `level_applicant` | string\|null | uncast; writes are limited to `Easy`/`Medium`/`Hard`/`Expert` |
| `looking_for` | string[] | in this order, only the flags that are true: `ui_ux_designer`→`"UI/UX Designer"`, `front_end_engineer`→`"Frontend Engineer"`, `back_end_engineer`→`"Backend Engineer"`, `data_expert`→`"Data Expert"`. `ProjectBrowsingTest::looking_for_reflects_the_expertise_flags` |
| `reward` | object | `{certificate: bool, salary: bool, currency: string, amount: string, payment_type: string}`. `amount` is the TEXT column `salary_amount` returned as stored (`"1500000"`, default `"0"`). `currency` default `"IDR"`. `payment_type` is `"person"`\|`"project"`, default `"person"` |
| `is_open_hiring` | bool | DB default `true` |
| `is_wished` | bool | **only** on `GET /projects`, `GET /projects/{p}`, `GET /projects/{p}/similar`, and **only** when the request is authenticated (any role, lecturers included). `true` iff a `wishlists` row exists with `(user_id = viewer, project_id, status = true)`. Omitted for guests (`ProjectBrowsingTest::guests_do_not_get_a_wishlist_flag`, `::a_signed_in_student_sees_their_own_wishlist_flag`) |
| `start_time` | ISO date\|null | |
| `finish_time` | ISO date\|null | |
| `created_at` | ISO date | |
| `user` | UserSummary | owner; loaded on every endpoint in this slice |
| `skills` | string[] | `project_skills.name`, ordered by `id ASC` |
| `requirements` | string[] | `project_requirements.requirement`, ordered by `id ASC` |
| `team` | ProjectTeam\|null | null when no `project_teams` row exists |
| `review` | `{uuid, overall_score: string\|null, overall_review: string\|null, project_result: string\|null}`\|null | |

### 1.2 Which optional keys each endpoint emits
| Endpoint | user | skills | requirements | team | review | is_wished |
|---|---|---|---|---|---|---|
| `GET home` → `latest_projects[]` | ✓ | – | – | – | – | – |
| `GET projects` | ✓ | – | – | – | – | if authed |
| `GET projects/{p}` | ✓ | ✓ | ✓ | ✓ | ✓ | if authed |
| `GET projects/{p}/similar` | ✓ | – | – | – | – | if authed |
| `GET wishlist` | ✓ | – | – | – | – | – |
| `GET/POST my/projects`, `PATCH my/projects/{p}`, `POST .../publish` | ✓ | ✓ | ✓ | – | – | – |
| `POST .../thumbnail` | ✓ | – | – | – | – | – |

### 1.3 UserSummaryResource
`{uuid: string, tagname: string|null, first_name: string, last_name: string, name: string, role: "Student"|"Lecturer", photo_url: string|null, expertise: "UI/UX Designer"|"Frontend Engineer"|"Backend Engineer"|"Data Expert"|null, finished_project_count?: int}`
- `name` = `trim(first_name + " " + last_name)`.
- `photo_url`: absolute URL via the same rule as thumbnails (7.3).
- `finished_project_count` appears **only** inside leaderboard entries (`GET leaderboards`, `GET home` → `top_boards`). It is the count of `project_boxes WHERE user_id = user.id AND status = 'Finished'`. The key is singular `project`.

### 1.4 ProjectTeamResource (only in `GET projects/{p}`)
`{uuid: string, leader: UserSummary|null, members: [{expertise: Expertise|null, score: string|null, assessment: string|null, user: UserSummary}]}`
- `leader` is null when `project_teams.leader_id` is null. Invitations create teams with a null leader (see 3.16).
- `members` = `project_team_members` for the team, with no ORDER BY in Laravel. Use `id ASC`.
- `score` is a TEXT column (`'4'` → `"4"`). `ProjectTeamVisibilityTest::a_guest_can_open_a_project_that_has_a_team`.

### 1.5 LeaderboardEntryResource
`{uuid: string, expertise: Expertise (string value), points: int, user: UserSummary + finished_project_count}`

---

## 2. Visibility matrix (status → who sees it)

Public visibility never depends on the viewer. Owners and admins **cannot** see their drafts through public endpoints either.

| Surface | Draft | Hiring (open) | Hiring (closed) | Ongoing | Finished |
|---|---|---|---|---|---|
| `GET projects` list | hidden | ✓ | ✓ | ✓ | ✓ |
| `GET projects/{p}` | **404** | ✓ | ✓ | ✓ | ✓ |
| `GET projects/{p}/similar` (path project) | **200** (binding only) | ✓ | ✓ | ✓ | ✓ |
| `similar` results | never | ✓ | ✓ | ✓ | ✓ |
| `POST projects/{p}/wishlist` | **404** (`{"message":""}`) | ✓ | ✓ | ✓ | ✓ |
| `GET wishlist` items | hidden | ✓ | ✓ | ✓ | ✓ |
| `GET home` `latest_projects` | – | ✓ | – | – | – |
| `GET home` `stats` | not counted | `hiring` | `hiring` | `ongoing` | `finished` |
| `GET my/projects` | ✓ (own) | ✓ | ✓ | ✓ | ✓ |

"Published" = `status != 'Draft'`.

---

## 3. Endpoints

### 3.1 `GET /api/home`
- Public. No personalisation, so the same output with or without a token.
- **200**:
```json
{
  "stats": {"hiring": 2, "ongoing": 1, "finished": 3},
  "top_boards": {
    "ui_ux_designer": LeaderboardEntry|null,
    "front_end_engineer": LeaderboardEntry|null,
    "back_end_engineer": LeaderboardEntry|null,
    "data_expert": LeaderboardEntry|null
  },
  "latest_projects": [ProjectResource, ...]
}
```
- `stats`: `SELECT status, count(*) FROM projects GROUP BY status`. `hiring` = count with status `Hiring`, **regardless of `is_open_hiring`**. Missing groups give `0`. Ints. Drafts are not reported. `HomeAndLeaderboardTest::home_counts_projects_by_status`.
- `top_boards`: keys in this order (Expertise case order). For each expertise: `SELECT * FROM leaderboards WHERE expertise = <value> ORDER BY points DESC LIMIT 1` plus the user with `finished_project_count`. None → `null`. No tiebreaker in Laravel. Rows with 0 points qualify. Any role qualifies. `HomeAndLeaderboardTest::home_exposes_a_top_scorer_per_expertise` (`top_boards.data_expert.user.tagname`, `top_boards.ui_ux_designer` = null).
- `latest_projects`: `status = 'Hiring' AND is_open_hiring = true ORDER BY created_at DESC LIMIT 6`, with `user`. No `is_wished`, even when authed.
- **Frontend reads**: `stats.hiring|ongoing|finished`, `top_boards[key].points`, `.user.{photo_url,name,tagname,finished_project_count}`. `latest_projects` is typed but unused.

### 3.2 `GET /api/projects`
- Public.
- Query validation (`$request->validate`):
  - `query`: `['nullable', 'string', 'max:255']`
  - `expertise`: `['nullable', Rule::enum(Expertise::class)]` (one of `UI/UX Designer`, `Frontend Engineer`, `Backend Engineer`, `Data Expert`, exact case)
  - `status`: `['nullable', Rule::enum(ProjectStatus::class)]` (`Draft`/`Hiring`/`Ongoing`/`Finished`)
  - `open_only`: `['nullable', 'boolean']`. Accepts only `0`, `1`, `"0"`, `"1"`, `true`, `false`. In a query string that means `0` or `1`. **`open_only=true` fails with 422.**
  - Messages: `The query field must be a string.`, `The query field must not be greater than 255 characters.`, `The selected expertise is invalid.`, `The selected status is invalid.`, `The open only field must be true or false.`. `ProjectBrowsingTest::it_rejects_an_unknown_expertise` (`?expertise=Wizard` → 422, `errors.expertise`).
  - `page` is not validated: a non-integer or a value < 1 becomes 1.
- Query (all ANDed):
  1. `status != 'Draft'`.
  2. `query` truthy (PHP truthiness, so `"0"` **does not filter**): `(lower(title) LIKE p OR lower(description) LIKE p)` with `p = '%' + mb_strtolower(term) + '%'`. `%` and `_` in the term are **not escaped** and act as wildcards. NULL description doesn't match. Case-insensitive: `ProjectBrowsingTest::it_searches_title_and_description_case_insensitively` (`wayfinding` matches the title "Campus Wayfinding App" and the description "A WAYFINDING kiosk.").
  3. `expertise`: `<projectColumn(expertise)> = true` (mapping in Shared logic). `ProjectBrowsingTest::it_filters_by_expertise`.
  4. `status`: `status = <value>`. `status=Draft` is valid and always returns empty.
  5. `open_only` truthy (`1`/`"1"`/`true`): `is_open_hiring = true`.
- Order `created_at DESC` with no tiebreaker. Use `created_at DESC, id DESC`.
- Pagination: `simplePaginate(9)`, so no total and no last page. Fetch `LIMIT 10 OFFSET (page-1)*9`. More pages exist when 10 rows come back; return the first 9.
- **200** envelope (every key always present):
```json
{
  "data": [ProjectResource, ...],
  "links": {
    "first": "<base>?<q>page=1",
    "last": null,
    "prev": "<base>?<q>page=<n-1>" | null,
    "next": "<base>?<q>page=<n+1>" | null
  },
  "meta": {
    "current_page": 2,
    "current_page_url": "<base>?<q>page=2",
    "from": 10,
    "path": "<base>",
    "per_page": 9,
    "to": 18
  }
}
```
  - `<base>` = absolute request URL without the query and without a trailing `/`, for example `https://api.host/api/projects`. It honours `X-Forwarded-Proto/Host/Port`, since all proxies are trusted.
  - `<q>` = every incoming query param **except `page`**, in original order, including unknown params. Values are trimmed. Params that became null (empty) are dropped. Encoding is `http_build_query` RFC3986 (space → `%20`, `/` → `%2F`). Then `&`, then `page=N` last. Example: `?expertise=UI%2FUX%20Designer&query=app&page=2`.
  - `prev` is null on page 1. `next` is null when there are no more rows. `from` = `(page-1)*9+1` and `to` = `from+count-1`, both `null` when `data` is empty (for example past the end).
- `ProjectBrowsingTest::guests_can_browse_published_projects` (3 published plus 1 draft gives `data` count 3, with `data.*.user.tagname`).
- **Frontend reads**: sends `query`, `expertise`, `page` (never `status` or `open_only`). Reads `data[]` (card fields: `uuid, title, project_url, thumbnail, reward.{salary,currency,amount,certificate}, is_wished, looking_for, user.{tagname,name}, applicant_type, level_applicant, created_at, max_person, status`), plus `links.prev` and `links.next`, which it parses with `new URL(href)`, so they **must be absolute**, and from which it reads `page`.

### 3.3 `GET /api/projects/{project_url}`
- Public. Binding 404 as in 0.4.
- Re-queries with the published scope: a **draft gives 404** `{"message":"No query results for model [App\\Models\\Project] <internal integer id>"}` (the internal id leaks; see Open questions). This applies to owners and admins too. `ProjectBrowsingTest::drafts_are_not_reachable_by_url`.
- **200**: bare ProjectResource with `user, skills, requirements, team (+leader, +members.user), review`, plus `is_wished` when authed.
  - `ProjectBrowsingTest::the_detail_endpoint_includes_skills_and_requirements` (`skills.0`, `requirements.0`, `title`).
  - `ProjectTeamVisibilityTest::*` (`team.members.0.user.tagname`, `.expertise` = `"Backend Engineer"`, `.score` = `"4"`; `review.overall_score` = `"5"`, `review.overall_review`).
  - `ProjectPublishingTest::closing_applications_keeps_the_project_visible` (`is_open_hiring` = false, still 200).
- **Frontend reads**: `title, description, thumbnail, is_wished` (shows the wishlist button iff the key is present), `project_url, requirements, skills, user.{uuid,photo_url,tagname,name,expertise}, looking_for, reward.*, created_at, max_person, applicant_type, level_applicant, is_open_hiring, status, start_time, team.members[].{expertise, user.{uuid,tagname,photo_url,name,expertise}}`. Any 404 is treated as notFound; the message is not read.

### 3.4 `GET /api/projects/{project_url}/similar`
- Public. Binding only, with **no draft check**: a draft slug returns 200.
- Algorithm: published projects, `id != path project`. If the viewer is authed **and** `users.expertise` is not null, add `<projectColumn(viewer.expertise)> = true`. Then `ORDER BY RANDOM() LIMIT 3`. No fallback when fewer match. Guests (or users without an expertise) get any 3 random published projects. Includes Ongoing, Finished and closed projects.
- **200**: bare JSON array (0–3) of ProjectResource with `user`, plus `is_wished` when authed. `ProjectBrowsingTest::similar_projects_match_the_viewers_expertise` (a bare array, each item has `looking_for` containing the viewer's expertise, and `uuid` differs from the path project).
- **Frontend reads**: the card fields (3.2). Renders nothing when the array is empty.

### 3.5 `GET /api/leaderboards`
- Public.
- `limit` = `(int) request('limit', 10)` using PHP int-cast semantics: `"abc"` → 0, `"5x"` → 5, `""` → null → 0. Effective SQL `LIMIT min(limit, 50)`. **`limit < 0` means no LIMIT** (whole board). `limit = 0` gives empty arrays. The frontend never sends `limit`.
- Per expertise (keys in Expertise case order): `SELECT * FROM leaderboards WHERE expertise = <value> ORDER BY points DESC LIMIT n` plus the user with `finished_project_count`. No tiebreaker in Laravel; use `points DESC, id ASC`. No rank field.
- **200**: `{"boards": {"ui_ux_designer": [LeaderboardEntry...], "front_end_engineer": [...], "back_end_engineer": [...], "data_expert": [...]}}`. Every key is always present, as `[]` when empty.
  - `HomeAndLeaderboardTest::the_leaderboard_is_ordered_by_points` ([30, 90, 60] → [90, 60, 30]).
  - `::every_expertise_gets_a_board_even_when_empty`.
- **Frontend reads**: `boards[key][]` → `uuid, points, user.{photo_url,tagname,name,finished_project_count}`. `boards[key][0]` is shown as #1.

### 3.6 `GET /api/wishlist`
- `auth:sanctum`. **Any role**; a lecturer simply gets their rows (normally none).
- Query: published projects with a `wishlists` row `(user_id = me, status = true)`, `ORDER BY projects.created_at DESC`, no limit.
- **200**: `{"projects": [ProjectResource with user, NO is_wished]}`. `WishlistTest::the_wishlist_lists_only_starred_projects` (`projects` count 1, `projects.0.uuid`).
- **Frontend reads**: `projects[]` card fields. The page redirects non-students client-side.

### 3.7 `POST /api/projects/{project_url}/wishlist`
- `auth:sanctum`. No body.
- Order:
  1. 401 (`WishlistTest::guests_cannot_toggle`).
  2. Binding 404.
  3. `status = 'Draft'` → `404 {"message":""}` (`SocialBoundariesTest::a_draft_project_cannot_be_wishlisted`, no row created).
  4. Role not Student → `403 {"message":"Only students keep a wishlist."}` (`WishlistTest::lecturers_do_not_have_a_wishlist`). There is no admin bypass here.
- Toggle: find the `wishlists` row by `(user_id, project_id)`. If none, insert `{uuid, user_id, project_id, status: true, created_at, updated_at}`. If it exists, set `status = !status` and touch `updated_at`. Rows are never deleted, and `UNIQUE(user_id, project_id)` holds.
- **200**: `{"is_wished": <new status bool>}`. `WishlistTest::a_student_can_toggle_a_project_on_and_off` (true, then false, with 1 row).
- **Frontend reads**: `is_wished`.

### 3.8 `GET /api/my/projects`
- `auth:sanctum`. **No policy check**: any role gets the projects where `user_id = me` (a student gets `[]`).
- All statuses including drafts, `ORDER BY created_at DESC` (use `, id DESC`), no pagination.
- **200**: bare array of ProjectResource with `user, skills, requirements`. `ProjectPublishingTest::the_lecturers_own_list_includes_drafts` (root count 2).
- **Frontend reads**: this is the edit page's data source (it finds by `project_url`) and also feeds the project rows and the profile invite picker: `uuid, project_url, status, thumbnail, title, description, created_at, is_open_hiring, max_person, looking_for, applicant_type, level_applicant, reward.*, skills, requirements`.

### 3.9 `POST /api/my/projects`
- `auth:sanctum`. Body: JSON (form-encoded also accepted). Validation is in §4.
- Order: 401 → **422 validation** → 403 `authorize('create')` (student → `{"message":"This action is unauthorized."}`, `ProjectPublishingTest::students_cannot_publish`).
- Writes, in one transaction:
  1. INSERT `projects` with **only the validated keys present in the body** (§4.3), plus `status` = `Hiring` if publishing else `Draft`, `user_id` = me (a payload `user_id` is ignored: `ProjectBoundariesTest::a_lecturer_cannot_assign_a_project_to_someone_else`), `project_url` = generated slug (§5; a payload `project_url` is ignored: `::a_lecturer_cannot_choose_their_own_project_url`), `uuid` (v7), `created_at`/`updated_at`. A payload `status` is ignored (`::a_lecturer_cannot_jump_a_project_straight_to_finished`). Absent columns take DB defaults. **An explicit null on a NOT NULL column gives 500** (§4.4).
  2. Skills and requirements sync (§4.5).
  3. Lecturer project box: upsert `project_boxes (project_id, user_id = project.user_id)` with `status = 'Draft'` for a draft or `'Hiring'` otherwise.
- **201**:
```json
{"message": "Project published." | "Draft saved.", "project": ProjectResource(+user, skills, requirements)}
```
  - Quirk: Laravel serialises the **in-memory** model, not a re-read. Columns not sent in the body come back `null` (`applicant_type`, `max_person`, `currency`, `amount`, `payment_type`, `certificate`, `salary`, `is_open_hiring`, `start_time`, `finish_time`). `looking_for` only reflects the flags that were sent. `reward.amount` keeps the JSON type that was sent (number `1500000` rather than `"1500000"`). `thumbnail` is null.
  - Tests: `ProjectPublishingTest::a_lecturer_can_publish_a_project` (`project.status` = `Hiring`, `project.skills` = `["React","Figma"]`, `project.requirements` = `["Weekly standup"]`, slug starts with `campus-wayfinding-app-`, box `Hiring`) and `::a_draft_may_be_incomplete` (`{publish:false, title}` → 201, `Draft`).
- **Frontend reads**: `project.project_url` (redirects to the edit page), plus `message` and `errors` on failure. The frontend always sends every field: `publish`, `title`, `description`, `applicant_type`, `max_person`, `level_applicant`, the 4 expertise booleans, `certificate`, `salary`, `currency` (`|| "IDR"`), `salary_amount` (`|| 0`), `payment_type` (`|| "person"`), `skills: string[]`, `requirements: string[]`. Blank fields arrive as `""`, which becomes null.

### 3.10 `PATCH /api/my/projects/{project_url}`
- `auth:sanctum`. Binding resolves any status.
- Order: 401 → 404 → **422 validation** (§4) → 403 `authorize('update')` (`ProjectPublishingTest::a_lecturer_cannot_edit_someone_elses_project`; admin allowed: `ProjectPolicyTest::an_administrator_can_edit_another_lecturers_project_through_the_api`).
- Partial update: UPDATE only the validated keys present in the body (§4.3). **`status` is always written**: `Hiring` if publishing, else **`Draft`**, from any current status (Hiring, Ongoing and Finished included; there is no guard). `is_open_hiring`, `project_url`, `thumbnail`, `start_time` and `finish_time` are never touched.
- Publish-time rules (§4.1, §4.2) look only at the **request body**, not the stored row. Publishing via PATCH therefore needs `title`, `description` and at least one expertise flag that is truthy in the body, even if the row already has them.
- Then skills and requirements sync (§4.5) and lecturer box upsert (`Draft`/`Hiring`), in one transaction.
- **200**: `{"message": "Project published." | "Changes saved.", "project": ProjectResource(fresh from DB, +user, skills, requirements)}`.
  - `ProjectPublishingTest::editing_replaces_the_skill_list_rather_than_appending` (`project.skills` = `["React"]`, 1 row).
  - `::omitting_skills_leaves_them_untouched`.
- **Frontend reads**: only `message` and `errors` on failure. It shows its own "Project published." / "Changes saved." text. It sends the full payload (same as 3.9) with `publish = (intent == "publish")`. **The "Save draft" button on a live project therefore demotes it to Draft.**

### 3.11 `DELETE /api/my/projects/{project_url}`
- `auth:sanctum`. Order: 401 → 404 → 403 `authorize('delete')`.
- `status = 'Ongoing'` → `409 {"message":"An ongoing project cannot be deleted — terminate it from the project box instead."}` (em dash U+2014). Draft, Hiring and Finished can all be deleted. `ProjectPublishingTest::a_project_can_be_withdrawn_unless_it_is_ongoing`.
- Hard delete with FK cascades. The port must replicate: `project_requirements`, `project_skills`, `project_reviews`, `wishlists`, `project_teams` → `project_team_members`, `individual_applicants`, `team_applicants` → `applicant_team_members`, `project_boxes`, `project_invitations` → `inboxes` (via `project_invitation_id`). The **thumbnail file is NOT deleted** from storage.
- **200**: `{"message":"Project withdrawn."}`.

### 3.12 `POST /api/my/projects/{project_url}/publish`
- `auth:sanctum`. No body. Order: 401 → 404 → 403 `authorize('update')`, then:
  1. `status != 'Draft'` → `409 {"message":"Only a draft can be published."}` (`ProjectPublishingTest::republishing_a_live_project_is_a_conflict`).
  2. Stored `title` **or** `description` blank (null, `""` or whitespace) → `422 {"message":"Give the project a title and description before publishing it."}`, with **no `errors` key** (`::an_empty_draft_cannot_be_published`).
  3. There is **no expertise-flag or salary check** here, unlike PATCH with publish.
- Writes (transaction): `status = 'Hiring'`, `is_open_hiring = true`, lecturer box upsert → `Hiring`.
- **200**: `{"message":"Project published.", "project": ProjectResource(fresh, +user, skills, requirements)}` (`::a_draft_can_be_published_in_one_call`).
- **Frontend reads**: nothing (it revalidates). The button is disabled when `!project.title`.

### 3.13 `POST /api/my/projects/{project_url}/close`
- `auth:sanctum`. No body. Order: 401 → 404 → 403 `authorize('update')`. **No status check**: this works on any status, drafts included.
- Writes: `projects.is_open_hiring = false`. Then `UPDATE project_boxes SET status='Confirmation', updated_at=now WHERE project_id = p AND user_id = project.user_id`, a no-op when there is no box.
- **200**: `{"message":"Applications closed."}`. `ProjectPublishingTest::closing_applications_keeps_the_project_visible`.

### 3.14 `POST /api/my/projects/{project_url}/thumbnail`
- `auth:sanctum`. `multipart/form-data`, field `file`. Order: 401 → 404 → 403 `authorize('update')` (`MediaTest::a_lecturer_cannot_set_a_thumbnail_on_someone_elses_project`) → validation. Any status, drafts included.
- Rules: `'file' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:'.config('phive.uploads.thumbnail_max_kb')]`, where `thumbnail_max_kb` = env `UPLOAD_THUMBNAIL_MAX_KB`, default **2048** (KiB; passes when `bytes/1024 <= 2048`). All rules run (no bail).
  - The type check is by **content sniffing** (finfo), not by filename or client MIME. `image` allows jpg/jpeg/png/gif/bmp/webp, then `mimes` narrows to jpeg/jpg/png/webp. So GIF and BMP fail only `mimes`, while a non-image fails both.
  - Messages: `The file field is required.`, `The file field must be an image.`, `The file field must be a file of type: jpeg, jpg, png, webp.`, `The file field must not be greater than 2048 kilobytes.`, `The file failed to upload.` (failed upload).
  - Example: a text file gives `{"message":"The file field must be an image. (and 1 more error)","errors":{"file":["The file field must be an image.","The file field must be a file of type: jpeg, jpg, png, webp."]}}`.
- Writes:
  1. Delete the previous file if `thumbnail` is a relative path and exists. Absolute `http(s)://` legacy values are left alone.
  2. Store the new file at `project-thumbnails/<40 random [A-Za-z0-9]>.<ext>`, where `ext` comes from the sniffed MIME: `jpg` for JPEG, `png`, `webp`.
  3. Set `projects.thumbnail` to that relative path (`MediaTest::the_api_returns_an_absolute_url_not_the_stored_path`: the column starts with `project-thumbnails/`, and the response is an absolute URL containing `/storage/`).
- **200**: `{"message":"Thumbnail updated.", "project": ProjectResource(fresh, +user only)}`. `MediaTest::a_lecturer_can_set_a_project_thumbnail`.
- **Frontend reads**: `message` and `errors` on failure only. It sends `FormData{file}` and accepts `image/jpeg,image/png,image/webp`. Images are rendered `unoptimized`, so any absolute host works.

### 3.15 `DELETE /api/my/projects/{project_url}/thumbnail`
- `auth:sanctum`. Order: 401 → 404 → 403 `authorize('update')`. No validation.
- Deletes the stored file (relative paths that exist only), then sets `thumbnail = NULL`. This is idempotent and also returns 200 when there was no thumbnail.
- **200**: `{"message":"Thumbnail removed."}`.

### 3.16 `POST /api/my/projects/{project_url}/invite/{tagname}`
- `auth:sanctum`. No body. Laravel's param is `{user}`, bound by `tagname`.
- Order:
  1. 401.
  2. Project 404, then user 404 (0.4).
  3. 403 `authorize('update', project)` (`ProjectInvitationTest::a_lecturer_cannot_invite_to_someone_elses_project`; admins pass).
  4. Invitee is me → `422 {"message":"You cannot invite yourself."}`.
  5. Invitee role not Student → `422 {"message":"Only students can be invited to a project."}` (`::only_students_can_be_invited`).
  6. **Side effect, outside the transaction**: `project_teams` firstOrCreate on `(project_id)`. A new row has `{uuid, project_id, leader_id: NULL}`, with no timestamps.
  7. Invitee already in `project_team_members` for that team → `422 {"message":"They are already on this project team."}`.
  8. Transaction: `project_invitations` firstOrCreate on `(project_id, from_id = me, to_id = invitee)`. A new row gets `status = 'Pending'` (DB default), `uuid` and timestamps. Then `inboxes` firstOrCreate on `(project_invitation_id)`, new row `{uuid, recipient_id: invitee, sender_id: me, category: 'Project Invitation', is_read: false, team_invitation_id: null, message_body_id: null, timestamps}`.
- No project-status check: Draft, Ongoing and Finished projects can all be invited to. Repeat calls are idempotent and still return 200 with the same message, including after the student **rejected or accepted**. That case does not re-open the invitation or send a new inbox row. `ProjectInvitationTest::inviting_twice_does_not_duplicate_the_invitation` (1 invitation, 1 inbox).
- **200**: `{"message":"Invitation sent to <invitee name>."}`, where name = `trim(first_name + " " + last_name)`. `::a_lecturer_can_invite_a_student_to_their_project` (invitation `Pending`, inbox category `Project Invitation`).
- Because of step 6, `GET projects/{p}` afterwards returns `team: {uuid, leader: null, members: []}` instead of `null`.
- **Frontend reads**: `message`, shown verbatim as success text, and `message`/`errors` on failure.

---

## 4. SaveProjectRequest (shared by 3.9 and 3.10)

### 4.1 Rules (verbatim)
`publishing()` = `filter_var(input('publish'), FILTER_VALIDATE_BOOLEAN)`. Because of the `boolean` rule, only `true`, `1` or `"1"` both pass validation and mean "publishing". A missing value, `null`, `false`, `0` or `"0"` means a draft.
`$requiredWhenPublishing = publishing() ? 'required' : 'nullable'`.

| field | rules |
|---|---|
| `publish` | `nullable, boolean` |
| `title` | `$requiredWhenPublishing, string, max:255` |
| `description` | `$requiredWhenPublishing, string, max:20000` |
| `applicant_type` | `nullable, Rule::enum(ApplicantType)` → `Individual`\|`Team`\|`Individual & Team` |
| `max_person` | `nullable, string, max:50` (a JSON number fails `string`) |
| `level_applicant` | `nullable, Rule::enum(ProjectLevel)` → `Easy`\|`Medium`\|`Hard`\|`Expert` |
| `ui_ux_designer`, `front_end_engineer`, `back_end_engineer`, `data_expert` | `nullable, boolean` |
| `certificate`, `salary` | `nullable, boolean` |
| `currency` | `nullable, string, max:8` |
| `salary_amount` | `nullable, numeric, min:0` (number or numeric string; `is_numeric`) |
| `payment_type` | `nullable, Rule::in(['person','project'])` |
| `skills` | `nullable, array, max:20` (counted before dedupe) |
| `skills.*` | `string, max:50` (a null item fails `string`) |
| `requirements` | `nullable, array, max:20` |
| `requirements.*` | `string, max:255` |

`boolean` accepts exactly `true`, `false`, `0`, `1`, `"0"`, `"1"`. `"true"`, `"on"` and `"yes"` fail. `nullable` plus a null value skips the other rules. `required` fails on null, which covers `""` and whitespace after §0.2.

Standard messages (`:attribute` uses underscores turned into spaces):
- `The title field is required.`
- `The title field must be a string.`
- `The title field must not be greater than 255 characters.`
- `The description field must not be greater than 20000 characters.`
- `The selected applicant type is invalid.`
- `The max person field must be a string.`
- `The max person field must not be greater than 50 characters.`
- `The selected level applicant is invalid.`
- `The ui ux designer field must be true or false.` (likewise `front end engineer`, `back end engineer`, `data expert`, `certificate`, `salary`, `publish`)
- `The currency field must not be greater than 8 characters.`
- `The salary amount field must be a number.`
- `The salary amount field must be at least 0.`
- `The selected payment type is invalid.`
- `The skills field must be an array.`
- `The skills field must not have more than 20 items.`
- `The skills.0 field must be a string.`
- `The skills.0 field must not be greater than 50 characters.`
- `The requirements.3 field must not be greater than 255 characters.`

### 4.2 After-hook (only when publishing; runs even when rule errors exist, so errors accumulate)
- None of `ui_ux_designer`, `front_end_engineer`, `back_end_engineer`, `data_expert` is truthy in the **request** (`filter_var` boolean) → add to `ui_ux_designer`: **`Choose at least one expertise this project is hiring for.`** (`ProjectPublishingTest::publishing_requires_at_least_one_expertise`).
- `salary` truthy in the request and `(float) salary_amount <= 0`, where a missing, null or non-numeric amount counts as 0 → add to `salary_amount`: **`A paid project needs a salary amount above zero.`** (`::a_paid_project_needs_an_amount`).
- Example: `::publishing_requires_a_title_and_description` (title `""`, description `""`) gives `errors.title`, `errors.description`, `message` = `The title field is required. (and 1 more error)`.

### 4.3 What gets written
Validated keys **present in the body**, except `publish`, `skills` and `requirements`: `title, description, applicant_type, max_person, level_applicant, ui_ux_designer, front_end_engineer, back_end_engineer, data_expert, certificate, salary, currency, salary_amount, payment_type`, plus `status`. Unknown keys are ignored (`user_id`, `status`, `project_url`, `is_open_hiring`, `thumbnail`, `start_time` and so on).

Storage types: booleans as 0/1. `salary_amount` is TEXT: a number 1500000 is stored as `"1500000"`, 1500000.5 as `"1500000.5"`, and numeric strings verbatim after trimming. `max_person` and `level_applicant` are TEXT.

### 4.4 NOT NULL columns (exact Laravel behaviour)
`applicant_type`, `max_person`, `currency`, `salary_amount`, `payment_type`, and all six booleans are `NOT NULL` with defaults. An explicit `null` (including `""` after §0.2) passes validation and then **fails the INSERT/UPDATE → 500 `{"message":"Server Error"}`**, rolling back the transaction. `title`, `description` and `level_applicant` are nullable, so null is fine there. The frontend hits this when "Team size" is left blank on create (`max_person: ""`). See Open questions.

### 4.5 Skills and requirements sync (replace, not diff)
- `skills` key present (`has()` is true even when the value is null):
  1. `DELETE FROM project_skills WHERE project_id = p`.
  2. Insert `array_unique(skills)`: exact, case-sensitive dedupe that keeps the first occurrence and its order. Rows get `uuid` and no timestamps. `UNIQUE(project_id, name)`.
- `skills` absent: untouched. `skills: []` clears them all.
- `skills: null` → PHP TypeError → **500** (rolled back).
- `requirements`: same, but **no dedupe**. `requirements: null` → **500**.

---

## 5. `project_url` slug generation (`Support/ProjectUrl::generate`)
Input: the request's `title` after §0.2 (null becomes `''`).
1. Transliterate to ASCII (voku/portable-ascii, language `en`, for example `é` → `e`, `ß` → `ss`). Characters that cannot be transliterated are dropped.
2. Replace runs of `_` with `-`.
3. Replace `@` with `-at-`.
4. Lowercase, then remove every character that is not `-`, a letter, a digit or whitespace.
5. Collapse runs of `-` and whitespace into a single `-`.
6. Trim `-` from both ends.
7. Empty → `project`.
8. Truncate to the first **60** characters with no ellipsis. Only whitespace is right-trimmed, so a trailing `-` can survive and produce `--` before the suffix.
9. Append `-` plus 8 chars `[a-z0-9]` (`Str::lower(Str::random(8))`).
10. Repeat step 9 while `projects.project_url` already exists. The column is UNIQUE.

Properties:
- The suffix is always appended, not only on collision.
- Generated only on create, so drafts get one too.
- **Never changes** on PATCH, publish or title edit.
- Cannot be supplied by the client.
- Example: "Campus Wayfinding App" → `campus-wayfinding-app-k3j9x0qa`.

---

## 6. Status machine
`ProjectStatus`: `Draft`, `Hiring`, `Ongoing`, `Finished`. `projects.status` default `'Draft'`. `is_open_hiring` default `true`.

| Action | From | To / effect | Lecturer box (`project_boxes` row for `project.user_id`) |
|---|---|---|---|
| POST my/projects, publish falsy | – | Draft | upsert → `Draft` |
| POST my/projects, publish truthy | – | Hiring (is_open_hiring = DB default true) | upsert → `Hiring` |
| PATCH, publish falsy | **any** | Draft | upsert → `Draft` |
| PATCH, publish truthy | **any** | Hiring (is_open_hiring unchanged) | upsert → `Hiring` |
| POST .../publish | Draft only (else 409) | Hiring, is_open_hiring = true | upsert → `Hiring` |
| POST .../close | any | is_open_hiring = false (status unchanged) | update → `Confirmation` |
| POST .../start (other slice) | any but Ongoing | Ongoing, is_open_hiring = false, start_time = now | → `Ongoing` |
| POST .../review (other slice) | Ongoing only | Finished, finish_time = now | → `Finished` |
| DELETE | any but Ongoing (409) | row deleted | cascaded |

`ProjectBoxStatus` values: `Draft`, `Hiring`, `Waiting`, `Confirmation`, `Accepted`, `Rejected`, `Waiting to Start`, `Project Started`, `Ongoing`, `Finished`, `Bail Out`. `project_boxes.status` default `'Waiting'`, with `UNIQUE(project_id, user_id)`.

---

## 7. Storage

### 7.1 Tables touched by this slice
`projects`, `project_skills`, `project_requirements`, `project_reviews`, `project_teams`, `project_team_members`, `project_boxes`, `project_invitations`, `inboxes`, `wishlists`, `leaderboards`, `users`.

Every row created in these tables gets a UUIDv7 `uuid`.

### 7.2 Timestamps
- `projects`, `project_boxes`, `project_invitations`, `inboxes` and `wishlists` have `created_at` and `updated_at`.
- Skills, requirements, reviews, teams, team members and leaderboards have **no timestamps**.

### 7.3 File URL rule (`StoredFile::url`)
- `null` or `""` → `null`.
- A value starting with `http://` or `https://` is passed through (legacy rows).
- Otherwise the value is a disk-relative path, and the URL is `{APP_URL}/storage/{path}`, for example `https://api.host/storage/project-thumbnails/AbC…40.jpg`.
- For R2: keep relative keys in the DB and build absolute URLs at serialisation time from a configured public base. The frontend accepts any absolute URL because images are `unoptimized`.

---

## Shared logic

- **Expertise → project column** (`Expertise::projectColumn`), also the board keys, in this order:

  | Expertise value | Column / board key |
  |---|---|
  | `UI/UX Designer` | `ui_ux_designer` |
  | `Frontend Engineer` | `front_end_engineer` |
  | `Backend Engineer` | `back_end_engineer` |
  | `Data Expert` | `data_expert` |

- **looking_for labels**: the same four display strings, in the same order.
- **ApplicantType**: `Individual`, `Team`, `Individual & Team`.
  - `allowsIndividual` = value ≠ `Team`.
  - `allowsTeam` = value ≠ `Individual`.
  - These are used by the applications slice.
- **ProjectLevel::points**: `Easy` = 2000, `Medium` = 2500, `Hard` = 4000, `Expert` = 5000.
- **ProjectLevel::award(overall, member)**: `(int) round((overall / 5) * (member / 5) * points)`. Both scores are in 0–5, so the result is at most `points`. PHP `round` rounds half away from zero, which equals `Math.round` for non-negative values.
  - Awarded at review time per participant: `leaderboards` firstOrCreate on `(user_id, expertise)` with `points: 0`, then `points += award`.
  - `level_applicant` null or not a valid `ProjectLevel` → no points.
  - `ProjectBoundariesTest::reviewing_cannot_award_more_than_the_level_allows` (Easy, 5/5 → 2000).
- **Level::forPoints(p)**:

  | Points | Level |
  |---|---|
  | `p < 2501` (0–2500) | `Rookie` |
  | `p < 7501` (2501–7500) | `Amateur` |
  | `p < 15001` (7501–15000) | `Superior` |
  | otherwise (≥ 15001) | `Expert` |

  - A user's points = `MAX(leaderboards.points)` over their rows, or 0 when they have none. Users slice: `ProfileStandingTest::points_map_to_a_standing` (boundaries 2500/2501, 7500/7501, 15000/15001) and `::a_profile_reports_the_best_board_not_an_arbitrary_one` (400 and 9000 → 9000, `Superior`).
- **Scopes**:
  - `published`: `status != 'Draft'`.
  - `hiring`: `status = 'Hiring' AND is_open_hiring = 1`.
  - `forExpertise(e)`: `expertise = e ORDER BY points DESC`.
  - `finishedProjects(u)`: `project_boxes WHERE user_id = u AND status = 'Finished'`.
  - `latest()`: `ORDER BY created_at DESC`.
- **Relation orderings**:
  - `project.skills` and `project.requirements`: `ORDER BY id ASC`.
  - `user.leaderboards`: `ORDER BY points DESC, id ASC`.
  - `team.members`: none in Laravel; use `id ASC`.
- **Constants**:
  - Explore page size **9**.
  - Similar **3**.
  - Home latest **6**.
  - Leaderboard default **10**, cap **50**.
  - Thumbnail max **2048 KiB** (`UPLOAD_THUMBNAIL_MAX_KB`).
  - Slug base max **60** chars, suffix **8**.
  - Limits: `title` 255, `description` 20000, `max_person` 50, `currency` 8, `skills` ≤20 items × 50 chars, `requirements` ≤20 items × 255 chars, `query` 255.
- **Is-wished subquery**: `EXISTS (SELECT 1 FROM wishlists w WHERE w.project_id = projects.id AND w.user_id = :viewer AND w.status = 1)`.
- **Search on D1/SQLite**: `lower()` and `LIKE` are ASCII-only for case folding, while prod Postgres is Unicode-aware. Lowercase the term in JS (`toLowerCase()`) to mirror `mb_strtolower`.

---

## Open questions

1. **PATCH rewrites status unconditionally.** Without a truthy `publish`, PATCH demotes Hiring, Ongoing or Finished to `Draft` and resets the lecturer box to `Draft`. With `publish:true`, it moves Ongoing or Finished back to `Hiring`. The frontend's "Save draft" button on a live project triggers the demotion. Replicate exactly, or guard (for example, keep the current status when it is not Draft or Hiring)?
2. **Explicit null on NOT NULL columns gives 500** (§4.4). The frontend's blank "Team size" on create sends `max_person: ""`, which becomes null, which returns 500 in Laravel today. Recommendation: coalesce null to the column default (`'Not Specified'`, `'Individual & Team'`, `'IDR'`, `'0'`, `'person'`, `false`). This would be a documented divergence.
3. **`skills: null` / `requirements: null` give 500.** Treat them as `[]` (clear) or as absent?
4. **Store response comes from the in-memory model.** Unsent columns are `null` and `reward.amount` may be a JSON number. The frontend reads only `project.project_url`. Recommendation: return the fresh DB row, as PATCH and publish do.
5. **`/similar` on a draft slug returns 200** (no draft check), which confirms the draft exists. `show` and wishlist return 404. Replicate, or 404?
6. **The show-draft 404 message leaks the internal integer id** (`... [App\Models\Project] 42`). The frontend reads only the status. Emit the slug form instead?
7. **Ties.** Leaderboards, top boards and every `created_at DESC` list have no tiebreaker in Laravel. Proposed: `points DESC, id ASC` and `created_at DESC, id DESC`.
8. **`limit` quirks on GET leaderboards.** A negative value gives an unbounded board; `0`, `""` or non-numeric values give empty boards. Replicate, or clamp to `[1, 50]`?
9. **POST publish skips the expertise and salary checks** that PATCH-with-publish enforces, so a draft hiring nobody can go live. Intentional?
10. **Re-inviting after a reject or accept is a silent no-op** that still answers "Invitation sent to X.".
11. **Invite creates a `project_teams` row before the project starts.** `team` then serialises as `{uuid, leader: null, members: []}`. The port must replicate this, or the detail payload differs.
12. **Thumbnails are orphaned on project delete** (Laravel never removes the file). Delete the R2 object in the port?
13. **Thumbnail public URL base.** Laravel builds `{APP_URL}/storage/{path}`. What R2 public base should the port use? Legacy absolute URLs must pass through unchanged.
14. **Admin bypass.** `is_admin` passes create, update and delete for any role. An admin student can create projects that the student owner then cannot edit. Keep as is?
15. **Frontend mismatches** (no backend change, but worth knowing):
    - `level_applicant` is a free-text input (placeholder "Beginner"), while the API demands `Easy`/`Medium`/`Hard`/`Expert` and returns 422 `The selected level applicant is invalid.` otherwise.
    - The `ExploreFilters.open_only` type would serialise as `open_only=true`, which returns 422. It is currently never sent.
16. **Empty-message 404** `{"message":""}` on draft wishlist toggles. Keep it byte-identical, or use `"Not Found"`?
17. **Slug transliteration parity.** A JS NFKD plus diacritic strip covers common Latin. Exotic scripts (Cyrillic, CJK) will differ from voku/portable-ascii. Is that acceptable, given that slugs are random-suffixed and never re-derived?
