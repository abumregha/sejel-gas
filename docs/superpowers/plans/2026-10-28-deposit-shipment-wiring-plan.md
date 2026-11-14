# Plan: Station-first deposit→shipment wiring + shipment money ledger

**Date:** 2026-10-28  
**Spec:** `docs/superpowers/specs/2026-10-28-deposit-shipment-wiring-design.md`  
**Review:** `docs/superpowers/reviews/2026-10-28-deposit-shipment-wiring-review.md`  
**Branch:** keep working on `master` (SPA/docs) and `develop` (bench app) per the repo layout in the spec.  
**Order:** backend first, then frontend, then QA. Money invariant is the first backend task because everything else depends on it.

## Review adjustments baked in

1. Stock Entry deduction is expressed as an invariant in Task 3, plus the negative form in Task 3 and Task 5.
2. Deposit-list filtering is one concrete decision: reuse the existing generic `?station=` path on `/api/resource/station-deposits/`. No second endpoint.
3. Fuel-mismatch behavior is the three-case table in Task 6.
4. «بدون» change is precise: new-row workflow rule only; edit path keeps existing invoice and surfaces attach-deposit guidance without blocking.
5. Money-card UI states are explicit in Task 7.

## Repo reminders

- SPA + docs: `/root/projects/Sejel` (`master`)
- Bench app: `/home/frappe/bench/apps/sejel_app` (`develop`)
- Backend service: `sudo systemctl restart sejel-bench` after Python changes
- Bench commands: `cd /home/frappe/bench && sudo -u frappe bench --site sejel.local <cmd>`
- DB: PostgreSQL `_730feba3f0c64c86`; verify with `sudo -u postgres psql -d _730feba3f0c64c86 -c "…"`; do not use `bench mariadb`
- SPA build: `cd /root/projects/Sejel/sejel/frontend && npm run build`
- QA login: `owner@sejel.ly / owner123`, `admin@sejel.ly / admin123`
- QA isolation: manager cannot delete Delivery / Shipment Schedule / Station Deposit; cleanup must be done as admin; schedule↔delivery are cross-linked so cleanup is unlink-first
- QA station only: `QA Edge Station` (`vscak9tird`); never run deposit/money cases against `محطة الراحلة 23` or any station with real financial history

## Tasks

### Task 1: Backend — station-scoped deposit list already works; confirm and document the contract

**Purpose:** confirm the frontend can load deposits filtered by station without a new endpoint and without reopening the shift-child filter drop bug.

**Files:**
- Modify: `sejel_app/api/scoping.py` — no logic change expected; only confirm `Station Deposit` is in `DIRECT_STATION_DOCTYPES` and has a direct `station` field
- Modify: `sejel_app/api/views.py` — no logic change expected; confirm `station-deposits` list honors `?station=`
- Modify: `sejel_app/sejel_app/api/__init__.py` or relevant export if a typed helper is added for the frontend contract

**Done when:**
- `Station Deposit` is still a direct `station` Link doctype in `DIRECT_STATION_DOCTYPES`
- `GET /api/resource/station-deposits/?station=<name>` returns only that station's deposits
- The frontend contract is: use the existing generic list with `?station=`

**Verify:**
- `curl` the filtered list for `QA Edge Station` and confirm count and station values
- Confirm a request for a station with no deposits returns `results: []`

---

### Task 2: Backend — scheduled-create deposit-first rule (new rows only)

**Purpose:** make the scheduled flow deposit-first for new rows without breaking legacy invoice-without-deposit rows.

**Files:**
- Modify: `sejel_app/sejel_app/doctype/shipment_schedule/shipment_schedule.py`

**Change:**
- In `validate()` (or a dedicated validate method called from `validate()`), for `is_new()` rows:
  - if `self.deposit` is set → keep existing behavior (sync handles invoice + station)
  - elif `self.invoice_number` and `self.station` are set → look up an existing `Station Deposit` with that invoice number and station; if found, set `self.deposit` to it so the row is tied to the deposit; if not found, reject with `frappe.throw("اختر الفاتورة / الإيداع قبل الحفظ")`
  - else → reject with the same message
- Keep `sync_invoice_number()` as-is
- Do not change the DocType `deposit` field to required; this is a workflow rule on new rows only

**Done when:**
- New scheduled row with no deposit and no matching invoice is rejected with `اختر الفاتورة / الإيداع قبل الحفظ`
- New scheduled row with a valid deposit is accepted and forced to that deposit's invoice + station
- New scheduled row with a typed invoice that matches an existing deposit for that station is accepted and linked to that deposit
- Existing invoice-without-deposit rows can still be edited without being blocked by this rule

**Verify:**
- Backend test in Task 9 covers the positive and negative cases
- Manual curl/post against the dev site confirms the message text

---

### Task 3: Backend — Stock Entry deduction invariant (the money trail)

**Purpose:** make the balance report real by creating the Stock Entry the existing reports already expect.

**Verified:**
- `tabStock Entry` already exists on the site.
- Its columns are exactly `station`, `entry_type`, `source`, `total_amount`, `date`, `status` (plus `remarks`, `details`).
- `StationDeposit.calculate_balance()` and `monthly_balance_report()` both query this table with the same station + entry_type filter, so the invariant below is the condition under which «تكلفة الشحنات» becomes non-zero.

**Files:**
- Modify: `sejel_app/sejel_app/doctype/shipment_schedule/shipment_schedule.py` — add the Stock Entry creation hook

**Invariant:**
- For every confirmed arrival that sets `ShipmentSchedule.status = delivered` and links `Delivery.shipment_schedule`:
  - exactly one `Stock Entry` exists with
    - `entry_type = delivery`
    - `station = <schedule.station>`
    - `source = <delivery.name>`
    - `total_amount = <schedule.total_amount>`
    - `date = <delivery.arrival_date>`
    - `status = submitted`
- Negative form:
  - an unconfirmed arrival does not create a Stock Entry
  - an unscheduled-only delivery does not create a Stock Entry

**Change:**
- Add a method, e.g. `create_delivery_stock_entry(delivery_name, arrival_date)` on `ShipmentSchedule`
- Call it from the controller path that confirms arrival, before or after the schedule status update, with robust partial-failure handling:
  - if the Stock Entry creation fails, the delivery save must still stand and the caller must be warned; do not lose the receipt
- Set:
  - `entry_type = "delivery"`
  - `station = self.station`
  - `source = delivery_name`
  - `total_amount = self.total_amount`
  - `date = arrival_date`
  - `status = "submitted"`
- Do not create one for:
  - unscheduled deliveries
  - arrivals saved without `confirmArrival`

**Done when:**
- Confirmed arrival on a scheduled shipment creates exactly one matching Stock Entry
- Unconfirmed arrival creates none
- Unscheduled-only delivery creates none
- Failed Stock Entry creation does not roll back the delivery save; caller sees a warning

**Verify:**
- Backend test in Task 9 asserts the invariant and the negative cases
- QA in Task 11 asserts balance and Stock Entry existence after a confirmed arrival

---

### Task 4: Backend — tests for deposit-first rule + Stock Entry invariant

**Files:**
- Modify/Add: `sejel_app/sejel_app/tests/test_shipment_link.py` or a new test module if cleaner

**Coverage:**
- New scheduled row, no deposit, no matching invoice → rejected with Arabic message
- New scheduled row, valid deposit → invoice + station forced, deposit linked
- New scheduled row, typed invoice matching an existing deposit for that station → linked to that deposit
- Existing invoice-without-deposit row can still be edited
- Confirmed arrival creates one Stock Entry with the exact field values above
- Unconfirmed arrival creates no Stock Entry
- Unscheduled-only delivery creates no Stock Entry
- Failed Stock Entry creation does not lose the delivery

**Done when:**
- `bench run-tests --app sejel_app` passes with the new cases included
- Test output names the invariant explicitly

**Verify:**
- `cd /home/frappe/bench && sudo -u frappe bench --site sejel.local run-tests --app sejel_app` exit code 0

---

### Task 5: Frontend composable — small shared station scope helper

**Purpose:** give the deposit and shipment entry forms a consistent station-scope helper without building a global header switcher.

**Files:**
- Add: `sejel/frontend/src/composables/useStationScope.js`

**Contents:**
- `canSwitchStation()` → `auth.isAdmin || ['manager','finance'].includes(auth.role)`
- `defaultStationForScreen(screen)`:
  - for scheduled-shipment and deposit-create screens: prefer the station the user is acting on; fall back to the existing per-screen default behavior
  - for lists: keep existing behavior
- Keep this small. Do not introduce global persistence in this plan.

**Done when:**
- The two entry screens can import a shared helper instead of re-deriving the same policy
- No global header switcher is introduced

**Verify:**
- Static check: the composable exists and exports `canSwitchStation` and `defaultStationForScreen`
- No other screen is changed except the targeted entry forms and the two lists named below

---

### Task 6: Frontend — deposit form: next-shipment bridge after save

**Purpose:** implement the «أضف أول شحنة» bridge from deposit save.

**Files:**
- Modify: `sejel/frontend/src/views/finance/DepositForm.vue`
- Optionally: `sejel/frontend/src/views/finance/DepositList.vue` if the bridge is clearer there, but the spec asks for it on save

**Change:**
- After a successful deposit save, show a path-forward state that includes:
  - «أضف أول شحنة» → `/inventory/shipments/create?station=<deposit.station>&date=<today>`
  - keep the existing return-to-list link as well
- If editing an existing deposit, still show the link to schedule against that station

**Done when:**
- A newly saved deposit offers a direct next action to schedule the first shipment against that station
- The existing list link still works

**Verify:**
- Build passes
- Manual: create a deposit, confirm the next-shipment link appears and goes to the right URL with the station and today's date

---

### Task 7: Frontend — scheduled form: deposit-first select, money card, fuel table, supplier prefill, deposit-create affordance

**Purpose:** this is the main frontend task for Thread B.

**Files:**
- Modify: `sejel/frontend/src/views/inventory/ShipmentForm.vue`
- Modify: `sejel/frontend/src/composables/useStationScope.js` if the form uses it

**Changes:**

1. Deposit select behavior
   - For the scheduled type, the empty option becomes a prompt, not a neutral choice
   - When a station is selected but no deposit is chosen, show «لم تُسجّل فاتورة الإيداع؟» with a link to `/finance/deposits/create?station=<selected>`
   - When editing an existing row with an invoice but no deposit, keep the invoice and show attach-deposit guidance; do not block the rest of the row

2. Money card
   - When a deposit is selected, show:
     - فاتورة الإيداع: `<invoice_number>`
     - مبلغ الإيداع: `<deposit_amount>` د.ل
     - المحجوز: `<committed>` د.ل
     - المتبقي: `<remaining>` د.ل
   - committed = sum of `total_amount` for existing scheduled shipments for that deposit
   - if `committed + current line total > deposit_amount`: show warning «الكمية الحالية ستتجاوز مبلغ الإيداع», still allow save

3. Fuel three-case table
   - deposit has no `fuel_product` → user chooses fuel, no auto-suggest, no warning
   - deposit has `fuel_product` and form fuel empty → auto-fill from deposit
   - deposit has `fuel_product` and form fuel differs → soft warning, allow override

4. Supplier prefill
   - when the selected station has a `marketing_company` and `form.supplier` is empty, prefill it
   - allow override

5. Deposit list scoping
   - load deposits for the scheduled form from `/api/resource/station-deposits/?station=<selected>` when a station is selected; fall back to the existing behavior if station is not yet selected

**Done when:**
- Scheduled form shows the money card after a deposit is selected
- Over-commit warning appears but save is still allowed
- Fuel behavior matches the three-case table
- Supplier prefills from the station's marketing company if empty
- Deposit list is station-scoped for the scheduled form
- Deposit-create affordance appears when a station is selected but no deposit is chosen

**Verify:**
- `npm run build` passes with no new dependencies
- Manual: create deposit → schedule against it → money card + serial suggestion + supplier prefill appear; over-commit scenario shows warning
- Manual: scheduled edit of an existing invoice-without-deposit row is not blocked

---

### Task 8: Frontend — small station-first touch on the two lists

**Purpose:** make the deposit/scheduled-shipment/delivery lists show a consistent station-first picker where they currently do not.

**Files:**
- Modify: `sejel/frontend/src/views/inventory/ShipmentScheduleList.vue`
- Modify: `sejel/frontend/src/views/inventory/DeliveryList.vue`
- Use: `useStationScope.js`

**Change:**
- Add a station selector in the same pattern as the existing tested screens, scoped to admin/manager/finance
- Default policy: safest sensible value per screen, not a random single station; for multi-station users, the picker should make the scope explicit
- Do not rewrite list internals; only add the station-first picker and wire it to the existing `?station=` contract where applicable

**Done when:**
- Both lists expose a station picker consistent with the entry-form screens
- The picker does not break existing behavior for single-station users

**Verify:**
- Build passes
- Manual: admin/manager sees the picker; owner sees the appropriate default

---

### Task 9: Backend test file — concrete cases

**Purpose:** make Task 4 executable.

**Files:**
- Modify/Add: `sejel_app/sejel_app/tests/test_shipment_link.py` or a new focused test module

**Note:**
- If `test_shipment_link.py` already covers shipment link guards, extend it; otherwise add a small focused module for deposit-first + Stock Entry invariant

**Done when:**
- The test module names the invariant and covers the positive and negative cases listed in Task 4

**Verify:**
- `bench run-tests --app sejel_app` includes the new cases

---

### Task 10: QA — one focused deposit↔shipment money case

**Purpose:** the first real proof that balance moves in live usage.

**Files:**
- Modify: `sejel/e2e-tests/qa-phase5-inventory.js` or add a small phase-6 file

**Case, on QA Edge Station only:**
1. create a deposit for QA Edge Station
2. schedule a shipment against it — verify money card, serial suggestion, supplier prefill
3. receive the shipment with confirmation — verify deposit balance moved and a Stock Entry exists with the right fields
4. verify the monthly balance report sees the deduction
5. cleanup as admin, unlink-first

**Do not:**
- run this case against محطة الراحلة 23 or any station with real financial history
- run it as manager for cleanup; use admin

**Done when:**
- The QA case passes
- `allocated_amount` and the balance report become non-zero for the test station after the confirmed arrival

**Verify:**
- Run the QA case against QA Edge Station
- Confirm Stock Entry fields and balance report values via API

---

### Task 11: QA — money invariant negative cases

**Purpose:** prove the negative side of the invariant.

**Case, on QA Edge Station only:**
- confirm arrival without checking confirmArrival → no Stock Entry, schedule status not forced to delivered
- create an unscheduled-only delivery → no Stock Entry

**Done when:**
- The negative cases pass

**Verify:**
- API assertions for Stock Entry nonexistence in the negative scenarios

---

### Task 12: Cleanup and checkpoint

**Purpose:** leave the QA log and the workspace in a clean state for the next run.

**Files:**
- Update: `sejel/e2e-tests/qa-checkpoints/qa-run-log.md`

**Done when:**
- The new deposit↔shipment money case is checkpointed
- No repeated pilot-guns/baseline-reads block is re-run
- Customer station is verified untouched

**Verify:**
- QA log reflects the new phase, not a runaway repeat

---

## Order of execution

1. Task 1 — confirm deposit-list filtering contract  
2. Task 2 — scheduled-create deposit-first rule  
3. Task 3 — Stock Entry deduction invariant  
4. Task 4/9 — backend tests  
5. Verify backend: `bench run-tests --app sejel_app`  
6. Task 5 — station-scope composable  
7. Task 7 — scheduled form money card + deposit-first + fuel + supplier + scoped deposit list  
8. Task 6 — deposit-form next-shipment bridge  
9. Task 8 — two lists station-first picker  
10. Verify frontend: `npm run build`  
11. Task 10 — positive QA money case  
12. Task 11 — negative QA cases  
13. Task 12 — checkpoint QA log

## Out of scope for this plan

- Global header station switcher with cross-navigation persistence
- Manual Stock Entry UI for non-arrival deductions
- Background reconciliation or status auto-progression jobs
- Migration of legacy invoice-without-deposit rows
