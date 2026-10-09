# Spec — Fix Readings Anytime (edit / delete saved readings)

Date: 2026-10-06 · Status: approved design · Owner: Sejel QA

## 1. Problem & goal

Saved readings on `/app/readings` are read-only today — the only correction
paths are the guided «تصحيح القراءة السابقة» (start == 0 only) and an
admin-side API delete. The end user reports constant data-entry mistakes and
wants to correct **any** saved reading **anytime**, including after
«إقفال اليوم», with visibility into **who** edited a reading.

Goal: inline edit (previous + current value) and admin-only delete of saved
readings on the readings screen, for all roles, on any date (open or closed
day), with last-editor display — while keeping reconciliation totals and the
meter counter correct in every case.

## 2. Decisions (from Q&A)

1. **Scope**: edit both stored values (`start_reading`, `end_reading`) **and**
   delete a wrong saved row entirely (re-entry from scratch).
2. **Who edits**: **all roles** (admin, manager, finance, supervisor).
   **Delete**: admin only. Finance gains DocType access (see §4.1) — the only
   permission change; the client may request finer permissions later.
3. **When**: **anytime**, including closed days. Editing a closed day's
   reading must leave that day's Reconciliation consistent (§4.3).
4. **Audit**: show «آخر تعديل» (last editor + timestamp) on saved cards.
   Full field-level history comes from Frappe's built-in `Version` log — no
   new audit doctype.

## 3. Non-goals

- No cascade fix-up: correcting an older day's `end_reading` does **not**
  rewrite later days' `start_reading` values (each row stores its own start;
  later rows keep their values).
- No reopen-day machinery; shift status never changes on edit.
- No new API endpoint — reuse `PUT`/`DELETE /api/meter-readings/<name>/`.
- `views/shifts/ReadingForm.vue` stays create-only.
- Existing guided buttons («تصحيح القراءة السابقة» / «إضافة القراءة السابقة»)
  stay unchanged, including their `!dayClosed` gate.

## 4. Backend changes

### 4.1 Permission (`meter_reading.json`)
Add one permissions entry: `Sejel Finance` with `read: 1, write: 1`.
Delete remains System Manager only (admin) — unchanged.

### 4.2 `MeterReading.on_update` — counter sync guard (`meter_reading.py`)
Current code unconditionally sets `Meter.current_reading = self.end_reading`,
which corrupts the counter when an **older** row is edited while later rows
exist. Replace with the recompute pattern (plain SQL, same as `on_trash`,
because the `["is", "set"]` filter breaks on Postgres numeric columns):

- Query the meter's latest row with a non-null `end_reading`
  (`order by recorded_at desc, name desc limit 1`, **including self**).
- If a row exists → `frappe.db.set_value("Meter", meter, "current_reading", ...)`.
- If none exists → leave the counter untouched (start-only row on an
  unestablished counter; zeroing here would clobber `qaSeedCounters`-style
  seeded values). `on_trash` keeps its existing zero-when-empty behavior.
- Guard: skip entirely when `self.meter` is empty.

### 4.3 Reconciliation refresh (`shift.py` + hooks)
New method `Shift.refresh_reconciliation()` — no-op unless a Reconciliation
exists for the shift. When it exists, recompute **reading-derived** fields
only, in place (`frappe.db.set_value`, so a supervisor session can trigger
it):

- `total_liters` = Σ `liters_sold` of the shift's readings (same query as
  `create_reconciliation`).
- `expected_sales` = existing `_calculate_expected_sales(total_liters)`
  (frozen `_frozen_price` at shift date).
- `difference` = `recon.total_collection - expected_sales` (collection side
  untouched) and `difference_type` (matched/surplus/shortage).
- Fuel summaries: delete this recon's `Shift Fuel Summary` rows
  (`frappe.delete_doc(..., ignore_permissions=True)`) and recreate via the
  existing `_create_fuel_summaries(recon)` — the fuel set itself can change
  when an edit zeroes a fuel's only reading.
- `total_cash/vouchers/pos/expenses/net_cash`, `status`, `closed_by/at`:
  **untouched**.

Hooks in `MeterReading`:
- `on_update` → after counter sync: if `self.shift` has a Reconciliation,
  `frappe.get_doc("Shift", self.shift).refresh_reconciliation()`.
- `on_trash` → same refresh after the existing counter rollback (a delete on
  a closed day also stales the recon today).

Both hooks are cheap no-ops when the shift is open (no Reconciliation yet).

### 4.4 Dashboard payload (`dashboard.py`)
Add `modified` and `modified_by` to the readings query fields, and to each
reading dict expose:

- `modified`, `modified_by` (username), `modified_by_name` — batch-resolved
  from `User` (one query for the distinct values; fall back to the raw
  username if the user record is missing).

## 5. Frontend changes (`ReadingsView.vue` only)

### 5.1 State & functions (script block next to the existing `prevEdit` group)
- `rowEdit = ref(null)` → `{ id, start, end, exceptionType, notes }`
  (strings as typed); `rowEditError = ref('')`; `rowEditSaving = ref(false)`.
  A single `rowEdit` ref means only one editor can be open at a time;
  opening another row's editor discards the previous one (unsaved input is
  intentionally lost — the values are prefillable in one click).
- `showEdit(row)` — row is saved and not already being edited.
- `openEdit(row)` — prefill `start` from `reading.start_reading ?? ''`,
  `end` from `reading.end_reading ?? ''`; clear errors. No confirm dialog
  (non-destructive; حفظ is explicit).
- `closeEdit()` — discard state and error.
- `saveEdit(row)` — client guards **before** any PUT:
  - trim both fields; a field that is empty/whitespace is rejected before
    `Number()` (never coerced to 0, same rule as the blank-input guard).
  - invalid (blank / non-numeric / negative) → inline errors, no PUT:
    - start: `أدخل القراءة السابقة برقم صحيح غير سالب`
    - end: `أدخل القراءة الحالية برقم صحيح غير سالب`
  - valid → `PUT /api/meter-readings/<name>/` with
    `{ start_reading, end_reading, exception_type?, notes? }` (exception
    fields sent only when `exceptionType` is set).
  - success → `notice = 'تم تعديل القراءة'`, `closeEdit()`,
    `await load({ keepMessage: true })`.
  - failure → `rowEditError = friendlyError(e)` inline; editor stays open.
- `deleteReading(row)` — `auth.isAdmin` only:
  - `window.confirm('سيتم حذف هذه القراءة نهائياً ثم يمكنك إعادة إدخالها. هل أنت متأكد؟')`
  - `DELETE /api/meter-readings/<name>/` → success →
    `notice = 'تم حذف القراءة'` → `load({ keepMessage: true })` (row returns
    to «بانتظار القراءة»; counter rolled back by `on_trash`, auto-prev
    recomputed).
  - failure → existing `error.value = friendlyError(e)` banner.

### 5.2 Template (saved branch)
- **Buttons** in the gun-card header (next to the «مسجلة» badge):
  - «تعديل» `data-testid="reading-edit"` — shown for every authenticated
    role, **regardless of `dayClosed`** (visibility: `showEdit(row)`).
  - «حذف القراءة» `data-testid="reading-delete"` — `v-if="auth.isAdmin"`,
    red-outline styling, same day-closed independence.
- **Editor** `data-testid="reading-editor"` — rendered **instead of** the
  three display boxes while `rowEdit` targets this row:
  - inputs `reading-edit-start` («القراءة السابقة») and `reading-edit-end`
    («القراءة الحالية (لتر)»), `type="number" step="0.001" min="0"`.
  - **exception block** (existing amber styles, same options and labels as
    the entry flow's exception select) shown live only when **both** fields
    hold valid non-negative numbers and `Number(end) < Number(start)` — the
    client does **not** block this combination; select
    `reading-edit-exception-type` +
    `reading-edit-exception-notes`, mirroring the entry flow. Backend keeps
    final say (its Arabic refusal messages surface inline when the reason is
    missing).
  - حفظ `reading-edit-save` (disabled while saving), إلغاء
    `reading-edit-cancel`, inline error `reading-edit-error`.
- **Last-edited line** under «القراءة المسجلة اليوم»:
  `data-testid="last-edited"` → `آخر تعديل: {modified_by_name} ·
  {modified.slice(0, 16)}` (rendered only when the payload provides it).

### 5.3 Unchanged
Global «حفظ» stays disabled on closed days (no **new** rows into a sealed
day); entry flow, prev-fix/prev-add, day-close button, Arabic copy of
existing features — all untouched.

## 6. Error handling

- All backend refusals (continuity gap, backwards counter without exception,
  missing price context, permission denied, session expiry) surface through
  `friendlyError` in `reading-edit-error` (or the top banner for delete) —
  no new message strings beyond those listed in §5.
- Escape hatch for anything the editor cannot satisfy (e.g. backend demands
  an exception the operator cannot justify): admin deletes the row and
  re-enters it through the normal entry flow with the exception block.

## 7. Testing

New backend unit tests `meter_reading/test_meter_reading_edit.py`
(rollback-style like `meter/test_meter.py`; run via
`bench --site sejel.local run-tests --module ...`):

1. Editing an **older** row does not clobber `Meter.current_reading`
   (latest row wins; also covers start-only rows leaving a seeded counter
   untouched).
2. Editing a reading of a **closed** shift refreshes the Reconciliation
   (`total_liters`, `expected_sales`, `difference(+type)`, fuel summaries;
   cash-side fields unchanged).
3. Deleting a reading of a **closed** shift refreshes the Reconciliation.
4. A `Sejel Finance` user can `PUT` a Meter Reading (perm change).

Frontend: `npm run build` must pass. **No approved e2e suite files are
edited**; the full 15-suite/295-step regression runs once after the backend
changes (close-day accounting is touched). No writes to customer UAT data
during verification.

## 8. Rollout & UAT handoff

- `sudo systemctl restart sejel-bench.service` after python changes; rebuild
  the SPA (`npm run build`) after the Vue change; read-only spot checks.
- Customer verifies: edit a saved reading (both fields) → litres, expected
  sales and «آخر تعديل» update; delete a wrong row (admin) → row returns to
  «بانتظار القراءة» and re-enters cleanly; edit/delete on a **closed** day →
  the day's reconciliation totals follow; finance role can edit.
