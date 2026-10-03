// Appends the Phase 6 findings/defects to the QA run log.
const { appendRun } = require('./qa')

const BODY = `
## Phase 6 result — 23 pass / 7 fail (4 real defects, 3 expected failures)

All of it run as the **station owner** (\`Sejel Manager\`).

### PASS — reporting works and shows real numbers
- \`/reports/daily\` loads by itself for today: **16,803 L**, expected sales and collection KPIs render.
- Forcing the date 2026-10-03 via the date input renders the same KPIs plus a per-station
  comparison table. The figure ties exactly to the reconciliation checked in Phase 4
  (16,803 L = 8,223 + 8,580).
- \`/reports/monthly\` renders the month/year selector and report body.
- \`/reports/inventory\` renders the tank stock table.
- \`/shifts/day\` renders the combined shift+readings day view.
- \`/shifts/gaps\` renders correctly with the empty state «لا توجد فجوات» — **not a defect**
  (no reading gaps exist in the current data).
- \`/finance/daily-sales\`, \`/finance/fuel-prices\`, \`/finance/cash\`, \`/finance/expenses\`,
  \`/finance/settlements\`, \`/finance/reconciliations\` all load for the owner.
- The reconciliation list shows both reconciliations with the right numbers
  (16,803 L / 2,520.45 / 0 / −2,520.45 for the pilot).
- **Excel export endpoint works**: \`/api/export/?view=station&name=<station>\` → 200 with
  \`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\`.

### DEFECT QA-24 [P2] English backend error in an all-Arabic UI (tank transfer)

- Repro: \`/inventory/transfers/create\` → station «محطة تجريبية» → from خزان 1 (بنزين) →
  to خزان 2 (ديزل) → 500 L → حفظ.
- Expected: an Arabic message such as «الخزانان يجب أن يحتويان على نفس نوع الوقود».
- Actual: **«Tanks must contain the same fuel type»** rendered raw at the top of the form.
- Aggravating: no station in the current data has two tanks of the same fuel type (pilot:
  بنزين + ديزل; QA Edge: one بنزين tank; برهم: one بنزين tank), so **the tank-transfer feature
  cannot be demonstrated end-to-end at all** until a second same-fuel tank exists. The
  business rule itself is correct — only the message and the missing same-fuel setup are wrong.
- Evidence: transfer form render captured in phase 6.

### DEFECT QA-25 [P2] No export for multi-station reports — the accountant's main deliverable

- \`MonthlyReport.vue\` renders the Excel link only when \`report?.stations?.length === 1\`.
- With the real dataset (3 stations) the link **is not rendered at all** — confirmed.
- \`/reports/daily\` has no export button whatsoever (only طباعة / print).
- Directly relevant to the QA question: the per-station export exists and works, but the
  consolidated report the accountant actually needs cannot be exported to Excel, so the
  "without Excel" answer depends on which report is meant.
- Evidence: \`MonthlyReport.vue:18-19\`, probe on \`/reports/monthly\`.

### DEFECT QA-26 [P1] Sidebar offers the station employee two screens that always 403

- The owner-visible nav contains **«القسائم»** (\`/finance/vouchers\`) and
  **«الدفع الإلكتروني»** (\`/finance/pos\`). Both load as **403** for the owner
  (\`GET /api/vouchers/\` → 403, \`GET /api/pos-records/\` → 403).
- This is the UI face of QA-15: the product advertises coupon and card-sales entry to the
  station employee, then fails the request. No error page, no explanation — just an empty
  screen. Electronic sales for a station are therefore unreachable in the intended workflow.
- Evidence: phase 6 nav sweep, 4 failed steps (screen + nav link, both roles).

### DEFECT QA-27 [P3] Tank fill percentage is unclamped and renders nonsense

- Tank dropdowns show «خزان 1 (بنزين — 0%)» for the QA Edge tank and
  **«صلاح (بنزين — 100000%)»** for the «برهم» tank.
- Cause: the percentage is \`current_level / capacity\` with no clamp, and capacity is free-form
  user data with no sane bounds (berهم's «صلاح» tank has capacity \`0.15\` litre, the QA Edge tank
  \`1\` litre, while the pilot tanks are 30,000 / 15,000). The wizard only sets an HTML
  \`min="1"\` on the input, which does not constrain the stored value.
- Low severity but visible to the operator on every transfer and inventory screen.
- Evidence: transfer form tank dropdown text.

### Note — tank capacity is not wizard-validated

The wizard requires \`capacity > 0\` (\`StationSetupWizard.vue:246\`) and marks the input
\`min="1"\`, but nothing rejects an unrealistic value, and there is no warning. Carried into the
final report as a data-quality risk rather than a separate defect.
`

appendRun('Phase 6 findings', BODY)
console.log('phase 6 findings appended')