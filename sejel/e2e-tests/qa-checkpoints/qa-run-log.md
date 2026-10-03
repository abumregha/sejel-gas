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

## ## Phase 6 — reports (as station owner)



## ### /reports/daily

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA موظف جديد 0 0 0 0 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"
- network ≥400: (none)

## ### /reports/monthly

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير الشهري يناير فبراير مارس أبريل مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر عرض طباعة التقرير الشهري — أكتوبر 2026 نظام سجل لإدارة محطات الوقود · صدر بتاريخ 3‏/10‏/2026 إجمالي اللترات 20,803 المبيعات المتوقعة 2,820.45 د.ل التحصيل 2,390 د.ل المصروفات 0 د.ل النقد الصافي 2,000 د.ل المناوبات المغلقة 5 فرق المطابقة الإجمالي: -430.45 د.ل (عجز) المبيعات حسب نوع الوقود نوع الوقود اللترات المبيعات المتوقعة بنزين 16,803 2,520.45 د.ل مقارنة المحطات المحطة المناوبات اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 1 16,803 2,520.45 2,390 -130"
- network ≥400: (none)

## ### /reports/inventory

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المخزون والتوريد eooc76snii — % 0 لتر 30,000 لتر tnv1v74rki — % 0 لتر 30,000 لتر lglek20e7g — % 0 لتر 30,000 لتر 3a3bp6v1tf — % 0 لتر 30,000 لتر 2htcljqpjd — % 0 لتر 30,000 لتر 0nh7pdp63f — % 0 لتر 1 لتر v5t3476079 — % 0 لتر 15,000 لتر v5thhppakt — % 0 لتر 30,000 لتر طلبات توريد معلقة لا توجد طلبات معلقة 🙂"
- network ≥400: (none)

## ### /shifts/gaps

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager فجوات العدادات العداد المحطة القراءة السابقة القراءة الحالية الفجوة (لتر) لا توجد فجوات 🙂"
- network ≥400: (none)

## ### /shifts/day

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager يوم المحطة كل مناوبات وقراءات اليوم في شاشة واحدة جميع المحطات المعنية محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 ⚙ توليد مناوبات اليوم ⚡ وضع الطوارئ (24 ساعة) ملخصص يوم المحطة — اختر محطة لنُظرها المناوبات الفريدة المحطة قراءات مناوبات اللترات المتوقعت الحالة QA Cycle 2 0 / 2 0 2,000 0 — QA Cycle 3 0 / 2 0 2,000 300 — QA Edge Station 0 / 8 0 0 0 — QA Exception Lab 0 / 2 0 1,000 150 — QA Pilot Final 0 / 2 0 2,000 300 — QA موظف جديد 0 / 3 0 0 0 — محطة تجريبية — سجل 4 / 4 1 16,803 2,520.45"
- network ≥400: (none)

## ## Phase 6 — daily report for 2026-10-03 (explicit date)

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA موظف جديد 0 0 0 0 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"

## ## Phase 6 — reports (as station owner)



## ### /reports/daily

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA موظف جديد 0 0 0 0 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"
- network ≥400: (none)

## ### /reports/monthly

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير الشهري يناير فبراير مارس أبريل مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر عرض طباعة التقرير الشهري — أكتوبر 2026 نظام سجل لإدارة محطات الوقود · صدر بتاريخ 3‏/10‏/2026 إجمالي اللترات 20,803 المبيعات المتوقعة 2,820.45 د.ل التحصيل 2,390 د.ل المصروفات 0 د.ل النقد الصافي 2,000 د.ل المناوبات المغلقة 5 فرق المطابقة الإجمالي: -430.45 د.ل (عجز) المبيعات حسب نوع الوقود نوع الوقود اللترات المبيعات المتوقعة بنزين 16,803 2,520.45 د.ل مقارنة المحطات المحطة المناوبات اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 1 16,803 2,520.45 2,390 -130"
- network ≥400: (none)

## ### /reports/inventory

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المخزون والتوريد eooc76snii — % 0 لتر 30,000 لتر tnv1v74rki — % 0 لتر 30,000 لتر lglek20e7g — % 0 لتر 30,000 لتر 3a3bp6v1tf — % 0 لتر 30,000 لتر 2htcljqpjd — % 0 لتر 30,000 لتر 0nh7pdp63f — % 0 لتر 1 لتر v5t3476079 — % 0 لتر 15,000 لتر v5thhppakt — % 0 لتر 30,000 لتر طلبات توريد معلقة لا توجد طلبات معلقة 🙂"
- network ≥400: (none)

## ### /shifts/gaps

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager فجوات العدادات العداد المحطة القراءة السابقة القراءة الحالية الفجوة (لتر) لا توجد فجوات 🙂"
- network ≥400: (none)

## ### /shifts/day

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager يوم المحطة كل مناوبات وقراءات اليوم في شاشة واحدة جميع المحطات المعنية محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 ⚙ توليد مناوبات اليوم ⚡ وضع الطوارئ (24 ساعة) ملخصص يوم المحطة — اختر محطة لنُظرها المناوبات الفريدة المحطة قراءات مناوبات اللترات المتوقعت الحالة QA Cycle 2 0 / 2 0 2,000 0 — QA Cycle 3 0 / 2 0 2,000 300 — QA Edge Station 0 / 8 0 0 0 — QA Exception Lab 0 / 2 0 1,000 150 — QA Pilot Final 0 / 2 0 2,000 300 — QA موظف جديد 0 / 3 0 0 0 — محطة تجريبية — سجل 4 / 4 1 16,803 2,520.45"
- network ≥400: (none)

## ## Phase 6 — daily report for 2026-10-03 (explicit date)

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA موظف جديد 0 0 0 0 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"

## ## Phase 6 — reports (as station owner)



## ### /reports/daily

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA موظف جديد 0 0 0 0 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"
- network ≥400: (none)

## ### /reports/monthly

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير الشهري يناير فبراير مارس أبريل مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر عرض طباعة التقرير الشهري — أكتوبر 2026 نظام سجل لإدارة محطات الوقود · صدر بتاريخ 3‏/10‏/2026 إجمالي اللترات 20,803 المبيعات المتوقعة 2,820.45 د.ل التحصيل 2,390 د.ل المصروفات 0 د.ل النقد الصافي 2,000 د.ل المناوبات المغلقة 5 فرق المطابقة الإجمالي: -430.45 د.ل (عجز) المبيعات حسب نوع الوقود نوع الوقود اللترات المبيعات المتوقعة بنزين 16,803 2,520.45 د.ل مقارنة المحطات المحطة المناوبات اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 1 16,803 2,520.45 2,390 -130"
- network ≥400: (none)

## ### /reports/inventory

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المخزون والتوريد eooc76snii — % 0 لتر 30,000 لتر tnv1v74rki — % 0 لتر 30,000 لتر lglek20e7g — % 0 لتر 30,000 لتر 3a3bp6v1tf — % 0 لتر 30,000 لتر 2htcljqpjd — % 0 لتر 30,000 لتر 0nh7pdp63f — % 0 لتر 1 لتر v5t3476079 — % 0 لتر 15,000 لتر v5thhppakt — % 0 لتر 30,000 لتر طلبات توريد معلقة لا توجد طلبات معلقة 🙂"
- network ≥400: (none)

## ### /shifts/gaps

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager فجوات العدادات العداد المحطة القراءة السابقة القراءة الحالية الفجوة (لتر) لا توجد فجوات 🙂"
- network ≥400: (none)

## ### /shifts/day

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager يوم المحطة كل مناوبات وقراءات اليوم في شاشة واحدة جميع المحطات المعنية محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 ⚙ توليد مناوبات اليوم ⚡ وضع الطوارئ (24 ساعة) ملخصص يوم المحطة — اختر محطة لنُظرها المناوبات الفريدة المحطة قراءات مناوبات اللترات المتوقعت الحالة QA Cycle 2 0 / 2 0 2,000 0 — QA Cycle 3 0 / 2 0 2,000 300 — QA Edge Station 0 / 8 0 0 0 — QA Exception Lab 0 / 2 0 1,000 150 — QA Pilot Final 0 / 2 0 2,000 300 — QA موظف جديد 0 / 3 0 0 0 — محطة تجريبية — سجل 4 / 4 1 16,803 2,520.45"
- network ≥400: (none)

## ## Phase 6 — daily report for 2026-10-03 (explicit date)

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA موظف جديد 0 0 0 0 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"

## ## Phase 6 — export endpoint probe


```
[
 {
  "url": "/api/export/?view=station&name=v5scsl18m5",
  "status": 200,
  "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "length": 160,
  "head": "PK\u0003\u0004\u0014\u0000\u0000\u0000\b\u0000BsC]F�MH�\u0000\u0000\u0000�\u0000\u0000\u0000\u0010\u0000\u0000\u0000docProps/app.xmlM�M\u000b�0\f\u0006�Rv���\u001e�\u000eD=����.u��)m����\u0004?nyy�\u001b�.�\"&��E�.�m32�\r@�#�>�ʡ���{�1݁��\u001a\u000f"
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

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المبيعات المالية اليومية عرض طباعة المبيعات النقدية 2,000 د.ل مبيعات الكوبونات 90 د.ل المبيعات الإلكترونية 300 د.ل إجمالي التحصيل 2,390 د.ل تفاصيل الكوبونات الفئة العدد القيمة 5 د.ل 1 50 د.ل 8 د.ل 1 40 د.ل الإجمالي 2 90 د.ل المصروفات إجمالي المصروفات:0 د.ل صافي الإيرادات:2,390 د.ل 🙂"
- network ≥400: (none)

## ### /finance/fuel-prices

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager أسعار الوقود تُستخدم لحساب المبيعات المتوقعة عند إقفال المناوبات + إضافة سعر نوع الوقود سعر البيع التكلفة الهامش تاريخ السريان الحالة بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-01 ساري ديزل 0.15 د.ل 0.12 — 2026-1"
- network ≥400: (none)

## ### /finance/cash

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التحصيل النقدي المناوبة المبلغ الوقت المستلم مُلغي إقفال يوم 2026-10-03 (2026-10-03) 2,000 د.ل 2026-10-03 14:19:26.291000 — لا 🙂"
- network ≥400: (none)

## ### /finance/vouchers

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager الكوبونات المناوبة الفئة العدد القيمة مُلغي إقفال يوم 2026-10-03 (2026-10-03) 5 د.ل 10 50 د.ل لا إقفال يوم 2026-10-03 (2026-10-03) 8 د.ل 5 40 د.ل لا 🙂"
- network ≥400: (none)

## ### /finance/pos

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager واصلات POS المناوبة المبلغ عدد المعاملات مُلغي إقفال يوم 2026-10-03 (2026-10-03) 300 د.ل 7 لا 🙂"
- network ≥400: (none)

## ### /finance/expenses

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المصروفات + إضافة مصروف الفئة المبلغ الوصف طريقة الدفع إجراءات لا توجد مصروفات 🙂"
- network ≥400: (none)

## ### /finance/settlements

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager تسويات الكوبونات + إضافة تسوية المحطة التاريخ العدد القيمة المدفوع الحالة إجراءات لا توجد تسويات 🙂"
- network ≥400: (none)

## ### /finance/reconciliations

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التسويات المالية المناوبة المحطة المبيعات المتوقعة التحصيل الفرق الحالة إقفال يوم 2026-10-03 محطة تجريبية — سجل 2,520.45 2,390 -130.45 مسودة إقفال يوم 2026-11-21 QA Pilot Final 300 0 -300 مسودة إقفال يوم 2026-11-20 QA Pilot Final 0 0 0 مسودة إقفال يوم 2026-11-11 QA Exception Lab 150 0 -150 مسودة إقفال يوم 2026-11-10 QA Exception Lab 150 0 -150 مسودة"
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

- text: "إضافة قراءة خزان QA خزان 1 خزان 1 خزان 1 خزان 1 خزان 1 (بنزين) خزان 2 خزان 1 يومية افتتاحية قبل التوريد بعد التوريد حفظ التاريخ الخزان القراءة النوع المسجل لا توجد قراءات 🙂"

## ## Phase 6 — tank reading form fields

- selects: 2, inputs: 1

## ## Phase 6 — tank transfer create

- text after save: "رجوع سجل — نظام إدارة محطات الوقود owner manager إضافة تحويل بين الخزانات Tanks must contain the same fuel type المحطة اختر المحطة محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 من خزان اختر الخزان خزان 2 (ديزل — 0%) خزان 1 (بنزين — 0%) إلى خزان اختر الخزان خزان 2 (ديزل) خزان 1 (بنزين) الكمية (لتر) المتاح في الخزان: 0 لتر السبب حفظ إلغاء 🙂"
- url: http://localhost:8004/app/inventory/transfers/create

## ## Phase 6 — tank transfers via API


```
{"results":[],"total":0}
```

## ## Phase 6 — network ≥400 (all)

- 401 /api/auth/me/
- 417 /api/export/?view=station
- 417 /api/export/
- 417 /api/tank-transfers/

## ## Phase 6 — reports (as station owner)



## ### /reports/daily

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA موظف جديد 0 0 0 0 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"
- network ≥400: (none)

## ### /reports/monthly

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير الشهري يناير فبراير مارس أبريل مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر عرض طباعة محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 ⬇ Excel التقرير الشهري — أكتوبر 2026 نظام سجل لإدارة محطات الوقود · صدر بتاريخ 3‏/10‏/2026 إجمالي اللترات 20,803 المبيعات المتوقعة 2,820.45 د.ل التحصيل 2,390 د.ل المصروفات 0 د.ل النقد الصافي 2,000 د.ل المناوبات المغلقة 5 فرق المطابقة الإجمالي: -430.45 د.ل (عجز) المبيعات حسب نوع الوقود نوع الوقود اللترات المبيعات المتوقعة بنزين 16,803 2,520.45 د.ل "
- network ≥400: (none)

## ### /reports/inventory

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المخزون والتوريد eooc76snii — % 0 لتر 30,000 لتر tnv1v74rki — % 0 لتر 30,000 لتر lglek20e7g — % 0 لتر 30,000 لتر 3a3bp6v1tf — % 0 لتر 30,000 لتر 2htcljqpjd — % 0 لتر 30,000 لتر 0nh7pdp63f — % 0 لتر 1 لتر v5t3476079 — % 0 لتر 15,000 لتر v5thhppakt — % 0 لتر 30,000 لتر طلبات توريد معلقة لا توجد طلبات معلقة 🙂"
- network ≥400: (none)

## ### /shifts/gaps

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager فجوات العدادات العداد المحطة القراءة السابقة القراءة الحالية الفجوة (لتر) لا يمكن المقابلة بين قراءتين — سجّل قراءة أول انتناف دورة للمحطة لحساب الفجوة 🙂"
- network ≥400: (none)

## ### /shifts/day

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager يوم المحطة كل مناوبات وقراءات اليوم في شاشة واحدة جميع المحطات المعنية محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 ⚙ توليد مناوبات اليوم ⚡ وضع الطوارئ (24 ساعة) ملخصص يوم المحطة — اختر محطة لنُظرها المناوبات الفريدة المحطة قراءات مناوبات اللترات المتوقعت الحالة QA Cycle 2 0 / 2 0 2,000 0 — QA Cycle 3 0 / 2 0 2,000 300 — QA Edge Station 0 / 8 0 0 0 — QA Exception Lab 0 / 2 0 1,000 150 — QA Pilot Final 0 / 2 0 2,000 300 — QA موظف جديد 0 / 3 0 0 0 — محطة تجريبية — سجل 4 / 4 1 16,803 2,520.45"
- network ≥400: (none)

## ## Phase 6 — daily report for 2026-10-03 (explicit date)

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA موظف جديد 0 0 0 0 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"

## ## Phase 6 — export endpoint probe


```
[
 {
  "url": "/api/export/?view=station&name=v5scsl18m5",
  "status": 200,
  "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "length": 160,
  "head": "PK\u0003\u0004\u0014\u0000\u0000\u0000\b\u0000�sC]F�MH�\u0000\u0000\u0000�\u0000\u0000\u0000\u0010\u0000\u0000\u0000docProps/app.xmlM�M\u000b�0\f\u0006�Rv���\u001e�\u000eD=����.u��)m����\u0004?nyy�\u001b�.�\"&��E�.�m32�\r@�#�>�ʡ���{�1݁��\u001a\u000f"
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

## ## Phase 6 — monthly report Excel link

- href: /api/export/?view=station&name=v5scsl18m5
- station picker offers: محطة تجريبية — سجل | QA موظف جديد | QA Pilot Final | QA Exception Lab | QA Edge Station | QA Cycle 3 | QA Cycle 2

## ## Phase 6 — finance screens (as station owner)



## ### /finance

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager الإدارة المالية 💰 إدخال إيرادات إدخال المبيعات النقدية والكوبونات والإلكترونية 📊 المبيعات المالية عرض ملخص المبيعات اليومية 💵 التحصيل النقدي سجل التحصيلات النقدية 🎫 الكوبونات سجل مبيعات الكوبونات 💳 واصلات POS سجل المبيعات الإلكترونية 📤 المصروفات سجل المصروفات 📑 تسويات الكوبونات تسوية وتحصيل الكوبونات ⚖️ التسويات المالية التسويات والمطابقات ال"
- network ≥400: (none)

## ### /finance/daily-sales

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المبيعات المالية اليومية عرض طباعة المبيعات النقدية 2,000 د.ل مبيعات الكوبونات 90 د.ل المبيعات الإلكترونية 300 د.ل إجمالي التحصيل 2,390 د.ل تفاصيل الكوبونات الفئة العدد القيمة 5 د.ل 1 50 د.ل 8 د.ل 1 40 د.ل الإجمالي 2 90 د.ل المصروفات إجمالي المصروفات:0 د.ل صافي الإيرادات:2,390 د.ل 🙂"
- network ≥400: (none)

## ### /finance/fuel-prices

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager أسعار الوقود تُستخدم لحساب المبيعات المتوقعة عند إقفال المناوبات + إضافة سعر نوع الوقود سعر البيع التكلفة الهامش تاريخ السريان الحالة بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-01 ساري ديزل 0.15 د.ل 0.12 — 2026-1"
- network ≥400: (none)

## ### /finance/cash

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التحصيل النقدي المناوبة المبلغ الوقت المستلم مُلغي إقفال يوم 2026-10-03 (2026-10-03) 2,000 د.ل 2026-10-03 14:19:26.291000 — لا 🙂"
- network ≥400: (none)

## ### /finance/vouchers

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager الكوبونات المناوبة الفئة العدد القيمة مُلغي إقفال يوم 2026-10-03 (2026-10-03) 5 د.ل 10 50 د.ل لا إقفال يوم 2026-10-03 (2026-10-03) 8 د.ل 5 40 د.ل لا 🙂"
- network ≥400: (none)

## ### /finance/pos

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager واصلات POS المناوبة المبلغ عدد المعاملات مُلغي إقفال يوم 2026-10-03 (2026-10-03) 300 د.ل 7 لا 🙂"
- network ≥400: (none)

## ### /finance/expenses

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المصروفات + إضافة مصروف الفئة المبلغ الوصف طريقة الدفع إجراءات لا توجد مصروفات 🙂"
- network ≥400: (none)

## ### /finance/settlements

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager تسويات الكوبونات + إضافة تسوية المحطة التاريخ العدد القيمة المدفوع الحالة إجراءات لا توجد تسويات 🙂"
- network ≥400: (none)

## ### /finance/reconciliations

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التسويات المالية المناوبة المحطة المبيعات المتوقعة التحصيل الفرق الحالة إقفال يوم 2026-10-03 محطة تجريبية — سجل 2,520.45 2,390 -130.45 مسودة إقفال يوم 2026-11-21 QA Pilot Final 300 0 -300 مسودة إقفال يوم 2026-11-20 QA Pilot Final 0 0 0 مسودة إقفال يوم 2026-11-11 QA Exception Lab 150 0 -150 مسودة إقفال يوم 2026-11-10 QA Exception Lab 150 0 -150 مسودة"
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

- text: "إضافة قراءة خزان QA خزان 1 خزان 1 خزان 1 خزان 1 خزان 1 (بنزين) خزان 2 خزان 1 يومية افتتاحية قبل التوريد بعد التوريد حفظ التاريخ الخزان القراءة النوع المسجل لا توجد قراءات 🙂"

## ## Phase 6 — tank reading form fields

- selects: 2, inputs: 1

## ## Phase 6 — transfer create FAILED


- i is not defined

## ## Phase 6 — network ≥400 (all)

- 401 /api/auth/me/
- 417 /api/export/?view=station
- 417 /api/export/

## ## Phase 6 — reports (as station owner)



## ### /reports/daily

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA موظف جديد 0 0 0 0 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"
- network ≥400: (none)

## ### /reports/monthly

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير الشهري يناير فبراير مارس أبريل مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر عرض طباعة محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 ⬇ Excel التقرير الشهري — أكتوبر 2026 نظام سجل لإدارة محطات الوقود · صدر بتاريخ 3‏/10‏/2026 إجمالي اللترات 20,803 المبيعات المتوقعة 2,820.45 د.ل التحصيل 2,390 د.ل المصروفات 0 د.ل النقد الصافي 2,000 د.ل المناوبات المغلقة 5 فرق المطابقة الإجمالي: -430.45 د.ل (عجز) المبيعات حسب نوع الوقود نوع الوقود اللترات المبيعات المتوقعة بنزين 16,803 2,520.45 د.ل "
- network ≥400: (none)

## ### /reports/inventory

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المخزون والتوريد eooc76snii — % 0 لتر 30,000 لتر tnv1v74rki — % 0 لتر 30,000 لتر lglek20e7g — % 0 لتر 30,000 لتر 3a3bp6v1tf — % 0 لتر 30,000 لتر 2htcljqpjd — % 0 لتر 30,000 لتر 0nh7pdp63f — % 0 لتر 1 لتر v5t3476079 — % 0 لتر 15,000 لتر v5thhppakt — % 0 لتر 30,000 لتر طلبات توريد معلقة لا توجد طلبات معلقة 🙂"
- network ≥400: (none)

## ### /shifts/gaps

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager فجوات العدادات العداد المحطة القراءة السابقة القراءة الحالية الفجوة (لتر) لا يمكن المقابلة بين قراءتين — سجّل قراءة أول انتناف دورة للمحطة لحساب الفجوة 🙂"
- network ≥400: (none)

## ### /shifts/day

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager يوم المحطة كل مناوبات وقراءات اليوم في شاشة واحدة جميع المحطات المعنية محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 ⚙ توليد مناوبات اليوم ⚡ وضع الطوارئ (24 ساعة) ملخصص يوم المحطة — اختر محطة لنُظرها المناوبات الفريدة المحطة قراءات مناوبات اللترات المتوقعت الحالة QA Cycle 2 0 / 2 0 2,000 0 — QA Cycle 3 0 / 2 0 2,000 300 — QA Edge Station 0 / 8 0 0 0 — QA Exception Lab 0 / 2 0 1,000 150 — QA Pilot Final 0 / 2 0 2,000 300 — QA موظف جديد 0 / 3 0 0 0 — محطة تجريبية — سجل 4 / 4 1 16,803 2,520.45"
- network ≥400: (none)

## ## Phase 6 — daily report for 2026-10-03 (explicit date)

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA موظف جديد 0 0 0 0 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"

## ## Phase 6 — export endpoint probe


```
[
 {
  "url": "/api/export/?view=station&name=v5scsl18m5",
  "status": 200,
  "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "length": 160,
  "head": "PK\u0003\u0004\u0014\u0000\u0000\u0000\b\u0000\u0004tC]F�MH�\u0000\u0000\u0000�\u0000\u0000\u0000\u0010\u0000\u0000\u0000docProps/app.xmlM�M\u000b�0\f\u0006�Rv���\u001e�\u000eD=����.u��)m����\u0004?nyy�\u001b�.�\"&��E�.�m32�\r@�#�>�ʡ���{�1݁��\u001a\u000f"
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

## ## Phase 6 — monthly report Excel link

- href: /api/export/?view=station&name=v5scsl18m5
- station picker offers: محطة تجريبية — سجل | QA موظف جديد | QA Pilot Final | QA Exception Lab | QA Edge Station | QA Cycle 3 | QA Cycle 2

## ## Phase 6 — finance screens (as station owner)



## ### /finance

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager الإدارة المالية 💰 إدخال إيرادات إدخال المبيعات النقدية والكوبونات والإلكترونية 📊 المبيعات المالية عرض ملخص المبيعات اليومية 💵 التحصيل النقدي سجل التحصيلات النقدية 🎫 الكوبونات سجل مبيعات الكوبونات 💳 واصلات POS سجل المبيعات الإلكترونية 📤 المصروفات سجل المصروفات 📑 تسويات الكوبونات تسوية وتحصيل الكوبونات ⚖️ التسويات المالية التسويات والمطابقات ال"
- network ≥400: (none)

## ### /finance/daily-sales

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المبيعات المالية اليومية عرض طباعة المبيعات النقدية 2,000 د.ل مبيعات الكوبونات 90 د.ل المبيعات الإلكترونية 300 د.ل إجمالي التحصيل 2,390 د.ل تفاصيل الكوبونات الفئة العدد القيمة 5 د.ل 1 50 د.ل 8 د.ل 1 40 د.ل الإجمالي 2 90 د.ل المصروفات إجمالي المصروفات:0 د.ل صافي الإيرادات:2,390 د.ل 🙂"
- network ≥400: (none)

## ### /finance/fuel-prices

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager أسعار الوقود تُستخدم لحساب المبيعات المتوقعة عند إقفال المناوبات + إضافة سعر نوع الوقود سعر البيع التكلفة الهامش تاريخ السريان الحالة بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-01 ساري ديزل 0.15 د.ل 0.12 — 2026-1"
- network ≥400: (none)

## ### /finance/cash

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التحصيل النقدي المناوبة المبلغ الوقت المستلم مُلغي إقفال يوم 2026-10-03 (2026-10-03) 2,000 د.ل 2026-10-03 14:19:26.291000 — لا 🙂"
- network ≥400: (none)

## ### /finance/vouchers

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager الكوبونات المناوبة الفئة العدد القيمة مُلغي إقفال يوم 2026-10-03 (2026-10-03) 5 د.ل 10 50 د.ل لا إقفال يوم 2026-10-03 (2026-10-03) 8 د.ل 5 40 د.ل لا 🙂"
- network ≥400: (none)

## ### /finance/pos

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager واصلات POS المناوبة المبلغ عدد المعاملات مُلغي إقفال يوم 2026-10-03 (2026-10-03) 300 د.ل 7 لا 🙂"
- network ≥400: (none)

## ### /finance/expenses

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المصروفات + إضافة مصروف الفئة المبلغ الوصف طريقة الدفع إجراءات لا توجد مصروفات 🙂"
- network ≥400: (none)

## ### /finance/settlements

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager تسويات الكوبونات + إضافة تسوية المحطة التاريخ العدد القيمة المدفوع الحالة إجراءات لا توجد تسويات 🙂"
- network ≥400: (none)

## ### /finance/reconciliations

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التسويات المالية المناوبة المحطة المبيعات المتوقعة التحصيل الفرق الحالة إقفال يوم 2026-10-03 محطة تجريبية — سجل 2,520.45 2,390 -130.45 مسودة إقفال يوم 2026-11-21 QA Pilot Final 300 0 -300 مسودة إقفال يوم 2026-11-20 QA Pilot Final 0 0 0 مسودة إقفال يوم 2026-11-11 QA Exception Lab 150 0 -150 مسودة إقفال يوم 2026-11-10 QA Exception Lab 150 0 -150 مسودة"
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

- text: "إضافة قراءة خزان QA خزان 1 خزان 1 خزان 1 خزان 1 خزان 1 (بنزين) خزان 2 خزان 1 يومية افتتاحية قبل التوريد بعد التوريد حفظ التاريخ الخزان القراءة النوع المسجل لا توجد قراءات 🙂"

## ## Phase 6 — tank reading form fields

- selects: 2, inputs: 1

## ## Phase 6 — tank transfer create

- text after save: "رجوع سجل — نظام إدارة محطات الوقود owner manager إضافة تحويل بين الخزانات المحطة اختر المحطة محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 من خزان اختر الخزان خزان 2 (ديزل — 0%) خزان 1 (بنزين — 0%) إلى خزان اختر الخزان لا يوجد خزان آخر من فرع الوقود في هذه المحطة — أضف خزانًا ثانيًا من نوع الوقود نفسه الكمية (لتر) المتاح في الخزان: 0 لتر السب"
- url: http://localhost:8004/app/inventory/transfers/create

## ## Phase 6 — tank transfers via API


```
{"results":[],"total":0}
```

## ## Phase 6 — network ≥400 (all)

- 401 /api/auth/me/
- 417 /api/export/?view=station
- 417 /api/export/

## ## Phase 6 — reports (as station owner)



## ### /reports/daily

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA موظف جديد 0 0 0 0 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"
- network ≥400: (none)

## ### /reports/monthly

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير الشهري يناير فبراير مارس أبريل مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر عرض طباعة محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 ⬇ Excel التقرير الشهري — أكتوبر 2026 نظام سجل لإدارة محطات الوقود · صدر بتاريخ 3‏/10‏/2026 إجمالي اللترات 20,803 المبيعات المتوقعة 2,820.45 د.ل التحصيل 2,390 د.ل المصروفات 0 د.ل النقد الصافي 2,000 د.ل المناوبات المغلقة 5 فرق المطابقة الإجمالي: -430.45 د.ل (عجز) المبيعات حسب نوع الوقود نوع الوقود اللترات المبيعات المتوقعة بنزين 16,803 2,520.45 د.ل "
- network ≥400: (none)

## ### /reports/inventory

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المخزون والتوريد eooc76snii — % 0 لتر 30,000 لتر tnv1v74rki — % 0 لتر 30,000 لتر lglek20e7g — % 0 لتر 30,000 لتر 3a3bp6v1tf — % 0 لتر 30,000 لتر 2htcljqpjd — % 0 لتر 30,000 لتر 0nh7pdp63f — % 0 لتر 1 لتر v5t3476079 — % 0 لتر 15,000 لتر v5thhppakt — % 0 لتر 30,000 لتر طلبات توريد معلقة لا توجد طلبات معلقة 🙂"
- network ≥400: (none)

## ### /shifts/gaps

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager فجوات العدادات العداد المحطة القراءة السابقة القراءة الحالية الفجوة (لتر) لا يمكن المقابلة بين قراءتين — سجّل قراءة أول انتناف دورة للمحطة لحساب الفجوة 🙂"
- network ≥400: (none)

## ### /shifts/day

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager يوم المحطة كل مناوبات وقراءات اليوم في شاشة واحدة جميع المحطات المعنية محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 ⚙ توليد مناوبات اليوم ⚡ وضع الطوارئ (24 ساعة) ملخصص يوم المحطة — اختر محطة لنُظرها المناوبات الفريدة المحطة قراءات مناوبات اللترات المتوقعت الحالة QA Cycle 2 0 / 2 0 2,000 0 — QA Cycle 3 0 / 2 0 2,000 300 — QA Edge Station 0 / 8 0 0 0 — QA Exception Lab 0 / 2 0 1,000 150 — QA Pilot Final 0 / 2 0 2,000 300 — QA موظف جديد 0 / 3 0 0 0 — محطة تجريبية — سجل 4 / 4 1 16,803 2,520.45"
- network ≥400: (none)

## ## Phase 6 — daily report for 2026-10-03 (explicit date)

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA موظف جديد 0 0 0 0 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"

## ## Phase 6 — export endpoint probe


```
[
 {
  "url": "/api/export/?view=station&name=v5scsl18m5",
  "status": 200,
  "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "length": 160,
  "head": "PK\u0003\u0004\u0014\u0000\u0000\u0000\b\u00003tC]F�MH�\u0000\u0000\u0000�\u0000\u0000\u0000\u0010\u0000\u0000\u0000docProps/app.xmlM�M\u000b�0\f\u0006�Rv���\u001e�\u000eD=����.u��)m����\u0004?nyy�\u001b�.�\"&��E�.�m32�\r@�#�>�ʡ���{�1݁��\u001a\u000f"
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

## ## Phase 6 — monthly report Excel link

- href: /api/export/?view=station&name=v5scsl18m5
- station picker offers: محطة تجريبية — سجل | QA موظف جديد | QA Pilot Final | QA Exception Lab | QA Edge Station | QA Cycle 3 | QA Cycle 2

## ## Phase 6 — finance screens (as station owner)



## ### /finance

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager الإدارة المالية 💰 إدخال إيرادات إدخال المبيعات النقدية والكوبونات والإلكترونية 📊 المبيعات المالية عرض ملخص المبيعات اليومية 💵 التحصيل النقدي سجل التحصيلات النقدية 🎫 الكوبونات سجل مبيعات الكوبونات 💳 واصلات POS سجل المبيعات الإلكترونية 📤 المصروفات سجل المصروفات 📑 تسويات الكوبونات تسوية وتحصيل الكوبونات ⚖️ التسويات المالية التسويات والمطابقات ال"
- network ≥400: (none)

## ### /finance/daily-sales

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المبيعات المالية اليومية عرض طباعة المبيعات النقدية 2,000 د.ل مبيعات الكوبونات 90 د.ل المبيعات الإلكترونية 300 د.ل إجمالي التحصيل 2,390 د.ل تفاصيل الكوبونات الفئة العدد القيمة 5 د.ل 1 50 د.ل 8 د.ل 1 40 د.ل الإجمالي 2 90 د.ل المصروفات إجمالي المصروفات:0 د.ل صافي الإيرادات:2,390 د.ل 🙂"
- network ≥400: (none)

## ### /finance/fuel-prices

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager أسعار الوقود تُستخدم لحساب المبيعات المتوقعة عند إقفال المناوبات + إضافة سعر نوع الوقود سعر البيع التكلفة الهامش تاريخ السريان الحالة بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-01 ساري ديزل 0.15 د.ل 0.12 — 2026-1"
- network ≥400: (none)

## ### /finance/cash

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التحصيل النقدي المناوبة المبلغ الوقت المستلم مُلغي إقفال يوم 2026-10-03 (2026-10-03) 2,000 د.ل 2026-10-03 14:19:26.291000 — لا 🙂"
- network ≥400: (none)

## ### /finance/vouchers

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager الكوبونات المناوبة الفئة العدد القيمة مُلغي إقفال يوم 2026-10-03 (2026-10-03) 5 د.ل 10 50 د.ل لا إقفال يوم 2026-10-03 (2026-10-03) 8 د.ل 5 40 د.ل لا 🙂"
- network ≥400: (none)

## ### /finance/pos

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager واصلات POS المناوبة المبلغ عدد المعاملات مُلغي إقفال يوم 2026-10-03 (2026-10-03) 300 د.ل 7 لا 🙂"
- network ≥400: (none)

## ### /finance/expenses

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المصروفات + إضافة مصروف الفئة المبلغ الوصف طريقة الدفع إجراءات لا توجد مصروفات 🙂"
- network ≥400: (none)

## ### /finance/settlements

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager تسويات الكوبونات + إضافة تسوية المحطة التاريخ العدد القيمة المدفوع الحالة إجراءات لا توجد تسويات 🙂"
- network ≥400: (none)

## ### /finance/reconciliations

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التسويات المالية المناوبة المحطة المبيعات المتوقعة التحصيل الفرق الحالة إقفال يوم 2026-10-03 محطة تجريبية — سجل 2,520.45 2,390 -130.45 مسودة إقفال يوم 2026-11-21 QA Pilot Final 300 0 -300 مسودة إقفال يوم 2026-11-20 QA Pilot Final 0 0 0 مسودة إقفال يوم 2026-11-11 QA Exception Lab 150 0 -150 مسودة إقفال يوم 2026-11-10 QA Exception Lab 150 0 -150 مسودة"
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

- text: "إضافة قراءة خزان QA خزان 1 خزان 1 خزان 1 خزان 1 خزان 1 (بنزين) خزان 2 خزان 1 يومية افتتاحية قبل التوريد بعد التوريد حفظ التاريخ الخزان القراءة النوع المسجل لا توجد قراءات 🙂"

## ## Phase 6 — tank reading form fields

- selects: 2, inputs: 1

## ## Phase 6 — QA-24 tank-transfer refusals


```
[
 {
  "label": "different fuel",
  "status": 417,
  "arabic": true,
  "message": "frappe.exceptions.ValidationError: لا يمكن التحويل بين خزانين مختلفين في نوع الو"
 },
 {
  "label": "same tank",
  "status": 417,
  "arabic": true,
  "message": "frappe.exceptions.ValidationError: لا يمكن التحويل إلى نفس الخزان"
 },
 {
  "label": "zero quantity",
  "status": 417,
  "arabic": true,
  "message": "frappe.exceptions.ValidationError: لا يمكن التحويل بين خزانين مختلفين في نوع الو"
 }
]
```

## ## Phase 6 — tank transfer create

- text after save: "رجوع سجل — نظام إدارة محطات الوقود owner manager إضافة تحويل بين الخزانات المحطة اختر المحطة محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 من خزان اختر الخزان خزان 2 (ديزل — 0%) خزان 1 (بنزين — 0%) إلى خزان اختر الخزان لا يوجد خزان آخر من فرع الوقود في هذه المحطة — أضف خزانًا ثانيًا من نوع الوقود نفسه الكمية (لتر) المتاح في الخزان: 0 لتر السب"
- url: http://localhost:8004/app/inventory/transfers/create

## ## Phase 6 — tank transfers via API


```
{"results":[],"total":0}
```

## ## Phase 6 — network ≥400 (all)

- 401 /api/auth/me/
- 417 /api/export/?view=station
- 417 /api/export/
- 417 /api/tank-transfers/
- 417 /api/tank-transfers/
- 417 /api/tank-transfers/

## ## Phase 5 — inventory screen sweep (as station owner)



## ### /inventory/deliveries (التموين)

- rendered chars: 649
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /inventory/deliveries/create (نموذج تموين)

- rendered chars: 949
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

- rendered chars: 1039
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /inventory/shortages (العجز)

- rendered chars: 644
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

- rendered chars: 841
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ## Phase 5 — delivery empty-submit validation

- inline guidance shown: false
- note: the form relies on HTML5 `required` only — an empty submit is blocked by the browser with no persistent in-page Arabic message, and the fuel-type / tank fields are silently left empty.
- page text: "ن) خزان 1 (بنزين) خزان 1 (بنزين) خزان 1 (بنزين) خزان 1 (بنزين) خزان 1 (بنزين) (بنزين) خزان 2 (ديزل) خزان 1 (بنزين) نوع الوقود رقم الفاتورة تاريخ الطلب تاريخ الاستلام الكمية المتوقعة (لتر) 40,000 20,000 الكمية المطلوبة (لتر) القراءة قبل القراءة بعد حفظ إلغاء 🙂"

## ## Phase 5 — delivery create


- invoice ref used: QA-INV-323393
- deliveries before: 1, after: 2
- created record: {"name":"gkgqv0g82u","station":"0ngg0kmd9n","fuel_type":"بنزين","supplier":null,"expected_quantity":5000,"received_quantity":4900,"shortage":100,"invoice_number":"QA-INV-323393","payment_status":"unpaid","status":"received","order_date":"2026-10-03 14:38:00","modified":"2026-10-03 20:08:44.834195"}
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

## ## Phase 8 — station setup


- QA Edge Station id: 0ngg0kmd9n
- day_close_time before: 11:00:00

## ## Phase 8 — readings screen, cycle label

- period chip: دورة القراءة: 2026-10-04 11:00 ← 11:00
- body mentions 11:00: true
- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager قراءات المضخات أدخل القراءة الحالية لكل مسدس — القراءة السابقة (آخر قراءة لنفس المسدس) تُجلب تلقائياً اختر المحطة محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 إقفال اليوم دورة القراءة: 2026-10-04 11:00 ← 11:00 0 / 8 مكتملة — تبقي 8 قراءات اليوم إجمالي اللترات: 0 لتر جزيرة 1 (0/4) المسدس A مضخة 1 بنزين M01AX بانتظار القراءة قراءة افتتاحية — تُحفظ كخط أساس ولا تُحتسب مبيعات القراءة السابقة (تلقائية) 0 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / استبدال العداد) المسدس B مضخة 1 بنزين M01BX بانتظار القراءة قراءة افتتاحية — تُحفظ كخط أساس ولا تُحتسب مبيعات القراءة السا"

## ## Phase 8 — readings entered


- guns: 8, previous readings: [100000,100000,100000,100000,100000,100000,100000,100000]
- entered: previous + 1,000 L on each gun
- total movement expected: 8,000 L

## DEFECT QA-31 [P1] Readings — full-cycle save

- Repro: readings screen, QA Edge Station, 2026-10-04, every gun +1,000 L → حفظ
- Expected: «تم حفظ N قراءة بنجاح» and all guns marked saved
- Actual: no success message; page tail: دس B مضخة 4 بنزين M04B مسجلة القراءة السابقة 101,000 القراءة المسجلة اليوم 101,000 اللترات المباعة 0 لتر المبيعات المتوقعة: 0 د.ل تم حفظ 8 قراءات بنجاح أدخلت الآن: 0 · مكتملة: 8/8 الإجمالي: 0 لتر حفظ القراءات المُدخلة 🙂
- Evidence: phase 8 step 2

## ## Phase 8 — readings save result


- page tail: " القراءة السابقة 0 القراءة المسجلة اليوم 101,000 اللترات المباعة 0 لتر المبيعات المتوقعة: 0 د.ل المسدس B مضخة 4 بنزين M04B مسجلة القراءة السابقة 101,000 القراءة المسجلة اليوم 101,000 اللترات المباعة 0 لتر المبيعات المتوقعة: 0 د.ل تم حفظ 8 قراءات بنجاح أدخلت الآن: 0 · مكتملة: 8/8 الإجمالي: 0 لتر حفظ القراءات المُدخلة 🙂"

## ## Phase 8 — readings backend cross-check


- readings stored for the station: 12

## ## Phase 8 — income entry shift options


- ["اختر المناوبة","إقفال يوم 2026-10-04 (2026-10-04)"]

## ## Phase 8 — income entry fields


- numeric inputs: 7
- expected full collection for 8000 L: 1200.00 د.ل

## ## Phase 8 — income entry result


- page tail: "ل 7 د.ل 0 د.ل 8 د.ل 0 د.ل إجمالي الكوبونات: 0 د.ل المبيعات الإلكترونية المبلغ (د.ل) عدد المعاملات الالكترونية اترك عدد المعاملات الإلكترونية في هذا اليوم — اترك عددها إذا مع المبلغ إجمالي الإيرادات 0 د.ل نقد: 0 | كوبونات: 0 | إلكتروني: 0 حفظ الإيرادات إلغاء 🙂"
- network ≥400: (none)

## ## Phase 8 — cash collections after income entry


```
{"results":[{"name":"jdhsacf2sp","shift":"javugcg52o","amount":1200,"time":"2026-10-03 14:43:29.694000","received_by":null,"is_cancelled":0,"modified":"2026-10-03 20:13:29.737394"},{"name":"5afitfbqag","shift":"4d68tj91fk","amount":2000,"time":"2026-10-03 14:19:26.291000","received_by":null,"is_cancelled":0,"modified":"2026-10-03 19:49:26.372415"}],"total":2}
```

## ## Phase 8 — day close


- close button disabled: false
- success message: true
- page tail: "01,000 اللترات المباعة 0 لتر المبيعات المتوقعة: 0 د.ل المسدس B مضخة 4 بنزين M04B مسجلة القراءة السابقة 101,000 القراءة المسجلة اليوم 101,000 اللترات المباعة 0 لتر المبيعات المتوقعة: 0 د.ل تم إقفال اليوم وإنشاء التسوية المالية بنجاح أدخلت الآن: 0 · مكتملة: 8/8 الإجمالي: 0 لتر حفظ القراءات المُدخلة 🙂"

## ## Phase 8 — reconciliations after the cycle


```
[
 {
  "name": "jg5kofikbc",
  "shift": "javugcg52o",
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
  "modified": "2026-10-03 20:13:38.119521"
 },
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
 },
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
  "shift": "tqu3jo74
```

## ## Phase 8 — edge station shifts


```
[
 {
  "name": "javugcg52o",
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
  "modified": "2026-10-03 20:13:38.079075"
 }
]
```

## ## Phase 8 — verdict inputs


- guns read: 8, litres entered: 8000
- expected sales at 0.15: 1200.00
- cash declared: 1200.00
- reconciliation: {"name":"jg5kofikbc","shift":"javugcg52o","station":"0ngg0kmd9n","total_liters":0,"expected_sales":0,"total_cash":1200,"total_vouchers":0,"total_pos":0,"total_collection":1200,"total_expenses":0,"net_cash":1200,"difference":1200,"difference_type":"surplus","status":"draft","modified":"2026-10-03 20:13:38.119521"}

## ## Phase 8 — network ≥400 (all)

- 401 /api/auth/me/

## ## Phase 8 — station setup


- QA Edge Station id: 0ngg0kmd9n
- day_close_time before: 11:00:00

## ## Phase 8 — readings screen, cycle label

- period chip: دورة القراءة: 2026-10-04 11:00 ← 11:00
- body mentions 11:00: true
- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager قراءات المضخات أدخل القراءة الحالية لكل مسدس — القراءة السابقة (آخر قراءة لنفس المسدس) تُجلب تلقائياً اختر المحطة محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 إقفال اليوم دورة القراءة: 2026-10-04 11:00 ← 11:00 0 / 8 مكتملة — تبقي 8 قراءات اليوم إجمالي اللترات: 0 لتر جزيرة 1 (0/4) المسدس A مضخة 1 بنزين M01AX بانتظار القراءة قراءة افتتاحية — تُحفظ كخط أساس ولا تُحتسب مبيعات القراءة السابقة (تلقائية) 0 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / استبدال العداد) المسدس B مضخة 1 بنزين M01BX بانتظار القراءة قراءة افتتاحية — تُحفظ كخط أساس ولا تُحتسب مبيعات القراءة السا"

## ## Phase 8 — station setup


- QA Edge Station id: 0ngg0kmd9n
- day_close_time before: 11:00:00

## ## Phase 8 — readings screen, cycle label

- period chip: دورة القراءة: 2026-10-04 11:00 ← 11:00
- body mentions 11:00: true
- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager قراءات المضخات أدخل القراءة الحالية لكل مسدس — القراءة السابقة (آخر قراءة لنفس المسدس) تُجلب تلقائياً اختر المحطة محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 إقفال اليوم دورة القراءة: 2026-10-04 11:00 ← 11:00 0 / 8 مكتملة — تبقي 8 قراءات اليوم إجمالي اللترات: 0 لتر جزيرة 1 (0/4) المسدس A مضخة 1 بنزين M01AX بانتظار القراءة القراءة السابقة (تلقائية) 100,000 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / استبدال العداد) المسدس B مضخة 1 بنزين M01BX بانتظار القراءة القراءة السابقة (تلقائية) 100,000 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / است"

## ## Phase 8 — station setup


- QA Edge Station id: 0ngg0kmd9n
- day_close_time before: 11:00:00

## ## Phase 8 — readings screen, cycle label

- period chip: دورة القراءة: 2026-10-04 11:00 ← 11:00
- body mentions 11:00: true
- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager قراءات المضخات أدخل القراءة الحالية لكل مسدس — القراءة السابقة (آخر قراءة لنفس المسدس) تُجلب تلقائياً اختر المحطة محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 إقفال اليوم دورة القراءة: 2026-10-04 11:00 ← 11:00 0 / 8 مكتملة — تبقي 8 قراءات اليوم إجمالي اللترات: 0 لتر جزيرة 1 (0/4) المسدس A مضخة 1 بنزين M01AX بانتظار القراءة القراءة السابقة (تلقائية) 100,000 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / استبدال العداد) المسدس B مضخة 1 بنزين M01BX بانتظار القراءة القراءة السابقة (تلقائية) 100,000 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / است"

## ## Phase 8 — readings entered


- guns: 8, previous readings: [100000,100000,100000,100000,100000,100000,100000,100000]
- entered: previous + 1,000 L on each gun
- total movement expected: 8,000 L

## ## Phase 8 — readings save result


- page tail: "00 القراءة المسجلة اليوم 101,000 اللترات المباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل المسدس B مضخة 4 بنزين M04B مسجلة القراءة السابقة 100,000 القراءة المسجلة اليوم 101,000 اللترات المباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل تم حفظ 8 قراءات بنجاح أدخلت الآن: 0 · مكتملة: 8/8 الإجمالي: 8,000 لتر حفظ القراءات المُدخلة 🙂"

## ## Phase 8 — readings backend cross-check


- readings stored for the station: 12

## ## Phase 8 — income entry shift options


- ["اختر المناوبة","إقفال يوم 2026-10-04 (2026-10-04)"]

## ## Phase 8 — income entry fields


- numeric inputs: 7
- expected full collection for 8000 L: 1200.00 د.ل

## ## Phase 8 — income entry result


- page tail: "ل 7 د.ل 0 د.ل 8 د.ل 0 د.ل إجمالي الكوبونات: 0 د.ل المبيعات الإلكترونية المبلغ (د.ل) عدد المعاملات الالكترونية اترك عدد المعاملات الإلكترونية في هذا اليوم — اترك عددها إذا مع المبلغ إجمالي الإيرادات 0 د.ل نقد: 0 | كوبونات: 0 | إلكتروني: 0 حفظ الإيرادات إلغاء 🙂"
- network ≥400: (none)

## ## Phase 8 — cash collections after income entry


```
{"results":[{"name":"nnhbo4i6ok","shift":"nkv6t70ip1","amount":1200,"time":"2026-10-03 14:50:51.294000","received_by":null,"is_cancelled":0,"modified":"2026-10-03 20:20:51.328811"},{"name":"5afitfbqag","shift":"4d68tj91fk","amount":2000,"time":"2026-10-03 14:19:26.291000","received_by":null,"is_cancelled":0,"modified":"2026-10-03 19:49:26.372415"}],"total":2}
```

## ## Phase 8 — day close


- close button disabled: false
- success message: true
- page tail: "لمباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل المسدس B مضخة 4 بنزين M04B مسجلة القراءة السابقة 100,000 القراءة المسجلة اليوم 101,000 اللترات المباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل تم إقفال اليوم وإنشاء التسوية المالية بنجاح أدخلت الآن: 0 · مكتملة: 8/8 الإجمالي: 8,000 لتر حفظ القراءات المُدخلة 🙂"

## ## Phase 8 — reconciliations after the cycle


```
[
 {
  "name": "nq6ae354id",
  "shift": "nkv6t70ip1",
  "station": "0ngg0kmd9n",
  "total_liters": 8000,
  "expected_sales": 1200,
  "total_cash": 1200,
  "total_vouchers": 0,
  "total_pos": 0,
  "total_collection": 1200,
  "total_expenses": 0,
  "net_cash": 1200,
  "difference": 0,
  "difference_type": "matched",
  "status": "draft",
  "modified": "2026-10-03 20:20:59.799386"
 },
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
 },
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
  "shift": "tqu3j
```

## ## Phase 8 — edge station shifts


```
[
 {
  "name": "nkv6t70ip1",
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
  "modified": "2026-10-03 20:20:59.743487"
 }
]
```

## ## Phase 8 — verdict inputs


- guns read: 8, litres entered: 8000
- expected sales at 0.15: 1200.00
- cash declared: 1200.00
- reconciliation: {"name":"nq6ae354id","shift":"nkv6t70ip1","station":"0ngg0kmd9n","total_liters":8000,"expected_sales":1200,"total_cash":1200,"total_vouchers":0,"total_pos":0,"total_collection":1200,"total_expenses":0,"net_cash":1200,"difference":0,"difference_type":"matched","status":"draft","modified":"2026-10-03 20:20:59.799386"}

## ## Phase 8 — network ≥400 (all)

- 401 /api/auth/me/

## ## Phase 8 — station setup


- QA Edge Station id: 0ngg0kmd9n
- day_close_time before: 11:00:00

## ## Phase 8 — readings screen, cycle label

- period chip: دورة القراءة: 2026-10-04 11:00 ← 11:00
- body mentions 11:00: true
- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager قراءات المضخات أدخل القراءة الحالية لكل مسدس — القراءة السابقة (آخر قراءة لنفس المسدس) تُجلب تلقائياً اختر المحطة محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 إقفال اليوم دورة القراءة: 2026-10-04 11:00 ← 11:00 0 / 8 مكتملة — تبقي 8 قراءات اليوم إجمالي اللترات: 0 لتر جزيرة 1 (0/4) المسدس A مضخة 1 بنزين M01AX بانتظار القراءة القراءة السابقة (تلقائية) 100,000 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / استبدال العداد) المسدس B مضخة 1 بنزين M01BX بانتظار القراءة القراءة السابقة (تلقائية) 100,000 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / است"

## ## Phase 8 — readings entered


- guns: 8, previous readings: [100000,100000,100000,100000,100000,100000,100000,100000]
- entered: previous + 1,000 L on each gun
- total movement expected: 8,000 L

## ## Phase 8 — readings save result


- page tail: "00 القراءة المسجلة اليوم 101,000 اللترات المباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل المسدس B مضخة 4 بنزين M04B مسجلة القراءة السابقة 100,000 القراءة المسجلة اليوم 101,000 اللترات المباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل تم حفظ 8 قراءات بنجاح أدخلت الآن: 0 · مكتملة: 8/8 الإجمالي: 8,000 لتر حفظ القراءات المُدخلة 🙂"

## ## Phase 8 — readings backend cross-check


- readings stored for the station: 12

## ## Phase 8 — income entry shift options


- ["اختر المناوبة","إقفال يوم 2026-10-04 (2026-10-04)"]

## ## Phase 8 — income entry result


- page tail: "ل 7 د.ل 0 د.ل 8 د.ل 0 د.ل إجمالي الكوبونات: 0 د.ل المبيعات الإلكترونية المبلغ (د.ل) عدد المعاملات الالكترونية اترك عدد المعاملات الإلكترونية في هذا اليوم — اترك عددها إذا مع المبلغ إجمالي الإيرادات 0 د.ل نقد: 0 | كوبونات: 0 | إلكتروني: 0 حفظ الإيرادات إلغاء 🙂"
- network ≥400: (none)

## ## Phase 8 — income postings stored


- cash: 3200 (expected 1200.00), vouchers: 130 (expected 40)

## ## Phase 8 — day close


- close button disabled: false
- success message: true
- page tail: "لمباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل المسدس B مضخة 4 بنزين M04B مسجلة القراءة السابقة 100,000 القراءة المسجلة اليوم 101,000 اللترات المباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل تم إقفال اليوم وإنشاء التسوية المالية بنجاح أدخلت الآن: 0 · مكتملة: 8/8 الإجمالي: 8,000 لتر حفظ القراءات المُدخلة 🙂"

## ## Phase 8 — reconciliations after the cycle


```
[
 {
  "name": "pa68mtle96",
  "shift": "p4tus6b8kv",
  "station": "0ngg0kmd9n",
  "total_liters": 8000,
  "expected_sales": 1200,
  "total_cash": 1200,
  "total_vouchers": 40,
  "total_pos": 0,
  "total_collection": 1240,
  "total_expenses": 0,
  "net_cash": 1200,
  "difference": 40,
  "difference_type": "surplus",
  "status": "draft",
  "modified": "2026-10-03 20:23:33.422346"
 },
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
 },
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
  "shift": "tqu
```

## ## Phase 8 — edge station shifts


```
[
 {
  "name": "p4tus6b8kv",
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
  "modified": "2026-10-03 20:23:33.368257"
 }
]
```

## ## Phase 8 — verdict inputs


- guns read: 8, litres entered: 8000
- expected sales at 0.15: 1200.00
- cash declared: 1200.00
- reconciliation: {"name":"pa68mtle96","shift":"p4tus6b8kv","station":"0ngg0kmd9n","total_liters":8000,"expected_sales":1200,"total_cash":1200,"total_vouchers":40,"total_pos":0,"total_collection":1240,"total_expenses":0,"net_cash":1200,"difference":40,"difference_type":"surplus","status":"draft","modified":"2026-10-03 20:23:33.422346"}

## ## Phase 8 — network ≥400 (all)

- 401 /api/auth/me/

## ## Phase 8 — station setup


- QA Edge Station id: 0ngg0kmd9n
- day_close_time before: 11:00:00

## ## Phase 8 — readings screen, cycle label

- period chip: دورة القراءة: 2026-10-04 11:00 ← 11:00
- body mentions 11:00: true
- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager قراءات المضخات أدخل القراءة الحالية لكل مسدس — القراءة السابقة (آخر قراءة لنفس المسدس) تُجلب تلقائياً اختر المحطة محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 إقفال اليوم دورة القراءة: 2026-10-04 11:00 ← 11:00 0 / 8 مكتملة — تبقي 8 قراءات اليوم إجمالي اللترات: 0 لتر جزيرة 1 (0/4) المسدس A مضخة 1 بنزين M01AX بانتظار القراءة القراءة السابقة (تلقائية) 100,000 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / استبدال العداد) المسدس B مضخة 1 بنزين M01BX بانتظار القراءة القراءة السابقة (تلقائية) 100,000 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / است"

## ## Phase 8 — readings entered


- guns: 8, previous readings: [100000,100000,100000,100000,100000,100000,100000,100000]
- entered: previous + 1,000 L on each gun
- total movement expected: 8,000 L

## ## Phase 8 — readings save result


- page tail: "00 القراءة المسجلة اليوم 101,000 اللترات المباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل المسدس B مضخة 4 بنزين M04B مسجلة القراءة السابقة 100,000 القراءة المسجلة اليوم 101,000 اللترات المباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل تم حفظ 8 قراءات بنجاح أدخلت الآن: 0 · مكتملة: 8/8 الإجمالي: 8,000 لتر حفظ القراءات المُدخلة 🙂"

## ## Phase 8 — readings backend cross-check


- readings stored for the station: 8

## ## Phase 8 — income entry shift options


- ["اختر المناوبة","إقفال يوم 2026-10-04 (2026-10-04)"]

## ## Phase 8 — income entry result


- page tail: "ل 7 د.ل 0 د.ل 8 د.ل 0 د.ل إجمالي الكوبونات: 0 د.ل المبيعات الإلكترونية المبلغ (د.ل) عدد المعاملات الالكترونية اترك عدد المعاملات الإلكترونية في هذا اليوم — اترك عددها إذا مع المبلغ إجمالي الإيرادات 0 د.ل نقد: 0 | كوبونات: 0 | إلكتروني: 0 حفظ الإيرادات إلغاء 🙂"
- network ≥400: (none)

## ## Phase 8 — income postings stored


- cash: 1200 (expected 1200.00), vouchers: 40 (expected 40)

## ## Phase 8 — day close


- close button disabled: false
- success message: true
- page tail: "لمباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل المسدس B مضخة 4 بنزين M04B مسجلة القراءة السابقة 100,000 القراءة المسجلة اليوم 101,000 اللترات المباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل تم إقفال اليوم وإنشاء التسوية المالية بنجاح أدخلت الآن: 0 · مكتملة: 8/8 الإجمالي: 8,000 لتر حفظ القراءات المُدخلة 🙂"

## ## Phase 8 — reconciliations after the cycle


```
[
 {
  "name": "qpi3uuv8aq",
  "shift": "qk8s5f33ae",
  "station": "0ngg0kmd9n",
  "total_liters": 8000,
  "expected_sales": 1200,
  "total_cash": 1200,
  "total_vouchers": 40,
  "total_pos": 0,
  "total_collection": 1240,
  "total_expenses": 0,
  "net_cash": 1200,
  "difference": 40,
  "difference_type": "surplus",
  "status": "draft",
  "modified": "2026-10-03 20:26:05.071816"
 },
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
 },
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
  "shift": "tqu
```

## ## Phase 8 — edge station shifts


```
[
 {
  "name": "qk8s5f33ae",
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
  "modified": "2026-10-03 20:26:05.024153"
 }
]
```

## ## Phase 8 — verdict inputs


- guns read: 8, litres entered: 8000
- expected sales at 0.15: 1200.00
- cash declared: 1200.00
- reconciliation: {"name":"qpi3uuv8aq","shift":"qk8s5f33ae","station":"0ngg0kmd9n","total_liters":8000,"expected_sales":1200,"total_cash":1200,"total_vouchers":40,"total_pos":0,"total_collection":1240,"total_expenses":0,"net_cash":1200,"difference":40,"difference_type":"surplus","status":"draft","modified":"2026-10-03 20:26:05.071816"}

## ## Phase 8 — network ≥400 (all)

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
 "name": "rhvppq0uge",
 "shift": "r394odkcji",
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
 "modified": "2026-10-03 20:27:23.151680"
}

## Console errors (phase 4)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Network ≥400 (phase 4)

- 401 /api/auth/me/

## ## Phase 6 — reports (as station owner)



## ### /reports/daily

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA موظف جديد 0 0 0 0 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"
- network ≥400: (none)

## ### /reports/monthly

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير الشهري يناير فبراير مارس أبريل مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر عرض طباعة محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 ⬇ Excel التقرير الشهري — أكتوبر 2026 نظام سجل لإدارة محطات الوقود · صدر بتاريخ 3‏/10‏/2026 إجمالي اللترات 20,803 المبيعات المتوقعة 2,820.45 د.ل التحصيل 2,390 د.ل المصروفات 0 د.ل النقد الصافي 2,000 د.ل المناوبات المغلقة 5 فرق المطابقة الإجمالي: -430.45 د.ل (عجز) المبيعات حسب نوع الوقود نوع الوقود اللترات المبيعات المتوقعة بنزين 16,803 2,520.45 د.ل "
- network ≥400: (none)

## ### /reports/inventory

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المخزون والتوريد eooc76snii — % 0 لتر 30,000 لتر tnv1v74rki — % 0 لتر 30,000 لتر lglek20e7g — % 0 لتر 30,000 لتر 3a3bp6v1tf — % 0 لتر 30,000 لتر 2htcljqpjd — % 0 لتر 30,000 لتر 0nh7pdp63f — % 0 لتر 1 لتر v5t3476079 — % 0 لتر 15,000 لتر v5thhppakt — % 0 لتر 30,000 لتر طلبات توريد معلقة لا توجد طلبات معلقة 🙂"
- network ≥400: (none)

## ### /shifts/gaps

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager فجوات العدادات العداد المحطة القراءة السابقة القراءة الحالية الفجوة (لتر) لا يمكن المقابلة بين قراءتين — سجّل قراءة أول انتناف دورة للمحطة لحساب الفجوة 🙂"
- network ≥400: (none)

## ### /shifts/day

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager يوم المحطة كل مناوبات وقراءات اليوم في شاشة واحدة جميع المحطات المعنية محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 ⚙ توليد مناوبات اليوم ⚡ وضع الطوارئ (24 ساعة) ملخصص يوم المحطة — اختر محطة لنُظرها المناوبات الفريدة المحطة قراءات مناوبات اللترات المتوقعت الحالة QA Cycle 2 0 / 2 0 2,000 0 — QA Cycle 3 0 / 2 0 2,000 300 — QA Edge Station 0 / 8 0 0 0 — QA Exception Lab 0 / 2 0 1,000 150 — QA Pilot Final 0 / 2 0 2,000 300 — QA موظف جديد 0 / 3 0 0 0 — محطة تجريبية — سجل 4 / 4 1 16,803 2,520.45"
- network ≥400: (none)

## ## Phase 6 — daily report for 2026-10-03 (explicit date)

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA موظف جديد 0 0 0 0 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"

## ## Phase 6 — export endpoint probe


```
[
 {
  "url": "/api/export/?view=station&name=v5scsl18m5",
  "status": 200,
  "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "length": 160,
  "head": "PK\u0003\u0004\u0014\u0000\u0000\u0000\b\u0000@wC]F�MH�\u0000\u0000\u0000�\u0000\u0000\u0000\u0010\u0000\u0000\u0000docProps/app.xmlM�M\u000b�0\f\u0006�Rv���\u001e�\u000eD=����.u��)m����\u0004?nyy�\u001b�.�\"&��E�.�m32�\r@�#�>�ʡ���{�1݁��\u001a\u000f"
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

## ## Phase 6 — monthly report Excel link

- href: /api/export/?view=station&name=v5scsl18m5
- station picker offers: محطة تجريبية — سجل | QA موظف جديد | QA Pilot Final | QA Exception Lab | QA Edge Station | QA Cycle 3 | QA Cycle 2

## ## Phase 6 — finance screens (as station owner)



## ### /finance

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager الإدارة المالية 💰 إدخال إيرادات إدخال المبيعات النقدية والكوبونات والإلكترونية 📊 المبيعات المالية عرض ملخص المبيعات اليومية 💵 التحصيل النقدي سجل التحصيلات النقدية 🎫 الكوبونات سجل مبيعات الكوبونات 💳 واصلات POS سجل المبيعات الإلكترونية 📤 المصروفات سجل المصروفات 📑 تسويات الكوبونات تسوية وتحصيل الكوبونات ⚖️ التسويات المالية التسويات والمطابقات ال"
- network ≥400: (none)

## ### /finance/daily-sales

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المبيعات المالية اليومية عرض طباعة المبيعات النقدية 2,000 د.ل مبيعات الكوبونات 90 د.ل المبيعات الإلكترونية 300 د.ل إجمالي التحصيل 2,390 د.ل تفاصيل الكوبونات الفئة العدد القيمة 5 د.ل 1 50 د.ل 8 د.ل 1 40 د.ل الإجمالي 2 90 د.ل المصروفات إجمالي المصروفات:0 د.ل صافي الإيرادات:2,390 د.ل 🙂"
- network ≥400: (none)

## ### /finance/fuel-prices

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager أسعار الوقود تُستخدم لحساب المبيعات المتوقعة عند إقفال المناوبات + إضافة سعر نوع الوقود سعر البيع التكلفة الهامش تاريخ السريان الحالة بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-01 ساري ديزل 0.15 د.ل 0.12 — 2026-1"
- network ≥400: (none)

## ### /finance/cash

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التحصيل النقدي المناوبة المبلغ الوقت المستلم مُلغي إقفال يوم 2026-10-03 (2026-10-03) 2,000 د.ل 2026-10-03 14:57:16.528000 — لا 🙂"
- network ≥400: (none)

## ### /finance/vouchers

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager الكوبونات المناوبة الفئة العدد القيمة مُلغي إقفال يوم 2026-10-03 (2026-10-03) 5 د.ل 10 50 د.ل لا إقفال يوم 2026-10-03 (2026-10-03) 8 د.ل 5 40 د.ل لا 🙂"
- network ≥400: (none)

## ### /finance/pos

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager واصلات POS المناوبة المبلغ عدد المعاملات مُلغي إقفال يوم 2026-10-03 (2026-10-03) 300 د.ل 7 لا 🙂"
- network ≥400: (none)

## ### /finance/expenses

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المصروفات + إضافة مصروف الفئة المبلغ الوصف طريقة الدفع إجراءات لا توجد مصروفات 🙂"
- network ≥400: (none)

## ### /finance/settlements

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager تسويات الكوبونات + إضافة تسوية المحطة التاريخ العدد القيمة المدفوع الحالة إجراءات لا توجد تسويات 🙂"
- network ≥400: (none)

## ### /finance/reconciliations

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التسويات المالية المناوبة المحطة المبيعات المتوقعة التحصيل الفرق الحالة إقفال يوم 2026-10-03 محطة تجريبية — سجل 2,520.45 2,390 -130.45 مسودة إقفال يوم 2026-11-21 QA Pilot Final 300 0 -300 مسودة إقفال يوم 2026-11-20 QA Pilot Final 0 0 0 مسودة إقفال يوم 2026-11-11 QA Exception Lab 150 0 -150 مسودة إقفال يوم 2026-11-10 QA Exception Lab 150 0 -150 مسودة"
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

- text: "إضافة قراءة خزان QA خزان 1 خزان 1 خزان 1 خزان 1 خزان 1 (بنزين) خزان 2 خزان 1 يومية افتتاحية قبل التوريد بعد التوريد حفظ التاريخ الخزان القراءة النوع المسجل لا توجد قراءات 🙂"

## ## Phase 6 — tank reading form fields

- selects: 2, inputs: 1

## ## Phase 6 — QA-24 tank-transfer refusals


```
[
 {
  "label": "different fuel",
  "status": 417,
  "arabic": true,
  "message": "frappe.exceptions.ValidationError: لا يمكن التحويل بين خزانين مختلفين في نوع الو"
 },
 {
  "label": "same tank",
  "status": 417,
  "arabic": true,
  "message": "frappe.exceptions.ValidationError: لا يمكن التحويل إلى نفس الخزان"
 },
 {
  "label": "zero quantity",
  "status": 417,
  "arabic": true,
  "message": "frappe.exceptions.ValidationError: لا يمكن التحويل بين خزانين مختلفين في نوع الو"
 }
]
```

## ## Phase 6 — tank transfer create

- text after save: "رجوع سجل — نظام إدارة محطات الوقود owner manager إضافة تحويل بين الخزانات المحطة اختر المحطة محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 من خزان اختر الخزان خزان 2 (ديزل — 0%) خزان 1 (بنزين — 0%) إلى خزان اختر الخزان لا يوجد خزان آخر من فرع الوقود في هذه المحطة — أضف خزانًا ثانيًا من نوع الوقود نفسه الكمية (لتر) المتاح في الخزان: 0 لتر السب"
- url: http://localhost:8004/app/inventory/transfers/create

## ## Phase 6 — tank transfers via API


```
{"results":[],"total":0}
```

## ## Phase 6 — network ≥400 (all)

- 401 /api/auth/me/
- 417 /api/export/?view=station
- 417 /api/export/
- 417 /api/tank-transfers/
- 417 /api/tank-transfers/
- 417 /api/tank-transfers/

## Reconciliation payload (pilot)

{
 "name": "4obo1dt0ab",
 "shift": "r394odkcji",
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
 "modified": "2026-10-03 20:43:05.171777"
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
 "name": "89nobnr38i",
 "shift": "7rdvdeed9l",
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
 "modified": "2026-10-03 20:49:07.986453"
}

## Console errors (phase 4)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Network ≥400 (phase 4)

- 401 /api/auth/me/

## ## Phase 6 — reports (as station owner)



## ### /reports/daily

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA موظف جديد 0 0 0 0 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"
- network ≥400: (none)

## ### /reports/monthly

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير الشهري يناير فبراير مارس أبريل مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر عرض طباعة محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 ⬇ Excel التقرير الشهري — أكتوبر 2026 نظام سجل لإدارة محطات الوقود · صدر بتاريخ 3‏/10‏/2026 إجمالي اللترات 20,803 المبيعات المتوقعة 2,820.45 د.ل التحصيل 2,390 د.ل المصروفات 0 د.ل النقد الصافي 2,000 د.ل المناوبات المغلقة 5 فرق المطابقة الإجمالي: -430.45 د.ل (عجز) المبيعات حسب نوع الوقود نوع الوقود اللترات المبيعات المتوقعة بنزين 16,803 2,520.45 د.ل "
- network ≥400: (none)

## ### /reports/inventory

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المخزون والتوريد eooc76snii — % 0 لتر 30,000 لتر tnv1v74rki — % 0 لتر 30,000 لتر lglek20e7g — % 0 لتر 30,000 لتر 3a3bp6v1tf — % 0 لتر 30,000 لتر 2htcljqpjd — % 0 لتر 30,000 لتر 0nh7pdp63f — % 0 لتر 1 لتر v5t3476079 — % 0 لتر 15,000 لتر v5thhppakt — % 0 لتر 30,000 لتر طلبات توريد معلقة لا توجد طلبات معلقة 🙂"
- network ≥400: (none)

## ### /shifts/gaps

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager فجوات العدادات العداد المحطة القراءة السابقة القراءة الحالية الفجوة (لتر) لا يمكن المقابلة بين قراءتين — سجّل قراءة أول انتناف دورة للمحطة لحساب الفجوة 🙂"
- network ≥400: (none)

## ### /shifts/day

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager يوم المحطة كل مناوبات وقراءات اليوم في شاشة واحدة جميع المحطات المعنية محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 ⚙ توليد مناوبات اليوم ⚡ وضع الطوارئ (24 ساعة) ملخصص يوم المحطة — اختر محطة لنُظرها المناوبات الفريدة المحطة قراءات مناوبات اللترات المتوقعت الحالة QA Cycle 2 0 / 2 0 2,000 0 — QA Cycle 3 0 / 2 0 2,000 300 — QA Edge Station 0 / 8 0 0 0 — QA Exception Lab 0 / 2 0 1,000 150 — QA Pilot Final 0 / 2 0 2,000 300 — QA موظف جديد 0 / 3 0 0 0 — محطة تجريبية — سجل 4 / 4 1 16,803 2,520.45"
- network ≥400: (none)

## ## Phase 6 — daily report for 2026-10-03 (explicit date)

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA موظف جديد 0 0 0 0 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"

## ## Phase 6 — export endpoint probe


```
[
 {
  "url": "/api/export/?view=station&name=v5scsl18m5",
  "status": 200,
  "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "length": 160,
  "head": "PK\u0003\u0004\u0014\u0000\u0000\u0000\b\u0000wzC]F�MH�\u0000\u0000\u0000�\u0000\u0000\u0000\u0010\u0000\u0000\u0000docProps/app.xmlM�M\u000b�0\f\u0006�Rv���\u001e�\u000eD=����.u��)m����\u0004?nyy�\u001b�.�\"&��E�.�m32�\r@�#�>�ʡ���{�1݁��\u001a\u000f"
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

## ## Phase 6 — monthly report Excel link

- href: /api/export/?view=station&name=v5scsl18m5
- station picker offers: محطة تجريبية — سجل | QA موظف جديد | QA Pilot Final | QA Exception Lab | QA Edge Station | QA Cycle 3 | QA Cycle 2

## ## Phase 6 — finance screens (as station owner)



## ### /finance

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager الإدارة المالية 💰 إدخال إيرادات إدخال المبيعات النقدية والكوبونات والإلكترونية 📊 المبيعات المالية عرض ملخص المبيعات اليومية 💵 التحصيل النقدي سجل التحصيلات النقدية 🎫 الكوبونات سجل مبيعات الكوبونات 💳 واصلات POS سجل المبيعات الإلكترونية 📤 المصروفات سجل المصروفات 📑 تسويات الكوبونات تسوية وتحصيل الكوبونات ⚖️ التسويات المالية التسويات والمطابقات ال"
- network ≥400: (none)

## ### /finance/daily-sales

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المبيعات المالية اليومية عرض طباعة المبيعات النقدية 2,000 د.ل مبيعات الكوبونات 90 د.ل المبيعات الإلكترونية 300 د.ل إجمالي التحصيل 2,390 د.ل تفاصيل الكوبونات الفئة العدد القيمة 5 د.ل 1 50 د.ل 8 د.ل 1 40 د.ل الإجمالي 2 90 د.ل المصروفات إجمالي المصروفات:0 د.ل صافي الإيرادات:2,390 د.ل 🙂"
- network ≥400: (none)

## ### /finance/fuel-prices

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager أسعار الوقود تُستخدم لحساب المبيعات المتوقعة عند إقفال المناوبات + إضافة سعر نوع الوقود سعر البيع التكلفة الهامش تاريخ السريان الحالة بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-01 ساري ديزل 0.15 د.ل 0.12 — 2026-1"
- network ≥400: (none)

## ### /finance/cash

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التحصيل النقدي المناوبة المبلغ الوقت المستلم مُلغي إقفال يوم 2026-10-03 (2026-10-03) 2,000 د.ل 2026-10-03 15:19:01.331000 — لا 🙂"
- network ≥400: (none)

## ### /finance/vouchers

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager الكوبونات المناوبة الفئة العدد القيمة مُلغي إقفال يوم 2026-10-03 (2026-10-03) 5 د.ل 10 50 د.ل لا إقفال يوم 2026-10-03 (2026-10-03) 8 د.ل 5 40 د.ل لا 🙂"
- network ≥400: (none)

## ### /finance/pos

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager واصلات POS المناوبة المبلغ عدد المعاملات مُلغي إقفال يوم 2026-10-03 (2026-10-03) 300 د.ل 7 لا 🙂"
- network ≥400: (none)

## ### /finance/expenses

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المصروفات + إضافة مصروف الفئة المبلغ الوصف طريقة الدفع إجراءات لا توجد مصروفات 🙂"
- network ≥400: (none)

## ### /finance/settlements

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager تسويات الكوبونات + إضافة تسوية المحطة التاريخ العدد القيمة المدفوع الحالة إجراءات لا توجد تسويات 🙂"
- network ≥400: (none)

## ### /finance/reconciliations

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التسويات المالية المناوبة المحطة المبيعات المتوقعة التحصيل الفرق الحالة إقفال يوم 2026-10-03 محطة تجريبية — سجل 2,520.45 2,390 -130.45 مسودة إقفال يوم 2026-11-21 QA Pilot Final 300 0 -300 مسودة إقفال يوم 2026-11-20 QA Pilot Final 0 0 0 مسودة إقفال يوم 2026-11-11 QA Exception Lab 150 0 -150 مسودة إقفال يوم 2026-11-10 QA Exception Lab 150 0 -150 مسودة"
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

- text: "إضافة قراءة خزان QA خزان 1 خزان 1 خزان 1 خزان 1 خزان 1 (بنزين) خزان 2 خزان 1 يومية افتتاحية قبل التوريد بعد التوريد حفظ التاريخ الخزان القراءة النوع المسجل لا توجد قراءات 🙂"

## ## Phase 6 — tank reading form fields

- selects: 2, inputs: 1

## ## Phase 6 — QA-24 tank-transfer refusals


```
[
 {
  "label": "different fuel",
  "status": 417,
  "arabic": true,
  "message": "frappe.exceptions.ValidationError: لا يمكن التحويل بين خزانين مختلفين في نوع الو"
 },
 {
  "label": "same tank",
  "status": 417,
  "arabic": true,
  "message": "frappe.exceptions.ValidationError: لا يمكن التحويل إلى نفس الخزان"
 },
 {
  "label": "zero quantity",
  "status": 417,
  "arabic": true,
  "message": "frappe.exceptions.ValidationError: لا يمكن التحويل بين خزانين مختلفين في نوع الو"
 }
]
```

## ## Phase 6 — tank transfer create

- text after save: "رجوع سجل — نظام إدارة محطات الوقود owner manager إضافة تحويل بين الخزانات المحطة اختر المحطة محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 من خزان اختر الخزان خزان 2 (ديزل — 0%) خزان 1 (بنزين — 0%) إلى خزان اختر الخزان لا يوجد خزان آخر من فرع الوقود في هذه المحطة — أضف خزانًا ثانيًا من نوع الوقود نفسه الكمية (لتر) المتاح في الخزان: 0 لتر السب"
- url: http://localhost:8004/app/inventory/transfers/create

## ## Phase 6 — tank transfers via API


```
{"results":[],"total":0}
```

## ## Phase 6 — network ≥400 (all)

- 401 /api/auth/me/
- 417 /api/export/?view=station
- 417 /api/export/
- 417 /api/tank-transfers/
- 417 /api/tank-transfers/
- 417 /api/tank-transfers/

## ## Phase 8 — station setup


- QA Edge Station id: 0ngg0kmd9n
- day_close_time before: 11:00:00

## ## Phase 8 — readings screen, cycle label

- period chip: دورة القراءة: 2026-10-04 11:00 ← 11:00
- body mentions 11:00: true
- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager قراءات المضخات أدخل القراءة الحالية لكل مسدس — القراءة السابقة (آخر قراءة لنفس المسدس) تُجلب تلقائياً اختر المحطة محطة تجريبية — سجل QA موظف جديد QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 إقفال اليوم دورة القراءة: 2026-10-04 11:00 ← 11:00 0 / 8 مكتملة — تبقي 8 قراءات اليوم إجمالي اللترات: 0 لتر جزيرة 1 (0/4) المسدس A مضخة 1 بنزين M01AX بانتظار القراءة القراءة السابقة (تلقائية) 100,000 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / استبدال العداد) المسدس B مضخة 1 بنزين M01BX بانتظار القراءة القراءة السابقة (تلقائية) 100,000 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / است"

## ## Phase 8 — readings entered


- guns: 8, previous readings: [100000,100000,100000,100000,100000,100000,100000,100000]
- entered: previous + 1,000 L on each gun
- total movement expected: 8,000 L

## ## Phase 8 — readings save result


- page tail: "00 القراءة المسجلة اليوم 101,000 اللترات المباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل المسدس B مضخة 4 بنزين M04B مسجلة القراءة السابقة 100,000 القراءة المسجلة اليوم 101,000 اللترات المباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل تم حفظ 8 قراءات بنجاح أدخلت الآن: 0 · مكتملة: 8/8 الإجمالي: 8,000 لتر حفظ القراءات المُدخلة 🙂"

## ## Phase 8 — readings backend cross-check


- readings stored for the station: 8

## ## Phase 8 — income entry shift options


- ["اختر المناوبة","إقفال يوم 2026-10-04 (2026-10-04)"]

## ## Phase 8 — income entry result


- page tail: "ل 7 د.ل 0 د.ل 8 د.ل 0 د.ل إجمالي الكوبونات: 0 د.ل المبيعات الإلكترونية المبلغ (د.ل) عدد المعاملات الالكترونية اترك عدد المعاملات الإلكترونية في هذا اليوم — اترك عددها إذا مع المبلغ إجمالي الإيرادات 0 د.ل نقد: 0 | كوبونات: 0 | إلكتروني: 0 حفظ الإيرادات إلغاء 🙂"
- network ≥400: (none)

## ## Phase 8 — income postings stored


- cash: 1200 (expected 1200.00), vouchers: 40 (expected 40)

## ## Phase 8 — day close


- close button disabled: false
- success message: true
- page tail: "لمباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل المسدس B مضخة 4 بنزين M04B مسجلة القراءة السابقة 100,000 القراءة المسجلة اليوم 101,000 اللترات المباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل تم إقفال اليوم وإنشاء التسوية المالية بنجاح أدخلت الآن: 0 · مكتملة: 8/8 الإجمالي: 8,000 لتر حفظ القراءات المُدخلة 🙂"

## ## Phase 8 — reconciliations after the cycle


```
[
 {
  "name": "9eektgs41c",
  "shift": "996iap4lje",
  "station": "0ngg0kmd9n",
  "total_liters": 8000,
  "expected_sales": 1200,
  "total_cash": 1200,
  "total_vouchers": 40,
  "total_pos": 0,
  "total_collection": 1240,
  "total_expenses": 0,
  "net_cash": 1200,
  "difference": 40,
  "difference_type": "surplus",
  "status": "draft",
  "modified": "2026-10-03 20:51:05.470707"
 },
 {
  "name": "89nobnr38i",
  "shift": "7rdvdeed9l",
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
  "modified": "2026-10-03 20:49:07.986453"
 },
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
  "shift": "tqu
```

## ## Phase 8 — edge station shifts


```
[
 {
  "name": "996iap4lje",
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
  "modified": "2026-10-03 20:51:05.418280"
 }
]
```

## ## Phase 8 — verdict inputs


- guns read: 8, litres entered: 8000
- expected sales at 0.15: 1200.00
- cash declared: 1200.00
- reconciliation: {"name":"9eektgs41c","shift":"996iap4lje","station":"0ngg0kmd9n","total_liters":8000,"expected_sales":1200,"total_cash":1200,"total_vouchers":40,"total_pos":0,"total_collection":1240,"total_expenses":0,"net_cash":1200,"difference":40,"difference_type":"surplus","status":"draft","modified":"2026-10-03 20:51:05.470707"}

## ## Phase 8 — network ≥400 (all)

- 401 /api/auth/me/

## ## Phase 5 — inventory screen sweep (as station owner)



## ### /inventory/deliveries (التموين)

- rendered chars: 700
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /inventory/deliveries/create (نموذج تموين)

- rendered chars: 949
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

- rendered chars: 1039
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /inventory/shortages (العجز)

- rendered chars: 644
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

- rendered chars: 841
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ## Phase 5 — delivery empty-submit validation

- inline guidance shown: false
- note: the form relies on HTML5 `required` only — an empty submit is blocked by the browser with no persistent in-page Arabic message, and the fuel-type / tank fields are silently left empty.
- page text: "ن) خزان 1 (بنزين) خزان 1 (بنزين) خزان 1 (بنزين) خزان 1 (بنزين) خزان 1 (بنزين) (بنزين) خزان 2 (ديزل) خزان 1 (بنزين) نوع الوقود رقم الفاتورة تاريخ الطلب تاريخ الاستلام الكمية المتوقعة (لتر) 40,000 20,000 الكمية المطلوبة (لتر) القراءة قبل القراءة بعد حفظ إلغاء 🙂"

## ## Phase 5 — delivery create


- invoice ref used: QA-INV-918545
- deliveries before: 2, after: 3
- created record: {"name":"9vgbfcr0q5","station":"0ngg0kmd9n","fuel_type":"بنزين","supplier":null,"expected_quantity":5000,"received_quantity":4900,"shortage":100,"invoice_number":"QA-INV-918545","payment_status":"unpaid","status":"received","order_date":"2026-10-03 15:21:00","modified":"2026-10-03 20:52:00.004926"}
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
محطة ت» 174×34
  - button «إقفال اليوم» 115×36

## ### 1366x768 /stations

- document scrollWidth 1366 vs viewport 1366 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 16
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
- controls under 40px tall: 10
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
- controls under 40px tall: 10
  - select «جميع المحطات المعن» 180×34
  - button «⚙ توليد مناوبات ال» 152×36
  - button «⚡ وضع الطوارئ (24 » 188×38
  - a «QA Cycle 2» 63×14
  - a «QA Cycle 3» 63×14
  - a «QA Edge Station» 99×14
  - a «QA Exception Lab» 105×14
  - a «QA Pilot Final» 82×14

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
- controls under 40px tall: 10
  - a «+ إضافة مستخدم» 132×36
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14

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
محطة ت» 174×34
  - button «إقفال اليوم» 115×36

## ### 1920x1080 /stations

- document scrollWidth 1920 vs viewport 1920 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 16
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
- controls under 40px tall: 10
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
- controls under 40px tall: 10
  - select «جميع المحطات المعن» 180×34
  - button «⚙ توليد مناوبات ال» 152×36
  - button «⚡ وضع الطوارئ (24 » 188×38
  - a «QA Cycle 2» 63×14
  - a «QA Cycle 3» 63×14
  - a «QA Edge Station» 99×14
  - a «QA Exception Lab» 105×14
  - a «QA Pilot Final» 82×14

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
- controls under 40px tall: 10
  - a «+ إضافة مستخدم» 132×36
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14

## Harness safety

- qaResetStationDay(EDGE, 2026-10-03): removed 0, historyKept 9, foreign 12
- qaResetStationDay(EDGE, 2026-10-02): removed 1
- pilot readings 4 → 4
- acceptance readings 8 → 8

## Transfer — opening levels

خزان أ بنزين 1: 20000/30000 · خزان أ بنزين 2: 0/20000

## Transfer — opening levels

خزان أ بنزين 1: 20000/30000 · خزان أ بنزين 2: 0/20000

## Transfer — invalid case

الكمية = صفر: qty=0 rows 0→0, levels خزان أ بنزين 1 20000→20000, خزان أ بنزين 2 0→0, url=/app/inventory/transfers/create

## Transfer — invalid case

كمية سالبة: qty=-5 rows 0→0, levels خزان أ بنزين 1 20000→20000, خزان أ بنزين 2 0→0, url=/app/inventory/transfers/create

## Transfer — invalid case

المصدر لا يحتمل الكمية: qty=25000 rows 0→1, levels خزان أ بنزين 1 20000→-5000, خزان أ بنزين 2 0→25000, url=/app/inventory/transfers

## Transfer — invalid case

تجاوز سعة الوجهة: qty=5000 rows 1→2, levels خزان أ بنزين 1 20000→15000, خزان أ بنزين 2 0→24000, url=/app/inventory/transfers

## Transfer — invalid cases verdict

{"zeroOk":true,"negOk":true,"shortOk":false,"capOk":false}

## Transfer — closing levels

خزان أ بنزين 1: 15000 · خزان أ بنزين 2: 5000

## Transfer — opening levels

خزان أ بنزين 1: 20000/30000 · خزان أ بنزين 2: 0/20000

## Transfer — invalid case

الكمية = صفر: qty=0 rows 0→0, levels خزان أ بنزين 1 20000→20000, خزان أ بنزين 2 0→0, url=/app/inventory/transfers/create

## Transfer — invalid case

كمية سالبة: qty=-5 rows 0→0, levels خزان أ بنزين 1 20000→20000, خزان أ بنزين 2 0→0, url=/app/inventory/transfers/create

## Transfer — invalid case

المصدر لا يحتمل الكمية: qty=25000 rows 0→0, levels خزان أ بنزين 1 20000→20000, خزان أ بنزين 2 0→0, url=/app/inventory/transfers/create

## Transfer — invalid case

تجاوز سعة الوجهة: qty=5000 rows 0→0, levels خزان أ بنزين 1 20000→20000, خزان أ بنزين 2 0→19000, url=/app/inventory/transfers/create

## Transfer — invalid cases verdict

{"zeroOk":true,"negOk":true,"shortOk":true,"capOk":false}

## Transfer — closing levels

خزان أ بنزين 1: 15000 · خزان أ بنزين 2: 5000

## Transfer — opening levels

خزان أ بنزين 1: 15000/30000 · خزان أ بنزين 2: 5000/20000

## Transfer — invalid case

الكمية = صفر: qty=0 rows 1→1, levels خزان أ بنزين 1 15000→15000, خزان أ بنزين 2 5000→5000, url=/app/inventory/transfers/create

## Transfer — invalid case

كمية سالبة: qty=-5 rows 1→1, levels خزان أ بنزين 1 15000→15000, خزان أ بنزين 2 5000→5000, url=/app/inventory/transfers/create

## Transfer — invalid case

المصدر لا يحتمل الكمية: qty=20000 rows 1→1, levels خزان أ بنزين 1 15000→15000, خزان أ بنزين 2 5000→5000, url=/app/inventory/transfers/create

## Transfer — invalid case

تجاوز سعة الوجهة: qty=5000 rows 1→1, levels خزان أ بنزين 1 15000→15000, خزان أ بنزين 2 19000→19000, url=/app/inventory/transfers/create

## Transfer — invalid cases verdict

{"zeroOk":true,"negOk":true,"shortOk":true,"capOk":true}

## Transfer — closing levels

خزان أ بنزين 1: 10000 · خزان أ بنزين 2: 10000

## Transfer — fixture reset

2 own transfer row(s) removed, opening levels restored

## Transfer — opening levels

خزان أ بنزين 1: 20000/30000 · خزان أ بنزين 2: 0/20000

## Transfer — invalid case

الكمية = صفر: qty=0 rows 0→0, levels خزان أ بنزين 1 20000→20000, خزان أ بنزين 2 0→0, msg=(no message), url=/app/inventory/transfers/create

## Transfer — invalid case

كمية سالبة: qty=-5 rows 0→0, levels خزان أ بنزين 1 20000→20000, خزان أ بنزين 2 0→0, msg=(no message), url=/app/inventory/transfers/create

## Transfer — invalid case

المصدر لا يحتمل الكمية: qty=25000 rows 0→0, levels خزان أ بنزين 1 20000→20000, خزان أ بنزين 2 0→0, msg=الكمية المطلوبة (25000 لتر) أكبر من المتاح في الخزان المصدر (20000.0 لتر), url=/app/inventory/transfers/create

## Transfer — invalid case

تجاوز سعة الوجهة: qty=5000 rows 0→0, levels خزان أ بنزين 1 20000→20000, خزان أ بنزين 2 19000→19000, msg=لا يتسع الخزان الوجهة: سعته 20000.0 لتر وفيه 19000.0 لتر — المتاح 1000.0 لتر فقط, url=/app/inventory/transfers/create

## Transfer — invalid cases verdict

{"zeroOk":true,"negOk":true,"shortOk":true,"capOk":true}

## Transfer — closing levels

خزان أ بنزين 1: 15000 · خزان أ بنزين 2: 5000

## Isolation — fixture users

qa-r4-sup@sejel.ly=supervisor@qgdsq7cd7b, qa-r4-fin@sejel.ly=finance@qgdsq7cd7b

## Isolation — supervisor

{"listOnlyOwn":true,"widen":true,"readForeign":403,"writeForeign":403,"createTransfer":200,"picker":"(none)"}

## Isolation — finance

{"createForeignExpense":200,"createOwnExpense":200}

## Isolation — fixture users

qa-r4-sup@sejel.ly=supervisor@qgdsq7cd7b, qa-r4-fin@sejel.ly=finance@qgdsq7cd7b

## Isolation — fixture users

qa-r4-sup@sejel.ly=supervisor@qgdsq7cd7b, qa-r4-fin@sejel.ly=finance@qgdsq7cd7b

## Isolation — supervisor

{"listOnlyOwn":true,"widen":true,"readForeign":403,"writeForeign":403,"createTransfer":403,"picker":"(none)"}

## Isolation — finance

{"createForeignExpense":403,"createOwnExpense":200}

## Isolation — fixture users

qa-r4-sup@sejel.ly=supervisor@qgdsq7cd7b, qa-r4-fin@sejel.ly=finance@qgdsq7cd7b

## Isolation — supervisor

{"listOnlyOwn":true,"widen":true,"readForeign":403,"writeForeign":403,"createTransfer":403,"picker":"(none)"}

## Isolation — finance

{"createForeignExpense":403,"createOwnExpense":200}

## Isolation — reports

{"adminExpenses":1555556,"supervisorExpenses":2,"dailyStations":["qgdsq7cd7b"],"exportForeign":403,"exportOwn":200,"guest":[403,403,403,403]}

## Isolation — fixture users

qa-r4-sup@sejel.ly=supervisor@qgdsq7cd7b, qa-r4-fin@sejel.ly=finance@qgdsq7cd7b

## Isolation — supervisor

{"listOnlyOwn":true,"widen":true,"readForeign":403,"writeForeign":403,"createTransfer":403,"picker":"(none)"}

## Isolation — finance

{"createForeignExpense":403,"createOwnExpense":200}

## Isolation — reports

{"adminExpenses":777778,"supervisorExpenses":1,"dailyStations":["qgdsq7cd7b"],"exportForeign":403,"exportOwn":200,"guest":[403,403,403,403]}

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
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 417 /api/setup-station/
- 417 /api/meter-readings/
- 417 /api/meter-readings/

## Cycle — QA R4 أ

دورة القراءة: 2026-10-03 11:00 ← 11:00

## Cycle — QA R4 ب

دورة القراءة: 2026-10-03 10:30 ← 10:30

## Reconciliation payload (pilot)

{
 "name": "j2pg9tsf5o",
 "shift": "g4kp8pdqf9",
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
 "modified": "2026-10-03 22:56:45.725761"
}

## Console errors (phase 4)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Network ≥400 (phase 4)

- 401 /api/auth/me/

## Mobile الرئيسية

{"overflow":false,"small":[],"scrollW":390,"clientW":390}

## Mobile القراءات

{"overflow":false,"small":[],"scrollW":390,"clientW":390}

## Mobile المالية

{"overflow":false,"small":[],"scrollW":390,"clientW":390}

## Mobile المخزون

{"overflow":false,"small":[],"scrollW":390,"clientW":390}

## Mobile الرئيسية

{"overflow":false,"small":[],"scrollW":390,"clientW":390}

## Mobile القراءات

{"overflow":false,"small":[],"scrollW":390,"clientW":390}

## Mobile المالية

{"overflow":false,"small":[],"scrollW":390,"clientW":390}

## Mobile المخزون

{"overflow":false,"small":[],"scrollW":390,"clientW":390}

## ## Phase 8 — station setup


- QA Edge Station id: 0ngg0kmd9n
- day_close_time before: 11:00:00

## ## Phase 8 — readings screen, cycle label

- period chip: دورة القراءة: 2026-10-04 11:00 ← 11:00
- body mentions 11:00: true
- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager قراءات المضخات أدخل القراءة الحالية لكل مسدس — القراءة السابقة (آخر قراءة لنفس المسدس) تُجلب تلقائياً اختر المحطة QA موظف جديد QA R4 ب QA R4 أ محطة تجريبية — سجل QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 إقفال اليوم دورة القراءة: 2026-10-04 11:00 ← 11:00 0 / 8 مكتملة — تبقي 8 قراءات اليوم إجمالي اللترات: 0 لتر جزيرة 1 (0/4) المسدس A مضخة 1 بنزين M01AX بانتظار القراءة القراءة السابقة (تلقائية) 100,000 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / استبدال العداد) المسدس B مضخة 1 بنزين M01BX بانتظار القراءة القراءة السابقة (تلقائية) 100,000 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استث"

## ## Phase 8 — readings entered


- guns: 8, previous readings: [100000,100000,100000,100000,100000,100000,100000,100000]
- entered: previous + 1,000 L on each gun
- total movement expected: 8,000 L

## ## Phase 8 — readings save result


- page tail: "00 القراءة المسجلة اليوم 101,000 اللترات المباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل المسدس B مضخة 4 بنزين M04B مسجلة القراءة السابقة 100,000 القراءة المسجلة اليوم 101,000 اللترات المباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل تم حفظ 8 قراءات بنجاح أدخلت الآن: 0 · مكتملة: 8/8 الإجمالي: 8,000 لتر حفظ القراءات المُدخلة 🙂"

## ## Phase 8 — readings backend cross-check


- readings stored for the station: 8

## ## Phase 8 — income entry shift options


- ["اختر المناوبة","إقفال يوم 2026-10-04 (2026-10-04)"]

## ## Phase 8 — income entry result


- page tail: "ل 7 د.ل 0 د.ل 8 د.ل 0 د.ل إجمالي الكوبونات: 0 د.ل المبيعات الإلكترونية المبلغ (د.ل) عدد المعاملات الالكترونية اترك عدد المعاملات الإلكترونية في هذا اليوم — اترك عددها إذا مع المبلغ إجمالي الإيرادات 0 د.ل نقد: 0 | كوبونات: 0 | إلكتروني: 0 حفظ الإيرادات إلغاء 🙂"
- network ≥400: (none)

## ## Phase 8 — income postings stored


- cash: 1200 (expected 1200.00), vouchers: 40 (expected 40)

## ## Phase 8 — day close


- close button disabled: false
- success message: true
- page tail: "لمباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل المسدس B مضخة 4 بنزين M04B مسجلة القراءة السابقة 100,000 القراءة المسجلة اليوم 101,000 اللترات المباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل تم إقفال اليوم وإنشاء التسوية المالية بنجاح أدخلت الآن: 0 · مكتملة: 8/8 الإجمالي: 8,000 لتر حفظ القراءات المُدخلة 🙂"

## ## Phase 8 — reconciliations after the cycle


```
[
 {
  "name": "ljhqot5t14",
  "shift": "le5qbrcsop",
  "station": "0ngg0kmd9n",
  "total_liters": 8000,
  "expected_sales": 1200,
  "total_cash": 1200,
  "total_vouchers": 40,
  "total_pos": 0,
  "total_collection": 1240,
  "total_expenses": 0,
  "net_cash": 1200,
  "difference": 40,
  "difference_type": "surplus",
  "status": "draft",
  "modified": "2026-10-03 23:01:04.138336"
 },
 {
  "name": "j2pg9tsf5o",
  "shift": "g4kp8pdqf9",
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
  "modified": "2026-10-03 22:56:45.725761"
 },
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
  "shift": "tqu
```

## ## Phase 8 — edge station shifts


```
[
 {
  "name": "le5qbrcsop",
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
  "modified": "2026-10-03 23:01:04.086197"
 }
]
```

## ## Phase 8 — verdict inputs


- guns read: 8, litres entered: 8000
- expected sales at 0.15: 1200.00
- cash declared: 1200.00
- reconciliation: {"name":"ljhqot5t14","shift":"le5qbrcsop","station":"0ngg0kmd9n","total_liters":8000,"expected_sales":1200,"total_cash":1200,"total_vouchers":40,"total_pos":0,"total_collection":1240,"total_expenses":0,"net_cash":1200,"difference":40,"difference_type":"surplus","status":"draft","modified":"2026-10-03 23:01:04.138336"}

## ## Phase 8 — network ≥400 (all)

- 401 /api/auth/me/

## ## Phase 5 — inventory screen sweep (as station owner)



## ## Phase 6 — reports (as station owner)



## ### /inventory/deliveries (التموين)

- rendered chars: 751
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /reports/daily

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق QA موظف جديد 0 0 0 0 QA R4 ب 0 0 0 0 QA R4 أ 0 0 0 0 محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"
- network ≥400: (none)

## ### /inventory/deliveries/create (نموذج تموين)

- rendered chars: 1051
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /reports/monthly

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير الشهري يناير فبراير مارس أبريل مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر عرض طباعة QA موظف جديد QA R4 ب QA R4 أ محطة تجريبية — سجل QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 ⬇ Excel التقرير الشهري — أكتوبر 2026 نظام سجل لإدارة محطات الوقود · صدر بتاريخ 3‏/10‏/2026 إجمالي اللترات 28,803 المبيعات المتوقعة 4,020.45 د.ل التحصيل 3,630 د.ل المصروفات 0 د.ل النقد الصافي 3,200 د.ل المناوبات المغلقة 6 فرق المطابقة الإجمالي: -390.45 د.ل (عجز) المبيعات حسب نوع الوقود نوع الوقود اللترات المبيعات المتوقعة بنزين 24,8"
- network ≥400: (none)

## ### /inventory/tank-readings (قراءات الخزانات)

- rendered chars: 608
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /reports/inventory

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المخزون والتوريد qgecihef7c — % 15,010 لتر 30,000 لتر qge7fnblaj — % 4,990 لتر 20,000 لتر qgjrm8cfsi — % 5,000 لتر 15,000 لتر qgjetac3bh — % 12,000 لتر 25,000 لتر eooc76snii — % 0 لتر 30,000 لتر tnv1v74rki — % 0 لتر 30,000 لتر lglek20e7g — % 0 لتر 30,000 لتر 3a3bp6v1tf — % 0 لتر 30,000 لتر 2htcljqpjd — % 0 لتر 30,000 لتر 0nh7pdp63f — % 0 لتر 1 لتر v5t3476079 — % 0 لتر 15,000 لتر v5thhppakt — % 0 لتر 30,000 لتر طلبات توريد معلقة لا توجد طلبات معلقة 🙂"
- network ≥400: (none)

## ### /inventory/transfers (التحويلات)

- rendered chars: 666
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /shifts/gaps

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager فجوات العدادات العداد المحطة القراءة السابقة القراءة الحالية الفجوة (لتر) M01AXXXXXX — 500,000 1 -499,999 M01AXXXXXX — 501,234.567 500,000 -1,234.567 M01BXXXXXX — 600,000 50 -599,950 M01BXXXXXX — 50 600,000 +599,950 🙂"
- network ≥400: (none)

## ### /inventory/transfers/create (نموذج تحويل)

- rendered chars: 1251
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /inventory/shortages (العجز)

- rendered chars: 644
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /shifts/day

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager يوم المحطة كل مناوبات وقراءات اليوم في شاشة واحدة جميع المحطات المعنية QA موظف جديد QA R4 ب QA R4 أ محطة تجريبية — سجل QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 ⚙ توليد مناوبات اليوم ⚡ وضع الطوارئ (24 ساعة) ملخصص يوم المحطة — اختر محطة لنُظرها المناوبات الفريدة المحطة قراءات مناوبات اللترات المتوقعت الحالة QA Cycle 2 0 / 2 0 2,000 0 — QA Cycle 3 0 / 2 0 2,000 300 — QA Edge Station 0 / 8 0 8,000 1,200 — QA Exception Lab 0 / 2 0 1,000 150 — QA Pilot Final 0 / 2 0 2,000 300 — QA R4 أ 0 / 1 0 0 0 — QA R4 ب 0 / 1 0 0 0 — Q"
- network ≥400: (none)

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

## ## Phase 6 — daily report for 2026-10-03 (explicit date)

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق QA موظف جديد 0 0 0 0 QA R4 ب 0 0 0 0 QA R4 أ 0 0 0 0 محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"

## ## Phase 6 — export endpoint probe


```
[
 {
  "url": "/api/export/?view=station&name=v5scsl18m5",
  "status": 200,
  "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "length": 160,
  "head": "PK\u0003\u0004\u0014\u0000\u0000\u0000\b\u0000�C]F�MH�\u0000\u0000\u0000�\u0000\u0000\u0000\u0010\u0000\u0000\u0000docProps/app.xmlM�M\u000b�0\f\u0006�Rv���\u001e�\u000eD=����.u��)m����\u0004?nyy�\u001b�.�\"&��E�.�m32�\r@�#�>�ʡ���{�1݁��\u001a\u000f�"
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

## ### /inventory/requests/create (طلب تموين)

- rendered chars: 940
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ## Phase 6 — monthly report Excel link

- href: /api/export/?view=station&name=eom4mfe6e9
- station picker offers: QA موظف جديد | QA R4 ب | QA R4 أ | محطة تجريبية — سجل | QA Pilot Final | QA Exception Lab | QA Edge Station | QA Cycle 3 | QA Cycle 2

## ## Phase 6 — finance screens (as station owner)



## ## Phase 5 — delivery empty-submit validation

- inline guidance shown: false
- note: the form relies on HTML5 `required` only — an empty submit is blocked by the browser with no persistent in-page Arabic message, and the fuel-type / tank fields are silently left empty.
- page text: "ن) خزان 1 (بنزين) خزان 1 (بنزين) خزان 1 (بنزين) خزان 1 (بنزين) خزان 1 (بنزين) (بنزين) خزان 2 (ديزل) خزان 1 (بنزين) نوع الوقود رقم الفاتورة تاريخ الطلب تاريخ الاستلام الكمية المتوقعة (لتر) 40,000 20,000 الكمية المطلوبة (لتر) القراءة قبل القراءة بعد حفظ إلغاء 🙂"

## ### /finance

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager الإدارة المالية 💰 إدخال إيرادات إدخال المبيعات النقدية والكوبونات والإلكترونية 📊 المبيعات المالية عرض ملخص المبيعات اليومية 💵 التحصيل النقدي سجل التحصيلات النقدية 🎫 الكوبونات سجل مبيعات الكوبونات 💳 واصلات POS سجل المبيعات الإلكترونية 📤 المصروفات سجل المصروفات 📑 تسويات الكوبونات تسوية وتحصيل الكوبونات ⚖️ التسويات المالية التسويات والمطابقات ال"
- network ≥400: (none)

## ### /finance/daily-sales

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المبيعات المالية اليومية عرض طباعة المبيعات النقدية 3,200 د.ل مبيعات الكوبونات 130 د.ل المبيعات الإلكترونية 300 د.ل إجمالي التحصيل 3,630 د.ل تفاصيل الكوبونات الفئة العدد القيمة 5 د.ل 2 90 د.ل 8 د.ل 1 40 د.ل الإجمالي 3 130 د.ل المصروفات إجمالي المصروفات:0 د.ل صافي الإيرادات:3,630 د.ل 🙂"
- network ≥400: (none)

## ### /finance/fuel-prices

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager أسعار الوقود تُستخدم لحساب المبيعات المتوقعة عند إقفال المناوبات + إضافة سعر نوع الوقود سعر البيع التكلفة الهامش تاريخ السريان الحالة بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-01 ساري ديزل 0.15 د.ل 0.12 — 2026-1"
- network ≥400: (none)

## ## Phase 5 — delivery create


- invoice ref used: QA-INV-640721
- deliveries before: 3, after: 4
- created record: {"name":"v578p64prp","station":"0ngg0kmd9n","fuel_type":"بنزين","supplier":null,"expected_quantity":5000,"received_quantity":4900,"shortage":100,"invoice_number":"QA-INV-640721","payment_status":"unpaid","status":"received","order_date":"2026-10-03 17:47:00","modified":"2026-10-03 23:17:22.358043"}
- url after save: http://localhost:8004/app/inventory/deliveries

## ### /finance/cash

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التحصيل النقدي المناوبة المبلغ الوقت المستلم مُلغي إقفال يوم 2026-10-04 (2026-10-04) 1,200 د.ل 2026-10-03 17:30:55.549000 — لا إقفال يوم 2026-10-03 (2026-10-03) 2,000 د.ل 2026-10-03 17:26:39.026000 — لا 🙂"
- network ≥400: (none)

## ## Phase 5 — /inventory/shortages

- text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائم 🏧 الدفع الإلكتروني 🧾 المصروفات 📑 تسوية القسائم المخزون 🚚 الشحنات 📖 قراءات الخزانات 🔁 التحويلات ⚠️ النقص 📉 تسوية الوقود 📝 طلبات التوريد التقارير 📅 التقرير اليومي 📆 التقرير الشهري 📦 المخزون والتوريد 🔍 فجوات العدادات الإعدادات 📖 دليل الاستخدام رجوع سجل — نظام إدارة مح"

## ## Phase 5 — /inventory/fuel-reconciliation

- text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائم 🏧 الدفع الإلكتروني 🧾 المصروفات 📑 تسوية القسائم المخزون 🚚 الشحنات 📖 قراءات الخزانات 🔁 التحويلات ⚠️ النقص 📉 تسوية الوقود 📝 طلبات التوريد التقارير 📅 التقرير اليومي 📆 التقرير الشهري 📦 المخزون والتوريد 🔍 فجوات العدادات الإعدادات 📖 دليل الاستخدام رجوع سجل — نظام إدارة مح"

## ### /finance/vouchers

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager الكوبونات المناوبة الفئة العدد القيمة مُلغي إقفال يوم 2026-10-04 (2026-10-04) 5 د.ل 8 40 د.ل لا إقفال يوم 2026-10-03 (2026-10-03) 8 د.ل 5 40 د.ل لا إقفال يوم 2026-10-03 (2026-10-03) 5 د.ل 10 50 د.ل لا 🙂"
- network ≥400: (none)

## ## Phase 5 — /finance/reconciliations

- text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائم 🏧 الدفع الإلكتروني 🧾 المصروفات 📑 تسوية القسائم المخزون 🚚 الشحنات 📖 قراءات الخزانات 🔁 التحويلات ⚠️ النقص 📉 تسوية الوقود 📝 طلبات التوريد التقارير 📅 التقرير اليومي 📆 التقرير الشهري 📦 المخزون والتوريد 🔍 فجوات العدادات الإعدادات 📖 دليل الاستخدام رجوع سجل — نظام إدارة مح"

## ## Phase 5 — network ≥400 (all)

- 401 /api/auth/me/

## ## Phase 5 — console errors (all)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## ### /finance/pos

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager واصلات POS المناوبة المبلغ عدد المعاملات مُلغي إقفال يوم 2026-10-03 (2026-10-03) 300 د.ل 7 لا 🙂"
- network ≥400: (none)

## ### /finance/expenses

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المصروفات + إضافة مصروف الفئة المبلغ الوصف طريقة الدفع إجراءات لا توجد مصروفات 🙂"
- network ≥400: (none)

## ### /finance/settlements

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager تسويات الكوبونات + إضافة تسوية المحطة التاريخ العدد القيمة المدفوع الحالة إجراءات لا توجد تسويات 🙂"
- network ≥400: (none)

## ### /finance/reconciliations

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التسويات المالية المناوبة المحطة المبيعات المتوقعة التحصيل الفرق الحالة إقفال يوم 2026-10-04 QA Edge Station 1,200 1,240 40 مسودة إقفال يوم 2026-10-03 محطة تجريبية — سجل 2,520.45 2,390 -130.45 مسودة إقفال يوم 2026-11-21 QA Pilot Final 300 0 -300 مسودة إقفال يوم 2026-11-20 QA Pilot Final 0 0 0 مسودة إقفال يوم 2026-11-11 QA Exception Lab 150 0 -150 مس"
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

- text: "إضافة قراءة خزان أ بنزين 1 خزان أ بنزين 2 خزان ب ديزل خزان ب بنزين خزان QA خزان 1 خزان 1 خزان 1 خزان 1 خزان 1 (بنزين) خزان 2 خزان 1 يومية افتتاحية قبل التوريد بعد التوريد حفظ التاريخ الخزان القراءة النوع المسجل لا توجد قراءات 🙂"

## ## Phase 6 — tank reading form fields

- selects: 2, inputs: 1

## ## Phase 6 — QA-24 tank-transfer refusals


```
[
 {
  "label": "different fuel",
  "status": 417,
  "arabic": true,
  "message": "frappe.exceptions.ValidationError: لا يمكن التحويل بين خزانين مختلفين في نوع الو"
 },
 {
  "label": "same tank",
  "status": 417,
  "arabic": true,
  "message": "frappe.exceptions.ValidationError: لا يمكن التحويل إلى نفس الخزان"
 },
 {
  "label": "zero quantity",
  "status": 417,
  "arabic": true,
  "message": "frappe.exceptions.ValidationError: لا يمكن التحويل بين خزانين مختلفين في نوع الو"
 }
]
```

## ## Phase 6 — tank transfer create

- text after save: "رجوع سجل — نظام إدارة محطات الوقود owner manager إضافة تحويل بين الخزانات المحطة اختر المحطة QA موظف جديد QA R4 ب QA R4 أ محطة تجريبية — سجل QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 من خزان اختر الخزان خزان 2 (ديزل — 0%) خزان 1 (بنزين — 0%) إلى خزان اختر الخزان لا يوجد خزان آخر من فرع الوقود في هذه المحطة — أضف خزانًا ثانيًا من نوع الوقود نفسه الكمية (لتر) المتاح في ال"
- url: http://localhost:8004/app/inventory/transfers/create

## ## Phase 6 — tank transfers via API


```
{"results":[{"name":"3792d3at2t","station":"qgdsq7cd7b","from_tank":"qgecihef7c","to_tank":"qge7fnblaj","fuel_type":"بنزين","quantity":5000,"reason":"تحويل بين خزانين من نفس الوقود","status":"completed","transfer_date":"2026-10-03 22:29:41.744548","modified":"2026-10-03 22:29:41.744812"}],"total":1}
```

## ## Phase 6 — network ≥400 (all)

- 401 /api/auth/me/
- 417 /api/export/?view=station
- 417 /api/export/
- 417 /api/tank-transfers/
- 417 /api/tank-transfers/
- 417 /api/tank-transfers/

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

## Edge station teardown — SPA message

- لا يمكن الحذف: هذا السجل مرتبط بـ الشحنة (v578p64prp) — احذف السجلات المرتبطة به أولاً ✕

## Console errors (phase 3 part B)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)
- Failed to load resource: the server responded with a status of 417 (EXPECTATION FAILED)

## Network ≥400 (phase 3)

- 401 /api/auth/me/
- 417 /api/setup-station/
- 417 /api/meter-readings/
- 417 /api/meter-readings/

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
QA موظ» 174×34
  - button «إقفال اليوم» 115×36

## ### 1366x768 /stations

- document scrollWidth 1366 vs viewport 1366 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 20
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
- controls under 40px tall: 14
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
- controls under 40px tall: 12
  - select «جميع المحطات المعن» 180×34
  - button «⚙ توليد مناوبات ال» 152×36
  - button «⚡ وضع الطوارئ (24 » 188×38
  - a «QA Cycle 2» 63×14
  - a «QA Cycle 3» 63×14
  - a «QA Edge Station» 99×14
  - a «QA Exception Lab» 105×14
  - a «QA Pilot Final» 82×14

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
- controls under 40px tall: 16
  - a «+ إضافة مستخدم» 132×36
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14

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
QA موظ» 174×34
  - button «إقفال اليوم» 115×36

## ### 1920x1080 /stations

- document scrollWidth 1920 vs viewport 1920 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 20
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
- controls under 40px tall: 14
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
- controls under 40px tall: 12
  - select «جميع المحطات المعن» 180×34
  - button «⚙ توليد مناوبات ال» 152×36
  - button «⚡ وضع الطوارئ (24 » 188×38
  - a «QA Cycle 2» 63×14
  - a «QA Cycle 3» 63×14
  - a «QA Edge Station» 99×14
  - a «QA Exception Lab» 105×14
  - a «QA Pilot Final» 82×14

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
- controls under 40px tall: 16
  - a «+ إضافة مستخدم» 132×36
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14

## Harness safety

- qaResetStationDay(EDGE, 2026-10-03): removed 0, historyKept 1, foreign 12
- qaResetStationDay(EDGE, 2026-10-02): removed 1
- pilot readings 4 → 4
- acceptance readings 8 → 8

## Transfer — fixture reset

0 own transfer row(s) removed, opening levels restored

## Transfer — opening levels

خزان أ بنزين 1: 20000/30000 · خزان أ بنزين 2: 0/20000

## Transfer — invalid case

الكمية = صفر: qty=0 rows 0→0, levels خزان أ بنزين 1 20000→20000, خزان أ بنزين 2 0→0, msg=(no message), url=/app/inventory/transfers/create

## Transfer — invalid case

كمية سالبة: qty=-5 rows 0→0, levels خزان أ بنزين 1 20000→20000, خزان أ بنزين 2 0→0, msg=(no message), url=/app/inventory/transfers/create

## Transfer — invalid case

المصدر لا يحتمل الكمية: qty=25000 rows 0→0, levels خزان أ بنزين 1 20000→20000, خزان أ بنزين 2 0→0, msg=الكمية المطلوبة (25000 لتر) أكبر من المتاح في الخزان المصدر (20000.0 لتر), url=/app/inventory/transfers/create

## Transfer — invalid case

تجاوز سعة الوجهة: qty=5000 rows 0→0, levels خزان أ بنزين 1 20000→20000, خزان أ بنزين 2 19000→19000, msg=لا يتسع الخزان الوجهة: سعته 20000.0 لتر وفيه 19000.0 لتر — المتاح 1000.0 لتر فقط, url=/app/inventory/transfers/create

## Transfer — invalid cases verdict

{"zeroOk":true,"negOk":true,"shortOk":true,"capOk":true}

## Transfer — closing levels

خزان أ بنزين 1: 15000 · خزان أ بنزين 2: 5000

## Isolation — fixture users

qa-r4-sup@sejel.ly=supervisor@qgdsq7cd7b, qa-r4-fin@sejel.ly=finance@qgdsq7cd7b

## Isolation — supervisor

{"listOnlyOwn":true,"widen":true,"readForeign":403,"writeForeign":403,"createTransfer":403,"picker":"(none)"}

## Isolation — finance

{"createForeignExpense":403,"createOwnExpense":200}

## Isolation — reports

{"adminExpenses":777778,"supervisorExpenses":1,"dailyStations":["qgdsq7cd7b"],"exportForeign":403,"exportOwn":200,"guest":[403,403,403,403]}

## Cycle — QA R4 أ

دورة القراءة: 2026-10-03 11:00 ← 11:00

## Cycle — QA R4 ب

دورة القراءة: 2026-10-03 10:30 ← 10:30

## Mobile الرئيسية

{"overflow":false,"small":[],"scrollW":390,"clientW":390}

## Mobile القراءات

{"overflow":false,"small":[],"scrollW":390,"clientW":390}

## Mobile المالية

{"overflow":false,"small":[],"scrollW":390,"clientW":390}

## Mobile المخزون

{"overflow":false,"small":[],"scrollW":390,"clientW":390}

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

## Edge station teardown — SPA message

- لا يمكن الحذف: هذا السجل مرتبط بـ الشحنة (v578p64prp) — احذف السجلات المرتبطة به أولاً ✕

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
 "name": "6m22ickjhf",
 "shift": "65i95t44de",
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
 "modified": "2026-10-03 23:30:13.038584"
}

## Console errors (phase 4)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Network ≥400 (phase 4)

- 401 /api/auth/me/

## ## Phase 5 — inventory screen sweep (as station owner)



## ### /inventory/deliveries (التموين)

- rendered chars: 802
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /inventory/deliveries/create (نموذج تموين)

- rendered chars: 1051
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

- rendered chars: 1250
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

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

## Edge station teardown — SPA message

- لا يمكن الحذف: هذا السجل مرتبط بـ الشحنة (v578p64prp) — احذف السجلات المرتبطة به أولاً ✕

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
 "name": "bsocdsrrvo",
 "shift": "bag8u1el79",
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
 "modified": "2026-10-03 23:39:06.469832"
}

## Console errors (phase 4)

- Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)

## Network ≥400 (phase 4)

- 401 /api/auth/me/

## ## Phase 5 — inventory screen sweep (as station owner)



## ### /inventory/deliveries (التموين)

- rendered chars: 802
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /inventory/deliveries/create (نموذج تموين)

- rendered chars: 1051
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

- rendered chars: 1250
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ### /inventory/shortages (العجز)

- rendered chars: 644
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

- rendered chars: 940
- console errors: (none)
- network ≥400: (none)
- visible text: "سجل 🏠 الرئيسية العمليات 🎯 قراءات المضخات 🗓️ يوم المحطة 🔄 المناوبات ⛽ المحطات 🧭 إعداد محطة 👥 الموظفين 📋 تعريفات المناوبات المالية 💰 المالية 📥 إدخال إيرادات 📊 المبيعات المالية 💲 أسعار الوقود 💵 النقدية 🎫 القسائ"

## ## Phase 5 — delivery empty-submit validation

- inline guidance shown: false
- note: the form relies on HTML5 `required` only — an empty submit is blocked by the browser with no persistent in-page Arabic message, and the fuel-type / tank fields are silently left empty.
- page text: "ن) خزان 1 (بنزين) خزان 1 (بنزين) خزان 1 (بنزين) خزان 1 (بنزين) خزان 1 (بنزين) (بنزين) خزان 2 (ديزل) خزان 1 (بنزين) نوع الوقود رقم الفاتورة تاريخ الطلب تاريخ الاستلام الكمية المتوقعة (لتر) 40,000 20,000 الكمية المطلوبة (لتر) القراءة قبل القراءة بعد حفظ إلغاء 🙂"

## ## Phase 5 — delivery create


- invoice ref used: QA-INV-991184
- deliveries before: 4, after: 5
- created record: {"name":"cb7r9mgp1b","station":"0ngg0kmd9n","fuel_type":"بنزين","supplier":null,"expected_quantity":5000,"received_quantity":4900,"shortage":100,"invoice_number":"QA-INV-991184","payment_status":"unpaid","status":"received","order_date":"2026-10-03 18:09:00","modified":"2026-10-03 23:39:52.730843"}
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

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق QA R4 ب 0 0 0 0 QA R4 أ 0 0 0 0 QA موظف جديد 0 0 0 0 محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"
- network ≥400: (none)

## ### /reports/monthly

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير الشهري يناير فبراير مارس أبريل مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر عرض طباعة QA R4 ب QA R4 أ QA موظف جديد محطة تجريبية — سجل QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 ⬇ Excel التقرير الشهري — أكتوبر 2026 نظام سجل لإدارة محطات الوقود · صدر بتاريخ 3‏/10‏/2026 إجمالي اللترات 20,803 المبيعات المتوقعة 2,820.45 د.ل التحصيل 2,390 د.ل المصروفات 0 د.ل النقد الصافي 2,000 د.ل المناوبات المغلقة 5 فرق المطابقة الإجمالي: -430.45 د.ل (عجز) المبيعات حسب نوع الوقود نوع الوقود اللترات المبيعات المتوقعة بنزين 16,8"
- network ≥400: (none)

## ### /reports/inventory

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المخزون والتوريد qge7fnblaj — % 0 لتر 20,000 لتر qgecihef7c — % 20,000 لتر 30,000 لتر qgjrm8cfsi — % 5,000 لتر 15,000 لتر qgjetac3bh — % 12,000 لتر 25,000 لتر eooc76snii — % 0 لتر 30,000 لتر tnv1v74rki — % 0 لتر 30,000 لتر lglek20e7g — % 0 لتر 30,000 لتر 3a3bp6v1tf — % 0 لتر 30,000 لتر 2htcljqpjd — % 0 لتر 30,000 لتر 0nh7pdp63f — % 0 لتر 1 لتر v5t3476079 — % 0 لتر 15,000 لتر v5thhppakt — % 0 لتر 30,000 لتر طلبات توريد معلقة لا توجد طلبات معلقة 🙂"
- network ≥400: (none)

## ### /shifts/gaps

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager فجوات العدادات العداد المحطة القراءة السابقة القراءة الحالية الفجوة (لتر) M01AXXXXXX — 500,000 1 -499,999 M01AXXXXXX — 501,234.567 500,000 -1,234.567 M01BXXXXXX — 600,000 50 -599,950 M01BXXXXXX — 50 600,000 +599,950 🙂"
- network ≥400: (none)

## ### /shifts/day

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager يوم المحطة كل مناوبات وقراءات اليوم في شاشة واحدة جميع المحطات المعنية QA R4 ب QA R4 أ QA موظف جديد محطة تجريبية — سجل QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 ⚙ توليد مناوبات اليوم ⚡ وضع الطوارئ (24 ساعة) ملخصص يوم المحطة — اختر محطة لنُظرها المناوبات الفريدة المحطة قراءات مناوبات اللترات المتوقعت الحالة QA Cycle 2 0 / 2 0 2,000 0 — QA Cycle 3 0 / 2 0 2,000 300 — QA Edge Station 0 / 8 0 0 0 — QA Exception Lab 0 / 2 0 1,000 150 — QA Pilot Final 0 / 2 0 2,000 300 — QA R4 أ 0 / 1 0 0 0 — QA R4 ب 0 / 1 0 0 0 — QA موظف ج"
- network ≥400: (none)

## ## Phase 6 — daily report for 2026-10-03 (explicit date)

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التقرير اليومي عرض 🖨️ طباعة إجمالي اللترات 16,803 المبيعات المتوقعة 2,520.45 د.ل إجمالي التحصيل 2,390 د.ل الفرق -130.45 د.ل مقارنة المحطات المحطة اللترات المبيعات التحصيل الفرق QA R4 ب 0 0 0 0 QA R4 أ 0 0 0 0 QA موظف جديد 0 0 0 0 محطة تجريبية — سجل 16,803 2,520.45 2,390 -130.45 QA Pilot Final 0 0 0 0 QA Exception Lab 0 0 0 0 QA Edge Station 0 0 0 0 QA Cycle 3 0 0 0 0 QA Cycle 2 0 0 0 0 🙂"

## ## Phase 6 — export endpoint probe


```
[
 {
  "url": "/api/export/?view=station&name=v5scsl18m5",
  "status": 200,
  "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "length": 160,
  "head": "PK\u0003\u0004\u0014\u0000\u0000\u0000\b\u0000I�C]F�MH�\u0000\u0000\u0000�\u0000\u0000\u0000\u0010\u0000\u0000\u0000docProps/app.xmlM�M\u000b�0\f\u0006�Rv���\u001e�\u000eD=����.u��)m����\u0004?nyy�\u001b�.�\"&��E�.�m32�\r@�#�>�ʡ���{�1݁��\u001a\u000f"
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

## ## Phase 6 — monthly report Excel link

- href: /api/export/?view=station&name=qgj9akm03f
- station picker offers: QA R4 ب | QA R4 أ | QA موظف جديد | محطة تجريبية — سجل | QA Pilot Final | QA Exception Lab | QA Edge Station | QA Cycle 3 | QA Cycle 2

## ## Phase 6 — finance screens (as station owner)



## ### /finance

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager الإدارة المالية 💰 إدخال إيرادات إدخال المبيعات النقدية والكوبونات والإلكترونية 📊 المبيعات المالية عرض ملخص المبيعات اليومية 💵 التحصيل النقدي سجل التحصيلات النقدية 🎫 الكوبونات سجل مبيعات الكوبونات 💳 واصلات POS سجل المبيعات الإلكترونية 📤 المصروفات سجل المصروفات 📑 تسويات الكوبونات تسوية وتحصيل الكوبونات ⚖️ التسويات المالية التسويات والمطابقات ال"
- network ≥400: (none)

## ### /finance/daily-sales

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المبيعات المالية اليومية عرض طباعة المبيعات النقدية 2,000 د.ل مبيعات الكوبونات 90 د.ل المبيعات الإلكترونية 300 د.ل إجمالي التحصيل 2,390 د.ل تفاصيل الكوبونات الفئة العدد القيمة 5 د.ل 1 50 د.ل 8 د.ل 1 40 د.ل الإجمالي 2 90 د.ل المصروفات إجمالي المصروفات:0 د.ل صافي الإيرادات:2,390 د.ل 🙂"
- network ≥400: (none)

## ### /finance/fuel-prices

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager أسعار الوقود تُستخدم لحساب المبيعات المتوقعة عند إقفال المناوبات + إضافة سعر نوع الوقود سعر البيع التكلفة الهامش تاريخ السريان الحالة بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-03 ساري بنزين 0.15 د.ل 0.12 — 2026-10-01 ساري ديزل 0.15 د.ل 0.12 — 2026-1"
- network ≥400: (none)

## ### /finance/cash

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التحصيل النقدي المناوبة المبلغ الوقت المستلم مُلغي إقفال يوم 2026-10-03 (2026-10-03) 2,000 د.ل 2026-10-03 18:08:59.673000 — لا 🙂"
- network ≥400: (none)

## ### /finance/vouchers

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager الكوبونات المناوبة الفئة العدد القيمة مُلغي إقفال يوم 2026-10-03 (2026-10-03) 5 د.ل 10 50 د.ل لا إقفال يوم 2026-10-03 (2026-10-03) 8 د.ل 5 40 د.ل لا 🙂"
- network ≥400: (none)

## ### /finance/pos

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager واصلات POS المناوبة المبلغ عدد المعاملات مُلغي إقفال يوم 2026-10-03 (2026-10-03) 300 د.ل 7 لا 🙂"
- network ≥400: (none)

## ### /finance/expenses

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager المصروفات + إضافة مصروف الفئة المبلغ الوصف طريقة الدفع إجراءات لا توجد مصروفات 🙂"
- network ≥400: (none)

## ### /finance/settlements

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager تسويات الكوبونات + إضافة تسوية المحطة التاريخ العدد القيمة المدفوع الحالة إجراءات لا توجد تسويات 🙂"
- network ≥400: (none)

## ### /finance/reconciliations

- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager التسويات المالية المناوبة المحطة المبيعات المتوقعة التحصيل الفرق الحالة إقفال يوم 2026-10-03 محطة تجريبية — سجل 2,520.45 2,390 -130.45 مسودة إقفال يوم 2026-11-21 QA Pilot Final 300 0 -300 مسودة إقفال يوم 2026-11-20 QA Pilot Final 0 0 0 مسودة إقفال يوم 2026-11-11 QA Exception Lab 150 0 -150 مسودة إقفال يوم 2026-11-10 QA Exception Lab 150 0 -150 مسودة"
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

- text: "إضافة قراءة خزان أ بنزين 2 خزان أ بنزين 1 خزان ب ديزل خزان ب بنزين خزان QA خزان 1 خزان 1 خزان 1 خزان 1 خزان 1 (بنزين) خزان 2 خزان 1 يومية افتتاحية قبل التوريد بعد التوريد حفظ التاريخ الخزان القراءة النوع المسجل لا توجد قراءات 🙂"

## ## Phase 6 — tank reading form fields

- selects: 2, inputs: 1

## ## Phase 6 — QA-24 tank-transfer refusals


```
[
 {
  "label": "different fuel",
  "status": 417,
  "arabic": true,
  "message": "frappe.exceptions.ValidationError: لا يمكن التحويل بين خزانين مختلفين في نوع الو"
 },
 {
  "label": "same tank",
  "status": 417,
  "arabic": true,
  "message": "frappe.exceptions.ValidationError: لا يمكن التحويل إلى نفس الخزان"
 },
 {
  "label": "zero quantity",
  "status": 417,
  "arabic": true,
  "message": "frappe.exceptions.ValidationError: لا يمكن التحويل بين خزانين مختلفين في نوع الو"
 }
]
```

## ## Phase 6 — tank transfer create

- text after save: "رجوع سجل — نظام إدارة محطات الوقود owner manager إضافة تحويل بين الخزانات المحطة اختر المحطة QA R4 ب QA R4 أ QA موظف جديد محطة تجريبية — سجل QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 من خزان اختر الخزان خزان 2 (ديزل — 0%) خزان 1 (بنزين — 0%) إلى خزان اختر الخزان لا يوجد خزان آخر من فرع الوقود في هذه المحطة — أضف خزانًا ثانيًا من نوع الوقود نفسه الكمية (لتر) المتاح في ال"
- url: http://localhost:8004/app/inventory/transfers/create

## ## Phase 6 — tank transfers via API


```
{"results":[],"total":0}
```

## ## Phase 6 — network ≥400 (all)

- 401 /api/auth/me/
- 417 /api/export/?view=station
- 417 /api/export/
- 417 /api/tank-transfers/
- 417 /api/tank-transfers/
- 417 /api/tank-transfers/

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
QA R4 » 174×34
  - button «إقفال اليوم» 115×36

## ### 1366x768 /stations

- document scrollWidth 1366 vs viewport 1366 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 20
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
- controls under 40px tall: 13
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
- controls under 40px tall: 12
  - select «جميع المحطات المعن» 180×34
  - button «⚙ توليد مناوبات ال» 152×36
  - button «⚡ وضع الطوارئ (24 » 188×38
  - a «QA Cycle 2» 63×14
  - a «QA Cycle 3» 63×14
  - a «QA Edge Station» 99×14
  - a «QA Exception Lab» 105×14
  - a «QA Pilot Final» 82×14

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
- controls under 40px tall: 16
  - a «+ إضافة مستخدم» 132×36
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14

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
QA R4 » 174×34
  - button «إقفال اليوم» 115×36

## ### 1920x1080 /stations

- document scrollWidth 1920 vs viewport 1920 → fits
- unreachable (clipped) blocks: (none)
- controls under 40px tall: 20
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
- controls under 40px tall: 13
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
- controls under 40px tall: 12
  - select «جميع المحطات المعن» 180×34
  - button «⚙ توليد مناوبات ال» 152×36
  - button «⚡ وضع الطوارئ (24 » 188×38
  - a «QA Cycle 2» 63×14
  - a «QA Cycle 3» 63×14
  - a «QA Edge Station» 99×14
  - a «QA Exception Lab» 105×14
  - a «QA Pilot Final» 82×14

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
- controls under 40px tall: 16
  - a «+ إضافة مستخدم» 132×36
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14
  - button «كلمة مرور جديدة» 92×20
  - button «تعطيل» 42×20
  - a «تعديل» 35×14

## ## Phase 8 — station setup


- QA Edge Station id: 0ngg0kmd9n
- day_close_time before: 11:00:00

## ## Phase 8 — readings screen, cycle label

- period chip: دورة القراءة: 2026-10-04 11:00 ← 11:00
- body mentions 11:00: true
- text: "رجوع سجل — نظام إدارة محطات الوقود owner manager قراءات المضخات أدخل القراءة الحالية لكل مسدس — القراءة السابقة (آخر قراءة لنفس المسدس) تُجلب تلقائياً اختر المحطة QA R4 ب QA R4 أ QA موظف جديد محطة تجريبية — سجل QA Pilot Final QA Exception Lab QA Edge Station QA Cycle 3 QA Cycle 2 إقفال اليوم دورة القراءة: 2026-10-04 11:00 ← 11:00 0 / 8 مكتملة — تبقي 8 قراءات اليوم إجمالي اللترات: 0 لتر جزيرة 1 (0/4) المسدس A مضخة 1 بنزين M01AX بانتظار القراءة القراءة السابقة (تلقائية) 100,000 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استثناء (تصفير / استبدال العداد) المسدس B مضخة 1 بنزين M01BX بانتظار القراءة القراءة السابقة (تلقائية) 100,000 القراءة الحالية (لتر) لتر اللترات المباعة — + تسجيل استث"

## ## Phase 8 — readings entered


- guns: 8, previous readings: [100000,100000,100000,100000,100000,100000,100000,100000]
- entered: previous + 1,000 L on each gun
- total movement expected: 8,000 L

## ## Phase 8 — readings save result


- page tail: "00 القراءة المسجلة اليوم 101,000 اللترات المباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل المسدس B مضخة 4 بنزين M04B مسجلة القراءة السابقة 100,000 القراءة المسجلة اليوم 101,000 اللترات المباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل تم حفظ 8 قراءات بنجاح أدخلت الآن: 0 · مكتملة: 8/8 الإجمالي: 8,000 لتر حفظ القراءات المُدخلة 🙂"

## ## Phase 8 — readings backend cross-check


- readings stored for the station: 8

## ## Phase 8 — income entry shift options


- ["اختر المناوبة","إقفال يوم 2026-10-04 (2026-10-04)"]

## ## Phase 8 — income entry result


- page tail: "ل 7 د.ل 0 د.ل 8 د.ل 0 د.ل إجمالي الكوبونات: 0 د.ل المبيعات الإلكترونية المبلغ (د.ل) عدد المعاملات الالكترونية اترك عدد المعاملات الإلكترونية في هذا اليوم — اترك عددها إذا مع المبلغ إجمالي الإيرادات 0 د.ل نقد: 0 | كوبونات: 0 | إلكتروني: 0 حفظ الإيرادات إلغاء 🙂"
- network ≥400: (none)

## ## Phase 8 — income postings stored


- cash: 1200 (expected 1200.00), vouchers: 40 (expected 40)

## ## Phase 8 — day close


- close button disabled: false
- success message: true
- page tail: "لمباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل المسدس B مضخة 4 بنزين M04B مسجلة القراءة السابقة 100,000 القراءة المسجلة اليوم 101,000 اللترات المباعة 1,000 لتر المبيعات المتوقعة: 150 د.ل تم إقفال اليوم وإنشاء التسوية المالية بنجاح أدخلت الآن: 0 · مكتملة: 8/8 الإجمالي: 8,000 لتر حفظ القراءات المُدخلة 🙂"

## ## Phase 8 — reconciliations after the cycle


```
[
 {
  "name": "e3brad6ku6",
  "shift": "du1pe9vpjt",
  "station": "0ngg0kmd9n",
  "total_liters": 8000,
  "expected_sales": 1200,
  "total_cash": 1200,
  "total_vouchers": 40,
  "total_pos": 0,
  "total_collection": 1240,
  "total_expenses": 0,
  "net_cash": 1200,
  "difference": 40,
  "difference_type": "surplus",
  "status": "draft",
  "modified": "2026-10-03 23:42:52.339820"
 },
 {
  "name": "bsocdsrrvo",
  "shift": "bag8u1el79",
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
  "modified": "2026-10-03 23:39:06.469832"
 },
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
  "shift": "tqu
```

## ## Phase 8 — edge station shifts


```
[
 {
  "name": "du1pe9vpjt",
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
  "modified": "2026-10-03 23:42:52.290646"
 }
]
```

## ## Phase 8 — verdict inputs


- guns read: 8, litres entered: 8000
- expected sales at 0.15: 1200.00
- cash declared: 1200.00
- reconciliation: {"name":"e3brad6ku6","shift":"du1pe9vpjt","station":"0ngg0kmd9n","total_liters":8000,"expected_sales":1200,"total_cash":1200,"total_vouchers":40,"total_pos":0,"total_collection":1240,"total_expenses":0,"net_cash":1200,"difference":40,"difference_type":"surplus","status":"draft","modified":"2026-10-03 23:42:52.339820"}

## ## Phase 8 — network ≥400 (all)

- 401 /api/auth/me/

## Isolation — fixture users

qa-r4-sup@sejel.ly=supervisor@qgdsq7cd7b, qa-r4-fin@sejel.ly=finance@qgdsq7cd7b

## Isolation — supervisor

{"listOnlyOwn":true,"widen":true,"readForeign":403,"writeForeign":403,"createTransfer":403,"picker":"(none)"}

## Isolation — finance

{"createForeignExpense":403,"createOwnExpense":200}

## Isolation — reports

{"adminExpenses":777778,"supervisorExpenses":1,"dailyStations":["qgdsq7cd7b"],"exportForeign":403,"exportOwn":200,"guest":[403,403,403,403]}

## Isolation — fixture users

qa-r4-sup@sejel.ly=supervisor@qgdsq7cd7b, qa-r4-fin@sejel.ly=finance@qgdsq7cd7b

## Isolation — supervisor

{"listOnlyOwn":true,"widen":true,"readForeign":403,"writeForeign":403,"createTransfer":403,"picker":"(none)"}

## Isolation — finance

{"createForeignExpense":403,"createOwnExpense":200}

## Isolation — reports

{"adminExpenses":777778,"supervisorExpenses":1,"dailyStations":["qgdsq7cd7b"],"exportForeign":403,"exportOwn":200,"guest":[403,403,403,403]}
