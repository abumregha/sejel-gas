# Initial Meter Readings (القراءات الافتتاحية) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** let the end user type each gun's opening counter right after creating a station (new optional wizard step) and maintain/lock those values from the station page («تجاوز» force button), with the counter protected at the model layer once reading rows exist.

**Architecture:** no new API route, no nginx edit, no schema change. The write path is the existing `PUT /api/meters/<name>/` (generic CRUD → `Meter.save()`); a new `Meter.validate()` refuses counter changes once the meter has `Meter Reading` rows (with a re-sync allowance to the last `end_reading`). The setup response gains `meters[]` identities and `GET /api/meters/` rows gain `reading_count`, both consumed by the two Vue screens. Spec: `docs/superpowers/specs/2026-10-05-initial-meter-readings-design.md`.

**Tech Stack:** Frappe v15.120 / Python (backend app `sejel_app`), Vue 3 + Vite (frontend in `sejel/frontend`), Playwright/Chromium e2e in `sejel/e2e-tests`, Postgres, nginx on :8004.

## Global Constraints

- **No new `/api/*` route, no nginx change, no DB migration, no DocType field changes.**
- Backend repo: `/home/frappe/bench/apps/sejel_app`, branch `develop`. Frontend/QA repo: `/root/projects/Sejel`, branch `master`.
- Commit style (both repos): `git -c user.name="Sejel QA" -c user.email="qa@sejel.ly" commit -m "<message>"`.
- Arabic copy, exact strings:
  - wizard step title: `القراءات الافتتاحية (اختياري)`
  - force button: `تجاوز`
  - locked caption: `مقفلة بعد أول قراءة`
  - panel save button: `حفظ القراءات الافتتاحية`
  - confirm dialog: `سيتم استبدال القراءة الافتتاحية {old} — لا توجد قراءات محفوظة على هذا العداد. هل أنت متأكد؟`
  - server refusal: `لا يمكن تعديل القراءة الافتتاحية للعداد {code} — عليها {n} قراءة محفوظة`
  - wizard amber notice: `تم إنشاء المحطة — تعذر حفظ القراءات الافتتاحية على عدّاد {code}: {reason}. أدخلها من صفحة المحطة`
- Value rules: finite number, `0 ≤ value ≤ 1e9`; re-sync allowance `±0.001` against the last `end_reading`.
- `Meter` write is already limited to `Sejel Manager` + `System Manager` by DocPerm (verified: `SELECT role, "read", "write" FROM "tabDocPerm" WHERE parent='Meter'` → only those two + read-only `Sejel Supervisor`). Do not add role code.
- `frappe.db.set_value()` bypasses `validate()` — that is why `meter_reading.py` counter updates keep working. Never "fix" that.
- Do not touch the client's live station `محطة الراحلة 23`.
- The approved regression set is exactly 15 suites / 295 steps (list in Task 5) and must stay green; no approved suite file may be edited by this feature.
- Frontend build: `cd /root/projects/Sejel/sejel/frontend && npm run build` → writes `../staticfiles/vue` (nginx `root` for :8004).
- Backend code reload: `sudo systemctl restart sejel-bench.service` (service runs `bench serve --noreload`); wait ~6 s, then confirm `systemctl is-active sejel-bench.service` = `active`.

## File Structure

| File | Responsibility | Task |
|---|---|---|
| Modify: `apps/sejel_app/sejel_app/sejel_app/doctype/meter/meter.py` | counter guard (`validate`) — the only write rule | 1 |
| Create: `apps/sejel_app/sejel_app/sejel_app/doctype/meter/test_meter.py` | guard tests (first `test_*.py` in the app) | 1 |
| Modify: `apps/sejel_app/sejel_app/api/views.py` | `setup_station` returns `meters[]`; `LIST_ENRICHERS["meters"]` adds `reading_count` | 2 |
| Create: `apps/sejel_app/sejel_app/api/test_views_meter.py` | tests for both | 2 |
| Modify: `sejel/frontend/src/views/stations/StationSetupWizard.vue` | new step + post-create counter writes | 3 |
| Create: `sejel/e2e-tests/qa-initial-readings.js` | browser proof (Part A in task 3, Part B in task 4) | 3–4 |
| Modify: `sejel/frontend/src/views/stations/StationDetail.vue` | meters-tab initial-readings panel | 4 |
| Modify: `DOCUMENTATION.md`, `docs/BUSINESS_INVARIANTS.md`, `docs/PILOT_HANDOFF_AR.md` | user/API/invariant/coverage docs | 6 |

---

### Task 1: `Meter.validate()` counter guard (backend, TDD)

**Files:**
- Modify: `/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/meter/meter.py` (currently `class Meter(Document): pass`)
- Create: `/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/meter/test_meter.py`

**Interfaces:**
- Consumes: `Meter Reading` rows (`meter`, `start_reading`, `end_reading`), `Meter.current_reading` (Float, default 0), `Meter.meter_code`.
- Produces: rule enforced on **every** `Meter` doc save — Task 3/4 rely on `PUT /api/meters/<name>/` being refused when readings exist; maintenance tool `qa-repair-counters.js` relies on the re-sync allowance.

- [ ] **Step 1: Write the failing tests**

Create `test_meter.py`:

```python
import frappe
from frappe.tests.utils import FrappeTestCase


class TestMeterInitialValue(FrappeTestCase):
	def setUp(self):
		suffix = frappe.utils.random_string(5)
		self.fuel = frappe.get_doc(
			{"doctype": "Fuel Type", "fuel_name": "بنزين QA " + suffix}
		).insert(ignore_permissions=True)
		self.station = frappe.get_doc(
			{"doctype": "Station", "station_name": "محطة QA " + suffix}
		).insert(ignore_permissions=True)
		self.island = frappe.get_doc(
			{
				"doctype": "Island",
				"island_name": "جزيرة QA",
				"station": self.station.name,
				"number": 1,
			}
		).insert(ignore_permissions=True)
		self.machine = frappe.get_doc(
			{
				"doctype": "Machine",
				"machine_name": "مضخة QA",
				"island": self.island.name,
				"station": self.station.name,
				"number": 1,
			}
		).insert(ignore_permissions=True)
		self.tank = frappe.get_doc(
			{
				"doctype": "Tank",
				"tank_name": "خزان QA",
				"station": self.station.name,
				"fuel_type": self.fuel.name,
				"capacity": 10000,
			}
		).insert(ignore_permissions=True)
		self.meter = frappe.get_doc(
			{
				"doctype": "Meter",
				"meter_code": "QA" + suffix,
				"machine": self.machine.name,
				"fuel_type": self.fuel.name,
				"tank": self.tank.name,
				"current_reading": 5000,
			}
		).insert(ignore_permissions=True)
		self.shift = frappe.get_doc(
			{
				"doctype": "Shift",
				"shift_name": "مناوبة QA " + suffix,
				"station": self.station.name,
				"date": frappe.utils.today(),
				"start_time": "06:00",
				"end_time": "14:00",
			}
		).insert(ignore_permissions=True)

	def _add_reading(self, start, end):
		reading = frappe.get_doc(
			{
				"doctype": "Meter Reading",
				"shift": self.shift.name,
				"meter": self.meter.name,
				"start_reading": start,
				"end_reading": end,
			}
		)
		reading.insert(ignore_permissions=True)
		return reading

	def _db_counter(self):
		return frappe.db.get_value("Meter", self.meter.name, "current_reading")

	def test_counter_writable_before_first_reading(self):
		self.meter.current_reading = 9999.5
		self.meter.save()
		self.assertEqual(self._db_counter(), 9999.5)

	def test_insert_with_counter_allowed(self):
		doc = frappe.get_doc(
			{
				"doctype": "Meter",
				"meter_code": "QA" + frappe.utils.random_string(5),
				"machine": self.machine.name,
				"fuel_type": self.fuel.name,
				"tank": self.tank.name,
				"current_reading": 123,
			}
		).insert(ignore_permissions=True)
		self.assertEqual(doc.current_reading, 123)

	def test_counter_refused_after_first_reading(self):
		self._add_reading(5000, 7000)
		meter = frappe.get_doc("Meter", self.meter.name)
		meter.current_reading = 999999
		self.assertRaises(frappe.ValidationError, meter.save)
		# reading save re-derived the counter through set_value (bypasses validate)
		self.assertEqual(self._db_counter(), 7000)

	def test_resync_to_last_end_allowed(self):
		self._add_reading(5000, 7000)
		# simulate counter drift the way a bad cleanup would (direct SQL)
		frappe.db.set_value("Meter", self.meter.name, "current_reading", 1)
		meter = frappe.get_doc("Meter", self.meter.name)
		meter.current_reading = 7000
		meter.save()
		self.assertEqual(self._db_counter(), 7000)

	def test_negative_refused(self):
		meter = frappe.get_doc("Meter", self.meter.name)
		meter.current_reading = -1
		self.assertRaises(frappe.ValidationError, meter.save)
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/frappe/bench && bench --site sejel.local run-tests --module sejel_app.sejel_app.doctype.meter.test_meter
```

Expected: `FAILED (failures=3)` — `test_counter_refused_after_first_reading`, `test_resync_to_last_end_allowed` and `test_negative_refused` fail because `class Meter` has no `validate`.

- [ ] **Step 3: Implement the guard**

Replace `meter.py`:

```python
import frappe
from frappe import _
from frappe.model.document import Document

MAX_INITIAL_READING = 1e9
RESYNC_TOLERANCE = 0.001


class Meter(Document):
	def validate(self):
		if not self.has_value_changed("current_reading"):
			return
		if self.current_reading is None:
			return
		try:
			value = float(self.current_reading)
		except (TypeError, ValueError):
			frappe.throw(_("قيمة غير صالحة للقراءة الافتتاحية"))
		if value != value or value < 0 or value > MAX_INITIAL_READING:
			frappe.throw(_("قيمة غير صالحة للقراءة الافتتاحية: {0}").format(self.current_reading))
		self.current_reading = value
		rows = frappe.db.count("Meter Reading", filters={"meter": self.name})
		if not rows:
			return
		last_end = frappe.db.get_value(
			"Meter Reading", {"meter": self.name}, "end_reading", order_by="creation desc"
		)
		if last_end is not None and abs(value - float(last_end)) <= RESYNC_TOLERANCE:
			return
		frappe.throw(
			_("لا يمكن تعديل القراءة الافتتاحية للعداد {0} — عليها {1} قراءة محفوظة").format(
				self.meter_code, rows
			)
		)
```

- [ ] **Step 4: Run tests to verify they pass**

Same command as Step 2. Expected: `OK` — 5 tests.

- [ ] **Step 5: Reload the serving process and smoke-check the site**

```bash
sudo systemctl restart sejel-bench.service && sleep 6
systemctl is-active sejel-bench.service   # → active
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8004/login/   # → 200
```

- [ ] **Step 6: Commit**

```bash
cd /home/frappe/bench/apps/sejel_app
git add sejel_app/sejel_app/doctype/meter/meter.py sejel_app/sejel_app/doctype/meter/test_meter.py
git -c user.name="Sejel QA" -c user.email="qa@sejel.ly" commit -m "meter: refuse counter changes once readings exist (zero-readings guard)"
```

---

### Task 2: setup response `meters[]` + `reading_count` enricher (backend, TDD)

**Files:**
- Modify: `/home/frappe/bench/apps/sejel_app/sejel_app/api/views.py`
  - `_setup_station_impl` meter loop + return dict (~lines 667–717)
  - `_enrich_meters` + `LIST_ENRICHERS` (lines 249–252)
- Create: `/home/frappe/bench/apps/sejel_app/sejel_app/api/test_views_meter.py`

**Interfaces:**
- Consumes: Task 1 guard (irrelevant here), `Meter`/`Meter Reading` doctypes, `frappe.get_list` enricher hook (`LIST_ENRICHERS`).
- Produces (Task 3/4 depend on these exact shapes):
  - `POST /api/setup-station/` → `{"ok": true, "station": <name>, "meters": [{"name": <docname>, "meter_code": <str>}, ...], "created": {...}}` — `meters` in island→machine→slot generation order, one entry per created meter (empty list when `meters_per_machine` is 0).
  - `GET /api/meters/` → each row gains `reading_count` (int, 0 when no rows).

- [ ] **Step 1: Write the failing tests**

Create `api/test_views_meter.py`:

```python
import frappe
from frappe.tests.utils import FrappeTestCase

from sejel_app.api.crud import _cascade_delete_station_children
from sejel_app.api.views import _enrich_meters, _setup_station_impl


def _ensure_fuel_types():
	for name in ("بنزين", "ديزل"):
		if not frappe.db.exists("Fuel Type", name):
			frappe.get_doc({"doctype": "Fuel Type", "fuel_name": name}).insert(ignore_permissions=True)


class TestSetupStationMetersResponse(FrappeTestCase):
	def test_returns_meter_identities_in_generation_order(self):
		_ensure_fuel_types()
		station_name = "محطة اختبار القراءات " + frappe.utils.random_string(6)
		out = _setup_station_impl(
			{
				"station": {"station_name": station_name, "relationship_type": "owned"},
				"islands": [{"machines": 2, "meters": 2}],
				"tanks": [{"fuel_type": "بنزين", "capacity": 30000}],
			}
		)
		try:
			self.assertTrue(out["ok"])
			self.assertEqual(out["created"]["meters"], 4)
			self.assertEqual(len(out["meters"]), 4)
			names = [m["name"] for m in out["meters"]]
			self.assertEqual(len(set(names)), 4)
			for entry in out["meters"]:
				self.assertEqual(
					frappe.db.get_value("Meter", entry["name"], "meter_code"),
					entry["meter_code"],
				)
			# generation order = machine order: first two guns of one pump
			self.assertTrue(out["meters"][0]["meter_code"].startswith("M01"))
			self.assertTrue(out["meters"][2]["meter_code"].startswith("M02"))
		finally:
			_cascade_delete_station_children(out["station"])
			frappe.delete_doc("Station", out["station"], ignore_permissions=True, ignore_missing=True)
			frappe.db.commit()


class TestMetersReadingCount(FrappeTestCase):
	def setUp(self):
		_ensure_fuel_types()
		suffix = frappe.utils.random_string(5)
		self.station = frappe.get_doc(
			{"doctype": "Station", "station_name": "محطة QA " + suffix}
		).insert(ignore_permissions=True)
		self.island = frappe.get_doc(
			{"doctype": "Island", "island_name": "جزيرة QA", "station": self.station.name, "number": 1}
		).insert(ignore_permissions=True)
		self.machine = frappe.get_doc(
			{
				"doctype": "Machine",
				"machine_name": "مضخة QA",
				"island": self.island.name,
				"station": self.station.name,
				"number": 1,
			}
		).insert(ignore_permissions=True)
		self.tank = frappe.get_doc(
			{
				"doctype": "Tank",
				"tank_name": "خزان QA",
				"station": self.station.name,
				"fuel_type": "بنزين",
				"capacity": 5000,
			}
		).insert(ignore_permissions=True)
		self.meter = frappe.get_doc(
			{
				"doctype": "Meter",
				"meter_code": "QA" + suffix,
				"machine": self.machine.name,
				"fuel_type": "بنزين",
				"tank": self.tank.name,
				"current_reading": 0,
			}
		).insert(ignore_permissions=True)

	def test_reading_count_is_zero_then_counts_rows(self):
		rows = [{"name": self.meter.name}, {"name": "does-not-exist"}]
		_enrich_meters(rows)
		self.assertEqual(rows[0]["reading_count"], 0)
		self.assertEqual(rows[1]["reading_count"], 0)

		shift = frappe.get_doc(
			{
				"doctype": "Shift",
				"shift_name": "مناوبة QA " + frappe.utils.random_string(5),
				"station": self.station.name,
				"date": frappe.utils.today(),
				"start_time": "06:00",
				"end_time": "14:00",
			}
		).insert(ignore_permissions=True)
		frappe.get_doc(
			{
				"doctype": "Meter Reading",
				"shift": shift.name,
				"meter": self.meter.name,
				"start_reading": 0,
				"end_reading": 10,
			}
		).insert(ignore_permissions=True)

		rows = [{"name": self.meter.name}]
		_enrich_meters(rows)
		self.assertEqual(rows[0]["reading_count"], 1)

	def test_empty_rows_are_a_no_op(self):
		self.assertIsNone(_enrich_meters([]))
		self.assertIsNone(_enrich_meters(None))
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/frappe/bench && bench --site sejel.local run-tests --module sejel_app.api.test_views_meter
```

Expected: the run errors with `ImportError: cannot import name '_enrich_meters' from 'sejel_app.api.views'` (no tests collected). After Step 3(a)+(b) but before the enricher, `test_returns_meter_identities_in_generation_order` fails on the missing `meters` key — both changes are covered by Step 1's tests.

- [ ] **Step 3: Implement both changes in `views.py`**

(a) In `_setup_station_impl`, meter generation loop — capture identities. Replace:

```python
						meter = frappe.new_doc("Meter")
						meter.update({
							"meter_code": code,
							"machine": machine_name,
							"fuel_type": fuel_type,
							"tank": tank_link,
						})
						meter.insert()
						created.append(("Meter", meter.name))
```

with:

```python
						meter = frappe.new_doc("Meter")
						meter.update({
							"meter_code": code,
							"machine": machine_name,
							"fuel_type": fuel_type,
							"tank": tank_link,
						})
						meter.insert()
						created.append(("Meter", meter.name))
						meter_rows.append({"name": meter.name, "meter_code": code})
```

and initialise `meter_rows = []` right before `total_meters = sum(island_meter_counts.values())`.

(b) Return value — add the list:

```python
	return {
		"ok": True,
		"station": station.name,
		"meters": meter_rows,
		"created": {
			"islands": len(island_names),
			"machines": len(machine_names),
			"tanks": len(tank_names),
			"meters": sum(1 for c in created if c[0] == "Meter"),
		},
	}
```

(c) Enricher — add above `LIST_ENRICHERS`:

```python
def _enrich_meters(rows):
	"""Initial-readings panel: a row must say how many reading rows the gun
	already has, otherwise «never set» and «locked» are indistinguishable."""
	if not rows:
		return
	counts = {}
	names = [r.get("name") for r in rows if r.get("name")]
	if names:
		for c in frappe.get_all(
			"Meter Reading",
			filters={"meter": ["in", names]},
			fields=["meter", "count(name) as reading_count"],
			group_by="meter",
		):
			counts[c.meter] = int(c.reading_count or 0)
	for r in rows:
		r["reading_count"] = counts.get(r.get("name"), 0)
```

and register it:

```python
LIST_ENRICHERS = {
	"shortage-claims": _enrich_shortage_claims,
	"fuel-reconciliations": _enrich_fuel_reconciliations,
	"meters": _enrich_meters,
}
```

- [ ] **Step 4: Run tests to verify they pass**

Same command as Step 2. Expected: `OK` — 3 tests.

- [ ] **Step 5: Reload + live proof of the new fields**

```bash
sudo systemctl restart sejel-bench.service && sleep 6
```

Then, through a logged-in page context (any existing e2e helper works), or simply:

```bash
curl -s -c /tmp/opencode/cj -b /tmp/opencode/cj http://127.0.0.1:8004/api/auth/me/ >/dev/null
```

Better: prove it with the real SPA data path in Task 3's e2e (it asserts `reading_count` on `/meters/` and `meters[]` from setup). As a quick API check, run:

```bash
cd /root/projects/Sejel/sejel/e2e-tests && node -e "
const { launch, login, apiGet, apiPost } = require('./helpers');
(async () => {
  const { browser, page } = await launch();
  await login(page);
  const st = await apiPost(page, 'setup-station/', {
    station: { station_name: 'tmp readings check ' + Date.now(), relationship_type: 'owned' },
    islands: [{ machines: 1, meters: 2 }],
    tanks: [{ fuel_type: 'بنزين', capacity: 10000 }],
  });
  console.log('meters[] =', JSON.stringify(st.meters));
  const ms = (await apiGet(page, 'meters/?limit_page_length=0')).results || [];
  console.log('reading_count on rows =', JSON.stringify(ms.slice(0, 3).map(m => m.reading_count)));
  const { qaDelete } = require('./qa');
  console.log('cleanup', JSON.stringify(await qaDelete(page, 'stations', st.station)));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); })
"
```

Expected: `meters[] = [{"name":"…","meter_code":"M01A"},{...}]`, `reading_count on rows = [0,0,…]`, `cleanup {"status":200,"ok":true}`.

- [ ] **Step 6: Commit**

```bash
cd /home/frappe/bench/apps/sejel_app
git add sejel_app/api/views.py sejel_app/api/test_views_meter.py
git -c user.name="Sejel QA" -c user.email="qa@sejel.ly" commit -m "api: setup-station returns meter identities; meters list carries reading_count"
```

---

### Task 3: wizard step «القراءات الافتتاحية» (frontend + e2e Part A)

**Files:**
- Modify: `/root/projects/Sejel/sejel/frontend/src/views/stations/StationSetupWizard.vue`
- Create: `/root/projects/Sejel/sejel/e2e-tests/qa-initial-readings.js`

**Interfaces:**
- Consumes: Task 2 — `data.meters[]` from `POST /setup-station/`, `reading_count` on `GET /meters/`; `api.put()` from `src/api.js`; `friendlyError()` from `src/errors.js`.
- Produces: wizard flow step indices `0..4` + done at `5`; state `initialReadings` keyed by slot index; `meterSlots` computed `[{code, fuel}]`; `initialReadingsError` string shown on the done step; e2e helper usage pattern for the panel task.

- [ ] **Step 1: Write the failing e2e script (Part A)**

Create `sejel/e2e-tests/qa-initial-readings.js`:

```js
// القراءات الافتتاحية: wizard step (Part A) + station panel (Part B, added in task 4)
const { launch, login, goto, apiGet, apiPost, apiPut, step, summary, shot } = require('./helpers')
const { uiLogin, qaFill, qaStationId, qaDelete } = require('./qa')

const NAME = 'محطة القراءات الافتتاحية ' + Date.now()
const V1 = 3513623
const V2 = 3514000

;(async () => {
  const { browser, page } = await launch()
  step('UI: login', await login(page))

  // ---------- Part A: the new wizard step ----------
  await goto(page, 'stations/setup-wizard')
  await page.waitForTimeout(600)

  await qaFill(page, 'اسم المحطة *', NAME)
  await qaFill(page, 'العنوان', 'طرابلس — طريق الاختبار')
  await page.locator('button', { hasText: 'التالي' }).click()
  await page.waitForTimeout(300)

  // step 1 (islands & machines): keep the defaults — 2 islands × 2 pumps × 2 guns = 8
  await page.locator('button', { hasText: 'التالي' }).click()
  await page.waitForTimeout(300)

  // step 2 (tanks): onMounted preselects the first fuel type — wait for it,
  // otherwise next() rejects the step with «أكمل نوع الوقود والسعة»
  await page.waitForFunction(() =>
    [...document.querySelectorAll('select')].some(s => s.value), { timeout: 5000 })
  await qaFill(page, 'السعة (لتر) *', 30000)
  await page.locator('button', { hasText: 'التالي' }).click()
  await page.waitForTimeout(400)

  const inputs = page.locator('[data-testid="initial-reading"]')
  const gunCount = await inputs.count()
  step('UI: new step lists every generated gun', gunCount === 8, `inputs=${gunCount}`)
  await inputs.nth(0).fill(String(V1))
  await inputs.nth(1).fill(String(V2))
  await page.locator('button', { hasText: 'التالي' }).click()
  await page.waitForTimeout(300)

  await shot(page, 'initial-readings-review')
  await page.locator('button', { hasText: 'إنشاء المحطة' }).click()
  await page.waitForSelector('text=تم إنشاء المحطة', { timeout: 30000 })
  const doneText = await page.locator('body').innerText()
  step('UI: created without the amber failure notice',
    doneText.includes('تم إنشاء المحطة') && !doneText.includes('تعذر حفظ القراءات الافتتاحية'),
    doneText.slice(0, 200))
  await shot(page, 'initial-readings-done')

  // ---------- values are counters, not reading rows ----------
  const ST = await qaStationId(page, NAME)
  step('API: fixture station resolved', !!ST, ST || 'not found')
  const machines = (await apiGet(page, `machines/?station=${ST}&limit_page_length=0`)).results || []
  const mine = new Set(machines.map((m) => m.name))
  const meters = ((await apiGet(page, 'meters/?limit_page_length=0')).results || [])
    .filter((m) => mine.has(m.machine))
  step('API: 8 guns created', meters.length === 8, `guns=${meters.length}`)
  step('API: every row carries reading_count = 0',
    meters.length > 0 && meters.every((m) => Number(m.reading_count) === 0),
    JSON.stringify(meters.map((m) => m.reading_count)))
  const values = meters.map((m) => Number(m.current_reading)).filter((v) => v > 0).sort((a, b) => a - b)
  step('API: exactly the two typed values stored as counters',
    values.length === 2 && values[0] === V1 && values[1] === V2, JSON.stringify(values))

  const allReadings = (await apiGet(page, 'meter-readings/?limit_page_length=0')).results || []
  const mineReadings = allReadings.filter((r) => mine.has(r.meter))
  step('API: no baseline rows were created', mineReadings.length === 0, `rows=${mineReadings.length}`)

  // readings screen prefills the entered value as «القراءة السابقة»
  await goto(page, 'readings')
  await page.waitForTimeout(800)
  const stationSelect = page.locator('[data-testid="readings-station"]')
  if (await stationSelect.count()) {
    await stationSelect.selectOption({ label: NAME })
    await page.waitForTimeout(900)
  }
  const readingsBody = await page.locator('body').innerText()
  step('UI: readings screen shows the entered value as القراءة السابقة',
    readingsBody.includes(V1.toLocaleString('en-US')) || readingsBody.includes(String(V1)),
    V1.toLocaleString('en-US'))
  await shot(page, 'initial-readings-prev')

  // an employee session must not be able to write counters
  const { browser: empBrowser, page: empPage } = await launch()
  await uiLogin(empPage, 'emp@sejel.ly', 'Sejel-QA-2026')
  const refused = await apiPut(empPage, `meters/${meters[0].name}/`, { current_reading: 123 })
  step('PERM: employee PUT of current_reading refused',
    refused.__status !== undefined || String(refused.__exc || '').length > 0,
    JSON.stringify(refused).slice(0, 140))
  await empBrowser.close()

  // ---------- cleanup (Part B, task 4, is inserted just above this block) ----------
  const del = await qaDelete(page, 'stations', ST)
  step('CLEANUP: fixture station deleted', del.ok || del.status === 404, `HTTP ${del.status}`)

  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch((e) => { console.error('FATAL:', e.message.split('\n')[0]); process.exit(2) })
```

- [ ] **Step 2: Run it to verify it fails**

```bash
cd /root/projects/Sejel/sejel/e2e-tests && node qa-initial-readings.js
```

Expected: exit `1` or `2` with `UI: new step lists every generated gun — FAIL inputs=0` (the step does not exist yet), then `FATAL:` from filling a non-existent input.

- [ ] **Step 3: Implement the wizard step**

In `StationSetupWizard.vue`:

(a) `steps` (line 178) becomes five entries:

```js
const steps = [
  { title: 'بيانات المحطة' },
  { title: 'الجزر والمضخات' },
  { title: 'الخزانات' },
  { title: 'القراءات الافتتاحية (اختياري)' },
  { title: 'مراجعة وإنشاء' },
]
```

(b) state (near `const result = ref({})`):

```js
const initialReadings = ref({})
const initialReadingsError = ref('')
```

(c) replace `meterPreview` (lines 228–244) with a slots list + derived preview (output string is byte-identical to today's):

```js
const meterSlots = computed(() => {
  const tanks = form.value.tanks.filter(t => t.fuel_type)
  if (!tanks.length) return []
  const slots = []
  let m = 1
  form.value.islands.forEach((isl) => {
    const mcount = Number(isl.machines) || 0
    const sper = Number(isl.meters) || 0
    for (let k = 0; k < mcount; k++) {
      for (let s = 0; s < sper; s++) {
        slots.push({
          code: `M${String(m).padStart(2, '0')}${String.fromCharCode(65 + s)}`,
          fuel: tanks[s % tanks.length].fuel_type,
        })
      }
      m++
    }
  })
  return slots
})

const meterPreview = computed(() => {
  const pumps = new Map()
  for (const slot of meterSlots.value) {
    const n = Number(slot.code.slice(1, 3))
    if (!pumps.has(n)) pumps.set(n, [])
    pumps.get(n).push(`${slot.code} (${slot.fuel})`)
  }
  return [...pumps.entries()].map(([n, items]) => `مضخة ${n}: ${items.join('، ')}`)
})

const fuelLabel = (fuel) => {
  const hit = fuelTypes.value.find(f => f.name === fuel)
  return hit ? hit.fuel_name : fuel
}
```

(d) new template block — insert between the tanks block (`v-if="step === 2"`, ends line 123) and the review block:

```html
    <!-- Step 4: Initial readings (optional) -->
    <div v-if="step === 3" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div>
        <h3 class="font-bold text-sm">القراءات الافتتاحية للعدادات (اختياري)</h3>
        <p class="text-xs text-gray-500 mt-1">
          أدخل قراءة العدّار الفعلية عند التسليم لكل مسدس. يمكنك تخطي هذه الخطوة وإدخالها لاحقاً من صفحة المحطة.
        </p>
      </div>
      <div v-if="meterSlots.length" class="space-y-3">
        <div v-for="(slot, i) in meterSlots" :key="i" class="flex items-center gap-3 border border-gray-200 rounded-lg p-3">
          <span class="font-mono font-medium text-sm w-16">{{ slot.code }}</span>
          <span class="text-xs text-gray-500 flex-1">{{ fuelLabel(slot.fuel) }}</span>
          <input v-model="initialReadings[i]" data-testid="initial-reading" type="number" min="0" step="0.001"
            class="w-44 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="مثال: 3513623" />
        </div>
      </div>
      <p v-else class="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        لا توجد عدادات — ستظهر القراءات هنا بعد إضافة المسدسات
      </p>
    </div>
```

(e) index shifts (done step moves 4 → 5, review 3 → 4):
- review block `v-if="step === 3"` (line 126) → `v-if="step === 4"`
- done block `v-if="step === 4"` (line 148) → `v-if="step === 5"`
- nav container `v-if="step < 4"` (line 159) → `v-if="step < 5"`
- «التالي» `v-if="step < 3"` (line 161) → `v-if="step < 4"`
- «إنشاء المحطة» `v-if="step === 3"` (line 162) → `v-if="step === 4"`

(f) amber notice on the done block — insert after the counts `<p>` (line 151):

```html
      <p v-if="initialReadingsError" data-testid="initial-readings-error"
        class="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-right mb-4">
        {{ initialReadingsError }}
      </p>
```

(g) `next()` — add validation for the new step inside `next()`:

```js
  if (step.value === 3) {
    const invalid = Object.values(initialReadings.value).some(v =>
      v !== '' && v != null && (!Number.isFinite(Number(v)) || Number(v) < 0))
    if (invalid) {
      toast.value.show('القراءات الافتتاحية يجب أن تكون أرقاماً موجبة', 'error')
      return
    }
  }
```

(h) `create()` — replace the four lines after `const { data } = await api.post('/setup-station/', payload)` (through the success toast) with the write-through logic below (the old `step.value = 4` becomes `5`):

```js
    const { data } = await api.post('/setup-station/', payload)
    result.value = data.created || data
    stationName.value = data.station
    initialReadingsError.value = ''
    const typed = Object.keys(initialReadings.value)
      .filter(k => initialReadings.value[k] !== '' && initialReadings.value[k] != null)
      .map(k => ({ idx: Number(k), value: Number(initialReadings.value[k]) }))
    if (typed.length) {
      const returned = data.meters || []
      if (returned.length !== meterSlots.value.length) {
        initialReadingsError.value = 'تم إنشاء المحطة — تعذر مطابقة العدادات المنشأة مع المعاينة، لن تُحفظ القراءات الافتتاحية. أدخلها من صفحة المحطة'
      } else {
        const failures = []
        for (const t of typed) {
          try {
            await api.put(`/meters/${returned[t.idx].name}/`, { current_reading: t.value })
          } catch (e) {
            const code = meterSlots.value[t.idx]?.code || returned[t.idx].meter_code
            failures.push(`على عدّاد ${code}: ${friendlyError(e)}`)
          }
        }
        if (failures.length) {
          initialReadingsError.value = `تم إنشاء المحطة — تعذر حفظ القراءات الافتتاحية ${failures.join('؛ ')}. أدخلها من صفحة المحطة`
        }
      }
    }
    step.value = 5
    toast.value.show('تم إنشاء المحطة بنجاح')
```

(`catch`, `finally { creating.value = false }` and the outer `try` stay as they are; the old `step.value = 4` line is removed.)

(i) `reset()` — add `initialReadings.value = {}` and `initialReadingsError.value = ''` next to `step.value = 0`.

- [ ] **Step 4: Build the SPA**

```bash
cd /root/projects/Sejel/sejel/frontend && npm run build
```

Expected: vite finishes without errors and writes `../staticfiles/vue/index.html`.

- [ ] **Step 5: Re-run the e2e script**

```bash
cd /root/projects/Sejel/sejel/e2e-tests && node qa-initial-readings.js
```

Expected: exit `0`, `SUMMARY: 11 passed, 0 failed` (Part A steps: login, guns listed, created without notice, fixture resolved, 8 guns, reading_count=0, two values, no baseline rows, prev on readings screen, employee refused, cleanup).

- [ ] **Step 6: Commit**

```bash
cd /root/projects/Sejel
git add sejel/frontend/src/views/stations/StationSetupWizard.vue sejel/e2e-tests/qa-initial-readings.js
git -c user.name="Sejel QA" -c user.email="qa@sejel.ly" commit -m "wizard: optional initial-readings step writes counters after setup"
```

---

### Task 4: station-page initial-readings panel (frontend + e2e Part B)

**Files:**
- Modify: `/root/projects/Sejel/sejel/frontend/src/views/stations/StationDetail.vue`
- Modify: `/root/projects/Sejel/sejel/e2e-tests/qa-initial-readings.js` (insert Part B before the cleanup block)

**Interfaces:**
- Consumes: Task 1 (guard refuses locked writes), Task 2 (`reading_count` on `/meters/`), `api.put`, `friendlyError`, `useAuthStore` (`stores/auth.js` getter `role` ∈ `admin|manager|finance|supervisor`), `window.confirm` (auto-accepted by `helpers.launch`).
- Produces: `data-testid="initial-reading-input"`, `data-testid="force-initial"`, `data-testid="save-initial-readings"`; per-meter save semantics (one refusal never blocks the others).

- [ ] **Step 1: Extend the e2e script with Part B (it must fail first)**

In `qa-initial-readings.js`:
1. add `qaEnsureShift` to the `require('./qa')` destructuring on line 2:
   `const { uiLogin, qaFill, qaStationId, qaDelete, qaEnsureShift } = require('./qa')`
2. insert the block below **above** the `// ---------- cleanup` block:

```js
  // ======================== Part B: station panel ========================
  const withValue = meters.find((m) => Number(m.current_reading) === V1)
  const forced = meters.find((m) => Number(m.current_reading) === V2)
  const unset = meters.find((m) => Number(m.current_reading) === 0)
  step('SETUP: wizard left a set gun, a second set gun and an unset gun',
    !!withValue && !!forced && !!unset,
    JSON.stringify({ set: withValue && withValue.meter_code, unset: unset && unset.meter_code }))

  // 1. first reading on top of the initial value → real sale, then the gun locks
  const today = new Date().toISOString().slice(0, 10)
  const ensured = await qaEnsureShift(page, ST, today, { shift_name: 'مناوبة القراءات الافتتاحية ' + Date.now() })
  step('SETUP: open shift exists for today', ensured.ok, JSON.stringify(ensured))

  const saved = await apiPost(page, 'meter-readings/', {
    shift: ensured.id, meter: withValue.name, start_reading: V1, end_reading: V1 + 100,
  })
  step('API: first reading saved on top of the initial value',
    !!saved.name || saved.__status === undefined, JSON.stringify(saved).slice(0, 140))
  const row = await apiGet(page, `meter-readings/${saved.name}/`)
  step('API: 100 L booked as a real sale, not an opening baseline',
    Number(row.liters_sold) === 100 && !Number(row.is_opening),
    JSON.stringify({ liters: row.liters_sold, is_opening: row.is_opening }))

  // 2. the guard: another value on the locked gun is refused, value untouched
  const blocked = await apiPut(page, `meters/${withValue.name}/`, { current_reading: V1 + 555 })
  step('GUARD: admin PUT refused on the locked gun',
    blocked.__status !== undefined, JSON.stringify(blocked).slice(0, 140))
  const afterBlocked = await apiGet(page, `meters/${withValue.name}/`)
  step('GUARD: counter still equals the last end_reading',
    Number(afterBlocked.current_reading) === V1 + 100, String(afterBlocked.current_reading))

  // 3. panel states
  await goto(page, `stations/${ST}`)
  await page.waitForTimeout(900)
  await page.locator('button', { hasText: 'العدادات' }).click()
  await page.waitForTimeout(500)
  const panelBody = await page.locator('body').innerText()
  step('UI: locked gun shows «مقفلة بعد أول قراءة»', panelBody.includes('مقفلة بعد أول قراءة'))
  step('UI: save button absent until something changes',
    (await page.locator('[data-testid="save-initial-readings"]').count()) === 0)
  const forceCount = await page.locator('[data-testid="force-initial"]').count()
  step('UI: تجاوز offered only on the set-but-unlocked gun', forceCount === 1, `buttons=${forceCount}`)
  await shot(page, 'initial-readings-panel')

  // 4. force flow on the V2 gun
  await page.locator('[data-testid="force-initial"]').first().click() // confirm auto-accepted
  await page.waitForTimeout(300)
  const unlockedInputs = page.locator('[data-testid="initial-reading-input"]')
  const unlockedCount = await unlockedInputs.count()
  step('UI: force unlocks an input for that gun', unlockedCount >= 1, `inputs=${unlockedCount}`)
  const newForcedValue = V2 + 7
  await unlockedInputs.first().fill(String(newForcedValue))
  step('UI: save button appears when a value changed',
    (await page.locator('[data-testid="save-initial-readings"]').count()) === 1)
  await page.locator('[data-testid="save-initial-readings"]').click()
  await page.waitForTimeout(1500)
  const forcedAfter = await apiGet(page, `meters/${forced.name}/`)
  step('API: forced value saved', Number(forcedAfter.current_reading) === newForcedValue,
    String(forcedAfter.current_reading))

  // 5. per-meter independence: locked gun refused, unlocked gun saved
  const stillLocked = await apiPut(page, `meters/${withValue.name}/`, { current_reading: 777777 })
  const resync = await apiPut(page, `meters/${forced.name}/`, { current_reading: newForcedValue + 1 })
  step('SEMANTICS: locked refused while unlocked saved in the same round',
    stillLocked.__status !== undefined && resync.__status === undefined,
    JSON.stringify({ locked: stillLocked.__status, unlocked: resync.__status }))
```

- [ ] **Step 2: Run it to verify Part B fails**

```bash
cd /root/projects/Sejel/sejel/e2e-tests && node qa-initial-readings.js
```

Expected: Part A passes, then `UI: locked gun shows «مقفلة بعد أول قراءة» — FAIL` (no panel yet), exit `1`. If an earlier step aborts, remove leftovers before retrying:

```bash
cd /root/projects/Sejel/sejel/e2e-tests && node -e "
const { launch, login, apiGet } = require('./helpers'); const { qaDelete } = require('./qa');
(async () => {
  const { browser, page } = await launch(); await login(page);
  const all = (await apiGet(page, 'stations/?limit_page_length=0')).results || [];
  for (const s of all.filter(x => (x.station_name || '').startsWith('محطة القراءات الافتتاحية'))) {
    console.log(s.station_name, JSON.stringify(await qaDelete(page, 'stations', s.name)));
  }
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1) })"
```

- [ ] **Step 3: Implement the panel in `StationDetail.vue`**

(a) imports — after `import api from '../../api'` (line 141):

```js
import { friendlyError } from '../../errors'
import { useAuthStore } from '../../stores/auth'
```

(b) state (after `const activeTab = ref('islands')`):

```js
const auth = useAuthStore()
const canEditReadings = computed(() => ['admin', 'manager'].includes(auth.role))
const initialDrafts = ref({})
const forcedMeters = ref({})
const savingInitial = ref(false)
const initialMessage = ref(null)
```

(c) split the meter loading out of `onMounted` so it can be re-run after a save — replace the three meter lines (186–192) and add helpers below `tankColor`:

```js
function applyMeters(allMeters) {
  const islandNames = islands.value.map(i => i.name)
  meters.value = allMeters.filter(m => {
    const mach = machines.value.find(x => x.name === m.machine)
    return mach && islandNames.includes(mach.island)
  })
}

async function reloadMeters() {
  const res = await api.get('/meters/')
  applyMeters(res.data.results || res.data)
}
```

and in `onMounted`, replace `const allMeters = ...` through `meters.value = allMeters.filter(...)` with `applyMeters(mtRes.data.results || mtRes.data)`.

(d) derived state + actions, after `reloadMeters`:

```js
const isLocked = (m) => m.reading_count === undefined || m.reading_count === null || Number(m.reading_count) > 0
const hasInitial = (m) => Number(m.current_reading || 0) !== 0

const panelState = (m) => {
  if (isLocked(m)) return 'locked'
  if (!canEditReadings.value) return 'readonly'
  if (forcedMeters.value[m.name]) return 'editing'
  return hasInitial(m) ? 'set' : 'editable'
}

const pendingInitial = computed(() => meters.value.filter(m => {
  const d = initialDrafts.value[m.name]
  return d !== undefined && d !== '' && !Number.isNaN(Number(d)) && Number(d) !== Number(m.current_reading || 0)
}))

const askForce = (m) => {
  const old = Number(m.current_reading || 0).toLocaleString('en-US')
  if (!window.confirm(`سيتم استبدال القراءة الافتتاحية ${old} — لا توجد قراءات محفوظة على هذا العداد. هل أنت متأكد؟`)) return
  forcedMeters.value = { ...forcedMeters.value, [m.name]: true }
  initialDrafts.value = { ...initialDrafts.value, [m.name]: String(m.current_reading || 0) }
}

const cancelForce = (m) => {
  const next = { ...forcedMeters.value }
  delete next[m.name]
  forcedMeters.value = next
}

const saveInitialReadings = async () => {
  savingInitial.value = true
  initialMessage.value = null
  const failures = []
  for (const m of pendingInitial.value) {
    try {
      await api.put(`/meters/${m.name}/`, { current_reading: Number(initialDrafts.value[m.name]) })
      const d = { ...initialDrafts.value }; delete d[m.name]; initialDrafts.value = d
      const f = { ...forcedMeters.value }; delete f[m.name]; forcedMeters.value = f
    } catch (e) {
      failures.push(`${m.meter_code}: ${friendlyError(e)}`)
    }
  }
  await reloadMeters()
  initialMessage.value = failures.length
    ? { type: 'error', text: failures.length === 1 ? `تعذر حفظ: ${failures[0]}` : `تعذر حفظ على ${failures.length} عدادات — ${failures.join('؛ ')}` }
    : { type: 'ok', text: 'تم حفظ القراءات الافتتاحية' }
  savingInitial.value = false
}
```

(e) template — inside the meters tab, after the header row (after line 78, before `<table ...>`), insert:

```html
        <div v-if="meters.length && meters.some(m => !isLocked(m))" class="border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 class="font-bold text-sm">القراءات الافتتاحية</h4>
              <p class="text-xs text-gray-500">اقرأ قراءة العدّار الفعلية عند التسليم — بعد حفظ أول قراءة يقفل العداد نهائياً</p>
            </div>
            <button v-if="pendingInitial.length" data-testid="save-initial-readings" @click="saveInitialReadings"
              :disabled="savingInitial"
              class="bg-primary text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
              {{ savingInitial ? 'جاري الحفظ...' : 'حفظ القراءات الافتتاحية' }}
            </button>
          </div>

          <div v-for="m in meters" :key="'init-' + m.name"
            class="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3 first:border-t-0 first:pt-0">
            <span class="font-mono font-medium text-sm w-16">{{ m.meter_code }}</span>
            <span class="text-xs text-gray-500 flex-1 min-w-0 truncate">{{ fuelMap[m.fuel_type] || m.fuel_type }}</span>

            <template v-if="panelState(m) === 'locked'">
              <span class="text-sm tabular-nums">{{ Number(m.current_reading || 0).toLocaleString('en-US') }}</span>
              <span class="badge badge-gray text-xs">مقفلة بعد أول قراءة</span>
            </template>

            <template v-else-if="panelState(m) === 'readonly'">
              <span class="text-sm tabular-nums">{{ Number(m.current_reading || 0).toLocaleString('en-US') }}</span>
            </template>

            <template v-else-if="panelState(m) === 'editing'">
              <input v-model="initialDrafts[m.name]" data-testid="initial-reading-input" type="number" min="0" step="0.001"
                class="w-36 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <button type="button" @click="cancelForce(m)" class="text-xs text-gray-500 hover:underline">إلغاء</button>
            </template>

            <template v-else-if="panelState(m) === 'set'">
              <span class="text-sm tabular-nums">{{ Number(m.current_reading || 0).toLocaleString('en-US') }}</span>
              <button type="button" data-testid="force-initial" @click="askForce(m)"
                class="text-xs text-amber-700 border border-amber-300 rounded-lg px-3 py-1.5 hover:bg-amber-50">تجاوز</button>
            </template>

            <template v-else>
              <input v-model="initialDrafts[m.name]" data-testid="initial-reading-input" type="number" min="0" step="0.001"
                class="w-36 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0" />
            </template>
          </div>

          <p v-if="initialMessage" data-testid="initial-readings-message"
            :class="initialMessage.type === 'error' ? 'text-sm text-red-600' : 'text-sm text-green-600'">
            {{ initialMessage.text }}
          </p>
        </div>
```

- [ ] **Step 4: Build the SPA**

```bash
cd /root/projects/Sejel/sejel/frontend && npm run build
```

Expected: vite succeeds, `../staticfiles/vue/index.html` rewritten.

- [ ] **Step 5: Re-run the e2e script**

```bash
cd /root/projects/Sejel/sejel/e2e-tests && node qa-initial-readings.js
```

Expected: exit `0`, `SUMMARY: 24 passed, 0 failed` (Part A 11 + Part B 13) and the cleanup steps green (station gone afterwards).

- [ ] **Step 6: Commit**

```bash
cd /root/projects/Sejel
git add sejel/frontend/src/views/stations/StationDetail.vue sejel/e2e-tests/qa-initial-readings.js
git -c user.name="Sejel QA" -c user.email="qa@sejel.ly" commit -m "station: initial-readings panel with تجاوز force button"
```

---

### Task 5: full regression — 15 suites / 295 steps

**Files:** none (read-only run). Any failure caused by this feature must be fixed in Tasks 1–4 code, never by editing an approved suite.

- [ ] **Step 1: Run the approved set in order**

```bash
cd /root/projects/Sejel/sejel/e2e-tests
for s in qa-round4-fixture qa-phase3-readings qa-phase4-finance qa-phase5-inventory \
         qa-phase6-reports qa-phase7-responsive qa-phase8-journey qa-cycle-matrix \
         qa-exceptions-matrix qa-harness-safety qa-transfer-test qa-round4-isolation \
         qa-round4-cycle qa-round4-mobile qa-round4-reset; do
  echo "=== $s ==="; node $s.js || echo "!!! $s FAILED"
done
```

Expected: every `SUMMARY:` line shows `0 failed`; grand total **295 steps, 0 failures** (38+19+14+42+13+16+8+25+35+12+14+33+12+10+4).

- [ ] **Step 2: If anything fails, diagnose before touching anything**

Known interaction points (none of them belong to the 15 suites):
- `qa-repair-counters.js` — repairs drift → must still work thanks to the re-sync allowance (Task 1). Verify manually: `node qa-repair-counters.js "محطة الراحلة 23"` should report `fixed 0` and exit 0 without rewriting anything (its counters already agree).
- `qa-acceptance-reset.js`, `qa-cleanup-phase8.js` — both delete their readings **before** rewinding counters, so the guard passes.
- `qa-create-fixtures.js` / `qa-create-acceptance-station.js` — create meters with a counter (insert path, allowed).

Re-run the failing suite alone, read the failing step name, and decide: bug in our code (fix Tasks 1–4, rebuild/restart, re-run) vs unrelated pre-existing failure (record it — do not weaken the assertion).

- [ ] **Step 3: Re-run the new script once more to prove re-runnability**

```bash
node qa-initial-readings.js && node qa-initial-readings.js
```

Expected: two consecutive `0 failed` runs (the script creates and deletes its own station).

- [ ] **Step 4: Note the exact step count of `qa-initial-readings.js`** for the coverage table in Task 6 (`grep -c 'step(' qa-initial-readings.js` is an upper bound; use the `SUMMARY` number from the run).

---

### Task 6: documentation

**Files:**
- Modify: `/root/projects/Sejel/DOCUMENTATION.md`
- Modify: `/root/projects/Sejel/docs/BUSINESS_INVARIANTS.md`
- Modify: `/root/projects/Sejel/docs/PILOT_HANDOFF_AR.md`

- [ ] **Step 1: `DOCUMENTATION.md` §6.3 `PUT /api/{resource}/{name}/` (line ~803)**

After the existing update description add:

```markdown
**Meter counter rule:** `current_reading` may only be set while the meter has
no `Meter Reading` rows. Once rows exist, only a write equal to the last
`end_reading` (±0.001) is accepted (cache re-sync); anything else is refused
with 417 and the Arabic message «لا يمكن تعديل القراءة الافتتاحية للعداد …».
Roles: only `Sejel Manager` / `System Manager` hold Meter write (DocPerm).
```

- [ ] **Step 2: `DOCUMENTATION.md` §6.4 Resource Mapping (line ~815)**

In the `meters` row's notes add: `rows also carry reading_count (number of Meter Reading rows; used by the station initial-readings panel)`.

- [ ] **Step 3: `DOCUMENTATION.md` §6.5 `POST /api/setup-station/` (line ~857)**

Add to the response example/notes:

```markdown
- `meters`: array of `{"name": <docname>, "meter_code": <code>}` in generation
  order (island → pump → gun). Empty when `meters_per_machine` is 0. Codes are
  returned rather than assumed because a second station gets `M01AX`-style
  codes after the global dedupe.
```

- [ ] **Step 4: `DOCUMENTATION.md` §7.1 Station Setup (line ~1023)**

Append: the wizard now has an optional «القراءات الافتتاحية» step (between tanks and review) that writes each gun's counter through `PUT /api/meters/<name>/` right after creation; skipped guns can be filled later from the station page («العدادات» tab → «القراءات الافتتاحية» panel, «تجاوز» rewrites an initial value only while the gun has zero readings).

- [ ] **Step 5: `docs/BUSINESS_INVARIANTS.md`**

- §6.2 (line ~247) — append this clause:

```markdown
**Initial value rule (2026-10-05):** `meter.current_reading` may be written by
an admin/owner only while the meter has **zero** reading rows; after the first
reading the rows are the only source of truth (a write equal to the last
`end_reading` is still allowed — that is a cache re-sync, not an edit).
Covers invariant 6.2 with the wizard step, the station panel and «تجاوز».
```

- Test Coverage Summary (line ~326):
  - replace the sentence `there are zero test_*.py files in the app` with: `unit tests exist for the meter counter guard and the setup/enricher endpoints (see rows below); everything else is browser-driven`
  - add rows:

```markdown
| Meter counter guard (initial value / lock) | `test_meter.py` (`bench run-tests --module sejel_app.sejel_app.doctype.meter.test_meter`) | 5 |
| setup `meters[]` + `reading_count` | `api/test_views_meter.py` (`… --module sejel_app.api.test_views_meter`) | 3 |
| Wizard step + station panel + تجاوز | `qa-initial-readings.js` | 24 (11 Part A + 13 Part B — confirm against the run's `SUMMARY`) |
```

and update the total line to `295 + 24 = 319` browser steps plus 8 unit tests.

- [ ] **Step 6: `docs/PILOT_HANDOFF_AR.md`**

- §3 «قراءات المضخات» — add an Arabic subsection:

```markdown
### 3.1 القراءات الافتتاحية (جديد)

- **أثناء إنشاء المحطة:** ظهرت خطوة «القراءات الافتتاحية» بين الخزانات
  والمراجعة — أدخل قراءة كل مسدس الفعلية (اختياري، يمكن التخطي).
- **بعد الإنشاء:** من صفحة المحطة ← تبويب «العدادات» ← لوحة
  «القراءات الافتتاحية»: أدخل القيم ثم «حفظ القراءات الافتتاحية».
- **«تجاوز»:** لتغيير قيمة محفوظة — لا يعمل إلا قبل أول قراءة على العداد،
  ويطلب تأكيداً. بعد أول قراءة يظهر العداد «مقفلة بعد أول قراءة» ولا يمكن
  تغييره إلا بتصحيح القراءة نفسها (للقصحيح من أدوات الصيانة).
- الصلاحية: المدير (admin) والمالك (manager) فقط.
```

- §7 «تشغيل الاختبارات» — add the line:

```bash
node qa-initial-readings.js    # القراءات الافتتاحية (المعالج + لوحة المحطة)
```

- [ ] **Step 7: Commit docs**

```bash
cd /root/projects/Sejel
git add DOCUMENTATION.md docs/BUSINESS_INVARIANTS.md docs/PILOT_HANDOFF_AR.md
git -c user.name="Sejel QA" -c user.email="qa@sejel.ly" commit -m "docs: initial readings — API rule, invariants, coverage, Arabic handoff"
```

---

### Task 7: final verification, push, client acceptance handoff

- [ ] **Step 1: Everything is live with no stale processes**

```bash
systemctl is-active sejel-bench.service        # active
cd /root/projects/Sejel/sejel/frontend && npm run build
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8004/   # 200
```

- [ ] **Step 2: Re-run the new script + one sanity suite after the final build**

```bash
cd /root/projects/Sejel/sejel/e2e-tests
node qa-initial-readings.js && node qa-round4-isolation.js
```

Expected: both `0 failed`.

- [ ] **Step 3: Push both repos**

```bash
cd /root/projects/Sejel && git status --porcelain && git push origin master
cd /home/frappe/bench/apps/sejel_app && git status --porcelain && git push origin develop
```

Expected: both clean after push, 0 ahead / 0 behind.

- [ ] **Step 4: Hand the client their test script**

Send (Arabic, from §6 of the spec) — the client tests on the live site while **their own station `محطة الراحلة 23` stays untouched**:

1. أنشئ محطة تجريبية عبر «إعداد محطة» واكتب القراءات في خطوة «القراءات الافتتاحية» (اترك مسدساً واحداً فارغاً عمداً).
2. افتح صفحة المحطة ← تبويب «العدادات»: تحقق من القيم، استخدم «تجاوز» على مسدس واحد وأكّد التغيير.
3. سجّل أول قراءة وتأكد أن «القراءة السابقة» هي ما كتبته واللترات محسوبة (ليست صفر).
4. عد إلى لوحة العدادات: المسدس الذي سُجلت قراءته يجب أن يظهر «مقفلة بعد أول قراءة» بلا زر «تجاوز»، والمسدس الذي تخطيته ما زال قابلاً للإدخال.
5. أرسل لنا ملاحظاتك (الأسماء غير الواضحة، الحقول الناقصة، أي رسالة غامضة) — سنصححها قبل الإطلاق.

- [ ] **Step 5: Report back**

Summarise for the user: commits (both repos), suite totals (295 + new), unit test counts, and the client-test checklist status.
