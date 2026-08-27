# Sejel Hardening Plan

> **Status:** Active  
> **Date:** 2026-08-27  
> **Goal:** Transition from feature-complete POC to pilot-ready system  
> **Rule:** NO new features. Only hardening, audit, and real-world validation.

---

## Context

The Sejel fuel station management system has 113 passing tests, 32 Django models, 37 serializers, 30 viewsets, and 40+ Vue SPA views. A code audit revealed critical gaps that must be fixed before any real-world use:

- Zero `transaction.atomic()` in the entire codebase
- No audit trail (AuditLog was designed in spec but never implemented)
- JWT tokens stored in `localStorage` (XSS-exfiltrable)
- `close_shift()` performs 7 sequential DB writes with no atomicity
- Delivery model is single-tank (can't handle multi-tank allocation)
- No E2E or HTTP-level lifecycle tests
- Nginx config in docs has self-proxy bug (port 8004 → 8004)
- Server running via `runserver` (not production-grade)

---

## Phase 0: Feature Freeze

**Duration:** 0 days (communication only)  
**Owner:** Project lead

Send explicit instruction to the coding agent:

> DO NOT add any new Feature, model, endpoint, or UI page unless it is required to fix a bug or complete an existing unfinished requirement. The next phase is Hardening + Validation only.

---

## Phase 1: Atomic Transactions

**Duration:** 3-5 days  
**Priority:** Critical  
**Files to modify:**
- `apps/shifts/services.py` — `close_shift()` function (lines 49-184)
- `apps/inventory/fuel_reconciliation.py` — `create_fuel_reconciliation()`
- `apps/inventory/services.py` — delivery receiving, tank transfers
- `apps/finance/services.py` — voucher settlements
- Any other service that writes to multiple tables

### Requirements

1. **Wrap `close_shift()` in `transaction.atomic()`**

   The function currently performs 7 sequential DB writes with no atomicity:
   ```
   Step 1: meter_reading.save()                    — NO atomic
   Step 2: meter.save() (update current_reading)    — NO atomic
   Step 3: Read aggregations (read-only)            — N/A
   Step 4: Reconciliation update_or_create          — NO atomic
   Step 5: Delete old ShiftFuelSummary records      — NO atomic
   Step 6: Create new ShiftFuelSummary records      — NO atomic
   Step 7: shift.save() (status='closed')           — NO atomic
   ```

   Must become:
   ```python
   from django.db import transaction

   def close_shift(shift, end_readings_data, closed_by):
       with transaction.atomic():
           # All 7 steps inside this block
           # If ANY step fails, ALL changes roll back
   ```

2. **Add `select_for_update()` on the shift record**

   Prevent double-close race condition:
   ```python
   shift = Shift.objects.select_for_update().get(pk=shift.pk)
   ```

3. **Audit ALL multi-table write operations**

   Search for every function/method that writes to 2+ tables and wrap in `transaction.atomic()`. Key candidates:
   - `close_shift()` — 7 writes
   - `create_fuel_reconciliation()` — multiple writes
   - Tank transfer logic — source level update + destination level update + transfer record
   - Delivery receiving — delivery record + tank level update
   - Voucher settlement — settlement record + payment tracking

4. **Write failure simulation tests**

   Test that if step 5 of `close_shift()` fails, steps 1-4 are rolled back:
   ```python
   def test_close_shift_rollback_on_failure():
       # Setup shift with readings
       # Inject failure at fuel summary creation
       # Verify: shift status unchanged, no reconciliation created
   ```

### Acceptance Criteria

- [ ] `grep -r "transaction.atomic" apps/` returns results in all service files
- [ ] `close_shift()` is fully atomic
- [ ] `select_for_update()` prevents concurrent closes
- [ ] Failure simulation test passes
- [ ] All existing 113 tests still pass

---

## Phase 2: Audit Trail

**Duration:** 2-3 days  
**Priority:** Critical  
**New files:**
- `apps/core/models.py` — Add `AuditLog` model
- `apps/core/audit.py` — Audit logging utility
- `apps/core/migrations/` — New migration

### AuditLog Model

Already designed in the original spec (`docs/superpowers/specs/2026-08-25-sejel-poc-design.md` lines 513-535) but never implemented:

```python
class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('create', 'إنشاء'),
        ('update', 'تعديل'),
        ('delete', 'حذف'),
        ('close', 'إقفال'),
        ('reopen', 'إعادة فتح'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100)
    object_id = models.PositiveIntegerField()
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    reason = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_audit_log'
        ordering = ['-timestamp']
```

### Coverage Requirements

Log ALL changes to these models:

| Model | Actions to Log |
|-------|---------------|
| `MeterReading` | create, update (especially end_reading, override_reason) |
| `Reconciliation` | create, update (especially difference, status) |
| `ShiftFuelSummary` | create, delete |
| `Shift` | close, reopen, status change |
| `Expense` | create, update, status change (pending→approved→rejected) |
| `FuelPrice` | create, update (price changes affect all future reconciliations) |
| `Delivery` | create, update (especially received_quantity, shortage) |
| `TankTransfer` | create, status change |
| `CashCollection` | create, cancel |
| `Voucher` | create, cancel |
| `POSRecord` | create, cancel |

### Implementation Approach

Use Django signals (post_save, pre_save) or a utility function called explicitly in service functions:

```python
# In apps/core/audit.py
def log_change(user, action, model_name, object_id, old_value=None, new_value=None, reason=''):
    AuditLog.objects.create(
        user=user,
        action=action,
        model_name=model_name,
        object_id=object_id,
        old_value=old_value,
        new_value=new_value,
        reason=reason,
    )
```

### Acceptance Criteria

- [ ] AuditLog model created and migrated
- [ ] All 11 models listed above have audit logging
- [ ] old_value captures previous state before change
- [ ] new_value captures new state after change
- [ ] User, timestamp, and reason are recorded
- [ ] Existing tests still pass

---

## Phase 3: Authentication & Security Audit

**Duration:** 1-2 days  
**Priority:** High  
**No code changes required initially — audit and document first**

### Current State (Verified)

| Aspect | Current | Risk |
|--------|---------|------|
| Access token storage | `localStorage` | XSS-exfiltrable |
| Refresh token storage | `localStorage` | XSS-exfiltrable |
| Token injection | `Authorization: Bearer` header via Axios interceptor | Standard |
| Auto-refresh | On 401 response, POST to `/api/auth/refresh/` | Standard |
| Logout | Clears `localStorage` only — no server-side revocation | Medium |
| Route guard | Checks `localStorage` presence only — no token validation | Low |
| Dual auth | Session + JWT both active simultaneously | Medium |
| CSRF | Enforced on session views, bypassed on JWT API (by design) | Low |

### Audit Checklist

For each item, the agent must DOCUMENT (not fix) the current behavior:

1. **Token storage location** — Where exactly are tokens stored? (Confirmed: `localStorage`)
2. **XSS exposure** — Can a script tag exfiltrate tokens? (Yes, if XSS exists)
3. **Access token expiry** — What happens to in-flight requests? (401 → refresh → retry)
4. **Refresh token expiry** — What happens to the user? (Redirect to `/login/`)
5. **Logout flow** — Does it invalidate the server-side session? Does it revoke the JWT?
6. **Concurrent sessions** — Can the same user be logged in on 2 devices? (Yes)
7. **Password change** — Does it invalidate existing tokens?
8. **User disable** — Does disabling a user invalidate their JWT? (No — JWT is stateless)
9. **Token revocation** — Is there any mechanism to revoke a compromised token? (No)
10. **CSRF posture** — Which endpoints are CSRF-protected? Which are not?

### Output

Produce a security audit document with:
- Current behavior for each item
- Risk level (Critical/High/Medium/Low)
- Recommended fix (for post-pilot)
- Whether it blocks the pilot

**Known: `localStorage` JWT storage is NOT ideal, but acceptable for a pilot on a trusted internal network. Document it for future hardening.**

### Acceptance Criteria

- [ ] Security audit document produced
- [ ] All 10 items documented with current behavior
- [ ] Risk levels assigned
- [ ] Pilot-blocking issues identified (if any)

---

## Phase 4: Production Deployment

**Duration:** 1-2 days  
**Priority:** High  
**Files to create/modify:**
- Nginx config (actual deployment, not documentation)
- Systemd service file
- Gunicorn configuration

### Current State

- Server runs via `python manage.py runserver 0.0.0.0:8004`
- No Nginx or Gunicorn config files exist on the server
- REPORT.md documents a config with a self-proxy bug (Nginx :8004 → proxy_pass :8004)

### Target Architecture

```
Internet
   │
   ▼
Nginx :8004
   │  - Static files served directly
   │  - Media files served directly
   │  - Proxy headers: X-Real-IP, X-Forwarded-For
   │
   ▼
Gunicorn :8010
   │  - Workers: 3-4 (adjust based on VPS RAM)
   │  - Timeout: 120s
   │  - Bind: 127.0.0.1:8010
   │
   ▼
Django
   │
   ▼
PostgreSQL
```

### Nginx Config

```nginx
server {
    listen 8004;
    server_name _;
    client_max_body_size 10M;

    location /static/ {
        alias /root/projects/Sejel/sejel/staticfiles/;
        expires 30d;
    }

    location /media/ {
        alias /root/projects/Sejel/sejel/media/;
        expires 7d;
    }

    location / {
        proxy_pass http://127.0.0.1:8010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
}
```

### Systemd Service

```ini
[Unit]
Description=Sejel Fuel Station Management
After=network.target postgresql.service

[Service]
User=root
WorkingDirectory=/root/projects/Sejel/sejel
ExecStart=/root/projects/Sejel/venv/bin/gunicorn sejel.wsgi:application \
    --bind 127.0.0.1:8010 \
    --workers 3 \
    --timeout 120
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Pre-Deployment Checklist

- [ ] Verify port 8010 is not used by another service
- [ ] Verify port 8004 is not used by another service (or use appropriate port)
- [ ] Set `DEBUG=False` via environment variable
- [ ] Set `DJANGO_ALLOWED_HOSTS` to actual domain/IP
- [ ] Set `CSRF_TRUSTED_ORIGINS` if needed
- [ ] Run `collectstatic`
- [ ] Run `migrate`
- [ ] Test with `runserver` first, then switch to Gunicorn

### Acceptance Criteria

- [ ] Nginx serves static/media files directly
- [ ] Gunicorn serves Django on 127.0.0.1:8010
- [ ] Nginx proxies to Gunicorn on port 8004
- [ ] No self-proxy bug
- [ ] Systemd service starts/restarts correctly
- [ ] `curl http://localhost:8004/app/login/` returns Vue SPA
- [ ] `curl http://localhost:8004/api/auth/login/` returns JWT endpoint
- [ ] No other services on the server are affected

---

## Phase 5: SPA End-to-End Testing

**Duration:** 2-3 days  
**Priority:** High  
**No code changes — manual browser testing**

### Test Scenarios

Execute each scenario in a browser (Chrome + Firefox):

#### 5.1 Authentication Flow
- [ ] Login with valid credentials → redirect to dashboard
- [ ] Login with invalid credentials → error message
- [ ] Close browser → reopen → navigate to `/app/` → still logged in (JWT in localStorage)
- [ ] Wait for JWT expiry (or manually expire) → next API call → auto-refresh → continue
- [ ] Refresh token expires → redirect to login
- [ ] Click logout → tokens cleared → redirect to login

#### 5.2 Full Shift Lifecycle
- [ ] Dashboard loads with KPI cards
- [ ] Navigate to Stations → see station cards with level bars
- [ ] Navigate to Shifts → see shift list with status filters
- [ ] Create new shift (select station, employee, island, date)
- [ ] Open shift detail → see meter readings form
- [ ] Enter start readings for 2 meters
- [ ] Enter end readings for 2 meters
- [ ] Verify liters_sold calculates correctly
- [ ] Navigate to Finance → add cash collection
- [ ] Navigate to Vouchers → add voucher record
- [ ] Navigate to POS → add POS record
- [ ] Navigate to Expenses → add expense
- [ ] Return to shift → click Close Shift
- [ ] Verify reconciliation appears with correct numbers
- [ ] Verify meter.current_reading is updated

#### 5.3 Responsive Design
- [ ] Desktop (1920×1080): sidebar visible, 3-column grid
- [ ] Tablet (768×1024): sidebar collapsed, 2-column grid
- [ ] Mobile (375×667): bottom tab bar, 1-column stack
- [ ] All forms usable on mobile (touch targets ≥44px)
- [ ] Tables scroll horizontally on mobile

#### 5.4 RTL Layout
- [ ] All text right-to-left
- [ ] Sidebar opens from right
- [ ] Navigation arrows correct
- [ ] Number fields (LTR within RTL context)
- [ ] Date picker correct

#### 5.5 Navigation
- [ ] Back/Forward browser buttons work correctly
- [ ] Page refresh on a route → stays on same page (Vue Router history mode)
- [ ] Direct URL access → loads correct page
- [ ] Sidebar links all functional

#### 5.6 Error Handling
- [ ] API down → user sees error message, not blank page
- [ ] Network disconnect → auto-reconnect on restore
- [ ] Invalid route → 404 page or redirect

### Acceptance Criteria

- [ ] All scenarios in 5.1-5.6 pass
- [ ] No JavaScript errors in browser console
- [ ] No broken layouts on any viewport
- [ ] All Arabic text renders correctly

---

## Phase 6: Business Invariants Document

**Duration:** 1 day  
**Priority:** High  
**New file:** `docs/BUSINESS_INVARIANTS.md`

### Content

Document every financial formula the system uses, with each formula = one or more automated tests:

#### Shift Reconciliation

```
1. liters_sold = closing_reading - opening_reading (per meter)
2. fuel_expected_sales = Σ(liters_sold × frozen_unit_price) per fuel type
3. total_expected_sales = Σ(fuel_expected_sales)
4. total_collected = cash + vouchers + POS
5. difference = total_collected - total_expected_sales
6. difference_type = matched | surplus | shortage
7. net_cash = cash_collected - cash_expenses
```

#### Tank Inventory

```
8. tank_theoretical = opening + received + transferred_in - transferred_out - sold
9. tank_variance = actual_level - theoretical
10. transfer_updates_levels = source.current_level - qty, dest.current_level + qty
```

#### Delivery

```
11. received_quantity = post_reading - pre_reading
12. shortage = max(0, expected_quantity - received_quantity)
13. shortage_claim_status: not_claimed → claimed → settled → closed
```

#### Voucher Settlement

```
14. settlement_outstanding = total_value - paid_amount
15. denomination_breakdown: 5×count5 + 6×count6 + 8×count8 = total_value
```

#### Profit (Report Only)

```
16. gross_profit = total_liters × profit_margin (per fuel type)
17. net_profit = gross_profit - total_expenses
18. revenue ≠ cash_position (accrual vs cash basis)
```

### Acceptance Criteria

- [ ] Document created with all 18 formulas
- [ ] Each formula has at least one corresponding test in `test_acceptance.py`
- [ ] Document is referenced from README or main docs

---

## Phase 7: Delivery Model Fix

**Duration:** 2-3 days  
**Priority:** High  
**Files to modify:**
- `apps/inventory/models.py` — Add `DeliveryAllocation` model
- `apps/inventory/serializers.py` — Update delivery serializer
- `apps/inventory/views.py` — Update delivery viewset
- `apps/frontend/src/views/` — Update delivery-related Vue components

### Problem

Current `Delivery` model ties to a single tank FK. A 40,000L delivery cannot be split across 3 tanks. The system records `received_quantity = post_reading - pre_reading` for one tank only.

### Solution

Add a `DeliveryAllocation` model:

```python
class DeliveryAllocation(models.Model):
    delivery = models.ForeignKey(Delivery, on_delete=models.CASCADE, related_name='allocations')
    tank = models.ForeignKey(Tank, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=3)
    pre_reading = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    post_reading = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_delivery_allocation'
```

### Update Delivery Model

```python
class Delivery(models.Model):
    # ... existing fields ...
    total_allocated = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    remaining_on_truck = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    # Remove single tank FK (or keep for backward compat, mark deprecated)
```

### Smart Allocation Logic

```python
def calculate_suggested_allocation(delivery):
    """Suggest how to split delivery across available tanks."""
    fuel_type = delivery.fuel_type
    tanks = Tank.objects.filter(station=delivery.station, fuel_type=fuel_type)
    suggestions = []
    remaining = delivery.expected_quantity

    for tank in tanks:
        available = tank.capacity - tank.current_level
        allocate = min(remaining, available)
        if allocate > 0:
            suggestions.append({'tank': tank, 'quantity': allocate})
            remaining -= allocate

    return suggestions, remaining  # remaining = what stays on truck
```

### Acceptance Criteria

- [ ] `DeliveryAllocation` model created
- [ ] Delivery can have multiple allocations
- [ ] `total_allocated` and `remaining_on_truck` are tracked
- [ ] UI shows suggested allocation based on tank capacities
- [ ] User must confirm/adjust allocation before saving
- [ ] `received_quantity` on Delivery = sum of allocation quantities
- [ ] All existing tests still pass
- [ ] New tests for multi-tank allocation

---

## Phase 8: Real Station Scenario

**Duration:** 3-5 days  
**Priority:** Critical  
**No code changes — data entry and comparison**

### Process

1. **Get a real day** from Benghazi station:
   - Paper log (meter readings, cash, vouchers, POS, expenses)
   - Excel spreadsheet (if used)

2. **Set up Sejel** with matching configuration:
   - Same stations, islands, machines, meters, tanks
   - Same fuel types and prices
   - Same employees

3. **Enter the same data** into Sejel:
   ```
   06:00 — Opening readings (all meters)
   06:10 — Open shift 1
   During shift — Cash collections, vouchers, POS, expenses
   Fuel delivery — Truck arrives with 40,000L
   End of shift — Closing readings
   Shift close — Reconciliation
   Open shift 2
   ... repeat ...
   End of day — Final readings
   ```

4. **Compare EVERY number:**

   | Field | Excel Value | Sejel Value | Match? |
   |-------|------------|-------------|--------|
   | Meter 1 opening | | | |
   | Meter 1 closing | | | |
   | Meter 1 liters | | | |
   | Meter 2 opening | | | |
   | ... | | | |
   | Total liters | | | |
   | Expected sales | | | |
   | Cash collected | | | |
   | Vouchers total | | | |
   | POS total | | | |
   | Expenses total | | | |
   | Net cash | | | |
   | Difference | | | |
   | Tank A level | | | |
   | Tank B level | | | |
   | Delivery received | | | |

5. **Document every discrepancy** with:
   - What the number should be (from Excel)
   - What Sejel calculated
   - Why they differ (if determinable)
   - Whether it's a data entry error or a logic error

### Acceptance Criteria

- [ ] Complete day entered into Sejel
- [ ] Every number compared with Excel
- [ ] Discrepancies documented
- [ ] Logic errors identified and fixed
- [ ] Data entry errors corrected
- [ ] Final Sejel numbers match Excel (within rounding tolerance)

---

## Phase 9: Fix Discrepancies

**Duration:** Variable (depends on Phase 8 results)  
**Priority:** Critical

Whatever Phase 8 reveals, fix it. This may include:
- Logic errors in reconciliation calculation
- Missing edge cases in meter reading continuity
- Incorrect frozen price application
- Tank level calculation errors
- Any other bugs found during real-world testing

### Acceptance Criteria

- [ ] All discrepancies from Phase 8 are resolved
- [ ] Re-run real scenario — numbers match
- [ ] All 113+ tests still pass

---

## Phase 10: Pilot (Single Station)

**Duration:** 2 weeks parallel run  
**Priority:** Critical

### Setup

- Run Sejel AND existing Excel workflow in parallel
- Same station (Benghazi or whichever is ready)
- Same data entered in both systems daily
- Compare end-of-day totals each evening

### Success Criteria

- [ ] 5 consecutive days where Sejel matches Excel
- [ ] No data loss or corruption
- [ ] Operator can complete full shift lifecycle without assistance
- [ ] Operator feedback collected and categorized

### Go/No-Go Decision

After 2 weeks:
- **Go:** Expand to second station
- **No-go:** Identify remaining issues, fix, re-pilot

---

## Timeline Summary

| Phase | Description | Days |
|-------|-------------|------|
| 0 | Feature freeze | 0 |
| 1 | Atomic transactions | 3-5 |
| 2 | Audit trail | 2-3 |
| 3 | Auth security audit | 1-2 |
| 4 | Production deployment | 1-2 |
| 5 | SPA E2E testing | 2-3 |
| 6 | Business invariants doc | 1 |
| 7 | Delivery model fix | 2-3 |
| 8 | Real station scenario | 3-5 |
| 9 | Fix discrepancies | Variable |
| 10 | Pilot (parallel run) | 14 days |
| **Total to pilot start** | | **~16-24 working days** |

---

## What NOT to Do

- Do NOT add HR module
- Do NOT add mobile app (Flutter/native)
- Do NOT add analytics beyond current reports
- Do NOT add multi-language beyond Arabic
- Do NOT add new business features
- Do NOT add new user roles
- Do NOT refactor unrelated code
- Do NOT create README, docs, or changelog unless asked

**The system is big enough. Make it correct and trustworthy first.**
