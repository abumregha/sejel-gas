# Shift Correction Feature — Design Spec

**Date:** 2026-10-12
**Status:** Approved

## Problem

Users make data entry mistakes when creating shifts — wrong time (7 PM instead of 7 AM), wrong name, wrong date. Currently there is no way to correct these errors after the shift is created, especially once it has been submitted or closed.

## Solution

Allow editing shift fields with status-based restrictions, plus an admin-only reopen flow for correcting submitted/closed shifts. Full audit trail for all corrections.

## Status-Based Edit Permissions

| Status | Editable Fields | Locked Fields |
|--------|----------------|---------------|
| `scheduled` | All fields | None |
| `open` | All fields | None |
| `submitted` | `shift_name`, `notes`, `employee`, `station`, `island` | `date`, `start_time`, `end_time`, `status` |
| `closed` | `notes` | All other fields |

## Reopen Flow (Admin/Owner Only)

1. Admin clicks "Reopen" on a `submitted` or `closed` shift
2. Confirmation dialog explains the impact
3. Status transitions: `submitted`/`closed` → `open`
4. If `closed`: existing Reconciliation + Shift Fuel Summaries are archived (not deleted)
5. Shift becomes fully editable
6. Admin corrects the data
7. Admin submits → status `submitted`
8. Admin closes → status `closed`, Reconciliation auto-recalculated with corrected data

## Backend Changes

### Shift DocType (`shift.py`)

**New method: `reopen_shift()`**
- Decorated with `@frappe.whitelist()`
- Permission check: admin/owner role only
- Validates current status is `submitted` or `closed`
- If `closed`: archives Reconciliation (sets `is_archived=True`, `archived_at=now`)
- Sets status to `open`
- Creates Shift Correction Log entry

**Modified: `validate()`**
- Field-level validation based on current status
- On `submitted`: reject changes to `date`, `start_time`, `end_time`
- On `closed`: reject changes to all fields except `notes`
- On any allowed field change: write Shift Correction Log entry with old/new values

**Modified: `close_shift()`**
- On re-close: recalculates Reconciliation with corrected shift data
- Creates new Reconciliation (old one already archived on reopen)

### New Child DocType: Shift Correction Log

| Field | Type | Description |
|-------|------|-------------|
| `corrected_by` | Link (User) | Who made the change |
| `corrected_at` | Datetime | When |
| `field_changed` | Data | Which field |
| `old_value` | Data | Previous value |
| `new_value` | Data | New value |
| `reason` | Data | Optional note |

### Reconciliation DocType

**New fields:**
- `is_archived` (Check) — default 0
- `archived_at` (Datetime) — nullable

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/shifts/{name}/reopen/` | Reopen shift (admin only) |
| `GET` | `/api/shifts/{name}/corrections/` | List correction history |

## Frontend Changes

### ShiftDetail.vue

**New "Reopen" button:**
- Visible when status is `submitted` or `closed`
- Visible only to admin/owner users
- Triggers confirmation dialog

**Edit mode indicators:**
- `submitted`: timing fields show lock icon, read-only
- `closed`: all fields read-only except `notes`; "Reopen to Correct" banner
- `scheduled`/`open`: all fields editable (existing behavior)

**Correction history panel:**
- Read-only list of Shift Correction Log entries
- Shows: who, when, field changed, old → new value

## User Guide

Add a "Correcting Shift Errors" section to the user guide webpage after implementation, covering:
- Which fields are editable at each status
- How to request a correction (contact admin)
- What happens to reconciliation data
- Audit trail explanation

## Error Handling

- Non-admin attempts reopen → 403 with Arabic error message
- Edit locked fields on submitted/closed → validation error naming the field
- Reopen a `scheduled` or `open` shift → 400 "Shift is already open"

## Testing

- E2E: full correction flow (create → submit → reopen → fix → re-submit → re-close → verify reconciliation)
- E2E: non-admin cannot see or use reopen button
- E2E: audit log entries created on each correction
- E2E: locked fields rejected on submitted/closed shifts
- E2E: reconciliation auto-recalculated on re-close
