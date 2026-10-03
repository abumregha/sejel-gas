# Sejel Browser QA — run log

- Date: 2026-10-03T12:36:28.835Z
- Target: http://localhost:8004
- Browser: Playwright Chromium (headless)


## Environment

- viewport: 1366x768
- load ms: 1741
- console errors at baseline: 1

## Login negative tests

- empty-creds error text present: false
- invalid-user error text present: true
- no password echo in error text: true

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

دورة اليوم

11:00 ← 11:00

السبت، 3 أكتوبر 2026 · الحالة: مغلقة

0/4
مكتملة
تبقي 4 قراءات اليوم
إدخال القراءات
حالة المسدسات
اضغط على أي مسدس لإدخال قراءته
جزيرة 1
مضخة 1
المسدس A
M01A
بانتظار القراءة
مضخة 2
المسدس A
M01B
بانتظار القراءة
جزيرة 2
مضخة 3
المسدس A
M02A
بانتظار القراءة
مضخة 4
المسدس A
M02B
بانتظار القراءة
يحتاج تدخلًا (7)
تبقي 4 قراءات لم تُدخل اليوم
الخزان خزان 1 (بنزين) — المستوى فارغ (0.0%)
الخزان خزان 2 (ديزل) — المستوى فارغ (0.0%)
لم تُسجّل قراءة مضخة 1 — مسدس A اليوم
لم تُسجّل قراءة مضخة 2 — مسدس A اليوم
لم تُسجّل قراءة مضخة 3 — مسدس A اليوم
لم تُسجّل قراءة مضخة 4 — مسدس A اليوم
النتيجة المالية لليوم
المبيعات المتوقعة
2,520.45 د.ل
إجمالي التحصيل
0 د.ل
النقد
0 د.ل
القسائم + الدفع الإلكتروني
0 د.ل
الفرق
-2,520.45 د.ل
صافي النقد
0 د.ل
اللترات المباعة
0 لتر
الوقود المتوفر في الخزانات
0 لتر
2 خزانات
محطة تجريبية — سجل

الطريق العام — تجريبي

آخر تحديث: 06:06 م

الدليل
تصدير Excel
جميع المحطات
QA Cycle 2
QA Cycle 3
QA Edge Station
QA Exception Lab
QA P
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

ابدأ يومك

اختر المحطة التي تعمل بها لعرض قراءات اليوم وإقفالها.

اختر المحطة...
QA Cycle 2
QA Cycle 3
QA Edge Station
QA Exception Lab
QA Pilot Final
QA موظف جديد
محطة تجريبية — سجل
لوحة إدارة المحطات
الدليل
جميع المحطات
QA Cycle 2
QA Cycle 3
QA Edge Sta
```

## Role check

- admin stations visible: 7
- admin sees station picker: true

## Console errors (phase 1)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- TypeError: Cannot read properties of undefined (reading 'total_liters')
    at Proxy.<anonymous> (http://localhost:8004/assets/DashboardView-bx9qkTe_.js:1:53682)
    at Go (http://localhost:8004/asset
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
- codes: M01AXXX, M01BXXXXXXX, M02AXX, M02BXX, M03AX, M03BX
- Pump≠Gun preserved: true

## Duplicate-name probe

- wizard success message shown: false
- stations named "QA Test Station" after attempt: 1
- error text on wizard (if any): حدث خطأ غير متوقع، يرجى إعادة المحاولة

## Console errors (phase 2)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)
- Failed to load resource: the server responded with a status of 400 (BAD REQUEST)
- Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)
- Failed to load resource: the server responded with a status of 400 (BAD REQUEST)

## Network ≥400 (phase 2)

- 401 /api/auth/me/
- 403 /api/stations/bgvoacvqrb/
- 400 /api/ux/client-error/
- 500 /api/setup-station/
- 400 /api/ux/client-error/

## Pilot guns (auto previous readings)

4 guns: {"المسدس A":"0"}

## Pilot guns (auto previous readings)

4 guns: {"المسدس A":"0"}

## Baseline counters read from the screen

{"المسدس A":0}

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3288641","M01B":"3085676","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3288641,"M01B":3085676,"M02A":27546777,"M02B":0}

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3288641","M01B":"3085676","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3288641,"M01B":3085676,"M02A":27546777,"M02B":0}

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3288641","M01B":"3085676","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3288641,"M01B":3085676,"M02A":27546777,"M02B":0}

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3288641","M01B":"3085676","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3288641,"M01B":3085676,"M02A":27546777,"M02B":0}

## Saved readings (backend payload)

[]

## Pilot guns (auto previous readings)

4 guns: {"M01A":"0","M01B":"0","M02A":"0","M02B":"0"}

## Baseline counters read from the screen

{"M01A":0,"M01B":0,"M02A":0,"M02B":0}

## Saved readings (backend payload)

[
 {
  "code": "M01A",
  "id": "v5uqls407p",
  "start": 0,
  "end": 8223,
  "liters": 0
 },
 {
  "code": "M01B",
  "id": "v5uojs7nsa",
  "start": 0,
  "end": 8580,
  "liters": 0
 },
 {
  "code": "M02A",
  "id": "v5up2fiea4",
  "start": 0,
  "end": 0,
  "liters": 0
 },
 {
  "code": "M02B",
  "id": "v5uj96v5ri",
  "start": 0,
  "end": 0,
  "liters": 0
 }
]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Edge station guns

8 guns

## Exception save (edge)

exception_type=reset

## Edge station teardown

- direct delete → 403 (blocked: readings/shift history)

## DEFECT QA-9 [P3] Station teardown with operational history

- Repro: Delete a station that has readings/shifts
- Expected: Either guided teardown or clear instruction
- Actual: 417 named-blocker remains even after config cascade; operator must clear history via API
- Evidence: run log teardown section

## Console errors (phase 3 part B)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 500 /api/setup-station/
- 417 /api/meter-readings/
- 417 /api/meter-readings/
- 403 /api/stations/0ngg0kmd9n/
- 403 /api/stations/0ngg0kmd9n/

## Pilot guns (auto previous readings)

4 guns: {"M01A":"0","M01B":"0","M02A":"0","M02B":"0"}

## Baseline counters read from the screen

{"M01A":0,"M01B":0,"M02A":0,"M02B":0}

## Saved readings (backend payload)

[
 {
  "code": "M01A",
  "id": "v5uqls407p",
  "start": 0,
  "end": 8223,
  "liters": 0
 },
 {
  "code": "M01B",
  "id": "v5uojs7nsa",
  "start": 0,
  "end": 8580,
  "liters": 0
 },
 {
  "code": "M02A",
  "id": "v5up2fiea4",
  "start": 0,
  "end": 0,
  "liters": 0
 },
 {
  "code": "M02B",
  "id": "v5uj96v5ri",
  "start": 0,
  "end": 0,
  "liters": 0
 }
]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Edge station guns

7 guns

## Exception save (edge)

exception_type=reset

## Edge station teardown

- direct delete → 403 (blocked: readings/shift history)

## DEFECT QA-9 [P3] Station teardown with operational history

- Repro: Delete a station that has readings/shifts
- Expected: Either guided teardown or clear instruction
- Actual: 417 named-blocker remains even after config cascade; operator must clear history via API
- Evidence: run log teardown section

## Console errors (phase 3 part B)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 500 /api/setup-station/
- 417 /api/meter-readings/
- 417 /api/meter-readings/
- 403 /api/stations/0ngg0kmd9n/
- 403 /api/stations/0ngg0kmd9n/

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3280418","M01B":"3077096","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3280418,"M01B":3077096,"M02A":27546777,"M02B":0}

## Saved readings (backend payload)

[
 {
  "code": "M01A",
  "id": "v5uqls407p",
  "start": 3280418,
  "end": 3288641,
  "liters": 8223
 },
 {
  "code": "M01B",
  "id": "v5uojs7nsa",
  "start": 3077096,
  "end": 3085676,
  "liters": 8580
 },
 {
  "code": "M02A",
  "id": "v5up2fiea4",
  "start": 27546777,
  "end": 27546777,
  "liters": 0
 },
 {
  "code": "M02B",
  "id": "v5uj96v5ri",
  "start": 0,
  "end": 0,
  "liters": 0
 }
]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Edge station guns

6 guns

## Exception save (edge)

exception_type=reset

## Edge station teardown

- direct delete → 403 (blocked: readings/shift history)

## DEFECT QA-9 [P3] Station teardown with operational history

- Repro: Delete a station that has readings/shifts
- Expected: Either guided teardown or clear instruction
- Actual: 417 named-blocker remains even after config cascade; operator must clear history via API
- Evidence: run log teardown section

## Console errors (phase 3 part B)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 500 /api/setup-station/
- 417 /api/meter-readings/
- 417 /api/meter-readings/
- 403 /api/stations/0ngg0kmd9n/
- 403 /api/stations/0ngg0kmd9n/

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3280418","M01B":"3077096","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3280418,"M01B":3077096,"M02A":27546777,"M02B":0}

## Saved readings (backend payload)

[
 {
  "code": "M01A",
  "id": "v5uqls407p",
  "start": 3280418,
  "end": 3288641,
  "liters": 8223
 },
 {
  "code": "M01B",
  "id": "v5uojs7nsa",
  "start": 3077096,
  "end": 3085676,
  "liters": 8580
 },
 {
  "code": "M02A",
  "id": "v5up2fiea4",
  "start": 27546777,
  "end": 27546777,
  "liters": 0
 },
 {
  "code": "M02B",
  "id": "v5uj96v5ri",
  "start": 0,
  "end": 0,
  "liters": 0
 }
]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Edge station guns

5 guns

## Exception save (edge)

exception_type=reset

## Edge station teardown

- direct delete → 403 (blocked: readings/shift history)

## DEFECT QA-9 [P3] Station teardown with operational history

- Repro: Delete a station that has readings/shifts
- Expected: Either guided teardown or clear instruction
- Actual: 417 named-blocker remains even after config cascade; operator must clear history via API
- Evidence: run log teardown section

## Console errors (phase 3 part B)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 500 /api/setup-station/
- 417 /api/meter-readings/
- 417 /api/meter-readings/
- 403 /api/stations/0ngg0kmd9n/
- 403 /api/stations/0ngg0kmd9n/

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3280418","M01B":"3077096","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3280418,"M01B":3077096,"M02A":27546777,"M02B":0}

## Saved readings (backend payload)

[
 {
  "code": "M01A",
  "id": "v5uqls407p",
  "start": 3280418,
  "end": 3288641,
  "liters": 8223
 },
 {
  "code": "M01B",
  "id": "v5uojs7nsa",
  "start": 3077096,
  "end": 3085676,
  "liters": 8580
 },
 {
  "code": "M02A",
  "id": "v5up2fiea4",
  "start": 27546777,
  "end": 27546777,
  "liters": 0
 },
 {
  "code": "M02B",
  "id": "v5uj96v5ri",
  "start": 0,
  "end": 0,
  "liters": 0
 }
]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Edge station guns

4 guns

## Exception save (edge)

exception_type=reset

## Edge station teardown

- direct delete → 403 (blocked: readings/shift history)

## DEFECT QA-9 [P3] Station teardown with operational history

- Repro: Delete a station that has readings/shifts
- Expected: Either guided teardown or clear instruction
- Actual: 417 named-blocker remains even after config cascade; operator must clear history via API
- Evidence: run log teardown section

## Console errors (phase 3 part B)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 500 /api/setup-station/
- 417 /api/meter-readings/
- 417 /api/meter-readings/
- 403 /api/stations/0ngg0kmd9n/
- 403 /api/stations/0ngg0kmd9n/

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3280418","M01B":"3077096","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3280418,"M01B":3077096,"M02A":27546777,"M02B":0}

## Saved readings (backend payload)

[
 {
  "code": "M01A",
  "id": "v5uqls407p",
  "start": 3280418,
  "end": 3288641,
  "liters": 8223
 },
 {
  "code": "M01B",
  "id": "v5uojs7nsa",
  "start": 3077096,
  "end": 3085676,
  "liters": 8580
 },
 {
  "code": "M02A",
  "id": "v5up2fiea4",
  "start": 27546777,
  "end": 27546777,
  "liters": 0
 },
 {
  "code": "M02B",
  "id": "v5uj96v5ri",
  "start": 0,
  "end": 0,
  "liters": 0
 }
]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Edge station guns

3 guns

## Exception save (edge)

exception_type=reset

## Edge station teardown

- direct delete → 403 (blocked: readings/shift history)

## DEFECT QA-9 [P3] Station teardown with operational history

- Repro: Delete a station that has readings/shifts
- Expected: Either guided teardown or clear instruction
- Actual: 417 named-blocker remains even after config cascade; operator must clear history via API
- Evidence: run log teardown section

## Console errors (phase 3 part B)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 500 /api/setup-station/
- 417 /api/meter-readings/
- 417 /api/meter-readings/
- 403 /api/stations/0ngg0kmd9n/
- 403 /api/stations/0ngg0kmd9n/

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3280418","M01B":"3077096","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3280418,"M01B":3077096,"M02A":27546777,"M02B":0}

## Saved readings (backend payload)

[
 {
  "code": "M01A",
  "id": "v5uqls407p",
  "start": 3280418,
  "end": 3288641,
  "liters": 8223
 },
 {
  "code": "M01B",
  "id": "v5uojs7nsa",
  "start": 3077096,
  "end": 3085676,
  "liters": 8580
 },
 {
  "code": "M02A",
  "id": "v5up2fiea4",
  "start": 27546777,
  "end": 27546777,
  "liters": 0
 },
 {
  "code": "M02B",
  "id": "v5uj96v5ri",
  "start": 0,
  "end": 0,
  "liters": 0
 }
]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Edge station guns

2 guns

## Exception save (edge)

exception_type=reset

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3280418","M01B":"3077096","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3280418,"M01B":3077096,"M02A":27546777,"M02B":0}

## Saved readings (backend payload)

[
 {
  "code": "M01A",
  "id": "v5uqls407p",
  "start": 3280418,
  "end": 3288641,
  "liters": 8223
 },
 {
  "code": "M01B",
  "id": "v5uojs7nsa",
  "start": 3077096,
  "end": 3085676,
  "liters": 8580
 },
 {
  "code": "M02A",
  "id": "v5up2fiea4",
  "start": 27546777,
  "end": 27546777,
  "liters": 0
 },
 {
  "code": "M02B",
  "id": "v5uj96v5ri",
  "start": 0,
  "end": 0,
  "liters": 0
 }
]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

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
- Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 500 /api/setup-station/
- 417 /api/meter-readings/
- 417 /api/meter-readings/
- 417 /api/meter-readings/
- 403 /api/stations/0ngg0kmd9n/
- 403 /api/stations/0ngg0kmd9n/

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3280418","M01B":"3077096","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3280418,"M01B":3077096,"M02A":27546777,"M02B":0}

## Saved readings (backend payload)

[
 {
  "code": "M01A",
  "id": "v5uqls407p",
  "start": 3280418,
  "end": 3288641,
  "liters": 8223
 },
 {
  "code": "M01B",
  "id": "v5uojs7nsa",
  "start": 3077096,
  "end": 3085676,
  "liters": 8580
 },
 {
  "code": "M02A",
  "id": "v5up2fiea4",
  "start": 27546777,
  "end": 27546777,
  "liters": 0
 },
 {
  "code": "M02B",
  "id": "v5uj96v5ri",
  "start": 0,
  "end": 0,
  "liters": 0
 }
]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

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
- Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 500 /api/setup-station/
- 417 /api/meter-readings/
- 417 /api/meter-readings/
- 417 /api/meter-readings/
- 403 /api/stations/0ngg0kmd9n/
- 403 /api/stations/0ngg0kmd9n/

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3280418","M01B":"3077096","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3280418,"M01B":3077096,"M02A":27546777,"M02B":0}

## Saved readings (backend payload)

[
 {
  "code": "M01A",
  "id": "v5uqls407p",
  "start": 3280418,
  "end": 3288641,
  "liters": 8223
 },
 {
  "code": "M01B",
  "id": "v5uojs7nsa",
  "start": 3077096,
  "end": 3085676,
  "liters": 8580
 },
 {
  "code": "M02A",
  "id": "v5up2fiea4",
  "start": 27546777,
  "end": 27546777,
  "liters": 0
 },
 {
  "code": "M02B",
  "id": "v5uj96v5ri",
  "start": 0,
  "end": 0,
  "liters": 0
 }
]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

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
- Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 500 /api/setup-station/
- 417 /api/meter-readings/
- 417 /api/meter-readings/
- 417 /api/meter-readings/
- 403 /api/stations/0ngg0kmd9n/
- 403 /api/stations/0ngg0kmd9n/

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3280418","M01B":"3077096","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3280418,"M01B":3077096,"M02A":27546777,"M02B":0}

## Saved readings (backend payload)

[
 {
  "code": "M01A",
  "id": "v5uqls407p",
  "start": 3280418,
  "end": 3288641,
  "liters": 8223
 },
 {
  "code": "M01B",
  "id": "v5uojs7nsa",
  "start": 3077096,
  "end": 3085676,
  "liters": 8580
 },
 {
  "code": "M02A",
  "id": "v5up2fiea4",
  "start": 27546777,
  "end": 27546777,
  "liters": 0
 },
 {
  "code": "M02B",
  "id": "v5uj96v5ri",
  "start": 0,
  "end": 0,
  "liters": 0
 }
]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Edge station guns

8 guns

## Exception save (edge)

exception_type=reset

## Edge station teardown

- direct delete → 417 (blocked: readings/shift history)

## DEFECT QA-9 [P3] Station teardown with operational history

- Repro: Delete a station that has readings/shifts
- Expected: A guided teardown, or an instruction naming exactly what must be cleared first
- Actual: still refused after clearing the day's readings, cash and reconciliation: HTTP 417
- Evidence: run log teardown section

## Console errors (phase 3 part B)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 500 /api/setup-station/
- 417 /api/meter-readings/

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3280418","M01B":"3077096","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3280418,"M01B":3077096,"M02A":27546777,"M02B":0}

## Saved readings (backend payload)

[
 {
  "code": "M01A",
  "id": "v5uqls407p",
  "start": 3280418,
  "end": 3288641,
  "liters": 8223
 },
 {
  "code": "M01B",
  "id": "v5uojs7nsa",
  "start": 3077096,
  "end": 3085676,
  "liters": 8580
 },
 {
  "code": "M02A",
  "id": "v5up2fiea4",
  "start": 27546777,
  "end": 27546777,
  "liters": 0
 },
 {
  "code": "M02B",
  "id": "v5uj96v5ri",
  "start": 0,
  "end": 0,
  "liters": 0
 }
]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Edge station guns

8 guns

## Exception save (edge)

exception_type=reset

## Edge station teardown

- direct delete → 417 (blocked: readings/shift history)

## DEFECT QA-9 [P3] Station teardown with operational history

- Repro: Delete a station that has readings/shifts
- Expected: A guided teardown, or an instruction naming exactly what must be cleared first
- Actual: still refused after clearing the day's readings, cash and reconciliation: HTTP 417
- Evidence: run log teardown section

## Console errors (phase 3 part B)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 500 /api/setup-station/
- 417 /api/meter-readings/

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3280418","M01B":"3077096","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3280418,"M01B":3077096,"M02A":27546777,"M02B":0}

## Saved readings (backend payload)

[
 {
  "code": "M01A",
  "id": "v5uqls407p",
  "start": 3280418,
  "end": 3288641,
  "liters": 8223
 },
 {
  "code": "M01B",
  "id": "v5uojs7nsa",
  "start": 3077096,
  "end": 3085676,
  "liters": 8580
 },
 {
  "code": "M02A",
  "id": "v5up2fiea4",
  "start": 27546777,
  "end": 27546777,
  "liters": 0
 },
 {
  "code": "M02B",
  "id": "v5uj96v5ri",
  "start": 0,
  "end": 0,
  "liters": 0
 }
]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Edge station guns

8 guns

## Exception save (edge)

exception_type=reset

## Edge station teardown

- direct delete → 417 (blocked: readings/shift history)

## DEFECT QA-9 [P3] Station teardown with operational history

- Repro: Delete a station that has readings/shifts
- Expected: A guided teardown, or an instruction naming exactly what must be cleared first
- Actual: still refused after clearing the day's readings, cash and reconciliation: HTTP 417
- Evidence: run log teardown section

## Console errors (phase 3 part B)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 500 /api/setup-station/
- 417 /api/meter-readings/

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3280418","M01B":"3077096","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3280418,"M01B":3077096,"M02A":27546777,"M02B":0}

## Saved readings (backend payload)

[
 {
  "code": "M01A",
  "id": "v5uqls407p",
  "start": 3280418,
  "end": 3288641,
  "liters": 8223
 },
 {
  "code": "M01B",
  "id": "v5uojs7nsa",
  "start": 3077096,
  "end": 3085676,
  "liters": 8580
 },
 {
  "code": "M02A",
  "id": "v5up2fiea4",
  "start": 27546777,
  "end": 27546777,
  "liters": 0
 },
 {
  "code": "M02B",
  "id": "v5uj96v5ri",
  "start": 0,
  "end": 0,
  "liters": 0
 }
]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Edge station guns

8 guns

## Exception save (edge)

exception_type=reset

## Edge station teardown

- direct delete → 417 (blocked: readings/shift history)

## DEFECT QA-9 [P3] Station teardown with operational history

- Repro: Delete a station that still has readings/shifts/deliveries
- Expected: Either a guided teardown, or a message naming exactly what to clear first
- Actual: refused without naming the blocking record
- Evidence: run log teardown section

## Console errors (phase 3 part B)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 403 (FORBIDDEN)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 500 /api/setup-station/
- 417 /api/meter-readings/
- 403 /api/stations/0ngg0kmd9n/

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3280418","M01B":"3077096","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3280418,"M01B":3077096,"M02A":27546777,"M02B":0}

## Saved readings (backend payload)

[
 {
  "code": "M01A",
  "id": "v5uqls407p",
  "start": 3280418,
  "end": 3288641,
  "liters": 8223
 },
 {
  "code": "M01B",
  "id": "v5uojs7nsa",
  "start": 3077096,
  "end": 3085676,
  "liters": 8580
 },
 {
  "code": "M02A",
  "id": "v5up2fiea4",
  "start": 27546777,
  "end": 27546777,
  "liters": 0
 },
 {
  "code": "M02B",
  "id": "v5uj96v5ri",
  "start": 0,
  "end": 0,
  "liters": 0
 }
]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Edge station guns

8 guns

## Exception save (edge)

exception_type=reset

## Edge station teardown

- direct delete → 417 (blocked: readings/shift history)

## Console errors (phase 3 part B)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 500 /api/setup-station/
- 417 /api/meter-readings/

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3280418","M01B":"3077096","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3280418,"M01B":3077096,"M02A":27546777,"M02B":0}

## Saved readings (backend payload)

[
 {
  "code": "M01A",
  "id": "v5uqls407p",
  "start": 3280418,
  "end": 3288641,
  "liters": 8223
 },
 {
  "code": "M01B",
  "id": "v5uojs7nsa",
  "start": 3077096,
  "end": 3085676,
  "liters": 8580
 },
 {
  "code": "M02A",
  "id": "v5up2fiea4",
  "start": 27546777,
  "end": 27546777,
  "liters": 0
 },
 {
  "code": "M02B",
  "id": "v5uj96v5ri",
  "start": 0,
  "end": 0,
  "liters": 0
 }
]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Edge station guns

8 guns

## Exception save (edge)

exception_type=reset

## Edge station teardown

- direct delete → 417 (blocked: readings/shift history)

## Console errors (phase 3 part B)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 500 /api/setup-station/
- 417 /api/meter-readings/

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3280418","M01B":"3077096","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3280418,"M01B":3077096,"M02A":27546777,"M02B":0}

## Saved readings (backend payload)

[
 {
  "code": "M01A",
  "id": "v5uqls407p",
  "start": 3280418,
  "end": 3288641,
  "liters": 8223
 },
 {
  "code": "M01B",
  "id": "v5uojs7nsa",
  "start": 3077096,
  "end": 3085676,
  "liters": 8580
 },
 {
  "code": "M02A",
  "id": "v5up2fiea4",
  "start": 27546777,
  "end": 27546777,
  "liters": 0
 },
 {
  "code": "M02B",
  "id": "v5uj96v5ri",
  "start": 0,
  "end": 0,
  "liters": 0
 }
]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Edge station guns

8 guns

## Exception save (edge)

exception_type=reset

## Edge station teardown

- direct delete → 417 (blocked: readings/shift history)

## Console errors (phase 3 part B)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 417 /api/setup-station/
- 417 /api/meter-readings/

## DEFECT QA-12 [P2] POS entry

- Repro: Income entry: enter 300 د.ل electronic sales (e.g. 7 card transactions) → save
- Expected: Operator can enter the number of electronic transactions
- Actual: IncomeEntry.vue hardcodes transaction_count: 1 — every POS record claims exactly one transaction, so electronic sales counts are unreportable
- Evidence: pos-records/?shift=… → transaction_count=1

## Reconciliation payload (pilot)

{
 "name": "ibk2oa5taq",
 "shift": "hh6oop2gjg",
 "station": "v5scsl18m5",
 "total_liters": 16803,
 "expected_sales": 2520.45,
 "total_cash": 2000,
 "total_vouchers": 90,
 "total_pos": 300,
 "total_collection": 2390,
 "total_expenses": 0,
 "net_cash": 2000,
 "difference": -130.45,
 "difference_type": "shortage",
 "status": "draft",
 "modified": "2026-10-03 19:17:04.402770"
}

## Console errors (phase 4)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Network ≥400 (phase 4)

- 401 /api/auth/me/

## DEFECT QA-12 [P2] POS entry

- Repro: Income entry: enter 300 د.ل electronic sales (e.g. 7 card transactions) → save
- Expected: Operator can enter the number of electronic transactions
- Actual: IncomeEntry.vue hardcodes transaction_count: 1 — every POS record claims exactly one transaction, so electronic sales counts are unreportable
- Evidence: pos-records/?shift=… → transaction_count=1

## Reconciliation payload (pilot)

{
 "name": "3jrct1hbi0",
 "shift": "3gtqneiodl",
 "station": "v5scsl18m5",
 "total_liters": 0,
 "expected_sales": 0,
 "total_cash": 2000,
 "total_vouchers": 90,
 "total_pos": 300,
 "total_collection": 2390,
 "total_expenses": 0,
 "net_cash": 2000,
 "difference": 2390,
 "difference_type": "surplus",
 "status": "draft",
 "modified": "2026-10-03 19:46:31.532137"
}

## Console errors (phase 4)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Network ≥400 (phase 4)

- 401 /api/auth/me/

## Pilot guns (auto previous readings)

4 guns: {"M01A":"3280418","M01B":"3077096","M02A":"27546777","M02B":"0"}

## Baseline counters read from the screen

{"M01A":3280418,"M01B":3077096,"M02A":27546777,"M02B":0}

## Saved readings (backend payload)

[
 {
  "code": "M01A",
  "id": "v5uqls407p",
  "start": 3280418,
  "end": 3288641,
  "liters": 8223
 },
 {
  "code": "M01B",
  "id": "v5uojs7nsa",
  "start": 3077096,
  "end": 3085676,
  "liters": 8580
 },
 {
  "code": "M02A",
  "id": "v5up2fiea4",
  "start": 27546777,
  "end": 27546777,
  "liters": 0
 },
 {
  "code": "M02B",
  "id": "v5uj96v5ri",
  "start": 0,
  "end": 0,
  "liters": 0
 }
]

## Console errors (phase 3 part A)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Edge station guns

8 guns

## Exception save (edge)

exception_type=reset

## Edge station teardown

- direct delete → 417 (blocked: readings/shift history)

## Console errors (phase 3 part B)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 417 /api/setup-station/
- 417 /api/meter-readings/

## Reconciliation payload (pilot)

{
 "name": "4v72ed4mag",
 "shift": "4d68tj91fk",
 "station": "v5scsl18m5",
 "total_liters": 16803,
 "expected_sales": 2520.45,
 "total_cash": 2000,
 "total_vouchers": 90,
 "total_pos": 300,
 "total_collection": 2390,
 "total_expenses": 0,
 "net_cash": 2000,
 "difference": -130.45,
 "difference_type": "shortage",
 "status": "draft",
 "modified": "2026-10-03 19:48:50.381768"
}

## Console errors (phase 4)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Network ≥400 (phase 4)

- 401 /api/auth/me/

## Reconciliation payload (pilot)

{
 "name": "5chfm75d90",
 "shift": "4d68tj91fk",
 "station": "v5scsl18m5",
 "total_liters": 16803,
 "expected_sales": 2520.45,
 "total_cash": 2000,
 "total_vouchers": 90,
 "total_pos": 300,
 "total_collection": 2390,
 "total_expenses": 0,
 "net_cash": 2000,
 "difference": -130.45,
 "difference_type": "shortage",
 "status": "draft",
 "modified": "2026-10-03 19:49:32.952819"
}

## Console errors (phase 4)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Network ≥400 (phase 4)

- 401 /api/auth/me/
