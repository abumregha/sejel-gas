# Sejel Browser QA — run log

- Date: 2026-10-03T07:47:08.131Z
- Target: http://localhost:8004
- Browser: Playwright Chromium (headless)


## Environment

- viewport: 1366x768
- load ms: 1668
- console errors at baseline: 1

## Login negative tests

- empty-creds error text present: false
- invalid-user error text present: true
- no password echo in error text: true

## DEFECT QA-2 [P2] Dashboard — reading cycle visibility

- Repro: Login → land on the KPI dashboard (الرئيسية) with any station
- Expected: Operator sees the active reading period (11:00 → 11:00) alongside the daily KPIs
- Actual: The dashboard KPI page never displays دورة القراءة or the 11:00 cycle — it exists only on the readings screen
- Evidence: body text captured in run log; screenshots qa-02-owner-dashboard.png

## Dashboard first impression

```
سجل
🏠
الرئيسية
العمليات
🎯
قراءات المضخات
🗓️
يوم المحطة
🔄
المناوبات
⛽
المحطات
🧭
إعداد محطة
👥
الموظفين
📋
تعريفات المناوبات
المالية
💰
المالية
📥
إدخال إيرادات
📊
المبيعات المالية
💲
أسعار الوقود
💵
النقدية
🎫
القسائم
🏧
الدفع الإلكتروني
🧾
المصروفات
📑
تسوية القسائم
المخزون
🚚
الشحنات
📖
قراءات الخزانات
🔁
التحويلات
⚠️
النقص
📉
تسوية الوقود
📝
طلبات التوريد
التقارير
📅
التقرير اليومي
📆
التقرير الشهري
📦
المخزون والتوريد
🔍
فجوات العدادات
الإعدادات
📖
دليل الاستخدام
سجل — نظام إدارة محطات الوقود
owner
manager
لوحة إدارة المحطات
الدليل
جميع المحطات
محطة تجريبية — سجل
محطة تجريبية — سجل
الطريق العام — تجريبي
اللترات
0
التحصيل
0
الفرق
—
2 خزانات
2 منخفضة
المخزون 0%
🙂
```

## Admin dashboard

```
سجل
🏠
الرئيسية
العمليات
🎯
قراءات المضخات
🗓️
يوم المحطة
🔄
المناوبات
⛽
المحطات
🧭
إعداد محطة
👥
الموظفين
📋
تعريفات المناوبات
المالية
💰
المالية
📥
إدخال إيرادات
📊
المبيعات المالية
💲
أسعار الوقود
💵
النقدية
🎫
القسائم
🏧
الدفع الإلكتروني
🧾
المصروفات
📑
تسوية القسائم
المخزون
🚚
الشحنات
📖
قراءات الخزانات
🔁
التحويلات
⚠️
النقص
📉
تسوية الوقود
📝
طلبات التوريد
التقارير
📅
التقرير اليومي
📆
التقرير الشهري
📦
المخزون والتوريد
🔍
فجوات العدادات
الإعدادات
👤
إدارة المستخدمين
📖
دليل الاستخدام
سجل — نظام إدارة محطات الوقود
admin
مدير النظام
لوحة إدارة المحطات
الدليل
جميع المحطات
محطة تجريبية — سجل
محطة تجريبية — سجل
الطريق العام — تجريبي
اللترات
0
التحصيل
0
الفرق
—
2 خزانات
2 منخفضة
المخزون 0%
🙂
```

## Role check

- admin stations visible: 1
- admin sees station picker: true

## Console errors (phase 1)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Network ≥400 (phase 1)

- 401 /api/auth/me/
- 401 /api/auth/me/
- 401 /api/auth/me/
- 401 /api/auth/login/
- 401 /api/auth/me/
- 401 /api/auth/login/
- 401 /api/auth/me/
- 401 /api/auth/me/
- 401 /api/auth/me/
- 401 /api/auth/me/
- 401 /api/auth/me/
- 401 /api/auth/me/

## Infrastructure

- islands: 2, pumps: 3, guns: 6
- codes: M01AX, M01BX, M02AX, M02BX, M03A, M03B
- Pump≠Gun preserved: true

## Duplicate-name probe

- wizard success message shown: false
- stations named "QA Test Station" after attempt: 1
- error text on wizard (if any): (none)

## DEFECT QA-6 [P2] Wizard — duplicate station name is silent

- Repro: Create station "X" via wizard → create another station named "X"
- Expected: Clear Arabic error naming the duplicate so the operator can rename
- Actual: Backend 417 on /api/setup-station/; wizard shows neither success nor an actionable error
- Evidence: dupList.length=1 (no new station), network log 417 /api/setup-station/, screenshot qa-18-duplicate-name

## Console errors (phase 2)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)
- Failed to load resource: the server responded with a status of 400 (BAD REQUEST)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 400 (BAD REQUEST)

## Network ≥400 (phase 2)

- 401 /api/auth/me/
- 403 /api/stations/08256678k5/
- 400 /api/ux/client-error/
- 417 /api/setup-station/
- 400 /api/ux/client-error/

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3280418","M01B":"3077096","M02A":"27546777","M02B":"0"}

## Saved readings (backend payload)

[]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 404 (NOT FOUND)

## Edge station guns

8 guns

## Edge station teardown

- direct delete → 403 (blocked: readings/shift history)

## DEFECT QA-9 [P3] Station teardown with operational history

- Repro: Delete a station that has readings/shifts
- Expected: Either guided teardown or clear instruction
- Actual: 417 named-blocker remains even after config cascade; operator must clear history via API
- Evidence: run log teardown section

## Console errors (phase 3 part B)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 404 (NOT FOUND)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 404 /api/dashboard-station/?station=f9sdreji1j&date=2026-10-03
- 417 /api/meter-readings/
- 417 /api/meter-readings/
- 403 /api/stations/0ngg0kmd9n/
- 403 /api/meter-readings/0kvqom32oo/
- 403 /api/meter-readings/0kudlnn0bp/
- 403 /api/meter-readings/0ku03m6j8p/
- 403 /api/meter-readings/0kt1sjubmq/
- 403 /api/shifts/0ktem5p0mn/
- 403 /api/stations/0ngg0kmd9n/

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3288641","M01B":"3085676","M02A":"27546777","M02B":"0"}

## ## QA-32 verification — day 1 (2026-10-20, baseline day)


- guns: 2, opening badges shown: 2
- readings saved: 2
- page tail: "BXX مضخة 1 بنزين مسجلة قراءة افتتاحية — تُحفظ كخط أساس ولا تُحتسب مبيعات القراءة السابقة (تلقائية) 250,100 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / استبدال العداد) أدخلت الآن: 0 · مكتملة: 2/2 الإجمالي: 0 لتر حفظ القراءات المُدخلة 🙂"

## ## QA-32 verification — day 1 close


- text: "لة قراءة افتتاحية — تُحفظ كخط أساس ولا تُحتسب مبيعات القراءة السابقة (تلقائية) 250,100 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / استبدال العداد) أدخلت الآن: 0 · مكتملة: 2/2 الإجمالي: 0 لتر حفظ القراءات المُدخلة 🙂"

## ## QA-32 verification — day 1 reconciliation


```
[
 {
  "name": "2pvilculoi",
  "shift": "2mvdhe7d55",
  "station": "2hsnmfp678",
  "total_liters": 0,
  "expected_sales": 0,
  "total_cash": 0,
  "total_vouchers": 0,
  "total_pos": 0,
  "total_collection": 0,
  "total_expenses": 0,
  "net_cash": 0,
  "difference": 0,
  "difference_type": "matched",
  "status": "draft",
  "modified": "2026-10-03 13:22:51.152851"
 }
]
```

## ## QA-32 verification — day 2 (2026-10-21, sales day)


- guns: 2, opening badges: 0
- entered: [251000,251100]
- readings saved: 2
- page tail: "— + تسجيل استثناء (تصفير / استبدال العداد) M01BXX مضخة 1 بنزين مسجلة القراءة السابقة (تلقائية) 251,100 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / استبدال العداد) أدخلت الآن: 0 · مكتملة: 2/2 الإجمالي: 2,000 لتر حفظ القراءات المُدخلة 🙂"

## ## QA-32 verification — day 2 close


- text: "— + تسجيل استثناء (تصفير / استبدال العداد) M01BXX مضخة 1 بنزين مسجلة القراءة السابقة (تلقائية) 251,100 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / استبدال العداد) أدخلت الآن: 0 · مكتملة: 2/2 الإجمالي: 2,000 لتر حفظ القراءات المُدخلة 🙂"

## ## QA-32 verification — all reconciliations for the QA station


```
[
 {
  "name": "301qdoi1nv",
  "shift": "2t2bgnsc2v",
  "station": "2hsnmfp678",
  "total_liters": 2000,
  "expected_sales": 0,
  "total_cash": 0,
  "total_vouchers": 0,
  "total_pos": 0,
  "total_collection": 0,
  "total_expenses": 0,
  "net_cash": 0,
  "difference": 0,
  "difference_type": "matched",
  "status": "draft",
  "modified": "2026-10-03 13:23:10.586324"
 },
 {
  "name": "2pvilculoi",
  "shift": "2mvdhe7d55",
  "station": "2hsnmfp678",
  "total_liters": 0,
  "expected_sales": 0,
  "total_cash": 0,
  "total_vouchers": 0,
  "total_pos": 0,
  "total_collection": 0,
  "total_expenses": 0,
  "net_cash": 0,
  "difference": 0,
  "difference_type": "matched",
  "status": "draft",
  "modified": "2026-10-03 13:22:51.152851"
 }
]
```

## ## Phase 8 re-verification result


- day 1 (baselines): 2 guns, 2 opening badges, reconciliation 0 L
- day 2 (sales): 2000 L entered → reconciliation [{"liters":2000,"sales":0}]

## ## QA-32 verification — network ≥400

- 401 /api/auth/me/

## ## QA-32 verification — day 1 (2026-10-30, baseline day)


- guns: 2, opening badges shown: 2
- readings saved: 2
- page tail: "اءة افتتاحية — تُحفظ كخط أساس ولا تُحتسب مبيعات القراءة السابقة (تلقائية) 250,100 القراءة الحالية (لتر) لتر اللترات المباعة — المبيعات المتوقعة: 0 د.ل + تسجيل استثناء (تصفير / استبدال العداد) أدخلت الآن: 0 · مكتملة: 2/2 الإجمالي: 0 لتر حفظ القراءات المُدخلة 🙂"

## ## QA-32 verification — day 1 close


- text: " كخط أساس ولا تُحتسب مبيعات القراءة السابقة (تلقائية) 250,100 القراءة الحالية (لتر) لتر اللترات المباعة — المبيعات المتوقعة: 0 د.ل + تسجيل استثناء (تصفير / استبدال العداد) أدخلت الآن: 0 · مكتملة: 2/2 الإجمالي: 0 لتر حفظ القراءات المُدخلة 🙂"

## ## QA-32 verification — day 1 reconciliation


```
[
 {
  "name": "3g2s41jk1e",
  "shift": "3d2mvfeu11",
  "station": "3a3uu0gfpd",
  "total_liters": 0,
  "expected_sales": 0,
  "total_cash": 0,
  "total_vouchers": 0,
  "total_pos": 0,
  "total_collection": 0,
  "total_expenses": 0,
  "net_cash": 0,
  "difference": 0,
  "difference_type": "matched",
  "status": "draft",
  "modified": "2026-10-03 13:24:01.832927"
 }
]
```

## ## QA-32 verification — day 2 (2026-10-31, sales day)


- guns: 2, opening badges: 0
- entered: [251000,251100]
- readings saved: 2
- page tail: "ستبدال العداد) M01BXXX مضخة 1 بنزين مسجلة القراءة السابقة (تلقائية) 251,100 القراءة الحالية (لتر) لتر اللترات المباعة — المبيعات المتوقعة: 150 د.ل + تسجيل استثناء (تصفير / استبدال العداد) أدخلت الآن: 0 · مكتملة: 2/2 الإجمالي: 2,000 لتر حفظ القراءات المُدخلة 🙂"

## ## QA-32 verification — day 2 close


- text: "ستبدال العداد) M01BXXX مضخة 1 بنزين مسجلة القراءة السابقة (تلقائية) 251,100 القراءة الحالية (لتر) لتر اللترات المباعة — المبيعات المتوقعة: 150 د.ل + تسجيل استثناء (تصفير / استبدال العداد) أدخلت الآن: 0 · مكتملة: 2/2 الإجمالي: 2,000 لتر حفظ القراءات المُدخلة 🙂"

## ## QA-32 verification — all reconciliations for the QA station


```
[
 {
  "name": "3m32f74pqe",
  "shift": "3j30v6ts7v",
  "station": "3a3uu0gfpd",
  "total_liters": 2000,
  "expected_sales": 300,
  "total_cash": 0,
  "total_vouchers": 0,
  "total_pos": 0,
  "total_collection": 0,
  "total_expenses": 0,
  "net_cash": 0,
  "difference": -300,
  "difference_type": "shortage",
  "status": "draft",
  "modified": "2026-10-03 13:24:21.127038"
 },
 {
  "name": "3g2s41jk1e",
  "shift": "3d2mvfeu11",
  "station": "3a3uu0gfpd",
  "total_liters": 0,
  "expected_sales": 0,
  "total_cash": 0,
  "total_vouchers": 0,
  "total_pos": 0,
  "total_collection": 0,
  "total_expenses": 0,
  "net_cash": 0,
  "difference": 0,
  "difference_type": "matched",
  "status": "draft",
  "modified": "2026-10-03 13:24:01.832927"
 }
]
```

## ## Phase 8 re-verification result


- day 1 (baselines): 2 guns, 2 opening badges, reconciliation 0 L
- day 2 (sales): 2000 L entered → reconciliation [{"liters":2000,"sales":300}]

## ## QA-32 verification — network ≥400

- 401 /api/auth/me/

## Reconciliation payload (pilot)

null

## Console errors (phase 4)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Network ≥400 (phase 4)

- 401 /api/auth/me/

## ## Phase 5 — inventory screen sweep (as station owner)



## ### /inventory/deliveries (التموين)

- rendered chars: 612
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /inventory/deliveries/create (نموذج تموين)

- rendered chars: 858
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /inventory/tank-readings (قراءات الخزانات)

- rendered chars: 608
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /inventory/transfers (التحويلات)

- rendered chars: 619
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /inventory/transfers/create (نموذج تحويل)

- rendered chars: 887
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /inventory/shortages (العجز)

- rendered chars: 594
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /inventory/fuel-reconciliation (مطابقة الوقود)

- rendered chars: 597
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /inventory/requests (طلبات التموين)

- rendered chars: 612
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /inventory/requests/create (طلب تموين)

- rendered chars: 753
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ## Phase 5 — delivery empty-submit validation

- inline guidance shown: false
- note: the form relies on HTML5 `required` only — an empty submit is blocked by the browser with no persistent in-page Arabic message, and the fuel-type / tank fields are silently left empty.
- page text: "تجريبية — سجل الخزان اختر الخزان خزان 1 (بنزين) خزان 1 (بنزين) خزان 1 (بنزين) (بنزين) خزان 2 (ديزل) خزان 1 (بنزين) نوع الوقود رقم الفاتورة تاريخ الطلب تاريخ الاستلام الكمية المتوقعة (لتر) 40,000 20,000 الكمية المطلوبة (لتر) القراءة قبل القراءة بعد حفظ إلغاء 🙂"

## ## Phase 5 — delivery create


- invoice ref used: QA-INV-727502
- deliveries before: 0, after: 1
- created record: {"name":"a6rnsi3kfi","station":"0ngg0kmd9n","fuel_type":"بنزين","supplier":null,"expected_quantity":5000,"received_quantity":4900,"shortage":100,"invoice_number":"QA-INV-727502","payment_status":"unpaid","status":"received","order_date":"2026-10-03 08:05:00","modified":"2026-10-03 13:35:29.075231"}
- url after save: http://localhost:8004/app/inventory/deliveries

## ## Phase 5 — /inventory/shortages

- text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائم 🏧 الدفع الإلكتروني 🧾 المصروفات 📑 تسوية القسائم المخزون 🚚 الشحنات 📖 قراءات الخزانات 🔁 التحويلات ⚠️ النقص 📉 تسوية الوقود 📝 طلبات التوريد التقارير 📅 التقرير اليومي 📆 التقرير الشهري 📦 المخزون والتوريد 🔍 فجوات العدادات الإعدادات 📖 دليل الاستخدام رجوع سجل — نظام إدارة مح"

## ## Phase 5 — /inventory/fuel-reconciliation

- text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائم 🏧 الدفع الإلكتروني 🧾 المصروفات 📑 تسوية القسائم المخزون 🚚 الشحنات 📖 قراءات الخزانات 🔁 التحويلات ⚠️ النقص 📉 تسوية الوقود 📝 طلبات التوريد التقارير 📅 التقرير اليومي 📆 التقرير الشهري 📦 المخزون والتوريد 🔍 فجوات العدادات الإعدادات 📖 دليل الاستخدام رجوع سجل — نظام إدارة مح"

## ## Phase 5 — /finance/reconciliations

- text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائم 🏧 الدفع الإلكتروني 🧾 المصروفات 📑 تسوية القسائم المخزون 🚚 الشحنات 📖 قراءات الخزانات 🔁 التحويلات ⚠️ النقص 📉 تسوية الوقود 📝 طلبات التوريد التقارير 📅 التقرير اليومي 📆 التقرير الشهري 📦 المخزون والتوريد 🔍 فجوات العدادات الإعدادات 📖 دليل الاستخدام رجوع سجل — نظام إدارة مح"

## ## Phase 5 — network ≥400 (all)

- 401 /api/auth/me/

## ## Phase 5 — console errors (all)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## ## Phase 6 — reports (as station owner)



## ### /reports/daily

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 0 د.ل الفرق -2,520.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 QA Edge Station 0 0 0 0 محطة تجريبية — سجل 16,803 2,520.45 0 -2,520.45 🙂"
- network ≥400: (none)

## ### /reports/monthly

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير الشهري يناير فبراير مارس أبريل مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر عرض طباعة التقرير الشهري — أكتوبر 2026 نظام سجل لإدارة محطات الوقود · صدر بتاريخ 3‏/10‏/2026 إجمالي اللترات 20,803 المبيعات المتوقعة 2,820.45 د.ل التحصيل 0 د.ل المصروفات 0 د.ل النقد الصافي 0 د.ل المناوبات المغلقة 5 فرق المطابقة الإجمالي: -2,820.45 د.ل (عجز) المبيعات حسب نوع الوقود نوع الوقود اللترات المبيعات المتوقعة بنزين 20,803 2,820.45 د.ل مقارنة المحطات المحطة المناوبات اللترات المبيعات التحصيل الفرق QA Cycle 3 2 2,000 300 0 -300 QA Cycle 2 2 2,000 0 0 "
- network ≥400: (none)

## ### /reports/inventory

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المخزون والتوريد 3a3bp6v1tf — % 0 لتر 30,000 لتر 2htcljqpjd — % 0 لتر 30,000 لتر 0nh7pdp63f — % 0 لتر 1 لتر v5t3476079 — % 0 لتر 15,000 لتر v5thhppakt — % 0 لتر 30,000 لتر طلبات توريد معلقة لا توجد طلبات معلقة 🙂"
- network ≥400: (none)

## ### /shifts/gaps

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager فجوات العدادات العداد المحطة القراءة السابقة القراءة الحالية الفجوة (لتر) لا توجد فجوات 🙂"
- network ≥400: (none)

## ### /shifts/day

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager يوم المحطة كل مناوبات وقراءات اليوم في شاشة واحدة جميع المحطات المعنية QA Cycle 3 QA Cycle 2 QA Edge Station محطة تجريبية — سجل ⚙ توليد مناوبات اليوم ⚡ وضع الطوارئ (24 ساعة) مناوبات جارية (0) — مجدولة (لم تبدأ) (0) — بانتظار الإقفال (0) — مغلقة اليوم (0) — شبكة قراءات العدادات مجموع اللترات: 0 لا توجد عدادات — أضف العدادات من صفحة المحطة أولاً 🙂"
- network ≥400: (none)

## ## Phase 6 — daily report for 2026-10-03 (explicit date)

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 0 د.ل الفرق -2,520.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 QA Edge Station 0 0 0 0 محطة تجريبية — سجل 16,803 2,520.45 0 -2,520.45 🙂"

## ## Phase 6 — export endpoint probe


```
[
 {
  "url": "/api/export/?view=station&name=f9sdreji1j",
  "status": 404,
  "contentType": "application/json",
  "length": 0,
  "head": ""
 },
 {
  "url": "/api/export/?view=station",
  "status": 417,
  "contentType": "application/json",
  "length": 0,
  "head": ""
 },
 {
  "url": "/api/export/",
  "status": 417,
  "contentType": "application/json",
  "length": 0,
  "head": ""
 }
]
```

## ## Phase 6 — finance screens (as station owner)



## ### /finance

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager الإدارة المالية 💰 إدخال إيرادات إدخال المبيعات النقدية والكوبونات والإلكترونية 📊 المبيعات المالية عرض ملخص المبيعات اليومية 💵 التحصيل النقدي سجل التحصيلات النقدية 🎫 الكوبونات سجل مبيعات الكوبونات 💳 واصلات POS سجل المبيعات الإلكترونية 📤 المصروفات سجل المصروفات 📑 تسويات الكوبونات تسوية وتحصيل الكوبونات ⚖️ التسويات المالية التسويات والمطابقات ال"
- network ≥400: (none)

## ### /finance/daily-sales

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المبيعات المالية اليومية عرض طباعة المبيعات النقدية 4,000 د.ل مبيعات الكوبونات 180 د.ل المبيعات الإلكترونية 600 د.ل إجمالي التحصيل 4,780 د.ل تفاصيل الكوبونات الفئة العدد القيمة 5 د.ل 2 100 د.ل 8 د.ل 2 80 د.ل الإجمالي 4 180 د.ل المصروفات إجمالي المصروفات:0 د.ل صافي الإيرادات:4,780 د.ل 🙂"
- network ≥400: (none)

## ### /finance/fuel-prices

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager أسعار الوقود تُستخدم لحساب المبيعات المتوقعة عند إقفال المناوبات + إضافة سعر نوع الوقود سعر البيع التكلفة الهامش تاريخ السريان الحالة ديزل 0.15 د.ل 0.12 — 2026-10-01 ساري بنزين 0.15 د.ل 0.12 — 2026-10-01 ساري 🙂"
- network ≥400: (none)

## ### /finance/cash

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التحصيل النقدي المناوبة المبلغ الوقت المستلم مُلغي إقفال يوم 2026-10-03 (2026-10-03) 2,000 د.ل 2026-10-03 08:03:36.956000 — لا إقفال يوم 2026-10-03 (2026-10-03) 2,000 د.ل 2026-10-03 08:02:53.171000 — لا 🙂"
- network ≥400: (none)

## ### /finance/vouchers

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager الكوبونات المناوبة الفئة العدد القيمة مُلغي إقفال يوم 2026-10-03 (2026-10-03) 5 د.ل 10 50 د.ل لا إقفال يوم 2026-10-03 (2026-10-03) 8 د.ل 5 40 د.ل لا إقفال يوم 2026-10-03 (2026-10-03) 8 د.ل 5 40 د.ل لا إقفال يوم 2026-10-03 (2026-10-03) 5 د.ل 10 50 د.ل لا 🙂"
- network ≥400: (none)

## ### /finance/pos

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager واصلات POS المناوبة المبلغ عدد المعاملات مُلغي إقفال يوم 2026-10-03 (2026-10-03) 300 د.ل 1 لا إقفال يوم 2026-10-03 (2026-10-03) 300 د.ل 1 لا 🙂"
- network ≥400: (none)

## ### /finance/expenses

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المصروفات + إضافة مصروف الفئة المبلغ الوصف طريقة الدفع إجراءات لا توجد مصروفات 🙂"
- network ≥400: (none)

## ### /finance/settlements

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager تسويات الكوبونات + إضافة تسوية المحطة التاريخ العدد القيمة المدفوع الحالة إجراءات لا توجد تسويات 🙂"
- network ≥400: (none)

## ### /finance/reconciliations

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التسويات المالية المناوبة المحطة المبيعات المتوقعة التحصيل الفرق الحالة إقفال يوم 2026-10-03 محطة تجريبية — سجل 2,520.45 0 -2,520.45 مسودة إقفال يوم 2026-10-31 QA Cycle 3 300 0 -300 مسودة إقفال يوم 2026-10-30 QA Cycle 3 0 0 0 مسودة إقفال يوم 2026-10-21 QA Cycle 2 0 0 0 مسودة إقفال يوم 2026-10-20 QA Cycle 2 0 0 0 مسودة 🙂"
- network ≥400: (none)

## ## Phase 6 — sidebar links offered to the owner



## - «إدخال إيرادات» → /finance/income: ok

undefined

## - «المبيعات» → /finance/daily-sales: ok

undefined

## - «أسعار الوقود» → /finance/fuel-prices: ok

undefined

## - «النقدية» → /finance/cash: ok

undefined

## - «القسائم» → /finance/vouchers: ok

undefined

## - «الدفع الإلكتروني» → /finance/pos: ok

undefined

## - «المصروفات» → /finance/expenses: ok

undefined

## - «تسوية القسائم» → /finance/settlements: ok

undefined

## - «الفجوات» → /shifts/gaps: ok

undefined

## ## Phase 6 — tank reading form

- text: "إضافة قراءة خزان 1 خزان 1 خزان 1 (بنزين) خزان 2 خزان 1 يومية افتتاحية قبل التوريد بعد التوريد حفظ التاريخ الخزان القراءة النوع المسجل لا توجد قراءات 🙂"

## ## Phase 6 — tank reading form fields

- selects: 2, inputs: 1

## ## Phase 6 — tank transfer create

- text after save: "رجوع سجل — نظام إدارة محطات الوقود owner manager إضافة تحويل بين الخزانات Tanks must contain the same fuel type المحطة اختر المحطة QA Cycle 3 QA Cycle 2 QA Edge Station محطة تجريبية — سجل من خزان اختر الخزان خزان 2 (ديزل — 0%) خزان 1 (بنزين — 0%) إلى خزان اختر الخزان خزان 2 (ديزل) خزان 1 (بنزين) الكمية (لتر) المتاح في الخزان: 0 لتر السبب حفظ إلغاء 🙂"
- url: http://localhost:8004/app/inventory/transfers/create

## ## Phase 6 — tank transfers via API


```
{"results":[],"total":0}
```

## ## Phase 6 — network ≥400 (all)

- 401 /api/auth/me/
- 404 /api/export/?view=station&name=f9sdreji1j
- 417 /api/export/?view=station
- 417 /api/export/
- 417 /api/tank-transfers/

## ## Phase 7 — viewport 390x844 (phone)



## ### 390x844 /

- document scrollWidth 390 vs viewport 390 → fits
- overflowing elements: (none)
- controls under 40px tall: 5
  - button «» 36×36
  - button «» 36×36
  - a «» 34×34
  - button «» 34×34
  - select «جميع المحطات
QA Cy» 180×34

## ### 390x844 /readings

- document scrollWidth 390 vs viewport 390 → fits
- overflowing elements: (none)
- controls under 40px tall: 5
  - button «» 36×36
  - button «» 36×36
  - button «» 36×36
  - select «اختر المحطة
QA Cyc» 174×34
  - button «إقفال اليوم» 115×36

## ### 390x844 /stations

- document scrollWidth 390 vs viewport 390 → fits
- overflowing elements: (none)
- controls under 40px tall: 11
  - button «» 36×36
  - button «» 36×36
  - button «» 36×36
  - a «تعديل» 35×20
  - button «حذف» 28×20
  - a «تعديل» 35×20
  - button «حذف» 28×20
  - a «تعديل» 35×20

## ### 390x844 /shifts

- document scrollWidth 760 vs viewport 390 → **HORIZONTAL OVERFLOW**
- overflowing elements: div.flex-1.min-h-screen w=760 | header.sticky.top-0 w=760 | main.p-4.lg:p-6 w=760 | div. w=728 | div.flex.items-center w=728 | div.flex.gap-2 w=728
- controls under 40px tall: 11
  - button «» 36×36
  - button «» 36×36
  - button «» 36×36
  - a «+ إضافة مناوبة» 115×36
  - button «الكل» 51×34
  - button «مجدولة» 68×34
  - button «نشطة» 65×34
  - button «مقدمة» 64×34

## ### 390x844 /shifts/day

- document scrollWidth 390 vs viewport 390 → fits
- overflowing elements: (none)
- controls under 40px tall: 6
  - button «» 36×36
  - button «» 36×36
  - button «» 36×36
  - select «جميع المحطات المعن» 180×34
  - button «⚙ توليد مناوبات ال» 152×36
  - button «⚡ وضع الطوارئ (24 » 188×38

## ### 390x844 /finance/income

- document scrollWidth 390 vs viewport 390 → fits
- overflowing elements: (none)
- controls under 40px tall: 3
  - button «» 36×36
  - button «» 36×36
  - button «» 36×36

## ### 390x844 /finance/reconciliations

- document scrollWidth 589 vs viewport 390 → **HORIZONTAL OVERFLOW**
- overflowing elements: div.flex-1.min-h-screen w=589 | header.sticky.top-0 w=589 | main.p-4.lg:p-6 w=589 | div. w=557 | h2.text-xl.font-bold w=557 | thead. w=555
- controls under 40px tall: 3
  - button «» 36×36
  - button «» 36×36
  - button «» 36×36

## ### 390x844 /reports/daily

- document scrollWidth 517 vs viewport 390 → **HORIZONTAL OVERFLOW**
- overflowing elements: div.flex-1.min-h-screen w=517 | header.sticky.top-0 w=517 | main.p-4.lg:p-6 w=517 | div. w=485 | div.flex.items-center w=485 | div.space-y-6 w=485
- controls under 40px tall: 5
  - button «» 36×36
  - button «» 36×36
  - button «» 36×36
  - button «عرض» 64×36
  - button «🖨️ طباعة» 79×36

## ### 390x844 /inventory/deliveries

- document scrollWidth 545 vs viewport 390 → **HORIZONTAL OVERFLOW**
- overflowing elements: div.flex-1.min-h-screen w=545 | header.sticky.top-0 w=545 | main.p-4.lg:p-6 w=545 | div. w=513 | div.flex.items-center w=513 | thead. w=511
- controls under 40px tall: 4
  - button «» 36×36
  - button «» 36×36
  - button «» 36×36
  - a «+ إضافة شحنة» 115×36

## ### 390x844 /inventory/shortages

- document scrollWidth 396 vs viewport 390 → **HORIZONTAL OVERFLOW**
- overflowing elements: div.flex-1.min-h-screen w=396 | header.sticky.top-0 w=396 | main.p-4.lg:p-6 w=396
- controls under 40px tall: 3
  - button «» 36×36
  - button «» 36×36
  - button «» 36×36

## ### 390x844 /settings/users

- document scrollWidth 657 vs viewport 390 → **HORIZONTAL OVERFLOW**
- overflowing elements: div.flex-1.min-h-screen w=657 | header.sticky.top-0 w=657 | main.p-4.lg:p-6 w=657 | div. w=625 | div.flex.items-center w=625 | thead. w=623
- controls under 40px tall: 10
  - button «» 36×36
  - button «» 36×36
  - button «» 36×36
  - a «+ إضافة مستخدم» 132×36
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14

## ## Phase 7 — viewport 1366x768 (laptop)



## ### 1366x768 /

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 4
  - button «» 36×36
  - a «الدليل» 73×38
  - button «» 34×34
  - select «جميع المحطات
QA Cy» 180×34

## ### 1366x768 /readings

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 4
  - button «رجوع» 67×36
  - button «» 36×36
  - select «اختر المحطة
QA Cyc» 174×34
  - button «إقفال اليوم» 115×36

## ### 1366x768 /stations

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 12
  - button «رجوع» 67×36
  - button «» 36×36
  - a «⚡ إعداد محطة جديدة» 148×38
  - a «+ إضافة بسيطة» 126×38
  - a «تعديل» 35×20
  - button «حذف» 28×20
  - a «تعديل» 35×20
  - button «حذف» 28×20

## ### 1366x768 /shifts

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 10
  - button «رجوع» 67×36
  - button «» 36×36
  - a «+ إضافة مناوبة» 115×36
  - button «الكل» 51×34
  - button «مجدولة» 68×34
  - button «نشطة» 65×34
  - button «مقدمة» 64×34
  - button «مغلقة» 64×34

## ### 1366x768 /shifts/day

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 5
  - button «رجوع» 67×36
  - button «» 36×36
  - select «جميع المحطات المعن» 180×34
  - button «⚙ توليد مناوبات ال» 152×36
  - button «⚡ وضع الطوارئ (24 » 188×38

## ### 1366x768 /finance/income

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 2
  - button «رجوع» 67×36
  - button «» 36×36

## ### 1366x768 /finance/reconciliations

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 2
  - button «رجوع» 67×36
  - button «» 36×36

## ### 1366x768 /reports/daily

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 4
  - button «رجوع» 67×36
  - button «» 36×36
  - button «عرض» 64×36
  - button «🖨️ طباعة» 79×36

## ### 1366x768 /inventory/deliveries

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 3
  - button «رجوع» 67×36
  - button «» 36×36
  - a «+ إضافة شحنة» 115×36

## ### 1366x768 /inventory/shortages

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 2
  - button «رجوع» 67×36
  - button «» 36×36

## ### 1366x768 /settings/users

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 9
  - button «رجوع» 67×36
  - button «» 36×36
  - a «+ إضافة مستخدم» 132×36
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20

## ## Phase 7 — viewport 1920x1080 (desktop)



## ### 1920x1080 /

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 4
  - button «» 36×36
  - a «الدليل» 73×38
  - button «» 34×34
  - select «جميع المحطات
QA Cy» 180×34

## ### 1920x1080 /readings

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 4
  - button «رجوع» 67×36
  - button «» 36×36
  - select «اختر المحطة
QA Cyc» 174×34
  - button «إقفال اليوم» 115×36

## ### 1920x1080 /stations

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 12
  - button «رجوع» 67×36
  - button «» 36×36
  - a «⚡ إعداد محطة جديدة» 148×38
  - a «+ إضافة بسيطة» 126×38
  - a «تعديل» 35×20
  - button «حذف» 28×20
  - a «تعديل» 35×20
  - button «حذف» 28×20

## ### 1920x1080 /shifts

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 10
  - button «رجوع» 67×36
  - button «» 36×36
  - a «+ إضافة مناوبة» 115×36
  - button «الكل» 51×34
  - button «مجدولة» 68×34
  - button «نشطة» 65×34
  - button «مقدمة» 64×34
  - button «مغلقة» 64×34

## ### 1920x1080 /shifts/day

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 5
  - button «رجوع» 67×36
  - button «» 36×36
  - select «جميع المحطات المعن» 180×34
  - button «⚙ توليد مناوبات ال» 152×36
  - button «⚡ وضع الطوارئ (24 » 188×38

## ### 1920x1080 /finance/income

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 2
  - button «رجوع» 67×36
  - button «» 36×36

## ### 1920x1080 /finance/reconciliations

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 2
  - button «رجوع» 67×36
  - button «» 36×36

## ### 1920x1080 /reports/daily

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 4
  - button «رجوع» 67×36
  - button «» 36×36
  - button «عرض» 64×36
  - button «🖨️ طباعة» 79×36

## ### 1920x1080 /inventory/deliveries

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 3
  - button «رجوع» 67×36
  - button «» 36×36
  - a «+ إضافة شحنة» 115×36

## ### 1920x1080 /inventory/shortages

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 2
  - button «رجوع» 67×36
  - button «» 36×36

## ### 1920x1080 /settings/users

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 9
  - button «رجوع» 67×36
  - button «» 36×36
  - a «+ إضافة مستخدم» 132×36
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20

## ## Phase 8 — station setup


- QA Edge Station id: 0ngg0kmd9n
- day_close_time before: 23:00:00

## ## Phase 8 — station setup (after)


- PUT status: 200
- day_close_time: 11:00:00

## ## Phase 8 — readings screen, cycle label

- period chip: دورة القراءة: 2026-10-04 11:00 ← 11:00
- body mentions 11:00: true
- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager قراءات المضخات أدخل القراءة الحالية لكل مسدس — القراءة السابقة (آخر قراءة لنفس المسدس) تُجلب تلقائياً اختر المحطة QA Edge Station QA Cycle 3 QA Cycle 2 محطة تجريبية — سجل إقفال اليوم دورة القراءة: 2026-10-04 11:00 ← 11:00 0 / 8 مكتملة — 8 قراءة متبقية إجمالي اللترات: 0 لتر جزيرة 1 (0/4) M01AX مضخة 1 بنزين بانتظار القراءة قراءة افتتاحية — تُحفظ كخط أساس ولا تُحتسب مبيعات القراءة السابقة (تلقائية) 0 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / استبدال العداد) M01BX مضخة 1 بنزين بانتظار القراءة قراءة افتتاحية — تُحفظ كخط أساس ولا تُحتسب مبيعات القراءة السابقة (تلقائية) 0 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل "

## ## Phase 8 — readings entered


- guns: 8, previous readings: [100000,100000,100000,100000,100000,100000,100000,100000]
- entered: previous + 1,000 L on each gun
- total movement expected: 8,000 L

## ## Phase 8 — readings save result


- page tail: " استثناء (تصفير / استبدال العداد) M04B مضخة 4 بنزين مسجلة قراءة افتتاحية — تُحفظ كخط أساس ولا تُحتسب مبيعات القراءة السابقة (تلقائية) 101,000 القراءة الحالية (لتر) لتر اللترات المباعة — المبيعات المتوقعة: 0 د.ل + تسجيل استثناء (تصفير / استبدال العداد) أدخلت الآن: 0 · مكتملة: 8/8 الإجمالي: 0 لتر حفظ القراءات المُدخلة 🙂"

## ## Phase 8 — readings backend cross-check


- readings stored for the station: 20

## ## Phase 8 — income entry shift options


- ["اختر المناوبة","إقفال يوم 2026-10-04 (2026-10-04)","إقفال يوم 2026-10-03 (2026-10-03)"]

## ## Phase 8 — income entry fields


- numeric inputs: 6
- expected full collection for 8000 L: 1200.00 د.ل

## ## Phase 8 — income entry result


- page tail: "يوم 2026-10-03 (2026-10-03) المبيعات النقدية المبلغ (د.ل) مبيعات الكوبونات 5 د.ل 0 د.ل 6 د.ل 0 د.ل 7 د.ل 0 د.ل 8 د.ل 0 د.ل إجمالي الكوبونات: 0 د.ل المبيعات الإلكترونية المبلغ (د.ل) إجمالي الإيرادات 0 د.ل نقد: 0 | كوبونات: 0 | إلكتروني: 0 حفظ الإيرادات إلغاء 🙂"
- network ≥400: (none)

## ## Phase 8 — cash collections after income entry


```
{"results":[{"name":"dj57d8vcim","shift":"dgj8io85n2","amount":1200,"time":"2026-10-03 08:11:15.735000","received_by":null,"is_cancelled":0,"modified":"2026-10-03 13:41:15.768240"},{"name":"93rlvse4vp","shift":"0psj1u357v","amount":2000,"time":"2026-10-03 08:03:36.956000","received_by":null,"is_cancelled":0,"modified":"2026-10-03 13:33:37.078847"},{"name":"8m5hraahi3","shift":"0psj1u357v","amount":2000,"time":"2026-10-03 08:02:53.171000","received_by":null,"is_cancelled":0,"modified":"2026-10-03 13:32:53.320816"}],"total":3}
```

## ## Phase 8 — day close


- close button disabled: false
- success message: true
- page tail: "تبدال العداد) M04B مضخة 4 بنزين مسجلة قراءة افتتاحية — تُحفظ كخط أساس ولا تُحتسب مبيعات القراءة السابقة (تلقائية) 101,000 القراءة الحالية (لتر) لتر اللترات المباعة — المبيعات المتوقعة: 0 د.ل + تسجيل استثناء (تصفير / استبدال العداد) أدخلت الآن: 0 · مكتملة: 8/8 الإجمالي: 0 لتر حفظ القراءات المُدخلة 🙂"

## ## Phase 8 — reconciliations after the cycle


```
[
 {
  "name": "dlpsjgh2l7",
  "shift": "dgj8io85n2",
  "station": "0ngg0kmd9n",
  "total_liters": 0,
  "expected_sales": 0,
  "total_cash": 1200,
  "total_vouchers": 0,
  "total_pos": 0,
  "total_collection": 1200,
  "total_expenses": 0,
  "net_cash": 1200,
  "difference": 1200,
  "difference_type": "surplus",
  "status": "draft",
  "modified": "2026-10-03 13:41:24.121841"
 },
 {
  "name": "8o5mm6s34m",
  "shift": "0ktem5p0mn",
  "station": "v5scsl18m5",
  "total_liters": 16803,
  "expected_sales": 2520.45,
  "total_cash": 0,
  "total_vouchers": 0,
  "total_pos": 0,
  "total_collection": 0,
  "total_expenses": 0,
  "net_cash": 0,
  "difference": -2520.45,
  "difference_type": "shortage",
  "status": "draft",
  "modified": "2026-10-03 13:32:59.775158"
 },
 {
  "name": "3m32f74pqe",
  "shift": "3j30v6ts7v",
  "station": "3a3uu0gfpd",
  "total_liters": 2000,
  "expected_sales": 300,
  "total_cash": 0,
  "total_vouchers": 0,
  "total_pos": 0,
  "total_collection": 0,
  "total_expenses": 0,
  "net_cash": 0,
  "difference": -300,
  "difference_type": "shortage",
  "status": "draft",
  "modified": "2026-10-03 13:24:21.127038"
 },
 {
  "name": "3g2s41jk1e",
  "shift": "3d2mvfeu11",
  "sta
```

## ## Phase 8 — edge station shifts


```
[
 {
  "name": "dgj8io85n2",
  "shift_name": "إقفال يوم 2026-10-04",
  "station": "0ngg0kmd9n",
  "definition": null,
  "employee": null,
  "island": null,
  "date": "2026-10-04",
  "start_time": "11:00:00",
  "end_time": "11:00:00",
  "is_day_close": 1,
  "status": "closed",
  "modified": "2026-10-03 13:41:24.080266"
 },
 {
  "name": "0psj1u357v",
  "shift_name": "إقفال يوم 2026-10-03",
  "station": "0ngg0kmd9n",
  "definition": null,
  "employee": null,
  "island": null,
  "date": "2026-10-03",
  "start_time": "23:00:00",
  "end_time": "23:00:00",
  "is_day_close": 1,
  "status": "open",
  "modified": "2026-10-03 13:19:26.008581"
 }
]
```

## ## Phase 8 — verdict inputs


- guns read: 8, litres entered: 8000
- expected sales at 0.15: 1200.00
- cash declared: 1200.00
- reconciliation: {"name":"dlpsjgh2l7","shift":"dgj8io85n2","station":"0ngg0kmd9n","total_liters":0,"expected_sales":0,"total_cash":1200,"total_vouchers":0,"total_pos":0,"total_collection":1200,"total_expenses":0,"net_cash":1200,"difference":1200,"difference_type":"surplus","status":"draft","modified":"2026-10-03 13:41:24.121841"}

## ## Phase 8 — network ≥400 (all)

- 401 /api/auth/me/

## ## QA-32 verification — day 1 (2026-11-20, baseline day)


- guns: 2, opening badges shown: 2
- readings saved: 2
- page tail: "اءة افتتاحية — تُحفظ كخط أساس ولا تُحتسب مبيعات القراءة السابقة (تلقائية) 250,100 القراءة الحالية (لتر) لتر اللترات المباعة — المبيعات المتوقعة: 0 د.ل + تسجيل استثناء (تصفير / استبدال العداد) أدخلت الآن: 0 · مكتملة: 2/2 الإجمالي: 0 لتر حفظ القراءات المُدخلة 🙂"

## ## QA-32 verification — day 1 close


- text: " كخط أساس ولا تُحتسب مبيعات القراءة السابقة (تلقائية) 250,100 القراءة الحالية (لتر) لتر اللترات المباعة — المبيعات المتوقعة: 0 د.ل + تسجيل استثناء (تصفير / استبدال العداد) أدخلت الآن: 0 · مكتملة: 2/2 الإجمالي: 0 لتر حفظ القراءات المُدخلة 🙂"

## ## QA-32 verification — day 1 reconciliation


```
[
 {
  "name": "tttu3g51ai",
  "shift": "tqu3jo74u7",
  "station": "tnu7u0kv9q",
  "total_liters": 0,
  "expected_sales": 0,
  "total_cash": 0,
  "total_vouchers": 0,
  "total_pos": 0,
  "total_collection": 0,
  "total_expenses": 0,
  "net_cash": 0,
  "difference": 0,
  "difference_type": "matched",
  "status": "draft",
  "modified": "2026-10-03 14:09:08.583326"
 }
]
```

## ## QA-32 verification — day 2 (2026-11-21, sales day)


- guns: 2, opening badges: 0
- entered: [251000,251100]
- readings saved: 2
- page tail: "بدال العداد) M01BXXXXX مضخة 1 بنزين مسجلة القراءة السابقة (تلقائية) 251,100 القراءة الحالية (لتر) لتر اللترات المباعة — المبيعات المتوقعة: 150 د.ل + تسجيل استثناء (تصفير / استبدال العداد) أدخلت الآن: 0 · مكتملة: 2/2 الإجمالي: 2,000 لتر حفظ القراءات المُدخلة 🙂"

## ## QA-32 verification — day 2 close


- text: "بدال العداد) M01BXXXXX مضخة 1 بنزين مسجلة القراءة السابقة (تلقائية) 251,100 القراءة الحالية (لتر) لتر اللترات المباعة — المبيعات المتوقعة: 150 د.ل + تسجيل استثناء (تصفير / استبدال العداد) أدخلت الآن: 0 · مكتملة: 2/2 الإجمالي: 2,000 لتر حفظ القراءات المُدخلة 🙂"

## ## QA-32 verification — all reconciliations for the QA station


```
[
 {
  "name": "u3vacabh8k",
  "shift": "u0ve2nq3mj",
  "station": "tnu7u0kv9q",
  "total_liters": 2000,
  "expected_sales": 300,
  "total_cash": 0,
  "total_vouchers": 0,
  "total_pos": 0,
  "total_collection": 0,
  "total_expenses": 0,
  "net_cash": 0,
  "difference": -300,
  "difference_type": "shortage",
  "status": "draft",
  "modified": "2026-10-03 14:09:27.932664"
 },
 {
  "name": "tttu3g51ai",
  "shift": "tqu3jo74u7",
  "station": "tnu7u0kv9q",
  "total_liters": 0,
  "expected_sales": 0,
  "total_cash": 0,
  "total_vouchers": 0,
  "total_pos": 0,
  "total_collection": 0,
  "total_expenses": 0,
  "net_cash": 0,
  "difference": 0,
  "difference_type": "matched",
  "status": "draft",
  "modified": "2026-10-03 14:09:08.583326"
 }
]
```

## ## Phase 8 re-verification result


- day 1 (baselines): 2 guns, 2 opening badges, reconciliation 0 L
- day 2 (sales): 2000 L entered → reconciliation [{"liters":2000,"sales":300}]

## ## QA-32 verification — network ≥400

- 401 /api/auth/me/

## ## Phase 7 — viewport 390x844 (phone)



## ### 390x844 /

- document scrollWidth 390 vs viewport 390 → fits
- overflowing elements: (none)
- controls under 40px tall: 2
  - a «» 34×34
  - select «جميع المحطات
QA Cy» 180×34

## ### 390x844 /readings

- document scrollWidth 390 vs viewport 390 → fits
- overflowing elements: (none)
- controls under 40px tall: 1
  - select «اختر المحطة
QA Pil» 174×34

## ### 390x844 /stations

- document scrollWidth 390 vs viewport 390 → fits
- overflowing elements: (none)
- controls under 40px tall: 2
  - a «⚡ إعداد محطة جديدة» 148×38
  - a «+ إضافة بسيطة» 126×38

## ### 390x844 /shifts

- document scrollWidth 390 vs viewport 390 → fits
- overflowing elements: thead. w=666 | tr. w=666 | tbody. w=666 | tr.cursor-pointer w=666 | tr.cursor-pointer w=666 | tr.cursor-pointer w=666
- controls under 40px tall: 1
  - a «+ إضافة مناوبة» 115×36

## ### 390x844 /shifts/day

- document scrollWidth 390 vs viewport 390 → fits
- overflowing elements: (none)
- controls under 40px tall: 1
  - select «جميع المحطات المعن» 180×34

## ### 390x844 /finance/income

- document scrollWidth 390 vs viewport 390 → fits
- overflowing elements: (none)
- controls under 40px tall: 0

## ### 390x844 /finance/reconciliations

- document scrollWidth 390 vs viewport 390 → fits
- overflowing elements: thead. w=519 | tr. w=519 | tbody. w=519 | tr.cursor-pointer w=519 | tr.cursor-pointer w=519 | tr.cursor-pointer w=519
- controls under 40px tall: 0

## ### 390x844 /reports/daily

- document scrollWidth 390 vs viewport 390 → fits
- overflowing elements: table.data-table w=424 | thead. w=424 | tr. w=424 | tbody. w=424 | tr. w=424 | tr. w=424
- controls under 40px tall: 0

## ### 390x844 /inventory/deliveries

- document scrollWidth 390 vs viewport 390 → fits
- overflowing elements: thead. w=455 | tr. w=455 | tbody. w=455 | tr.cursor-pointer w=455
- controls under 40px tall: 1
  - a «+ إضافة شحنة» 115×36

## ### 390x844 /inventory/shortages

- document scrollWidth 390 vs viewport 390 → fits
- overflowing elements: (none)
- controls under 40px tall: 0

## ### 390x844 /settings/users

- document scrollWidth 390 vs viewport 390 → fits
- overflowing elements: thead. w=575 | tr. w=575 | tbody. w=575 | tr. w=575 | tr. w=575
- controls under 40px tall: 3
  - a «+ إضافة مستخدم» 132×36
  - a «تعديل» 35×14
  - a «تعديل» 35×14

## ## Phase 7 — viewport 1366x768 (laptop)



## ### 1366x768 /

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 3
  - a «الدليل» 73×38
  - button «» 34×34
  - select «جميع المحطات
QA Cy» 180×34

## ### 1366x768 /readings

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 2
  - select «اختر المحطة
QA Pil» 174×34
  - button «إقفال اليوم» 115×36

## ### 1366x768 /stations

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 14
  - a «⚡ إعداد محطة جديدة» 148×38
  - a «+ إضافة بسيطة» 126×38
  - a «تعديل» 35×20
  - button «حذف» 28×20
  - a «تعديل» 35×20
  - button «حذف» 28×20
  - a «تعديل» 35×20
  - button «حذف» 28×20

## ### 1366x768 /shifts

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 11
  - a «+ إضافة مناوبة» 115×36
  - button «الكل» 51×34
  - button «مجدولة» 68×34
  - button «نشطة» 65×34
  - button «مقدمة» 64×34
  - button «مغلقة» 64×34
  - button «موسّاة» 66×34
  - button «تقديم» 32×20

## ### 1366x768 /shifts/day

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 3
  - select «جميع المحطات المعن» 180×34
  - button «⚙ توليد مناوبات ال» 152×36
  - button «⚡ وضع الطوارئ (24 » 188×38

## ### 1366x768 /finance/income

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 0

## ### 1366x768 /finance/reconciliations

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 0

## ### 1366x768 /reports/daily

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 2
  - button «عرض» 64×36
  - button «🖨️ طباعة» 79×36

## ### 1366x768 /inventory/deliveries

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 1
  - a «+ إضافة شحنة» 115×36

## ### 1366x768 /inventory/shortages

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 0

## ### 1366x768 /settings/users

- document scrollWidth 1366 vs viewport 1366 → fits
- overflowing elements: (none)
- controls under 40px tall: 7
  - a «+ إضافة مستخدم» 132×36
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20

## ## Phase 7 — viewport 1920x1080 (desktop)



## ### 1920x1080 /

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 3
  - a «الدليل» 73×38
  - button «» 34×34
  - select «جميع المحطات
QA Cy» 180×34

## ### 1920x1080 /readings

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 2
  - select «اختر المحطة
QA Pil» 174×34
  - button «إقفال اليوم» 115×36

## ### 1920x1080 /stations

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 14
  - a «⚡ إعداد محطة جديدة» 148×38
  - a «+ إضافة بسيطة» 126×38
  - a «تعديل» 35×20
  - button «حذف» 28×20
  - a «تعديل» 35×20
  - button «حذف» 28×20
  - a «تعديل» 35×20
  - button «حذف» 28×20

## ### 1920x1080 /shifts

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 11
  - a «+ إضافة مناوبة» 115×36
  - button «الكل» 51×34
  - button «مجدولة» 68×34
  - button «نشطة» 65×34
  - button «مقدمة» 64×34
  - button «مغلقة» 64×34
  - button «موسّاة» 66×34
  - button «تقديم» 32×20

## ### 1920x1080 /shifts/day

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 3
  - select «جميع المحطات المعن» 180×34
  - button «⚙ توليد مناوبات ال» 152×36
  - button «⚡ وضع الطوارئ (24 » 188×38

## ### 1920x1080 /finance/income

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 0

## ### 1920x1080 /finance/reconciliations

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 0

## ### 1920x1080 /reports/daily

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 2
  - button «عرض» 64×36
  - button «🖨️ طباعة» 79×36

## ### 1920x1080 /inventory/deliveries

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 1
  - a «+ إضافة شحنة» 115×36

## ### 1920x1080 /inventory/shortages

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 0

## ### 1920x1080 /settings/users

- document scrollWidth 1920 vs viewport 1920 → fits
- overflowing elements: (none)
- controls under 40px tall: 7
  - a «+ إضافة مستخدم» 132×36
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20

## ## Phase 7 — viewport 390x844 (phone)



## ### 390x844 /

- document scrollWidth 390 vs viewport 390 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 0

## ### 390x844 /readings

- document scrollWidth 390 vs viewport 390 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 0

## ### 390x844 /stations

- document scrollWidth 390 vs viewport 390 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 0

## ### 390x844 /shifts

- document scrollWidth 390 vs viewport 390 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 0

## ### 390x844 /shifts/day

- document scrollWidth 390 vs viewport 390 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 0

## ### 390x844 /finance/income

- document scrollWidth 390 vs viewport 390 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 0

## ### 390x844 /finance/reconciliations

- document scrollWidth 390 vs viewport 390 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 0

## ### 390x844 /reports/daily

- document scrollWidth 390 vs viewport 390 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 0

## ### 390x844 /inventory/deliveries

- document scrollWidth 390 vs viewport 390 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 0

## ### 390x844 /inventory/shortages

- document scrollWidth 390 vs viewport 390 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 0

## ### 390x844 /settings/users

- document scrollWidth 390 vs viewport 390 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 0

## ## Phase 7 — viewport 1366x768 (laptop)



## ### 1366x768 /

- document scrollWidth 1366 vs viewport 1366 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 3
  - a «الدليل» 73×38
  - button «» 34×34
  - select «جميع المحطات
QA Cy» 180×34

## ### 1366x768 /readings

- document scrollWidth 1366 vs viewport 1366 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 2
  - select «اختر المحطة
QA Pil» 174×34
  - button «إقفال اليوم» 115×36

## ### 1366x768 /stations

- document scrollWidth 1366 vs viewport 1366 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 14
  - a «⚡ إعداد محطة جديدة» 148×38
  - a «+ إضافة بسيطة» 126×38
  - a «تعديل» 35×20
  - button «حذف» 28×20
  - a «تعديل» 35×20
  - button «حذف» 28×20
  - a «تعديل» 35×20
  - button «حذف» 28×20

## ### 1366x768 /shifts

- document scrollWidth 1366 vs viewport 1366 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 11
  - a «+ إضافة مناوبة» 115×36
  - button «الكل» 51×34
  - button «مجدولة» 68×34
  - button «نشطة» 65×34
  - button «مقدمة» 64×34
  - button «مغلقة» 64×34
  - button «موسّاة» 66×34
  - button «تقديم» 32×20

## ### 1366x768 /shifts/day

- document scrollWidth 1366 vs viewport 1366 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 3
  - select «جميع المحطات المعن» 180×34
  - button «⚙ توليد مناوبات ال» 152×36
  - button «⚡ وضع الطوارئ (24 » 188×38

## ### 1366x768 /finance/income

- document scrollWidth 1366 vs viewport 1366 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 0

## ### 1366x768 /finance/reconciliations

- document scrollWidth 1366 vs viewport 1366 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 0

## ### 1366x768 /reports/daily

- document scrollWidth 1366 vs viewport 1366 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 2
  - button «عرض» 64×36
  - button «🖨️ طباعة» 79×36

## ### 1366x768 /inventory/deliveries

- document scrollWidth 1366 vs viewport 1366 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 1
  - a «+ إضافة شحنة» 115×36

## ### 1366x768 /inventory/shortages

- document scrollWidth 1366 vs viewport 1366 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 0

## ### 1366x768 /settings/users

- document scrollWidth 1366 vs viewport 1366 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 7
  - a «+ إضافة مستخدم» 132×36
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20

## ## Phase 7 — viewport 1920x1080 (desktop)



## ### 1920x1080 /

- document scrollWidth 1920 vs viewport 1920 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 3
  - a «الدليل» 73×38
  - button «» 34×34
  - select «جميع المحطات
QA Cy» 180×34

## ### 1920x1080 /readings

- document scrollWidth 1920 vs viewport 1920 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 2
  - select «اختر المحطة
QA Pil» 174×34
  - button «إقفال اليوم» 115×36

## ### 1920x1080 /stations

- document scrollWidth 1920 vs viewport 1920 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 14
  - a «⚡ إعداد محطة جديدة» 148×38
  - a «+ إضافة بسيطة» 126×38
  - a «تعديل» 35×20
  - button «حذف» 28×20
  - a «تعديل» 35×20
  - button «حذف» 28×20
  - a «تعديل» 35×20
  - button «حذف» 28×20

## ### 1920x1080 /shifts

- document scrollWidth 1920 vs viewport 1920 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 11
  - a «+ إضافة مناوبة» 115×36
  - button «الكل» 51×34
  - button «مجدولة» 68×34
  - button «نشطة» 65×34
  - button «مقدمة» 64×34
  - button «مغلقة» 64×34
  - button «موسّاة» 66×34
  - button «تقديم» 32×20

## ### 1920x1080 /shifts/day

- document scrollWidth 1920 vs viewport 1920 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 3
  - select «جميع المحطات المعن» 180×34
  - button «⚙ توليد مناوبات ال» 152×36
  - button «⚡ وضع الطوارئ (24 » 188×38

## ### 1920x1080 /finance/income

- document scrollWidth 1920 vs viewport 1920 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 0

## ### 1920x1080 /finance/reconciliations

- document scrollWidth 1920 vs viewport 1920 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 0

## ### 1920x1080 /reports/daily

- document scrollWidth 1920 vs viewport 1920 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 2
  - button «عرض» 64×36
  - button «🖨️ طباعة» 79×36

## ### 1920x1080 /inventory/deliveries

- document scrollWidth 1920 vs viewport 1920 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 1
  - a «+ إضافة شحنة» 115×36

## ### 1920x1080 /inventory/shortages

- document scrollWidth 1920 vs viewport 1920 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 0

## ### 1920x1080 /settings/users

- document scrollWidth 1920 vs viewport 1920 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 7
  - a «+ إضافة مستخدم» 132×36
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
