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
