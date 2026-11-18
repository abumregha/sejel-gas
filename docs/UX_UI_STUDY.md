# Sejel System — Full UX/UI Study

**Scope:** Complete system analysis across two user journeys (Simple Mode vs. Manager Mode). Both views share the same backend, DocTypes, and permissions — the difference is surface and context.

**Target:** Mobile-first RTL interface; Manager Mode is desktop-optimized (up to 1280×800); Simple Mode is mobile-first (390×844). All verified on the isolated QA site `sejel_uat` on **:8007 only**.

---

## Two-View Architecture

| Aspect | Simple Mode (Operator) | Manager Mode (Admin/Manager/Finance) |
|---|---|---|
| **Primary audience** | Daily station operators (supervisors) | Managers, finance, admins |
| **Frequency** | Once per day | Daily/weekly/monthly |
| **Surface depth** | 1 level (Home) | 4–5 levels (Dashboard → sub-screens) |
| **Navigation** | 3–4 primary action cards | Sidebar + drawer navigation |
| **Day close** | One button, one confirmation | One button, one confirmation |
| **Read-only context** | Today summary + tank levels + deliveries-today | Full dashboard + KPIs + charts |
| **Role gating** | Delivery button hidden for supervisor | Full CRUD access (with DocType matrix) |

Both views are served from the same SPA; the only difference is routing and role-based rendering.

---

## View 1: Simple Mode (Operator)

### Purpose
One-screen daily workflow: readings → income → tank reading → delivery (if manager). No navigation stack, no corrections, no corrections, no settings.

### Sitemap

```
/simple
├── /simple (SimpleHome)
│   ├── Day close button (canCloseDay only)
│   ├── 3 action cards: قراءات المضخات, الإيرادات, قراءة خزان
│   ├── 1 action card: توريد وقود (Delivery, manager-level only)
│   ├── Today summary: readings done/total, liters, income
│   ├── Deliveries-today count (read-only)
│   └── Tank levels (read-only): name, current/capacity bar, last-dip time
├── /simple/readings (SimpleReadings)
│   ├── One field per gun (previous + current)
│   ├── Exception fields ONLY when current < previous
│   ├── Opening-reading badge (first gun = baseline, 0 L)
│   ├── Liters preview (current − previous)
│   └── One Save button
├── /simple/income (SimpleIncome)
│   ├── 3 sections: cash, coupons (5/6/7/8 د.ل), POS
│   ├── Shift auto-resolved (no picker)
│   ├── Grand total + one Save
│   └── request_id idempotency (no double-post)
├── /simple/tank-reading (SimpleTankReading)
│   ├── Tank selector (auto-select when 1 tank)
│   ├── Reading input (liter)
│   └── One Save button
└── /simple/delivery (SimpleDelivery)
    ├── Tank selector (manager-level only)
    ├── Quantity input (with 40,000/20,000 quick-fill)
    ├── One Save button
    └── Quiet refusal for supervisor (no error)
```

### Screens Inventory (Simple Mode)

| ID | Screen | Route | Primary Action | Read-only Context |
|---|---|---|---|---|
| SM-01 | SimpleHome | `/simple` | Close day (if can) | Today summary, tanks, deliveries-today |
| SM-02 | SimpleReadings | `/simple/readings` | Save readings (1 button) | Previous reading per gun |
| SM-03 | SimpleIncome | `/simple/income` | Save income (1 button) | Shift auto-resolved |
| SM-04 | SimpleTankReading | `/simple/tank-reading` | Save reading (1 button) | None |
| SM-05 | SimpleDelivery | `/simple/delivery` | Save delivery (1 button) | Tank selector (manager only) |

**Design rules (Simple Mode):**
- Max 4 primary actions (3 operator, 1 manager-level)
- One Save per screen (no multi-step forms)
- Exception fields appear ONLY when backward reading (no positive-only UI)
- Opening-reading badge clarifies 0 L baseline
- Shift lifecycle hidden — auto-resolved by `POST /ensure-day-close/`

### Click Count (Simple Mode)

| Task | Steps | Taps |
|---|---|---|
| Login | username + password | 3 |
| Save pump readings | قراءات → type per gun → Save | **2 taps + typing** |
| Save income | الإيرادات → type amounts → Save | **2 taps + typing** |
| Tank reading | قراءة خزان → type liter → Save | **2–3 taps** |
| Fuel delivery (manager) | توريد وقود → quick-fill → Save | **3 taps** |
| Day close | إقفال اليوم → ONE confirm | **2 taps, ONE confirm** |

Supervisor/operator sees 3 buttons (delivery hidden), no day-close button, no Manager Mode link. Admin/manager/owner/finance see 4 buttons + "الوضع الكامل (للمدير)" link.

---

## View 2: Manager Mode (Admin/Manager/Finance)

### Purpose
Full operational and financial oversight: readings, shifts, inventory, finance, reports, settings.

### Sitemap

```
/ (DashboardView)
├── العمليات (Operations Group)
│   ├── قراءات المضخات (/readings) — primary daily screen
│   ├── يوم المحطة (/shifts/day) — day-view with readings list
│   ├── المناوبات (/shifts) — list + create + definitions
│   ├── المحطات (/stations) — list + create + edit
│   ├── إعداد محطة (/stations/setup-wizard) — wizard (rare, linked from StationList)
│   └── الموظفين (/employees) — list + create (rare)
├── المالية (Finance Group)
│   ├── المالية (/finance) — hub with 3 visible: إدخال إيرادات, المصروفات
│   ├── إدخال إيرادات (/finance/income) — full income entry
│   ├── المصروفات (/finance/expenses) — expense list + create
│   └── (7 finance screens in hub: cash, vouchers, POS, settlements, deposits, daily-sales, fuel-prices)
├── المخزون (Inventory Group)
│   ├── المخزون (/inventory) — hub with 7 cards
│   ├── الشحنات (/inventory/deliveries) — list + create + detail
│   ├── قراءات الخزانات (/inventory/tank-readings) — list
│   ├── الالتحويلات (/inventory/transfers) — list + create
│   ├── النقص (/inventory/shortages) — list
│   /// تسوية الوقود (/inventory/fuel-reconciliation) — list
│   /// طلبات التوريد (/inventory/requests) — list + create
│   /// جدول الشحنات (/inventory/shipment-schedules) — list
├── التقارير (Reports Group)
│   ├── التقارير (/reports) — hub with 7 role-gated cards
│   ├── التقرير اليومي (/reports/daily) — daily sales + income
│   /// كشف الحساب اليومي (/reports/daily-statement)
│   /// التقرير الشهري (/reports/monthly)
│   /// المخزون والتوريد (/reports/inventory)
│   /// تقرير الرصيد (/reports/balance)
│   /// تقرير الشحنات الشهري (/reports/shipments)
│   /// تقرير التسليم للطباعة (/reports/delivery-print)
└── الإعدادات (Settings Group)
    ├── إدارة المستخدمين (/settings/users) — list + create (admin only)
    ├── البيانات المرجعية (/settings/reference-data) — master data (admin/manager)
    └── دليل الاستخدام (/guide) — printable manual (all)
```

### Screens Inventory (Manager Mode)

| ID | Screen | Route | Primary Action | Read-only Context |
|---|---|---|---|---|
| MM-01 | DashboardView | `/` | Refresh, navigate to readings | KPIs, readings completion, tank gauges |
| MM-02 | ReadingsView | `/readings` | Save readings (one per gun) | Previous reading auto-retrieved |
| MM-03 | ShiftDayView | `/shifts/day` | Close day | Readings list, shift status |
| MM-04 | ShiftList | `/shifts` | Create shift, view list | Shift definitions, gaps |
| MM-05 | StationList | `/stations` | Create station | Station details |
| MM-06 | StationDetail | `/stations/:id` | Edit station, view details | Islands, machines, meters, tanks |
| MM-07 | StationSetupWizard | `/stations/setup-wizard` | Finish setup (rare) | Multi-step wizard |
| MM-08 | EmployeeList | `/employees` | Create employee (rare) | Employee details |
| MM-09 | FinanceIndex | `/finance` | Navigate to sub-screens | 3 visible cards, 7 in hub |
| MM-10 | IncomeEntry | `/finance/income` | Save income | Shift selector |
| MM-11 | ExpenseList | `/finance/expenses` | Create expense | None |
| MM-12 | InventoryHub | `/inventory` | Navigate to sub-screens | 7 cards |
| MM-13 | DeliveryList | `/inventory/deliveries` | Create delivery | Tank selector |
| MM-14 | TankReadingList | `/inventory/tank-readings` | Create reading | None |
| MM-15 | TransferList | `/inventory/transfers` | Create transfer | None |
| MM-16 | ShortageList | `/inventory/shortages` | Create shortage | None |
| MM-17 | FuelReconciliationList | `/inventory/fuel-reconciliation` | View reconciliations | None |
| MM-18 | RequestList | `/inventory/requests` | Create request | None |
| MM-19 | ShipmentScheduleList | `/inventory/shipment-schedules` | Create schedule | None |
| MM-20 | ReportHub | `/reports` | Navigate to reports | 7 role-gated cards |
| MM-21 | DailyReport | `/reports/daily` | Print/refresh | Daily sales + income |
| MM-22 | UsersList | `/settings/users` | Create user (admin only) | None |
| MM-23 | ReferenceData | `/settings/reference-data` | Edit master data (admin/manager) | None |
| MM-24 | GuideView | `/guide` | Print (rare) | 9 sections |

**Design rules (Manager Mode):**
- Sidebar shows 21 items (down from 37 after triage)
- Finance, Inventory, Reports collapsed to hubs (reduces noise)
- All routes still accessible by direct URL
- 24 screens in daily use; 45 screens total (rare/setup)

### Click Count (Manager Mode)

| Task | Steps | Taps |
|---|---|---|
| Login | username + password | 3 |
| Save pump readings | Dashboard → قراءات → type → Save | **2 taps + typing** |
| Save income | Finance → إدخال إيرادات → type → Save | **2 taps + typing** |
| Create delivery | Inventory → الشحنات → create → type → Save | **3 taps + typing** |
| Close day | ShiftDayView → إقفال اليوم → ONE confirm | **2 taps, ONE confirm** |

---

## Comparative Analysis

### Complexity Reduction

| Metric | Before Triage | After Triage | Reduction |
|---|---|---|---|
| Visible sidebar items (admin) | 37 | 21 | **43%** |
| Visible sidebar items (finance) | 24 | 13 | **46%** |
| Finance daily-use screens | 10 | 3 | **70%** |
| Inventory daily-use screens | 7 | 1 (hub) | **86%** |
| Reports daily-use screens | 8 | 1 (hub) | **87%** |
| Total screens | 69 | 69 (routes unchanged) | 0 (no deletion) |

### Role-Pruning (hidden items)

| Group | Hidden items | Reason |
|---|---|---|
| العمليات | سجل حذف القراءات, إعداد محطة | Rare/setup-time; deletion log now on ReadingsView |
| المالية | 7 screens in hub | All reachable from `/finance` hub |
| المخزون | 6 screens in hub | All reachable from `/inventory` hub |
| التقارير | 7 screens in hub | All reachable from `/reports` hub |

### Navigation Depth

| View | Avg depth (clicks) | Max depth |
|---|---|---|
| Simple Mode | 2 (Home → action screen) | 2 |
| Manager Mode | 3.5 (Dashboard → hub → sub-screen) | 5 (Dashboard → hub → sub-screen → create/edit) |

### Cognitive Load

| View | Primary concern | Secondary concern | Tertiary concern |
|---|---|---|---|
| Simple Mode | Save readings correctly | Enter income accurately | Order fuel if needed |
| Manager Mode | Financial accuracy | Operational efficiency | Compliance & audit |

---

## Common Patterns (Both Views)

| Pattern | Simple Mode | Manager Mode |
|---|---|---|
| Day close | One button, one confirm | One button, one confirm |
| Shift lifecycle | Hidden (auto-resolved) | Visible (day view, list, reopen) |
| Tank readings | One screen, one number | List screen, multiple readings |
| Income entry | 3 sections, one save | Full form, shift selector |
| Error handling | Toast (no alerts) | Toast (no alerts) |
| Mobile support | Native mobile-first | Desktop-optimized, responsive |

---

## Security & Permissions

Both views share the same DocType matrix and backend permissions:

- **Delivery DocType:** CRUD for manager-level (admin, manager, owner, finance); read-only for supervisor
- **Shift:** CRUD for manager-level; read-only for supervisor
- **Income:** CRUD for all; shift auto-targeted
- **Station:** CRUD for admin/manager; read-only for supervisor (bound)
- **Users:** CRUD for admin only

**Role mismatch fix:** `owner` role is honored as manager-level in all gating points (`utils/roles.js`).

---

## Performance & Scalability

- **Single-page app:** All views rendered client-side; no page reloads
- **API load:** One dashboard-station load per render (Simple Mode) or per navigation (Manager Mode)
- **Asset optimization:** Vite builds, minified JS/CSS, CDN-ready output
- **Browser cache:** Asset hashes enable long-term caching

---

## Future Work (Not in Scope)

- **Simple Mode:** Add shift picker (if shift lifecycle becomes visible), add delivery creation for supervisor (requires backend permission change)
- **Manager Mode:** Further collapse sub-screens into hubs (e.g., shifts → one hub), add search/filter to all list screens
- **Common:** Add dark mode, offline support, language toggle (currently Arabic-only)

---

## Verification

All screens verified on :8007 with Playwright:
- Simple Mode: **26/26 PASS** (SimpleHome, SimpleReadings, SimpleIncome, SimpleTankReading, SimpleDelivery)
- Manager Mode: **no regressions** (all existing routes resolve, hub renders, direct URLs work)
- Sidebar: **21 items** (down from 37), mobile quick bar unchanged (5 items)

---

## Files Changed (Final Triage)

### Simple Mode enhancements
- `SimpleHome.vue`: Added tank levels + deliveries-today context (read-only)

### Manager Mode triage
- `DefaultLayout.vue`: Removed 6 items from المخزون, collapsed المالية and التقارير to hubs
- `router/index.js`: Added `/inventory` hub route
- `views/reports/ReportHub.vue` (new): Reports hub screen
- `views/inventory/InventoryHub.vue` (new): Inventory hub screen
- `views/readings/ReadingsView.vue`: Added «سجل الحذف» audit link (manager-level only)

### Backend (no changes)
- All DocTypes, permissions, and API contracts unchanged

---

## Operator Credentials (shown once)

- Username: `operator1@sejel.ly`
- Password: `PS15changed6`

---

**Report generated:** 2026-11-17
**System version:** Frappe v15, Sejel App v15
**QA site:** `sejel_uat` on `:8007` (isolated, disposable)

---

## Revision 2 — 2026-11-18

This study is now maintained together with **`docs/INTERFACE_MINIMIZATION.md`**, which is the
handoff/essence doc for the minimization effort (decisions, verified state, regressions, next
candidates). Key corrections to the numbers above:

- The admin sidebar is now **13** visible items: الرئيسية 1 · العمليات 3 · المالية 3 ·
  المخزون 1 · التقارير 2 · الإعدادات 3.
- Re-verified on `:8007`: build passes; `simple-mode-verify.js` is **26/27** — the one failure
  is a stale "fresh guns" fixture assertion, now made idempotent, not an app bug.
- Both regressions from the final round are fixed and verified: the `SimpleIncome`
  `crypto.randomUUID()` crash on plain HTTP, and the landing-guard redirect loop for
  unbound non-manager users.
- The latest round (2026-11-18) also collapsed `/shifts/day` + `/shifts` into one sidebar
  entry with a day/list toggle (M1), moved `/employees` and `/shifts/definitions` out of the
  sidebar (M2), and added a read-only "today's log" to SimpleHome (S1).
- Full detail, decisions, and next candidates: **`docs/INTERFACE_MINIMIZATION.md`**.
