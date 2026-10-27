# Unified Shipment Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two confusing «إضافة شحنة» forms with one smart Vue form (type toggle + progressive disclosure), link scheduled shipments to their arriving loads, and fix the silent defects behind the customer's "form is too complex" report.

**Architecture:** One new Vue component (`ShipmentForm.vue`) serves create/edit/arrival for both DocTypes (`Shipment Schedule` / `Delivery`). Backend gets a `Delivery.shipment_schedule` Link + a `Shipment Schedule.supplier` field and controller guards enforcing the one-to-one arrival link. The monthly report already joins `Shipment Schedule.delivery → Delivery`, so writing that link during arrival fixes report merging with no report-code change.

**Tech Stack:** Vue 3 SPA (Composition API, vue-router, axios, Tailwind classes), Frappe/ERPNext backend (`sejel_app` app), FrappeTestCase, Playwright-based QA scripts, Vite build.

**Spec:** `docs/superpowers/specs/2026-10-27-shipment-form-unification-design.md`

## Global Constraints

- Two git repos: SPA+docs in `/root/projects/Sejel` (this repo); backend in `/home/frappe/bench/apps/sejel_app` (separate repo — commit there too, no shared commits).
- Backend runs with `--noreload` (`sejel-bench.service`, site `sejel.local`) → **restart the service after every Python change**: `sudo systemctl restart sejel-bench`.
- Bench commands must run as user `frappe`: `cd /home/frappe/bench && sudo -u frappe bench --site sejel.local <cmd>`.
- SPA build: `cd /root/projects/Sejel/sejel/frontend && npm run build` → outputs to `sejel/staticfiles/vue` (nginx root for port 8004). No other deploy step.
- Frontend: no new npm dependencies; Arabic UI strings exactly as written in steps; match existing file style (Tailwind classes like `border border-gray-300 rounded-lg px-4 py-2.5`, `text-sm font-medium text-gray-700 mb-1`).
- Backend: tab indentation (existing `.py` style); JSON files use the indentation already present in each file (delivery.json = 1 space for fields, shipment_schedule.json = 2 spaces).
- Commits: conventional style used by each repo (`feat:`/`fix:`/`docs:`/`test:`).
- QA site: SPA at `http://localhost:8004`, API proxied to `127.0.0.1:8002` (site `sejel.local`).

---

### Task 1: Backend DocType fields + list fields

Adds `Delivery.shipment_schedule` (Link → Shipment Schedule) and `Shipment Schedule.supplier` (Link → Marketing Company), exposes both in the generic list API.

**Files:**
- Modify: `/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/delivery/delivery.json`
- Modify: `/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/shipment_schedule/shipment_schedule.json`
- Modify: `/home/frappe/bench/apps/sejel_app/sejel_app/api/views.py:37,40` (RESOURCES)

**Interfaces:**
- Produces: fieldname `shipment_schedule` on Delivery (consumed by Task 2 guards and Task 3 form payload); fieldname `supplier` on Shipment Schedule (consumed by Task 3 payload); list endpoints return `tank`, `shipment_schedule` (deliveries) and `supplier` (shipment-schedules).

- [ ] **Step 1: Add `shipment_schedule` to delivery.json**

In `delivery.json` (1-space indent style), append `"shipment_schedule"` to `field_order` (line 6, after `"is_unscheduled"`), and add the field object after the `is_unscheduled` field block (after line 147):

field_order becomes:

```json
 "field_order": ["station", "tank", "fuel_type", "supplier", "requested_quantity", "expected_quantity", "received_quantity", "shortage", "order_date", "arrival_date", "scheduled_date", "pre_reading", "post_reading", "document_number", "invoice_number", "invoiced_amount", "paid_amount", "payment_date", "payment_reference", "payment_status", "status", "is_unscheduled", "shipment_schedule", "total_allocated", "remaining_on_truck"],
```

new field block (same 2-space inner indent as the `is_unscheduled` block):

```json
    {
      "fieldname": "shipment_schedule",
      "fieldtype": "Link",
      "label": "Shipment Schedule",
      "options": "Shipment Schedule"
    },
```

- [ ] **Step 2: Add `supplier` to shipment_schedule.json**

In `shipment_schedule.json` (2-space indent), line 6, insert `"supplier"` after `"fuel_type"`:

```json
  "field_order": ["station", "deposit", "invoice_number", "fuel_type", "supplier", "quantity", "expected_shipping_date", "status", "unit_price", "total_amount", "delivery", "serial_number", "notes"],
```

and insert this field object after the `fuel_type` field block (after line 38):

```json
    {
      "fieldname": "supplier",
      "fieldtype": "Link",
      "label": "Supplier",
      "options": "Marketing Company"
    },
```

- [ ] **Step 3: Expose new fields in RESOURCES (`views.py`)**

Line 37 — replace:

```python
	"deliveries": ("Delivery", ["name", "station", "fuel_type", "supplier", "expected_quantity", "received_quantity", "shortage", "invoice_number", "payment_status", "status", "order_date", "arrival_date", "scheduled_date", "is_unscheduled", "modified"]),
```

with:

```python
	"deliveries": ("Delivery", ["name", "station", "tank", "fuel_type", "supplier", "expected_quantity", "received_quantity", "shortage", "invoice_number", "payment_status", "status", "order_date", "arrival_date", "scheduled_date", "is_unscheduled", "shipment_schedule", "modified"]),
```

Line 40 — replace:

```python
	"shipment-schedules": ("Shipment Schedule", ["name", "station", "deposit", "invoice_number", "fuel_type", "quantity", "expected_shipping_date", "status", "unit_price", "total_amount", "delivery", "serial_number", "notes", "modified"]),
```

with:

```python
	"shipment-schedules": ("Shipment Schedule", ["name", "station", "deposit", "invoice_number", "fuel_type", "supplier", "quantity", "expected_shipping_date", "status", "unit_price", "total_amount", "delivery", "serial_number", "notes", "modified"]),
```

- [ ] **Step 4: Migrate the site and restart the service**

```bash
cd /home/frappe/bench && sudo -u frappe bench --site sejel.local migrate
sudo systemctl restart sejel-bench
```

Expected: migrate completes with no error; `systemctl is-active sejel-bench` → `active`.

- [ ] **Step 5: Verify columns exist**

```bash
cd /home/frappe/bench && sudo -u frappe bench --site sejel.local mariadb -e "SHOW COLUMNS FROM \`tabDelivery\` LIKE 'shipment_schedule'; SHOW COLUMNS FROM \`tabShipment Schedule\` LIKE 'supplier';"
```

Expected: two result sets, each with one row.

- [ ] **Step 6: Commit (backend repo)**

```bash
git -C /home/frappe/bench/apps/sejel_app add sejel_app/sejel_app/doctype/delivery/delivery.json sejel_app/sejel_app/doctype/shipment_schedule/shipment_schedule.json sejel_app/api/views.py
git -C /home/frappe/bench/apps/sejel_app commit -m "feat: add shipment_schedule link on Delivery and supplier on Shipment Schedule"
```

---

### Task 2: Backend controller guards + tests

Enforces: invoice Arabic error, create-time status lock, delivered-requires-link, one-to-one arrival link with field copying.

**Files:**
- Modify: `/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/shipment_schedule/shipment_schedule.py`
- Modify: `/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/delivery/delivery.py`
- Create: `/home/frappe/bench/apps/sejel_app/sejel_app/tests/test_shipment_link.py`

**Interfaces:**
- Consumes: `Delivery.shipment_schedule`, `Shipment Schedule.supplier` (Task 1).
- Produces: `ShipmentSchedule.validate()` throws «اختر الفاتورة / الإيداع قبل الحفظ» when `invoice_number` empty; forces `status='scheduled'` on insert; throws «لا يمكن اعتماد حالة «مُسلّمة» دون ربط الشحنة الواردة (زر استلام)» when `status == 'delivered'` without `delivery`. `Delivery.link_schedule()` copies `invoice_number`/`fuel_type`/`supplier`/`scheduled_date` from the schedule when empty and throws «تم تسجيل استلام هذه الشحنة المجدولة مسبقاً» if the schedule is already linked to another delivery. Task 3 relies on these exact messages.

- [ ] **Step 1: Write the failing test file**

Create `/home/frappe/bench/apps/sejel_app/sejel_app/tests/test_shipment_link.py`:

```python
import frappe
from frappe.tests.utils import FrappeTestCase


class TestShipmentArrivalLink(FrappeTestCase):
	"""The scheduled line (PR-15-F-05) and its arriving load are one pair.

	The unified shipment form records an arrival as Delivery.shipment_schedule
	set; the guards keep that link one-to-one so the monthly report merges a
	scheduled row with its load instead of double-counting both.
	"""

	def setUp(self):
		suffix = frappe.utils.random_string(5)
		self.fuel = frappe.get_doc(
			{"doctype": "Fuel Type", "fuel_name": "بنزين QA " + suffix}
		).insert(ignore_permissions=True)
		self.station = frappe.get_doc(
			{"doctype": "Station", "station_name": "محطة QA " + suffix}
		).insert(ignore_permissions=True)

	def _schedule(self, **over):
		data = {
			"doctype": "Shipment Schedule",
			"station": self.station.name,
			"invoice_number": "INV-" + frappe.utils.random_string(4),
			"fuel_type": self.fuel.name,
			"quantity": 40000,
			"expected_shipping_date": "2026-10-01",
		}
		data.update(over)
		return frappe.get_doc(data).insert(ignore_permissions=True)

	def _delivery(self, sched):
		return frappe.get_doc({
			"doctype": "Delivery",
			"station": self.station.name,
			"shipment_schedule": sched.name,
			"requested_quantity": 40000,
			"expected_quantity": 40000,
			"order_date": "2026-10-02 08:00:00",
			"pre_reading": 100000,
			"post_reading": 139900,
		}).insert(ignore_permissions=True)

	def test_create_forces_scheduled_status(self):
		s = self._schedule(status="cancelled")
		self.assertEqual(s.status, "scheduled")

	def test_missing_invoice_arabic_error(self):
		with self.assertRaises(frappe.ValidationError) as cm:
			self._schedule(invoice_number="")
		self.assertIn("اختر الفاتورة", str(cm.exception))

	def test_delivered_requires_linked_delivery(self):
		s = self._schedule()
		s.status = "delivered"
		with self.assertRaises(frappe.ValidationError) as cm:
			s.save()
		self.assertIn("مُسلّمة", str(cm.exception))

	def test_delivery_copies_schedule_fields(self):
		s = self._schedule()
		d = frappe.get_doc({
			"doctype": "Delivery",
			"station": self.station.name,
			"shipment_schedule": s.name,
			"requested_quantity": 40000,
			"expected_quantity": 40000,
			"order_date": "2026-10-02 08:00:00",
			"pre_reading": 100000,
			"post_reading": 139900,
		}).insert(ignore_permissions=True)
		self.assertEqual(d.invoice_number, s.invoice_number)
		self.assertEqual(d.fuel_type, s.fuel_type)
		self.assertEqual(str(d.scheduled_date), "2026-10-01")
		s.reload()
		s.delivery = d.name
		s.status = "delivered"
		s.save()
		self.assertEqual(s.status, "delivered")

	def test_double_arrival_rejected(self):
		s = self._schedule()
		d1 = self._delivery(s)
		s.reload()
		s.delivery = d1.name
		s.status = "delivered"
		s.save()
		with self.assertRaises(frappe.ValidationError) as cm:
			self._delivery(s)
		self.assertIn("تم تسجيل استلام", str(cm.exception))
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
cd /home/frappe/bench && sudo -u frappe bench --site sejel.local run-tests --module sejel_app.tests.test_shipment_link
```

Expected: FAIL — `AttributeError`/assertion errors (guards not implemented yet; e.g. `test_create_forces_scheduled_status` gets `cancelled` instead of `scheduled`).

- [ ] **Step 3: Rewrite shipment_schedule.py**

Full file:

```python
import frappe
from frappe.model.document import Document


class ShipmentSchedule(Document):
	def validate(self):
		self.sync_invoice_number()
		self.validate_invoice_number()
		self.enforce_create_status()
		self.validate_delivered_requires_delivery()
		self.calculate_total()

	def sync_invoice_number(self):
		if self.deposit:
			dep = frappe.get_doc("Station Deposit", self.deposit)
			self.invoice_number = dep.invoice_number
			self.station = dep.station

	def validate_invoice_number(self):
		if not self.invoice_number:
			frappe.throw("اختر الفاتورة / الإيداع قبل الحفظ")

	def enforce_create_status(self):
		if self.is_new():
			self.status = "scheduled"

	def validate_delivered_requires_delivery(self):
		if self.status == "delivered" and not self.delivery:
			frappe.throw("لا يمكن اعتماد حالة «مُسلّمة» دون ربط الشحنة الواردة (زر استلام)")

	def calculate_total(self):
		qty = float(self.quantity or 0)
		price = float(self.unit_price or 0)
		self.total_amount = qty * price
```

Note: `sync_invoice_number` runs **before** the invoice guard so a deposit selection always satisfies it.

- [ ] **Step 4: Rewrite delivery.py**

Full file:

```python
import frappe
from frappe.model.document import Document


class Delivery(Document):
	def validate(self):
		self.link_schedule()
		self.calculate_shortage()
		self.validate_delivery_status()

	def link_schedule(self):
		if not self.shipment_schedule:
			return
		if not frappe.db.exists("Shipment Schedule", self.shipment_schedule):
			frappe.throw("جدول الشحنة المحدد غير موجود")
		sched = frappe.get_doc("Shipment Schedule", self.shipment_schedule)
		if sched.delivery and sched.delivery != self.name:
			frappe.throw("تم تسجيل استلام هذه الشحنة المجدولة مسبقاً")
		if not self.invoice_number:
			self.invoice_number = sched.invoice_number
		if not self.fuel_type:
			self.fuel_type = sched.fuel_type
		if not self.supplier:
			self.supplier = sched.supplier
		if not self.scheduled_date:
			self.scheduled_date = sched.expected_shipping_date

	def calculate_shortage(self):
		if self.pre_reading is not None and self.post_reading is not None:
			self.received_quantity = self.post_reading - self.pre_reading
			expected = self.expected_quantity if self.expected_quantity is not None else 0
			self.shortage = max(0, expected - self.received_quantity)
			if self.received_quantity > 0 and self.status not in ("undelivered", "transit"):
				self.status = "received"
		elif self.received_quantity is None:
			self.received_quantity = 0
		if self.shortage is None:
			self.shortage = 0
		return self.shortage

	def validate_delivery_status(self):
		if self.status == "undelivered":
			self.received_quantity = 0
			self.shortage = self.expected_quantity or 0
			self.arrival_date = None
		elif self.status == "transit":
			self.arrival_date = None
		elif self.status == "received" and self.scheduled_date and not self.arrival_date:
			self.arrival_date = frappe.utils.now_datetime()
```

- [ ] **Step 5: Run tests, verify they pass**

```bash
cd /home/frappe/bench && sudo -u frappe bench --site sejel.local run-tests --module sejel_app.tests.test_shipment_link
```

Expected: `OK` / 5 tests pass. If `test_delivery_copies_schedule_fields` fails on `fuel_type`, confirm controller `validate()` runs before mandatory `_validate()` (Frappe `document.py:309-310`) — do not add `fuel_type` to the test payload.

- [ ] **Step 6: Restart service and smoke-test the Arabic invoice error**

```bash
sudo systemctl restart sejel-bench
sleep 3
curl -s -X POST 'http://127.0.0.1:8002/api/method/sejel_app.api.views.crud_list' -H 'Content-Type: application/json' -d '{"resource":"shipment-schedules","station":"X","quantity":1,"expected_shipping_date":"2026-11-01","fuel_type":"X"}' | head -c 400
```

Expected: JSON error containing `اختر الفاتورة` (or auth/permission error if curl is unauthenticated — that also proves the endpoint routes; rely on the unit tests as the source of truth).

- [ ] **Step 7: Commit (backend repo)**

```bash
git -C /home/frappe/bench/apps/sejel_app add sejel_app/sejel_app/doctype/shipment_schedule/shipment_schedule.py sejel_app/sejel_app/doctype/delivery/delivery.py sejel_app/tests/test_shipment_link.py
git -C /home/frappe/bench/apps/sejel_app commit -m "feat: enforce invoice/status guards and one-to-one shipment arrival link"
```

---

### Task 3: Unified `ShipmentForm.vue` + router + remove old forms

One component handles: create scheduled, create unscheduled/direct, arrival recording (linked), and edit of either type. Old create routes map to the same component via `meta.forceType` (URL + query preserved). Old form files deleted.

**Files:**
- Create: `sejel/frontend/src/views/inventory/ShipmentForm.vue`
- Modify: `sejel/frontend/src/router/index.js`
- Modify: `sejel/frontend/src/errors.js` (FIELD_LABELS)
- Delete: `sejel/frontend/src/views/inventory/DeliveryForm.vue`, `sejel/frontend/src/views/inventory/ShipmentScheduleForm.vue`

**Interfaces:**
- Consumes: Task 1 fields (`shipment_schedule`, `supplier`), Task 2 error messages, existing `api.js` client, `friendlyError`.
- Produces: routes `inventory/shipments/create` (name `shipment-create`) and `inventory/shipments/:id` (name `shipment-edit`); create URLs accept `?type=delivery|schedule|arrival&schedule=<name>` + `station`/`date` prefills; old URLs `/inventory/deliveries/create` and `/inventory/shipment-schedules/create` render this component with `meta.forceType`. Task 4 links to all of these.

- [ ] **Step 1: Create `ShipmentForm.vue`**

Create `sejel/frontend/src/views/inventory/ShipmentForm.vue`:

```vue
<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">{{ pageTitle }}</h2>
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{{ error }}</div>
    <div v-if="warning" class="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 mb-4 text-sm">
      {{ warning }}
      <router-link v-if="arrival" :to="`/inventory/shipments/${arrival}?type=schedule`" class="block mt-1 font-semibold underline">فتح جدول الشحنة</router-link>
    </div>
    <div v-if="arrivalDoc" class="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4 text-sm">
      شحنة مجدولة — سطر رقم <strong>{{ arrivalDoc.serial_number ?? '—' }}</strong>، فاتورة <strong>{{ arrivalDoc.invoice_number || '—' }}</strong>
      <router-link :to="`/inventory/shipments/${arrival}?type=schedule`" class="text-primary hover:underline mr-2">عرض الجدول</router-link>
    </div>

    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div v-if="!isEdit && !arrival && !forcedType" class="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
        <button type="button" @click="switchType('schedule')" :class="type === 'schedule' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'" class="py-2 rounded-lg text-sm font-semibold transition">شحنة مجدولة</button>
        <button type="button" @click="switchType('delivery')" :class="type === 'delivery' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'" class="py-2 rounded-lg text-sm font-semibold transition">تسجيل توريد</button>
      </div>

      <div v-if="type === 'schedule'">
        <label class="block text-sm font-medium text-gray-700 mb-1">الفاتورة / الإيداع</label>
        <select v-model="form.deposit" @change="onDepositChange" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">بدون</option>
          <option v-for="dep in deposits" :key="dep.name" :value="dep.name">{{ dep.invoice_number }} — {{ dep.station_name || dep.station }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">اختر المحطة</option>
          <option v-for="s in stations" :key="s.name" :value="s.name">{{ s.station_name || s.name }}</option>
        </select>
      </div>

      <div v-if="type === 'schedule'" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">نوع الوقود</label>
          <select v-model="form.fuel_type" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
            <option value="">اختر النوع</option>
            <option v-for="f in fuelTypes" :key="f.name" :value="f.name">{{ f.fuel_name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">المورد</label>
          <select v-model="form.supplier" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
            <option value="">اختر المورد</option>
            <option v-for="c in companies" :key="c.name" :value="c.name">{{ c.company_name }}</option>
          </select>
        </div>
      </div>

      <div v-else class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">الخزان</label>
          <select v-model="form.tank" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
            <option value="">اختر الخزان</option>
            <option v-for="t in filteredTanks" :key="t.name" :value="t.name">{{ t.tank_name || t.name }} ({{ fuelTypeName(t.fuel_type) }})</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">نوع الوقود</label>
          <input :value="fuelTypeName(form.fuel_type)" readonly class="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-gray-600" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الكمية (لتر)</label>
        <div v-if="type === 'delivery' && !arrival" class="flex gap-2 mb-2">
          <button type="button" @click="form.quantity = 40000" :class="['px-3 py-1.5 rounded-lg text-sm border transition', form.quantity == 40000 ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200']">40,000</button>
          <button type="button" @click="form.quantity = 20000" :class="['px-3 py-1.5 rounded-lg text-sm border transition', form.quantity == 20000 ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200']">20,000</button>
        </div>
        <input v-model.number="form.quantity" type="number" step="0.001" min="0" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>

      <div v-if="type === 'schedule'">
        <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الشحن المتوقع</label>
        <input v-model="form.expected_shipping_date" type="date" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div v-else>
        <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الاستلام الفعلي</label>
        <input v-model="form.arrival_date" type="datetime-local" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        <div v-if="arrivalDoc" class="mt-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">التاريخ المجدول</label>
          <input v-model="form.scheduled_date" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
      </div>

      <div v-if="type === 'schedule'" class="text-sm font-bold text-primary bg-primary/5 p-3 rounded-lg border border-primary/20">
        إجمالي تكلفة الشحنة: <span class="font-mono text-base">{{ totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 }) }}</span> د.ل
      </div>

      <label v-if="arrivalDoc" class="flex items-center gap-2 text-sm text-gray-700">
        <input v-model="confirmArrival" type="checkbox" class="rounded border-gray-300" />
        تأكيد الاستلام (سيتم تحديث حالة الجدول إلى «مُسلّمة»)
      </label>

      <div class="border border-gray-200 rounded-xl">
        <button type="button" @click="showAdvanced = !showAdvanced" class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700">
          <span>خيارات متقدمة</span>
          <span class="text-gray-400">{{ showAdvanced ? '▲' : '▼' }}</span>
        </button>
        <div v-if="showAdvanced" class="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          <template v-if="type === 'schedule'">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                سعر الشراء / التكلفة للتر (د.ل)
                <span class="text-xs font-normal text-gray-400 block">بدقة تصل إلى 8 خانات عشرية (تكلفة التوريد من شركة التسويق)</span>
              </label>
              <input v-model.number="form.unit_price" type="number" step="0.00000001" min="0" placeholder="مثال: 0.14875000" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-mono" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                المسلسل (رقم السطر في النموذج)
                <span class="text-xs font-normal text-gray-400 block">رقم السطر من 1 إلى 15 بنموذج طلب التزويد PR-15-F-05</span>
              </label>
              <input v-model.number="form.serial_number" type="number" min="1" max="15" placeholder="مثال: 1" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-mono" />
            </div>
            <div v-if="isEdit">
              <label class="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
              <select v-model="form.status" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
                <option value="scheduled">مجدولة</option>
                <option value="dispatched">مُرسلة</option>
                <option value="delivered">مُسلّمة</option>
                <option value="undelivered">غير مسلّمة</option>
                <option value="transit">مرحلة</option>
                <option value="cancelled">ملغاة</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
              <textarea v-model="form.notes" rows="2" class="w-full border border-gray-300 rounded-lg px-4 py-2.5"></textarea>
            </div>
          </template>
          <template v-else>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">رقم الفاتورة</label>
              <input v-model="form.invoice_number" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="130167073" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الطلب</label>
              <input v-model="form.order_date" type="datetime-local" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
            </div>
            <label v-if="!arrival" class="flex items-center gap-2 text-sm text-gray-700">
              <input v-model="form.is_unscheduled" type="checkbox" class="rounded border-gray-300" />
              شحنة غير مجدولة / إضافية
            </label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">القراءة قبل</label>
                <input v-model.number="form.pre_reading" type="number" step="0.001" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">القراءة بعد</label>
                <input v-model.number="form.post_reading" type="number" step="0.001" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
              </div>
            </div>
            <div v-if="receivedQty !== null" class="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm">
              <div class="flex justify-between"><span>الكمية المستلمة:</span><strong>{{ receivedQty.toLocaleString('en-US') }} لتر</strong></div>
              <div class="flex justify-between" :class="shortage > 0 ? 'text-red-600' : ''"><span>النقص:</span><strong>{{ shortage.toLocaleString('en-US') }} لتر</strong></div>
              <div v-if="shortage > 0" class="text-xs text-red-500 mt-1">يمكن إنشاء مطالبة نقص بعد الحفظ</div>
            </div>
          </template>
        </div>
      </div>

      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="bg-primary text-white px-6 py-2.5 rounded-lg disabled:opacity-50">
          {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
        </button>
        <router-link :to="type === 'schedule' ? '/inventory/shipment-schedules' : '/inventory/deliveries'" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api'
import { friendlyError } from '../../errors'

const route = useRoute()
const router = useRouter()
const error = ref('')
const warning = ref('')
const saving = ref(false)
const isEdit = computed(() => !!route.params.id)
const forcedType = route.meta.forceType || ''
const arrival = !isEdit.value && route.query.type === 'arrival' && route.query.schedule ? String(route.query.schedule) : ''
const arrivalDoc = ref(null)
const confirmArrival = ref(true)
const showAdvanced = ref(false)
const type = ref('schedule')

function resolveInitialType() {
  if (forcedType) return forcedType
  if (arrival || route.query.type === 'delivery') return 'delivery'
  return 'schedule'
}
type.value = resolveInitialType()

const stations = ref([])
const tanks = ref([])
const fuelTypes = ref([])
const companies = ref([])
const deposits = ref([])

const emptyForm = () => ({
  station: '', tank: '', fuel_type: '', supplier: '', deposit: '',
  quantity: '', invoice_number: '',
  expected_shipping_date: '', order_date: '', arrival_date: '', scheduled_date: '',
  unit_price: '', serial_number: '', status: 'scheduled', notes: '',
  is_unscheduled: false, pre_reading: '', post_reading: '',
})
const form = ref(emptyForm())

const nowLocal = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}
const toLocal = (v) => {
  if (!v) return ''
  const d = new Date(v)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}
const toISO = (v) => v ? new Date(v).toISOString() : undefined
const today = () => new Date().toISOString().slice(0, 10)

const pageTitle = computed(() => {
  if (arrivalDoc.value) return 'تسجيل استلام شحنة مجدولة'
  if (isEdit.value) return type.value === 'schedule' ? 'تعديل الشحنة المجدولة' : 'تعديل الشحنة'
  return type.value === 'schedule' ? 'إضافة شحنة مجدولة' : 'إضافة شحنة (توريد)'
})
const filteredTanks = computed(() => form.value.station ? tanks.value.filter(t => t.station == form.value.station) : tanks.value)
const fuelTypeName = (name) => (fuelTypes.value.find(f => f.name === name) || {}).fuel_name || name || '—'
const totalAmount = computed(() => (Number(form.value.quantity) || 0) * (Number(form.value.unit_price) || 0))
const receivedQty = computed(() => {
  if (type.value !== 'delivery' || form.value.pre_reading === '' || form.value.post_reading === '') return null
  const p = Number(form.value.pre_reading), q = Number(form.value.post_reading)
  return q >= p ? q - p : null
})
const shortage = computed(() => receivedQty.value === null ? 0 : Math.max(0, Number(form.value.quantity || 0) - receivedQty.value))

watch(() => form.value.tank, (tk) => {
  if (type.value !== 'delivery') return
  const t = tanks.value.find(x => x.name === tk)
  if (t) form.value.fuel_type = t.fuel_type
})

function switchType(t) {
  if (type.value === t) return
  type.value = t
  if (t === 'schedule') {
    form.value.tank = ''
    form.value.pre_reading = ''
    form.value.post_reading = ''
    form.value.is_unscheduled = false
    if (!form.value.expected_shipping_date) form.value.expected_shipping_date = today()
  } else {
    form.value.deposit = ''
    form.value.unit_price = ''
    form.value.serial_number = ''
    form.value.notes = ''
    if (!form.value.order_date) form.value.order_date = nowLocal()
    if (!form.value.arrival_date) form.value.arrival_date = nowLocal()
  }
}

function pickSchedule(d) {
  return {
    station: d.station || '', fuel_type: d.fuel_type || '', supplier: d.supplier || '',
    deposit: d.deposit || '', quantity: d.quantity ?? '',
    expected_shipping_date: d.expected_shipping_date || '',
    unit_price: d.unit_price || '', serial_number: d.serial_number ?? '',
    invoice_number: d.invoice_number || '', status: d.status || 'scheduled',
    notes: d.notes || '',
  }
}
function pickDelivery(d) {
  return {
    station: d.station || '', tank: d.tank || '', fuel_type: d.fuel_type || '',
    supplier: d.supplier || '', invoice_number: d.invoice_number || '',
    quantity: d.expected_quantity ?? d.requested_quantity ?? '',
    order_date: toLocal(d.order_date) || nowLocal(),
    arrival_date: toLocal(d.arrival_date),
    scheduled_date: d.scheduled_date || '',
    is_unscheduled: !!d.is_unscheduled,
    pre_reading: d.pre_reading ?? '', post_reading: d.post_reading ?? '',
  }
}

async function loadForEdit() {
  const prefer = route.query.type
  if (prefer !== 'delivery') {
    try {
      const { data } = await api.get(`/shipment-schedules/${route.params.id}/`)
      type.value = 'schedule'
      form.value = { ...emptyForm(), ...pickSchedule(data) }
      return
    } catch (e) {
      if (prefer === 'schedule') throw e
    }
  }
  const { data } = await api.get(`/deliveries/${route.params.id}/`)
  type.value = 'delivery'
  form.value = { ...emptyForm(), ...pickDelivery(data) }
}

async function loadForArrival() {
  const { data } = await api.get(`/shipment-schedules/${arrival}/`)
  arrivalDoc.value = data
  form.value = {
    ...form.value,
    station: data.station || '',
    fuel_type: data.fuel_type || '',
    supplier: data.supplier || '',
    invoice_number: data.invoice_number || '',
    quantity: data.quantity ?? '',
    expected_shipping_date: data.expected_shipping_date || '',
    scheduled_date: data.expected_shipping_date || '',
    order_date: nowLocal(),
    arrival_date: nowLocal(),
  }
  const match = tanks.value.filter(t => t.station === form.value.station && t.fuel_type === form.value.fuel_type)
  if (match.length === 1) form.value.tank = match[0].name
}

async function onDepositChange() {
  const dep = deposits.value.find(d => d.name === form.value.deposit)
  if (!dep) return
  form.value.invoice_number = dep.invoice_number || ''
  form.value.station = dep.station || ''
  if (dep.fuel_product && !form.value.fuel_type) form.value.fuel_type = dep.fuel_product
  if (!isEdit.value) {
    try {
      const { data } = await api.get('/shipment-schedules/', { params: { deposit: dep.name } })
      const existing = data.results || data || []
      const maxSerial = existing.reduce((max, item) => Math.max(max, Number(item.serial_number) || 0), 0)
      if (maxSerial < 15) form.value.serial_number = maxSerial + 1
    } catch (e) {
      if (!form.value.serial_number) form.value.serial_number = 1
    }
  }
}

onMounted(async () => {
  try {
    const [sRes, tRes, fRes, cRes, dRes] = await Promise.all([
      api.get('/stations/'), api.get('/tanks/'), api.get('/fuel-types/'),
      api.get('/marketing-companies/'), api.get('/station-deposits/'),
    ])
    stations.value = sRes.data.results || sRes.data
    tanks.value = tRes.data.results || tRes.data
    fuelTypes.value = fRes.data.results || fRes.data
    companies.value = cRes.data.results || cRes.data
    deposits.value = dRes.data.results || dRes.data

    if (isEdit.value) {
      await loadForEdit()
    } else if (arrival) {
      await loadForArrival()
    } else {
      if (route.query.station) form.value.station = route.query.station
      else if (stations.value.length === 1) form.value.station = stations.value[0].name
      if (route.query.date) {
        if (type.value === 'schedule') form.value.expected_shipping_date = route.query.date
        else {
          form.value.arrival_date = `${route.query.date}T08:00`
          form.value.order_date = `${route.query.date}T08:00`
        }
      }
      if (type.value === 'schedule') {
        if (!form.value.expected_shipping_date) form.value.expected_shipping_date = today()
      } else {
        if (!form.value.arrival_date) form.value.arrival_date = nowLocal()
        if (!form.value.order_date) form.value.order_date = nowLocal()
      }
    }
  } catch (e) {
    error.value = friendlyError(e)
  }
})

const save = async () => {
  error.value = ''
  warning.value = ''
  saving.value = true
  try {
    if (type.value === 'schedule') {
      if (!form.value.deposit && !form.value.invoice_number) {
        error.value = 'اختر الفاتورة / الإيداع قبل الحفظ'
        saving.value = false
        return
      }
      const payload = {
        station: form.value.station,
        fuel_type: form.value.fuel_type,
        deposit: form.value.deposit || undefined,
        supplier: form.value.supplier || undefined,
        invoice_number: form.value.invoice_number || undefined,
        quantity: Number(form.value.quantity) || 0,
        expected_shipping_date: form.value.expected_shipping_date,
        unit_price: Number(form.value.unit_price) || 0,
        serial_number: form.value.serial_number === '' || form.value.serial_number == null ? undefined : Number(form.value.serial_number),
        notes: form.value.notes || undefined,
      }
      if (isEdit.value) payload.status = form.value.status
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])
      if (isEdit.value) await api.put(`/shipment-schedules/${route.params.id}/`, payload)
      else await api.post('/shipment-schedules/', payload)
      router.push('/inventory/shipment-schedules')
      return
    }

    const qty = Number(form.value.quantity) || 0
    const payload = {
      station: form.value.station,
      tank: form.value.tank,
      fuel_type: form.value.fuel_type,
      requested_quantity: qty,
      expected_quantity: qty,
      invoice_number: form.value.invoice_number || undefined,
      order_date: toISO(form.value.order_date) || toISO(nowLocal()),
      arrival_date: toISO(form.value.arrival_date),
      scheduled_date: form.value.scheduled_date || undefined,
      is_unscheduled: arrival ? 0 : (form.value.is_unscheduled ? 1 : 0),
      pre_reading: form.value.pre_reading === '' ? undefined : Number(form.value.pre_reading),
      post_reading: form.value.post_reading === '' ? undefined : Number(form.value.post_reading),
      received_quantity: receivedQty.value === null ? undefined : receivedQty.value,
      shortage: receivedQty.value === null ? undefined : shortage.value,
      shipment_schedule: arrival || undefined,
    }
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])

    let deliveryName = route.params.id
    if (isEdit.value && !arrival) {
      await api.put(`/deliveries/${route.params.id}/`, payload)
    } else {
      const res = await api.post('/deliveries/', payload)
      deliveryName = res.data.name || deliveryName
    }

    if (arrival) {
      const schedPayload = { delivery: deliveryName }
      if (confirmArrival.value) schedPayload.status = 'delivered'
      try {
        await api.put(`/shipment-schedules/${arrival}/`, schedPayload)
      } catch (e) {
        warning.value = 'تم حفظ الشحنة، تعذر تحديث حالة الجدول — حدّثها يدوياً'
        saving.value = false
        return
      }
    }
    router.push('/inventory/deliveries')
  } catch (e) {
    error.value = friendlyError(e)
  } finally {
    saving.value = false
  }
}
</script>
```

- [ ] **Step 2: Wire routes in `router/index.js`**

Replace lines 86–87 (old delivery create/detail area) and line 97 (old schedule create):

At the Inventory section (after line 85 `inventory/deliveries`), replace:

```js
      { path: 'inventory/deliveries/create', name: 'delivery-create', component: () => import('../views/inventory/DeliveryForm.vue') },
```

with:

```js
      { path: 'inventory/deliveries/create', name: 'delivery-create', component: () => import('../views/inventory/ShipmentForm.vue'), meta: { forceType: 'delivery' } },
```

Replace line 97:

```js
      { path: 'inventory/shipment-schedules/create', name: 'shipment-schedule-create', component: () => import('../views/inventory/ShipmentScheduleForm.vue') },
```

with:

```js
      { path: 'inventory/shipment-schedules/create', name: 'shipment-schedule-create', component: () => import('../views/inventory/ShipmentForm.vue'), meta: { forceType: 'schedule' } },
      { path: 'inventory/shipments/create', name: 'shipment-create', component: () => import('../views/inventory/ShipmentForm.vue') },
      { path: 'inventory/shipments/:id', name: 'shipment-edit', component: () => import('../views/inventory/ShipmentForm.vue') },
```

(`shipments/create` must be declared before `shipments/:id`.)

- [ ] **Step 3: Add Arabic field labels to `errors.js`**

In `sejel/frontend/src/errors.js` `FIELD_LABELS`, add:

```js
  invoice_number: 'رقم الفاتورة', supplier: 'المورد', serial_number: 'المسلسل',
  shipment_schedule: 'جدول الشحنة', deposit: 'الفاتورة / الإيداع',
```

- [ ] **Step 4: Delete old form files**

```bash
git -C /root/projects/Sejel rm sejel/frontend/src/views/inventory/DeliveryForm.vue sejel/frontend/src/views/inventory/ShipmentScheduleForm.vue
```

- [ ] **Step 5: Build to verify compilation**

```bash
cd /root/projects/Sejel/sejel/frontend && npm run build
```

Expected: vite build succeeds with no errors. If router references a deleted file remain (`grep -rn "DeliveryForm\|ShipmentScheduleForm" sejel/frontend/src` → hits), fix them before continuing.

- [ ] **Step 6: Commit (Sejel repo)**

```bash
cd /root/projects/Sejel && git add sejel/frontend/src && git commit -m "feat: unified shipment form with type toggle, progressive disclosure, and arrival flow"
```

---

### Task 4: Lists and entry points

Points every «إضافة شحنة» entry at the unified form, adds the «استلام» arrival action, fixes the dead edit link, shows the linked schedule serial on deliveries.

**Files:**
- Modify: `sejel/frontend/src/views/inventory/ShipmentScheduleList.vue`
- Modify: `sejel/frontend/src/views/inventory/DeliveryList.vue`
- Modify: `sejel/frontend/src/components/dashboard/QuickActions.vue:24,34`
- Modify: `sejel/frontend/src/views/dashboard/DashboardView.vue:375`

**Interfaces:**
- Consumes: Task 3 routes; Task 1 list fields (`tank`, `shipment_schedule` on deliveries).
- Produces: links `shipment-create?type=schedule`, `?type=delivery`, `?type=arrival&schedule=<name>`, `shipments/:id?type=schedule`.

- [ ] **Step 1: ShipmentScheduleList.vue — header, arrival action, edit link**

Line 5 — replace the header link target:

```vue
      <router-link to="/inventory/shipments/create?type=schedule" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة شحنة</router-link>
```

Lines 21–23 — replace the actions `<td>` content:

```vue
            <td class="whitespace-nowrap">
              <router-link v-if="['scheduled','dispatched'].includes(s.status)" :to="`/inventory/shipments/create?type=arrival&schedule=${s.name}`" class="text-green-700 hover:underline text-xs font-semibold ml-2">استلام</router-link>
              <router-link :to="`/inventory/shipments/${s.name}?type=schedule`" class="text-primary hover:underline text-xs font-semibold">تعديل</router-link>
            </td>
```

- [ ] **Step 2: DeliveryList.vue — header, schedule-serial column**

Line 5 — replace header link:

```vue
      <router-link to="/inventory/shipments/create?type=delivery" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة شحنة</router-link>
```

Line 9 — add a column header `الجدول` before `</tr>`:

```vue
        <thead><tr><th>التاريخ</th><th>المحطة</th><th>الخزان</th><th>النوع</th><th>المتوقع</th><th>المستلم</th><th>النقص</th><th>الجدول</th></tr></thead>
```

After the shortage `<td>` (line 19–20) add:

```vue
            <td class="font-mono text-xs">{{ d.shipment_schedule ? (schedMap[d.shipment_schedule] || 'مجدول') : '—' }}</td>
```

In the script, add `const schedMap = ref({})`, fetch schedules in the existing `Promise.all` (`api.get('/shipment-schedules/')`), and build:

```js
  schedMap.value = Object.fromEntries((ssRes.data.results || ssRes.data).map(s => [s.name, s.serial_number != null ? `#${s.serial_number}` : s.name]))
```

- [ ] **Step 3: QuickActions.vue**

Line 24 — replace `to`:

```js
  { label: 'إضافة شحنة', icon: 'island', to: '/inventory/shipments/create?type=delivery', roles: ['supervisor', 'manager'] },
```

Line 34 — replace the special case:

```js
    if (a.to.startsWith('/inventory/shipments/create')) return `${a.to}&station=${props.stationId}`
```

- [ ] **Step 4: DashboardView.vue**

Line 375 — replace the link:

```vue
                <router-link :to="`/inventory/shipments/create?type=delivery&station=${data.station?.id || ''}&date=${selectedDate}`" class="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition font-medium">
```

- [ ] **Step 5: Build + grep for stale create links**

```bash
cd /root/projects/Sejel/sejel/frontend && npm run build && grep -rn "deliveries/create\|shipment-schedules/create" src --include=*.vue --include=*.js
```

Expected: build passes. Remaining hits must be only `router/index.js` route definitions (allowed as legacy aliases) — any `.vue` hit pointing at old create URLs as *navigation* is a miss to fix. (`DeliveryDetail.vue` back-links to the list are fine.)

- [ ] **Step 6: Commit (Sejel repo)**

```bash
cd /root/projects/Sejel && git add sejel/frontend/src && git commit -m "feat: point shipment entry points to unified form and add arrival action"
```

---

### Task 5: User guide update

**Files:**
- Modify: `sejel/frontend/src/views/guide/GuideView.vue` (section id 7, line ~86)

- [ ] **Step 1: Update guide §7.1 and add the arrival flow**

Replace the `§7` first paragraph:

```js
    <p><strong>1. حجز وجدولة شحنة:</strong> من <strong>المخزون ← جدول الشحنات</strong> اضغط <strong>+ إضافة شحنة</strong> واختر <strong>«شحنة مجدولة»</strong>، ثم فاتورة الإيداع وحدد تاريخ الشحن المتوقع والكمية. الحقول التفصيلية (سعر الشراء، المسلسل، ملاحظات) موجودة في <strong>خيارات متقدمة</strong>.</p>
    <p><strong>2. تسجيل الوصول الفعلي:</strong> عندما تصل الشحنة فعلياً اضغط <strong>استلام</strong> أمام السطر في قائمة جدول الشحنات، أدخل الخزان وقراءات العداد (إن وجدت) ثم احفظ — يُربط السطر تلقائياً بالشحنة الواردة ويتحول إلى <strong>«مُسلّمة»</strong> مع خصم القيمة من رصيد الإيداع.</p>
```

Renumber the following `<p>` items in that section: old «2. توضيح حقل المسلسل» → «3.»، old «3. سعر الشراء» → «4.»، old «4. حالات الشحنات» → «5.» (edit only the leading number inside each `<p>`).

- [ ] **Step 2: Build + Commit**

```bash
cd /root/projects/Sejel/sejel/frontend && npm run build
cd /root/projects/Sejel && git add sejel/frontend/src/views/guide/GuideView.vue && git commit -m "docs: guide covers unified shipment form and arrival flow"
```

Expected: build passes.

---

### Task 6: QA update, full verification, final commit

**Files:**
- Modify: `sejel/e2e-tests/qa-phase5-inventory.js`

**Interfaces:**
- Consumes: everything from Tasks 1–5, built SPA (Task 3/5 builds already deployed to `staticfiles/vue`).

- [ ] **Step 1: Extend imports in qa-phase5-inventory.js**

Line 12 — replace with:

```js
const { appendRun, capture, uiLogin, bodyText, defect, shot, step, summary, launch, apiGet, apiPost, qaFillField, qaDelete, qaStationId } = require('./qa')
```

- [ ] **Step 2: Add new routes to the sweep**

In `INVENTORY_ROUTES` add:

```js
  ['/inventory/shipments/create', 'إضافة شحنة موحدة'],
  ['/inventory/shipments/create?type=delivery', 'إضافة توريد'],
```

- [ ] **Step 3: Adapt Part B fill steps to the unified form**

Replace the fill block (lines ~97–105) — the old dual quantity fields no longer exist and readings live behind the advanced toggle:

```js
    await qaFillField(page, 'المحطة', EDGE)
    await page.waitForTimeout(1000)
    await qaFillField(page, 'الخزان', 'خزان 1')
    await qaFillField(page, 'رقم الفاتورة', invoice)
    await qaFillField(page, 'الكمية (لتر)', '5000')
    const advBtnB = page.locator('button', { hasText: 'خيارات متقدمة' }).first()
    if (await advBtnB.count()) { await advBtnB.click(); await page.waitForTimeout(400) }
    await qaFillField(page, 'القراءة قبل', '100000')
    await qaFillField(page, 'القراءة بعد', '104900')
```

Keep the existing assertion (invoice field value) but also record the single-quantity behavior in the appendRun text: expected == requested == 5000 in the created record.

- [ ] **Step 4: Add Part D — scheduled create via deposit, arrival link, edit route**

Append before the final `appendRun('## Phase 5 — network ≥400 (all)'` block:

```js
  // ---------- Part D: unified form — scheduled create + arrival link ----------
  const schedInvoice = 'QA-SCH-' + Date.now().toString().slice(-6)
  const edgeId = await qaStationId(page, EDGE)
  const fuelList = await apiGet(page, 'fuel-types/?limit_page_length=1')
  const fuelName = ((fuelList && fuelList.results) || [])[0]?.name
  const dep = (edgeId && fuelName) ? await apiPost(page, 'station-deposits/', {
    station: edgeId, invoice_number: schedInvoice,
    invoice_date: new Date().toISOString().slice(0, 10),
    fuel_product: fuelName, deposit_amount: 500000,
  }) : null
  const depName = dep && dep.name
  step('deposit created (scheduled-shipment preconditions)', !!depName, depName ? String(depName) : JSON.stringify(dep || {}).slice(0, 200))

  let createdSched = null
  if (depName) {
    await page.goto((process.env.QA_BASE || 'http://localhost:8004') + '/inventory/shipments/create', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)
    await qaFillField(page, 'الفاتورة / الإيداع', schedInvoice)
    await page.waitForTimeout(1200)
    await qaFillField(page, 'الكمية (لتر)', '30000')
    const advBtnD = page.locator('button', { hasText: 'خيارات متقدمة' }).first()
    if (await advBtnD.count()) { await advBtnD.click(); await page.waitForTimeout(400) }
    await qaFillField(page, 'سعر الشراء / التكلفة للتر (د.ل)', '0.14875000').catch(() => {})
    const serialInput = page.locator("xpath=//label[contains(., 'المسلسل')]/following::input[1]").first()
    const serialSuggested = await serialInput.inputValue().catch(() => '')
    step('serial auto-suggested from deposit', serialSuggested === '1', `serial field=${serialSuggested || '(empty)'}`)
    await page.locator('button', { hasText: /حفظ/ }).first().click()
    await page.waitForTimeout(2500)
    const ssList = await apiGet(page, 'shipment-schedules/?limit_page_length=0')
    createdSched = ((ssList && ssList.results) || []).find(x => x.invoice_number === schedInvoice) || null
    step('scheduled shipment persisted via unified form', !!createdSched,
      createdSched ? `name=${createdSched.name} serial=${createdSched.serial_number} status=${createdSched.status} qty=${createdSched.quantity} price=${createdSched.unit_price}` : 'not found')
    if (createdSched) {
      step('created with locked status scheduled', createdSched.status === 'scheduled', `status=${createdSched.status}`)
      step('deposit auto-filled supplier/station/invoice', createdSched.invoice_number === schedInvoice && createdSched.station === edgeId,
        `invoice=${createdSched.invoice_number} station=${createdSched.station}`)
    }

    // arrival link
    if (createdSched) {
      await page.goto((process.env.QA_BASE || 'http://localhost:8004') + '/inventory/shipment-schedules', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1500)
      const row = page.locator('tr', { hasText: schedInvoice }).first()
      const arriveBtn = row.locator('a', { hasText: 'استلام' }).first()
      step('استلام action on scheduled row', (await arriveBtn.count()) > 0)
      if (await arriveBtn.count()) {
        await arriveBtn.click()
        await page.waitForTimeout(1500)
        const bannerTxt = await bodyText(page)
        step('arrival banner shows schedule line', /شحنة مجدولة/.test(bannerTxt))
        await qaFillField(page, 'الخزان', 'خزان 1')
        const advBtnA = page.locator('button', { hasText: 'خيارات متقدمة' }).first()
        if (await advBtnA.count()) { await advBtnA.click(); await page.waitForTimeout(400) }
        await qaFillField(page, 'القراءة قبل', '200000')
        await qaFillField(page, 'القراءة بعد', '229950')
        await page.locator('button', { hasText: /حفظ/ }).first().click()
        await page.waitForTimeout(3000)
        const schedAfter = await apiGet(page, 'shipment-schedules/' + createdSched.name + '/')
        step('schedule flipped to delivered + linked', schedAfter.status === 'delivered' && !!schedAfter.delivery,
          `status=${schedAfter.status} delivery=${schedAfter.delivery}`)
        const delivAfter = schedAfter.delivery ? await apiGet(page, 'deliveries/' + schedAfter.delivery + '/') : null
        step('delivery back-links shipment_schedule', !!delivAfter && delivAfter.shipment_schedule === createdSched.name,
          `link=${delivAfter && delivAfter.shipment_schedule} received=${delivAfter && delivAfter.received_quantity}`)
        if (schedAfter.delivery) {
          await qaDelete(page, 'deliveries', schedAfter.delivery)
        }
        await qaDelete(page, 'shipment-schedules', createdSched.name)
        await qaDelete(page, 'station-deposits', depName)
      }
    }
  }

  // edit route
  if (createdSched) {
    await page.goto((process.env.QA_BASE || 'http://localhost:8004') + '/inventory/shipments/' + createdSched.name + '?type=schedule', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)
    const editText = await bodyText(page)
    step('schedule edit route renders edit form', /تعديل الشحنة/.test(editText), JSON.stringify(editText.replace(/\s+/g, ' ').slice(0, 160)))
  }
```

- [ ] **Step 5: Run the QA suite**

```bash
cd /root/projects/Sejel/sejel/e2e-tests && node qa-phase5-inventory.js
```

Expected: no `FATAL`; `step(...)` lines for Parts A–D pass. Inspect `qa-checkpoints/qa-run-log.md` for failures. If baseline defects already existed before this work (note pre-existing entries), do not claim them as regressions — record which steps are new.

- [ ] **Step 6: Backend tests + final builds (full sweep)**

```bash
cd /home/frappe/bench && sudo -u frappe bench --site sejel.local run-tests --module sejel_app.tests.test_shipment_link
cd /root/projects/Sejel/sejel/frontend && npm run build
grep -rn "DeliveryForm\|ShipmentScheduleForm" /root/projects/Sejel/sejel/frontend/src --include=*.vue --include=*.js
```

Expected: tests OK; build passes; grep returns nothing.

- [ ] **Step 7: Smoke via HTTP**

```bash
curl -s http://localhost:8004/api/shipment-schedules/ | head -c 200
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8004/app/inventory/shipments/create
```

Expected: JSON (or auth-gated JSON error) from API; `200` from the SPA route (nginx `try_files` → index.html).

- [ ] **Step 8: Commit QA updates (Sejel repo)**

```bash
cd /root/projects/Sejel && git add sejel/e2e-tests/qa-phase5-inventory.js && git commit -m "test: cover unified shipment form, arrival link, and edit route"
```

---

## Self-Review Notes

- Spec §3 (form UX) → Task 3; §4 (backend) → Tasks 1–2; report-join requirement is satisfied without `reports.py` changes because the report already merges on `Shipment Schedule.delivery` (`reports.py:647`), which the arrival flow now writes — spec's "date-match fallback" is the existing orphan-row append.
- Spec §5 → Tasks 3–4; §6 errors → Task 3 save guards + Task 2 Arabic throws + Task 3 `errors.js` labels; §7 tests → Tasks 2 and 6; §8 out-of-scope respected (no Stock Entry UI, no scheduler, no report rewrite).
- One deliberate deviation from spec wording: old create routes use `meta.forceType` (same component rendered at the legacy URL) instead of a HTTP/router redirect — preserves bookmarks and `?station=`/`?date=` queries intact.
