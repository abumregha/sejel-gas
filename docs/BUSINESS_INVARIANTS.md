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
source_tank.current_level -= quantity
dest_tank.current_level += quantity
```

- **Code:** `apps/core/models.py` (TankTransfer.clean) + transfer completion logic
- **Validation:** Same station, same fuel type, source ≠ destination, quantity > 0
- **Test:** `TankTransferTests` (11 tests)

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
admin/owner → all stations
supervisor/finance → assigned station only
```

- **Code:** `apps/core/permissions.py`
- **Test:** `AuthAndIsolationTests` (5 tests)

### 8.2 Operation Permissions

```
admin/owner: full access
supervisor: operations CRUD (shifts, readings, employees)
finance: financial CRUD (cash, vouchers, POS, expenses, reconciliation)
```

- **Test:** `FinanceAccessTests` (5 tests), `UserManagementTests` (5 tests)

---

## Test Coverage Summary

| Invariant | Test Class | Tests |
|-----------|-----------|-------|
| 1.1-1.5 Shift reconciliation | P0MultiFuelTests | 11 |
| 1.6 Net cash / expenses | P1ContinuityAndExpensesTests | 10 |
| 2.1-2.3 Tank inventory | FuelReconciliationTests | 12 |
| 3.1-3.3 Delivery | P1Phase2FuelDeliveryTests | 16 |
| 4.1-4.2 Voucher settlement | VoucherSettlementTests | 12 |
| 6.1 Meter continuity | P1ContinuityAndExpensesTests | (included above) |
| 7.1-7.2 Shift lifecycle | RecurringShiftTests + P0MultiFuelTests | 10 |
| 8.1-8.2 RBAC | AuthAndIsolationTests + FinanceAccessTests + UserManagementTests | 15 |
| Other | GuideAndReportsTests + P2P3FeatureTests | 20 |
| **Total** | | **113** |

---

## Adding New Invariants

When adding a new business rule:

1. Document the formula in this file
2. Write a test that verifies the formula
3. Reference the test class in the table above
4. If the formula involves money, it MUST have a corresponding test
