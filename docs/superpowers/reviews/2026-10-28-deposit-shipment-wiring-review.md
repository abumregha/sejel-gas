# Review: Station-first deposit→shipment wiring + shipment money ledger (A + B)

**Reviewed:** 2026-10-28
**Against:** `docs/superpowers/specs/2026-10-28-deposit-shipment-wiring-design.md`
**Decision:** approved subject to the adjustments below. Do not start implementation until the adjustments are in the spec.

## What is good

- The spec does not invent a global station switcher just because it sounds nice. It keeps Thread A small and concrete: standardize the two existing tested patterns and extend them into the deposit/scheduled-shipment/delivery entry point. That is the right-sized move.
- The money trail is the right center of gravity. Making the scheduled form show deposit / committed / remaining, and wiring the balance drawdown to confirmed arrival via Stock Entry, directly fixes the two defects that can actually produce wrong accounting.
- Arrival-time deduction is the correct choice for this flow. Schedule time is a commitment; receipt time is when the fuel is verified against the gauge and the invoice/ASN is matched. Drawing down at receipt keeps partial deliveries sane.
- The spec is honest about what already exists: `calculate_balance()` and `monthly_balance_report()` already read the same Stock Entry pool (`station_deposit.py:19`, `reports.py:355/398`), Stock Entry already has the right `source` Dynamic Link and `entry_type` options, and `?station=` already filters `station-deposits` because that doctype has a direct `station` Link and is in `DIRECT_STATION_DOCTYPES`. No fake endpoint or fake field is proposed.
- The partial-failure handling is already in `ShipmentForm.vue` (`confirmArrival` + catch with the warning «تم حفظ الشحنة، تعذر تحديث حالة الجدول — حدّثها يدوياً»). The spec correctly says Stock Entry creation must not break that.
- QA guardrails are present and specific: QA Edge Station only, admin cleanup because manager lacks delete permissions on these doctypes, never against محطة الراحلة 23 or any station with real financial history.

## Adjustments to make before implementation

1. **Make the Wire draw-down requirement testable in one sentence.**
   The spec says the right thing, but implementation and QA need the invariant up front:
   - Invariant: for every confirmed arrival that sets `ShipmentSchedule.status = delivered` and links `Delivery.shipment_schedule`, there must be exactly one `Stock Entry` with `entry_type = delivery`, `station = <schedule.station>`, `source = <delivery.name>`, `total_amount = <schedule.total_amount>`, `date = <delivery.arrival_date>`, `status = submitted`.
   - Add the negative form too: an unconfirmed arrival, and an unscheduled-only delivery, must not create a Stock Entry.
   Put that as a short invariant block in §6.4. It is the thing the backend test and the QA run both need.

2. **Clarify one ambiguity in `?station=` filtering.**
   The spec says «Add a station-filtered station-deposit list endpoint or query param on the existing list». In practice the existing generic list already supports `?station=` for this doctype. So the implementation choice is:
   - use the existing `GET /api/resource/station-deposits/?station=<name>` path, or
   - add a dedicated `GET /api/station-deposits/?station=` wrapper if the SPA wants a cleaner resource name.
   Pick one. If the existing generic endpoint is good enough, say so explicitly and drop the «or» language. Do not leave the backend with two ways to do the same filter.

3. **Tighten the fuel mismatch behavior.**
   The spec says «soft mismatch warning if the user later picks a different fuel_type from the one on the deposit». That is good, but the spec should also say what happens when the deposit has no `fuel_product`:
   - if deposit.fuel_product is empty, scheduled form fuel is user-chosen, no warning, no auto-suggest
   - if deposit.fuel_product is set and form fuel is empty, auto-fill it
   - if deposit.fuel_product is set and form fuel differs, show warning but allow override
   That three-case table is the actual behavior; the current wording is slightly loose around the empty-deposit case.

4. **Make the «بدون» change precise.**
   The spec says «Change the scheduled deposit select so «بدون» is not the easy path». That is fine, but the backend rule is the real gate, so pin it down:
   - scheduled create: reject if neither `deposit` nor a matching deposit for the typed invoice+station exists
   - scheduled edit: keep existing invoice; if there is no deposit yet, surface the attach-a-deposit guidance, but do not block saving the rest of the row
   That keeps existing data readable and keeps the new rule on new rows only, which is what the out-of-scope note already promises.

5. **Add one required UI state for the money card.**
   Before the deposit is selected, the scheduled form should still show the «لم تُسجّل فاتورة الإيداع؟» affordance when a station is selected. After the deposit is selected, the card must appear. This sounds obvious, but it is worth writing as an explicit UI state list:
   - station selected, no deposit → deposit-create affordance
   - deposit selected → money card + serial suggestion + supplier prefill
   - deposit selected + fuel mismatch → soft warning
   - over-commit → warning banner, save still allowed

## Minor cleanups

- §6.3 backend bullet says «Add a station-filtered station-deposit list endpoint or query param». After adjustment 2, this should be one concrete decision.
- §8.2 says «some of these are invisible in the «غير المسلّم» KPI depending on status wording». If the work touches that KPI wording, call it out as a small explicit change; if it only touches the report rows, say the KPI is unchanged and the report rows are the fix. Right now the passage is ambiguous about whether the KPI itself changes.
- §5.3 lists four screens. Confirm whether `/inventory/shipment-schedules` and `/inventory/deliveries` lists already have a station filter today, and if they do, say whether this spec changes them or only the entry forms. I do not want Thread A to silently grow into a list-refresh project.

## What I am approving

Approved with the above adjustments:
- Thread A scoped to consistent station-first selection on the deposit and shipment entry forms and the two lists named, built on the existing DashboardView/ReadingsView patterns.
- Thread B scoped to deposit-first scheduled flow, money card with over-commit warning, station-scoped deposit list, supplier prefill from marketing_company, and Stock Entry balance drawdown on confirmed arrival.
- Reconciliation improvement scoped to making the existing monthly balance and monthly shipment reports accurate through the Stock Entry wiring, plus explicit visibility for scheduled-but-not-delivered and transit/مرحلة rows.
- Out of scope preserved: global header switcher, manual Stock Entry UI, background jobs, legacy migration.
