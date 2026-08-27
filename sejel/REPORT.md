# Sejel — Fuel Station Management System

> **Version:** 3.0  
> **Date:** 2026-08-27  
> **Status:** Production Ready  
> **Tests:** 113 passing  

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Tests** | 113 (all passing) |
| **Django Models** | 25 |
| **DRF Serializers** | 30+ |
| **DRF Viewsets** | 30+ |
| **Vue SPA Components** | 40+ views |
| **API Endpoints** | 40+ |
| **Migrations** | 22 |
| **Django Apps** | 6 (core, shifts, finance, inventory, employees, reports) |

---

## System Architecture

### Dual Frontend

The system runs **two frontends** on the same Django backend:

```
http://102.213.180.186:8004/          → Legacy Django Template App (backward compat)
http://102.213.180.186:8004/app/      → Vue 3 SPA (primary)
http://102.213.180.186:8004/api/      → DRF REST API (shared by both)
```

### Vue 3 SPA Architecture

```
┌─────────────────────────────────────────────────┐
│              Vue 3 SPA (/app/)                   │
│  ┌─────────────────────────────────────────────┐ │
│  │  Pinia Auth Store (JWT)                     │ │
│  │  Vue Router (history mode, /app/ base)      │ │
│  │  Axios (auto-refresh JWT interceptor)       │ │
│  │  TailwindCSS 3 (RTL, Arabic, responsive)    │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Dashboard │ │ Stations │ │ Shifts           │ │
│  │ KPIs      │ │ Cards    │ │ Definitions      │ │
│  │ Alerts    │ │ Detail   │ │ Create/Close     │ │
│  │ Summary   │ │ Form     │ │ Readings/Reconcile│ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Finance  │ │Inventory │ │ Reports          │ │
│  │ Cash     │ │ Deliveries│ │ Daily PDF        │ │
│  │ Vouchers │ │ Transfers│ │ Monthly          │ │
│  │ POS      │ │ Shortage │ │ Inventory        │ │
│  │ Expenses │ │ Reconcile│ │                  │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│           React Router SPA Navigation            │
└──────────────────────┬──────────────────────────┘
                       │ JWT Token
┌──────────────────────▼──────────────────────────┐
│         Django REST Framework API               │
│  /api/auth/login/   /api/stations/              │
│  /api/shifts/       /api/finance/               │
│  /api/inventory/    /api/reports/               │
│  /api/dashboard/    /api/users/                 │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│            PostgreSQL Database                   │
└─────────────────────────────────────────────────┘
```

### Data Flow

```
Station → Island → Machine (Pump) → Meter → Tank
    ↓
Shift Definition (recurring, per-island)
    ↓
Shift Generation → Attendant Assignment
    ↓
Meter Readings (continuity-validated, exception-tracked)
    ↓
Reading Completeness Check
    ↓
close_shift() → Per-fuel frozen prices → ShiftFuelSummary
    ↓
Reconciliation:
  ├── SALES (per-fuel breakdown, frozen prices)
  ├── COLLECTIONS (cash + vouchers + POS)
  ├── SALES DIFFERENCE
  └── CASH POSITION (net cash after expenses)
    ↓
Tank Readings → Deliveries → Shortages → Payment tracking
    ↓
Tank-to-Tank Transfers
    ↓
Fuel Reconciliation (theoretical vs actual, including transfers)
    ↓
Tank Alerts (auto low/critical/empty/full)
    ↓
Delivery Requests → Marketing Company
    ↓
Voucher Settlement → Alrahla Payment Tracking
```

---

## Frontend (Vue 3 SPA)

### Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue 3 | 3.5.41 | UI framework |
| Vite | 5.x | Build tool |
| Vue Router | 4.x | Client-side routing |
| Pinia | latest | State management |
| Axios | latest | HTTP client with JWT refresh |
| TailwindCSS | 3.x | Utility-first CSS (RTL) |
| Tajawal | Google Fonts | Arabic web font |

### SPA Pages (40+ views)

| Module | Pages |
|--------|-------|
| **Dashboard** | KPI cards, alerts, recent shifts, station summary |
| **Stations** | List (cards with level bars), detail, create/edit, delete |
| **Islands** | List, create/edit, delete |
| **Machines (المضخات)** | List, create/edit, delete |
| **Meters** | List, create/edit, delete |
| **Tanks** | List (level bars with color), detail (readings), create/edit |
| **Employees** | List, create/edit, delete |
| **Shift Definitions** | List, create/edit (day checkboxes) |
| **Shifts** | List (status filters), detail (readings + collections + reconciliation), create |
| **Meter Readings** | Form with previous-closing display, exception type |
| **Cash Collections** | List |
| **Vouchers** | List |
| **POS Records** | List |
| **Expenses** | List, create/edit |
| **Settlements** | List, create (denomination calculator: 5/6/8 LYD), detail (payment status) |
| **Reconciliations** | List, detail (per-fuel breakdown, cash position) |
| **Deliveries** | List, create, detail (shortage tracking) |
| **Tank Readings** | List with inline add form |
| **Transfers** | List, create (same-fuel-type validation) |
| **Shortage Claims** | List with status badges |
| **Fuel Reconciliation** | List (theoretical vs actual) |
| **Delivery Requests** | List, create, detail (status workflow: pending→approved→dispatched→received) |
| **Reports** | Daily, Monthly, Inventory dashboard |
| **User Management** | List, create/edit (role + station assignment) |
| **User Guide** | Full step-by-step guide (8 sections) |

### Mobile Features

- **Bottom navigation bar** (5 tabs: Home, Shifts, Finance, Inventory, Reports)
- **Collapsible sidebar** (hamburger toggle on all screens)
- **Touch-friendly cards** on all list pages
- **Tank level bars** with color coding (green/yellow/red)
- **Responsive grid layouts** (1 col mobile → 2-3 col desktop)
- **RTL layout** with Arabic font (Tajawal)
- **Smooth page transitions** (fade/slide)

### Build Commands

```bash
cd sejel/frontend
npm install              # Install dependencies
npx vite build           # Build to ../staticfiles/vue/
npx vite --host          # Dev server on port 5173
```

---

## Backend (Django REST Framework)

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login/` | POST | JWT login (returns access + refresh tokens) |
| `/api/auth/refresh/` | POST | Refresh access token |
| `/api/auth/me/` | GET | Current user info |
| `/api/dashboard/` | GET | Aggregate dashboard data |
| `/api/reports/daily/` | GET | Daily report (date param) |
| `/api/reports/monthly/` | GET | Monthly report (year + month params) |
| `/api/stations/` | CRUD | Stations (annotated counts) |
| `/api/islands/` | CRUD | Islands (station-filtered) |
| `/api/machines/` | CRUD | Machines (station/island-filtered) |
| `/api/meters/` | CRUD | Meters (station-filtered) |
| `/api/tanks/` | CRUD | Tanks (station/fuel-type-filtered) |
| `/api/tank-readings/` | CRUD | Tank readings (recorded_by auto-set) |
| `/api/tank-transfers/` | CRUD | Tank-to-tank transfers |
| `/api/tank-alerts/` | CRUD | Tank level alerts |
| `/api/fuel-types/` | CRUD | Fuel types |
| `/api/fuel-prices/` | CRUD | Fuel prices (effective-dated) |
| `/api/employees/` | CRUD | Employees (station-filtered) |
| `/api/shift-definitions/` | CRUD | Shift definitions (recurring) |
| `/api/shifts/` | CRUD | Shifts (with nested readings) |
| `/api/shifts/{id}/close/` | POST | Close shift + create reconciliation |
| `/api/meter-readings/` | CRUD | Meter readings |
| `/api/cash-collections/` | CRUD | Cash collections |
| `/api/vouchers/` | CRUD | Vouchers |
| `/api/pos-records/` | CRUD | POS records |
| `/api/expenses/` | CRUD | Expenses |
| `/api/expense-categories/` | CRUD | Expense categories |
| `/api/voucher-settlements/` | CRUD | Voucher settlements |
| `/api/reconciliations/` | Read | Financial reconciliations |
| `/api/deliveries/` | CRUD | Fuel deliveries |
| `/api/delivery-requests/` | CRUD | Delivery requests |
| `/api/shortage-claims/` | CRUD | Shortage claims |
| `/api/fuel-reconciliations/` | CRUD | Fuel (tank-level) reconciliations |
| `/api/users/` | CRUD | User management |

### Authentication

- **JWT tokens** (12-hour access, 7-day refresh)
- Auto-refresh on 401 responses
- Session auth also available for legacy template views

### Station Isolation

All API viewsets enforce role-based station scoping:

| Role | Access |
|------|--------|
| `admin` | All stations |
| `owner` | All stations |
| `supervisor` | Assigned station only |
| `finance` | Assigned station only |

---

## Features Implemented

### P0 — Critical Fixes (4/4)

| # | Feature | Status |
|---|---------|--------|
| 1 | Multi-fuel sales calculation (per-fuel-type prices) | ✅ |
| 2 | Shift ↔ Island relationship (definitions + occurrences) | ✅ |
| 3 | Frozen historical fuel prices at reconciliation | ✅ |
| 4 | Per-fuel-type breakdown in reconciliation | ✅ |

### P1 Phase 1 — Meter Continuity + Expenses (2/2)

| # | Feature | Status |
|---|---------|--------|
| 1 | Meter reading continuity validation + exceptions | ✅ |
| 2 | Expense treatment in reconciliation (Sales vs Cash Position) | ✅ |

### P1 Phase 2 — Fuel Tanks + Deliveries (1/1)

| # | Feature | Status |
|---|---------|--------|
| 1 | Tank readings, deliveries, shortages, payment tracking | ✅ |

### P1 Phase 3 — Fuel Reconciliation (1/1)

| # | Feature | Status |
|---|---------|--------|
| 1 | Tank-level fuel reconciliation (theoretical vs actual) | ✅ |

### P1 Phase 4 — Tank Transfers (1/1)

| # | Feature | Status |
|---|---------|--------|
| 1 | Tank-to-tank fuel transfer with level updates | ✅ |

### P1 Phase 5 — Voucher Settlement (1/1)

| # | Feature | Status |
|---|---------|--------|
| 1 | Voucher batch submission to Alrahla + payment tracking | ✅ |

### P2 — Remaining Items (4/4)

| # | Feature | Status |
|---|---------|--------|
| 1 | Tank transfers included in fuel reconciliation | ✅ |
| 2 | Voucher settlement pending balance tracking | ✅ |
| 3 | Station-wide inventory dashboard | ✅ |
| 4 | Delivery request workflow | ✅ |

### P3 — Nice-to-Have (2/2)

| # | Feature | Status |
|---|---------|--------|
| 1 | Auto tank alerts (low/critical/empty/full) | ✅ |
| 2 | Reading completeness checks before shift close | ✅ |

### P4 — Vue 3 SPA Conversion (1/1)

| # | Feature | Status |
|---|---------|--------|
| 1 | Full Vue 3 SPA with 40+ views, JWT auth, mobile-responsive | ✅ |

---

## Data Models

### Core Infrastructure
- **Station** — name, address, status, relationship_type, marketing_company
- **Island** — name, number, status → Station
- **Machine** — name, number → Island
- **Meter** — code, fuel_type, tank, current_reading, status → Machine
- **Tank** — name, fuel_type, capacity, current_level → Station
- **FuelType** — name, name_en
- **FuelPrice** — selling_price, profit_margin, effective_date, is_active → FuelType
- **TankReading** — reading_level, reading_type, recorded_at → Tank
- **TankTransfer** — from_tank, to_tank, quantity, status → Station
- **TankAlert** — alert_type, message, is_resolved → Station, Tank

### Operations
- **Employee** — name, phone, status, shift_type → Station
- **ShiftDefinition** — name, start_time, end_time, days, island → Station
- **Shift** — date, start_time, end_time, status → Station, Definition, Island
- **MeterReading** — start_reading, end_reading, liters_sold, exception_type → Shift, Meter

### Finance
- **CashCollection** — amount, time, is_cancelled → Shift
- **Voucher** — count, total_value, is_cancelled → Shift, VoucherCategory
- **POSRecord** — total_amount, is_cancelled → Shift
- **Expense** — amount, description, status → Station, Shift, ExpenseCategory
- **Reconciliation** — total_liters, expected_sales, total_cash, total_vouchers, total_pos, total_expenses, net_cash → Shift
- **ShiftFuelSummary** — liters_sold, unit_price, expected_sales → Reconciliation, FuelType
- **VoucherSettlement** — denom_5/6/8, total_value, status, paid_amount → Station

### Inventory
- **Delivery** — expected_quantity, received_quantity, shortage, payment fields → Station, Tank
- **DeliveryRequest** — requested_quantity, priority, status → Station, Tank
- **ShortageClaim** — shortage_amount, status → Delivery
- **FuelReconciliation** — opening/closing readings, received, transferred, sold, theoretical, actual, variance → Tank

---

## Financial Invariants

All verified by automated tests:

```
1. liters_sold = closing_reading - opening_reading (per meter)
2. fuel_expected_sales = fuel_liters × frozen_unit_price (per fuel type)
3. total_expected_sales = sum(fuel_expected_sales)
4. total_collected = cash + vouchers + POS
5. reconciliation_difference = total_collected - total_expected_sales
6. net_cash = cash_collected - cash_expenses
7. tank_theoretical = opening + received + transferred_in - transferred_out - sold
8. tank_variance = actual_level - theoretical
9. transfer_updates_levels = source - qty, dest + qty
10. settlement_outstanding = total_value - paid_amount
```

---

## User Roles

| Role | Access |
|------|--------|
| **مدير النظام (admin)** | Full access to all stations + user management |
| **مالك (owner)** | Full access to all stations |
| **مشرف (supervisor)** | Operations CRUD scoped to their station |
| **مالي (finance)** | Financial CRUD scoped to their station |

---

## Test Coverage

| Test Class | Tests | What |
|------------|-------|------|
| AuthAndIsolationTests | 5 | RBAC, station isolation |
| RecurringShiftTests | 5 | Shift definitions, generation |
| MeterReadingTests | 4 | Readings, attendants, cross-station |
| FinanceAccessTests | 5 | Cash, vouchers, reconciliation |
| UserManagementTests | 5 | User CRUD, own-account protection |
| GuideAndReportsTests | 5 | Guide, reports, station deletion |
| P0MultiFuelTests | 11 | Multi-fuel, frozen prices, per-fuel breakdown |
| P1ContinuityAndExpensesTests | 10 | Meter continuity, expense treatment |
| P1Phase2FuelDeliveryTests | 16 | Tanks, deliveries, shortages |
| FuelReconciliationTests | 12 | Tank-level fuel reconciliation |
| TankTransferTests | 11 | Tank-to-tank transfers |
| VoucherSettlementTests | 12 | Voucher settlement workflow |
| P2P3FeatureTests | 10 | Gap detection, alerts, delivery requests, inventory dashboard |
| **Total** | **113** | |

---

## Demo Users

| Username | Password | Role | Access |
|----------|----------|------|--------|
| admin | admin123 | مدير النظام | كل شيء |
| owner | owner123 | مالك | كل المحطات |
| supervisor_a | super123 | مشرف | محطة بنغازي فقط |
| finance_a | fin123 | المالي | محطة بنغازي فقط |
| supervisor_b | super123 | مشرف | محطة السراج فقط |
| finance_b | fin123 | المالي | محطة السراج فقط |

---

## Deployment

### Production Settings

| Setting | Value |
|---------|-------|
| `DEBUG` | `False` (via env var) |
| `ALLOWED_HOSTS` | Configurable via `DJANGO_ALLOWED_HOSTS` |
| `SECURE_HSTS_SECONDS` | 31536000 (1 year) |
| `SESSION_COOKIE_SECURE` | `True` in production |
| `CSRF_COOKIE_SECURE` | `True` in production |
| `LOGGING` | File + console handlers |

### Systemd Service

```bash
# Service file: /etc/systemd/system/sejel.service
systemctl status sejel      # Check status
systemctl restart sejel     # Restart
systemctl stop sejel        # Stop
journalctl -u sejel -f      # View logs
```

### Build & Deploy

```bash
# Build Vue SPA
cd sejel/frontend
npm install
npx vite build              # Output: ../staticfiles/vue/

# Django
cd sejel
source ../venv/bin/activate
python manage.py migrate
python manage.py collectstatic
python manage.py reset_demo  # Seed demo data

# Run
python manage.py runserver 0.0.0.0:8004
# Or: gunicorn sejel.wsgi:application --bind 0.0.0.0:8004
```

### Nginx Config

```nginx
server {
    listen 8004;
    server_name _;
    client_max_body_size 10M;

    location /static/ {
        alias /root/projects/Sejel/sejel/staticfiles/;
    }

    location /media/ {
        alias /root/projects/Sejel/sejel/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Reset Command

```bash
python manage.py reset_demo
```

Resets the database with clean demo data: 2 stations, 4 islands, 8 machines, 16 meters, 4 tanks, 4 employees, 6 shift definitions, and all demo users.
