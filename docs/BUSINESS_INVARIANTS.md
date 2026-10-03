# Sejel — Business Invariants

> **Date:** 2026-08-27  
> **Status:** Living Document  
> **Purpose:** Every formula in the system, with corresponding test coverage.

---

## 1. Shift Reconciliation (Financial)

### 1.1 Liters Sold (per meter)

```
liters_sold = closing_reading - opening_reading
```

- **Code:** `apps/shifts/services.py:82`
- **Test:** `MeterReadingTests` (4 tests)
- **Edge case:** If `closing_reading < opening_reading` and no `override_reason`, raises `ValueError`

### 1.2 Fuel Expected Sales (per fuel type)

```
fuel_expected_sales = Σ(liters_sold × frozen_unit_price)
```

- **Code:** `apps/shifts/services.py:97-130`
- **Frozen price:** The `FuelPrice.selling_price` effective on `shift.date` is captured at close time and stored in `ShiftFuelSummary.unit_price`
- **Test:** `P0MultiFuelTests` (11 tests), especially `test_frozen_price_not_changed_by_future_price_update`

### 1.3 Total Expected Sales

```
total_expected_sales = Σ(fuel_expected_sales)
```

- **Code:** `apps/shifts/services.py:130`
- **Test:** `P0MultiFuelTests.test_per_fuel_reconciliation_totals`

### 1.4 Total Collected

```
total_collected = cash + vouchers + POS
```

- **Code:** `apps/shifts/services.py:137-143`
- **Cash:** `CashCollection.objects.filter(shift=shift, is_cancelled=False).aggregate(Sum('amount'))`
- **Vouchers:** `Voucher.objects.filter(shift=shift, is_cancelled=False).aggregate(Sum('total_value'))`
- **POS:** `POSRecord.objects.filter(shift=shift, is_cancelled=False).aggregate(Sum('total_amount'))`
- **Test:** `FinanceAccessTests` (5 tests)

### 1.5 Reconciliation Difference

```
difference = total_collected - total_expected_sales
```

- **Code:** `apps/shifts/services.py:155`
- **Type:**
  - `difference == 0` → `matched` (مطابق)
  - `difference > 0` → `surplus` (فائض) — employee incentive, NOT revenue
  - `difference < 0` → `shortage` (عجز) — station absorbs loss
- **Test:** `P0MultiFuelTests` (all tests verify difference_type)

### 1.6 Net Cash

```
net_cash = cash_collected - cash_expenses
```

- **Code:** `apps/shifts/services.py:148-149`
- **Expenses:** Only `payment_method='cash'` and `status__in=['pending', 'approved']`
- **Important:** Expenses do NOT reduce `expected_sales`. They only reduce `net_cash`.
- **Test:** `P1ContinuityAndExpensesTests.test_7_expected_sales_not_reduced_by_expenses`

### 1.7 Cash Position (Full)

```
cash_position:
  cash_collected
  - cash_expenses
  = net_cash

sales_position:
  expected_sales (liters × frozen_price)

collection_position:
  cash + vouchers + POS = total_collected

difference:
  total_collected - expected_sales = difference
```

- **Important distinction:** `Sales ≠ Cash`. Expected sales is an accrual concept (what should have been collected). Cash position is what was actually collected.

---

## 2. Tank Inventory (Physical)

### 2.1 Theoretical Level

```
theoretical = opening_reading + received + transferred_in - transferred_out - sold
```

- **Code:** `apps/inventory/fuel_reconciliation.py:76`
- **Components:**
  - `opening_reading`: Most recent `TankReading` before the reconciliation closing reading
  - `received`: Sum of `Delivery.received_quantity` since opening reading
  - `transferred_in`: Sum of `TankTransfer.quantity` where `to_tank=this_tank` and `status='completed'`
  - `transferred_out`: Sum of `TankTransfer.quantity` where `from_tank=this_tank` and `status='completed'`
  - `sold`: Sum of `MeterReading.liters_sold` for meters connected to this tank
- **Test:** `FuelReconciliationTests` (12 tests)

### 2.2 Variance

```
variance = actual_level - theoretical_level
```

- **Code:** `apps/inventory/fuel_reconciliation.py:149`
- **Type:**
  - `variance == 0` → `matched`
  - `variance > 0` → `surplus` (more fuel than expected)
  - `variance < 0` → `shortage` (less fuel than expected)
- **Test:** `FuelReconciliationTests`

### 2.3 Transfer Level Updates

```
source_tank.current_level -= quantity   # applied exactly once, on insert
dest_tank.current_level += quantity
```

- **Code:** `sejel_app/sejel_app/doctype/tank_transfer/tank_transfer.py`
  (`validate` for every rule, `after_insert` for the stock movement)
- **Validation:** same station, same fuel type, source ≠ destination,
  quantity > 0, **source level ≥ quantity** (may not go negative),
  **destination level + quantity ≤ capacity** (may not overflow)
- **Applied once:** the bounds are evaluated only while `is_new()`, and the
  movement runs only from `after_insert` — a later save of the same document
  re-validates against a level that has already been debited
- **Test:** `qa-transfer-test.js` (19 steps, browser-driven), refusal messages
  read from the form's own error box; `qa-phase6-reports.js` re-asserts the
  Arabic refusals (3 × HTTP 417)

---

## 3. Delivery

### 3.1 Received Quantity

```
received_quantity = post_reading - pre_reading
```

- **Code:** `apps/inventory/models.py:161-167` (Delivery.calculate_shortage)
- **Test:** `P1Phase2FuelDeliveryTests` (16 tests)

### 3.2 Shortage

```
shortage = max(0, expected_quantity - received_quantity)
```

- **Code:** `apps/inventory/models.py:165`
- **Auto-calculated** by `Delivery.calculate_shortage()`
- **Test:** `P1Phase2FuelDeliveryTests`

### 3.3 Shortage Claim Lifecycle

```
not_claimed → claimed → settled → closed
```

- **Code:** `apps/inventory/models.py:190-210` (ShortageClaim)
- **Test:** `P1Phase2FuelDeliveryTests`

---

## 4. Voucher Settlement

### 4.1 Outstanding Balance

```
outstanding = total_value - paid_amount
```

- **Code:** `apps/finance/models.py:166-168` (VoucherSettlement.outstanding property)
- **Test:** `VoucherSettlementTests` (12 tests)

### 4.2 Denomination Breakdown

```
total_value = (5 × count_5) + (6 × count_6) + (8 × count_8)
```

- **Code:** `apps/finance/models.py` (VoucherSettlement fields: `denom_5`, `denom_6`, `denom_8`)
- **Test:** `VoucherSettlementTests`

---

## 5. Profit (Report Only)

### 5.1 Gross Profit

```
gross_profit = Σ(liters_sold × profit_margin) per fuel type
```

- **Note:** This is a report-level calculation, not stored in the reconciliation model
- **FuelPrice.profit_margin** is the difference between `selling_price` and `cost_per_liter`

### 5.2 Net Profit

```
net_profit = gross_profit - total_expenses
```

- **Important:** `revenue ≠ cash_position`. Revenue is accrual-based (liters × price). Cash position is cash-basis (what was collected).

### 5.3 Revenue vs Cash

```
Sales (accrual) ≠ Cash collected
Gross Profit ≠ Cash position
Net Profit ≠ Net cash flow
```

- **Example:** A station sells 10,000L × 0.150 LYD = 1,500 LYD in expected sales. But collected only 1,480 LYD in cash. The 20 LYD difference is the reconciliation difference (shortage).

---

## 6. Meter Continuity

### 6.1 Continuity Rule

```
For each meter, readings must be sequential:
  reading_N.start_reading == reading_(N-1).end_reading
```

- **Code:** `apps/shifts/continuity.py`
- **Exception:** If `override_reason` is provided, gap is allowed but flagged
- **Test:** `P1ContinuityAndExpensesTests` (10 tests)

### 6.2 Meter Current Reading Update

```
After shift close:
  meter.current_reading = shift_reading.end_reading
```

- **Code:** `apps/shifts/services.py:87-88`
- **Test:** Verified in shift close tests

---

## 7. Shift Lifecycle

### 7.1 Status Transitions

```
scheduled → open → in_progress → submitted → closed
                                        ↓
                                    reopened → closed (re-close)
```

- **Test:** Various shift tests

### 7.2 Close Guard

```
If shift is already closed, re-close replaces the reconciliation
(update_or_create + delete/recreate fuel summaries)
```

- **Code:** `apps/shifts/services.py:160-190`
- **Test:** `P0MultiFuelTests.test_reopen_recalculation_uses_frozen_price`

---

## 8. RBAC Invariants

### 8.1 Station Scoping

```
admin/owner/manager → all stations
supervisor/finance   → assigned station only (User.sejel_station)
```

- **Code:** `sejel_app/api/scoping.py`
  - `scoped_station()` — who is bound (System Manager / Sejel Manager never are)
  - `check_station()` — read path: a bound user loading a document outside
    their station gets `PermissionError` («غير مصرح لك بالوصول إلا لبيانات محطتك»)
  - `check_station_payload()` — write path: a create/update payload that names
    another station is refused before the row exists
  - `apply_to_filters()` — list path: the bound station is injected, and
    `?station=` can only narrow it, never widen it
- **Endpoints:** every `/api/…` route requires a session — the only
  `allow_guest=True` endpoints left are the four auth routes and the client
  error reporter (`api/ux.py`)
- **Test:** `qa-round4-isolation.js` (25 steps) — list scoping, foreign
  GET/PUT/create refusal, foreign station hidden from the picker, export and
  daily sales cross-checked against backend rows, guest browser gets nothing

### 8.2 Operation Permissions

```
admin/owner: full access
supervisor: operations CRUD (shifts, readings, employees)
finance: financial CRUD (cash, vouchers, POS, expenses, reconciliation)
```

- **Code:** DocType role permissions (`*.json` → `permissions`) — e.g.
  Tank Transfer: System Manager / Sejel Manager / Sejel Supervisor; Expense:
  create+write for Finance and Manager, read-only for Supervisor — plus
  `ROLE_TO_FRAPPE` in `sejel_app/api/views.py` when the SPA picks a role
- **Test:** `qa-round4-isolation.js` (bound supervisor / bound finance write
  attempts), `qa-phase4-finance.js` (38 steps, finance-only numbers), `qa-phase3-readings.js` (42 steps, employee vs admin teardown)

---

## Test Coverage Summary

All coverage is **browser-driven** (`sejel/e2e-tests/`, Playwright/Chromium).
The Python test classes that earlier revisions of this table listed
(`AuthAndIsolationTests`, `P0MultiFuelTests`, …) never existed in this
repository — there are zero `test_*.py` files in the app.

| Invariant | Suite | Steps |
|-----------|-------|-------|
| 1.1-1.7 Shift reconciliation | `qa-phase4-finance.js` | 38 |
| 2.1-2.3 Tank inventory / transfers | `qa-transfer-test.js` | 19 |
| 3.1-3.3 Delivery | `qa-phase5-inventory.js` | 14 |
| 4.1-4.2 Voucher settlement | `qa-phase4-finance.js` | (included above) |
| 6.1-6.2 Meter continuity | `qa-phase3-readings.js` | 42 |
| Exception matrix (refusals, Arabic) | `qa-exceptions-matrix.js` | 13 |
| 7.1-7.2 Shift lifecycle | `qa-cycle-matrix.js` + `qa-round4-cycle.js` | 16 + 8 |
| 8.1-8.2 RBAC / scoping | `qa-round4-isolation.js` | 25 |
| Report refusals (tank transfer, QA-24) | `qa-phase6-reports.js` | 35 |
| Harness safety (own-records-only) | `qa-harness-safety.js` | 12 |
| End-to-end gun journey | `qa-phase8-journey.js` | 14 |
| Responsive / mobile layout | `qa-phase7-responsive.js` + `qa-round4-mobile.js` | 33 + 12 |
| Station fixture + teardown | `qa-round4-fixture.js` + `qa-round4-reset.js` | 10 + 4 |
| **Total (round 4, 2026-10-03)** | | **295** |

Step counts are from the round-4 runs recorded in `docs/QA_ROUND_4_REPORT.md`.
Suites are re-runnable: each one restores its own station's state before it
asserts anything, so a second consecutive run reports the same numbers.

---

## Adding New Invariants

When adding a new business rule:

1. Document the formula in this file
2. Write a test that verifies the formula
3. Reference the test class in the table above
4. If the formula involves money, it MUST have a corresponding test
