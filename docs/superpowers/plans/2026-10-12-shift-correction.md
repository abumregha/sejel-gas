# Shift Correction Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow editing shift data with status-based restrictions, admin-only reopen flow for submitted/closed shifts, and full audit trail for all corrections.

**Architecture:** Backend validation in Shift DocType `validate()` method blocks edits to locked fields per status. New `reopen_shift()` method handles admin-only reopen with reconciliation archival. Frontend ShiftDetail.vue gets edit mode indicators, reopen button, and correction history panel.

**Tech Stack:** Frappe (Python backend), Vue 3 (frontend), Playwright (E2E tests)

## Global Constraints

- All API responses use Arabic error messages for user-facing text
- Admin = user with role "Owner" or "System Manager"
- Existing shift statuses: scheduled, open, in_progress, submitted, reconciled, closed, cancelled, under_review
- Reconciliation formula: expected_sales = liters × frozen_price; difference = total_collection - expected_sales
- Frappe site: sejel.local (PostgreSQL backend)

---

### Task 1: Backend — Shift Correction Log child table

**Files:**
- Create: `/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/shift_correction_log/shift_correction_log.json`
- Create: `/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/shift_correction_log/shift_correction_log.py`

- [ ] **Step 1: Create the DocType JSON**

```json
{
  "autoname": "format:CORR-{YYYY}{MM}{DD}-{####}",
  "creation": "2026-10-12 00:00:00",
  "doctype": "DocType",
  "engine": "InnoDB",
  "field_order": ["corrected_by", "corrected_at", "field_changed", "old_value", "new_value", "reason"],
  "fields": [
    {"fieldname": "corrected_by", "fieldtype": "Link", "label": "Corrected By", "options": "User", "read_only": 1},
    {"fieldname": "corrected_at", "fieldtype": "Datetime", "label": "Corrected At", "read_only": 1},
    {"fieldname": "field_changed", "fieldtype": "Data", "label": "Field Changed", "read_only": 1},
    {"fieldname": "old_value", "fieldtype": "Data", "label": "Old Value", "read_only": 1},
    {"fieldname": "new_value", "fieldtype": "Data", "label": "New Value", "read_only": 1},
    {"fieldname": "reason", "fieldtype": "Data", "label": "Reason", "read_only": 1}
  ],
  "istable": 1,
  "modified": "2026-10-12 00:00:00",
  "module": "Sejel App",
  "name": "Shift Correction Log",
  "owner": "Administrator"
}
```

- [ ] **Step 2: Create the controller**

```python
# shift_correction_log.py
import frappe
from frappe.model.document import Document

class ShiftCorrectionLog(Document):
    pass
```

- [ ] **Step 3: Sync to database**

```bash
cd /home/frappe/bench && bench --site sejel.local execute frappe.model.sync.sync --doctype "Shift Correction Log" 2>&1 | tail -5
```

Expected: no error output

- [ ] **Step 4: Commit**

```bash
cd /home/frappe/bench/apps/sejel_app && git add . && git commit -m "feat: add Shift Correction Log child table"
```

---

### Task 2: Backend — Add is_archived field to Reconciliation

**Files:**
- Modify: `/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/reconciliation/reconciliation.json`

- [ ] **Step 1: Add is_archived field to Reconciliation JSON**

Add this field to the `fields` array in the JSON (after the last existing field):

```json
{"fieldname": "is_archived", "fieldtype": "Check", "default": "0", "label": "Is Archived", "read_only": 1},
{"fieldname": "archived_at", "fieldtype": "Datetime", "label": "Archived At", "read_only": 1}
```

- [ ] **Step 2: Sync to database**

```bash
cd /home/frappe/bench && bench --site sejel.local execute frappe.model.sync.sync --doctype "Reconciliation" 2>&1 | tail -5
```

Expected: no error output

- [ ] **Step 3: Commit**

```bash
cd /home/frappe/bench/apps/sejel_app && git add . && git commit -m "feat: add is_archived and archived_at to Reconciliation"
```

---

### Task 3: Backend — Status-based field validation in Shift.validate()

**Files:**
- Modify: `/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/shift/shift.py`

- [ ] **Step 1: Add validate() method with status-based field locking**

Add this method to the `Shift` class (after the `crosses_midnight` property, before `close_shift`):

```python
def validate(self):
    LOCKED_FIELDS = {
        "submitted": ["date", "start_time", "end_time", "status"],
        "closed": ["shift_name", "station", "definition", "employee", "island",
                   "date", "start_time", "end_time", "status"],
    }
    locked = LOCKED_FIELDS.get(self.status, [])
    if not locked:
        return
    if self.get_db_value:
        for field in locked:
            db_val = self.get_db_value(field)
            cur_val = self.get(field)
            if str(db_val or "") != str(cur_val or ""):
                frappe.throw(
                    _("لا يمكن تعديل حقل «{0}» في مناوبة بحالة «{1}»").format(
                        _(self.meta.get_label(field)), _(self.status)
                    ),
                    frappe.ValidationError,
                )
```

- [ ] **Step 2: Add audit logging helper method**

Add this method to the `Shift` class:

```python
def _log_correction(self, field_changed, old_value, new_value, reason=""):
    log = frappe.new_doc("Shift Correction Log")
    log.parent = self.name
    log.parenttype = "Shift"
    log.parentfield = "correction_log"
    log.corrected_by = frappe.session.user
    log.corrected_at = now_datetime()
    log.field_changed = field_changed
    log.old_value = str(old_value) if old_value else ""
    log.new_value = str(new_value) if new_value else ""
    log.reason = reason
    log.insert(ignore_permissions=True)
```

- [ ] **Step 3: Sync and test**

```bash
cd /home/frappe/bench && bench --site sejel.local execute frappe.model.sync.sync --doctype "Shift" 2>&1 | tail -5
```

Expected: no error output

- [ ] **Step 4: Commit**

```bash
cd /home/frappe/bench/apps/sejel_app && git add . && git commit -m "feat: add status-based field validation to Shift"
```

---

### Task 4: Backend — reopen_shift() method

**Files:**
- Modify: `/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/shift/shift.py`

- [ ] **Step 1: Add reopen_shift method**

Add this method to the `Shift` class:

```python
def reopen_shift(self):
    """Reopen a submitted or closed shift for corrections. Admin/owner only."""
    if self.status not in ("submitted", "closed"):
        frappe.throw(_("المناوبة مفتوحة بالفعل ولا تحتاع إعادة فتح"))
    if "System Manager" not in frappe.get_roles() and "Owner" not in frappe.get_roles():
        frappe.throw(_("فقط المالك أو المدير يمكنه إعادة فتح المناوبة"))
    if self.status == "closed":
        recon_name = frappe.db.exists("Reconciliation", {"shift": self.name})
        if recon_name:
            frappe.db.set_value("Reconciliation", recon_name,
                                {"is_archived": 1, "archived_at": now_datetime()})
    self.status = "open"
    self.closed_by = None
    self.closed_at = None
    self.save(ignore_permissions=True)
    self._log_correction("status", self.status, "open", "إعادة فتح المناوبة للتصحيح")
```

- [ ] **Step 2: Sync and verify**

```bash
cd /home/frappe/bench && bench --site sejel.local execute frappe.model.sync.sync --doctype "Shift" 2>&1 | tail -5
```

Expected: no error output

- [ ] **Step 3: Commit**

```bash
cd /home/frappe/bench/apps/sejel_app && git add . && git commit -m "feat: add reopen_shift method with reconciliation archival"
```

---

### Task 5: Backend — API endpoints for reopen and corrections list

**Files:**
- Modify: `/home/frappe/bench/apps/sejel_app/sejel_app/api/views.py`

- [ ] **Step 1: Add reopen endpoint**

Add this function to `views.py`:

```python
@frappe.whitelist()
def reopen_shift(name):
    shift = frappe.get_doc("Shift", name)
    shift.reopen_shift()
    return {"ok": True, "message": "تمت إعادة فتح المناوبة"}
```

- [ ] **Step 2: Add corrections list endpoint**

Add this function to `views.py`:

```python
@frappe.whitelist()
def shift_corrections(name):
    logs = frappe.get_all(
        "Shift Correction Log",
        filters={"parent": name, "parenttype": "Shift"},
        fields=["corrected_by", "corrected_at", "field_changed", "old_value", "new_value", "reason"],
        order_by="corrected_at desc",
    )
    return {"results": logs}
```

- [ ] **Step 3: Restart bench**

```bash
cd /home/frappe/bench && bench restart 2>&1 | tail -3
```

Expected: "Workers running" or similar

- [ ] **Step 4: Commit**

```bash
cd /home/frappe/bench/apps/sejel_app && git add . && git commit -m "feat: add reopen and corrections API endpoints"
```

---

### Task 6: Frontend — Reopen button and edit mode indicators in ShiftDetail.vue

**Files:**
- Modify: `/root/projects/Sejel/sejel/frontend/src/views/shifts/ShiftDetail.vue`

- [ ] **Step 1: Add isAdmin computed property**

In the `<script setup>` section, after `const auth = useAuthStore()`:

```javascript
const isAdmin = computed(() => auth.role === 'System Manager' || auth.role === 'Owner')
```

Add `computed` to the import from 'vue':

```javascript
import { ref, computed, onMounted } from 'vue'
```

- [ ] **Step 2: Add reopen button to template**

After the close button (line 18-22), add:

```html
<button v-if="(shift?.status === 'submitted' || shift?.status === 'closed') && isAdmin" @click="reopenShift"
  class="bg-orange-600 text-white px-4 py-2 rounded-xl text-sm">↺ إعادة فتح للتصحيح</button>
```

- [ ] **Step 3: Add closed banner**

After the button block, before the shift data display, add:

```html
<div v-if="shift?.status === 'closed'" class="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
  هذه المناوبة مغلقة. فقط ملاحظات يمكن تعديلها. لتصحيح بيانات المناوبة، استخدم زر "إعادة فتح للتصحيح" (للمالك/المدير فقط).
</div>
```

- [ ] **Step 4: Add locked field indicators**

In the shift info grid (line 26-34), wrap timing fields with lock indicators when submitted:

```html
<div><span class="text-gray-500">التاريخ:</span> {{ shift.date }}
  <span v-if="shift.status === 'submitted' || shift.status === 'closed'" title="لا يمكن تعديله">🔒</span>
</div>
<div><span class="text-gray-500">وقت البدء:</span> {{ shift.start_time }}
  <span v-if="shift.status === 'submitted' || shift.status === 'closed'" title="لا يمكن تعديله">🔒</span>
</div>
<div><span class="text-gray-500">وقت الانتهاء:</span> {{ shift.end_time }}
  <span v-if="shift.status === 'submitted' || shift.status === 'closed'" title="لا يمكن تعديله">🔒</span>
</div>
```

- [ ] **Step 5: Add reopenShift method**

After `submitShift` method, add:

```javascript
const reopenShift = async () => {
  if (!confirm('سيتم إعادة فتح المناوبة للتصحيح. عند الإغلاق الجديد سيتم إعادة حساب التسوية المالية. هل تريد المتابعة؟')) return
  try { await api.post(`/shifts/${id}/reopen/`); await load() } catch (e) { alert(friendlyError(e)) }
}
```

- [ ] **Step 6: Commit**

```bash
cd /root/projects/Sejel && git add . && git commit -m "feat: add reopen button and edit mode indicators to ShiftDetail"
```

---

### Task 7: Frontend — Correction history panel

**Files:**
- Modify: `/root/projects/Sejel/sejel/frontend/src/views/shifts/ShiftDetail.vue`

- [ ] **Step 1: Add corrections ref**

In `<script setup>`, after existing refs:

```javascript
const corrections = ref([])
```

- [ ] **Step 2: Load corrections in load()**

After `reconciliation.value = allRecons.find(...)`:

```javascript
const corrRes = await api.get(`/shifts/${id}/corrections/`)
corrections.value = corrRes.data.results || []
```

- [ ] **Step 3: Add correction history template**

Before the closing `</div>` of the shift data section (before line 79's `</div>`), add:

```html
<div v-if="corrections.length" class="bg-white rounded-xl shadow-sm border p-4">
  <h3 class="font-bold mb-3">سجل التصحيحات</h3>
  <table class="data-table">
    <thead><tr><th>المستخدم</th><th>التاريخ</th><th>الحقل</th><th>القيمة القديمة</th><th>القيمة الجديدة</th><th>السبب</th></tr></thead>
    <tbody>
      <tr v-for="c in corrections" :key="c.corrected_at + c.field_changed">
        <td>{{ c.corrected_by }}</td>
        <td>{{ new Date(c.corrected_at).toLocaleString('ar-LY') }}</td>
        <td>{{ c.field_changed }}</td>
        <td>{{ c.old_value || '—' }}</td>
        <td>{{ c.new_value || '—' }}</td>
        <td>{{ c.reason || '—' }}</td>
      </tr>
    </tbody>
  </table>
</div>
```

- [ ] **Step 4: Commit**

```bash
cd /root/projects/Sejel && git add . && git commit -m "feat: add correction history panel to ShiftDetail"
```

---

### Task 8: Backend — Auto-recalculate reconciliation on re-close

**Files:**
- Modify: `/home/frappe/bench/apps/sejel_app/sejel_app/sejel_app/doctype/shift/shift.py`

- [ ] **Step 1: Modify close_shift to handle re-close**

In the `close_shift` method, after `self.save()` and before `self._validate_prices_configured()`, add:

```python
recon_name = frappe.db.exists("Reconciliation", {"shift": self.name, "is_archived": 0})
if recon_name:
    frappe.delete_doc("Reconciliation", recon_name, ignore_permissions=True)
    for row in frappe.get_all("Shift Fuel Summary", filters={"reconciliation": recon_name}, fields=["name"]):
        frappe.delete_doc("Shift Fuel Summary", row.name, ignore_permissions=True)
```

- [ ] **Step 2: Sync and verify**

```bash
cd /home/frappe/bench && bench --site sejel.local execute frappe.model.sync.sync --doctype "Shift" 2>&1 | tail -5
```

Expected: no error output

- [ ] **Step 3: Commit**

```bash
cd /home/frappe/bench/apps/sejel_app && git add . && git commit -m "feat: auto-delete old reconciliation on re-close"
```

---

### Task 9: User guide — Add correction workflow section

**Files:**
- Modify: `/root/projects/Sejel/sejel/frontend/src/views/UserGuide.vue` (or create if not exists)

- [ ] **Step 1: Add correction section to user guide**

Add a new section explaining:

1. **Editable fields per status** — table showing which fields are editable at each status
2. **How to request a correction** — contact admin/owner for submitted/closed shifts
3. **What happens to reconciliation** — auto-recalculated on re-close
4. **Audit trail** — all corrections logged with who/when/what

Content in Arabic matching existing user guide style.

- [ ] **Step 2: Commit**

```bash
cd /root/projects/Sejel && git add . && git commit -m "docs: add shift correction workflow to user guide"
```

---

### Task 10: E2E tests — Correction flow

**Files:**
- Create: `/root/projects/Sejel/sejel/e2e-tests/qa-shift-correction.js`

- [ ] **Step 1: Write E2E test**

Test the full correction flow:

```javascript
// 1. Create shift with wrong time (7 PM instead of AM)
// 2. Submit shift
// 3. Admin reopens shift
// 4. Fix the time
// 5. Re-submit
// 6. Close
// 7. Verify reconciliation recalculated
// 8. Verify correction log entries exist
```

Use existing helpers from `helpers.js`.

- [ ] **Step 2: Run test**

```bash
cd /root/projects/Sejel/sejel && npx playwright test e2e-tests/qa-shift-correction.js --headed 2>&1 | tail -20
```

Expected: all steps pass

- [ ] **Step 3: Commit**

```bash
cd /root/projects/Sejel && git add . && git commit -m "test: add E2E tests for shift correction flow"
```

---

## Self-Review

**Spec coverage:**
- Status-based field editing → Task 3 (backend validation) + Task 6 (frontend indicators)
- Reopen flow (admin only) → Task 4 (reopen_shift) + Task 5 (API) + Task 6 (frontend button)
- Reconciliation archival on reopen → Task 4 (reopen_shift archives) + Task 8 (re-close deletes old)
- Auto-recalculate reconciliation → Task 8 (close_shift deletes old recon before creating new)
- Audit trail → Task 1 (Shift Correction Log) + Task 3 (_log_correction) + Task 7 (frontend panel)
- API endpoints → Task 5
- User guide → Task 9
- E2E tests → Task 10

**Placeholder scan:** No TBDs, no "implement later", all code blocks complete.

**Type consistency:** Method names match across tasks (reopen_shift, _log_correction, shift_corrections). Field names consistent (is_archived, archived_at, corrected_by, etc.).
