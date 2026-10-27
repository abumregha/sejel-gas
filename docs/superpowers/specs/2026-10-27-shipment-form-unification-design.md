# Design: Unified Add-Shipment Form & Schedule↔Delivery Linking

**Date:** 2026-10-27
**Status:** Approved
**Customer problem:** Operators find shipment entry forms complex; two forms both titled «إضافة شحنة» cause confusion.
**Related:** `docs/SHIPMENT_INVOICE_AND_DEPOSITS_PLAN.md`, `DOCUMENTATION.md` §5.23, `docs/BUSINESS_INVARIANTS.md` §3

## 1. Background

The system has two separate "Add Shipment" flows:

| Form | DocType | Route | Business moment |
|---|---|---|---|
| «إضافة شحنة مجدولة» | `Shipment Schedule` | `/inventory/shipment-schedules/create` | Booking a line on PR-15-F-05 (15-line serial table) |
| «إضافة شحنة» | `Delivery` | `/inventory/deliveries/create` | Recording a physical load arriving at the tank |

Both have near-identical Arabic titles, overlapping fields, and known defects:

- `supplier` on the schedule form is silently dropped (field absent from DocType).
- `invoice_number` is optional in HTML but `reqd:1` server-side → confusing save failures.
- No edit route for schedules (list edit link matches nothing, though the form implements edit).
- `ShipmentSchedule.delivery → Delivery` link field exists but no code writes it; reports join by date only.
- Delivery form requires both `expected_quantity` and `requested_quantity` (redundant in practice).
- Schedule create form exposes all 6 statuses including `cancelled` with no transition rules.

## 2. Decisions (confirmed with user)

1. Both forms are in scope.
2. Frontend + backend changes allowed (Frappe app at `/home/frappe/bench/apps/sejel_app`).
3. Single unified entry point with a type toggle (chosen over wizard / two renamed forms).
4. Recording an arrival from a schedule performs explicit linking and flips schedule status.
5. Frontend is the existing Vue 3 SPA (`sejel/frontend`, Composition API, `api.js`, Tailwind-style classes). No new dependencies.

## 3. Unified form UX

**Route:** `/inventory/shipments/create` (replaces both create routes). Old create routes redirect here. Edit route: `/inventory/shipments/:id` (fixes dead schedule edit link; type derived from the loaded record).

**New component:** `sejel/frontend/src/views/inventory/ShipmentForm.vue` (~280 lines, single file).

Screen structure, top to bottom:

1. **Type toggle** — segmented control, default «شحنة مجدولة»:
   - «مجدولة» → creates `Shipment Schedule`
   - «غير مجدولة / إضافية» → creates `Delivery` with `is_unscheduled=1`
2. **Context block** (scheduled only): deposit/invoice picker («الفاتورة / الإيداع»). Picking a deposit auto-fills invoice number, station, fuel type, supplier, and suggests next serial (1–15). Existing `onDepositChange` behavior, kept.
3. **Core block** (both types):
   - Station (prefill `?station=`, auto-select if single)
   - Fuel type — scheduled: manual select; unscheduled: derived from tank (required)
   - Tank (unscheduled only; filtered by station)
   - Quantity — **one field**. Scheduled → posts `quantity`. Unscheduled → posts as both `expected_quantity` and `requested_quantity`.
   - Date — scheduled: `expected_shipping_date`; unscheduled: `arrival_date` defaulting to now
4. **Advanced block** (collapsed under «خيارات متقدمة»):
   - Scheduled: unit price (8-decimal step), serial (auto-suggested, editable, 1–15), notes. Status selector hidden on create (server forces `scheduled`); editable on edit.
   - Unscheduled: invoice number, order date, pre/post readings with live received/shortage panel, shortage-claim hint.
5. **Save** → POST to matching endpoint (`/shipment-schedules/` or `/deliveries/`) → redirect to that type's list.

**Arrival flow (schedule → delivery):**

- `ShipmentScheduleList.vue` rows gain «تسجيل استلام» (visible when status ∈ {scheduled, dispatched}).
- Click → `/inventory/shipments/create?type=arrival&schedule=<name>`; type locked to unscheduled-entry mode; pre-filled from schedule: station, fuel type, quantity, invoice number, scheduled_date. Read-only banner: «شحنة مجدولة: سطر رقم X — فاتورة Y» linking to the schedule.
- Operator adds tank + readings. Save:
  1. `POST /deliveries/` including `shipment_schedule: <name>`.
  2. If operator confirms «تأكيد الاستلام»: `PUT /shipment-schedules/<name>/` `{status: 'delivered'}`. Otherwise schedule status unchanged.

**Partial-failure handling:** if delivery POST succeeds but schedule PUT fails, show «تم حفظ الشحنة، تعذر تحديث الحالة — حدّثها يدوياً» with link to the schedule.

## 4. Backend changes (`sejel_app`)

- `delivery.json`: add Link field `shipment_schedule` → Shipment Schedule.
- `delivery.py validate()`: when `shipment_schedule` set — copy `invoice_number`/`fuel_type` from schedule if empty; reject linking a schedule already in status `delivered`.
- `shipment_schedule.py`: status may only be set to `delivered` when a linked Delivery exists (invariant guard). Create forces `status='scheduled'`.
- `shipment_schedule.json`: add `supplier` Link → Marketing Company (fixes dropped field). `invoice_number` stays `reqd:1`; error humanized to «اختر الفاتورة / الإيداع قبل الحفظ».
- `reports.py` monthly-shipment join: prefer `Delivery.shipment_schedule` link; keep date-match fallback for legacy unlinked rows.
- Nginx: no new paths required (generic CRUD covers both DocTypes); confirm SPA route fallback serves `/inventory/shipments/*`.

## 5. SPA cleanup

- Delete `DeliveryForm.vue`, `ShipmentScheduleForm.vue`; router redirects from old create paths.
- `router/index.js`: register `/inventory/shipments/create` and `/inventory/shipments/:id`.
- `ShipmentScheduleList.vue`: «تسجيل استلام» button + working edit link → `/inventory/shipments/:id`.
- `DeliveryList.vue`: show linked schedule serial when `shipment_schedule` present.
- `QuickActions.vue`, `DefaultLayout.vue` nav, `DashboardView.vue` shortcuts: «إضافة شحنة» → `/inventory/shipments/create`.
- `GuideView.vue` §7–8: update to describe unified form and arrival flow.

## 6. Error handling

- Client-side required checks mirror server `reqd` fields, Arabic messages via existing `friendlyError`.
- Deposit/invoice guard for scheduled type before POST (prevents current silent server 400).
- Station scoping: new forms inherit existing `DIRECT_STATION_DOCTYPES` server-side injection/403; no scoping changes.

## 7. Testing

- Update `qa-phase5-inventory.js` e2e: (a) create scheduled via deposit, (b) create unscheduled with readings + shortage, (c) arrival-link flow asserts schedule flips to `delivered` and monthly report shows one merged row, (d) edit schedule via new route.
- Backend: `bench run-tests --app sejel_app` covering the two DocType guards (delivered-without-link rejected; double-link rejected).
- Manual: old URLs redirect; single-station prefill; multi-station station picker.

## 8. Out of scope

- Automated Stock Entry creation for deposit deduction (no UI exists today; separate concern).
- Status auto-progression jobs (no scheduler in current deployment).
- Data migration of legacy date-joined report rows (fallback join preserves behavior).
