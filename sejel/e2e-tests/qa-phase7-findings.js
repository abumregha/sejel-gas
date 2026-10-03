// Appends the Phase 7 responsive findings to the QA run log.
const { appendRun } = require('./qa')

const BODY = `
## Phase 7 result — laptop and desktop are clean, the phone is not

| Viewport | Screens fitting | Horizontal overflow | Controls under 40px |
|---|---|---|---|
| **1366×768** (supervisor laptop) | 11 / 11 | 0 | – |
| **1920×1080** (accountant) | 11 / 11 | 0 | – |
| **390×844** (pump phone) | 6 / 11 | **5 screens** | **every screen** |

### DEFECT QA-28 [P2] Five screens break the layout on a phone

Affected (document \`scrollWidth\` vs 390px viewport):
- \`/shifts\` → **760px** (nearly double the viewport)
- \`/settings/users\` → **657px**
- \`/inventory/deliveries\` → **550px**
- \`/reports/daily\` → **517px**
- \`/finance/reconciliations\` → **589px**
- \`/inventory/shortages\` → 425px (marginal)

The same screens are fine at 1366 and 1920, so this is a phone-only regression, and the pump
is exactly where the readings entry happens.

- Root cause (primary): \`DefaultLayout.vue:40\` is
  \`<div class="flex-1 min-h-screen overflow-x-clip lg:mr-64">\` — a flex item with **no
  \`min-w-0\`**. The default \`min-width: auto\` lets the item grow to the intrinsic width of its
  widest child, so one wide table stretches the whole layout (\`div.flex-1.min-h-screen\`,
  \`header.sticky\`, \`main\` all measured wider than the viewport).
- Root cause (secondary): the list screens wrap their tables in \`overflow-x-auto\`
  (\`DeliveryList.vue:7\`, \`UsersList.vue:7\`, \`ReconciliationList.vue:4\`) which would normally
  contain the scroll — but \`DailyReport.vue\` has **no** scroll wrapper around its
  \`<table class="data-table">\` at all, so that table forces the page width directly.
- \`overflow-x-clip\` hides the symptom visually while \`scrollWidth\` still overflows, so the
  right-hand columns of these tables are unreachable by swipe on a phone.
- Fix direction: add \`min-w-0\` to the layout flex item, and wrap the report tables in
  \`overflow-x-auto\`.

### DEFECT QA-29 [P3] Tap targets below the 40px floor on mobile

Every phone screen reports 3–20 interactive elements under 40px tall; the recurring ones are
the icon buttons at \`34×36px\` and station \`select\` at \`180×34px\` (home, stations, shifts,
users screens). \`/shifts\` is the worst with **20**. Below the 44px iOS / 48px Android guidance,
so the close-day and per-shift action buttons are hard to hit accurately at the pump.
- Fix direction: \`min-h-11\` (\`44px\`) on icon buttons and selects in the mobile layout.

### PASS

- Laptop and desktop layouts are correct on all 11 screens — no overflow, no clipped columns.
- The readings screen (the primary pump task) **fits** at 390px with no overflow.
- \`/stations\`, \`/shifts/day\` and \`/finance/income\` also fit at 390px.
- Screenshots for all three widths are in \`shots/qa-phase7-*\`.
`

appendRun('Phase 7 findings', BODY)
console.log('phase 7 findings appended')