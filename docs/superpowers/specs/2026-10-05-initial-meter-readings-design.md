# Initial meter readings (القراءات الافتتاحية) — design

**Date:** 2026-10-05
**Status:** approved for implementation
**Problem:** after creating a station the end user has no supported place to
enter each gun's physical counter. The only path today is to generate a day
shift and type the counters through the readings screen, which books them as
`is_opening` baseline rows inside that shift (observed on `محطة الراحلة 23`,
8 rows inside `إقفال يوم 2026-10-05`). It needs a shift, pollutes a day the
user has not opened yet, and nothing tells them it is the intended flow.

## 1. Scope

In scope:
- New optional wizard step «القراءات الافتتاحية» between tanks and review.
- Meters panel on the station page (existing station, e.g. theirs today).
- Initial-value writes through the existing `PUT /api/meters/<name>/`, with a
  zero-readings guard at the model layer (see §2.1).
- «تجاوز» (force) button to replace an initial value that was already saved,
  permitted only while the meter still has zero readings.
- New e2e script + doc updates.

Out of scope:
- Editing or deleting saved `Meter Reading` rows (rejected: the counter is
  derived state — `meter_reading.py:124` rewrites it on save, `:147`
  recomputes it on delete — so overwriting the cache alone is reverted and
  desyncs continuity; correcting a saved reading is a separate feature).
- Forcing an overwrite on a meter that already has readings.
- Tank opening levels: already editable at `/tanks/:id/edit`
  (`Tank.current_level`).
- Any schema change: `Meter.current_reading` (Float, NOT NULL, default 0)
  already exists.

## 2. Architecture

### 2.1 Write path: existing CRUD + a model-layer guard

**No new endpoint.** Every `/api/*` URL in this app is an explicit line in
`/etc/nginx/sites-enabled/sejel` (not tracked in git), so a new route would
be a manual server-side edit that a reinstall silently drops.

Instead the write path is the one that already exists:

```
PUT /api/meters/<name>/   →  views.crud_detail  →  crud.update_doc  →  Meter.save()  →  Meter.validate()
```

Two verified facts make this sufficient:

- **Role is already enforced.** `tabDocPerm` for `Meter`: write = only
  `Sejel Manager` + `System Manager` (i.e. owner + admin). Supervisor,
  finance and employee sessions are rejected by `doc.save()` with a Frappe
  permission error before any guard runs. No role code is added.
- **The only gap is the zero-readings rule.** `Meter.validate()` gains:

  ```
  if (not self.is_new()
          and self.has_value_changed("current_reading")
          and Meter Reading rows exist for self.name):
      frappe.throw(«لا يمكن تعديل القراءة الافتتاحية للعداد {code} بعد وجود قراءات»)
  ```

  (Guard fires only when the counter actually changed on an existing meter;
  a no-change save of other fields, and every insert — `setup_station`, the
  meters form — is unaffected because the meter trivially has zero readings
  there.)

`frappe.db.set_value()` writes direct SQL and bypasses `validate()`, by
design: `meter_reading.py:124/:147` keep rewriting the counter from reading
rows exactly as today, and reading saves never trip the guard.

Value sanity (`NaN`, non-numeric, `< 0`, `> 1e9`) is checked in the same
`Meter.validate()` call and surfaces through the existing 417 humanizer
(`crud._humanize`) as an Arabic validation error instead of a raw traceback.

**Semantics:** one `PUT` per changed meter (a station is ≤ ~12 guns; calls
are sequential), so a refusal is **per-meter**, not batch-atomic — the UI
reports exactly which gun failed and keeps the other values staged.

### 2.2 Setup response extension

`_setup_station_impl` return value gains, in generation order:

```json
"meters": [{"name": "<docname>", "meter_code": "M01A"}, ...]
```

Generation order is island → machine → meter slot (server
`views.py:668-697`; the wizard's `meterPreview` mirrors it). Codes are
returned rather than assumed because a second station gets `M01AX`-style
codes after the global `used_codes` dedupe — the wizard must key by `name`.

### 2.3 Wizard (frontend)

`views/stations/StationSetupWizard.vue`:
- `steps` gains `القراءات الافتتاحية (اختياري)` between `الخزانات` and
  `مراجعة وإنشاء`.
- The step renders one input per meter slot, ordered exactly like
  `meterPreview`, labelled with the expected code and fuel type. Inputs are
  `type=number min=0 step=0.001`, prefilled empty.
- The step is never blocking: «التالي» is enabled regardless, and empty
  values simply mean "not set now".
- `create()` becomes: `POST /setup-station/` → if any value was typed and the
  response carries `meters`, issue `PUT /api/meters/<name>/` for each typed
  slot, keyed by the returned `name`s (values positional against the preview
  order, mapped to the returned order — same order by construction; a length
  mismatch is a hard client error, surfaced, nothing posted).
- If any PUT fails, the success step shows an amber notice «تم إنشاء
  المحطة — تعذر حفظ القراءات الافتتاحية على عدّاد {code}: {reason}. أدخلها من
  صفحة المحطة» instead of the plain success line. Remaining meters are still
  attempted; station creation is never rolled back for this.

### 2.4 Station page panel (frontend)

`views/stations/StationDetail.vue`, meters tab, three states per meter.
All edit affordances (inputs, save button, «تجاوز») render only for sessions
that hold `Meter` write — admin/owner; everyone else sees the same rows
read-only, matching what the server enforces anyway:

1. **No readings, never set** → editable input; one bulk
   «حفظ القراءات الافتتاحية» issues `PUT /api/meters/<name>/` for each
   changed row (sequential) and reports per-gun failures.
2. **No readings, value set** → read-only value + **«تجاوز»** button
   (rendered only for admin/owner roles). Pressing it opens a confirm dialog
   «سيتم استبدال القراءة الافتتاحية {old} — لا توجد قراءات محفوظة على هذا
   العداد. هل أنت متأكد؟»; on confirm the input unlocks for that row only,
   saved through the same PUT.
3. **Has readings** → read-only value with caption «مقفلة بعد أول قراءة»;
   no force button.

**Read side:** the panel cannot distinguish "never set" from "locked" using
the today-only `meter.reading` field. `GET /api/meters/` therefore gains one
list enricher — the existing `LIST_ENRICHERS` mechanism (`views.py:249`) —
adding `reading_count` to every row with a single grouped count query over
`Meter Reading` (0 when absent). No field on `Meter` and no schema change.

### 2.5 Interaction with the readings flow

With a counter set and no reading rows: the first shift posts
`start=counter` → `flag_opening_baseline()` sees a truthy counter and does
**not** flag a baseline → `liters_sold = end − start` books a real sale, and
`validate_continuity()` passes (no earlier rows). Meters the user skipped
keep today's behaviour: no counter, no rows → first entry flagged
`is_opening`, books 0 litres (QA-32 protection unchanged).

### 2.6 What is deliberately not added

- No new `/api/*` route and **no nginx edit** — the guard lives at the model
  layer, so every current and future write path is covered without touching
  server config.
- No batch endpoint: ≤12 sequential PUTs per save round keeps the generic
  CRUD contract (and its permission + 417 humanizing) as the single door.

## 3. Error handling

| Case | Response |
|---|---|
| non-manager session (emp/supervisor/finance) | Frappe permission error from `doc.save()`, humanized to Arabic by `crud._humanize` — no guard code needed |
| meter has readings | `Meter.validate()` → 417 Arabic refusal naming the meter code |
| value `NaN`, non-numeric, `< 0`, or `> 1e9` sanity bound | 417 Arabic validation error |
| one gun of a bulk save refused | that PUT fails, the rest still attempt; UI names the gun and keeps other values staged |
| wizard PUT fails (any) | success step shows amber notice + panel hint; station kept |
| `reading_count` missing on older cached rows | treated as locked (fail-safe: never offer editing a gun whose history is unknown) |

## 4. Testing

New script `sejel/e2e-tests/qa-initial-readings.js` (a **new** file; the
approved 205-step set is frozen and must not be edited):
1. Create a station through the real wizard, typing values on the new step.
2. Assert via API that every returned meter name carries its value.
3. Open the readings screen and assert the «القراءة السابقة» equals the
   entered value (no baseline row was created, no shift needed).
4. Assert `PUT /api/meters/<name>/` with a new `current_reading` as
   `emp@sejel.ly` (and as a supervisor) is refused by permissions — the
   existing DocPerm behaviour this design relies on.
5. Save a reading for one gun, then assert the same PUT as admin is refused
   by the new `validate()` guard (Arabic message, value unchanged), and that
   the panel shows «مقفلة بعد أول قراءة» with no «تجاوز» button and
   `reading_count > 0`.
6. Assert «تجاوز» on an unset or already-set gun rewrites the
   value after the confirm dialog, and that a meter with readings never
   shows the button.
7. Assert a bulk save where one gun is refused keeps the other values.
8. Delete the fixture station so the pilot data stays clean.

Then the full 15-suite set (295 steps) must stay green — no approved suite
is modified by this feature.

## 5. Documentation

- `DOCUMENTATION.md`: `setup-station` response now returns `meters[]`;
  `GET /meters/` rows now carry `reading_count`; the `Meter` initial-value
  rule (zero readings, manager/admin only) documented with the API.
- `BUSINESS_INVARIANTS.md`: reading invariant gets one clause — a meter's
  initial value may be written only while it has zero reading rows, by
  admin/owner only; afterwards the reading rows are the only source of truth.
- `docs/PILOT_HANDOFF_AR.md`: the «القراءات الافتتاحية» wizard step and the
  station-panel force button, in Arabic, with who may use them.
