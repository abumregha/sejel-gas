# Fix Readings Anytime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let any authenticated user correct a saved reading's previous/current value on `/app/readings` at any time (open or closed day), let admin delete a wrong row, show «آخر تعديل» on saved cards, and keep `Meter.current_reading` and any existing Reconciliation consistent.

**Architecture:** Reuse the existing generic CRUD paths (`PUT`/`DELETE /api/meter-readings/<name>/`). Backend: add Finance write perm; replace `MeterReading.on_update`'s unconditional counter write with a "latest row wins" recompute (mirroring `on_trash`); add `Shift.refresh_reconciliation()` and hook it from `MeterReading.on_update`/`on_trash`; expose `modified`/`modified_by`/`modified_by_name` in the dashboard reading payload. Frontend: `ReadingsView.vue` only — an inline editor (two number inputs + the existing exception block) and an admin-only delete on each saved gun card.

**Tech Stack:** Frappe v15 (Python, tabs, `frappe.get_all`/`db.set_value`), Vue 3 SFC + Pinia (`ReadingsView.vue`, `api.js` axios instance with `message` unwrap + CSRF header), Vite build to `staticfiles/vue`, Playwright-free unit tests via `bench --site sejel.local run-tests` (FrappeTestCase, rollback per test).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-10-06-fix-readings-design.md` (approved). Follow it exactly; deviation requires user approval.
- Backend repo: `/home/frappe/bench/apps/sejel_app`, branch `develop`. Commit with `git -c user.name="Sejel QA" -c user.email="qa@sejel.ly" commit -m …`.
- Frontend/QA repo: `/root/projects/Sejel`, branch `master`. Commit with the same author.
- Site: `sejel.local`. Unit tests need `allow_tests true` (already set). Python changes require `sudo systemctl restart sejel-bench.service` before e2e/UI checks.
- **No writes to customer UAT data** during implementation/verification. UAT station is «محطة الراحلة 23» (`2a6j0banti`) — currently reset (0 readings). Tests must roll back.
- **Do not edit approved e2e suite files** (`qa-*.js` under `sejel/e2e-tests/`).
- Client blank-input rule (already shipped in `prevEdit`): reject `''`/whitespace **before** `Number()`; never coerce blank to `0`.
- Exact Arabic strings (copy verbatim): «تعديل», «حذف القراءة», «تم تعديل القراءة», «تم حذف القراءة», `أدخل القراءة السابقة برقم صحيح غير سالب`, `أدخل القراءة الحالية برقم صحيح غير سالب`, confirm `سيتم حذف هذه القراءة نهائياً ثم يمكنك إعادة إدخالها. هل أنت متأكد؟`, last-edited `آخر تعديل: {name} · {when}`.
- No comments in new code unless the file's existing style demands it; `meter_reading.py`, `shift.py`, `dashboard.py` use explanatory comments — match that.

---

### Task 1: `MeterReading.on_update` counter guard (TDD)

**Files:**
- Modify: `/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/meter_reading/meter_reading.py:122-124`
- Test: create `/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/meter_reading/test_meter_reading_edit.py`

**Interfaces:**
- Consumes: existing `MeterReading.on_trash` SQL pattern (lines 136-147).
- Produces: unchanged public API — `on_update()` now sets `Meter.current_reading` to the **latest** reading's `end_reading` for that meter (including self), or leaves the counter untouched when no reading has an `end_reading`. Task 3 relies on this before adding the reconciliation hook.

- [ ] **Step 1: Write the failing test file**

Create `test_meter_reading_edit.py` with this Task-1 content (Task 3 will append more tests to the same class file):

```python
import frappe
from frappe.tests.utils import FrappeTestCase


class TestMeterReadingEdit(FrappeTestCase):
	"""Editing an older row must not rewind the meter's counter (QA: fix-readings)."""

	def setUp(self):
		suffix = frappe.utils.random_string(5)
		self.fuel = frappe.get_doc(
			{"doctype": "Fuel Type", "fuel_name": "بنزين QA " + suffix}
		).insert(ignore_permissions=True)
		self.station = frappe.get_doc(
			{"doctype": "Station", "station_name": "محطة QA " + suffix}
		).insert(ignore_permissions=True)
		self.island = frappe.get_doc(
			{"doctype": "Island", "island_name": "جزيرة QA", "station": self.station.name, "number": 1}
		).insert(ignore_permissions=True)
		self.machine = frappe.get_doc(
			{"doctype": "Machine", "machine_name": "مضخة QA", "island": self.island.name,
			 "station": self.station.name, "number": 1}
		).insert(ignore_permissions=True)
		self.tank = frappe.get_doc(
			{"doctype": "Tank", "tank_name": "خزان QA", "station": self.station.name,
			 "fuel_type": self.fuel.name, "capacity": 10000}
		).insert(ignore_permissions=True)
		self.meter = frappe.get_doc(
			{"doctype": "Meter", "meter_code": "QA" + suffix, "machine": self.machine.name,
			 "fuel_type": self.fuel.name, "tank": self.tank.name, "current_reading": 0}
		).insert(ignore_permissions=True)

	def _shift(self, name):
		return frappe.get_doc(
			{"doctype": "Shift", "shift_name": name, "station": self.station.name,
			 "date": frappe.utils.today(), "is_day_close": 1,
			 "start_time": "06:00", "end_time": "14:00"}
		).insert(ignore_permissions=True)

	def _reading(self, shift, start, end, recorded_at=None):
		reading = frappe.get_doc(
			{"doctype": "Meter Reading", "shift": shift.name, "meter": self.meter.name,
			 "start_reading": start, "end_reading": end}
		)
		if recorded_at:
			reading.recorded_at = recorded_at
		reading.insert(ignore_permissions=True)
		return reading

	def _db_counter(self):
		return frappe.db.get_value("Meter", self.meter.name, "current_reading")

	def test_editing_older_row_keeps_latest_counter(self):
		day1 = self._shift("مناوبة QA يوم 1")
		day2 = self._shift("مناوبة QA يوم 2")
		old = self._reading(day1, 100, 200, recorded_at="2026-10-01 23:00:00")
		new = self._reading(day2, 200, 300, recorded_at="2026-10-02 23:00:00")
		self.assertEqual(self._db_counter(), 300)

		# the end user fixes yesterday's typo on the old row
		old.reload()
		old.end_reading = 250
		old.save()
		# the meter's counter must still reflect the LATEST reading (300)
		self.assertEqual(self._db_counter(), 300)
		self.assertEqual(
			frappe.db.get_value("Meter Reading", new.name, "end_reading"), 300
		)

	def test_start_only_row_leaves_seeded_counter(self):
		shift = self._shift("مناوبة QA بدون إغلاق")
		# counter established by an operator/QA seeding, no reading has an end yet
		frappe.db.set_value("Meter", self.meter.name, "current_reading", 4242)
		self._reading(shift, None, None)
		self.assertEqual(self._db_counter(), 4242)
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd /home/frappe/bench && bench --site sejel.local run-tests --module sejel_app.sejel_app.doctype.meter_reading.test_meter_reading_edit`
Expected: `test_editing_older_row_keeps_latest_counter` FAILS (counter becomes 250 under the old code); `test_start_only_row_leaves_seeded_counter` fails or passes depending on the guard (`if self.end_reading:` currently skips, so it may pass — that is fine, only the first must fail).

- [ ] **Step 3: Implement the guard in `meter_reading.py`**

Replace lines 122-124 (`def on_update(self): if self.end_reading: frappe.db.set_value(...)`) with:

```python
	def on_update(self):
		if not self.meter:
			return
		# An edit may target any date, so writing this row's end into the
		# counter blindly rewound the meter when an OLDER row was corrected
		# while newer rows exist. Recompute from the meter's latest row with
		# an end value (same ordering the dashboard uses); if none exists
		# (start-only entry on an unestablished counter) leave the counter be.
		# Plain SQL: the ["is", "set"] filter is rewritten to `<> ''`, which
		# Postgres rejects on a numeric column.
		rows = frappe.db.sql(
			"""
			select end_reading from `tabMeter Reading`
			where meter = %s and end_reading is not null
			order by recorded_at desc, name desc limit 1
			""",
			(self.meter,),
		)
		if rows:
			frappe.db.set_value("Meter", self.meter, "current_reading", rows[0][0])
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd /home/frappe/bench && bench --site sejel.local run-tests --module sejel_app.sejel_app.doctype.meter_reading.test_meter_reading_edit`
Expected: `Ran 2 tests … OK`.

- [ ] **Step 5: Re-run the meter guard tests (regression)**

Run: `cd /home/frappe/bench && bench --site sejel.local run-tests --module sejel_app.sejel_app.doctype.meter.test_meter`
Expected: `Ran 5 tests … OK` (the `on_update` change must not disturb Task 1's guard).

- [ ] **Step 6: Commit**

```bash
cd /home/frappe/bench/apps/sejel_app
git add sejel_app/sejel_app/doctype/meter_reading/meter_reading.py sejel_app/sejel_app/doctype/meter_reading/test_meter_reading_edit.py
git -c user.name="Sejel QA" -c user.email="qa@sejel.ly" commit -m "fix: counter sync takes the meter's latest reading, not the edited row"
```

---

### Task 2: `Shift.refresh_reconciliation` + hooks from Meter Reading (TDD)

**Files:**
- Modify: `/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/shift/shift.py` (add method after `create_reconciliation`)
- Modify: `/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/meter_reading/meter_reading.py` (call it in `on_update` and `on_trash`)
- Test: extend `/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/meter_reading/test_meter_reading_edit.py`

**Interfaces:**
- Consumes: Task 1's `on_update`. Existing `Shift._fuel_totals()`, `Shift._calculate_expected_sales()`, `Shift._frozen_price()`, `Shift._create_fuel_summaries(recon)`.
- Produces: `Shift.refresh_reconciliation()` → `None` (no-op when the shift has no Reconciliation). Task 4 (frontend) benefits only indirectly; UAT verifies it.

- [ ] **Step 1: Write the failing tests**

Append to the existing class in `test_meter_reading_edit.py` (add a `_closed_shift_with_recon` helper inside the class):

```python
	def _price(self):
		frappe.get_doc(
			{"doctype": "Fuel Price", "fuel_type": self.fuel.name, "selling_price": 2.0,
			 "cost_per_liter": 1.5, "effective_date": "2026-01-01", "is_active": 1}
		).insert(ignore_permissions=True)

	def _closed_shift_with_recon(self, liters_end):
		self._price()
		shift = self._shift("مناوبة QA مغلقة")
		self._reading(shift, 0, liters_end)
		shift.reload()
		shift.status = "submitted"
		shift.save()
		shift.close_shift()
		self.assertTrue(frappe.db.exists("Reconciliation", {"shift": shift.name}))
		return shift

	def _recon(self, shift):
		return frappe.get_doc("Reconciliation", {"shift": shift.name})

	def test_edit_closed_day_refreshes_reconciliation(self):
		shift = self._closed_shift_with_recon(1000)
		self.assertEqual(self._recon(shift).total_liters, 1000)

		reading = frappe.get_all("Meter Reading", filters={"shift": shift.name}, fields=["name"])[0]
		doc = frappe.get_doc("Meter Reading", reading.name)
		doc.start_reading = 400
		doc.end_reading = 1000
		doc.save()

		recon = self._recon(shift)
		self.assertEqual(recon.total_liters, 600)
		self.assertEqual(recon.expected_sales, 1200.0)  # 600 L × 2.0
		self.assertEqual(recon.difference, -1200.0)     # no collection
		self.assertEqual(recon.difference_type, "shortage")
		summary = frappe.get_doc(
			"Shift Fuel Summary",
			{"reconciliation": recon.name, "fuel_type": self.fuel.name},
		)
		self.assertEqual(summary.liters_sold, 600)
		self.assertEqual(summary.expected_sales, 1200.0)

	def test_delete_closed_day_refreshes_reconciliation(self):
		shift = self._closed_shift_with_recon(1000)
		reading = frappe.get_all("Meter Reading", filters={"shift": shift.name}, fields=["name"])[0]
		frappe.delete_doc("Meter Reading", reading.name, ignore_permissions=True)

		recon = self._recon(shift)
		self.assertEqual(recon.total_liters, 0)
		self.assertEqual(recon.expected_sales, 0)
		self.assertEqual(recon.difference, 0)
		self.assertEqual(recon.difference_type, "matched")
		self.assertFalse(
			frappe.db.exists("Shift Fuel Summary", {"reconciliation": recon.name, "liters_sold": 1000})
		)
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd /home/frappe/bench && bench --site sejel.local run-tests --module sejel_app.sejel_app.doctype.meter_reading.test_meter_reading_edit`
Expected: both new tests FAIL (`total_liters` stays 1000 after the edit; fuel summary still 1000 after delete).

- [ ] **Step 3: Add `refresh_reconciliation` to `shift.py`**

Insert after `create_reconciliation` (before `_fuel_totals`):

```python
	def refresh_reconciliation(self):
		"""Recompute reading-derived totals of an existing Reconciliation.

		Editing or deleting a reading of a CLOSED day changes litres and
		expected sales, but the Reconciliation was frozen at close. Cash side
		(total_collection/expenses) is untouched — it cannot change by editing
		a meter. db.set_value + ignore_permissions so any role that can edit a
		reading (including a supervisor session) can trigger this.
		"""
		recon_name = frappe.db.exists("Reconciliation", {"shift": self.name})
		if not recon_name:
			return
		recon = frappe.get_doc("Reconciliation", recon_name)
		total_liters = sum(
			(r.liters_sold or 0)
			for r in frappe.get_all("Meter Reading", filters={"shift": self.name}, fields=["liters_sold"])
		)
		expected_sales = self._calculate_expected_sales(total_liters)
		difference = (recon.total_collection or 0) - expected_sales
		frappe.db.set_value(
			"Reconciliation",
			recon_name,
			{
				"total_liters": total_liters,
				"expected_sales": expected_sales,
				"difference": difference,
				"difference_type": (
					"matched" if difference == 0 else "surplus" if difference > 0 else "shortage"
				),
			},
		)
		# The set of fuels with litres can shrink to nothing when an edit zeroes
		# a fuel's only reading, so rebuild the rows instead of updating them.
		for row in frappe.get_all(
			"Shift Fuel Summary", filters={"reconciliation": recon_name}, fields=["name"]
		):
			frappe.delete_doc("Shift Fuel Summary", row.name, ignore_permissions=True)
		self._create_fuel_summaries(frappe.get_doc("Reconciliation", recon_name))
```

- [ ] **Step 4: Hook it from `MeterReading`**

In `meter_reading.py`, add a helper right before `on_update`:

```python
	def _refresh_reconciliation(self):
		if not self.shift:
			return
		if not frappe.db.exists("Reconciliation", {"shift": self.shift}):
			return
		frappe.get_doc("Shift", self.shift).refresh_reconciliation()
```

Call it at the end of `on_update` (after the counter `if rows:` block) and at the end of `on_trash` (after the existing `frappe.db.set_value("Meter", ...)` line). Both hooks are no-ops while the day is open.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd /home/frappe/bench && bench --site sejel.local run-tests --module sejel_app.sejel_app.doctype.meter_reading.test_meter_reading_edit`
Expected: `Ran 4 tests … OK`.

- [ ] **Step 6: Re-run meter tests**

Run: `cd /home/frappe/bench && bench --site sejel.local run-tests --module sejel_app.sejel_app.doctype.meter.test_meter`
Expected: `OK`.

- [ ] **Step 7: Commit**

```bash
cd /home/frappe/bench/apps/sejel_app
git add sejel_app/sejel_app/doctype/shift/shift.py sejel_app/sejel_app/doctype/meter_reading/meter_reading.py sejel_app/sejel_app/doctype/meter_reading/test_meter_reading_edit.py
git -c user.name="Sejel QA" -c user.email="qa@sejel.ly" commit -m "fix: refresh closed-day reconciliation when a reading is edited or deleted"
```

---

### Task 3: Finance write permission on Meter Reading

**Files:**
- Modify: `/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/meter_reading/meter_reading.json` (`permissions` array)

**Interfaces:**
- Consumes: nothing. Produces: `Sejel Finance` may create/read/write readings (all roles can therefore fix readings per spec §2.2). Delete stays System Manager only.

- [ ] **Step 1: Add the Finance permission entry**

In `meter_reading.json`, inside `"permissions": [ … ]`, append:

```json
    {
     "create": 1,
     "read": 1,
     "role": "Sejel Finance",
     "write": 1
    }
```

(keep valid JSON; add a comma after the previous entry).

- [ ] **Step 2: Apply the permission change on the site**

Run: `cd /home/frappe/bench && bench --site sejel.local migrate`
Expected: completes; permission cache refreshed.

- [ ] **Step 3: Verify permissions resolve (read-only)**

Run: `cd /home/frappe/bench && bench --site sejel.local execute "sejel_app.sejel_app.doctype.meter_reading.meter_reading" --kwargs '{}'` is not meaningful — instead verify via the doctype JSON on disk:

Run: `python3 -c "import json;d=json.load(open('/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/meter_reading/meter_reading.json'));print([p['role'] for p in d['permissions']]);print(d['permissions'][-1])"`
Expected: roles list includes `Sejel Finance`; last entry has `write: 1`.

- [ ] **Step 4: Commit**

```bash
cd /home/frappe/bench/apps/sejel_app
git add sejel_app/sejel_app/doctype/meter_reading/meter_reading.json
git -c user.name="Sejel QA" -c user.email="qa@sejel.ly" commit -m "feat: let finance role write meter readings (fix-readings, all roles edit)"
```

---

### Task 4: Dashboard payload exposes last editor

**Files:**
- Modify: `/home/frappe/bench/apps/sejel_app/sejel_app/api/dashboard.py:138-148` (fields + user map) and `:216-233` (reading dict)

**Interfaces:**
- Consumes: nothing. Produces: each `reading` dict gains `modified`, `modified_by`, `modified_by_name` — consumed by Task 5's «آخر تعديل» line.

- [ ] **Step 1: Add the fields to the query and build a user map**

In `_single_station_payload`, extend the `reading_rows` fields list (after `"recorded_at"`) with `"modified", "modified_by"`. Immediately after the `latest_by_meter` loop, add:

```python
	# "who edited" on saved cards: modified_by is a username; resolve full
	# names in ONE query (the readings loop would otherwise fetch per row).
	editor_names = {}
	for name in {r.modified_by for r in reading_rows if r.modified_by}:
		full = frappe.db.get_value("User", name, "full_name")
		if full:
			editor_names[name] = full
```

- [ ] **Step 2: Expose them on the reading dict**

Inside the `"reading": { … }` dict (after the `"recorded_at"` entry), add:

```python
				"modified": rd.modified if rd else None,
				"modified_by": rd.modified_by if rd else None,
				"modified_by_name": editor_names.get(rd.modified_by) if rd else None,
```

- [ ] **Step 3: Restart and verify read-only**

Run: `sudo systemctl restart sejel-bench.service && sleep 6 && curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8004/login/`
Expected: `200`.

Verification (read-only, via the admin session in the QA harness — do not write): call `/api/dashboard-station/?station=2a6j0banti&date=2026-10-06` and confirm each `reading` object (when present) carries `modified`, `modified_by`, `modified_by_name` keys. Note: after the UAT reset there are **no readings**, so `reading` is `null` today — confirm the payload still returns 200 and, when a reading exists, the keys (a later UAT entry will show them; the code path is unit-covered by no test — accept manual check at UAT).

- [ ] **Step 4: Commit**

```bash
cd /home/frappe/bench/apps/sejel_app
git add sejel_app/api/dashboard.py
git -c user.name="Sejel QA" -c user.email="qa@sejel.ly" commit -m "feat: readings payload carries modified/modified_by for «آخر تعديل»"
```

---

### Task 5: Readings screen — edit + delete UI

**Files:**
- Modify: `/root/projects/Sejel/sejel/frontend/src/views/readings/ReadingsView.vue` (script block after the `prevEdit` group ≈ line 358; template: gun-card header ≈ line 570-586, saved branch ≈ line 593-628)

**Interfaces:**
- Consumes: Task 4 payload fields (`reading.modified`, `reading.modified_by_name`), existing `api.put`/`api.delete` (add `api.delete` if not present — check `api.js`; the axios instance supports `delete`), existing `auth.isAdmin`, `friendlyError`, `notice`, `error`, `load({keepMessage})`.
- Produces: user-facing capability. No backend interface changes.

- [ ] **Step 1: Script — state and functions**

Insert after the `savePrevEdit` function (before `ensureShift`):

```js
// ---- edit / delete a SAVED reading (§ fix-readings) --------------------------
// Any role may correct a reading (all four have Meter Reading write); only
// admin may delete a wrong row. Independent of dayClosed: a closed day is
// still correctable, and the backend refreshes that day's reconciliation.
const rowEdit = ref(null)
const rowEditError = ref('')
const rowEditSaving = ref(false)

function showEdit(row) {
  return !!row.meter.reading && !(rowEdit.value && rowEdit.value.id === row.meter.id)
}

// The saved reading's docname is NOT in the dashboard payload — resolve it
// with the same read-only list call the prevEdit fix uses.
async function resolveReadingName(row) {
  const res = await api.get('/meter-readings/', { params: { meter: row.meter.id, limit_page_length: 0 } })
  const list = res.data.results || res.data || []
  const today = row.meter.reading
  const hit = list.find((r) => (today.recorded_at && r.recorded_at === today.recorded_at)
    || (activeShift.value && r.shift === activeShift.value.id))
  return hit ? hit.name : ''
}

async function openEdit(row) {
  rowEditError.value = ''
  // Resolve BEFORE opening: a failed resolve must never leave an editor whose
  // save would 404.
  const name = await resolveReadingName(row)
  if (!name) {
    error.value = 'تعذر تحديد قراءة اليوم المحفوظة — أعد تحميل الصفحة ثم أعد المحاولة'
    return
  }
  rowEdit.value = {
    id: row.meter.id,
    readingName: name,
    start: String(row.meter.reading.start_reading ?? ''),
    end: String(row.meter.reading.end_reading ?? ''),
    exceptionType: '',
    notes: '',
  }
}

function closeEdit() {
  rowEdit.value = null
  rowEditError.value = ''
}

function editBackwards() {
  if (!rowEdit.value) return false
  const s = Number(rowEdit.value.start)
  const e = Number(rowEdit.value.end)
  return Number.isFinite(s) && Number.isFinite(e) && s >= 0 && e >= 0 && e < s
}

async function saveEdit(row) {
  const edit = rowEdit.value
  if (!edit || rowEditSaving.value) return
  // Blank must never become 0 (same rule as prevEdit): an empty field here
  // would silently overwrite a good reading with 0.
  const rawStart = String(edit.start ?? '').trim()
  const rawEnd = String(edit.end ?? '').trim()
  const start = Number(rawStart)
  const end = Number(rawEnd)
  if (!rawStart || !Number.isFinite(start) || start < 0) {
    rowEditError.value = 'أدخل القراءة السابقة برقم صحيح غير سالب'
    return
  }
  if (!rawEnd || !Number.isFinite(end) || end < 0) {
    rowEditError.value = 'أدخل القراءة الحالية برقم صحيح غير سالب'
    return
  }
  if (!edit.readingName) {
    rowEditError.value = 'تعذر تحديد قراءة اليوم المحفوظة — أعد تحميل الصفحة ثم أعد المحاولة'
    return
  }
  rowEditSaving.value = true
  rowEditError.value = ''
  const body = { start_reading: start, end_reading: end }
  if (edit.exceptionType) {
    body.exception_type = edit.exceptionType
    body.notes = edit.notes || ''
  }
  try {
    await api.put(`/meter-readings/${edit.readingName}/`, body)
    notice.value = 'تم تعديل القراءة'
    closeEdit()
    await load({ keepMessage: true })
  } catch (e) {
    rowEditError.value = friendlyError(e)
  } finally {
    rowEditSaving.value = false
  }
}

async function deleteReading(row) {
  if (!auth.isAdmin) return
  const name = await resolveReadingName(row)
  if (!name) {
    error.value = 'تعذر تحديد قراءة اليوم المحفوظة — أعد تحميل الصفحة ثم أعد المحاولة'
    return
  }
  const ok = window.confirm('سيتم حذف هذه القراءة نهائياً ثم يمكنك إعادة إدخالها. هل أنت متأكد؟')
  if (!ok) return
  error.value = ''
  try {
    await api.delete(`/meter-readings/${name}/`)
    notice.value = 'تم حذف القراءة'
    closeEdit()
    await load({ keepMessage: true })
  } catch (e) {
    error.value = friendlyError(e)
  }
}
```

(`openEdit` stores `readingName`; `saveEdit` sends `PUT /meter-readings/${edit.readingName}/` and refuses with the resolve-error message if it is ever empty.)

- [ ] **Step 2: Template — buttons in the gun-card header**

After the «مسجلة» status badge block (`rowStatus(g.row) === 'saved'` span, ≈ line 561), add:

```html
            <span v-if="showEdit(g.row)" class="flex items-center gap-1">
              <button data-testid="reading-edit" @click="openEdit(g.row)"
                class="text-[11px] text-gray-600 border border-gray-300 rounded-full px-2 py-0.5 hover:bg-gray-50">
                تعديل
              </button>
              <button v-if="auth.isAdmin" data-testid="reading-delete" @click="deleteReading(g.row)"
                class="text-[11px] text-red-600 border border-red-200 rounded-full px-2 py-0.5 hover:bg-red-50">
                حذف القراءة
              </button>
            </span>
```

- [ ] **Step 3: Template — editor replaces the three display boxes**

At the top of the saved branch template (the `<template v-if="g.row.meter.reading && …">` block, ≈ line 593), wrap: inside that template, first add the editor block and guard the three boxes with `v-else`:

```html
            <template v-if="g.row.meter.reading && g.row.meter.reading.end_reading !== null && g.row.meter.reading.end_reading !== undefined">
              <div v-if="rowEdit && rowEdit.id === g.row.meter.id" data-testid="reading-editor" class="col-span-3 rounded-lg border border-gray-200 bg-white p-3">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">القراءة السابقة</label>
                    <input v-model="rowEdit.start" data-testid="reading-edit-start" type="number" min="0" step="0.001"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm tabular-nums" />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">القراءة الحالية (لتر)</label>
                    <input v-model="rowEdit.end" data-testid="reading-edit-end" type="number" min="0" step="0.001"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm tabular-nums" />
                  </div>
                </div>
                <div v-if="editBackwards()" class="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <div class="text-xs text-amber-800 mb-1">القراءة الحالية أقل من السابقة — اختر نوع الاستثناء وسجّل السبب</div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select v-model="rowEdit.exceptionType" data-testid="reading-edit-exception-type" class="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm bg-white">
                      <option value="">لا يوجد</option>
                      <option value="reset">تصفير العداد</option>
                      <option value="replacement">استبدال العداد</option>
                      <option value="other">سبب آخر</option>
                    </select>
                    <input v-model="rowEdit.notes" data-testid="reading-edit-exception-notes" class="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm" placeholder="اكتب السبب هنا" />
                  </div>
                </div>
                <div class="flex gap-2 mt-3 items-center">
                  <button data-testid="reading-edit-save" :disabled="rowEditSaving" @click="saveEdit(g.row)"
                    class="bg-primary text-white px-3 py-1.5 rounded-lg text-xs disabled:opacity-50">
                    {{ rowEditSaving ? 'جاري الحفظ...' : 'حفظ' }}
                  </button>
                  <button data-testid="reading-edit-cancel" @click="closeEdit" class="text-xs text-gray-500 hover:underline">إلغاء</button>
                </div>
                <p v-if="rowEditError" data-testid="reading-edit-error" class="text-xs text-red-600 mt-1">{{ rowEditError }}</p>
              </div>
              <template v-else>
              <!-- the existing three boxes (gun-previous / gun-saved-current /
                   gun-saved-liters) stay exactly as they are -->
              </template>
            </template>
```

Concretely: paste the existing three `<div>` blocks (lines 594-628) unchanged inside the new `<template v-else>`.

- [ ] **Step 4: Template — last-edited line**

Inside the «القراءة المسجلة اليوم» box (after the `<b>` with `end_reading`, ≈ line 620), add:

```html
                <div v-if="g.row.meter.reading.modified_by_name" data-testid="last-edited" class="text-[11px] text-gray-400 mt-1">
                  آخر تعديل: {{ g.row.meter.reading.modified_by_name }} ·
                  {{ String(g.row.meter.reading.modified).slice(0, 16) }}
                </div>
```

- [ ] **Step 5: Build**

Run: `cd /root/projects/Sejel/sejel/frontend && npm run build`
Expected: `✓ built` with no Vue template errors; the asset name for `ReadingsView-*.js` changes.

- [ ] **Step 6: Verify no UAT writes**

Run: `cd /home/frappe/bench && bench --site sejel.local execute frappe.get_all --kwargs '{"doctype": "Meter Reading", "fields": ["name"]}'`
Expected: `[]` (the UAT station is still reset; a non-empty result means something wrote — investigate before proceeding).

- [ ] **Step 7: Commit**

```bash
cd /root/projects/Sejel
git add sejel/frontend/src/views/readings/ReadingsView.vue
git -c user.name="Sejel QA" -c user.email="qa@sejel.ly" commit -m "feat: edit/delete saved readings + last-edited line on the readings screen"
```

---

### Task 6: Verification & handoff

**Files:** none (verification only).

**Interfaces:**
- Consumes: everything from Tasks 1-5.

- [ ] **Step 1: Backend unit tests green**

Run: `cd /home/frappe/bench && bench --site sejel.local run-tests --module sejel_app.sejel_app.doctype.meter_reading.test_meter_reading_edit && bench --site sejel.local run-tests --module sejel_app.sejel_app.doctype.meter.test_meter`
Expected: `Ran 4 tests … OK` then `Ran 5 tests … OK`.

- [ ] **Step 2: Service + site health**

Run: `sudo systemctl restart sejel-bench.service && sleep 6 && curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8004/login/`
Expected: `200`.

- [ ] **Step 3: Read-only API spot check**

Fetch `/api/dashboard-station/?station=2a6j0banti&date=2026-10-06` as admin (helpers `login`): expect HTTP 200, 8 guns, all `reading: null` (still reset), no errors.

- [ ] **Step 4: Regression suite (backend accounting touched)**

Run the 15 suites listed in `docs/superpowers/plans/2026-10-05-initial-meter-readings.md` §regression (295 steps). Expected: 0 failures. If a suite fails, stop and report before fixing.

- [ ] **Step 5: Handoff summary for the customer**

Report: what changed, what each role can do, the UAT walkthrough (edit a reading → litres + «آخر تعديل» update; admin delete → row returns to «بانتظار القراءة»; edit on a closed day → reconciliation follows; finance can edit), and explicitly: no UAT data was written by QA.

---

## Self-Review

1. **Spec coverage:** §4.1 → Task 3; §4.2 → Task 1; §4.3 → Task 2; §4.4 → Task 4; §5.1/§5.2/§5.3 → Task 5; §6 → Task 5 (error strings, friendlyError) + §5.1 note; §7 → Task 1-2 tests + Task 5-6 steps; §8 → Task 6. All covered.
2. **Placeholder scan:** Task 4 Step 3 notes the UAT station has no readings so the payload key check is deferred to UAT (explicit, not a TODO). Task 5's template step names the exact lines and shows full code. No TBDs.
3. **Type consistency:** `resolveReadingName` is defined in Task 5 Step 1 and used by `openEdit`/`deleteReading` there; `rowEdit.readingName` set in `openEdit` before `saveEdit` uses it; `editBackwards()` matches the spec's "both valid non-negative numbers, end < start"; `Shift.refresh_reconciliation()` name is consistent between Task 2 Step 3 and Step 4's hook.
4. Known tension: the spec says the delete confirm comes first; the plan resolves the docname first (a failed resolve then never asks for confirmation). This is a deliberate, safer ordering — flagged here for the user, not silently changed in the spec.
