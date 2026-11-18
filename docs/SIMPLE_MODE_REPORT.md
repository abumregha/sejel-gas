# Simple Mode — Build & Verification Report

**Scope:** Frontend only. A radically simple operator UI under `/simple/` routes ("Simple Mode"); the existing UI becomes "Manager Mode". Verified end-to-end against the isolated QA site `sejel_uat` on **:8007 only** (:8004 untouched). Backend code, DocTypes, and permissions unchanged.

**Verification:** `sejel/e2e-tests/simple-mode-verify.js` — **26/26 PASS** (Playwright, :8007, mobile viewport 390×844, RTL).

---

## What was built

### New files
| File | Purpose |
|---|---|
| `frontend/src/utils/roles.js` | Single source of role logic: `MANAGER_LEVEL_ROLES` (incl. `owner`), `isManagerLevel()`, `canCloseDay()`, `landingPath()` |
| `frontend/src/layouts/SimpleLayout.vue` | Minimal mobile-first RTL shell: app name, station, user, logout. No menus, no back stack |
| `frontend/src/views/simple/SimpleHome.vue` | 3–4 primary action buttons + day close + read-only Today summary |
| `frontend/src/views/simple/SimpleReadings.vue` | One field per gun; previous reading read-only; exception fields ONLY when lower; one Save |
| `frontend/src/views/simple/SimpleIncome.vue` | 3 sections (cash / coupons by denomination / POS), one Save, auto-resolved shift, idempotent `request_id` retry kept |
| `frontend/src/views/simple/SimpleTankReading.vue` | Tank + one number + Save |
| `frontend/src/views/simple/SimpleDelivery.vue` | Direct deliveries only: tank, quantity (with 40,000/20,000 quick-fill), Save |
| `e2e-tests/simple-mode-verify.js` | 26-step verification suite; refuses any target other than :8007 |

### Modified files
| File | Change |
|---|---|
| `frontend/src/router/index.js` | `/simple` routes; landing-split guard — non-manager-level users are bounced from Manager-Mode routes to `/simple` |
| `frontend/src/views/auth/LoginView.vue` | After login: manager-level → old dashboard, everyone else → `/simple` |
| `frontend/src/layouts/DefaultLayout.vue` | `can()` honors `owner` as manager-level |
| `frontend/src/components/dashboard/QuickActions.vue` | same `owner` fix |
| `frontend/src/views/shifts/ShiftDayView.vue` | `canSwitch` honors `owner` |
| `frontend/src/views/shifts/ShiftDetail.vue` | Reopen gate compared SPA roles to Frappe profile strings (`'System Manager'/'Owner'`) and never matched — fixed to `auth.isAdmin \|\| ['manager','owner']` |
| `frontend/src/stores/station.js` | `canSwitch` honors `owner` |

### Design rules honored
- **Max 4 primary actions** on Home; day close is a separate single button, visible only to `canCloseDay` roles, with **exactly ONE confirmation** (asserted in the suite: `confirms === 1`).
- **Shift lifecycle hidden.** Verified on :8007 that `POST /ensure-day-close/` creates the day container with `status: "open"` and it appears as `open` in `GET /shifts/?station=…` — income and readings auto-target it. **Answer: yes, the auto-created day-close shift appears as `open`.**
- Exception fields appear **only** when the typed reading is lower than the previous one (suite checks appear + disappear on correction).
- Opening-reading honesty: a gun's first-ever reading books 0 L (backend baseline rule) — a badge explains this before saving, so "0 liters today" on day one is understood, not a mystery.
- Delivery button **hidden** (never an error) for roles without Delivery create; a direct URL gets a quiet refusal screen.

---

## Operator checklist (click counts)

| Task | Steps | Taps |
|---|---|---|
| Login | username + password + دخول | 3 |
| Save pump readings | قراءات المضخات → type one number per gun → حفظ | **2 taps + typing** |
| Save income | الإيرادات → type amounts → حفظ الإيرادات | **2 taps + typing** (shift auto-resolved) |
| Tank reading | قراءة خزان → (tank pre-selected when only one) type number → حفظ | **2–3 taps** |
| Fuel delivery (admin/manager) | توريد وقود → 40,000 quick-fill → حفظ التوريد | **3 taps** |
| Day close | إقفال اليوم → one confirm | **2 taps, ONE confirm** |

Supervisor/operator sees 3 buttons (delivery hidden), no day-close button, no Manager Mode link. Admin/manager/owner/finance see 4 buttons + "الوضع الكامل (للمدير)" link.

---

## Bugs found & fixed during verification (all frontend)

1. **Reactive bug in SimpleReadings:** row objects built inside the `gunRows` computed were non-reactive — `v-model` landed in the model but the exception block / liters preview never re-rendered while typing. Fixed with `reactive()` rows.
2. **Close button race:** the day-close button was clickable before the dashboard finished loading, showing a misleading "no readings saved" error. Fixed: disabled with a loading label until data arrives.
3. **Tank reading payload:** backend requires `reading_level` (not `reading`) — aligned with the Manager Mode contract.
4. **Delivery payload:** backend requires `order_date` (MandatoryError) and `shipment_schedule: ''` (see open item B).
5. **Reopen gate (ShiftDetail):** compared SPA roles against Frappe profile strings and never matched — manager/owner could not reopen; fixed.

---

## Open items (need a decision / backend owner)

- **(A) Supervisor cannot create deliveries (B1, option a — as approved).** The Delivery DocType matrix gives Sejel Supervisor read-only access, so the button is hidden for supervisors. If operators should someday record incoming fuel themselves, the backend permission matrix must change first (not done, per instruction).
- **(B) Backend latent bug — `shipment_schedule` AttributeError.** `POST /deliveries/` without a `shipment_schedule` key raises `AttributeError: 'Delivery' object has no attribute 'shipment_schedule'` because `new_doc` leaves the field unset and the controller reads it unguarded (`delivery.py link_schedule()`). The old **ShipmentForm direct-delivery path has the same exposure** (it sends `shipment_schedule: undefined` when unscheduled — deleted from the payload). Frontend works around it by sending `''`; the backend should initialize the field.
- **(C) QA schema drift found & synced (QA site only).** `sejel_uat`'s DB was missing `tabReconciliation.is_archived` (present in the DocType JSON and on the live site), which made `close_shift` fail with `InFailedSqlTransaction` for **any** UI on :8007. Fixed by `bench --site sejel_uat migrate` (standard schema sync on the disposable copy; no code changed). Worth confirming live is on current migrations.
- **(D) Frappe contract quirk (documented, no action):** `make_form_dict` ignores the query string when a request has a JSON body — so `POST /shifts/{id}/close/` must be sent with **no body** (which is what the SPA does; the `name` arrives via the nginx rewrite query arg).
- **(E) First-day liters = 0 is correct behavior** (opening baselines book 0 L); the UI now badges this.

---

## Manager Mode triage pass (follow-up, verified on :8007)

The admin panel's 69 screens were scoped: only ~8–12 are daily-use; the rest is setup-time or periodic work shown at the same weight. Frontend-only triage (no routes deleted — every removed sidebar entry still works by direct URL and its in-app links):

- **العمليات:** removed the deletion-audit log and the setup wizard from the sidebar (rare/setup-time). The wizard stays linked from the Stations page; the deletion log now has a discreet «سجل الحذف» link on the Readings screen (manager-level only).
- **المالية:** 10 entries → 3 (hub + إدخال إيرادات + المصروفات). Cash, vouchers, POS, settlements, deposits, daily sales and fuel prices remain in the finance hub (`/finance`) and by URL.
- **التقارير:** 8 entries → 2 (new one-screen hub `/reports` with role-gated cards for the 7 reports + the operational «فجوات العدادات» check kept in the sidebar). New: `views/reports/ReportHub.vue`.
- **Result:** admin's visible sidebar went **37 → 22 items**; finance-role users see proportionally less. Mobile quick bar unchanged (5 items).
- Verified: hub renders all 7 report cards, direct URLs for every removed entry still resolve, ReadingsView audit link renders, Simple Mode suite re-run — **ALL PASS** (26/26).

## Environment notes
- QA backend for :8007 runs as: `su - frappe -c "cd /home/frappe/bench && bench --site sejel_uat serve --port 8008"` (log: `/home/frappe/sejel_uat_serve.log`).
- Backup before any writes: `sejel_uat` backup `20261117_130509` (SQL + files). All test data is on the disposable :8007 site only.
- Rebuild + redeploy: `cd sejel/frontend && npm run build && cp -r staticfiles/vue/. /tmp/opencode/browser-uat/vue-test/`.
- Test fixture stations created on :8007: `9kbl8dk8q6, e9dvuq1tld, ftv3kbr1n1, gia0e9hvha, j55gb8i19c, kq0ud3fh65, lve1sqo694` (محطة سيمبل 5–7). Operator user `operator1@sejel.ly` (role `supervisor`) rebound to the last fixture.
- Nothing committed to git; all changes are working-tree only.
