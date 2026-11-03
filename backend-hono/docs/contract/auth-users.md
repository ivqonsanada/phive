# Contract: auth, users, settings, cross-cutting HTTP

Source of truth: `backend/` (Laravel 13.23, Sanctum 4.3.3, fruitcake/php-cors 1.4, pusher-php-server 7.2.8). Every string in `"quotes"` below is verbatim. "Frontend reads" lists what `frontend/src` actually consumes; the Laravel shape is still the contract.

Production assumptions: `APP_DEBUG=false`, `APP_TIMEZONE=UTC`, `APP_NAME=PHive`, locale `en`, no `lang/` overrides (framework strings apply).

---

## 1. Cross-cutting behaviour

### 1.1 Routing

- `routes/api.php` is mounted under `/api` with the `api` middleware group, which here is only `SubstituteBindings` (no `throttle:api`, no stateful Sanctum, no session, no CSRF).
- `routes/web.php` (`/`, `/auth/{provider}/...`) has the `web` group: cookies, session (`SESSION_DRIVER`, cookie `phive-session`, `SameSite=lax`), CSRF on non-GET (`PreventRequestForgery`).
- `/broadcasting/auth` has only `auth:sanctum` (no `api`/`web` group).
- `/up` is Laravel's health route (HTML "Application up", 200).
- `GET /` → `200 {"name": APP_NAME, "api": "<request root>/api", "health": "<request root>/up", "frontend": FRONTEND_URL[0]}`.
- `/admin` is a Filament panel (session login, `is_admin === true` only; a bearer token does not open it: `AdminPanelTest::an_api_token_does_not_open_the_panel`). Not part of the API contract.

Global middleware, in order: `ValidatePathEncoding`, `InvokeDeferredCallbacks`, `TrustProxies`, `HandleCors`, `PreventRequestsDuringMaintenance`, `ValidatePostSize`, `TrimStrings`, `ConvertEmptyStringsToNull`.

Route middleware is re-sorted by Laravel priority: `Authenticate` → `ThrottleRequests` → `SubstituteBindings` → everything else (e.g. `signed`) in declared order. Consequences:
- `auth:sanctum` 401 comes before throttle counting and before route-model-binding 404.
- On `email/verify`, the throttle hit happens before the signature check (invalid signatures consume the bucket).
- Validation (FormRequest or `$request->validate`) runs inside the controller, after all middleware.

### 1.2 Input normalisation (applies to every request, query + body)

1. `TrimStrings`: every string value (recursively, incl. arrays) is trimmed of leading/trailing whitespace (`\s`, U+FEFF, U+200B, U+200E), **except** keys `current_password`, `password`, `password_confirmation`.
2. `ConvertEmptyStringsToNull`: every `""` (after trimming) becomes `null`, including inside arrays and for password fields.
3. JSON bodies and multipart/form bodies are both accepted. An unparsable JSON body is treated as `{}`.

So `"last_name": "   "` arrives as `null`; `"password": " "` stays `" "`; `"password": ""` becomes `null`.

### 1.3 Authentication (Sanctum bearer tokens)

- Default guard is `sanctum` (`config/auth.php` `defaults.guard`). Sanctum first tries the `web` session guard (never authenticates on API routes, no session there), then the bearer token.
- Token extraction: `Authorization` header; find the **last** case-insensitive occurrence of `"Bearer "`, take everything after it; if it contains `,`, cut at the first `,`.
- Token validity:
  - If the token contains `|`: split at first `|` into `id` and `secret`. `id` must be all digits and `secret` non-empty, else treated as no token. Load `personal_access_tokens` row by id; valid iff `hash_equals(row.token, sha256_hex(secret))`.
  - If no `|`: look up row where `token = sha256_hex(whole token)`.
  - Row must have `expires_at` null or in the future (Laravel always writes null). `config('sanctum.expiration')` is hard-coded `null`: tokens never expire. (`.env.example` documents `SANCTUM_TOKEN_EXPIRATION` but it is not read.)
  - `tokenable` must be a `User`.
- On success: `last_used_at = now()` is written on the token row on every authenticated request.
- Abilities: always `["*"]`; never checked anywhere.
- Token issue format (`createToken(name)`): `plain = TOKEN_PREFIX + random40 + crc32b_hex(random40)` (prefix `SANCTUM_TOKEN_PREFIX`, default `""`; random40 = 40 chars `[A-Za-z0-9]`; crc32b = 8 lowercase hex). Row: `name`, `token = sha256_hex(plain)`, `abilities = ["*"]`, `expires_at = null`. Returned string: `"{row.id}|{plain}"`. The frontend treats it as opaque and stores it in an httpOnly cookie for 30 days.
- `auth:sanctum` failure: `401 {"message": "Unauthenticated."}` (only when the request has `Accept: application/json` or `X-Requested-With: XMLHttpRequest`; otherwise Laravel tries `route('login')`, which does not exist, and returns `500 {"message": "Server Error"}`. The frontend always sends `Accept: application/json`; the port should always return 401.)
- **Public routes** (no `auth` middleware): `$request->user()` resolves the token the same way. A missing, malformed, revoked or unknown token silently yields guest (`null`), never 401. A valid token still updates `last_used_at`.

### 1.4 Error rendering

`bootstrap/app.php`: `shouldRenderJsonWhen(path is 'api/*' or 'broadcasting/*')`. JSON is rendered for those paths regardless of `Accept`; every other path (`/auth/...`, `/`) renders Laravel HTML error pages.

| Case | Status | Body |
|---|---|---|
| `auth:sanctum` with no/invalid token | 401 | `{"message": "Unauthenticated."}` |
| `abort(403)` with no message (experience not owned; broadcast denied) | 403 | `{"message": ""}` |
| `abort_unless(..., 403, 'X')` | 403 | `{"message": "X"}` |
| `signed` middleware failure (bad, missing or expired signature) | 403 | `{"message": "Invalid signature."}` |
| Route-model binding miss | 404 | `{"message": "No query results for model [App\\Models\\User] <value>"}` (literal backslashes in the decoded string, value = raw path segment, no trailing period). Same for `App\\Models\\Experience`. |
| `findOrFail($id)` miss | 404 | `{"message": "No query results for model [App\\Models\\User] <id>"}` |
| No route matches path (incl. failed `whereUuid` constraint) | 404 | `{"message": "The route <path> could not be found."}`, `<path>` has no leading slash, e.g. `api/settings/experiences/abc` |
| Path matches but method does not | 405 | `{"message": "The <METHOD> method is not supported for route <path>. Supported methods: <list>."}` plus `Allow: <list>` header. `<list>` is comma+space joined in order `GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS` filtered to those that match (a GET route contributes `GET, HEAD`). Example: `GET /api/settings/avatar` → `"The GET method is not supported for route api/settings/avatar. Supported methods: POST, DELETE."` |
| Body larger than PHP `post_max_size` (16M, `docker/php.ini`) | 413 | `{"message": "The POST data is too large."}` |
| Validation failure | 422 | `{"message": <summary>, "errors": {<field>: [<msg>, ...], ...}}` |
| Throttle middleware exceeded | 429 | `{"message": "Too Many Attempts."}` + headers (see 1.5) |
| Login lockout | 429 | `{"message": "Too many login attempts. Please try again in <N> seconds.", "errors": {"email": ["Too many login attempts. Please try again in <N> seconds."]}}` (no rate-limit headers) |
| Any other exception | 500 | `{"message": "Server Error"}` |

Notes:
- HttpException-based bodies (403/404/405/413/429) are pretty-printed with unescaped slashes; 401/422 are compact. Irrelevant to JSON clients.
- With `APP_DEBUG=true`, non-validation errors also carry `exception`, `file`, `line`, `trace`. Do not replicate.

**422 summary `message`:** take all messages across all fields in order (fields in rule-declaration order, messages per field in rule order). `message = first`. If `n = total - 1 > 0`, append `" (and 1 more error)"` when n = 1, else `" (and <n> more errors)"`. Example: register with `{}` → `"The first name field is required. (and 3 more errors)"`. A `ValidationException::withMessages` with one message → just that message.

The frontend (`lib/api.ts`) surfaces `payload.message` as the form banner and `payload.errors[field]` under inputs; it keys off status (401 → signed out, 404 → `notFound()`, 422 → validation).

### 1.5 Rate limiting

**Throttle middleware (`throttle:M,D`)**, used with `6,1` (register, password/email, email/verify, email/resend) and `10,1` (auth/exchange):
- Key: `sha1(user.id)` if `$request->user()` resolves (valid bearer token, even on guest routes), else `sha1("|" + clientIp)` (route domain is empty). **The key has no route component: every throttled route shares one counter per client.** Each route compares the shared counter against its own M.
- Fixed window: first hit creates a `:timer` entry expiring in `D*60` s and a counter; later hits increment it. Window does not slide. When the timer is gone, the counter resets.
- Order: check (`counter >= M` and timer alive → 429) then hit (+1), before the controller runs. Every request that passes the check counts, including ones that then fail with 403/422.
- 429 headers: `X-RateLimit-Limit: M`, `X-RateLimit-Remaining: 0`, `Retry-After: <seconds until timer expiry>`, `X-RateLimit-Reset: <unix ts of expiry>`.
- Responses that pass (any status) carry `X-RateLimit-Limit: M` and `X-RateLimit-Remaining: max(0, M - counter)`.
- In practice the frontend calls `register`, `password/email`, `auth/exchange` and `email/verify` **from its server**, without forwarding the browser IP, so Laravel sees the Next server's IP and the whole site shares those buckets.

**Login limiter** (custom, in `LoginController`): key `"login:" + lowercase(email) + "|" + clientIp`; max 5; decay 60 s; same fixed-window algorithm. See `POST /api/login`.

No `RateLimiter::for` named limiters exist. `password/reset` and `login` have no throttle middleware.

### 1.6 CORS (`config/cors.php`, fruitcake/php-cors)

- Applies only to paths matching `api/*`. Not to `/broadcasting/auth`, `/storage/*`, `/auth/*`, `/`.
- `allowed_origins` = `FRONTEND_URL` split on `,`, trimmed, empties dropped (default `http://localhost:3000`). `allowed_origins_patterns` = `FRONTEND_URL_PATTERNS` split the same way (PHP regexes). Methods `*`, headers `*`, exposed none, `max_age` 86400, `supports_credentials` false.
- Preflight (`OPTIONS` + `Access-Control-Request-Method` header): answered before routing (even for non-existent routes, before auth), `204`, empty body:
  - Allow-Origin: if exactly one origin and no patterns → that configured origin, **always**, whatever the request `Origin`. Otherwise → echo request `Origin` only if it is in the list or matches a pattern, and add `Vary: Origin`.
  - Only if Allow-Origin was set: `Access-Control-Allow-Methods: <uppercased Access-Control-Request-Method>`, `Access-Control-Allow-Headers: <Access-Control-Request-Headers verbatim>`, `Access-Control-Max-Age: 86400`, and `Vary` gains `Access-Control-Request-Method`, `Access-Control-Request-Headers`.
- Actual requests: same Allow-Origin logic, added to every `/api/*` response including errors. No `Access-Control-Allow-Credentials`, no `Access-Control-Expose-Headers`.
- The browser only calls public GETs directly (`lib/public-api.ts`, `Accept: application/json` only, so no preflight). Everything authenticated is server-to-server.

### 1.7 Trusted proxies and client IP (`TrustedProxyTest`)

`trustProxies(at: env('TRUSTED_PROXIES', '*'))` with headers X-Forwarded-For/Host/Port/Proto/AWS-ELB. `*` trusts the immediate peer (`REMOTE_ADDR`) only. Client IP = rightmost `X-Forwarded-For` entry that is not the peer; falls back to the peer.
- `the_forwarded_client_address_is_used`: `X-Forwarded-For: 203.0.113.9` → ip `203.0.113.9`.
- `two_clients_behind_one_proxy_are_told_apart`: different XFF → different ip (separate throttle buckets).
- `a_forwarded_https_request_is_recognised_as_secure`: `X-Forwarded-Proto: https` → secure; also affects generated URLs (signed verify URL scheme).
On Workers, the equivalent is `CF-Connecting-IP`.

### 1.8 Password hashing

- `User.password` has cast `hashed`: on assignment, if the value is not already a recognised hash (`password_get_info` algo is null) it is hashed with bcrypt; a value that already looks like a hash is stored verbatim (cost > 12 throws → 500).
- Driver bcrypt, cost `BCRYPT_ROUNDS` (12 in prod, 4 in tests), PHP `$2y$` prefix, 72-byte input limit. `verify=true`: checking against a non-bcrypt stored hash throws → 500.
- `Hash::check(plain, null|"")` → false.
- No rehash-on-login (login does a manual `Hash::check`).
- `password` and `remember_token` are `#[Hidden]`; never serialised.

### 1.9 JSON value formats

- Timestamps/dates (Carbon): `YYYY-MM-DDTHH:mm:ss.SSSSSSZ`, always UTC, **6 fractional digits** (always `.000000`, columns have second precision). Example `"2026-11-04T09:15:02.000000Z"`. `date`-cast columns (experience dates) serialise as midnight UTC: `"2025-01-01T00:00:00.000000Z"`. JS `toISOString()` gives 3 digits; pad to match.
- Backed enums → their string value. Booleans → `true/false`. Counts and points → JSON integers.
- Resources are never wrapped in `data` (`JsonResource::withoutWrapping()`), whether returned directly or nested (`CurrentUserTest::it_returns_the_user_unwrapped`).

### 1.10 Uploads and file serving

- Disk `public` = local `storage/app/public`, URL base `rtrim(APP_URL,'/') + '/storage'`. `php artisan storage:link` symlinks `public/storage` → `storage/app/public`, served as static files by FrankenPHP (no auth, no CORS, content-type by extension).
- Stored value in DB: disk-relative path `"<dir>/<name>"`, never a URL. Directories: avatar `avatars`, CV `cv`, project thumbnail `project-thumbnails` (`MediaTest::the_api_returns_an_absolute_url_not_the_stored_path` pins the `project-thumbnails/` prefix).
- Filename: `Str::random(40)` (`[A-Za-z0-9]`) + `.` + extension guessed **from file content** (finfo MIME → Symfony map: `image/jpeg`→`jpg`, `image/png`→`png`, `image/webp`→`webp`, `application/pdf`→`pdf`). Client filename and client MIME are ignored.
- URL in responses (`StoredFile::url`): null/empty → `null`; value starting `http://` or `https://` (legacy/seeded rows) → returned unchanged; otherwise `APP_URL + "/storage/" + path`. Note: uses `APP_URL`, not the request host.
- Replace (`StoredFile::replace`): delete the old file first (only if it is a disk path that exists; URLs are never deleted), then store the new one. Not transactional.
- Delete (`StoredFile::delete`): delete if path non-empty and exists on disk; silent otherwise.
- Size limits (`config/phive.php` `uploads`, KB, env-overridable): `avatar_max_kb` 1024 (`UPLOAD_AVATAR_MAX_KB`), `cv_max_kb` 4096 (`UPLOAD_CV_MAX_KB`), `thumbnail_max_kb` 2048. `max:N` for files compares `bytes / 1024 <= N`.
- Frontend: `next.config.ts` allow-lists images from `API_URL` host with path `/storage/**`; avatars/thumbnails render with `next/image unoptimized`; CV is a plain link. Keep public URLs at `{API origin}/storage/<path>`.

### 1.11 Mail

Both notifications are Laravel's stock `VerifyEmail` / `ResetPassword`, sent **synchronously** (not queued) as Markdown mail (HTML + text parts) through `MAIL_MAILER` (default `log`), from `MAIL_FROM_ADDRESS` / `MAIL_FROM_NAME` (= `APP_NAME`). Only the URLs are customised (`AppServiceProvider::configureNotificationLinks`). A mail transport failure throws → 500.

Layout (both): header = `APP_NAME` linked to `APP_URL`; greeting `"Hello!"`; intro lines; button; outro lines; salutation `"Regards,"` + line break + `APP_NAME`; subcopy `"If you're having trouble clicking the \"<button text>\" button, copy and paste the URL below\ninto your web browser:"` followed by the URL; footer `"© <year> <APP_NAME>. All rights reserved."`.

**Verify email**
- Subject: `"Verify your email address"`
- Intro: `"Please click the button below to verify your email address."`
- Button: `"Verify Email Address"` → link
- Outro: `"If you did not create an account, no further action is required."`
- Link: `FRONTEND_URL + "/email/verify?" + http_build_query({url: signedApiUrl})`, i.e. `?url=<RFC1738-urlencoded signedApiUrl>` (`:`→`%3A`, `/`→`%2F`, `?`→`%3F`, `=`→`%3D`, `&`→`%26`). `FRONTEND_URL` here = first comma-separated entry, trailing `/` stripped.
- `signedApiUrl` = `URL::temporarySignedRoute('verification.verify', now + 60 min, {id: user.id, hash: sha1(user.email)})`:
  - `expires = unix_ts(now + auth.verification.expire minutes)`; config key absent → 60.
  - `unsigned = <root>/api/email/verify/<user.id>/<sha1_hex(email)>?expires=<expires>` where `<root>` is the **current request's** scheme+host(+port) as Laravel sees it (forwarded headers trusted), because the mail is built inside the register/resend request. `id` is the internal integer PK.
  - `signature = hmac_sha256_hex(key = raw config('app.key') string, e.g. "base64:…" not decoded, msg = unsigned)`.
  - `signedApiUrl = unsigned + "&signature=" + signature`.
- Frontend (`app/(auth)/email/verify/page.tsx`): rejects any `url` that does not start with `` `${API_URL}/api/email/verify/` `` (frontend env `API_URL`), then `fetch(url, {Accept: application/json})` server-side with no token and only checks `response.ok`. So the host in the link must equal the frontend's `API_URL` exactly.

**Reset password**
- Subject: `"Reset your password"`
- Intro: `"You are receiving this email because we received a password reset request for your account."`
- Button: `"Reset Password"` → link
- Outro 1: `"This password reset link will expire in 60 minutes."` (`auth.passwords.users.expire`)
- Outro 2: `"If you did not request a password reset, no further action is required."`
- Link: `FRONTEND_URL + "/password/reset?" + http_build_query({token, email})` → `?token=<64 hex>&email=<RFC1738-urlencoded email>` (`@`→`%40`, space→`+`). Pinned by `PasswordResetTest::it_emails_a_reset_link_pointing_at_the_frontend` (prefix `FRONTEND_URL + "/password/reset?"`).
- Frontend `password/reset` page reads `token` and `email` from the query and posts them back to `POST /api/password/reset`.

### 1.12 Validation semantics (Laravel rules as used here)

- Rules for an attribute all run in order; there is no `bail`. Exception: once an implicit rule (`required`) fails, the rest are skipped. A field can therefore carry several messages.
- A non-implicit rule is skipped when the key is absent. When the key is present with `null`: skipped only if the field has `nullable`; otherwise every rule runs against null and usually fails (e.g. `tagname: null` → `["The tagname field must be a string.", "The tagname field must be at least 3 characters.", "Handles may only contain lowercase letters, numbers and underscores."]`).
- `sometimes`: rules apply only if the key is present.
- Validated output contains only keys that were present in input (even `nullable` ones). Absent → untouched; explicit `null` → write null.
- Attribute name in messages: the key with `_` → space (`first_name` → `first name`); array elements keep the raw key (`skills.0`).
- Message templates:
  - `required` → `"The :attribute field is required."`
  - `string` → `"The :attribute field must be a string."`
  - `email` → `"The :attribute field must be a valid email address."` (RFC validation via egulias; accepts e.g. `a@b`)
  - `max` (string) → `"The :attribute field must not be greater than :max characters."`; (array) `"The :attribute field must not have more than :max items."`; (file) `"The :attribute field must not be greater than :max kilobytes."`
  - `min` (string) → `"The :attribute field must be at least :min characters."` (length = mb_strlen)
  - `unique` → `"The :attribute has already been taken."`
  - `regex` → `"The :attribute field format is invalid."`
  - `confirmed` → `"The :attribute field confirmation does not match."` (compares `<field>_confirmation`; error is on `<field>`)
  - `Rule::enum` → `"The selected :attribute is invalid."` (exact, case-sensitive backing value)
  - `current_password` → `"The password is incorrect."`
  - `url` → `"The :attribute field must be a valid URL."`
  - `boolean` → `"The :attribute field must be true or false."` (accepts only `true, false, 0, 1, "0", "1"`)
  - `array` → `"The :attribute field must be an array."`
  - `date` → `"The :attribute field must be a valid date."` (strtotime-parsable)
  - `after_or_equal:start_date` → `"The :attribute field must be a date after or equal to start date."`
  - `file` → `"The :attribute field must be a file."`; `image` → `"The :attribute field must be an image."` (content-sniffed ext in jpg,jpeg,png,gif,bmp,webp; no svg); `mimes:a,b` → `"The :attribute field must be a file of type: a, b."` (content-sniffed extension; `jpg`/`jpeg` interchangeable); `uploaded` → `"The :attribute failed to upload."`
- `Password::defaults()` is never configured, so it is `Password::min(8)` = rules `string`, `min:8` → `"The password field must be a string."`, `"The password field must be at least 8 characters."`.

---

## 2. Resources

### 2.1 `UserResource` (full user)

Keys in this order. "always" = present on every response that uses UserResource.

| Key | Type | Source / rule |
|---|---|---|
| `uuid` | string | `users.uuid` (UUIDv7, lowercase) |
| `tagname` | string\|null | `users.tagname` (nullable column, always set in practice) |
| `first_name` | string | |
| `last_name` | string | `""` when absent |
| `name` | string | `trim(first_name + " " + last_name)` |
| `role` | `"Student"`\|`"Lecturer"` | |
| `email` | string | **exposed publicly too** (`GET /api/users/{tagname}`) |
| `email_verified` | bool | `email_verified_at !== null` |
| `identity_number` | string\|null | also public |
| `photo_url` | string\|null | `StoredFile::url(users.photo_url)` |
| `expertise` | `"UI/UX Designer"`\|`"Frontend Engineer"`\|`"Backend Engineer"`\|`"Data Expert"`\|null | |
| `university`, `faculty`, `major`, `location`, `biography` | string\|null | |
| `is_open_hired` | bool (see register quirk: `null` there) | boolean cast |
| `cv_url` | string\|null | `StoredFile::url(users.cv_url)` |
| `links` | object, always | `{behance, github, linkedin, dribbble, website}` each string\|null, always all five keys in this order |
| `skills` | string[] | only when `skills` relation loaded. `user_skills.name` ordered by `user_skills.id ASC` |
| `experiences` | object[] | only when loaded. Ordered `start_date DESC` (ties unordered). Each `{uuid, project_name, project_role, start_date, end_date}`; dates ISO (1.9), `end_date` null = ongoing |
| `leaderboards` | object[] | only when loaded. Ordered `points DESC, id ASC`. Each exactly `{uuid, expertise, points}` (`ProfileStandingTest::the_board_rows_never_carry_the_internal_id` pins the key list) |
| `points` | int | only when `leaderboards` loaded. `max(points)` over the user's boards, `0` if none |
| `level` | `"Rookie"`\|`"Amateur"`\|`"Superior"`\|`"Expert"` | only when `leaderboards` loaded. `Level::forPoints(points)` (section 4) |
| `unread_inbox_count` | int | only on `GET /api/user`: `count(inboxes where recipient_id = user.id and is_read = false)` |
| `created_at` | ISO string | |

Never present: `id`, `password`, `remember_token`, `is_admin`, `email_verified_at`, `updated_at` (`CurrentUserTest::it_never_exposes_the_password_hash`, `ProfileTest::it_includes_skills_and_hides_the_password`).

Which conditional keys appear per endpoint:

| Endpoint | skills | experiences | leaderboards/points/level | unread_inbox_count |
|---|---|---|---|---|
| `GET /api/user` | yes | yes | yes | yes |
| `GET /api/users/{tagname}` | yes | yes | yes | no |
| `PATCH /api/settings/profile` | yes | yes | yes | no |
| register, login, auth/exchange, avatar upload, cv upload | no | no | no | no |

Lecturers get `points: 0`, `level: "Rookie"` too when leaderboards are loaded.

### 2.2 `UserSummaryResource` (embedded author/member card)

Order: `uuid`, `tagname`, `first_name`, `last_name`, `name`, `role`, `photo_url` (via `StoredFile::url`), `expertise`, `finished_project_count` (int; only when the query did `withCount('finishedProjects')` = count of the user's `project_boxes` with `status = "Finished"`; never in this slice's endpoints).

### 2.3 Experience (standalone, `ExperienceController::present`)

`{uuid, project_name, project_role, start_date, end_date}`, same formats as in 2.1.

### 2.4 `ProjectResource` as embedded by `GET /api/users/{tagname}`

Only `user` is eager-loaded there, so `skills`, `requirements`, `team`, `review`, `is_wished` and `user.finished_project_count` are absent. Keys in order:
`uuid` string; `title` string\|null; `description` string\|null; `project_url` string\|null; `status` `"Draft"|"Hiring"|"Ongoing"|"Finished"`; `thumbnail` (`StoredFile::url(projects.thumbnail)`) string\|null; `applicant_type` `"Individual"|"Team"|"Individual & Team"`; `max_person` string; `level_applicant` string\|null; `looking_for` string[] built in this fixed order from booleans: `ui_ux_designer`→`"UI/UX Designer"`, `front_end_engineer`→`"Frontend Engineer"`, `back_end_engineer`→`"Backend Engineer"`, `data_expert`→`"Data Expert"`; `reward` `{certificate: bool, salary: bool, currency: string, amount: string (projects.salary_amount), payment_type: string}`; `is_open_hiring` bool; `start_time` ISO\|null; `finish_time` ISO\|null; `created_at` ISO; `user` UserSummary. (Full ProjectResource belongs to the projects contract.)

---

## 3. Endpoints

### POST /api/register

- Middleware: `throttle:6,1` (shared bucket, 1.5). Guest route (a token, if sent, only changes the throttle key).
- Validation (`RegisterRequest`), in order:
  - `first_name`: `required`, `string`, `max:255`
  - `last_name`: `nullable`, `string`, `max:255`
  - `role`: `required`, `Rule::enum(UserRole)` → `"Student"` or `"Lecturer"`
  - `email`: `required`, `string`, `email`, `max:255`, `unique:users,email` (exact match), plus `regex:<LECTURER_EMAIL_PATTERN>` **only if** raw input `role === "Lecturer"` and the pattern is non-empty. Default pattern `/^[a-zA-Z0-9._%+-]+@(?!.*student).*\.ac\.id$/` (case-sensitive; domain part must not contain `student`, must end `.ac.id`).
  - `password`: `required`, `confirmed`, `Password::defaults()` (string, min 8)
  - Custom message: `email.regex` → `"Lecturer accounts require a non-student academic email address."`
  - Any other keys (e.g. `is_admin`) are ignored (`PrivilegeEscalationTest::registering_cannot_grant_the_admin_flag`).
- Behaviour (no transaction):
  1. Insert user: `first_name`, `last_name = last_name ?? ""`, `role`, `email`, `password` (bcrypt), `tagname = Tagname::generate(trim(first_name + " " + last_name))` (section 4), `uuid` = UUIDv7. `email_verified_at` null, `is_admin` false (DB default).
  2. Fire `Registered` → sends Verify email (1.11) synchronously because the user is unverified.
  3. Create token named `device_name` input if the key is present (unvalidated here), else `"phive-web"`.
- Response `201`: `{"user": UserResource (no relations), "token": "<id>|<plain>"}`.
  - Quirk: the user model is the freshly created one, so DB defaults are not loaded: `is_open_hired` is `null` (not `false`); `identity_number`, `photo_url`, `expertise`, etc. `null`; `email_verified` `false`.
- Errors: 422 per rules; 429 throttle; 500 if mail sending fails (user row already created).
- Frontend reads: `token` only (stored in cookie, then redirect `/newcomer/1`). Sends `first_name, last_name, role, email, password, password_confirmation`, no `device_name`.
- Tests: `RegistrationTest::it_registers_a_student_and_returns_an_api_token` (201, `user.email`, `user.role: "Student"`, structure `token`, `user.{uuid,tagname,name}`, 1 token, VerifyEmail sent); `it_rejects_a_lecturer_signing_up_with_a_student_address` (`grace@student.example.ac.id` → 422 on `email`); `it_accepts_a_lecturer_with_a_staff_academic_address` (`grace@example.ac.id` → 201, role Lecturer); `it_gives_colliding_names_distinct_tagnames`.

### POST /api/login

- Middleware: none (no throttle middleware).
- Validation (`LoginRequest`): `email`: `required`, `string`, `email`; `password`: `required`, `string`; `device_name`: `nullable`, `string`, `max:255`. Runs **before** the lockout check, so a malformed request returns 422 even when locked out.
- Behaviour:
  1. `key = "login:" + lowercase(email) + "|" + clientIp`.
  2. If attempts(key) ≥ 5 and window alive → **429** `{"message": "Too many login attempts. Please try again in <N> seconds.", "errors": {"email": [same]}}`, N = seconds until the window (started by the first failure) ends, ≥ 0. Checked before credentials, so even the right password is refused.
  3. `user = users where email = <email as sent, trimmed>` (exact, case-sensitive; only the limiter key is lowercased).
  4. If no user, or `user.password` null (social-only account), or bcrypt mismatch → hit(key, 60 s) → **422** `{"message": "These credentials do not match our records.", "errors": {"email": ["These credentials do not match our records."]}}`.
  5. Success → clear key; create token named: `"phive-web"` if `device_name` key absent; the given string if present; `""` if present but null/empty.
- Response `200`: `{"user": UserResource (no relations; fresh DB row so `is_open_hired` is bool), "token": "<id>|<plain>"}`.
- Frontend reads: `token`. Sends `email, password, device_name: "phive-web"`.
- Tests: `LoginTest::it_issues_a_token_for_valid_credentials` (200, `user.uuid`, token name `integration-test`); `it_rejects_a_wrong_password` (422, error on `email`, no token); `it_throttles_repeated_failures` (5 failures then the 6th → 429).

### POST /api/logout

- Middleware: `auth:sanctum`.
- Behaviour: delete the `personal_access_tokens` row that authenticated this request. Other tokens untouched.
- Response `200`: `{"message": "Signed out."}`.
- Errors: 401.
- Frontend: fire-and-forget, then deletes its cookie.
- Tests: `LoginTest::logging_out_revokes_only_the_current_token` (1 token left; old token → 401 on `/api/user`; other → 200).

### GET /api/user

- Middleware: `auth:sanctum`.
- Behaviour: load `skills`, `experiences`, `leaderboards`, and `unread_inbox_count` (unread inbox rows where `recipient_id = user.id`).
- Response `200`: UserResource, top-level (no `data`, no `user` wrapper), with all conditional keys (2.1).
- Errors: 401 `{"message": "Unauthenticated."}` (`LoginTest::the_user_endpoint_requires_a_token`).
- Frontend reads (session bootstrap `lib/dal.ts`, 401 → treated as signed out): `uuid` (private channel name), `tagname`, `name`, `first_name`, `last_name`, `role`, `email`, `email_verified`, `unread_inbox_count`, `photo_url`, `cv_url`, `identity_number`, `university`, `faculty`, `major`, `location`, `expertise`, `biography`, `is_open_hired`, `skills`, `links.*`, `experiences[].{uuid,project_name,project_role,start_date,end_date}`. `first_name` must be a string (`.toLowerCase()` is called on it).
- Tests: `CurrentUserTest::it_returns_the_user_unwrapped` (`tagname`, `name: "Ada Lovelace"`, `skills.0`, no `data`); `it_counts_only_unread_inbox_items` (`unread_inbox_count: 0`); `it_never_exposes_the_password_hash`.

### PATCH /api/settings/password

- Middleware: `auth:sanctum`. No throttle.
- Validation (inline): `current_password`: `required`, `current_password` (bcrypt check against the authenticated user's hash; a null hash always fails); `password`: `required`, `confirmed`, `Password::defaults()`.
  - Example failure: `{"message": "The password is incorrect. (and 2 more errors)", "errors": {"current_password": ["The password is incorrect."], "password": ["The password field confirmation does not match.", "The password field must be at least 8 characters."]}}`.
- Behaviour: set `password` (bcrypt); delete every token of the user **except** the current one. `remember_token` not changed.
- Response `200`: `{"message": "Password updated."}`.
- Social-only accounts (null password) cannot use this; they must use the reset flow.
- Frontend: ignores body on success.
- Tests: `PasswordResetTest::changing_the_password_keeps_the_current_device_signed_in`.

### POST /api/password/email

- Middleware: `throttle:6,1`.
- Validation: `email`: `required`, `email` (no `string`).
- Behaviour (wrapped in a ~200 ms minimum-duration timebox):
  1. Look up user by exact email. None → stop silently.
  2. If a `password_reset_tokens` row for this email has `created_at` within the last 60 s (`throttle`) → stop silently.
  3. Delete existing rows for the email; `token = hmac_sha256_hex(key = APP_KEY with "base64:" prefix decoded, msg = Str::random(40))` (64 hex); insert `{email, token: bcrypt(token), created_at: now}`.
  4. Send Reset email (1.11) with the plain token.
- Response `200` always (unknown address, throttled, sent): `{"message": "If that address belongs to an account, a reset link is on its way."}`.
- Errors: 422, 429.
- Frontend reads: `message` (shown as success).
- Tests: `PasswordResetTest::it_emails_a_reset_link_pointing_at_the_frontend`; `it_does_not_reveal_whether_an_address_exists` (exact message above).

### POST /api/password/reset

- Middleware: none (no throttle).
- Validation: `token`: `required`, `string`; `email`: `required`, `email`; `password`: `required`, `confirmed`, `Password::defaults()`.
- Behaviour (timeboxed):
  1. User by exact email. None → **422** `{"message": "We can't find a user with that email address.", "errors": {"email": ["We can't find a user with that email address."]}}`. (Unlike `password/email`, this reveals existence.)
  2. Row for email missing, `created_at + 3600 s` past, or `bcrypt_verify(token, row.token)` false → **422** `{"message": "This password reset token is invalid.", "errors": {"email": ["This password reset token is invalid."]}}`. Row is not deleted on failure.
  3. Success: set `password` (bcrypt) and `remember_token = Str::random(60)`, save; **delete all Sanctum tokens** of the user; fire `PasswordReset`; delete the reset row(s) for the email. Does not mark the email verified.
- Response `200`: `{"message": "Your password has been reset."}`.
- Frontend: ignores body, redirects `/login?reset=1`; sends `token, email, password, password_confirmation`.
- Tests: `PasswordResetTest::it_resets_the_password_and_revokes_existing_tokens` (new hash checks; old token → 401).

### GET /api/email/verify/{id}/{hash}

- Route name `verification.verify`. Middleware (effective order): `throttle:6,1` → `signed` (absolute).
- `signed` check: rebuild `request.url()` (scheme://host[:port]/path as seen through trusted proxies, no query) + `"?"` + the raw query string with every `signature=` parameter removed (order preserved), trailing `?` stripped; valid iff `query.signature` is a string equal (constant-time) to `hmac_sha256_hex(APP_KEY raw string, that URL)` for the current or any `APP_PREVIOUS_KEYS` key, and (`expires` absent or `now <= expires`). Else **403** `{"message": "Invalid signature."}`.
- Behaviour:
  1. `User::findOrFail(id)` → 404 `"No query results for model [App\\Models\\User] <id>"`.
  2. `hash_equals(hash, sha1_hex(user.email))` else **403** `{"message": "Invalid verification link."}`.
  3. Already verified → **200** `{"message": "Email already verified."}`.
  4. Set `email_verified_at = now`, fire `Verified` → **200** `{"message": "Email verified."}`.
- Frontend: server-side fetch of the exact URL from the email, no token, checks only `response.ok`.
- Tests: `EmailVerificationTest::a_signed_link_verifies_the_address`; `an_unsigned_link_is_rejected` (403); `a_link_for_a_different_address_is_rejected` (valid signature, wrong hash → 403).

### POST /api/email/resend

- Middleware: `auth:sanctum`, `throttle:6,1` (keyed by user id).
- Behaviour: verified → **200** `{"message": "Email already verified."}`; else send Verify email (1.11, new signed URL, new 60 min expiry) → **200** `{"message": "Verification link sent."}`.
- Errors: 401, 429, 500 on mail failure.
- Frontend reads: `message` (dashboard banner, shown only when `email_verified` is false).

### POST /api/auth/exchange

- Middleware: `throttle:10,1` (shared counter, 1.5). Called by the Next server, not the browser.
- Validation: `code`: `required`, `string`.
- Behaviour:
  1. `key = "social-login:" + sha256_hex(code)`; read the cache entry, then delete it (single use; read-then-delete, not atomic).
  2. Missing/expired (TTL 120 s) → **422** `{"message": "That sign-in link has expired."}` (no `errors` key).
  3. `User::find(payload.user_id)` missing → **422** `{"message": "That account no longer exists."}` (no `errors` key).
- Response `200`: `{"user": UserResource (fresh row, no relations), "token": payload.token}` (the token minted during the callback, name `"phive-web-<provider>"`).
- Frontend reads: `token`; any non-2xx shows "That sign-in link expired".
- Tests: `SocialLoginTest::the_code_exchanges_for_a_token_exactly_once` (200 then 422); `an_unknown_code_is_refused` (64×`a` → 422); `a_code_cannot_be_redeemed_after_the_user_is_gone` (422); `the_exchanged_token_actually_authenticates`.

### GET /auth/{provider}/redirect  (web route, not under /api)

- `{provider}` constrained to `google|apple`; anything else → route 404 (HTML) (`SocialLoginTest::an_unknown_provider_is_a_404`).
- Provider configured iff `services.<provider>.client_id` is non-empty, else **503** HTML with message `"Google sign-in is not configured."` / `"Apple sign-in is not configured."` (`an_unconfigured_provider_is_unavailable`).
- Query `role`: `UserRole::tryFrom(role)` (exact `"Student"`/`"Lecturer"`), else `"Student"`; stored in session `social_role`.
- Response: `302` to the provider via Socialite with a random `state` stored in the session. Google: `https://accounts.google.com/o/oauth2/auth`, scopes `openid profile email`, `response_type=code`, `redirect_uri = GOOGLE_REDIRECT_URI ?? APP_URL + "/auth/google/callback"`. Apple: scopes `name email`, `response_mode=form_post`, `redirect_uri = APPLE_REDIRECT_URI ?? APP_URL + "/auth/apple/callback"`.
- Frontend: plain `<a href="{API_URL}/auth/{id}/redirect[?role=Student]">` (register page passes `role=Student`, login page none). Buttons shown per frontend env `SOCIAL_PROVIDERS`.

### GET|POST /auth/{provider}/callback  (web route)

- Same provider constraint/503 as above. `FRONTEND = FRONTEND_URL[0]`.
- Behaviour, in order:
  1. Fetch the provider user (code exchange + state check). Any exception (state mismatch, denied consent, network) → `302` `FRONTEND + "/login?error=social"`.
  2. Blank email → `302` `FRONTEND + "/login?error=social_no_email"` (`a_provider_without_an_email_is_refused`; no user created; session role not consumed).
  3. `intendedRole = tryFrom(session.pull("social_role")) ?? Student`.
  4. Resolve user:
     - `social_accounts` row with `(provider, provider_id)` → its user. Done.
     - Else, in a transaction: `user = users where email = providerEmail` (exact). If none, create: `[first, last] = splitName(trim(name), nickname)`, `email`, `role = allowedRole(intendedRole, email)`, `tagname = Tagname::generate(trimmedName ?: email)`, `password = null`; then set `email_verified_at = now` (new users only). Then insert `social_accounts {user_id, provider, provider_id, avatar}`. An existing user found by email is linked as-is: **not** marked verified, role unchanged. Unique `(user_id, provider)` collision (same email, different provider account) → 500.
  5. `token = createToken("phive-web-" + provider)`; `code = Str::random(64)` (`[A-Za-z0-9]`); cache `"social-login:" + sha256_hex(code)` → `{user_id, token}` for 120 s.
  6. `302` `FRONTEND + "/auth/callback?code=" + code`. Only `code` in the query (`the_token_never_appears_in_the_redirect_url`).
- `allowedRole`: intended ≠ Lecturer → Student; Lecturer → Lecturer if pattern empty or `preg_match(pattern, email)`, else Student (`choosing_lecturer_with_a_personal_address_falls_back_to_student`, `choosing_lecturer_with_an_academic_address_is_honoured`).
- `splitName(name, nickname)`: name `""` → `[nickname ?: "New", "User"]`; else split on `/\s+/`, first part = first name, rest joined with single spaces = last name (may be `""`).
- Tests: `SocialLoginTest::a_first_time_sign_in_creates_a_verified_account` (`"Ada Lovelace"` → first `Ada`, last `Lovelace`, Student, verified, null password, row in `social_accounts`, redirect contains `FRONTEND/auth/callback?code=`); `signing_in_again_reuses_the_same_account`; `it_links_to_an_existing_account_with_the_same_email`.
- Frontend: `/auth/callback` page posts `code` to `/api/auth/exchange`; missing `code` → `/login?error=social`.

### GET /api/users/{tagname}

- Middleware: none (public; token optional and unused). Binding: `User` by `tagname` (exact). Miss → **404** `{"message": "No query results for model [App\\Models\\User] <tagname>"}` (`ProfileTest::an_unknown_tagname_is_a_404`).
- Behaviour: load `skills`, `experiences`, `leaderboards`. `projects`:
  - Student: projects with `status != "Draft"` that have a `project_boxes` row with `user_id = profile user` and `status = "Finished"`, each with its `user` (author), ordered `created_at DESC`.
  - Lecturer: projects with `status != "Draft"` and `user_id = profile user`, with `user`, ordered `created_at DESC`.
- Response `200`: `{"user": UserResource (skills, experiences, leaderboards, points, level; no unread_inbox_count), "projects": [ProjectResource 2.4, ...]}`.
- Frontend reads (`u/[tagname]/page.tsx`, browser via `publicApi` or server via `api` with token): `user.{photo_url, name, expertise, role, points, level, tagname, links, biography, skills, experiences[], cv_url, first_name, uuid}`, `projects[]` (ProjectCard). 404 → Next `notFound()`.
- Tests: `ProfileTest::a_lecturer_profile_lists_the_projects_they_published` (2 projects); `a_student_profile_lists_only_finished_work` (Finished box counts, Ongoing does not); `it_includes_skills_and_hides_the_password`; `ProfileStandingTest::a_profile_reports_the_best_board_not_an_arbitrary_one` (boards 400 and 9000 → `points: 9000`, `level: "Superior"`, `leaderboards.0.points: 9000`, `leaderboards.1.points: 400`); `a_student_with_no_boards_has_no_points_and_is_a_rookie` (`points: 0`, `level: "Rookie"`, `leaderboards: []`).

### PATCH /api/settings/profile

- Middleware: `auth:sanctum` (guest → 401, `Settings/ProfileTest::guests_cannot_update_a_profile`).
- Validation (`UpdateProfileRequest`), all `sometimes` (partial update):
  - `first_name`: `sometimes`, `string`, `max:255`
  - `last_name`: `sometimes`, `nullable`, `string`, `max:255`
  - `tagname`: `sometimes`, `string`, `min:3`, `max:30`, `regex:/^[a-z0-9_]+$/`, `unique:users,tagname` ignoring the current user's row. Custom `tagname.regex` → `"Handles may only contain lowercase letters, numbers and underscores."`
  - `identity_number`: `sometimes`, `nullable`, `string`, `max:50`
  - `expertise`: `sometimes`, `nullable`, `Rule::enum(Expertise)`
  - `university`, `faculty`, `major`, `location`: `sometimes`, `nullable`, `string`, `max:255`
  - `biography`: `sometimes`, `nullable`, `string`, `max:5000`
  - `is_open_hired`: `sometimes`, `boolean`
  - `behance`, `github`, `linkedin`, `dribbble`, `website`: `sometimes`, `nullable`, `url`, `max:255`
  - `skills`: `sometimes`, `array`, `max:30`; `skills.*`: `string`, `max:50` (errors keyed `skills.<i>`, e.g. `"The skills.0 field must be a string."`)
  - Not accepted, silently ignored even if sent: `role`, `is_admin`, `email`, `password`, `email_verified_at`, `points` (`PrivilegeEscalationTest`: each returns 200 and the column is unchanged; no leaderboard row created).
- Behaviour, in one transaction:
  1. Update the user with every validated key except `skills` (absent keys untouched; explicit null clears nullable ones). Note: `last_name: null` (or `""`) passes validation but `users.last_name` is NOT NULL → DB error → **500** in Laravel.
  2. If the request **has** the `skills` key: delete all `user_skills` of the user, then insert each distinct value of `skills` (PHP `array_unique`, first occurrence wins, original order) one row per name. `skills: []` clears them.
- Response `200`: `{"message": "Profile updated.", "user": UserResource (fresh; skills, experiences, leaderboards, points, level)}`.
- Frontend reads: `user.tagname` (for revalidation); on error `message`/`errors`. It sends only fields the form rendered; required text fields trimmed, nullable ones as `value || null`, `is_open_hired` boolean, `skills` as a string array (non-empty lines).
- Tests: `Settings/ProfileTest::a_user_can_update_their_profile` (`user.biography`, `user.links.github`); `omitted_fields_are_left_alone`; `skills_are_replaced_as_a_whole_list` (`["React","Postgres"]`, 2 rows); `a_handle_must_be_unique_and_url_safe` (`taken` → 422, `Not Valid!` → 422 on `tagname`); `keeping_your_own_handle_is_not_a_conflict`; `links_must_be_urls` (`"not a url"` → 422 on `website`).

### POST /api/settings/avatar

- Middleware: `auth:sanctum`. Multipart.
- Validation: `file`: `required`, `image`, `mimes:jpeg,jpg,png,webp`, `max:<avatar_max_kb>` (1024). Messages: `"The file field is required."`, `"The file field must be an image."`, `"The file field must be a file of type: jpeg, jpg, png, webp."`, `"The file field must not be greater than 1024 kilobytes."` (value follows config).
- Behaviour: `photo_url = StoredFile::replace(old photo_url, file, "avatars")` (old file deleted first), update user.
- Response `200`: `{"message": "Avatar updated.", "user": UserResource (fresh, no relations)}`.
- Frontend: ignores body; sends multipart field `file`.
- Tests: `Settings/MediaTest::a_user_can_upload_and_remove_an_avatar` (`user.photo_url` is a string; file exists); `replacing_an_avatar_deletes_the_old_file`; `an_avatar_must_be_an_image` (`virus.exe` → 422 on `file`); `an_oversized_avatar_is_rejected` (limit 100 KB, 500 KB file → 422).

### DELETE /api/settings/avatar

- Middleware: `auth:sanctum`.
- Behaviour: `StoredFile::delete(photo_url)` (silent if none/URL), set `photo_url = null`.
- Response `200`: `{"message": "Avatar removed."}` (also when there was no avatar).

### POST /api/settings/cv

- Middleware: `auth:sanctum`. Multipart.
- Validation: `file`: `required`, `file`, `mimes:pdf`, `max:<cv_max_kb>` (4096). Messages: `"The file field must be a file."`, `"The file field must be a file of type: pdf."`, `"The file field must not be greater than 4096 kilobytes."`.
- Behaviour: `cv_url = StoredFile::replace(old cv_url, file, "cv")`.
- Response `200`: `{"message": "CV updated.", "user": UserResource (fresh, no relations)}`.
- Tests: `Settings/MediaTest::a_cv_must_be_a_pdf` (png → 422; pdf → 200, file exists).

### DELETE /api/settings/cv

- Middleware: `auth:sanctum`.
- Behaviour: delete stored file, `cv_url = null`.
- Response `200`: `{"message": "CV removed."}`.

### POST /api/settings/experiences

- Middleware: `auth:sanctum`.
- Validation (shared with PATCH): `project_name`: `required`, `string`, `max:255`; `project_role`: `required`, `string`, `max:255`; `start_date`: `required`, `date`; `end_date`: `nullable`, `date`, `after_or_equal:start_date`.
- Behaviour: insert `{uuid, user_id: current user, project_name, project_role, start_date, end_date}` (dates stored as dates; absent `end_date` → null).
- Response `201`: `{"experience": {uuid, project_name, project_role, start_date, end_date}}` (dates ISO midnight UTC).
- Frontend: ignores body; sends `project_name, project_role, start_date (YYYY-MM-DD), end_date || null`.
- Tests: `Settings/ExperienceTest::a_user_can_add_edit_and_remove_an_experience` (201, `experience.uuid`); `an_end_date_cannot_precede_the_start` (422 on `end_date`).

### PATCH /api/settings/experiences/{uuid}

- Middleware: `auth:sanctum`. Route constraint `whereUuid` (`[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}`); non-match → 404 `"The route api/settings/experiences/<x> could not be found."`. Binding by `experiences.uuid`; miss → 404 `"No query results for model [App\\Models\\Experience] <uuid>"`.
- Order: 401 → 404 → ownership → validation.
- Authorization: `experience.user_id === current user id` else **403** `{"message": ""}`.
- Validation: same rules as POST; all `required` fields must be sent again (PATCH behaves like PUT for them). `end_date` absent → unchanged; `null` → cleared.
- Behaviour: update, then re-read from DB.
- Response `200`: `{"experience": {...}}`.
- Tests: `ExperienceTest::a_user_can_add_edit_and_remove_an_experience` (`experience.project_name: "Campus App v2"`); `you_cannot_touch_someone_elses_experience` (403, row unchanged).

### DELETE /api/settings/experiences/{uuid}

- Same middleware, binding, 404s and ownership 403 as PATCH.
- Behaviour: delete the row.
- Response `200`: `{"message": "Experience removed."}`.
- Tests: as above (403 for intruder; row gone for owner).

### GET|POST /broadcasting/auth  (not under /api)

- Registered by `withBroadcasting(routes/channels.php, attributes: ['middleware' => ['auth:sanctum']])` → `Route::match(['get','post'], '/broadcasting/auth')`. No CORS, no throttle. JSON errors (path `broadcasting/*`).
- Input (JSON, form or query): `socket_id`, `channel_name`.
- Behaviour (Pusher/Reverb broadcaster):
  1. Unauthenticated → **401** `{"message": "Unauthenticated."}` (`BroadcastAuthorizationTest::a_guest_cannot_subscribe_to_anything`).
  2. `channel_name` empty → **403** `{"message": ""}`.
  3. Strip the first matching prefix of `private-encrypted-`, `private-`, `presence-`. Match against the only channel `user.{uuid}` (regex `^user\.([^.]+)$`). No match → **403** `{"message": ""}`.
  4. Callback: `user.uuid === <captured uuid>` (strict string compare). False → **403** `{"message": ""}` (`a_user_cannot_subscribe_to_someone_elses_channel`, `an_unknown_channel_is_refused`, `the_internal_id_is_not_a_valid_channel_key`).
  5. `channel_name` starting with `private`: validate `channel_name` against `/\A#?[-a-zA-Z0-9_=@,.;]+\z/` and `socket_id` against `/\A\d+\.\d+\z/` (failure → 500 `"Server Error"`); return **200** `{"auth": "<REVERB_APP_KEY>:<hmac_sha256_hex(REVERB_APP_SECRET, socket_id + ":" + channel_name)>"}` (`a_user_can_subscribe_to_their_own_channel` asserts key `auth`). `channel_name` is the full name including `private-`.
  6. Unprefixed `user.<uuid>` (not guarded) also reaches the callback and gets a presence-style answer `{"auth": ..., "channel_data": "{\"user_id\":<internal id>,\"user_info\":true}"}`. Unused; do not replicate.
- With `BROADCAST_CONNECTION=null|log` the null broadcaster returns an empty 200.
- Frontend: browser Echo (`pusher-js`, broadcaster `reverb`) calls Next `POST /api/broadcasting/auth` (form fields), which forwards to `{API_URL}/broadcasting/auth` as JSON with the bearer token and returns the JSON untouched; non-OK → `{"message": "Channel authorisation failed."}` with the same status. Channel subscribed: `private-user.<viewer uuid>`, event `.message.sent`.

---

## 4. Shared logic

**Tagname::generate(name)**
```
base = Str::slug(name, separator = "")         # see below
base = base == "" ? "user" : base
base = lowercase(first 20 chars of base)       # Str::limit(base, 20, ""), width-based
tagname = base
while exists(users.tagname == tagname): tagname = base + lowercase(Str::random(4))   # fresh 4 chars [a-z0-9] each try, not cumulative
```
`Str::slug(s, "")`: transliterate to ASCII (`Str::ascii`, language `en`: `é`→`e`, `ß`→`ss`, …); remove runs of `-`; replace `@` with `at`; lowercase; delete every char that is not a Unicode letter, digit or whitespace (`_`, `.`, `'` etc. vanish); delete whitespace. Examples: `"Ada Lovelace"`→`adalovelace`; `"ada@example.com"`→`adaatexamplecom`; `"O'Neil-Smith Jr."`→`oneilsmithjr`. Output can be shorter than 3 chars or contain non-ASCII letters that `Str::ascii` could not map, which the settings rule (`min:3`, `^[a-z0-9_]+$`) would later reject.

**name** = `trim(first_name + " " + last_name)`.

**Level::forPoints(p)**: `p < 2501` → `Rookie`; `p < 7501` → `Amateur`; `p < 15001` → `Superior`; else `Expert`. Boundaries pinned by `ProfileStandingTest::points_map_to_a_standing` (2500 Rookie, 2501 Amateur, 7500 Amateur, 7501 Superior, 15000 Superior, 15001 Expert).

**points** = `max(leaderboards.points)` for the user, `0` when none.

**UUIDs**: every domain row gets `Str::uuid7()` (lowercase, hyphenated) on create; integer `id` stays internal.

**StoredFile**: see 1.10. `url(p)`: `!p → null`; `p` starts `http://`/`https://` → `p`; else `APP_URL + "/storage/" + p`.

**Lecturer email rule**: `LECTURER_EMAIL_PATTERN` env, default PHP regex `/^[a-zA-Z0-9._%+-]+@(?!.*student).*\.ac\.id$/` (JS: same body, no flags). Empty/null disables the rule. Applied in register (only when `role === "Lecturer"`) and in social `allowedRole`.

**Social login code**: code = 64 chars `[A-Za-z0-9]`; store `{user_id, token}` under `"social-login:" + sha256_hex(code)` for 120 s; redeem = get + delete.

**Sanctum token**: see 1.3. Verify: `id|secret` → row by id, `sha256_hex(secret) == row.token`; or no `|` → row by `sha256_hex(token)`.

**Signed URL** (verification): `hmac_sha256_hex(APP_KEY_raw_string, absoluteUrlWithQueryMinusSignature)`, query `expires=<unix>` then `&signature=<hex>`. Verification ignores only the `signature` parameter and checks `expires`. Lifetime 60 min.

**Verification hash**: `sha1_hex(user.email)`.

**Password reset token**: `hmac_sha256_hex(base64_decode(APP_KEY without "base64:"), random40)`; stored bcrypt-hashed in `password_reset_tokens (email PK, token, created_at)`; valid 3600 s; re-request blocked for 60 s; one row per email.

**Throttle (fixed window)**: see 1.5. `hit`: if no `<key>:timer`, set it to `now + decay` with TTL decay; add `<key>` = 0 with TTL decay if absent; increment. `tooMany(key, max)`: `attempts >= max` and timer alive.

**Pusher channel auth**: `auth = APP_KEY_PUSHER + ":" + hmac_sha256_hex(APP_SECRET_PUSHER, socket_id + ":" + channel_name)`.

**Constants**: social code TTL 120 s; verify link 60 min; reset token 60 min, reset re-send throttle 60 s; login lockout 5 attempts / 60 s; route throttles 6/min and 10/min; upload limits 1024/4096/2048 KB; PHP body limit 16 MB; bcrypt cost 12; default token name `"phive-web"`, social `"phive-web-google"` / `"phive-web-apple"`.

---

## 5. Open questions

1. **`last_name: null` → 500.** `UpdateProfileRequest` allows null but the column is NOT NULL (Laravel, and the Hono D1 schema). The frontend sends `""` (→ null) when the field is cleared. Copy the 500, or store `""` (as register does)?
2. **Shared throttle counter.** Laravel uses one counter per client across register, password/email, email/verify, email/resend and auth/exchange, and because the Next server makes these calls, "client" is the Next server's IP for the whole site. `backend-hono/wrangler.jsonc` defines two separate Cloudflare rate-limit namespaces, which are per-colo and approximate. Decide whether exact parity matters, and whether the frontend should forward the browser IP.
3. **Apple callback.** Apple uses `response_mode=form_post` (cross-site POST). In Laravel that POST hits the `web` group's CSRF middleware and the `SameSite=lax` session cookie is not sent, so it most likely fails (419 or `error=social`). No test covers it. The port needs a state mechanism that survives a cross-site POST (e.g. a signed `state` parameter).
4. **Password hashes.** Laravel stores bcrypt `$2y$12$…`. The Hono scaffold (`src/lib/crypto.ts`) uses PBKDF2. Migrated users need a bcrypt verify path (`$2y$` = `$2b$`), with optional rehash on login. Laravel never rehashes here.
5. **Account linking by email.** Social sign-in links to any existing account with the same email, even an unverified one (pre-registration takeover), and does not mark that account verified. A second account of the same provider with the same email hits the unique `(user_id, provider)` index → 500. Keep as-is?
6. **Public profile leaks `email` and `identity_number`.** UserResource is used unfiltered on `GET /api/users/{tagname}`. The contract says keep them; confirm.
7. **Verification link base URL.** Laravel signs with the *request* root, and the frontend only accepts URLs starting with its own `API_URL`. In Hono, build the link from a configured `APP_URL` that equals the frontend's `API_URL`, and verify the signature over path+query rather than over a host that may change behind proxies or service bindings. The `{id}` segment becomes whatever the Hono user id is (text); the frontend treats it as opaque.
8. **Storage paths in the Hono scaffold.** `src/lib/storage.ts` says it uses Laravel's keys (`cvs/`, `thumbnails/`) but Laravel uses `cv/` and `project-thumbnails/`. It also derives the extension from client MIME/filename, where Laravel sniffs content. Existing rows keep their stored paths either way; fix the comment or the directories.
9. **Register returns `is_open_hired: null`** (model not refreshed) while every other endpoint returns a boolean. The frontend ignores the register `user`. Replicate or return `false`?
10. **`SANCTUM_TOKEN_EXPIRATION`** appears in `.env.example` but `config/sanctum.php` hard-codes `null`. Tokens never expire, and the frontend cookie lasts 30 days.
11. **Mail is synchronous** in register/resend/password-email. A transport failure after the user insert returns 500 with no token. Port with `waitUntil` (never fails the request) or keep the failure?
12. **Email case-sensitivity.** Lookups and `unique` are exact-match (Postgres/SQLite). Only the login throttle key is lowercased. Keep exact-match?
13. **`hashed` cast** stores any input that already looks like a hash verbatim. Do not replicate; always hash.
14. **Error message parity** for 404 binding misses (`App\\Models\\…` class names) and empty `""` 403 messages. The frontend only uses status codes there. Replicate the strings or simplify?
15. **Validator fidelity.** Laravel's `email` (RFC via egulias), `url` (`Str::isUrl` with a long scheme list) and `date` (`strtotime`) are looser or different from typical JS validators. The frontend sends `YYYY-MM-DD` dates and `https://` links, so a reasonable approximation is probably enough.
16. **Unauthenticated without `Accept: application/json`** returns 500 in Laravel because no `login` route exists. Port as 401 (the frontend always sends the header).
