# Sejel App — Frappe Backend & Vue SPA

**Version**: 1.0.0
**Date**: September 2026
**Platform**: Frappe Framework v15 + Vue 3 SPA
**License**: MIT

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Entity Relationship Diagram](#4-entity-relationship-diagram)
5. [DocType Specifications](#5-doctype-specifications)
6. [API Reference](#6-api-reference)
7. [Business Workflows](#7-business-workflows)
8. [User Roles & Permissions](#8-user-roles--permissions)
9. [Frontend (Vue SPA)](#9-frontend-vue-spa)
10. [Deployment & Infrastructure](#10-deployment--infrastructure)
11. [Test Results](#11-test-results)
12. [Seed Data](#12-seed-data)
13. [End User Document Mapping](#13-end-user-document-mapping)
14. [Known Limitations](#14-known-limitations)

---

## 1. System Overview

Sejel is a fuel station management system that tracks:

- **Station infrastructure**: stations, islands, machines (pumps), meters, tanks
- **Shift operations**: shift scheduling, meter readings, cash collections, voucher (coupon) sales, POS (e-payment) records
- **Financial reconciliation**: shift closing, surplus/shortage detection, voucher settlements
- **Inventory**: fuel deliveries, tank readings, fuel transfers, fuel reconciliation, shortage claims
- **Expenses**: expense tracking with approval workflow
- **Reporting**: daily sales, monthly reports, inventory reports

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     BROWSER (Client)                     │
│                                                          │
│  ┌────────────────────┐  ┌─────────────────────────────┐ │
│  │   Vue 3 SPA        │  │   Frappe Desk (optional)    │ │
│  │   Port 8004        │  │   Port 80                   │ │
│  │   /app/* routes    │  │   /desk/* routes            │ │
│  └────────┬───────────┘  └─────────────┬───────────────┘ │
│           │                            │                  │
└───────────┼────────────────────────────┼──────────────────┘
            │ HTTP (cookies)             │ HTTP (session)
            ▼                            ▼
┌───────────────────┐    ┌─────────────────────────────────┐
│  NGINX (8004)     │    │  NGINX (80)                     │
│  - SPA static     │    │  - ERPNext/Frappe Desk          │
│  - /api/* proxy   │    │  - Geo API                      │
└─────────┬─────────┘    └──────────────┬──────────────────┘
          │                             │
          ▼                             ▼
┌───────────────────────────────────────────────────────────┐
│                  FRAPPE BENCH (port 8002)                  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  sejel_app (Custom App)                             │  │
│  │  - api/auth.py    (login, me)                       │  │
│  │  - api/views.py   (CRUD dispatch, reports)          │  │
│  │  - api/crud.py    (generic helpers)                 │  │
│  │  - 26 DocTypes with Python controllers              │  │
│  └─────────────────────┬───────────────────────────────┘  │
│                        │                                  │
│  ┌─────────────────────▼───────────────────────────────┐  │
│  │  PostgreSQL Database (_730feba3f0c64c86)             │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend Framework | Frappe | v15 |
| Backend Language | Python | 3.10+ |
| Database | PostgreSQL | 14+ |
| Frontend Framework | Vue | 3.x |
| State Management | Pinia | latest |
| HTTP Client | Axios | latest |
| CSS | Tailwind CSS | 3.x |
| Build Tool | Vite | latest |
| Web Server | Nginx | 1.18 |
| App Server | Werkzeug (bench serve) | via Frappe |

---

## 4. Entity Relationship Diagram

```
Marketing Company
  │
  └────────────────────────────────────────────────────────┐
                                                           │
Fuel Type ──────────────────────────────────────────────┐  │
  │                                                     │  │
  │   ┌──────────────────────────────────────────┐      │  │
  │   │                                          │      │  │
  │   ▼                                          ▼      ▼  │
  │  Fuel Price                              Station ◄─────┘
  │  (fuel_type,                              │
  │   selling_price)                          │
  │                                     ┌──────┴──────┐
  │                                     │             │
  │                                     ▼             ▼
  │                                 Island          Tank
  │                                 │               │
  │                                 ▼               ├── Tank Reading
  │                             Machine             ├── Delivery
  │                             │                   │     └── Shortage Claim
  │                             ▼                   ├── Fuel Reconciliation
  │                          Meter                  └── Tank Transfer (from/to)
  │                          │
  │                          └── Meter Reading ──────────────┐
  │                                                         │
  │   ┌─────────────────────────────────────────────────────┘
  │   │
  │   ▼
  │  Shift ◄───────────────────────────────────────────────┐
  │  │                                                      │
  │  ├── Meter Reading (1:N)                                │
  │  ├── Cash Collection (1:N)                              │
  │  ├── Voucher (1:N)                                      │
  │  │     └── Voucher Category (N:1)                       │
  │  ├── POS Record (1:N)                                   │
  │  └── Reconciliation (1:1)                               │
  │        └── Shift Fuel Summary (1:N)                     │
  │                                                         │
  ├── Employee (1:N)                                        │
  ├── Expense (1:N)                                         │
  │     └── Expense Category (N:1)                          │
  ├── Shift Definition (1:N)                                │
  ├── Delivery Request (1:N)                                │
  ├── Voucher Settlement (1:N)                              │
  └── Fuel Reconciliation (1:N) ◄───────────────────────────┘
```

### Relationship Summary

| Parent | Child | Cardinality | Link Field |
|--------|-------|-------------|------------|
| Station | Island | 1:N | `station` |
| Station | Tank | 1:N | `station` |
| Station | Shift | 1:N | `station` |
| Station | Employee | 1:N | `station` |
| Station | Expense | 1:N | `station` |
| Station | Delivery Request | 1:N | `station` |
| Station | Voucher Settlement | 1:N | `station` |
| Station | Fuel Reconciliation | 1:N | `station` |
| Island | Machine | 1:N | `island` |
| Machine | Meter | 1:N | `machine` |
| Tank | Tank Reading | 1:N | `tank` |
| Tank | Delivery | 1:N | `tank` |
| Tank | Fuel Reconciliation | 1:N | `tank` |
| Shift | Meter Reading | 1:N | `shift` |
| Shift | Cash Collection | 1:N | `shift` |
| Shift | Voucher | 1:N | `shift` |
| Shift | POS Record | 1:N | `shift` |
| Shift | Reconciliation | 1:1 | `shift` |
| Reconciliation | Shift Fuel Summary | 1:N | `reconciliation` |
| Delivery | Shortage Claim | 1:1 | `delivery` |
| Fuel Type | Meter | N:1 | `fuel_type` |
| Fuel Type | Tank | N:1 | `fuel_type` |
| Fuel Type | Fuel Price | N:1 | `fuel_type` |
| Fuel Type | Delivery | N:1 | `fuel_type` |
| Marketing Company | Station | N:1 | `marketing_company` |
| Voucher Category | Voucher | N:1 | `category` |
| Expense Category | Expense | N:1 | `category` |

---

## 5. DocType Specifications

### 5.1 Station

**Purpose**: Represents a physical gas station.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `station_name` | Data | Yes | | Title field, searchable |
| `address` | Small Text | No | | |
| `status` | Select | No | `active` | active/inactive/maintenance |
| `relationship_type` | Select | No | | owned/rented/agency |
| `marketing_company` | Link (Marketing Company) | No | | |
| `cash_collection_mode` | Select | No | `during_shift` | during_shift/end_of_shift |
| `target_cash_amount` | Currency (LYD) | No | `500` | |
| `photo_meter_required` | Check | No | `false` | |
| `islands_count` | Int | No | `2` | |
| `machines_per_island` | Int | No | `2` | |
| `meters_per_machine` | Int | No | `2` | |
| `tanks_count` | Int | No | `4` | |

**Naming**: By field `station_name`
**Controller**: No custom logic

---

### 5.2 Island

**Purpose**: A pump island within a station (e.g., "Island 1", "Island 2").

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `island_name` | Data | Yes | | Title field |
| `station` | Link (Station) | Yes | | |
| `number` | Int | Yes | | Unique per station |
| `status` | Select | No | `active` | active/inactive |

**Unique constraint**: `[station, number]`
**Controller**: No custom logic

---

### 5.3 Machine

**Purpose**: A fuel pump machine within an island. Each machine has two counters (meters).

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `machine_name` | Data | Yes | | Title field |
| `island` | Link (Island) | Yes | | |
| `station` | Link (Station) | Yes | | Auto-populated from Island, read-only |
| `number` | Int | Yes | | Unique per island |

**Unique constraint**: `[island, number]`
**Controller**: Auto-populates `station` from linked Island on validate.

---

### 5.4 Meter

**Purpose**: A fuel meter attached to a machine. Each machine has two meters (counters).

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `machine` | Link (Machine) | Yes | | |
| `meter_code` | Data | Yes | | Title field, searchable |
| `fuel_type` | Link (Fuel Type) | Yes | | |
| `tank` | Link (Tank) | Yes | | |
| `current_reading` | Float | No | `0` | Updated on each Meter Reading |
| `status` | Select | No | `active` | active/inactive/maintenance |

**Controller**: No custom logic

---

### 5.5 Fuel Type

**Purpose**: Types of fuel sold (Gasoline 91, Gasoline 95, Diesel, Gas).

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `fuel_name` | Data | Yes | | Autoname, unique |
| `fuel_name_en` | Data | No | | English name |
| `is_active` | Check | No | `true` | |

**Autoname**: `field:fuel_name`
**Controller**: No custom logic

---

### 5.6 Fuel Price

**Purpose**: Tracks selling price per fuel type over time. Frozen at time of shift closing for reconciliation.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `fuel_type` | Link (Fuel Type) | Yes | | |
| `selling_price` | Currency (LYD) | Yes | | Price per liter |
| `profit_margin` | Currency (LYD) | No | | |
| `cost_per_liter` | Currency (LYD) | No | | |
| `effective_date` | Date | Yes | | |
| `is_active` | Check | No | `true` | |

**Controller**: No custom logic

---

### 5.7 Marketing Company

**Purpose**: External fuel suppliers/marketing companies.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `company_name` | Data | Yes | | Title field, searchable |
| `company_name_en` | Data | No | | English name |

**Controller**: No custom logic

---

### 5.8 Tank

**Purpose**: Fuel storage tanks at a station. Can optionally be dedicated to a specific machine.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `tank_name` | Data | Yes | | Title field |
| `station` | Link (Station) | Yes | | |
| `fuel_type` | Link (Fuel Type) | Yes | | |
| `capacity` | Float | Yes | | In liters |
| `current_level` | Float | No | `0` | Updated by Tank Reading |
| `dedicated_to_machine` | Link (Machine) | No | | Optional machine dedication |
| `last_reading_date` | Datetime | No | | Updated by Tank Reading |

**Controller**:
- `validate()`: Checks `dedicated_to_machine` belongs to same station
- `level_percent` property: `(current_level / capacity) * 100`
- `latest_reading()`: Returns most recent Tank Reading
- `total_sales_liters(since)`: Sums liters_sold from Meter Readings filtered by fuel_type
- `total_received(since)`: Sums received_quantity from Deliveries

---

### 5.9 Tank Reading

**Purpose**: Manual or automated readings of tank fuel levels.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `tank` | Link (Tank) | Yes | | |
| `reading_level` | Float | Yes | | Current level in liters |
| `reading_type` | Select | No | `daily` | opening/pre_delivery/post_delivery/daily/other |
| `recorded_at` | Datetime | Yes | | |
| `recorded_by` | Link (User) | No | | Auto-set to current user |
| `notes` | Small Text | No | | |

**Controller**:
- `validate()`: Auto-sets `recorded_by` to current user
- `on_update()`: Updates `Tank.current_level` and `Tank.last_reading_date`

---

### 5.10 Employee

**Purpose**: Station employees (attendants, supervisors).

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `employee_name` | Data | Yes | | Title field |
| `station` | Link (Station) | Yes | | |
| `phone` | Data | No | | |
| `status` | Select | No | `active` | active/inactive |

**Controller**: No custom logic

---

### 5.11 Shift Definition

**Purpose**: Template for recurring shift schedules.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `definition_name` | Data | Yes | | |
| `station` | Link (Station) | Yes | | |
| `island` | Link (Island) | No | | |
| `start_time` | Time | Yes | | |
| `end_time` | Time | Yes | | |
| `days` | Data | No | `0,1,2,3,4,5,6` | Comma-separated day numbers |
| `default_employee` | Link (Employee) | No | | |
| `is_active` | Check | No | `true` | |
| `description` | Small Text | No | | |
| `display_order` | Int | No | `0` | |

**Controller**:
- `day_list()`: Parses comma-separated days string into list of ints
- `days_display()`: Returns human-readable day names

---

### 5.12 Shift

**Purpose**: An operational shift at a station. Central entity linking all shift-level data.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `shift_name` | Data | Yes | | Title field |
| `station` | Link (Station) | Yes | | |
| `definition` | Link (Shift Definition) | No | | |
| `employee` | Link (Employee) | No | | |
| `island` | Link (Island) | No | | |
| `date` | Date | Yes | | |
| `start_time` | Time | Yes | | |
| `end_time` | Time | No | | |
| `status` | Select | No | `open` | open/in_progress/submitted/reconciled/closed/cancelled/under_review |
| `closed_by` | Link (User) | No | | |
| `closed_at` | Datetime | No | | |
| `notes` | Small Text | No | | |

**Controller**:
- `crosses_midnight` property: True if `end_time <= start_time`
- `close_shift()`: Validates status is "submitted", sets to "closed", creates Reconciliation
- `create_reconciliation()`: Aggregates Meter Readings, Cash Collections, Vouchers, POS Records. Computes expected sales using frozen Fuel Price. Creates Reconciliation with difference_type (matched/surplus/shortage).

---

### 5.13 Meter Reading

**Purpose**: Records start/end readings for a meter during a shift. Calculates liters sold.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `shift` | Link (Shift) | Yes | | |
| `meter` | Link (Meter) | Yes | | |
| `attendant` | Link (Employee) | No | | |
| `start_reading` | Float | Yes | | |
| `end_reading` | Float | No | | |
| `liters_sold` | Float | No | `0` | Auto-calculated: `end_reading - start_reading` |
| `photo` | Attach Image | No | | |
| `exception_type` | Select | No | | (blank)/reset/replacement/other |
| `exception_authorized_by` | Link (User) | No | | |
| `recorded_at` | Datetime | No | | |

**Controller**:
- `validate()`: Calculates `liters_sold = end_reading - start_reading`
- `validate_continuity()`: Warns if start_reading doesn't match previous end_reading (unless exception_type set)
- `on_update()`: Updates `Meter.current_reading`

---

### 5.14 Cash Collection

**Purpose**: Records cash collected during a shift.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `shift` | Link (Shift) | Yes | | |
| `amount` | Currency (LYD) | Yes | | |
| `time` | Datetime | Yes | | |
| `received_by` | Link (User) | No | | |
| `reference` | Data | No | | |
| `notes` | Small Text | No | | |
| `is_cancelled` | Check | No | `false` | |
| `cancelled_at` | Datetime | No | | |
| `cancelled_by` | Link (User) | No | | |

**Controller**: No custom logic

---

### 5.15 Voucher

**Purpose**: Records coupon/voucher sales during a shift. Tied to a Voucher Category.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `shift` | Link (Shift) | Yes | | |
| `category` | Link (Voucher Category) | Yes | | |
| `count` | Int | Yes | | Number of vouchers sold |
| `total_value` | Currency (LYD) | No | | Auto-calculated: `count × category.value` |
| `is_cancelled` | Check | No | `false` | |

**Controller**: Auto-calculates `total_value` if not set.

---

### 5.16 POS Record

**Purpose**: Records electronic payment (card/mobile) transactions during a shift.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `shift` | Link (Shift) | Yes | | |
| `total_amount` | Currency (LYD) | Yes | | |
| `transaction_count` | Int | No | | |
| `notes` | Small Text | No | | |
| `entered_by` | Link (User) | No | | |
| `is_cancelled` | Check | No | `false` | |

**Controller**: No custom logic

---

### 5.17 Voucher Category

**Purpose**: Defines voucher denominations (5, 6, 7, 8 LYD).

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `category_name` | Data | Yes | | Title field |
| `value` | Currency (LYD) | Yes | | Denomination value |
| `is_active` | Check | No | `true` | |

**Controller**: No custom logic

---

### 5.18 Voucher Settlement

**Purpose**: Batch settlement of vouchers with the marketing company.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `station` | Link (Station) | Yes | | |
| `submission_date` | Date | Yes | | |
| `total_value` | Currency (LYD) | No | | Auto-calculated, read-only |
| `total_count` | Int | No | | Auto-calculated, read-only |
| `denom_5` | Int | No | `0` | 5 LYD count |
| `denom_6` | Int | No | `0` | 6 LYD count |
| `denom_7` | Int | No | `0` | 7 LYD count |
| `denom_8` | Int | No | `0` | 8 LYD count |
| `status` | Select | No | `submitted` | submitted/paid/partial/disputed/cancelled |
| `paid_amount` | Currency (LYD) | No | `0` | |
| `payment_date` | Date | No | | |
| `payment_reference` | Data | No | | |
| `notes` | Small Text | No | | |

**Controller**:
- `calculate_totals()`: `total_value = Σ(denom_N × N)` and `total_count = Σ(denom_N)`
- `outstanding` property: `total_value - paid_amount`

---

### 5.19 Expense Category

**Purpose**: Categories for station expenses (maintenance, utilities, etc.).

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `category_name` | Data | Yes | | Title field |
| `station` | Link (Station) | No | | If set, category is station-specific |
| `is_active` | Check | No | `true` | |

**Controller**: No custom logic

---

### 5.20 Expense

**Purpose**: Records station expenses with approval workflow.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `station` | Link (Station) | Yes | | |
| `shift` | Link (Shift) | No | | |
| `category` | Link (Expense Category) | Yes | | |
| `amount` | Currency (LYD) | Yes | | |
| `description` | Small Text | Yes | | |
| `paid_to` | Data | No | | |
| `payment_method` | Select | No | `cash` | cash/voucher/other |
| `attachment` | Attach | No | | |
| `status` | Select | No | `pending` | pending/approved/rejected/cancelled |
| `created_by` | Link (User) | No | | |
| `approved_by` | Link (User) | No | | |

**Controller**: No custom logic

---

### 5.21 Reconciliation

**Purpose**: Financial reconciliation generated when a shift is closed. Compares expected vs actual collections.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `shift` | Link (Shift) | Yes | | |
| `station` | Link (Station) | Yes | | |
| `total_liters` | Float | No | | Sum of liters_sold from Meter Readings |
| `expected_sales` | Currency (LYD) | No | | Calculated from fuel prices |
| `total_cash` | Currency (LYD) | No | | Sum of Cash Collections |
| `total_vouchers` | Currency (LYD) | No | | Sum of Vouchers |
| `total_pos` | Currency (LYD) | No | | Sum of POS Records |
| `total_collection` | Currency (LYD) | No | | cash + vouchers + pos |
| `total_expenses` | Currency (LYD) | No | | Cash-method expenses for the shift (linked to the shift, or station+date fallback) |
| `net_cash` | Currency (LYD) | No | | total_cash − total_expenses (invariant §1.6 — expenses hit cash, not sales) |
| `difference` | Currency (LYD) | No | | total_collection − expected_sales |
| `difference_type` | Select | No | | matched/surplus/shortage |
| `status` | Select | No | `draft` | draft/confirmed |
| `confirmed_by` | Link (User) | No | | |
| `confirmed_at` | Datetime | No | | |

**Controller**:
- `recalculate_totals()`: Fetches Shift Fuel Summary records, sums all amounts via SQL, computes `difference` and `difference_type`.

---

### 5.22 Shift Fuel Summary

**Purpose**: Per-fuel-type breakdown within a Reconciliation.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `reconciliation` | Link (Reconciliation) | Yes | | |
| `fuel_type` | Link (Fuel Type) | Yes | | |
| `liters_sold` | Float | No | | |
| `unit_price` | Currency (LYD) | No | | Frozen price at shift close |
| `expected_sales` | Currency (LYD) | No | | `liters_sold × unit_price` |

**Controller**: No custom logic

---

### 5.23 Delivery

**Purpose**: Tracks fuel deliveries to the station. Includes invoice tracking and shortage claims.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `station` | Link (Station) | Yes | | |
| `tank` | Link (Tank) | No | | Primary tank |
| `fuel_type` | Link (Fuel Type) | Yes | | |
| `supplier` | Link (Marketing Company) | No | | |
| `requested_quantity` | Float | Yes | | |
| `expected_quantity` | Float | Yes | | Default: 40000L |
| `received_quantity` | Float | No | | Auto-calculated: `post_reading - pre_reading` |
| `shortage` | Float | No | `0` | Auto-calculated: `max(0, expected - received)` |
| `order_date` | Datetime | Yes | | |
| `arrival_date` | Datetime | No | | |
| `pre_reading` | Float | No | | Tank reading before delivery |
| `post_reading` | Float | No | | Tank reading after delivery |
| `document_number` | Data | No | | |
| `invoice_number` | Data | No | | |
| `invoiced_amount` | Currency (LYD) | No | | |
| `paid_amount` | Currency (LYD) | No | `0` | |
| `payment_date` | Datetime | No | | |
| `payment_reference` | Data | No | | |
| `payment_status` | Select | No | `unpaid` | unpaid/partial/paid |
| `status` | Select | No | `ordered` | ordered/received/claimed/settled/closed |
| `total_allocated` | Float | No | `0` | |
| `remaining_on_truck` | Float | No | `0` | |

**Controller**: Calculates `received_quantity` and `shortage` on validate.

---

### 5.24 Delivery Request

**Purpose**: Request for fuel delivery when tank levels are low.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `station` | Link (Station) | Yes | | |
| `fuel_type` | Link (Fuel Type) | Yes | | |
| `requested_quantity` | Float | Yes | | |
| `priority` | Select | No | `normal` | normal/urgent |
| `current_level` | Float | No | | Current tank level at request time |
| `reason` | Small Text | No | | |
| `status` | Select | No | `pending` | pending/approved/dispatched/received/cancelled |
| `expected_delivery_date` | Date | No | | |
| `notes` | Small Text | No | | |

**Controller**: No custom logic

---

### 5.25 Shortage Claim

**Purpose**: Claims for fuel shortage discovered during delivery.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `delivery` | Link (Delivery) | Yes | | Unique |
| `shortage_amount` | Float | Yes | | |
| `status` | Select | No | `not_claimed` | not_claimed/claimed/settled/closed |
| `claim_date` | Datetime | No | | |
| `settlement_date` | Datetime | No | | |
| `notes` | Small Text | No | | |

**Controller**: No custom logic

---

### 5.26 Fuel Reconciliation

**Purpose**: Daily tank-level reconciliation comparing theoretical vs actual fuel levels.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `tank` | Link (Tank) | Yes | | |
| `station` | Link (Station) | Yes | | |
| `date` | Date | Yes | | |
| `opening_reading` | Link (Tank Reading) | No | | |
| `closing_reading` | Link (Tank Reading) | No | | |
| `received_quantity` | Float | No | `0` | |
| `transferred_in` | Float | No | `0` | |
| `transferred_out` | Float | No | `0` | |
| `sold_quantity` | Float | No | `0` | |
| `theoretical_level` | Float | No | `0` | Auto-calculated |
| `actual_level` | Float | No | `0` | |
| `variance` | Float | No | `0` | `actual - theoretical` |
| `variance_type` | Select | No | `matched` | matched/surplus/shortage |
| `status` | Select | No | `draft` | draft/confirmed |
| `notes` | Small Text | No | | |

**Controller**: `calculate_theoretical()`: `theoretical = opening + received + transferred_in - transferred_out - sold`

---

## 6. API Reference

### 6.1 Base URL

All API requests go through nginx at port 8004:
```
http://<host>:8004/api/<resource>/
```

Authentication is session-based (cookies). No JWT tokens required.

### 6.2 Authentication

#### `POST /api/auth/login/`

Login with username/password.

**Request**:
```json
{
  "username": "admin@sejel.ly",
  "password": "admin123"
}
```

**Response**:
```json
{
  "message": {
    "user": {
      "id": "admin@sejel.ly",
      "username": "admin",
      "email": "admin@sejel.ly",
      "full_name": "Admin",
      "role": "admin",
      "is_staff": true,
      "station_id": null
    },
    "csrf_token": "…"
  }
}
```

**CSRF**: unsafe methods (POST/PUT/PATCH/DELETE) require the session's CSRF token in the `X-Frappe-CSRF-Token` header. The SPA stores the token from login/`me` responses and sends it automatically (see `api.js`).

**Role mapping** (first match wins):
| Frappe Role | API Role |
|-------------|----------|
| Sejel Manager | `manager` |
| Sejel Finance | `finance` |
| Sejel Supervisor | `supervisor` |
| System Manager | `admin` |
| Default | `supervisor` |

**Station binding**: the User doctype has a custom `sejel_station` Link field (patch `v1_user_station_binding`). When set, it is returned as `station_id` and hard-scopes that user's data everywhere (lists, detail, reports, exports, and writes). System Manager and Sejel Manager are never scoped; any other role — supervisor, finance — is scoped as soon as `sejel_station` is set. Unbound users keep the multi-station selector.

#### `GET /api/auth/me/`

Get current authenticated user. Requires valid session cookie.

**Response**: Same as login response.

---

### 6.3 Generic CRUD

All resources follow the same pattern. The URL slug maps to a DocType via the `RESOURCES` dict in `views.py`.

**Authentication**: every route here requires a session cookie — no CRUD route is reachable by a guest (2026-10-03; only the four `/api/auth/` routes and `api/ux.py:report_client_error` are `allow_guest`). **Scoping**: for a station-bound user, the list filter is injected server-side, a single-document GET/PUT/DELETE on a foreign row returns `PermissionError`, and a create/update payload naming a foreign station is refused with `403` before the row exists.

#### `GET /api/{resource}/` — List

**Query Parameters**:
- Standard Frappe filters (field=value)
- `limit_page_length` (default: 0 = unlimited; the SPA has no pagination and volumes are small)
- `offset` (default: 0)
- `order_by` (default: `modified desc`)
- Internal params (`cmd`, `resource`, `user`, `sid`, `device`, `type`) are stripped

**Response**:
```json
{
  "message": {
    "results": [
      { "name": "abc123", "station_name": "Station 1", "status": "active", ... }
    ],
    "total": 42
  }
}
```

#### `POST /api/{resource}/` — Create

**Request**: JSON body with field values.

**Response**: Created document as dict.

#### `GET /api/{resource}/{name}/` — Get Single

**Response**: Single document as dict.

#### `PUT /api/{resource}/{name}/` — Update

**Request**: JSON body with fields to update.

**Response**: Updated document as dict.

#### `DELETE /api/{resource}/{name}/` — Delete

**Response**: `{ "message": { "ok": true } }`

---

### 6.4 Resource Mapping

| URL Slug | DocType | List Fields |
|----------|---------|-------------|
| `stations` | Station | station_name, address, status, relationship_type, marketing_company |
| `islands` | Island | island_name, station, number, status |
| `machines` | Machine | machine_name, island, station, number |
| `meters` | Meter | meter_code, machine, fuel_type, tank, current_reading, status |
| `tanks` | Tank | tank_name, station, fuel_type, capacity, current_level, last_reading_date |
| `fuel-types` | Fuel Type | fuel_name, fuel_name_en, is_active |
| `fuel-prices` | Fuel Price | fuel_type, selling_price, profit_margin, cost_per_liter, effective_date, is_active |
| `marketing-companies` | Marketing Company | company_name, company_name_en |
| `employees` | Employee | employee_name, station, phone, status |
| `shift-definitions` | Shift Definition | definition_name, station, island, start_time, end_time, days, is_active |
| `shifts` | Shift | shift_name, station, definition, employee, island, date, start_time, end_time, status |
| `meter-readings` | Meter Reading | shift, meter, attendant, start_reading, end_reading, liters_sold, exception_type, recorded_at |
| `cash-collections` | Cash Collection | shift, amount, time, received_by, is_cancelled |
| `vouchers` | Voucher | shift, category, count, total_value, is_cancelled |
| `pos-records` | POS Record | shift, total_amount, transaction_count, is_cancelled |
| `expenses` | Expense | station, shift, category, amount, description, status, payment_method |
| `expense-categories` | Expense Category | category_name, station, is_active |
| `voucher-settlements` | Voucher Settlement | station, submission_date, total_value, total_count, denom_5, denom_6, denom_7, denom_8, status, paid_amount |
| `reconciliations` | Reconciliation | shift, station, total_liters, expected_sales, total_cash, total_vouchers, total_pos, total_collection, difference, difference_type, status |
| `deliveries` | Delivery | station, fuel_type, supplier, expected_quantity, received_quantity, shortage, invoice_number, payment_status, status, order_date |
| `delivery-requests` | Delivery Request | station, fuel_type, requested_quantity, priority, status, expected_delivery_date |
| `tank-readings` | Tank Reading | tank, reading_level, reading_type, recorded_at, recorded_by, notes |
| `fuel-reconciliations` | Fuel Reconciliation | tank, station, date, received_quantity, transferred_in, transferred_out, sold_quantity, theoretical_level, actual_level, variance, variance_type, status |
| `shortage-claims` | Shortage Claim | delivery, shortage_amount, status, claim_date, settlement_date |
| `voucher-categories` | Voucher Category | category_name, value, is_active |

---

### 6.5 Special Endpoints

#### `POST /api/shifts/{name}/close/` — Close Shift

Triggers `Shift.close_shift()` which:
1. Validates shift status is "submitted"
2. Sets status to "closed"
3. Creates Reconciliation with aggregated data
4. Returns `{ "message": { "ok": true, "status": "closed" } }`

#### `POST /api/setup-station/` — Atomic Station Setup (Wizard)

Creates a complete station — islands, machines, tanks, meters — in a single transaction. Any failure rolls back everything (no half-configured station is ever left behind).

**Request**:
```json
{
  "station": {
    "station_name": "محطة جديدة",
    "address": "طرابلس",
    "relationship_type": "owned",
    "marketing_company": null
  },
  "islands_count": 2,
  "machines_per_island": 2,
  "meters_per_machine": 2,
  "tanks": [
    { "fuel_type": "بنزين", "capacity": 50000 },
    { "fuel_type": "ديزل", "capacity": 50000 }
  ]
}
```

> **Note (2026-09-12):** Fuel types are exactly `بنزين` and `ديزل` — the
> legacy `بنزين 91`/`بنزين 95` records were merged into `بنزين` by patch
> `v2_fuel_consolidation` and all referencing docs repointed.

**Behavior**:
- Islands numbered continuing after existing ones; machines numbered globally per station
- Names auto-generated: `جزيرة 1`, `مضخة 1`…; meter codes `M01A`, `M01B`… (globally unique)
- Meters cycle across the provided tank fuel types, each linked to the matching tank
- Rejects duplicate `station_name`; counts capped (20 islands, 20 machines/island, 10 meters/machine)

**Response**:
```json
{ "ok": true, "station": "abc123", "created": { "islands": 2, "machines": 4, "tanks": 2, "meters": 8 } }
```

#### `GET /api/dashboard/` — Dashboard Stats

**Response**:
```json
{
  "message": {
    "total_stations": 1,
    "total_tanks": 4,
    "open_shifts": 2,
    "pending_deliveries": 0,
    "low_tanks": 0
  }
}
```

#### `GET /api/dashboard-station/?station=<id>&date=YYYY-MM-DD` — Operations Dashboard (v2)

The data source for the redesigned operations dashboard. **One request returns the entire payload** — station tree (islands → machines → meters), tanks with server-computed status, today's shifts, latest readings, KPIs, alerts and the financial reconciliation summary. The SPA never recomputes financial or threshold values.

**Scoping**: a supervisor bound to a station (User custom field `sejel_station`) can only fetch that station — requesting another returns `PermissionError`. An unbound request (owner/admin/finance with no `station` param) returns an **aggregate** payload with one card per active station (`mode: "aggregate"`).

**Response (single station)**:
```json
{
  "message": {
    "mode": "station",
    "station": { "id": "…", "name": "445", "address": "…", "cash_collection_mode": "during_shift" },
    "islands": [
      { "id": "…", "name": "جزيرة 1", "machines": [
        { "id": "…", "name": "مضخة 1", "meters": [
          { "id": "…", "meter_code": "M01A", "fuel_type": "بنزين 95", "current_reading": 125430,
            "reading": { "start_reading": 125430, "end_reading": 126280, "liters_sold": 850,
                         "attendant": "…", "photo": "…", "exception_type": null,
                         "unit_price": 0.15, "expected_sales": 127.5, "recorded_at": "…" } }
        ] }
      ] }
    ],
    "tanks": [ { "id": "…", "name": "خزان 1", "fuel_type": "بنزين 95", "capacity": 20000,
                 "current_level": 14400, "percent": 72.0, "status": "normal", "unit_price": 0.15 } ],
    "meters": [ "…flattened meter list with reading…" ],
    "shifts": [ { "id": "…", "name": "…", "status": "open", "employee": "…" } ],
    "kpis": { "total_liters": 850, "expected_sales": 127.5, "total_cash": 0, "total_vouchers": 0,
              "total_pos": 0, "total_collection": 0, "total_expenses": 0, "net_cash": null,
              "difference": null, "difference_type": null, "profit": null,
              "reconciliation_id": null, "reconciliation_status": null },
    "alerts": [ { "type": "tank_level", "severity": "critical", "message": "الخزان خزان 1 …", "link": "/app/tanks/…" } ],
    "summary": { "total_capacity": 40000, "current_volume": 0, "tanks_count": 2, "meters_count": 12 },
    "meta": { "role": "admin", "date": "2026-09-10", "bound_station": null, "generated_at": "…" }
  }
}
```

**Notes**:
- `kpis.*` money values come from the latest `Reconciliation` document (source of truth); `null` when no reconciliation exists yet — the SPA displays "—".
- `kpis.profit` = Σ (selling_price − cost_per_liter) × liters_sold over `Shift Fuel Summary` rows using the latest active `Fuel Price`; `null` (shown as غير مُعرّف) when cost data is missing.
- Tank `status` thresholds live in exactly one place (`_tank_status`): empty ≤1% · critical <10% · low <20% · normal · full ≥98%.
- `alerts` are computed server-side: tank levels, meter exceptions, missing readings, open shifts, pending reconciliation.

#### `GET /api/reports/daily-sales/?date=YYYY-MM-DD` — Daily Sales

**Response**:
```json
{
  "message": {
    "cash_sales": 17500.0,
    "coupon_sales": 155.0,
    "coupon_details": [
      { "category": 5, "count": 1, "total": 50.0 },
      { "category": 7, "count": 2, "total": 105.0 }
    ],
    "epayment_sales": 0,
    "total_collection": 17655.0,
    "total_expenses": 0,
    "net_income": 17655.0,
    "stations": []
  }
}
```

#### `GET /api/reports/daily/?date=YYYY-MM-DD` — Daily Report

Real per-station aggregates from Reconciliation (joined to Shift for the date):
total liters, expected sales, collection, difference and closed-shift count.
Station-scoped for bound users.

#### `GET /api/reports/monthly/?year=YYYY&month=MM` — Monthly Report

Real monthly aggregates from Reconciliation joined to Shift (the old placeholder
zeros are gone): per-station liters / expected sales / collection / expenses /
net cash / difference plus a per-fuel-type breakdown (from Shift Fuel Summary)
for the printable report. Station-scoped for bound users.

#### `GET /api/export/?view=station|reconciliation|shift&name=<docname>` — Excel Export

Generates an `.xlsx` workbook (openpyxl, RTL sheets, Arabic headers) for
download:

- `view=station` — overview, shifts, financial reconciliations, tanks, deliveries
- `view=reconciliation` — reconciliation summary + per-fuel-type sheet
- `view=shift` — shift info, meter readings, cash/voucher/POS sheets

Enforces station scoping. Consumed by the «تصدير Excel» buttons on the
dashboard, station page, shift detail and reconciliation detail.

---

### 6.6 Nginx Routing Rules

| Pattern | Priority | Destination |
|---------|----------|-------------|
| `= /api/auth/login/` | Exact | `auth.login` |
| `= /api/auth/me/` | Exact | `auth.get_me` |
| `= /api/dashboard/` | Exact | `views.get_dashboard` |
| `= /api/dashboard-station/` | Exact | `dashboard.dashboard_station` |
| `= /api/setup-station/` | Exact | `views.setup_station` |
| `^~ /api/reports/daily-sales/` | Prefix | `views.daily_sales` |
| `^~ /api/reports/daily/` | Prefix | `views.daily_report` |
| `^~ /api/reports/monthly/` | Prefix | `views.monthly_report` |
| `~ ^/api/([a-z-]+)/(.+)/close/$` | Regex | `views.close_shift` |
| `~ ^/api/([a-z-]+)/(.+)/$` | Regex | `views.crud_detail` |
| `~ ^/api/([a-z-]+)/$` | Regex | `views.crud_list` |
| `/socket.io/` | Prefix | Socket.io (port 9002) |
| `/` | Prefix | SPA static files |

---

## 7. Business Workflows

### 7.1 Station Setup

**Recommended**: use the SPA wizard at `/app/stations/setup-wizard` (sidebar: إعداد محطة; also linked from the Stations page header and the Dashboard stations section / empty state). It collects station info, island/machine/meter counts and tanks, previews generated names, and calls `POST /api/setup-station/` which creates everything atomically (see § 6.5). Meters are auto-coded `M01A/M01B…` and linked to matching fuel-type tanks.

Infrastructure added later (single island/machine/meter/tank via the station page tabs) also auto-numbers server-side: islands/machines continue after the highest existing number, names default to `جزيرة N`/`مضخة N`, and duplicate `station_name` is rejected at the DocType level.

**Manual** (unchanged):
```
Create Station → Create Islands (1, 2) → Create Machines per Island (1, 2)
→ Create Tanks (4) → Create Meters per Machine (1, 2)
→ Link each Meter to a Tank + Fuel Type
→ Create Employees → Create Shift Definitions
→ Set Fuel Prices → Seed Voucher Categories
```

### 7.2 Daily Shift Operations

```
1. Open Shift
   └── Create Shift record (station, date, start_time, status: open)

2. During Shift
   ├── Record Meter Readings (start/end per meter)
   ├── Record Cash Collections (amount, time)
   ├── Record Voucher Sales (category, count → auto-calc total)
   └── Record POS/E-Payment (amount)

3. Close Shift
   └── POST /api/shifts/{name}/close/
       ├── Validates status is "submitted"
       ├── Creates Reconciliation
       │   ├── Sums Meter Readings → total_liters
       │   ├── Calculates expected_sales (liters × frozen price)
       │   ├── Sums Cash Collections → total_cash
       │   ├── Sums Vouchers → total_vouchers
       │   ├── Sums POS Records → total_pos
       │   ├── total_collection = cash + vouchers + pos
       │   ├── Computes difference = expected - total_collection
       │   └── Sets difference_type: matched/surplus/shortage
       └── Sets shift status to "closed"
```

### 7.3 Voucher Settlement

```
1. Collect vouchers during shifts
2. Create Voucher Settlement
   ├── Enter denomination counts (5, 6, 7, 8 LYD)
   ├── Auto-calculate total_value and total_count
   └── Submit to marketing company
3. Track payment status (submitted → paid/partial/disputed)
```

### 7.4 Fuel Delivery

```
1. Create Delivery Request (station, fuel_type, quantity, priority)
2. Supplier dispatches fuel
3. Create Delivery record
   ├── Record pre-reading (tank level before)
   ├── Record post-reading (tank level after)
   ├── Auto-calculate received_quantity = post - pre
   ├── Auto-calculate shortage = max(0, expected - received)
   └── Track invoice_number, payment_status
4. If shortage → Create Shortage Claim
```

### 7.5 Tank Level Reconciliation

```
1. Record Tank Readings (daily, pre/post delivery)
2. Create Fuel Reconciliation
   ├── theoretical = opening + received + transferred_in - transferred_out - sold
   ├── actual = closing reading level
   └── variance = actual - theoretical (matched/surplus/shortage)
```

### 7.6 Expense Management

```
1. Create Expense (station, category, amount, description)
2. Status: pending → approved/rejected
3. Expenses feed into daily sales net_income calculation
```

---

## 8. User Roles & Permissions

### 8.1 Custom Roles

| Role | Description | Type |
|------|-------------|------|
| `Sejel Manager` | Full access to all Sejel resources | System Manager |
| `Sejel Supervisor` | Read-most, create shifts/readings/collections | System Manager |
| `Sejel Finance` | Read-most, manage settlements/expenses | System Manager |

### 8.2 Permission Matrix

| DocType | System Manager | Sejel Manager | Sejel Supervisor | Sejel Finance |
|---------|---------------|---------------|------------------|---------------|
| Station | CRUD | CRUD | R | R |
| Island | CRUD | CRUD | R | — |
| Machine | CRUD | CRUD | R | — |
| Meter | CRUD | CRUD | R | — |
| Fuel Type | CRUD | CRUD | R | R |
| Fuel Price | CRUD | CRUD | — | R |
| Marketing Company | CRUD | CRUD | — | R |
| Tank | CRUD | CRUD | R | — |
| Tank Reading | CRUD | CRUD | CRUD | — |
| Employee | CRUD | CRUD | R | — |
| Shift Definition | CRUD | CRUD | R | — |
| Shift | CRUD | CRUD | CRUD | — |
| Meter Reading | CRUD | CRUD | CRUD | — |
| Cash Collection | CRUD | CRUD | CRUD | CRUD |
| Voucher | CRUD | — | CRUD | CRUD |
| POS Record | CRUD | — | CRUD | CRUD |
| Expense | CRUD | CRUD | R | CRUD |
| Expense Category | CRUD | CRUD | — | R |
| Voucher Category | CRUD | CRUD | — | R |
| Voucher Settlement | CRUD | CRUD | — | CRUD |
| Reconciliation | CRUD | CRUD | — | R |
| Shift Fuel Summary | CRUD | — | — | CRUD |
| Delivery | CRUD | CRUD | R | CRUD |
| Delivery Request | CRUD | CRUD | CRUD | — |
| Shortage Claim | CRUD | CRUD | — | R |
| Fuel Reconciliation | CRUD | CRUD | — | R |

**R** = Read only, **CRUD** = Create/Read/Update/Delete

---

## 9. Frontend (Vue SPA)

### 9.1 Entry Point

- **URL**: `http://<host>:8004/app/`
- **HTML**: RTL Arabic layout (`lang="ar" dir="rtl"`)
- **Font**: Tajawal (Google Fonts)
- **Title**: "سجل — نظام إدارة محطات الوقود"

### 9.2 Route Structure

| Section | Routes | Views |
|---------|--------|-------|
| Auth | `/login/` | LoginView |
| Dashboard | `/` | DashboardView |
| Stations | `/stations`, `/stations/create`, `/stations/setup-wizard`, `/stations/:id` | StationList, StationForm, StationSetupWizard, StationDetail (tabs: islands/machines/meters/tanks/employees) |
| Islands | `/islands`, `/islands/create` | IslandList, IslandForm |
| Machines | `/machines`, `/machines/create` | MachineList, MachineForm |
| Meters | `/meters`, `/meters/create` | MeterList, MeterForm |
| Tanks | `/tanks`, `/tanks/create`, `/tanks/:id` | TankList, TankForm, TankDetail |
| Employees | `/employees`, `/employees/create` | EmployeeList, EmployeeForm |
| Shifts | `/shifts`, `/shifts/create`, `/shifts/:id` | ShiftList, ShiftForm, ShiftDetail |
| Shift Readings | `/shifts/:id/readings` | ReadingForm |
| Shift Close | `/shifts/:id/close` | CloseShift |
| Shift Definitions | `/shifts/definitions`, `/shifts/definitions/create` | DefinitionList, DefinitionForm |
| Meter Gaps | `/shifts/gaps` | MeterGapReport |
| Finance Hub | `/finance` | FinanceIndex |
| Income Entry | `/finance/income` | IncomeEntry |
| Daily Sales | `/finance/daily-sales` | DailySales |
| Cash | `/finance/cash` | CashList |
| Vouchers | `/finance/vouchers` | VoucherList |
| POS | `/finance/pos` | POSList |
| Expenses | `/finance/expenses`, `/finance/expenses/create` | ExpenseList, ExpenseForm |
| Settlements | `/finance/settlements`, `/finance/settlements/create`, `/finance/settlements/:id` | SettlementList, SettlementForm, SettlementDetail |
| Reconciliations | `/finance/reconciliations`, `/finance/reconciliations/:id` | ReconciliationList, ReconciliationDetail |
| Deliveries | `/inventory/deliveries`, `/inventory/deliveries/create`, `/inventory/deliveries/:id` | DeliveryList, DeliveryForm, DeliveryDetail |
| Tank Readings | `/inventory/tank-readings` | TankReadingList |
| Transfers | `/inventory/transfers`, `/inventory/transfers/create` | TransferList, TransferForm |
| Shortages | `/inventory/shortages` | ShortageList |
| Fuel Reconciliation | `/inventory/fuel-reconciliation` | FuelReconciliationList |
| Delivery Requests | `/inventory/requests`, `/inventory/requests/create`, `/inventory/requests/:id` | RequestList, RequestForm, RequestDetail |
| Reports | `/reports/daily`, `/reports/monthly`, `/reports/inventory` | DailyReport, MonthlyReport, InventoryReport |
| Settings | `/settings/users`, `/settings/users/create` | UsersList, UserForm |
| Guide | `/guide` | GuideView |

**Total**: 51 routes (1 login + 50 under DefaultLayout)

### 9.3 API Client Configuration

```javascript
// api.js
axios.defaults.baseURL = '/api'
axios.defaults.withCredentials = true  // session cookies
// Interceptor: 401/403 → redirect to /login/
```

### 9.4 Auth Store (Pinia)

| Getter | Returns |
|--------|---------|
| `isLoggedIn` | `!!user` |
| `role` | `user.role` |
| `stationId` | `user.station_id` |
| `isAdmin` | `user.is_staff \|\| user.role === 'admin'` |

### 9.5 Navigation Structure

**Desktop sidebar** (right-side, RTL — grouped into titled sections and filtered by role since 2026-09-10):
- الرئيسية (Dashboard)
- **العمليات**: المحطات, إعداد محطة, الموظفين, تعريفات المناوبات, المناوبات
- **المالية**: المالية, إدخال إيرادات, المبيعات المالية, أسعار الوقود, النقدية, القسائم, الدفع الإلكتروني, المصروفات, تسوية القسائم
- **المخزون**: الشحنات, قراءات الخزانات, التحويلات, النقص, تسوية الوقود, طلبات التوريد
- **التقارير**: التقرير اليومي, التقرير الشهري, المخزون والتوريد, فجوات العدادات
- **الإعدادات**: إدارة المستخدمين, دليل الاستخدام

Role filtering: supervisors don't see stations/staff/finance-admin items; finance sees the finance + reports groups; only admins see user management. Infrastructure lists (islands/machines/meters/tanks) are managed inside the station page tabs and the wizard, so they have no standalone nav items.

**Collapsed mode** (2026-09-12): when the sidebar is closed on desktop it becomes an **icon rail** — icons remain visible for fast navigation, with the item label as a native hover tooltip. Mobile keeps the slide-over drawer.

**Back button** (2026-09-12): the top bar shows a «رجوع» button (hidden on the home page) driven by vue-router history position.

**Station scoping** (2026-09-12, enforced 2026-10-03): users bound to a station (User field `sejel_station` — any role except admin/manager) see only their station everywhere — lists, detail pages, reports, exports and **creates/updates** are server-enforced (`api/scoping.py`: `check_station`, `check_station_payload`, `apply_to_filters`). A `?station=` parameter can only narrow a bound user's scope, never widen it, and a payload naming a foreign station is refused before the row exists. Unbound users keep the multi-station selector.

**Help tooltips** (2026-09-12): a «؟» HelpTip component pops short Arabic explanations on dashboard KPI cards, tank cards, the reconciliation panel and key form fields.

**Excel export** (2026-09-12): «تصدير Excel» buttons on the dashboard/station/shift/reconciliation pages download .xlsx workbooks via `GET /api/export/`.

**Mobile bottom nav**: Dashboard, Shifts, Income, Inventory, Reports

---

## 10. Deployment & Infrastructure

### 10.1 Port Assignments

| Port | Service | Notes |
|------|---------|-------|
| 80 | ERPNext/Frappe Desk | Untouched, standard Frappe |
| 8001 | Diwan API | Separate service, not Sejel |
| 8002 | Frappe bench (sejel_app) | Custom app API server |
| 8004 | Nginx → SPA + API proxy | Main Sejel entry point |
| 9002 | Socket.io | Frappe realtime |

### 10.2 Database

- **Engine**: PostgreSQL
- **Database name**: `_730feba3f0c64c86`
- **Password**: intentionally omitted — infrastructure credentials live only in `site_config.json` on the server and must never be committed to the repository.
- **Site**: `sejel.local`

### 10.3 Frappe Configuration

**site_config.json** (CSRF enforcement enabled — `ignore_csrf` removed 2026-09-10; credentials redacted here):
```json
{
  "db_name": "_730feba3f0c64c86",
  "db_password": "<redacted — see server>",
  "db_type": "postgres"
}
```

**hooks.py** (CORS pinned to the app's own origin — the SPA is same-origin via nginx):
```python
allow_cors = ["http://102.213.180.186:8004"]
website_route_rules = [
    {"from_route": "/app/<path:app_path>", "to_route": "app"},
    {"from_route": "/app", "to_route": "app"},
]
```

### 10.4 Nginx Configuration

**File**: `/etc/nginx/sites-enabled/sejel`

- Listens on port 8004
- SPA static files from `/root/projects/Sejel/sejel/staticfiles/vue/`
- API proxy via regex-based routing to Frappe on port 8002
- Socket.io proxy to port 9002

### 10.5 Process Management

**Bench runs under systemd** (`sejel-bench.service`, since 2026-09-10) — owns web, socketio and both redis instances; auto-restarts on failure and at boot:
```bash
systemctl status sejel-bench
sudo systemctl restart sejel-bench   # required after backend code edits (bench serve --noreload)
```

**Daily backups** (`/usr/local/bin/sejel-backup.sh`, cron 02:30, root):
- DB dump (pg_dump custom format) → `/var/backups/sejel/db/` — kept 7 days
- Uploaded files tarball → `/var/backups/sejel/files/` — kept 30 days
- Log: `/var/log/sejel-backup.log`

**Nginx**:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 10.6 SPA Deployment

```bash
cd /root/projects/Sejel/sejel/frontend
./build.sh
# Output: /root/projects/Sejel/sejel/staticfiles/vue/  (nginx root)
# Synced copy: /home/frappe/bench/apps/sejel_app/sejel_app/public/
```

`build.sh` runs the Vite build, then copies `index.html` + hashed assets to
both locations (nginx serves the repo copy; the Frappe public copy is the
fallback `/assets` origin). No backend restart needed for SPA-only changes.

> Legacy note (2026-09-12): the Django stack (`sejel/api`, `sejel/apps`,
> `sejel/templates`, `manage.py`, `db.sqlite3`, `sejel/logs`) was removed and
> archived to `/root/backups/sejel-django-legacy-2026-09-12.tar.gz`.

---

## 11. Test Results

### 11.1 API Endpoints — All Passing

| Test | Endpoint | Result |
|------|----------|--------|
| Login | `POST /api/auth/login/` | ✅ Returns user with role |
| Get Me | `GET /api/auth/me/` | ✅ Returns authenticated user |
| List Stations | `GET /api/stations/` | ✅ Returns paginated list |
| Create Station | `POST /api/stations/` | ✅ Returns created doc |
| Get Station | `GET /api/stations/{name}/` | ✅ Returns single doc |
| Update Station | `PUT /api/stations/{name}/` | ✅ Returns updated doc |
| Delete Station | `DELETE /api/stations/{name}/` | ✅ Returns `{ok: true}` |
| List Islands | `GET /api/islands/` | ✅ |
| Create Island | `POST /api/islands/` | ✅ |
| List Machines | `GET /api/machines/` | ✅ |
| Create Machine | `POST /api/machines/` | ✅ Auto-sets station from Island |
| List Meters | `GET /api/meters/` | ✅ |
| Create Meter | `POST /api/meters/` | ✅ |
| List Tanks | `GET /api/tanks/` | ✅ |
| Create Tank | `POST /api/tanks/` | ✅ With dedicated_to_machine |
| List Fuel Types | `GET /api/fuel-types/` | ✅ |
| Create Fuel Type | `POST /api/fuel-types/` | ✅ |
| List Fuel Prices | `GET /api/fuel-prices/` | ✅ |
| Create Fuel Price | `POST /api/fuel-prices/` | ✅ |
| List Employees | `GET /api/employees/` | ✅ |
| Create Employee | `POST /api/employees/` | ✅ |
| List Voucher Categories | `GET /api/voucher-categories/` | ✅ 4 categories (5,6,7,8 LYD) |
| Create Shift | `POST /api/shifts/` | ✅ With shift_name |
| List Shifts | `GET /api/shifts/` | ✅ |
| Create Cash Collection | `POST /api/cash-collections/` | ✅ With shift + time |
| Create Voucher | `POST /api/vouchers/` | ✅ With category |
| Create POS Record | `POST /api/pos-records/` | ✅ |
| Dashboard | `GET /api/dashboard/` | ✅ Returns counts |
| Daily Sales | `GET /api/reports/daily-sales/` | ✅ Aggregates correctly |
| Close Shift | `POST /api/shifts/{name}/close/` | ✅ Creates Reconciliation |

### 11.2 SPA Pages — All 200 OK

| Page | Status |
|------|--------|
| `/finance/` | ✅ 200 |
| `/finance/income/` | ✅ 200 |
| `/finance/daily-sales/` | ✅ 200 |
| `/finance/settlements/` | ✅ 200 |
| `/reports/monthly/` | ✅ 200 |
| `/inventory/` | ✅ 200 |
| `/readings/` | ✅ 200 |
| `/shifts/` | ✅ 200 |

### 11.3 Integration Test — Full Flow

```
1. Login as admin                    ✅
2. Create shift                      ✅
3. Create cash collection (5,000)    ✅
4. Create vouchers (5/6/7/8 × 10)   ✅
5. Create POS record (3,000)         ✅
6. Daily sales report shows          ✅
7. Dashboard shows correct counts    ✅
```

---

## 12. Seed Data

### 12.1 Fuel Types

| Name | Arabic Name |
|------|-------------|
| بنزين | Benzine |
| ديزل | Diesel |

> **Changed 2026-09-12**: exactly two fuel types per client reality. The
> legacy `بنزين 91`/`بنزين 95` records were merged into `بنزين` (patch
> `v2_fuel_consolidation`), with every Tank/Meter/Fuel Price/Delivery/etc.
> row repointed before the variants were deleted.

### 12.2 Voucher Categories

| Category | Value (LYD) |
|----------|-------------|
| 5 د.ل | 5 |
| 6 د.ل | 6 |
| 7 د.ل | 7 |
| 8 د.ل | 8 |

### 12.3 Stations

> **Changed 2026-09-30**: the seed stations below were removed with the UAT
> data. The site now holds a single **pilot station** (محطة تجريبية — سجل:
> 2 pumps × 2 guns, بنزين/ديزل tanks) created by `pilot_bootstrap.py` with
> `day_close_time = 11:00` (the client's confirmed cycle) and the client's
> real Excel counters as opening meter readings.

```
Station: محطة الزنتان (بنزين)

```
Station: محطة الزنتان (بنزين)
├── جزيرة 1
│   ├── مضخة 1 → M01A (بنزين 91) + M01B (بنزين 95)
│   └── مضخة 2 → M02A (بنزين 91) + M02B (بنزين 95)
├── جزيرة 2
│   ├── مضخة 3 → M03A (بنزين 91) + M03B (بنزين 95)
│   └── مضخة 4 → M04A (بنزين 91) + M04B (بنزين 95)
├── خزانات: بنزين 91 (50,000L), بنزين 95 (50,000L)

Station: محطة القرهولي (ديزل)
├── جزيرة 3
│   ├── مضخة 5 → M05A (ديزل) + M05B (ديزل)
│   └── مضخة 6 → M06A (ديزل) + M06B (ديزل)
├── خزانات: ديزل (80,000L)
```

### 12.4 Users

| Username | Password | Role |
|----------|----------|------|
| `admin@sejel.ly` | `admin123` | System Manager (admin) |

### 12.5 Employees

| Name | Station | Status |
|------|---------|--------|
| أحمد علي | محطة الزنتان | active |
| محمد سالم | محطة الزنتان | active |
| عمر حسن | محطة القرهولي | active |
| صالح أحمد | محطة القرهولي | active |

### 12.6 Expense Categories

| Category |
|----------|
| صيانة |
| وقود |
| رواتب |
| إيجار |
| أخرى |

### 12.7 Fuel Prices

| Fuel Type | Selling Price (LYD/L) |
|-----------|----------------------|
| بنزين 91 | 0.48 |
| بنزين 95 | 0.52 |
| ديزل | 0.45 |

---

## 13. End User Document Mapping

### Document 001: Shipments Log (سجل الشحنات)

Physical handwritten log at the station. Maps to **Delivery** DocType.

| Handwritten Field | Frappe Field |
|-------------------|--------------|
| Date | `order_date` |
| Supplier | `supplier` (Marketing Company) |
| Invoice Number | `invoice_number` |
| Fuel Type | `fuel_type` |
| Expected Quantity | `expected_quantity` (default: 40000L) |
| Pre-reading | `pre_reading` |
| Post-reading | `post_reading` |
| Received Quantity | `received_quantity` (auto: post - pre) |
| Shortage | `shortage` (auto: max(0, expected - received)) |

### Document 002: Daily Sales (المبيعات اليومية)

Excel sheet with daily financial summary. Maps to **Daily Sales** report + **IncomeEntry** form.

| Column | Frappe Source |
|--------|--------------|
| Cash collection | `Cash Collection.amount` |
| Coupon 5 LYD | `Voucher` (category=5) |
| Coupon 6 LYD | `Voucher` (category=6) |
| Coupon 7 LYD | `Voucher` (category=7) |
| Coupon 8 LYD | `Voucher` (category=8) |
| E-payment (POS) | `POS Record.total_amount` |
| Expenses | `Expense.amount` |
| Net income | Calculated |

### Document 003: Daily Expenses (المصروفات اليومية)

Excel sheet with daily expense entries. Maps to **Expense** DocType.

| Column | Frappe Field |
|--------|--------------|
| Date | `creation` date |
| Category | `category` (Expense Category) |
| Amount | `amount` |
| Description | `description` |
| Payment Method | `payment_method` |

---

## 14. Known Limitations

1. **No scheduled tasks** — All hooks are commented out. No automated report generation or notifications.
2. **No print formats** — Print formats exist only as in-app templates, not Frappe print format files (the monthly report prints via browser print with a dedicated `@media print` layout).
3. **No CSV/JSON import** — Monthly invoice data import from Excel not yet implemented (Excel **export** ships since 2026-09-12 via `GET /api/export/`).
4. **~~Monthly report returns placeholder zeros~~ resolved** — Real Reconciliation/Shift aggregates since 2026-09-12 (per-station + per-fuel breakdown, printable).
5. **No Frappe worker** — Background job processing not configured (web runs under systemd since 2026-09-10).
6. **HTTPS not configured** — SPA and API served over HTTP on port 8004; needs a domain + TLS certificate before internet-facing use.
7. **~~No CSRF protection~~ resolved** — CSRF enforced since 2026-09-10 (`ignore_csrf` removed; SPA sends `X-Frappe-CSRF-Token`).
8. **~~No test suite~~ resolved** — Playwright e2e suite under `sejel/e2e-tests/` (12 phase files + read-only `pilot-assert.js` guard, 209 checks + 9, CSRF-aware helpers, self-seeding per suite; full suite green as of 2026-09-30). Do not run the mutating phase suites against a site holding client data — they create timestamped test stations; use `pilot_cleanup.py` / `pilot_bootstrap.py` to restore.
9. **No Alembic/Frappe migrations** — Schema changes managed via Frappe's built-in migrate command (data patches live in `patches.txt`).

---

## 15. 2026-09-12 Feature Batch & Pilot Readiness

### 15.1 Charts (dashboard)

- `TrendSection.vue` renders two hand-rolled SVG charts from the new `trend` series in `GET /api/dashboard-station/`: **14-day sales line chart** (liters + expected sales per day, station mode only — aggregate has no single timeline) and **tank level gauges** (0–100%, colored by the backend tank status; color is never recomputed in the SPA).
- `GaugeCard.vue` / `LineChart.vue` — no chart library; consistent with the SVG icon approach.

### 15.2 Wizard: per-island configuration

`POST /api/setup-station/` accepts either the legacy flat counts or `islands: [{machines: n, meters: m}, …]` — islands **do not** need equal pump counts. Optional `tank_levels: {tank_key: liters}` sets opening levels. Station-scoped numbering remains server-side (Island per-station, Machine per-island, name station-wide).

### 15.3 Continuity-gap reason (Meter Reading)

`MeterReading.validate()` now raises when the gap from the previous reading exceeds the continuity threshold unless `gap_reason` is filled. The reading form pre-fills the expected value and shows a required reason box when a gap is detected.

### 15.4 يوم المحطة (Station Day view) + auto shift generation

- Route `/shifts/day` (sidebar: اليوم). One screen: date + station selector, shift status cards (open/close deep links), meter readings grid for the day, and quick actions.
- `POST /api/generate-shifts/` `{date, station?, emergency?}` creates the day's Shifts from Shift Definitions (per-station, skip-existing, default employee prefill); `emergency: true` generates a single 24-hour shift when definitions are missing.

### 15.5 User password administration

- `POST /api/auth/set-user-password/` `{user, password?, enabled?}` — **System Manager only**; generates a random password when omitted. Never returns it; returns it only in the e2e-safe `bench execute` path. Also fixed: `GET /api/users/` now works (was "Unknown resource") with role mapping (System Manager→admin, Sejel Manager→manager, Sejel Supervisor→supervisor, Sejel User→user).
- Settings → Users: «كلمة مرور جديدة» and enable/disable actions.

### 15.6 Pilot cleanup (2026-09-12)

`bench --site sejel.local execute sejel_app.pilot_cleanup.clean` (script: `scripts/pilot_cleanup.py`, mirror in app root). Order: financial children → operations → master data → stations; deletes all `*@sejel.ly` test users **except admin@/owner@** and clears `User.sejel_station` bindings. Reference data (fuel types بنزين/ديزل, voucher/expense categories, marketing companies) kept.

**Executed 2026-09-12 after a fresh backup (`/var/backups/sejel/`)**: 5 stations, 4 shifts, 2 reconciliations, 20 meters, 5 test users removed. Verified empty state: `stations=0`, aggregate + single dashboards, wizard, يوم المحطة and daily/monthly reports all render clean (0s / empty UI states, no crashes). System is ready for the client pilot: the client logs in as owner/admin and creates their first station via the wizard.

### 15.7 Daily reading-cycle close & pilot bootstrap (2026-09-30)

- **Concepts separated**: Employee Shift ≠ Reading Period ≠ Daily Close.
  `Shift.is_day_close` marks the station's daily reading/closing cycle
  container; `Station.day_close_time` (default **23:00, enforced in
  `Station.validate()`** — Frappe Time fields stamp wall-clock instead of
  honoring JSON defaults; also set explicitly by the setup wizard) bounds the
  period per station. Employee shifts never require readings; the previous
  reading always comes from the same gun's last valid entry. Financial logic
  (Reconciliation creation, frozen prices) untouched.
- **Dashboard**: قراءات اليوم completion chip; Excel-style readings table
  with totals; open-shift alert counts employee shifts only (the day-close
  container is excluded server-side); Excel export labels rows
  إقفال اليوم / مناوبة موظف.
- **UI**: قراءات المضخات is the primary workflow (auto-previous per gun,
  live liters, exception reasons, إقفال اليوم); reading-period chip shows the
  station's configured cycle; sidebar is non-collapsible (labels always
  visible); phase9 journey is browser-only incl. a 390×844 mobile pass.
- **Tests**: 12 suites / 209 checks green (phase8 proves 3 employee shifts
  inside one 24h cycle with zero per-shift readings; phase9 = full user
  journey). `pilot-assert.js` read-only guard (9 checks) asserts the live
  pilot: single station, 11:00 cycle, Excel counters as auto-previous.
- **Pilot state**: single station محطة تجريبية — سجل pinned 11:00→11:00
  (bootstrap: `bench --site sejel.local execute sejel_app.pilot_bootstrap.run`).
- **VCS**: `/root/projects/Sejel` master `230d63a` (+ docs `07d60c7`, handoff
  `25734b9`); bench app `1be6572`. DB credentials redacted from this document
  — infrastructure secrets live only in `site_config.json` on the server.

## Appendix A: File Structure

```
/home/frappe/bench/
├── apps/
│   └── sejel_app/
│       ├── sejel_app/
│       │   ├── __init__.py
│       │   ├── hooks.py
│       │   ├── patches.txt
│       │   ├── modules.txt
│       │   ├── sejel_app/
│       │   │   ├── doctype/          # 26 DocTypes
│       │   │   │   ├── station/
│       │   │   │   ├── island/
│       │   │   │   ├── machine/
│       │   │   │   ├── meter/
│       │   │   │   ├── fuel_type/
│       │   │   │   ├── fuel_price/
│       │   │   │   ├── marketing_company/
│       │   │   │   ├── tank/
│       │   │   │   ├── tank_reading/
│       │   │   │   ├── employee/
│       │   │   │   ├── shift_definition/
│       │   │   │   ├── shift/
│       │   │   │   ├── meter_reading/
│       │   │   │   ├── cash_collection/
│       │   │   │   ├── voucher/
│       │   │   │   ├── pos_record/
│       │   │   │   ├── voucher_category/
│       │   │   │   ├── voucher_settlement/
│       │   │   │   ├── expense_category/
│       │   │   │   ├── expense/
│       │   │   │   ├── reconciliation/
│       │   │   │   ├── shift_fuel_summary/
│       │   │   │   ├── delivery/
│       │   │   │   ├── delivery_request/
│       │   │   │   ├── shortage_claim/
│       │   │   │   └── fuel_reconciliation/
│       │   │   └── role/              # 3 custom roles
│       │   │       ├── sejel_manager/
│       │   │       ├── sejel_supervisor/
│       │   │       └── sejel_finance/
│       │   └── api/
│       │       ├── __init__.py
│       │       ├── auth.py
│       │       ├── crud.py
│       │       ├── views.py
│       │       └── request_log.py
│       └── public/
│           ├── index.html
│           └── assets/               # Built Vue SPA
├── sites/
│   └── sejel.local/
│       ├── site_config.json
│       └── ...
└── ...

/root/projects/Sejel/sejel/frontend/
├── src/
│   ├── api.js
│   ├── main.js
│   ├── App.vue
│   ├── router/index.js
│   ├── stores/auth.js
│   ├── layouts/DefaultLayout.vue
│   └── views/
│       ├── auth/LoginView.vue
│       ├── dashboard/DashboardView.vue
│       ├── stations/ (3 views)
│       ├── islands/ (2 views)
│       ├── machines/ (2 views)
│       ├── meters/ (2 views)
│       ├── tanks/ (3 views)
│       ├── employees/ (2 views)
│       ├── shifts/ (7 views)
│       ├── finance/ (11 views)
│       ├── inventory/ (9 views)
│       ├── reports/ (3 views)
│       ├── settings/ (2 views)
│       └── guide/GuideView.vue
├── package.json
└── vite.config.js

/etc/nginx/sites-enabled/sejel    # Port 8004, SPA + API proxy
```

---

*Generated: September 2026*
*Sejel App v1.0.0 — Frappe Framework v15 + Vue 3*
