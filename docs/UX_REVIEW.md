# Sejel (سجل) — UX Review Document

**Scope:** the Vue 3 SPA in `sejel/frontend/src` (routes, views, layout, stores) as it exists in this repository, plus the role/permission documentation in `DOCUMENTATION.md` (the Frappe backend `sejel_app` is not in this repo; its DocType permission matrix is quoted from the docs).

**System summary:** an Arabic, RTL fuel-station management SPA ("سجل — نظام إدارة محطات الوقود") served at `/app/`, backed by a Frappe v15 API. Stations are isolated: every user works inside one globally selected station (sidebar selector), and users bound to a station (`User.sejel_station`) are server-scoped to it.

**Roles found in code:** `admin` (مدير النظام, or `is_staff`), `manager`, `supervisor`, `finance`, and — in the user-creation form only — `owner`. The frontend nav gating checks `['admin','manager','finance','supervisor']`; the user form offers the value `owner` (مالك) instead of `manager`. This document reports both exactly as coded.

**Click convention:** one "click" = one deliberate user activation (nav link, button, confirm-dialog OK, row click). Typing into fields and confirm dialogs opened by the system are counted where noted. Authentication and the mandatory station selection are excluded unless they are part of the workflow.

---

## 1. Site map

Every route registered in `src/router/index.js` (79 routes: 1 login + 78 inside `DefaultLayout`). Arrows (`→`) show navigations that exist as links/buttons in the templates.

```
/login/                                  LoginView
/select-station/                         SelectStationView  (forced when no station is selected)
│   → any station → redirect to the original target or /
│   → /stations/setup-wizard  (admin/manager only)
│   → /login/  (logout)
│
/  (DefaultLayout — sidebar + top bar + mobile bottom nav)
├── /                                    DashboardView
│     → /guide
│     → /readings   (readings banner, "شاشة الإدخال", TodayPanel gun rows)
│     → /inventory/tank-readings   ("+ قراءة خزان", quick actions)
│     → /inventory/shipments/create?type=delivery&station=…&date=…  ("+ إضافة شحنة")
│     → in-page detail drawers (island / machine / meter / tank) — DetailDrawers
│     → QuickActions deep links: /shifts, /inventory/tank-readings,
│           /inventory/shipments/create?type=delivery, /finance/income,
│           /finance/expenses/create, /finance/reconciliations,
│           /reports/daily, /stations
│     → /shifts/:id (ShiftStatusCard), /finance/reconciliations/:id (ReconciliationSummary),
│         AlertsPanel links
│
├── العمليات (Operations)
│   ├── /readings                        ReadingsView            (all roles)
│   │     · inline editors only; reloads in place; day close happens here
│   ├── /readings/deletions              DeletionLogList         (admin, manager, finance)
│   ├── /shifts/day                      ShiftDayView            (all roles)
│   │     → /generate-shifts/ action; → /stations/:id; → /shifts/:id/readings; → /shifts/:id
│   ├── /shifts                          ShiftList               (all roles)
│   │     → /shifts/create; → /shifts/:id; inline start/submit/close
│   ├── /stations                        StationList             (admin, manager)
│   │     → /stations/setup-wizard; → /stations/create; → /stations/:id; → /stations/:id/edit
│   ├── /stations/setup-wizard           StationSetupWizard      (admin, manager)
│   │     → /stations/:id
│   ├── /stations/create · /:id/edit     StationForm
│   ├── /stations/:id                    StationDetail (tabs: islands/machines/meters/tanks/employees)
│   │     → /islands/create, /machines/create, /meters/create, /tanks/create,
│   │       /employees/create (each pre-filled with ?station=…), /machines?island=…,
│   │       /stations/:id/edit, /stations
│   ├── /employees                       EmployeeList → /employees/create, /employees/:id/edit
│   ├── /employees/create · /:id/edit    EmployeeForm
│   ├── /shifts/definitions              DefinitionList → /shifts/definitions/create, …/:id/edit
│   ├── /shifts/definitions/create · /:id/edit   DefinitionForm
│   └── (list pages outside the nav, reachable from StationDetail / directly by URL:)
│       /islands, /islands/create, /islands/:id/edit      IslandList / IslandForm
│       /machines, /machines/create, /machines/:id/edit   MachineList / MachineForm
│       /meters,  /meters/create,  /meters/:id/edit       MeterList  / MeterForm
│       /tanks,   /tanks/create,   /tanks/:id, /tanks/:id/edit   TankList / TankForm / TankDetail
│
├── المناوبات (Shifts, remaining)
│   ├── /shifts/create                   ShiftForm
│   ├── /shifts/:id                      ShiftDetail
│   │     → /shifts/:id/readings; → /api/export/?view=shift…; back → /shifts
│   ├── /shifts/:id/readings             ReadingForm   (legacy per-shift reading entry)
│   ├── /shifts/:id/close                CloseShift    (stub → /shifts/:id)
│   └── /shifts/gaps                     MeterGapReport (admin, manager, supervisor)
│
├── المالية (Finance)
│   ├── /finance                         FinanceIndex → 8 cards:
│   │     /finance/income, /finance/daily-sales, /finance/cash, /finance/vouchers,
│   │     /finance/pos, /finance/expenses, /finance/settlements, /finance/reconciliations
│   ├── /finance/income                  IncomeEntry        (all roles via nav)
│   ├── /finance/daily-sales             DailySales
│   ├── /finance/fuel-prices             FuelPriceList      (admin, manager)
│   ├── /finance/cash                    CashList
│   ├── /finance/vouchers                VoucherList
│   ├── /finance/pos                     POSList
│   ├── /finance/expenses                ExpenseList → /finance/expenses/create, /:id/edit
│   ├── /finance/expenses/create · /:id/edit   ExpenseForm
│   ├── /finance/settlements             SettlementList → /finance/settlements/create
│   │                                    (edit links point to /finance/settlements/:id/edit,
│   │                                     which has NO matching route)
│   ├── /finance/settlements/create      SettlementForm
│   ├── /finance/settlements/:id         SettlementDetail → back to list
│   ├── /finance/deposits                DepositList → /finance/deposits/create
│   ├── /finance/deposits/create · /:id/edit   DepositForm
│   ├── /finance/reconciliations         ReconciliationList → /finance/reconciliations/:id (row click)
│   └── /finance/reconciliations/:id     ReconciliationDetail → Excel export; back to list
│
├── المخزون (Inventory)
│   ├── /inventory/deliveries            DeliveryList → /inventory/shipments/create?type=delivery, /inventory/deliveries/:id
│   ├── /inventory/deliveries/create     ShipmentForm (forced delivery mode)
│   ├── /inventory/deliveries/:id        DeliveryDetail (status buttons) → back to list
│   ├── /inventory/tank-readings         TankReadingList (inline add form)
│   ├── /inventory/transfers             TransferList → /inventory/transfers/create
│   ├── /inventory/transfers/create      TransferForm
│   ├── /inventory/shortages             ShortageList (read-only, no create)
│   ├── /inventory/fuel-reconciliation   FuelReconciliationList (read-only)
│   ├── /inventory/requests              RequestList → /inventory/requests/create, /inventory/requests/:id
│   ├── /inventory/requests/create       RequestForm
│   ├── /inventory/requests/:id          RequestDetail (approve/dispatch/receive/cancel)
│   ├── /inventory/shipment-schedules    ShipmentScheduleList → create, edit, receive (arrival mode)
│   ├── /inventory/shipment-schedules/create   ShipmentForm (forced schedule mode)
│   └── /inventory/shipments/create · /inventory/shipments/:id   ShipmentForm
│         (three modes: schedule / delivery / arrival; links to /finance/deposits/create)
│
├── التقارير (Reports)
│   ├── /reports/daily                   DailyReport          (all roles)
│   ├── /reports/daily-statement         DailyStatementReport (admin, manager, finance)
│   ├── /reports/monthly                 MonthlyReport        (admin, manager, finance)
│   ├── /reports/inventory               InventoryReport      (all roles)
│   ├── /reports/balance                 BalanceReport        (admin, manager, finance)
│   ├── /reports/shipments               ShipmentReport       (admin, manager, finance)
│   ├── /reports/delivery-print          DeliveryPrint        (admin, manager, finance)
│   └── /shifts/gaps                     MeterGapReport       (admin, manager, supervisor)
│
└── الإعدادات (Settings)
    ├── /settings/users                  UsersList → /settings/users/create, /:id/edit   (admin only)
    ├── /settings/users/create · /:id/edit   UserForm
    ├── /settings/reference-data         ReferenceData    (admin, manager)
    └── /guide                           GuideView        (all roles)
```

Global layout actions (present on every screen): sidebar station selector (reload on change), back button (history-aware), logout, mobile bottom nav (الرئيسية، القراءات، المناوبات، الإيرادات، التقارير), global toast, UX feedback widget.

---

## 2. Screen inventory

Roles are given per the code: nav gating in `DefaultLayout.vue` (`roles` arrays; omitted = everyone; admin sees all), plus in-view gating where present. Backend DocType permissions are in §5.

### 2.1 Auth & shell

| # | Screen (route) | Purpose | Fields | Buttons / actions | Roles |
|---|---|---|---|---|---|
| 1 | **LoginView** (`/login/`) | Username/password login for the SPA. | اسم المستخدم (username, text, required, autofocus); كلمة المرور (password, required) | «دخول» (Login) → `POST /auth/login/`; on success `router.push('/')` | Public |
| 2 | **SelectStationView** (`/select-station/`) | Forces the user to pick which station to manage; all work is scoped to it. | — | Per-station card button (name, address, status badge, «المحددة حالياً») → sets station + redirect; «إعداد محطة جديدة» (admin/manager only, empty state) → `/stations/setup-wizard`; «تسجيل خروج» (logout) → `/login/` | All (wizard link: `auth.isAdmin \|\| auth.role === 'manager'`) |
| 3 | **DefaultLayout** (shell) | Global chrome: sidebar, station selector, top bar, mobile nav, toast. | Sidebar station `<select>` (unbound users only; bound users see a fixed card «محطة مرتبطة بحسابك») | Nav links (role-filtered), mobile hamburger, «رجوع» back button, logout button, toast dismiss, station change (full page reload) | All |

### 2.2 Dashboard

| # | Screen (route) | Purpose | Fields | Buttons / actions | Roles |
|---|---|---|---|---|---|
| 4 | **DashboardView** (`/`) | Station operations dashboard answering "شن المطلوب مني اليوم؟" — KPIs, readings completion banner, tank gauges, station map, Excel-style readings table, shift status, reconciliation summary, alerts, quick actions. | None (read-only; KPI cards: إجمالي اللترات، المبيعات المتوقعة، إجمالي التحصيل، فرق المطابقة، المصروفات، هامش الربح، النقد الصافي) | «الدليل» → `/guide`; «تصدير Excel» → `/api/export/?view=station…`; «تحديث» (refresh); readings-completion banner → `/readings`; «+ قراءة خزان» → `/inventory/tank-readings`; «+ إضافة شحنة» → `/inventory/shipments/create?type=delivery&…`; «شاشة الإدخال» → `/readings`; map `@open-island/@open-machine/@open-meter` → detail drawers; TankCard `@open` → tank drawer; readings-row click → meter drawer; drawer close | All (no role gating in file) |

Dashboard sub-components (rendered inside DashboardView):

| Component | Buttons / actions | Role gating |
|---|---|---|
| **TodayPanel** | One large primary action button (label/destination changes with the state of the day, e.g. enter readings); per-gun rows → `/readings?station=…&meter=…`; "يحتاج تدخلًا" attention links; money panel (display) | None in template |
| **QuickActions** | 11 deep-link buttons: قراءات المضخات (everyone); قراءة عداد, إقفال مناوبة, قراءة خزان, تعبئة خزان, إضافة شحنة (`roles:['supervisor','manager']`); إضافة تحصيل, إضافة مصروف, مطابقة مناوبة, عرض التقارير (`roles:['finance','manager']`); إدارة المحطات (`roles:['manager']`) | `can(roles) = !roles \|\| auth.isAdmin \|\| roles.includes(auth.role)` |
| **ShiftStatusCard** | «كل المناوبات» → `/shifts`; shift row click → `/shifts/:id` | None |
| **ReconciliationSummary** | Click → `/finance/reconciliations/{id}` | None |
| **AlertsPanel** | Alert rows → `router.push(a.link)` | None |

### 2.3 Readings (primary daily workflow)

| # | Screen (route) | Purpose | Fields | Buttons / actions | Roles |
|---|---|---|---|---|---|
| 5 | **ReadingsView** (`/readings`) | The primary end-of-day operational screen: enter the new cumulative reading per gun (مسدس), with auto-retrieved previous reading, live liters preview, inline corrections, and manager day-closing. See the full breakdown below. | 15 distinct fields (6 repeating per gun) | 17 actions incl. 5 `window.confirm` dialogs | All; day close `v-if="auth.canCloseDay"`; delete `v-if="auth.isAdmin"` |
| 6 | **DeletionLogList** (`/readings/deletions`) | Read-only audit log of every deleted pump reading (day, meter, previous/current reading, liters, reason, deleted-by, time). | None | None | Nav: admin, manager, finance |

**ReadingsView full breakdown** — the most complex screen:

- Header: date picker (reloads), «إقفال اليوم» / «تم إقفال اليوم» button (`auth.canCloseDay` only; two confirms; PUT `status:'submitted'` then POST `/shifts/{id}/close/`), or a passive hint «إقفال اليوم يتم من حساب المدير».
- Progress chip: cycle dates, day-closed banner, "23:00 fallback" warning, done/total count, exception count, total liters (display only).
- Per-gun **pending card**: القراءة السابقة (previous reading — auto-filled, editable; changing it lazily resolves the affected previous day and warns), نوع التصحيح (correction type select, conditional), سبب التصحيح (correction reason, required when previous changed), القراءة الحالية (لتر) (current reading — the one mandatory entry), نوع الاستثناء (exception select: تصفير العداد / استبدال العداد / سبب آخر — required when current < previous or negative), سبب الاستثناء (exception reason). Display: liters preview, expected sales.
- Per-gun **saved card**: previous reading, recorded reading, liters sold + expected sales, "last edited by" audit line, status badge, opening-reading badge.
- Inline editor 1 (تعديل on saved card): previous + current numbers, exception select (5 options), reason text; shows chain-impact warning; حفظ / إلغاء.
- Inline editor 2 (تصحيح القراءة السابقة): corrected value, reason select, reason text; حفظ / إلغاء. Behind a `window.confirm`.
- Inline editor 3 (baseline, «إضافة القراءة السابقة», `canEstablishBaseline` = `canCloseDay && !dayClosed`): baseline number; behind a `window.confirm`.
- Row actions: تعديل (all roles), حذف القراءة (`auth.isAdmin`), + تسجيل استثناء.
- Sticky save: «حفظ القراءات المُدخلة» → `POST /ensure-day-close/` (refuses closed days) then per-gun POST `/meter-readings/`, gun-by-gun, continuing past failures; Arabic count messages.

### 2.4 Stations & infrastructure

| # | Screen (route) | Purpose | Fields | Buttons / actions | Roles |
|---|---|---|---|---|---|
| 7 | **StationList** (`/stations`) | Grid listing all stations with islands/meters/employees/tanks counts. | None | «⚡ إعداد محطة جديدة» → wizard; «+ إضافة بسيطة» → `/stations/create`; card click → detail; per-card «تعديل», «حذف» (confirm dialog); empty-state wizard link | Nav: admin, manager |
| 8 | **StationForm** (`/stations/create`, `/:id/edit`) | Simple create/edit of a station's basic info. | اسم المحطة (required); العنوان; وقت إقفال اليوم (time); إظهار الإيجار في التقارير (checkbox 1/0); نوع العلاقة (select: ملكية/إيجار/وكالة) | «حفظ» (POST/PUT + toast + redirect), «إلغاء» → `/stations` | Nav: admin, manager |
| 9 | **StationDetail** (`/stations/:id`) | Station overview with info strip and 5 infrastructure tabs replacing standalone pages. | None | «← المحطات»; «⬇ تصدير Excel»; «تعديل»; 5 tab switches (الجزر/المضخات/العدادات/الخزانات/الموظفون); per-tab add: إضافة جزيرة → `/islands/create?station=…`, إضافة مضخة → `/machines/create…`, إضافة عداد → `/meters/create…`, إضافة خزان → `/tanks/create…`, إضافة موظف → `/employees/create…`; island card → `/machines?island=…` | Nav: admin, manager |
| 10 | **StationSetupWizard** (`/stations/setup-wizard`) | 4-step wizard creating a complete station (islands, machines, meters, tanks) in one `POST /setup-station/`. | Step 1 (5): اسم المحطة*, وقت إقفال اليوم*, العنوان, نوع العلاقة, شركة التسويق. Step 2 (4): عدد الجزر, عدادات لكل مضخة (افتراضي), per-island مضخات + عدادات/مضخة. Step 3 (4 per tank): نوع الوقود*, السعة (لتر)*, اسم الخزان, المستوى الافتتاحي. Step 4: review summary (read-only) | Stepper jump (backwards only), «السابق», «التالي» (validates), «إنشاء المحطة», per-tank «حذف», «+ إضافة خزان», done: «فتح صفحة المحطة», «إضافة محطة أخرى» | Nav: admin, manager |
| 11 | **IslandList** (`/islands`) | Table of islands with station link, status, machine count. | None | «+ إضافة جزيرة»; row station link → `/stations/:id`; «تعديل»; «حذف» (confirm: deletes its machines and meters too) | Outside nav |
| 12 | **IslandForm** (`/islands/create`, `/:id/edit`) | Create/edit an island (name auto-numbered if blank). | اسم الجزيرة (optional), المحطة (select, required) | «حفظ», «إلغاء» → station page | Outside nav |
| 13 | **MachineList** (`/machines`) | Table of pumps with island, station, meter count. | None | «+ إضافة مضخة»; «تعديل»; «حذف» (confirm) | Outside nav |
| 14 | **MachineForm** (`/machines/create`, `/:id/edit`) | Create/edit a pump. | الجزيرة (select, required), اسم المضخة (optional, auto-numbered) | «حفظ», «إلغاء» | Outside nav |
| 15 | **MeterList** (`/meters`) | Table of meters (nozzles) with code, fuel type, machine, tank, status. | None | «+ إضافة عداد»; «تعديل»; «حذف» (confirm) | Outside nav |
| 16 | **MeterForm** (`/meters/create`, `/:id/edit`) | Create/edit a meter, binding machine + fuel type + tank (auto tank-match on fuel). | المضخة (required), كود العداد (required, e.g. M01A), نوع الوقود (required), الخزان (required) | «حفظ», «إلغاء» | Outside nav |
| 17 | **TankList** (`/tanks`) | Tank overview: 3 summary cards + tank cards with level bars. | None | «+ إضافة خزان»; card click → `/tanks/:id`; «تعديل»; «حذف» (confirm) | Outside nav |
| 18 | **TankForm** (`/tanks/create`, `/:id/edit`) | Create/edit a tank. | المحطة (required), اسم الخزان (required), نوع الوقود (required), السعة (لتر) (required, min 1), المستوى الحالي (لتر) (optional) | «حفظ», «إلغاء» | Outside nav |
| 19 | **TankDetail** (`/tanks/:id`) | Read-only tank detail with level gauge and latest readings table (التاريخ/القراءة/النوع/المسجل). | None | «← الخزانات» | Outside nav |
| 20 | **EmployeeList** (`/employees`) | Table of employees with phone and station. | None | «+ إضافة موظف»; «تعديل»; «حذف» (browser `confirm('حذف؟')`) | Nav: admin, manager |
| 21 | **EmployeeForm** (`/employees/create`, `/:id/edit`) | Create/edit an employee. | الاسم (required), المنصب (optional; not restored on edit — known code gap), الهاتف (optional), المحطة (required) | «حفظ», «إلغاء» | Nav: admin, manager |

### 2.5 Shifts

| # | Screen (route) | Purpose | Fields | Buttons / actions | Roles |
|---|---|---|---|---|---|
| 22 | **ShiftDayView** (`/shifts/day`) | "One screen for the station day": generates the day's shifts from definitions (incl. a 24-hour emergency mode), groups shifts by status, shows the readings grid; all-stations aggregate when no station selected. | date picker (day); station select (`v-if="canSwitch"`, i.e. `auth.isAdmin \|\| ['manager','finance'].includes(role)`) | «⚙ توليد مناوبات اليوم» (POST `/generate-shifts/`); «⚡ وضع الطوارئ (24 ساعة)»; per-row: «+ قراءات» (open), «تفعيل» (scheduled), «إقفال» (submitted), «تفاصيل»; station links in aggregate table | All |
| 23 | **ShiftList** (`/shifts`) | Lists all shifts with status filter chips and inline lifecycle actions; day-close rows badged «إقفال اليوم». | None | «+ إضافة مناوبة»; 6 filter chips (الكل/مجدولة/نشطة/مقدمة/مغلقة/موسّاة); row click → detail; «بدء» (scheduled → open); «تقديم» (open → submitted, confirm); «إقفال» (submitted, `auth.canCloseDay`, confirm) or «بانتظار المدير» hint | All |
| 24 | **ShiftForm** (`/shifts/create`) | Manually creates a single employee shift. | المحطة*, اسم المناوبة*, التعريف (optional), الجزيرة (optional), المناوب (optional), التاريخ*, وقت البدء*, وقت الانتهاء (optional) | «حفظ» (POST), «إلغاء» | All |
| 25 | **ShiftDetail** (`/shifts/:id`) | Shift header (inline-editable, status-locked), its readings, cash/voucher/POS totals, reconciliation panel, corrections log, lifecycle actions, Excel export. | الاسم, المحطة, الجزيرة, المناوب, التاريخ, وقت البدء, وقت الانتهاء, ملاحظات (textarea — the only field editable on a closed shift). Locking: `submitted` locks date/times; `closed` locks everything except notes | «← المناوبات»; «⬇ Excel»; «▶ بدء المناوبة» (scheduled); «+ إضافة قراءات» (open) → `/shifts/:id/readings`; «إنهاء وتقديم» (open, confirm); «إقفال المناوبة وإنشاء التسوية» (submitted + `canCloseDay`, confirm); «↺ إعادة فتح للتصحيح» (submitted/closed + `isAdmin`, confirm); «حفظ التعديلات» (confirm) | All; close gated by `canCloseDay`; reopen by `auth.role === 'System Manager' \|\| auth.role === 'Owner'` |
| 26 | **ReadingForm** (`/shifts/:id/readings`) | Legacy per-shift multi-row reading entry with continuity-gap warnings. Per row: العداد*, قراءة الافتتاح (backfilled if blank), قراءة الاختتام, نوع الاستثناء (required on gap), ملاحظات (required with type) | 5 per repeating row | «← المناوبة»; «+ عداد آخر» (add row); «حفظ القراءات» (per-row POST); «إلغاء» | All |
| 27 | **CloseShift** (`/shifts/:id/close`) | Vestigial confirmation stub; performs no action. | None | «العودة للمناوبة» → `/shifts/:id` | All |
| 28 | **DefinitionList** (`/shifts/definitions`) | Lists recurring shift-definition templates. | None | «+ إضافة تعريف»; «تعديل»; «حذف» (confirm) | Nav: admin, manager, supervisor |
| 29 | **DefinitionForm** (`/shifts/definitions/create`, `/:id/edit`) | Create/edit a shift definition template used by the day generator. | اسم التعريف*, المحطة*, الجزيرة (optional), وقت البدء*, وقت الانتهاء*, 7 weekday checkboxes (السبت…الجمعة) | «حفظ», «إلغاء» | Nav: admin, manager, supervisor |
| 30 | **MeterGapReport** (`/shifts/gaps`) | Diagnostic: compares every meter's consecutive readings DB-wide and lists gaps between a previous closing and the next opening. | None | None (computed client-side on mount) | Nav: admin, manager, supervisor |

### 2.6 Finance

| # | Screen (route) | Purpose | Fields | Buttons / actions | Roles |
|---|---|---|---|---|---|
| 31 | **FinanceIndex** (`/finance`) | Hub with 8 navigation cards to finance sub-screens. | None | 8 cards → income, daily-sales, cash, vouchers, pos, expenses, settlements, reconciliations | Nav: admin, manager, finance |
| 32 | **IncomeEntry** (`/finance/income`) | Posts a shift's income in up to three legs (cash, coupons by denomination, POS) with per-leg save results and a `request_id` idempotency key for partial-failure retry. | المحطة*; المناوبة* (open shifts of the station); المبلغ (د.ل) cash; coupon counts 5 د.ل / 6 د.ل / 7 د.ل / 8 د.ل (each with computed value); المبلغ (د.ل) electronic; عدد المعاملات الالكترونية. Display: coupon total, grand-total panel, per-leg ✓/⚠ results, "no open shift" hint | «حفظ الإيرادات» (POST `/income/`; guard «اختر المناوبة أولاً»; partial-failure message; idempotent retry), «إلغاء» → `/finance` | All (nav item has no roles filter) |
| 33 | **DailySales** (`/finance/daily-sales`) | Read-only daily financial sales: KPI cards (cash/coupon/POS/total), coupon-denomination breakdown, expenses and net income. | date picker | «عرض»; «طباعة» | All |
| 34 | **FuelPriceList** (`/finance/fuel-prices`) | Fuel price list with inline add; saving deactivates older prices of the same fuel type. | نوع الوقود*, سعر البيع (د.ل/لتر)*, التكلفة (د.ل/لتر), تاريخ السريان* | «+ إضافة سعر» (toggle form); «حفظ» (POST + deactivate old) | Nav: admin, manager |
| 35 | **CashList** (`/finance/cash`) | Read-only cash collection records (shift, amount, time, receiver, cancelled flag). | None | None | Nav: admin, manager, finance |
| 36 | **VoucherList** (`/finance/vouchers`) | Read-only coupon-sale records (shift, category, count, value, cancelled). | None | None | Nav: admin, manager, finance |
| 37 | **POSList** (`/finance/pos`) | Read-only POS records (shift, amount, transaction count, cancelled). | None | None | Nav: admin, manager, finance |
| 38 | **ExpenseList** (`/finance/expenses`) | Expense list with category and payment-method labels. | None | «+ إضافة مصروف»; «تعديل»; «حذف» (browser confirm) | Nav: admin, manager, finance |
| 39 | **ExpenseForm** (`/finance/expenses/create`, `/:id/edit`) | Create/edit an expense. | المحطة*, الفئة*, المبلغ (د.ل)*, الوصف, يوم المصروف* (belongs-to date), طريقة الدفع (نقدي/كوبونات/آخر) | «حفظ», «إلغاء» | Nav: admin, manager, finance |
| 40 | **SettlementList** (`/finance/settlements`) | Voucher settlements with totals, paid amount, status badges. | None | «+ إضافة تسوية»; «تعديل» → `/finance/settlements/:id/edit` (no such route exists — dead link) | Nav: admin, manager, finance |
| 41 | **SettlementForm** (`/finance/settlements/create`) | Create/edit a voucher settlement: station + coupon counts per denomination + paid amount (totals computed by backend). | المحطة*; counts 5/6/7/8 د.ل; المبلغ المدفوع (د.ل); hidden `submission_date` | «حفظ», «إلغاء» | Nav: admin, manager, finance |
| 42 | **SettlementDetail** (`/finance/settlements/:id`) | Read-only settlement detail with per-denomination counts. | None (ad-hoc browser `prompt('المبلغ المدفوع:')` for partial payment) | «← التسويات»; «تحديد كمدفوع» (submitted/draft); «دفع جزئي» (submitted/draft, prompt) | Nav: admin, manager, finance |
| 43 | **DepositList** (`/finance/deposits`) | Advance-deposit invoices: deposit, allocated, running balance per row. | None | «+ إضافة دفعة» | Nav: admin, manager, finance |
| 44 | **DepositForm** (`/finance/deposits/create`, `/:id/edit`) | Create/edit a station advance deposit (invoice details, account/sales-office/receipt numbers, fuel product, amount). | المحطة*; رقم الفاتورة*; تاريخ الفاتورة*; رقم حساب المحطة; مكتب المبيعات; رقم الإيصال المالي; منتج الوقود; مبلغ الإيداع (د.ل)*; عدد الشحنات المحجوزة (read-only); المرجع; ملاحظات | «حفظ», «إلغاء» | Nav: admin, manager, finance |
| 45 | **ReconciliationList** (`/finance/reconciliations`) | Financial reconciliations (expected vs. actual per shift). | None | Row click → `/finance/reconciliations/:id` | Nav: admin, manager, finance |
| 46 | **ReconciliationDetail** (`/finance/reconciliations/:id`) | Read-only reconciliation detail: per-fuel expected sales, collections (cash/vouchers/POS), difference type, expenses, net cash, status. | None | «← التسويات»; «⬇ تصدير Excel» (`/api/export/?view=reconciliation…`) | Nav: admin, manager, finance |

### 2.7 Inventory

| # | Screen (route) | Purpose | Fields | Buttons / actions | Roles |
|---|---|---|---|---|---|
| 47 | **DeliveryList** (`/inventory/deliveries`) | Lists fuel deliveries: expected vs. received vs. shortage, schedule link column. | None | «+ إضافة شحنة» → `/inventory/shipments/create?type=delivery`; row click → delivery detail | All |
| 48 | **ShipmentForm** (`/inventory/shipments/create` · `/:id` · deliveries/create · shipment-schedules/create) | Unified three-mode form: **schedule** (planned shipment against a deposit invoice), **delivery** (actual receipt into a tank), **arrival** (receipt of a specific schedule, optionally marking it delivered in the same save). Mode resolution: `route.meta.forceType` > `?type=arrival&schedule=` > `?type=delivery` > schedule. See §6 flag. | **Schedule (≈10):** الفاتورة/الإيداع* (autofills invoice, station, fuel, supplier, serial), المحطة*, نوع الوقود*, المورد, الكمية (لتر)*, تاريخ الشحن المتوقع*, advanced: سعر الشراء/التكلفة للتر (8 decimals), المسلسل (1–15), الحالة (edit only), ملاحظات; deposit panel (مبلغ الإيداع/المحجوز/المتبقي + over-commit and fuel-mismatch alerts) | Segmented toggle «شحنة مجدولة»/«تسجيل توريد» (create, unforced); quick quantity «40,000»/«20,000» (delivery, non-arrival); «خيارات متقدمة» toggle; «حفظ» (POST/PUT schedule → `/shipment-schedules/`, delivery → `/deliveries/` + arrival PUT schedule `{delivery, status:'delivered'}` if confirmArrival); «إلغاء»; inline links «سجّل فاتورة الإيداع أولاً» → `/finance/deposits/create?station=…`, «فتح جدول الشحنة»/«عرض الجدول» → schedule | All |
|   | | | **Delivery (≈12):** المحطة*; الخزان* (fixes fuel type); نوع الوقود (read-only, derived); الكمية (لتر)*; تاريخ الاستلام الفعلي* (datetime, default now); التاريخ المجدول (arrival only); تأكيد الاستلام checkbox (arrival only, default true); advanced: رقم الفاتورة, تاريخ الطلب, شحنة غير مجدولة/إضافية, القراءة قبل, القراءة بعد; computed panel الكمية المستلمة + النقص with note «يمكن إنشاء مطالبة نقص بعد الحفظ» | | |
| 49 | **DeliveryDetail** (`/inventory/deliveries/:id`) | Single delivery details with status transitions. | None | «← الشحنات»; «غير مسلّمة»; «مرحلة»; «تأكيد الاستلام» (sets arrival_date) | All |
| 50 | **ShipmentScheduleList** (`/inventory/shipment-schedules`) | Lists scheduled shipment lines (serial-numbered against deposits) with status. | None | «+ إضافة شحنة» → schedule mode; «استلام» (scheduled/dispatched rows) → arrival mode; «تعديل» → schedule edit | Nav: admin, manager, finance |
| 51 | **TankReadingList** (`/inventory/tank-readings`) | Tank dip readings list + inline add form. | Tank* (select); القراءة* (number); type select (يومية default / افتتاحية / قبل التوريد / بعد التوريد) | «+ إضافة قراءة» (toggle); «حفظ» (POST) | All |
| 52 | **TransferList** (`/inventory/transfers`) | Tank-to-tank transfers with status; rows not clickable (no detail route). | None | «+ إضافة تحويل» | Nav: admin, manager |
| 53 | **TransferForm** (`/inventory/transfers/create`) | Creates a completed transfer restricted to same-station, same-fuel tanks. | المحطة*; من خزان* (shows level %); إلى خزان* (filtered; compatibility hint «لا يوجد خزان آخر…»); الكمية (لتر)* (with available-in-tank helper); السبب | «حفظ» (guard: same-tank refused; POST status completed); «إلغاء» | Nav: admin, manager |
| 54 | **ShortageList** (`/inventory/shortages`) | Read-only shortage claims against deliveries with status (لم يتم المطالبة/تم المطالبة/تمت التسوية/مغلقة). | None | None (no create button despite ShipmentForm's "claim after save" note) | Nav: admin, manager |
| 55 | **FuelReconciliationList** (`/inventory/fuel-reconciliation`) | Read-only fuel reconciliations: theoretical vs. actual vs. variance per tank. | None | None | Nav: admin, manager, finance |
| 56 | **RequestList** (`/inventory/requests`) | Supply (delivery) requests with priority and status. | None | «+ إضافة طلب»; row click → detail | All |
| 57 | **RequestForm** (`/inventory/requests/create`) | Creates a supply request for a tank (fuel derived from tank). | المحطة*; الخزان* (fuel + level % in label); الكمية المطلوبة (لتر)*; الأولوية (عادي/عاجل/حرج); السبب | «حفظ» (POST with fuel_type + current_level snapshot); «إلغاء» | All |
| 58 | **RequestDetail** (`/inventory/requests/:id`) | Request detail driving the approval workflow. | None | «← الطلبات» (bar hidden when received/cancelled); «موافقة» (pending); «تم الشحن» (approved); «تم الاستلام» (dispatched); «إلغاء» (any non-terminal status) | All |

### 2.8 Reports

| # | Screen (route) | Purpose | Fields | Buttons / actions | Roles |
|---|---|---|---|---|---|
| 59 | **DailyReport** (`/reports/daily`) | Daily fuel-sales report: totals + per-station comparison, single date. | التاريخ (date, default today/query) | «عرض»; «🖨️ طباعة» | All |
| 60 | **DailyStatementReport** (`/reports/daily-statement`) | Printable monthly "daily statement of account": one row per day (liters, expected sales, cash/vouchers/POS, expenses, net, daily + running difference) + totals. | الشهر (select, 12 Arabic months); السنة (number) | «عرض»; «طباعة» | Nav: admin, manager, finance |
| 61 | **MonthlyReport** (`/reports/monthly`) | Printable monthly report: KPI totals, reconciliation difference, per-fuel breakdown, per-station summary, print signature block. | الشهر; السنة | «عرض»; «طباعة»; «⬇ Excel» (station export link) | Nav: admin, manager, finance |
| 62 | **InventoryReport** (`/reports/inventory`) | Tank inventory levels with fill bars/color alerts + pending supply requests. Auto-loads. | None | None | All |
| 63 | **BalanceReport** (`/reports/balance`) | Monthly balance: deposits, shipment costs, rent (hidden if `rent_hidden`), adjustments, running balance. | السنة (number); الشهر (number 1–12) | «عرض» | Nav: admin, manager, finance |
| 64 | **DeliveryPrint** (`/reports/delivery-print`) | Printable delivery report over a date range: KPI totals + per-delivery table. | من تاريخ (date); إلى تاريخ (date) | «هذا الأسبوع»; «الأسبوع الماضي»; «هذا الشهر»; «الشهر الماضي» (presets); «توليد»; «🖨️ طباعة» | Nav: admin, manager, finance |
| 65 | **ShipmentReport** (`/reports/shipments`) | Monthly shipments report: KPI totals + per-shipment table with scheduled/actual dates and status. | الشهر (select); السنة (number) | «عرض»; «🖨️ طباعة» | Nav: admin, manager, finance |

### 2.9 Settings & guide

| # | Screen (route) | Purpose | Fields | Buttons / actions | Roles |
|---|---|---|---|---|---|
| 66 | **UsersList** (`/settings/users`) | Admin user management: role/station/enabled status per user; password reset modal. | كلمة المرور الجديدة (in modal; min 6 chars per hint) | «+ إضافة مستخدم»; «تعديل»; «كلمة مرور جديدة» (opens modal); «تفعيل» (disabled users); «تعطيل» (enabled users); modal «إلغاء»/backdrop; modal «حفظ» (POST `/auth/set-user-password/`) | Nav: admin only |
| 67 | **UserForm** (`/settings/users/create`, `/:id/edit`) | Create/edit a user account. | اسم المستخدم (required; disabled on edit); كلمة المرور (create only); الاسم الأول; اسم العائلة; البريد الإلكتروني; الدور (required: admin/owner/supervisor/finance; default supervisor); المحطة (shown when role ≠ admin) | «حفظ» (POST/PUT), «إلغاء» | Nav: admin only |
| 68 | **ReferenceData** (`/settings/reference-data`) | Manages fuel types, voucher categories (with value), expense categories — prerequisites for setup/readings/vouchers/expenses. | الاسم (per group, 3 inputs); القيمة (د.ل) (voucher categories only) | «+ إضافة» ×3 (per group; disabled when name empty; POST + reload) | Nav: admin, manager |
| 69 | **GuideView** (`/guide`) | Static printable Arabic operating manual (9 sections) for managers, accountants, and shift supervisors. | None | «🖨️ طباعة الدليل» (`window.print()`); 9 anchor quick-nav pills | All |

---

## 3. Main workflows end to end

### 3.1 Starting a shift (employee shift)

**Prerequisite (rare setup):** shift definitions exist (`/shifts/definitions/create`), employees exist.

**Path A — generated from definitions (the designed flow):**
1. Sidebar «يوم المحطة» → `/shifts/day` — *1 click*
2. «⚙ توليد مناوبات اليوم» — *1 click* (POST `/generate-shifts/`; creates the day's shifts from active definitions; report message shows created/existing counts)
3. In the «مجدولة» group, «تفعيل» → `/shifts/:id` — *1 click*
4. «▶ بدء المناوبة» — *1 click* (PUT `{status:'open'}`)
   **Total: 4 clicks** (plus date field if not today; station field if switchable).

**Path B — manual creation:**
1. Sidebar «المناوبات» → `/shifts` — *1 click*
2. «+ إضافة مناوبة» → `/shifts/create` — *1 click*
3. Fill 8 fields (station, name, optional definition/island/employee, date, start, optional end)
4. «حفظ» → back at `/shifts` — *1 click*
5. «بدء» on the row — *1 click*
   **Total: 4 clicks + an 8-field form.**

The reading cycle itself is **not** tied to shifts: the pump-reading cycle is a full-day period bounded by `Station.day_close_time`; the day-close `Shift` (`is_day_close=1`) is auto-created server-side on the first reading save (`POST /ensure-day-close/`), so no explicit "open the reading day" action exists.

### 3.2 Recording a fuel sale

**Fuel volumes (gun readings):**
1. Sidebar «قراءات المضخات» → `/readings` — *1 click* (dashboard alternatives: the readings banner, TodayPanel gun rows, «شاشة الإدخال», QuickActions «قراءات المضخات» — all 1 click)
2. Type the current reading per gun; the previous reading is auto-filled (editable; a changed previous demands a correction reason; a backwards reading demands an exception type + reason)
3. «حفظ القراءات المُدخلة» — *1 click* (day-close container auto-ensured; gun-by-gun save with per-gun failure reporting)
   **Total: 2 clicks + typing** (more only when correcting a previous value or booking an exception: extra fields, no extra clicks).

**Money (income against the shift):**
1. Sidebar «إدخال إيرادات» → `/finance/income` — *1 click* (or QuickActions «إضافة تحصيل»)
2. Pick station (if not preselected), pick the open shift, type cash amount and/or coupon counts (5/6/7/8 د.ل) and/or POS amount + transaction count
3. «حفظ الإيرادات» — *1 click* (three legs saved with a shared `request_id`; partial failure keeps the idempotency key so retry never double-posts)
   **Total: 2 clicks + a 9-field form.**

### 3.3 Handling a fuel delivery

**Path A — deposit-linked scheduled delivery (the documented PR-15-F-05 flow):**
1. `/finance/deposits` (sidebar «الدفعات المقدمة») — *1 click*
2. «+ إضافة دفعة» — *1 click* → DepositForm
3. Fill 10 editable fields; «حفظ» — *1 click* → back at DepositList
4. `/inventory/shipment-schedules` (sidebar «جدول الشحنات») — *1 click*
5. «+ إضافة شحنة» — *1 click* → ShipmentForm schedule mode
6. Pick the deposit invoice (autofills invoice number, station, fuel, supplier, next serial); type quantity and expected shipping date (advanced: unit price, serial); «حفظ» — *1 click*
7. Later, in ShipmentScheduleList, «استلام» on the row — *1 click* → ShipmentForm arrival mode (pre-filled from the schedule)
8. Enter actual quantity and (advanced) dip readings (before/after → computed received + shortage); «حفظ» — *1 click* (creates the delivery; checkbox default-on marks the schedule «مُسلّمة» in the same save)
   **Total: 8 clicks + two forms (10 + ~4 fields).**

**Path B — direct unscheduled delivery:**
1. Dashboard «+ إضافة شحنة» (or DeliveryList «+ إضافة شحنة» / QuickActions «إضافة شحنة») — *1 click*
2. Delivery mode: pick station and tank (fuel type auto-derived); type quantity (quick-fill «40,000» / «20,000» buttons); arrival datetime defaults to now; optional dip readings
3. «حفظ» — *1 click*
   **Total: 2 clicks + ~3–5 fields.**

**Post-delivery status correction (optional):** `/inventory/deliveries` → row click → DeliveryDetail → «غير مسلّمة» / «مرحلة» / «تأكيد الاستلام» — 3 clicks.
**Shortage claim:** ShipmentForm shows «يمكن إنشاء مطالبة نقص بعد الحفظ», but `ShortageList` has no create action in the UI — the claim creation is not reachable from any screen in this repo; the list is read-only.

### 3.4 Closing a shift / closing the day

**Employee shift close (two actors):**
1. Supervisor: `/shifts` — *1 click*; «تقديم» — *1 click*; confirm — *1 click* → status submitted (**3 clicks**). Or ShiftDetail: «إنهاء وتقديم» + confirm.
2. Manager/finance: same list; «إقفال» — *1 click*; confirm — *1 click* (POST `/shifts/{id}/close/` → creates the Reconciliation) — **2 clicks**. Non-authorized users see «بانتظار المدير» instead.
   Alternative in ShiftDetail: «إقفال المناوبة وإنشاء التسوية» + confirm. The dedicated route `/shifts/:id/close` (CloseShift.vue) is a stub that only links back to the shift.

**Day close (the financial daily close, on ReadingsView):**
1. Sidebar «قراءات المضخات» — *1 click*
2. «إقفال اليوم» (`auth.canCloseDay` only) — *1 click*
3. Confirm 1 (only if guns remain unrecorded: «هناك قراءات لم تُسجّل بعد…») — *0–1 click*
4. Confirm 2 («إقفال اليوم سيحسب المبيعات المتوقعة وينشئ التسوية المالية. متابعة؟») — *1 click* → PUT submitted + POST close → reconciliation created
   **Total: 2–3 clicks.** Non-authorized roles see the hint «إقفال اليوم يتم من حساب المدير».

**Correction after close:** any role can «تعديل» a saved reading even on a closed day (backend refreshes that day's reconciliation); «حذف القراءة» is admin-only; reopening a submitted/closed shift is «↺ إعادة فتح للتصحيح», admin only (`role === 'System Manager' || role === 'Owner'`).

### 3.5 Reporting

| Report | Clicks |
|---|---|
| Daily report | Sidebar «التقرير اليومي» (1) → «عرض» (1) → «🖨️ طباعة» (1) = **3** |
| Daily statement | Sidebar «كشف الحساب اليومي» (1) → pick month/year → «عرض» (1) → «طباعة» (1) = **3** |
| Monthly report | Sidebar «التقرير الشهري» (1) → pick month/year → «عرض» (1) → «طباعة» / «⬇ Excel» (1) = **3** |
| Inventory & supply | Sidebar «المخزون والتوريد» (1) = **1** (auto-loads) |
| Balance | Sidebar «تقرير الرصيد» (1) → pick year/month → «عرض» (1) = **2** |
| Delivery print | Sidebar «تقرير التسليم للطباعة» (1) → optional preset (1) → «توليد» (1) → «طباعة» (1) = **3–4** |
| Shipments monthly | Sidebar «تقرير الشحنات الشهري» (1) → «عرض» (1) → «طباعة» (1) = **3** |
| Meter gaps | Sidebar «فجوات العدادات» (1) = **1** (auto-computes) |
| Excel export | one direct link click from Dashboard / StationDetail / ShiftDetail / ReconciliationDetail / MonthlyReport = **1** |

---

## 4. Feature list by expected frequency of use

Tagged from code evidence: nav placement (mobile bottom nav, quick actions, "primary screen" comments), defaults (`daily` reading type, "today" defaults), presets (week/month ranges), and comments in the code.

### Daily
| Feature | Evidence |
|---|---|
| Pump-gun reading entry (`/readings`) | Comment: "primary end-of-day operational page"; dashboard's primary action; mobile bottom nav |
| Day close (financial daily close) | Same screen; `ensure-day-close` cycle per station day |
| Dashboard | Home route; "شن المطلوب مني اليوم؟" |
| Shift generation & day view (`/shifts/day`) | Daily generator with `day_close_time` cycle |
| Shift list/lifecycle (start/submit/close) | Bottom nav; QuickActions «إقفال مناوبة» |
| Income entry (cash/coupons/POS legs) | Bottom nav «الإيرادات»; QuickActions «إضافة تحصيل» |
| Tank dip readings (daily type is the default) | Reading type select defaults to `يومية` |
| Daily report | Bottom nav «التقارير»; date defaults to today |
| Daily financial sales (`/finance/daily-sales`) | Date defaults to today |
| Station selection (global context) | Enforced on every navigation |

### Weekly
| Feature | Evidence |
|---|---|
| Fuel deliveries & unified shipment form | Delivery workflow; quick-fill 40,000/20,000 L buttons for tanker sizes |
| Shipment schedules against deposit invoices | Per-invoice serials 1–15 (PR-15-F-05 lines) |
| Supply requests (approvals/dispatch/receipt) | Priority levels; InventoryReport surfaces pending ones |
| Tank transfers | Same-station, same-fuel operational movements |
| Deposit invoices (`/finance/deposits`) | Linked to shipments; balance report consumes them |
| Voucher settlements + settlement detail actions | Settling coupons accumulated over shifts |
| Expenses | Recorded against expense days; consumed by daily/monthly reports |
| Delivery print report | Has explicit **week** presets («هذا الأسبوع», «الأسبوع الماضي») |
| Balance report | Monthly cadence input (year/month) |
| Daily statement of account | Month/year selector |
| Fuel reconciliation (inventory) & reconciliation review | Generated by closes; reviewed periodically |

### Rarely
| Feature | Evidence |
|---|---|
| Station setup wizard / station create-edit | One-time per station; nav comment "Infrastructure… managed inside the station page tabs + wizard" |
| Islands / machines / meters / tanks CRUD | Setup-time infrastructure; no nav items (removed deliberately, comment Q2) |
| Employees CRUD | Setup-time; nav present but low-churn |
| Shift definitions | Templates created once, consumed daily by the generator |
| Fuel prices | Saved price deactivates old ones — price-change events only |
| Reference data (fuel types, voucher/expense categories) | Setup-time prerequisite ("بدونها لا يمكن إعداد محطة…") |
| User management, password resets, enable/disable | Admin-only, exceptional |
| Monthly & shipment reports, monthly shipments report | Month/year selectors — monthly cadence |
| Meter gap report, reading deletion log | Diagnostics/audit ("لا يمكن أن تُعدَّل أو تُحذف" — read-only) |
| Guide (printable manual) | Reference material |
| Station detail infrastructure review | Passive overview |
| Reopen shift for correction | Admin-only exceptional action |

---

## 5. Permission model

### 5.1 Roles

| Code value | Arabic label(s) in code | Where |
|---|---|---|
| `admin` / `is_staff` | «مدير النظام» | Layout roleLabel, UsersList (badge-red) |
| `manager` | «مالك» (layout roleLabel), «مالك/مدير» (UsersList) | Layout roleLabel / UsersList |
| `owner` | «مالك» | **Only in UserForm's role select** — a user saved as `owner` matches none of the nav `roles` arrays (`['manager',…]`) and would only see ungated items |
| `supervisor` | «مشرف» | Both |
| `finance` | «مالي» | Both |

Store getters (`stores/auth.js`): `isAdmin = is_staff || role==='admin'`; `isOwner = role==='admin'`; `canCloseDay = is_staff || ['admin','manager','finance'].includes(role)`.

### 5.2 Frontend nav visibility (DefaultLayout `can(roles)`; omitted = everyone; admin always sees all)

| Screen / nav item | admin | manager | supervisor | finance |
|---|---|---|---|---|
| Dashboard, Readings, Station day, Shifts, Income entry, Daily financial sales, Deliveries, Tank readings, Supply requests, Daily report, Inventory & supply report, Guide | ✔ | ✔ | ✔ | ✔ |
| Reading deletion log | ✔ | ✔ | — | ✔ |
| Stations list / setup wizard | ✔ | ✔ | — | — |
| Employees | ✔ | ✔ | — | — |
| Shift definitions | ✔ | ✔ | ✔ | — |
| Finance hub, Cash, Vouchers, POS, Expenses, Settlements, Deposits | ✔ | ✔ | — | ✔ |
| Fuel prices | ✔ | ✔ | — | — |
| Transfers, Shortages | ✔ | ✔ | — | — |
| Fuel reconciliation (inventory), Shipment schedules | ✔ | ✔ | — | ✔ |
| Daily statement, Monthly report, Balance report, Shipments report, Delivery print | ✔ | ✔ | — | ✔ |
| Meter gaps | ✔ | ✔ | ✔ | — |
| User management | ✔ | — | — | — |
| Reference data | ✔ | ✔ | — | — |

In-view gating on top of nav visibility:

| Action | Gate (exact code) |
|---|---|
| Day close button (ReadingsView) | `v-if="auth.canCloseDay"` |
| Close shift in ShiftList / ShiftDetail | `v-if="s.status === 'submitted' && auth.canCloseDay"` |
| Reopen shift | `v-if="(submitted \|\| closed) && isAdmin"` with `isAdmin = auth.role === 'System Manager' \|\| auth.role === 'Owner'` |
| Delete a reading | `v-if="auth.isAdmin"` + `if (!auth.isAdmin) return` |
| Establish baseline previous reading | `canEstablishBaseline = auth.canCloseDay && !dayClosed` |
| Correct previous reading | `canCorrectPrevious = auth.isLoggedIn` (any role, incl. closed day) |
| Setup wizard link on select-station | `v-if="auth.isAdmin \|\| auth.role === 'manager'"` |
| Station select in ShiftDayView | `canSwitch = auth.isAdmin \|\| ['manager','finance'].includes(auth.role)` |
| QuickActions items | `can(roles)` with `['supervisor','manager']`, `['finance','manager']`, `['manager']` |

Note: **none of the finance or inventory view files contains any role gating**; their protection is nav-visibility plus the backend API. ShiftDetail's "waiting for the manager" hint is shown to non-admins even when they hold `canCloseDay`.

### 5.3 Backend DocType permission matrix (quoted from DOCUMENTATION.md §8.2)

| DocType | System Manager | Sejel Manager | Sejel Supervisor | Sejel Finance |
|---|---|---|---|---|
| Station, Island, Machine, Meter, Tank, Employee, Shift Definition, Shift, Meter Reading | CRUD | CRUD | R (Shift/Reading/Machine: CRUD) | R (— for Island/Machine/Meter/Tank/Employee/Shift Definition) |
| Fuel Type, Marketing Company | CRUD | CRUD | R | R |
| Fuel Price | CRUD | CRUD | — | R |
| Tank Reading | CRUD | CRUD | CRUD | — |
| Cash Collection | CRUD | CRUD | CRUD | CRUD |
| Voucher, POS Record | CRUD | — | CRUD | CRUD |
| Expense, Expense Category | CRUD | CRUD | R (Expense) / — (Category) | CRUD (Expense) / R (Category) |
| Voucher Category | CRUD | CRUD | — | R |
| Voucher Settlement | CRUD | CRUD | — | CRUD |
| Reconciliation | CRUD | CRUD | — | R |
| Shift Fuel Summary | CRUD | — | — | CRUD |
| Delivery | CRUD | CRUD | R | CRUD |
| Delivery Request | CRUD | CRUD | CRUD | — |
| Shortage Claim, Fuel Reconciliation | CRUD | CRUD | — | R |

**Station scoping (server-enforced, `api/scoping.py`):** users with `User.sejel_station` set (any role except admin/manager) see and write only their station; a `?station=` parameter can only narrow scope, never widen it; payloads naming a foreign station are refused. Unbound users keep the multi-station selector.

---

## 6. Screens with more than ~10 fields or actions (flags)

| Screen | Fields | Actions | Total | Notes |
|---|---|---|---|---|
| **ReadingsView** (`/readings`) | 15 (6 repeating per gun, plus 3 inline editors) | 17 (incl. 5 confirm dialogs) | **32** | The system's most complex screen by far: pending card (6 fields), reading editor (4), fix editor (3), baseline editor (1), 12 buttons |
| **ShipmentForm** (all shipment/delivery/schedule routes) | ~10 (schedule) / ~12 (delivery incl. arrival) | ~8–11 (toggle, quick-fills, advanced toggle, save, cancel, inline links) | **~18–23 depending on mode** | One form serving three modes; delivery mode with arrival + advanced open is the widest |
| **StationSetupWizard** (`/stations/setup-wizard`) | 13 distinct field types (repeating per island/tank) | 8 buttons | **21** | Spread across 4 steps, so per-step load is lower (Step 3 repeats 4 fields per tank) |
| **ShiftDetail** (`/shifts/:id`) | 8 (status-locked) | 8 (+4 confirms, +1 hint) | **16–17** | Inline-editable header + lifecycle actions + export on one page |
| **DepositForm** (`/finance/deposits/…`) | 11 (10 editable + 1 read-only) | 2 | **13** | Longest flat form in the finance module |
| **DefinitionForm** (`/shifts/definitions/…`) | 12 (5 inputs + 7 weekday checkboxes) | 2 | **14** | The 7 checkboxes inflate the count |
| **DashboardView** (`/`) | 0 | 12 interactions (plus sub-component actions: 11 QuickActions buttons, TodayPanel primary action + per-gun links, alerts, drawers) | **12 + sub-components** | Action count lives mostly in QuickActions/TodayPanel/AlertsPanel |
| **StationDetail** (`/stations/:id`) | 0 | 12 (5 tabs + 5 adds + back/export/edit) + island-card nav | **13** | Tab-based, so visible at once ≈ header actions + one tab |
| **IncomeEntry** (`/finance/income`) | 9 | 2 (+ per-leg result panel) | **11** | Borderline at the ~10 threshold |

Screens close to but at/below the threshold: UserForm (7+2 = 9), ShiftForm (8+2 = 10), RequestForm (5+2), ExpenseForm (6+2), SettlementForm (6+2), TransferForm (5+2), ShipmentScheduleList (0+3), DeliveryPrint (2+6 = 8).

---

## Appendix — factual code observations (not judged, recorded as found)

1. `SettlementList` «تعديل» links to `/finance/settlements/:name/edit`, which **matches no registered route** (only `/finance/settlements/:id` detail exists).
2. `UserForm` offers role `owner`; the nav gating and QuickActions check `manager`/`finance`/`supervisor` — an `owner`-role user passes only ungated items. `UsersList` renders `owner` via the raw-value fallback because its label map keys on `manager`.
3. `EmployeeForm` does not restore `position` (المنصب) on edit; saving an edit silently clears it.
4. `ShortageList` is read-only; no screen in the SPA creates a shortage claim, although ShipmentForm's computed panel says one can be created after saving.
5. `CloseShift.vue` (`/shifts/:id/close`) is a stub whose only action returns to `/shifts/:id`; actual closing happens in ShiftList/ShiftDetail/ReadingsView.
6. `StationSetupWizard` requires fuel types to exist first (validation «أكمل نوع الوقود والسعة لكل خزان»); ReferenceData's header states the same dependency.
7. IslandList's delete confirm states deleting an island also deletes its machines and meters.
8. `MeterGapReport` fetches all meters and all readings client-side and computes gaps in the browser.
9. `FuelPriceList.save()` deactivates older prices with errors deliberately swallowed (`.catch(() => {})`).
10. The dashboard's `TodayPanel` shows a «(مؤقت)» 23:00 fallback when `Station.day_close_time` is unset; ReadingsView shows the same warning chip.
11. Station-bound users see a fixed sidebar card («محطة مرتبطة بحسابك») instead of the selector; station switching triggers a full page reload.
12. Two confirm dialogs exist on day close when readings remain; one otherwise.
