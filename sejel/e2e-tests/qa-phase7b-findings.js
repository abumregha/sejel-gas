// Appends the QA-30 finding (station day-close time has no UI) discovered while
// preparing Phase 8 — it is the precondition for the 11:00→11:00 cycle.
const { appendRun } = require('./qa')

appendRun('DEFECT QA-30 [P1] The station daily close time cannot be set anywhere in the UI', `
- \`Station.day_close_time\` exists on the DocType (\`Time\`) and is the parameter that decides
  whether a station runs an **11:00→11:00** or 23:00→23:00 cycle — the single most important
  business setting in the product.
- It is **not present in any screen**:
  - \`StationSetupWizard.vue\` — no \`day_close_time\` field
  - \`StationForm.vue\` (create/edit) — only اسم المحطة / العنوان / نوع العلاقة
  - \`StationDetail.vue\` — not displayed
  - the only frontend reference is a *read*: \`ReadingsView.vue:183\` \`dayCloseTime\` computed,
    which **falls back to a hard-coded '23:00'** when the value is empty
- Consequence: a station that should run 11:00→11:00 cannot be configured without a developer
  or the Frappe desk. A newly created station silently runs on the 23:00 fallback, and the
  readings screen shows 23:00 — which is exactly the QA-2 symptom (the dashboard/readings
  cycle label never showing the configured cycle).
- The values in the database today (\`محطة تجريبية\` = 11:00, \`برهم\` = 23:00) were set outside
  the SPA, so the UI path has never been exercised.
- Fix direction: add a «وقت إقفال اليوم» time field to the setup wizard and to the station
  edit form, and stop hard-coding the 23:00 fallback in the frontend.
- Evidence: grep for \`day_close_time\` across \`frontend/src/views\` (only \`ReadingsView.vue:183\`),
  DocType field list, \`StationForm.vue\` label list.`)

console.log('QA-30 appended')