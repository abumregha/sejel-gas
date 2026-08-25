# Sejel POC — Gas Station Management System

**Date:** 2026-08-25
**Status:** Design
**Stack:** Django 5 + PostgreSQL + htmx + Tailwind CSS (RTL)
**Target:** Web-first POC demo on VPS (102.213.180.186)

---

## 1. Overview

Sejel is a gas station management system for Libyan fuel stations. This POC demonstrates the core business logic via a responsive Arabic RTL web app. The goal: prove the system produces the same financial numbers as the client's current Excel workflow.

### Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 1 — Core | Stations, shifts, meter readings, cash, vouchers, POS, reconciliation | This POC |
| 2 — Finance | Expenses, profit, daily closing, monthly reports, audit log | This POC |
| 3 — Inventory | Tanks, deliveries, shortages, claims, documents | This POC |
| 4 — Settlement | Monthly settlement with الراحلة | TBD (needs template) |

### Success Criteria

Take one real day from the client's Excel, input it into Sejel, and get **exactly the same final numbers**.

---

## 2. Project Structure

```
sejel/
├── manage.py
├── requirements.txt
├── .env
├── sejel/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── core/              # Station, Island, Machine, Tank, FuelType, Settings
│   ├── shifts/            # Shifts, Meter Readings, Shift Closing
│   ├── finance/           # Cash, Vouchers, POS, Reconciliation, Expenses
│   ├── inventory/         # Tanks, Deliveries, Shortages, Claims
│   ├── employees/         # Employees, Attendants, Assignments
│   └── reports/           # Daily, Shift, Monthly, Multi-station reports (views only)
├── templates/
│   ├── base.html          # RTL layout, Tailwind, htmx
│   ├── components/        # Reusable cards, tables, modals
│   └── pages/
│       ├── dashboard/
│       ├── shifts/
│       ├── finance/
│       ├── inventory/
│       ├── employees/
│       └── reports/
├── static/
│   ├── css/
│   ├── js/
│   └── img/
└── locale/
    └── ar/
        └── LC_MESSAGES/
```

### App Responsibilities

| App | Responsibility | Models |
|-----|---------------|--------|
| `core` | Stations, hierarchy, fuel config, global settings | Station, Island, Machine, Meter, Tank, FuelType, FuelPrice, StationSettings, MarketingCompany, UserProfile |
| `shifts` | Shift lifecycle, meter readings, closing | Shift, MeterReading |
| `finance` | Cash, vouchers, POS, reconciliation, expenses | CashCollection, Voucher, VoucherCategory, POSRecord, Reconciliation, Expense, ExpenseCategory |
| `inventory` | Tank levels, deliveries, shortages, claims | Delivery, DeliveryDocument, ShortageClaim |
| `employees` | Attendants, assignments | Employee, ShiftAssignment |
| `reports` | Views only — reads from other apps' models | No models |

---

## 3. Data Models

### 3.1 Station & Hierarchy

```python
class MarketingCompany(models.Model):
    name = CharField(max_length=200)
    name_en = CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'sejel_marketing_company'


class Station(models.Model):
    RELATIONSHIP_CHOICES = [
        ('owned', 'مملوكة للمواطن'),
        ('rented', 'مؤجرة من شركة التسويق'),
        ('agency', 'وكالة/إعادة بيع'),
    ]
    CASH_MODE_CHOICES = [
        ('during_shift', 'أثناء المناوبة'),
        ('end_of_shift', 'عند نهاية المناوبة'),
    ]
    STATUS_CHOICES = [
        ('active', 'نشطة'),
        ('inactive', 'غير نشطة'),
        ('maintenance', 'صيانة'),
    ]

    name = CharField(max_length=200)
    address = TextField()
    status = CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    relationship_type = CharField(max_length=20, choices=RELATIONSHIP_CHOICES)
    marketing_company = FK(MarketingCompany, on_delete=SET_NULL, null=True)
    cash_collection_mode = CharField(max_length=20, choices=CASH_MODE_CHOICES, default='during_shift')
    target_cash_amount = DecimalField(max_digits=10, decimal_places=3, default=500)
    photo_meter_required = BooleanField(default=False)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sejel_station'


class Island(models.Model):
    station = FK(Station, on_delete=CASCADE, related_name='islands')
    name = CharField(max_length=50)
    number = PositiveIntegerField()
    status = CharField(max_length=20, choices=[('active', 'نشطة'), ('inactive', 'غير نشطة')])

    class Meta:
        db_table = 'sejel_island'
        unique_together = ('station', 'number')


class Machine(models.Model):
    island = FK(Island, on_delete=CASCADE, related_name='machines')
    name = CharField(max_length=50)
    number = PositiveIntegerField()

    class Meta:
        db_table = 'sejel_machine'
        unique_together = ('island', 'number')


class FuelType(models.Model):
    name = CharField(max_length=50)       # بنزين
    name_en = CharField(max_length=50)    # Gasoline

    class Meta:
        db_table = 'sejel_fuel_type'


class Tank(models.Model):
    station = FK(Station, on_delete=CASCADE, related_name='tanks')
    fuel_type = FK(FuelType, on_delete=PROTECT)
    capacity = DecimalField(max_digits=10, decimal_places=3)
    current_level = DecimalField(max_digits=10, decimal_places=3, default=0)
    last_reading_date = DateTimeField(null=True, blank=True)
    name = CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'sejel_tank'


class Meter(models.Model):
    machine = FK(Machine, on_delete=CASCADE, related_name='meters')
    code = CharField(max_length=50)
    fuel_type = FK(FuelType, on_delete=PROTECT)
    tank = FK(Tank, on_delete=PROTECT)
    current_reading = DecimalField(max_digits=12, decimal_places=3, default=0)
    status = CharField(max_length=20, choices=[('active', 'نشطة'), ('inactive', 'غير نشطة'), ('maintenance', 'صيانة')], default='active')

    class Meta:
        db_table = 'sejel_meter'


class FuelPrice(models.Model):
    fuel_type = FK(FuelType, on_delete=CASCADE, related_name='prices')
    selling_price = DecimalField(max_digits=10, decimal_places=3)
    profit_margin = DecimalField(max_digits=10, decimal_places=3)
    cost_per_liter = DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    effective_date = DateField()
    is_active = BooleanField(default=True)
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_fuel_price'


class StationSettings(models.Model):
    station = OneToOneField(Station, on_delete=CASCADE, related_name='settings')
    islands_count = PositiveIntegerField(default=2)
    machines_per_island = PositiveIntegerField(default=2)
    meters_per_machine = PositiveIntegerField(default=2)
    tanks_count = PositiveIntegerField(default=4)
    fuel_types = ManyToManyField(FuelType, blank=True)
    voucher_categories = ManyToManyField('finance.VoucherCategory', blank=True)
    expense_categories = ManyToManyField('finance.ExpenseCategory', blank=True)
    cash_target_amount = DecimalField(max_digits=10, decimal_places=3, default=500)
    photo_meter_required = BooleanField(default=False)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sejel_station_settings'


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'مدير النظام'),
        ('manager', 'مدير المحطة'),
        ('finance', 'المالي'),
        ('supervisor', 'المشرف'),
    ]

    user = OneToOneField(User, on_delete=CASCADE, related_name='profile')
    role = CharField(max_length=20, choices=ROLE_CHOICES, default='supervisor')
    station = FK(Station, on_delete.SET_NULL, null=True, blank=True)
    phone = CharField(max_length=20, blank=True)
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_user_profile'
```

### 3.2 Employees & Shifts

```python
class Employee(models.Model):
    SHIFT_CHOICES = [
        ('morning', 'صباحي'),
        ('evening', 'مسائي'),
        ('full_day', 'كامل اليوم'),
    ]
    STATUS_CHOICES = [
        ('active', 'نشط'),
        ('inactive', 'غير نشط'),
    ]

    station = FK(Station, on_delete=CASCADE, related_name='employees')
    name = CharField(max_length=200)
    phone = CharField(max_length=20, null=True, blank=True)
    status = CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    shift_type = CharField(max_length=20, choices=SHIFT_CHOICES)

    class Meta:
        db_table = 'sejel_employee'


class ShiftAssignment(models.Model):
    employee = FK(Employee, on_delete=CASCADE, related_name='assignments')
    island = FK(Island, on_delete=CASCADE)
    date = DateField()
    start_time = TimeField()
    end_time = TimeField()

    class Meta:
        db_table = 'sejel_shift_assignment'


class Shift(models.Model):
    STATUS_CHOICES = [
        ('open', 'مفتوحة'),
        ('closed', 'مغلقة'),
        ('under_review', 'تحت المراجعة'),
    ]

    station = FK(Station, on_delete=CASCADE, related_name='shifts')
    employee = FK(Employee, on_delete=CASCADE, related_name='shifts')
    island = FK(Island, on_delete=CASCADE)
    date = DateField()
    start_time = TimeField()
    end_time = TimeField(null=True, blank=True)
    status = CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    closed_by = FK(User, on_delete=SET_NULL, null=True, blank=True)
    closed_at = DateTimeField(null=True, blank=True)
    notes = TextField(blank=True)
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_shift'
        ordering = ['-date', '-start_time']


class MeterReading(models.Model):
    shift = FK(Shift, on_delete=CASCADE, related_name='readings')
    meter = FK(Meter, on_delete=CASCADE)
    start_reading = DecimalField(max_digits=12, decimal_places=3)
    end_reading = DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    liters_sold = DecimalField(max_digits=12, decimal_places=3, default=0)
    photo = ImageField(upload_to='meter_readings/', null=True, blank=True)
    override_reason = TextField(blank=True)
    created_by = FK(User, on_delete=SET_NULL, null=True)

    class Meta:
        db_table = 'sejel_meter_reading'
```

### 3.3 Finance

```python
class CashCollection(models.Model):
    shift = FK(Shift, on_delete=CASCADE, related_name='cash_collections')
    amount = DecimalField(max_digits=10, decimal_places=3)
    time = DateTimeField()
    received_by = FK(User, on_delete=SET_NULL, null=True)
    reference = CharField(max_length=100, blank=True)
    notes = TextField(blank=True)
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_cash_collection'


class VoucherCategory(models.Model):
    name = CharField(max_length=50)       # 5 LYD
    value = DecimalField(max_digits=10, decimal_places=3)
    is_active = BooleanField(default=True)

    class Meta:
        db_table = 'sejel_voucher_category'


class Voucher(models.Model):
    shift = FK(Shift, on_delete=CASCADE, related_name='vouchers')
    category = FK(VoucherCategory, on_delete=PROTECT)
    count = PositiveIntegerField()
    total_value = DecimalField(max_digits=10, decimal_places=3)
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_voucher'


class POSRecord(models.Model):
    shift = FK(Shift, on_delete=CASCADE, related_name='pos_records')
    total_amount = DecimalField(max_digits=10, decimal_places=3)
    transaction_count = PositiveIntegerField(null=True, blank=True)
    notes = TextField(blank=True)
    entered_by = FK(User, on_delete=SET_NULL, null=True)
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_pos_record'


class ExpenseCategory(models.Model):
    name = CharField(max_length=100)      # ماء، أكل، وجبات الحراسة
    station = FK(Station, on_delete=CASCADE, null=True, blank=True)  # null = global
    is_active = BooleanField(default=True)

    class Meta:
        db_table = 'sejel_expense_category'


class Expense(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'نقدي'),
        ('voucher', 'كوبون'),
        ('other', 'أخرى'),
    ]
    STATUS_CHOICES = [
        ('pending', 'قيد الاعتماد'),
        ('approved', 'معتمد'),
        ('rejected', 'مرفوض'),
    ]

    station = FK(Station, on_delete=CASCADE, related_name='expenses')
    shift = FK(Shift, on_delete.SET_NULL, null=True, blank=True)
    category = FK(ExpenseCategory, on_delete=PROTECT)
    amount = DecimalField(max_digits=10, decimal_places=3)
    description = TextField()
    paid_to = CharField(max_length=200, blank=True)
    payment_method = CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')
    attachment = ImageField(upload_to='expenses/', null=True, blank=True)
    status = CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_by = FK(User, on_delete=SET_NULL, null=True)
    approved_by = FK(User, on_delete=SET_NULL, null=True, blank=True)
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_expense'
        ordering = ['-created_at']


class Reconciliation(models.Model):
    DIFFERENCE_CHOICES = [
        ('matched', 'مطابق'),
        ('surplus', 'فائض'),
        ('shortage', 'عجز'),
    ]
    STATUS_CHOICES = [
        ('draft', 'مسودة'),
        ('confirmed', 'مؤكد'),
    ]

    shift = OneToOneField(Shift, on_delete=CASCADE, related_name='reconciliation')
    total_liters = DecimalField(max_digits=12, decimal_places=3)
    expected_sales = DecimalField(max_digits=12, decimal_places=3)
    total_cash = DecimalField(max_digits=12, decimal_places=3, default=0)
    total_vouchers = DecimalField(max_digits=12, decimal_places=3, default=0)
    total_pos = DecimalField(max_digits=12, decimal_places=3, default=0)
    total_collection = DecimalField(max_digits=12, decimal_places=3)
    difference = DecimalField(max_digits=12, decimal_places=3)
    difference_type = CharField(max_length=20, choices=DIFFERENCE_CHOICES)
    status = CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    confirmed_by = FK(User, on_delete=SET_NULL, null=True, blank=True)
    confirmed_at = DateTimeField(null=True, blank=True)
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_reconciliation'
```

### 3.4 Inventory

```python
class Delivery(models.Model):
    STATUS_CHOICES = [
        ('ordered', 'تم الطلب'),
        ('received', 'تم الاستلام'),
        ('claimed', 'تم المطالبة'),
        ('settled', 'تمت التسوية'),
        ('closed', 'مغلقة'),
    ]

    station = FK(Station, on_delete=CASCADE, related_name='deliveries')
    tank = FK(Tank, on_delete=CASCADE)
    fuel_type = FK(FuelType, on_delete=PROTECT)
    requested_quantity = DecimalField(max_digits=10, decimal_places=3)
    expected_quantity = DecimalField(max_digits=10, decimal_places=3)
    received_quantity = DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    shortage = DecimalField(max_digits=10, decimal_places=3, default=0)
    order_date = DateTimeField()
    arrival_date = DateTimeField(null=True, blank=True)
    pre_reading = DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    post_reading = DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    document_number = CharField(max_length=100, blank=True)
    status = CharField(max_length=20, choices=STATUS_CHOICES, default='ordered')
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_delivery'


class DeliveryDocument(models.Model):
    TYPE_CHOICES = [
        ('receipt', 'إيصال الاستلام'),
        ('proof_of_shortage', 'إثبات النقص'),
        ('other', 'أخرى'),
    ]

    delivery = FK(Delivery, on_delete=CASCADE, related_name='documents')
    document_type = CharField(max_length=20, choices=TYPE_CHOICES)
    file = ImageField(upload_to='delivery_documents/')
    uploaded_by = FK(User, on_delete=SET_NULL, null=True)
    uploaded_at = DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_delivery_document'


class ShortageClaim(models.Model):
    STATUS_CHOICES = [
        ('not_claimed', 'غير مطالَب بها'),
        ('claimed', 'مطالَب بها'),
        ('settled', 'تمت التسوية'),
        ('closed', 'مغلقة'),
    ]

    delivery = OneToOneField(Delivery, on_delete=CASCADE, related_name='shortage_claim')
    shortage_amount = DecimalField(max_digits=10, decimal_places=3)
    status = CharField(max_length=20, choices=STATUS_CHOICES, default='not_claimed')
    claim_date = DateTimeField(null=True, blank=True)
    settlement_date = DateTimeField(null=True, blank=True)
    notes = TextField(blank=True)
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_shortage_claim'
```

### 3.5 Monthly Settlement (Phase 4 Stub)

```python
class MonthlySettlement(models.Model):
    STATUS_CHOICES = [
        ('draft', 'مسودة'),
        ('submitted', 'مقدم'),
        ('settled', 'تمت التسوية'),
    ]

    station = FK(Station, on_delete=CASCADE, related_name='settlements')
    month = PositiveIntegerField()
    year = PositiveIntegerField()
    total_liters = DecimalField(max_digits=12, decimal_places=3, default=0)
    total_sales = DecimalField(max_digits=12, decimal_places=3, default=0)
    total_collection = DecimalField(max_digits=12, decimal_places=3, default=0)
    total_vouchers = DecimalField(max_digits=12, decimal_places=3, default=0)
    total_shortages = DecimalField(max_digits=12, decimal_places=3, default=0)
    total_expenses = DecimalField(max_digits=12, decimal_places=3, default=0)
    total_profit = DecimalField(max_digits=12, decimal_places=3, default=0)
    status = CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    notes = TextField(blank=True)
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_monthly_settlement'
        unique_together = ('station', 'month', 'year')
```

### 3.6 Audit Trail

```python
class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('create', 'إنشاء'),
        ('update', 'تعديل'),
        ('delete', 'حذف'),
        ('close', 'إقفال'),
        ('reopen', 'إعادة فتح'),
    ]

    user = FK(User, on_delete=SET_NULL, null=True)
    action = CharField(max_length=20, choices=ACTION_CHOICES)
    model_name = CharField(max_length=100)
    object_id = PositiveIntegerField()
    old_value = JSONField(null=True, blank=True)
    new_value = JSONField(null=True, blank=True)
    reason = TextField(blank=True)
    timestamp = DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_audit_log'
        ordering = ['-timestamp']
```

---

## 4. Business Logic

### 4.1 Shift Closing

```
1. Supervisor creates shift
   → Station, Employee, Island, Date, Start Time
   → Records start readings for all meters on that island

2. During shift
   → CashCollection records (if mode = during_shift)
   → Voucher records
   → POSRecord entries

3. Supervisor closes shift
   → Enters end readings for all meters
   → Validates: end >= start (unless override_reason provided)
   → Computes: liters_sold = end - start per meter
   → Computes: expected_sales = Σ(liters_sold × selling_price)
   → Sums: total_cash, total_vouchers, total_pos
   → Computes: total_collection = cash + vouchers + pos
   → Computes: difference = total_collection - expected_sales
   → Creates Reconciliation record
   → Updates meter.current_reading
   → AuditLog records everything
```

### 4.2 Reconciliation Rules

```python
if total_collection == expected_sales:
    difference_type = "matched"    # مطابق
elif total_collection > expected_sales:
    difference_type = "surplus"    # فائض — employee incentive, NOT profit
elif total_collection < expected_sales:
    difference_type = "shortage"   # عجز — station absorbs loss
```

**Surplus (فائض):** Treated as employee incentive. Does NOT count as station revenue or profit.

**Shortage (عجز):** Station absorbs the loss. Must not disappear into profit calculation.

### 4.3 Expense Rules

```python
# Profit calculation
profit = (total_liters × profit_margin) - total_expenses

# Categories configurable per station
# Approval workflow: pending → approved/rejected
# Only manager/admin can approve
```

### 4.4 Shift Reopening

```
1. Admin initiates reopen (requires admin role)
2. Must provide reason
3. Shift.status = open
4. Reconciliation soft-invalidated
5. Supervisor re-enters correct data
6. Re-close with new reconciliation
7. Both close + reopen logged in AuditLog
```

### 4.5 Delivery Shortage

```
1. Delivery arrives
2. Pre-reading recorded
3. Fuel loaded into tank
4. Post-reading recorded
5. received_quantity = post - pre
6. shortage = expected_quantity - received_quantity
7. If shortage > 0:
   → ShortageClaim created (status: not_claimed)
   → Station pays full delivery cost
   → Claim filed against الراحلة
   → Status: claimed → settled → closed
```

### 4.6 Daily Closing (Report View)

```
For each shift in the day:
  → Collect all reconciliations
  → Sum: liters, sales, cash, vouchers, POS, collection
  → Sum: expenses
  → Compute: profit = (liters × margin) - expenses
  → Compute: surplus, shortage

No "close day" action — it's a report view.
Day boundaries: midnight-to-midnight.
```

---

## 5. UI/UX Design

### 5.1 Layout

```
┌─────────────────────────────────────────┐
│ /sidebar/     │     /main-content/      │
│               │                         │
│  الشعار       │  ┌─────────────────┐    │
│               │  │  عنوان الصفحة    │    │
│  لوحة التحكم  │  └─────────────────┘    │
│  المحطات      │                         │
│  المناوبات    │  /content-area/         │
│  العدادات     │                         │
│  المالية      │                         │
│  المصروفات    │                         │
│  الخزانات     │                         │
│  التقارير     │                         │
│               │                         │
└─────────────────────────────────────────┘
```

**Mobile (<768px):** Sidebar collapses to bottom tab bar. Content goes full width.

### 5.2 Key Screens

#### Dashboard (لوحة التحكم)

- Station selector (if admin sees multiple)
- KPI cards: liters, sales, collection, vouchers, POS, surplus, shortage, expenses
- Active shift indicator
- Quick actions: close shift, add expense

#### Shift Closing (إقفال المناوبة)

- Employee, island, times displayed
- Meter readings table (start/end/liters per meter)
- Cash collection summary
- Voucher summary
- POS summary
- Expected vs actual comparison
- Difference indicator (matched/surplus/shortage)
- Close button

#### Meter Readings (قراءات العدادات)

- Per-meter input: start, end, computed liters
- Photo upload (optional, configurable)
- Override reason field (if end < start)

#### Expenses (المصروفات)

- List with filters (date, category, status)
- Add form: category, amount, description, paid_to, attachment
- Approval workflow for manager

#### Reports (التقارير)

- Tabs: daily, shifts, meters, deliveries, expenses, monthly, multi-station comparison
- Tables with export
- Charts for trends

### 5.3 Responsive Behavior

| Screen | Desktop (≥1024px) | Tablet (768-1023px) | Mobile (<768px) |
|--------|------------------|-------------------|----------------|
| Sidebar | Fixed left | Collapsible overlay | Bottom tab bar |
| Tables | Full | Horizontal scroll | Card view |
| Dashboard cards | 3-column grid | 2-column | 1-column stack |
| Forms | Side-by-side | Stacked | Full-width |
| Modals | Centered | Centered | Full-screen |

### 5.4 Color System

```css
--primary: #1a56db;        /* أزرق رئيسي */
--success: #059669;        /* أخضر — مطابق */
--warning: #d97706;        /* برتقالي — فائض */
--danger: #dc2626;         /* أحمر — عجز */
--bg: #f8fafc;             /* خلفية فاتحة */
--sidebar: #1e293b;        /* sidebar داكن */
```

### 5.5 Navigation

```
لوحة التحكم (Dashboard)
├── المحطات (Stations)
│   ├── قائمة المحطات
│   ├── إضافة محطة
│   └── إعدادات المحطة
├── المناوبات (Shifts)
│   ├── المناوبات المفتوحة
│   ├── إنشاء مناوبة
│   └── إقفال المناوبة
├── العدادات (Meters)
│   ├── قراءات العدادات
│   └── تاريخ القراءات
├── المالية (Finance)
│   ├── التحصيل النقدي
│   ├── الكوبونات
│   ├── POS
│   └── المطابقة
├── المصروفات (Expenses)
│   ├── قائمة المصروفات
│   └── فئات المصروفات
├── الخزانات (Tanks)
│   ├── مستويات الخزانات
│   └── الشحنات
├── التقارير (Reports)
│   ├── يومي
│   ├── مناوبات
│   ├── عدادات
│   ├── شحنات
│   ├── مصروفات
│   ├── شهري
│   └── مقارنة محطات
└── الإعدادات (Settings)
    ├── أنواع الوقود
    ├── أسعار الوقود
    ├── فئات الكوبونات
    ├── فئات المصروفات
    └── سجل التدقيق
```

---

## 6. Authentication & Permissions

### 6.1 Roles

Defined in `UserProfile` model (Section 3.1):

```python
class UserRole(models.TextChoices):
    ADMIN = 'admin', 'مدير النظام'
    MANAGER = 'manager', 'مدير المحطة'
    FINANCE = 'finance', 'المالي'
    SUPERVISOR = 'supervisor', 'المشرف'
```

Each Django `User` gets a `UserProfile` with `role` and optional `station` FK. Non-admin users are scoped to their station.

### 6.2 Access Matrix

| Feature | Admin | Manager | Finance | Supervisor |
|---------|:-----:|:-------:|:-------:|:----------:|
| All stations | ✅ | ❌ | ❌ | ❌ |
| Station settings | ✅ | ✅ | ❌ | ❌ |
| Create/edit shifts | ✅ | ✅ | ❌ | ✅ |
| Close shift | ✅ | ✅ | ✅ | ✅ |
| Reopen shift | ✅ | ❌ | ❌ | ❌ |
| Enter meter readings | ✅ | ✅ | ❌ | ✅ |
| Cash/vouchers/POS | ✅ | ✅ | ✅ | ❌ |
| Approve expenses | ✅ | ✅ | ❌ | ❌ |
| Create expenses | ✅ | ✅ | ✅ | ❌ |
| View reports | ✅ | ✅ | ✅ | ✅ |
| Audit log | ✅ | ❌ | ❌ | ❌ |
| Fuel prices | ✅ | ❌ | ❌ | ❌ |

### 6.3 Auth Mechanism

- Django built-in auth (`django.contrib.auth`)
- Session-based (cookie) for web UI
- No JWT needed — server-rendered app
- Login page: Arabic, username/password
- Attendants are `Employee` records, NOT `User` accounts

### 6.4 Station Scoping

```python
def get_queryset(request):
    profile = request.user.profile
    if profile.role != 'admin':
        return Station.objects.filter(id=profile.station_id)
    return Station.objects.all()
```

---

## 7. Tech Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Backend | Django 5 | Fastest path to working demo, built-in admin |
| Database | PostgreSQL | Already on VPS, handles JSON fields well |
| Frontend | Django templates + htmx | Server-rendered, SPA-like without JS complexity |
| CSS | Tailwind CSS | RTL support via `rtl:` prefix, responsive utilities |
| Icons | Lucide (via CDN) | Clean, consistent, Arabic-friendly |
| Charts | Chart.js (via CDN) | Simple, no build step needed |
| Images | Pillow + ImageField | Meter photos, delivery documents |

### Requirements

```
Django>=5.0,<6.0
psycopg2-binary>=2.9,<3.0
Pillow>=10.0,<11.0
python-decouple>=3.8,<4.0
gunicorn>=22.0,<23.0
```

### Port Allocation

| Service | Port |
|---------|------|
| Sejel POC | 8002 |
| ERPNext | 8000 |
| DIWAN | 8001 |

---

## 8. Deployment

### VPS Setup

```bash
# Database
sudo -u postgres createdb sejel_poc
sudo -u postgres createuser sejel_user

# Project
cd /root/projects/Sejel
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Migrate
python manage.py migrate
python manage.py createsuperuser  # admin

# Run
python manage.py runserver 0.0.0.0:8002
```

### Systemd Service (optional for POC)

```ini
[Unit]
Description=Sejel POC
After=network.target postgresql.service

[Service]
User=root
WorkingDirectory=/root/projects/Sejel
ExecStart=/root/projects/Sejel/venv/bin/gunicorn sejel.wsgi:application --bind 0.0.0.0:8002
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 9. Implementation Phases

### Phase 1 — Core (Week 1)

- [ ] Project scaffold, settings, Tailwind + htmx setup
- [ ] Core models: Station, Island, Machine, Meter, Tank, FuelType, StationSettings, MarketingCompany
- [ ] UserProfile + role-based auth
- [ ] Employee models
- [ ] Shift model + creation
- [ ] Meter readings
- [ ] Cash collection
- [ ] Vouchers + categories
- [ ] POS records
- [ ] Reconciliation calculation
- [ ] Shift closing flow
- [ ] Basic dashboard

### Phase 2 — Finance (Week 2)

- [ ] Expense categories + CRUD
- [ ] Expense creation + approval
- [ ] Audit log
- [ ] Daily report
- [ ] Shift report
- [ ] Meter report
- [ ] Profit calculation

### Phase 3 — Inventory (Week 2-3)

- [ ] Tank levels view
- [ ] Delivery creation
- [ ] Pre/post readings
- [ ] Shortage calculation
- [ ] Shortage claims
- [ ] Delivery documents (image upload)
- [ ] Delivery report

### Phase 4 — Settlement (After client provides template)

- [ ] Monthly settlement model
- [ ] Settlement form
- [ ] Multi-station comparison report

---

## 10. Future Considerations (NOT in POC)

- DRF API layer (extracted from views)
- Flutter web/mobile app
- Automated tank level alerts
- POS device integration
- Barcode scanning for vouchers
- Multi-company support
- Arabic OCR for delivery documents
