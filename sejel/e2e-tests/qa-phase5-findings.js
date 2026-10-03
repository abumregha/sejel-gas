// Appends the Phase 5 findings/defects to the QA run log (keeps all log writing
// in one place, via the same helper the phase scripts use).
const { appendRun } = require('./qa')

const BODY = `
## Phase 5 result — 14/14 steps pass, 4 defects found

Working as the **station owner** (\`Sejel Manager\`) throughout, which is the role the real
station employee holds. Result: **PASS**
- all 9 inventory routes render (list or form, with headers + empty states);
- delivery CRUD works end-to-end through the UI — station + tank + quantities → saved as
  \`36vnlp5c0f\`, invoice QA-INV-734516, expected 5,000 / requested 4,900 → **received 4,900,
  shortage 100** (arithmetic correct: 104,900 − 100,000 = 4,900; 5,000 − 4,900 = 100);
- the deliveries list renders both rows with correct numbers;
- the \`401 /api/auth/me/\` entry is the pre-login probe on each fresh context, not a defect.

### DEFECT QA-20 [P1] Shortage claims screen renders garbage — proven with real data

- Repro: create a Shortage Claim (\`45h70pc6at\`, delivery \`36vnlp5c0f\`, shortage_amount 100,
  status \`claimed\`) → open \`/inventory/shortages\`.
- Expected: \`#<delivery> · QA Edge Station · 100 لتر · قيد المراجعة · <description>\`.
- Actual rendered row: \`# · (blank station) · **NaN لتر** · claimed · (blank)\`.
- Root cause — the screen reads fields the list endpoint never returns. \`ShortageList.vue\`
  uses \`s.delivery_id_display\`, \`s.station_name\`, \`s.claimed_quantity\`, \`s.description\`;
  \`views.py:37\` exposes only \`name, delivery, shortage_amount, status, claim_date,
  settlement_date, modified\`. \`Number(undefined).toLocaleString()\` → \`NaN لتر\`.
- Blast radius: **the entire shortage-claims workflow is unusable** — a station manager cannot
  tell which delivery a claim belongs to, which station it is for, or how much was claimed.
- Evidence: \`ShortageList.vue:9-14\` vs \`views.py:37\`; UI render captured after creating the claim.

### DEFECT QA-21 [P2] Shortage claim is promised by the delivery form but cannot be created

- Repro: \`/inventory/deliveries/create\` → quantities that produce a shortfall → the panel says
  **«يمكن إنشاء مطالبة نقص بعد الحفظ»**.
- Expected: after saving, a way to raise the shortage claim.
- Actual: \`/inventory/shortages\` is read-only — no create button, no create route in the router,
  and the delivery detail offers no such action. The claim has to be created out-of-band via the
  generic API. Dead-end promise: the operator is told to do something the product cannot do.
- Evidence: router \`/inventory/*\` routes (no shortage-create), \`ShortageList.vue\` template.

### DEFECT QA-22 [P2] Shortage status vocabulary mismatch — English leaks to the operator

- Backend accepts only \`not_claimed | claimed | settled | closed\`
  (\`ValidationError: Status cannot be "pending". It should be one of "not_claimed","claimed","settled","closed"\`),
  while \`ShortageList.vue\` maps \`{ pending: 'قيد المراجعة', approved: 'موافق عليها', rejected: 'مرفوضة' }\`.
- Every row therefore renders the **raw English status** (\`claimed\`) instead of Arabic —
  confirmed on screen above.
- Evidence: DocType Select validation + rendered badge text.

### DEFECT QA-23 [P2] «تسوية الوقود» screen shows blank station/tank columns and has no create path

- \`/inventory/fuel-reconciliation\` (\`FuelReconciliationList.vue\`) renders \`r.station_name\` and
  \`r.tank_name\`, but \`views.py:36\` returns only the raw \`station\` / \`tank\` codes → both columns
  would be empty for every row.
- The screen is also read-only with no create action and no route, so the list can never be
  populated from the UI — it is currently always «لا توجد تسويات».
- Evidence: \`FuelReconciliationList.vue:7-14\` vs \`views.py:36\`.

### Side observation — tank capacity 1.0 litre

The QA Edge Station tank created by the Phase-3 wizard holds \`capacity: 1.0\` (litre), while the
pilot tanks are 30,000 / 15,000. The wizard apparently defaults capacity to 1. Carried to Phase 6
to confirm against the wizard form; not raised as a defect yet.
`

appendRun('Phase 5 findings', BODY)
console.log('phase 5 findings appended')