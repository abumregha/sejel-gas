# Design: Station-first deposit→shipment wiring + shipment money ledger (A + B)

**Date:** 2026-10-28
**Status:** Draft for review
**Scope:** Frontend + backend (Frappe app `sejel_app`)
**Related:** `docs/superpowers/specs/2026-10-27-shipment-form-unification-design.md`, `DOCUMENTATION.md`, `docs/PILOT_HANDOFF_AR.md`

## 1. Objective

Make the operational flow «enter downpayment invoice → schedule → receive delivery» actually coherent, and make the reconciliation reports reliable for the people who close the day. Two threads in one spec:

- **A — Station-first selection.** Multi-station users (admin/manager/finance) should be able to pick the station they are acting on from a predictable place without re-deriving it from whatever list they happened to land on.
- **B — Deposit↔shipment wiring.** Scheduled shipments must be tied to a deposit invoice and show money state; the deposit list must be station-scoped and supplier-prefilled; balance must actually move when a shipment is received.

Out of scope for this spec: full global header switcher with cross-screen persistence. That is a follow-up after this spec proves the money plumbing works.

## 2. Decisions already made (confirmed in session)

- Default station scope for multi-station users: **all stations**, with the visible selector defaulting to the safest sensible value per screen, not a random single station.
- Over-commit guard at booking time: **warn, do not block**.
- Balance drawdown timing: **auto at confirmed arrival**, not at schedule time.
- Deposit requirement for scheduled shipments: **required in practice, reachable**. Keep the «بدون» path out of scheduled flow, but if someone starts a scheduled shipment without a deposit in hand, the form must offer a direct way to create the deposit first (popover/link) rather than a dead-end server error.
- Reconciliation must show both sides: scheduled-but-not-delivered and transit/مرحلة rows, not only delivered receipts.

## 3. Current state (evidence)

### 3.1 What is already connected

- Picking a deposit in `ShipmentForm.vue` (L330) auto-fills `invoice_number`, `station`, fuel (only if fuel empty), and suggests the next serial from that deposit's existing schedules.
- Backend `ShipmentSchedule.sync_invoice_number()` forces `invoice_number` and `station` from the deposit on every save, so scheduled rows cannot drift away from their deposit once linked.
- `StationDeposit` fields already include `allocated_amount` and `balance`; `calculate_balance()` subtracts Stock Entries of type `delivery`/`rent` with `docstatus = 1`.
- `monthly_balance_report()` and `calculate_balance()` both read the same Stock Entry pool (`reports.py:355`, `station_deposit.py:19`).
- `monthly_shipments_report()` already joins schedules to deliveries by `delivery` link and already flags `transit`/`undelivered`/`مرحلة` (`reports.py:583–730`).

### 3.2 What is not connected

1. **Deposit is optional on the scheduled form.** The dropdown has `بدون` and the backend only enforces non-empty `invoice_number` (`shipment_schedule.py:17–18`). So a user can create a scheduled row with a typed invoice number and no deposit link, which bypasses station sync, fuel hint, serial basis, and the whole money trail.
2. **No money visibility and no over-commit warning in the scheduled form.** The form never shows the deposit `deposit_amount`, never sums committed shipments against it, never warns when `Σ(qty × price)` would exceed the deposit. Worse, the balance is computed only from Stock Entries and nothing in the app ever creates one, so the balance report's «تكلفة الشحنات» column is always 0 in real SPA usage.
3. **Fuel product is optional on the deposit and never re-validated.** If the deposit has no `fuel_product`, the scheduled form user must fill `fuel_type` manually with no guidance; if they fill a different fuel, nothing flags the mismatch.
4. **Deposit list is not station-scoped.** `ShipmentForm` loads all `/station-deposits/` and a manager sees mixed stations' invoices with only the label to distinguish them.
5. **Supplier never prefills from the station.** `Station.marketing_company` exists, but `ShipmentForm.supplier` starts empty.
6. **No flow bridge.** Saving a deposit does not offer «أضف أول شحنة», and the scheduled form does not offer «لم تُسجّل فاتورة الإيداع؟ أضفها هنا» when the user has a station selected but no deposit yet.

## 4. Design principles

- **Deposit-first booking, not deposit-only booking.** The scheduled form should make the deposit the primary picker, make it effectively required for the scheduled path, and make it easy to create one when it is missing.
- **Booking is a soft hold; receipt is the real balance event.** Show committed-vs-available at booking time, but only move balance when a shipment is confirmed received.
- **Money state belongs on the booking screen.** The operator scheduling a shipment should see the deposit amount, what is already committed, and what remains before they save.
- **Do not branch the user on fuel.** If the deposit carries a fuel product, use it; if it does not, let the user choose, but do not silently accept a mismatch with no guidance.
- **One station context per workflow.** Where a screen supports station scoping, expose a selector in the same place as the screens that already do it (`DashboardView.vue`, `ReadingsView.vue`), don't invent a new pattern per screen.

## 5. Thread A — Station-first selection

### 5.1 Recommended model

Do **not** build a single global header switcher in this spec. Build the smaller, safer thing first: a **shared composable + small selection chip** used by the screens that already have a top dropdown, plus an explicit multistation default policy for screens that currently derive their station implicitly.

This gives multi-station users a consistent selector without pretending the app has a global station context today. There is no shared station chip yet; this spec standardizes the two existing tested patterns (DashboardView.vue and ReadingsView.vue) and extends them into the new deposit/scheduled-shipment/delivery screens. Global persistence can be added later as a separate spec.

### 5.2 What changes

- Add `src/composables/useStationScope.js` (or extend `useAuth.js`) with:
  - `canSwitchStation` = admin or manager or finance.
  - `defaultStationForScreen(screen)` returns the safest default per screen (for scheduled-shipment and deposit-create screens: prefer the station the user is currently acting on; for lists: keep existing behavior).
- Keep the two existing tested patterns as the source of truth:
  - `DashboardView.vue` pattern: aggregate view with «جميع المحطات» + single-station picker + «محطتك» badge when relevant.
  - `ReadingsView.vue` pattern: picker persisted in `sessionStorage['sejel-readings-station']` for the reading workflow.
- Explicitly mark the screens that must show a station selector and the screens that must not. Do that as an integration list in the spec, not as a grep-and-hope sweep.

### 5.3 Screens targeted in this spec

Integrate a station selector where the workflow is station-bound and currently ambiguous for a multi-station user:

- `/inventory/shipments/create` — scheduled and unscheduled paths.
- `/finance/deposits/create` — deposit entry.
- `/inventory/shipment-schedules` list — if it doesn't already scope by station as clearly as the dashboard does.
- `/inventory/deliveries` list — same.

Do **not** change screens that already have their own clear station context until the shared chip exists and the first four screens behave consistently.

## 6. Thread B — Deposit↔shipment wiring

### 6.1 Make scheduled flow deposit-first

**Backend:**

- Keep the deposit optional in the DocType because direct invoice-only entries may still exist and a hard DB constraint is too aggressive for the current data shape.
- Add a workflow-level rule instead: for `is_new()` scheduled rows, require either `deposit` set **or** a real invoice-number-plus-station pair that resolves to an existing deposit. If there is no deposit and no matching invoice, reject with the existing Arabic message «اختر الفاتورة / الإيداع قبل الحفظ».
- Keep `sync_invoice_number()` as-is (it already enforces the deposit's invoice and station on every save).

This removes the practical «بدون» escape hatch for new scheduled rows without breaking legacy data.

**Frontend:**

- Change the scheduled deposit select so «بدون» is not the easy path. The default empty option should be a prompt, not a neutral choice.
- When the user has a station selected but no deposit, show a short inline action: «لم تُسجّل فاتورة الإيداع؟» with a link to `/finance/deposits/create?station=<selected>` (or a small popover that opens the same create form pre-filled with the station).
- When editing an existing row that already has `invoice_number` but no `deposit`, keep the existing invoice but guide the user to attach the matching deposit; do not silently break existing data.

### 6.2 Show deposit money card on the scheduled form

When a deposit is selected, show a small card above or beside the core block:

- فاتورة الإيداع: `<invoice_number>`
- مبلغ الإيداع: `<deposit_amount>` د.ل
- المحجوز (مجموع الجداول المرفقة): `<committed>` د.ل
- المتبقي: `<remaining>` د.ل
- if `committed + current line total > deposit_amount`: warning banner «الكمية الحالية ستتجاوز مبلغ الإيداع» but still allow save.

Committed amount must be computed from existing **scheduled** shipments for that deposit (not only delivered ones), because the point of the card is to prevent over-committing before anything is received.

### 6.3 Station-scoped deposit list + supplier prefill

**Backend:**

- Add a station-filtered station-deposit list endpoint or query param on the existing list, so the scheduled form can request `/station-deposits/?station=<name>` without loading every deposit in the system.

**Frontend:**

- Load deposits filtered by the currently selected station for the scheduled form.
- When the selected deposit has a `fuel_product`, keep current behavior (suggest fuel if empty). Add a soft mismatch warning if the user later picks a different `fuel_type` from the one on the deposit.
- When the selected station has a `marketing_company`, prefill `form.supplier` if it is empty. Allow override.

### 6.4 Wire balance drawdown via Stock Entry

This is the piece that makes the balance report real.

**Trigger:**

- When a scheduled shipment is confirmed received through the arrival flow in `ShipmentForm.vue`, and `confirmArrival` is true, create a **Stock Entry** of `entry_type = delivery` for the station, with:
  - `source` linked to the delivery (the arrival document the user just saved).
  - `total_amount = shipment total_amount` (from the schedule, same value already used for the delivery's accounting amount).
  - `date = arrival_date`.
  - `status = submitted` so the balance/ledger reports recognize it.

**Do not** create the Stock Entry when:
- The user saves a delivery from the unscheduled path without a schedule.
- The user saves an arrival but does not confirm it (schedule status stays open).

**Why delivery-time and not schedule-time:**

- Schedule time is a commitment, not a movement of goods or money. Booking too early double-counts and blocks legitimate partial deliveries.
- Receipt time is when the station actually takes the fuel, and when the invoice/ASN is verified against the gauge. That is where the prepaid balance should move, matching the three-way-match / prepaid-drawdown pattern from the research.

### 6.5 Stock Entry `source` wiring

The `Stock Entry.source` field is already a `Dynamic Link` with `options = "entry_type"`. For delivery entries created from a shipment arrival:

- set `entry_type = delivery`
- set `source` to the delivery name

That makes the existing `calculate_balance()` and `monthly_balance_report()` start working for real shipped-but-not-yet-deducted inventory, without changing either report.

In scope here: backend creation + frontend trigger on confirmed arrival.
Out of scope here: a full Stock Entry UI for manual adjustments. Those are separate.

## 7. Flow bridges

### 7.1 From deposit to first shipment

After saving a new deposit in `DepositForm.vue`, show a clear next action in the success/path-forward state:

- «أضف أول شحنة» → `/inventory/shipments/create?station=<deposit.station>&date=<today>`
- Keep the existing return-to-list link as well; this is an extra, not a replacement.

### 7.2 From scheduled form to deposit creation

If the user is on the scheduled form with a station selected but no deposit, offer:

- inline link / popover to create the deposit for that station
- after creation, return to the scheduled form with the new deposit selected, or at minimum return to the deposit list with the station already chosen

The exact return behavior can be a deep link with `?station=` plus a short-lived hint; the important part is that the user does not have to reconstruct the station selection manually.

## 8. Reconciliation reports (user's explicit requirement)

This spec must improve what the reconciliation-facing reports show.

### 8.1 Monthly balance report

After the Stock Entry wiring in §6.4, this report should start showing real «تكلفة الشحنات» for delivered receipts against deposits. No report logic change is required for that to start working, because both `calculate_balance()` and `monthly_balance_report()` already read the same Stock Entry pool. The spec's job is to ensure the Stock Entry is actually created with the right `station`, `entry_type`, `total_amount`, `date`, and `status`.

### 8.2 Monthly shipment report

This report already joins schedules to deliveries and already flags `undelivered`/`transit`/`مرحلة`. This spec should make two reconciliation buckets explicit:

- **Scheduled but not delivered within the month**, including rows whose `expected_shipping_date` is in the month but which have no linked delivery. Today some of these are invisible in the «غير المسلّم» KPI depending on status wording; the report should make them easy to see.
- **Transit/مرحلة rows** — already present in the report; keep them visible and do not let them disappear when the schedule has no arrival yet.

No new report is required in this spec; the requirement is that the existing reports are accurate after the arrival flow creates Stock Entries and links deliveries to schedules.

## 9. Out of scope

- Global header station switcher with cross-navigation persistence.
- Manual Stock Entry creation UI for non-arrival deductions.
- Status auto-progression jobs or background reconciliation jobs.
- Data migration of legacy rows that currently have an invoice number but no deposit link; those rows stay as-is and the scheduled-create rule only applies to new rows.

## 10. Testing approach

### 10.1 Backend

- `bench run-tests --app sejel_app` covering:
  - new scheduled row without deposit and without matching invoice → rejected with the Arabic message.
  - new scheduled row with a valid deposit → invoice + station forced, fuel pre-filled if deposit has one.
  - Stock Entry creation on confirmed arrival with correct station, entry_type, total_amount, source, date, status.
  - no Stock Entry created for non-confirmed arrival or unscheduled-only delivery.

### 10.2 Frontend

- Build passes with no new dependencies.
- Scheduled form with no deposit and no station selected: cannot proceed; offered a deposit-create path.
- Scheduled form with deposit selected: money card renders, committed sum includes existing scheduled rows for that deposit, over-commit warning appears when applicable.
- Supplier prefills from station marketing company if empty; user can override.
- Deposit list is station-scoped for the scheduled form.
- Confirmed arrival creates a Stock Entry; non-confirmed arrival does not.
- Deposit save offers next-shipment action.

### 10.3 QA suite

Extend `sejel/e2e-tests/qa-phase5-inventory.js` (or a phase 6) with one focused deposit↔shipment money-case scenario on `QA Edge Station` only, including:

- create deposit for QA Edge Station
- schedule a shipment against it, verify money card and serial suggestion
- receive the shipment with confirmation, verify deposit balance moves and Stock Entry exists
- verify monthly balance report sees the deduction
- cleanup via admin because manager lacks delete permissions on these doctypes

Do not run these cases against `محطة الراحلة 23` or any station that already has real financial history.

## 11. Risks and notes

- The «بدون» path removal is workflow-level for new rows, not a database constraint. If a legitimate invoice-without-deposit scheduled row is ever needed, it can be revisited, but today the deposit-first flow is the intended one.
- Over-commit warning must use committed scheduled rows, not only delivered rows, because the goal is to prevent over-booking before receipt.
- Stock Entry creation on arrival must be robust against the partial-failure case already handled in `ShipmentForm.vue`: if the Stock Entry creation fails, the delivery should still be saved and the user warned, not silently lose the receipt.
- Because nothing creates Stock Entries today, the first QA run against QA Edge Station will be the first real proof that `allocated_amount` and the balance report become non-zero in live usage.
