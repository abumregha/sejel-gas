# Sejel — Dashboard Redesign Prompt (Aligned v2)

**Version**: 2.0 — aligned with the system state on 2026-09-10
**Supersedes**: the original draft prompt (outdated details corrected per alignment review)
**Task**: redesign the Sejel main dashboard into a professional, highly visual, interactive Fuel Station Operations Dashboard.
**Scope**: visualization + interaction layer only. Do not rewrite unrelated modules. Do not modify financial business logic unless a bug is discovered.
**Note on references**: no reference image was attached. Design direction comes from the principles in §1 (drawn from current dashboard-design best practice: semantic status colors carrying the meaning, 6–8 primary visuals, WCAG contrast, progressive disclosure, restrained decoration). If an image is provided later, use it as additional inspiration within these rules.

---

## 0. CURRENT SYSTEM STATE (context the implementer must know)

- **Backend**: Frappe v15 (`sejel_app` at `/home/frappe/bench/apps/sejel_app`), SPA at `/root/projects/Sejel/sejel/frontend` (Vue 3 + Pinia + Tailwind, RTL Arabic).
- **API pattern**: nginx (port 8004) rewrites `/api/{slug}/` to `sejel_app.api.views.crud_list/crud_detail` via the `RESOURCES` dict in `views.py`. Special endpoints need an **nginx exact-match location before the CRUD regexes** (precedent: `/api/setup-station/`).
- **Auth**: session cookies + **CSRF enforced** (`X-Frappe-CSRF-Token` header on POST/PUT/DELETE; token from `/api/auth/login/` and `/api/auth/me/` responses; the axios instance in `src/api.js` already injects it).
- **Process**: bench runs under **systemd** (`sejel-bench.service`) — backend edits require `sudo systemctl restart sejel-bench`.
- **Role model**: `role` ∈ admin/manager/supervisor/finance from `_build_user_response()` in `api/auth.py`. `isAdmin`/`isOwner` getters exist in the Pinia auth store. **`station_id` is currently always `null`** (§3.1 fixes this).
- **Shift statuses** (DB): open/in_progress/submitted/reconciled/closed/cancelled/under_review. Per decision Q6 the UI shows **4 primary states** via `SHIFT_STATUS_PRIMARY`/`SHIFT_BADGE` in `src/utils/labels.js`. There is **no "scheduled" status** — the old Django concept does not exist in Frappe.
- **Tank thresholds**: the only existing rule is the 20% low-tank check in `get_dashboard` SQL. There is **no Tank Alert doctype** in sejel_app (it was legacy Django only). Thresholds must be computed server-side in the new endpoint (§12), not invented per-component.
- **Known placeholder**: `daily_report`/`monthly_report` return real liters but placeholder zeros for sales — do **not** reuse them for money KPIs (§15). The new dashboard endpoint computes real aggregates.
- **Tests**: Playwright e2e suite at `sejel/e2e-tests/` (helpers: `launch/login/nav/goto/apiGet/apiPost/step/summary`). No vitest/jest infra — acceptance tests are added there (§28).
- **Icons**: the app sidebar currently uses emoji. Per decision, **this task is dashboard-only SVG**; sidebar emoji sweep is a separate later task (§20).

---

## 1. OVERALL DESIGN DIRECTION

Card-based, modern enterprise SaaS look; RTL-first, Arabic-first; desktop + tablet + mobile.

- Visual hierarchy first: the most critical KPI top-right (RTL), 6–8 primary visuals max.
- Status colors (green/amber/red/gray) carry semantic meaning only — never decoration; always paired with icon + Arabic label + tooltip (not color alone).
- WCAG-compliant contrast; consistent iconography; balanced whitespace; subtle transitions only (drawer slide, hover, tank level change).
- Avoid: excessive gradients, 3D effects, cartoon graphics, animation that delays workflow, decorative noise, fake numbers.

## 2. MAIN DASHBOARD STRUCTURE

A. Header / station context — B. KPI summary — C. Interactive station visualization — D. Tank status — E. Latest meter readings — F. Shift status — G. Financial reconciliation summary — H. Alerts — I. Quick actions — J. Sales summary. Arrangement optimizes responsively; secondary panels fall below the station visualization on tablet/mobile.

## 3. HEADER

Current station name, status, last-update time, current user, refresh. Owner/admin: a station selector — `جميع المحطات` or a specific station. One selected station → all panels show that station; "all" → aggregated multi-station dashboard (clearly aggregate; never render multiple stations as one physical diagram).

### 3.1 User–station binding (NEW — small backend prerequisite)
Add a station Link field to User (custom field via the app or a small DocType), surface it as `station_id` in `_build_user_response()`. Supervisors/finance land pre-bound to their station (selector hidden or restricted); admin/manager get the free selector. The SPA must not guess a binding.

## 4. KPI CARDS

Six data-backed KPIs: إجمالي اللترات، إجمالي المبيعات (expected sales)، إجمالي التحصيل، فرق المطابقة، المصروفات، صافي الربح. Plus:

- **هامش الربح (decision: computed from Fuel Price)** = `(selling_price − cost_per_liter) × liters_sold` per fuel type, aggregated **server-side** using each shift's active Fuel Price at sale time. If `cost_per_liter` is missing for a fuel type, show the KPI as `—` with a tooltip "غير مُعرّف — أدخل تكلفة اللتر" rather than zero.
- Cards show current period (today) with status indicator + inline SVG icon (no emoji): pump/fuel, receipt, banknote, shield-check, wallet, trending-up.
- Period comparison (yesterday/last week) only where data exists — never fabricated.

## 5. THE CORE: INTERACTIVE STATION VISUALIZATION

Dynamic Vue + HTML/CSS/SVG representation of Station → Islands → Machines → Meters, generated from real data. Never a static image; never hard-coded counts. 2 islands → 2 island panels; 3 machines on one and 2 on another → exactly that.

## 6. VISUAL HIERARCHY
Recognizable inline SVG icon per level (station/island/pump/meter/tank). Islands as panels containing machine cards; meters as nodes on their machine.

## 7. INTERACTIVE ISLANDS
Click → drawer (not navigation): name, machine count, meter count, current attendants, fuel types, current shift, period sales/liters, alerts.

## 8. INTERACTIVE PUMPS/MACHINES
Click → drawer: name/number, island, fuel types, meters, tanks, current shift, attendant, readings, liters sold, status.

## 9. INTERACTIVE METERS
Click → drawer: code, fuel, previous/current reading, liters sold, unit price (frozen at close where applicable), expected sales, attendant, shift, recorded-at, validity. Exception present → type, reason, authorized-by. Meter photo (station `photo_meter_required` sets may exist) → view button when a photo is attached.

## 10. METER STATUS VISUALIZATION
Green = valid; Yellow = needs attention/delayed; Red = continuity problem/exception/missing; Gray = inactive. Always icon + Arabic label + tooltip, never color alone.

## 11. TANK VISUALIZATION
Dynamic tank cards: name, fuel type, level bar, current/capacity liters, percentage, status. Click → drawer: capacity, level, latest reading, last delivery, pending delivery request, recent transfers, theoretical vs actual variance, alerts.

## 12. TANK STATUS THRESHOLDS (server-side)
Compute in the dashboard endpoint from actual level/capacity using **one** shared rule set: normal > 40%; low 20–40% (يحتاج طلب); critical 5–20%; empty ≤ 5% (aligning with the existing 20% low-tank semantics); full ≥ 98%. Expose `status` + `status_label` per tank. Frontend renders backend values verbatim.

## 13. LATEST METER READINGS TABLE
Compact table: meter, pump, island, fuel, current reading, liters, time, status. Rows clickable → **the same** meter drawer component (no duplicated logic).

## 14. SHIFT STATUS
Render **today's actual Shift records** for the station with the 4-state display (`SHIFT_STATUS_PRIMARY`): open shifts, submitted (pending closing), closed today, reconciled. Fields shown: name/time window, employee, primary status. Clickable → shift detail route. No "scheduled" state (does not exist).

## 15. FINANCIAL RECONCILIATION SUMMARY
For the selected station/period, **backend-computed**: expected sales (frozen prices), collections split cash/vouchers/POS, total collection, difference + type, net cash (collection − expenses). Vue formats only; all money math lives server-side. Do not reuse `daily_report` placeholders.

## 16. FINANCIAL STATUS INDICATOR
✓ مطابق / ⚠ فائض / ✕ عجز as inline SVG icon + Arabic label + color; click opens the reconciliation detail route.

## 17. ALERTS
Server-computed list: tank low/critical/empty, meter exception/missing reading, delivery shortage, pending delivery request, shift pending closing, reconciliation pending, voucher settlement outstanding. Each alert deep-links to its record or opens its drawer.

## 18. QUICK ACTIONS (role-gated)
Reuse the sidebar's role-filtering logic (`can()` pattern from `DefaultLayout.vue`; expenses/collections count immediately per Q28 decision):
- Supervisor: إضافة قراءة عداد، إقفال مناوبة، تسجيل قراءة خزان، تسجيل شحنة
- Finance: إضافة تحصيل، إضافة كوبونات، إضافة POS، إضافة مصروف، مطابقة مناوبة
- Owner/Admin: عرض التقارير، إدارة المحطات، إعداد محطة (wizard)، مراجعة التسويات
Actions deep-link to existing routes (`/shifts/:id/readings`, `/shifts/:id/close`, `/inventory/tank-readings`, `/inventory/deliveries/create`, `/finance/income`, …). Never render an action the role can't perform.

## 19. RESPONSIVE
Desktop: full diagram. Tablet: tighter spacing, secondary panels below. Mobile: islands stack vertically; tap machine/meter/tank → drawer. Never cram the desktop diagram into a phone viewport.

## 20. SVG ICON SYSTEM (dashboard-only per decision)
Inline SVG components (Lucide-style, 24px, stroke-based): StationIcon, IslandIcon, PumpIcon, MeterIcon, TankIcon, FuelIcon, ShiftIcon, CashIcon, VoucherIcon, POSIcon, AlertIcon + status icons (check/warning/x). Create `src/components/icons/`. The app-wide emoji sweep (sidebar etc.) is explicitly **out of scope**.

## 21. NO STATIC ART
The station layout must be Vue + HTML/CSS/SVG generated from data. No PNG/JPG/background screenshots.

## 22. COMPONENT ARCHITECTURE
`src/components/dashboard/`: `StationMap.vue`, `IslandPanel.vue`, `MachineCard.vue`, `MeterNode.vue`, `TankCard.vue`, `MeterDetailDrawer.vue`, `IslandDetailDrawer.vue`, `TankDetailDrawer.vue`, `ShiftStatusCard.vue`, `ReconciliationSummary.vue`, `AlertsPanel.vue`, `QuickActions.vue`, `KpiCard.vue`. The dashboard passes station data; components render whatever arrives. `<StationMap :station="station" />` must work for any station configuration.

## 23. API / DATA CONTRACT
Add **one** dashboard-oriented endpoint (nginx exact-match location + `@frappe.whitelist` in `views.py`, following the `/api/setup-station/` precedent):

`GET /api/dashboard-station/?station=<name>&date=<YYYY-MM-DD>`

Returns: station info, islands→machines→meters tree (with latest reading + status per meter), tanks with levels + server-side status, today's shifts, financial summary (expected/collections/difference/net), profit margin, alerts list, recent readings. All computed server-side; role-scoped (non-admin users may only fetch their bound station — enforce server-side). Document the shape in DOCUMENTATION.md. Reuse `RESOURCES`-backed endpoints only for detail drawers' follow-up fetches if needed; do not create duplicate endpoints.

## 24. PERFORMANCE
One main load per station selection; drawers fetch lazily on open; refresh button re-pulls the main payload; no per-icon requests; no aggressive polling.

## 25. INTERACTION RULES
Click hierarchy: island → island drawer; machine → machine drawer; meter → meter drawer (shared with table rows); tank → tank drawer; shift/alert → record route. Visible hover/focus states; ≥44px touch targets on mobile.

## 26. VISUAL QUALITY
Professional cards, grouped panels, consistent icons, restrained accent colors, clean RTL. Subtle transitions only. Must feel like a control center, not a CRUD table.

## 27. BUSINESS RULES
The dashboard is a read/visualization layer. Backend stays authoritative for liters, prices, expected sales, collections, reconciliation, expenses, profit, tank math, shortages, settlements. Any displayed calculation must come from the endpoint.

## 28. ACCEPTANCE CRITERIA
1–5. Any station configuration renders exactly — no code changes, no hard-coded counts.
6–9. Island/machine/meter/tank clicks open their drawers.
10. Mobile usable. 11–12. Owner switches stations; KPIs follow.
13. Role-inappropriate actions hidden (and endpoint refuses out-of-scope fetches server-side).
14–15. Financial numbers from backend; zero mock values.
16–17. No static image; consistent SVG icons.
18–19. Existing functionality and e2e suite intact (update any step broken by UI changes; use `apiPost` for CSRF).
20. New Playwright file (e.g. `phase5-dashboard.js`): dynamic island/machine/meter rendering across two differently-shaped stations, station switching updates KPIs, meter drawer opens from both diagram and table, tank drawer, role-based quick actions (admin vs supervisor login).

## 29. IMPLEMENTATION PROCESS
1. Inspect current `DashboardView.vue`, existing components, `views.py`, doctypes.
2. Add the user-station binding (§3.1) and the `dashboard-station` endpoint (§23) + nginx location; restart `sejel-bench`; verify with curl (CSRF-aware).
3. Build the icon set + components (§22); rewrite `DashboardView.vue` to consume the endpoint.
4. `npm run build`; run e2e suite; verify desktop/tablet/mobile + RTL + owner switching + role gating.
5. Report: files changed, components created, APIs added, data shape, tests added, build result, remaining limitations.

**Out of scope**: sidebar emoji sweep, monthly-report placeholder fix (separate Q26 task), any financial-logic changes, new form flows.
