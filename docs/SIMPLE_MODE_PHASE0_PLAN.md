# Simple Mode — Phase 0 Plan (read-only, awaiting approval)

Scope of this phase: router, auth store (`stores/auth.js`), API client (`api.js`), and the existing views that already call the endpoints Simple Mode needs. **No code written yet.** All findings below are verified against the current frontend source; the Frappe backend (`sejel_app`) is **not in this repo**, so backend behaviors marked ⚠ must be verified against staging before Phase 1.

---

## 1. Endpoints each Simple Mode screen will call (all existing)

Common (reuse as-is): `POST /auth/login/`, `GET /auth/me/`, `POST /auth/logout/` — CSRF token handled by `api.js`. Station scoping is injected automatically by the axios interceptor from `localStorage['sejel-current-station']`.

| Simple screen | Endpoints | Notes |
|---|---|---|
| **Home (Today summary)** | `GET /dashboard-station/?date=&station=` | Single call already returns: per-gun readings status, liters total, expected sales, and today's shift/KPI data. Reuse `ReadingsView.vue`'s parsing. No new endpoint needed for "readings done / total liters". |
| | `GET /reports/daily-sales/?station=&date=` | For "total income" (cash + coupons + POS). Same call `DailySales.vue` uses. |
| **1) Pump readings** | `GET /dashboard-station/?date=&station=` | Builds one card per active gun, previous reading auto-filled (`reading.end_reading` → `Meter.current_reading`). |
| | `POST /ensure-day-close/` `{station, date}` | Idempotent server-side ensure of the day-close container; refuses closed days. Same call the old screen makes before saving. |
| | `POST /meter-readings/` `{shift, meter, start_reading, end_reading, source:'manual'}` (+ `exception_type`, `notes` only when end < start) | One POST per gun. Exception fields rendered **only** when the typed value is lower than the previous — matching the existing backend rule. No edit/correct/baseline/delete in Simple Mode. |
| **2) Income** | `GET /stations/`, `GET /shifts/?limit_page_length=0`, `GET /voucher-categories/` | Same triple fetch as `IncomeEntry.vue`; station filtered client-side (or omitted entirely for a bound user — server scopes anyway). |
| | `POST /income/` `{shift, cash_amount, coupon_legs[], epayment_amount, epayment_count, request_id}` | The existing idempotent `request_id` retry logic is reused unchanged (regenerate on success, keep on partial failure). |
| **3) Tank reading** | `GET /tanks/?station=` | Tank list (scoping server-enforced for bound users). |
| | `POST /tank-readings/` `{tank, reading, reading_type:'daily', recorded_at}` | Same payload as `TankReadingList.vue`; type fixed to `daily`, so the operator sees just tank + number. |
| **4) Fuel delivery (direct only)** | `GET /tanks/?station=` | Tank picker; fuel type is derived from the tank (the delivery branch of `ShipmentForm.vue` already does this). |
| | `POST /deliveries/` `{station, tank, fuel_type, quantity, delivery_date, …}` | Direct delivery branch only — no schedule, no deposit, no arrival mode. Advanced fields omitted (server accepts them optional). |
| **Day close (conditional button)** | `PUT /shifts/{id}/` `{status:'submitted'}` then `POST /shifts/{id}/close/` | Only rendered when `auth.canCloseDay` (admin/manager/finance/is_staff). Single confirmation instead of the current 1–2 confirms. |
| **Operator login/landing** | existing auth + `GET /stations/` (via `stores/station.js`) | Routing decision is frontend-only (see §4). |

## 2. Shifts: how "hide the lifecycle" works

- **Readings** never touch employee shifts — `POST /ensure-day-close/` creates the day's day-close container automatically on first save. ✅ fully automatic.
- **Income** requires a shift with `status ∈ {open, in_progress}` at the selected station. ⚠ **Open question (verify in staging):** whether the shift created by `/ensure-day-close/` surfaces with an `open` status in `GET /shifts/`. If yes, Simple Mode auto-selects it with zero operator awareness. If no, Simple Mode will call `/ensure-day-close/` first and use the returned shift `name` directly in the `/income/` payload — still no new endpoint and no lifecycle UI. **I do not expect a blocker, but I'll confirm with a staging test before building.**

## 3. Blockers / risks to decide before Phase 1

| # | Blocker | Detail | Decision needed from you |
|---|---|---|---|
| B1 | **Supervisor cannot create deliveries** | DocType matrix (DOCUMENTATION.md §8.2): `Delivery` = CRUD for System Manager / Sejel Manager, **R for Sejel Supervisor**. `POST /deliveries/` for the operator user will most likely return a PermissionError. Per your rules I will not widen any permission silently. | Either (a) Simple Mode shows the delivery button as "not available for your role" for supervisors, or (b) you widen `Delivery` create for Sejel Supervisor in the backend (a backend change — your call, not mine). |
| B2 | **Backend not in this repo** | `sejel_app` lives on the server, not here. I can build the frontend against the documented contracts, but the staging verification (end-to-end as the operator, user creation, the shift/income check) needs a reachable staging host. | Give me the staging base URL (the e2e tests use `QA_BASE=http://localhost:8004` for the client site and `:8007` for the isolated QA copy — confirm which one is the staging copy). |
| B3 | **Operator user creation** | The admin screen's own API is `POST /users/` with `{username, password, role, station}` — verified in `e2e-tests/phase5c-supervisor.js`, which already creates bound supervisors exactly this way. No new role needed: I'll use existing role `supervisor` + `User.sejel_station` binding, per your instruction. Password will be generated, sent once in my final reply, never logged or committed. | Confirm the target station name for the operator user. |
| B4 | **"owner" role fix** | Frontend-only fix, as specified: treat `role === 'owner'` identically to `manager` in the four gating points — `DefaultLayout.can()`, `QuickActions.can()`, `ShiftDayView.canSwitch`, `ShiftDetail.isAdmin` — and in the new landing-router. No backend change. | None — informational. |

## 4. Routing / landing plan (frontend-only)

- New routes under `/simple/…` in a new folder `views/simple/` + `layouts/SimpleLayout.vue`; old routes untouched.
- After login: `admin`/`manager`(incl. fixed `owner`)/`finance` → existing `/` dashboard; `supervisor` and any user without one of those roles → `/simple/`.
- Bound users (`User.sejel_station`) skip station selection everywhere (server-scoped); unbound Simple-Mode users get a single full-screen station picker on first use.
- A "Manager Mode" link is rendered in Simple Mode only for admin/manager/finance.

## 5. Formatting

`components/dashboard/format.js` already forces Western numerals (`en-US` digits, Arabic month names with `nu-latn`). Simple Mode will reuse these helpers unchanged — no numeral work needed.

## 6. Backup commands (run BEFORE any testing)

```bash
# on the Frappe bench host, as the frappe user:
cd /home/frappe/<bench-dir>
bench --site <site-name> backup --with-files

# if testing against a restored copy instead (recommended):
bench --site <staging-site> restore \
  /home/frappe/<bench-dir>/sites/<site-name>/private/backups/<dump>.sql.gz
```

I will not run anything against production; all verification happens on the staging copy you point me at (B2).

---

**Stopping here per Phase 0.** Awaiting your approval plus answers to B1 (delivery permission for supervisor), B2 (staging URL), and B3 (target station) before writing any code.
