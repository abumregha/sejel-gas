# SEJEL — PRODUCT HARDENING ROUND 2

**For:** architect review · **Date:** 2026-10-03
**Method:** real-browser (Playwright Chromium) fix → retest → continue, driving the app as the
station employee (`owner@sejel.ly`, role `Sejel Manager`), cross-checking every critical write
against the database.

---

## 1. What I fixed

| ID | Sev | Defect | Fix | Verified |
|---|---|---|---|---|
| **QA-10** | **P1** | A meter reset could never be recorded. The backwards-counter guard ran **before** the exception type was read, so تصفير العداد / استبدال العداد could never take effect. | Exception is decided first: no exception → refused with both readings named; exception without a reason → refused; **reset/replacement → accepted**, and because the counter restarts from zero the reading itself is the booked quantity; any other reason → accepted but books nothing. | UI: reset saved, `liters 5000`, type + reason stored. API: all three paths checked. |
| **QA-30** | **P1** | The station's reading cycle existed on the DocType but **nowhere in the UI**. New stations silently ran 23:00. | «وقت إقفال اليوم» added to the setup wizard (required, default 11:00, explained in Arabic) and to the station edit form; shown on the station detail. | Set 10:30 through the form → persisted `10:30:00` in the DB. |
| **QA-33** | **P2** | With no fuel price configured, sales silently computed as **0.00 د.ل** and the day closed with a shortage equal to the whole day's fuel. | Closing is refused: *«لا يمكن إقفال اليوم: لم يتم ضبط سعر بيع لـ بنزين. أضف سعر الوقود من صفحة «أسعار الوقود» ثم أعد المحاولة.»* | Refused while unpriced; closed at **1,000 L / 150.00 د.ل** once priced. |
| **QA-20** | **P1** | Shortage claims rendered `# · blank · **NaN لتر** · English status`. | The endpoint now returns the human values (invoice number, station name, claimed quantity, notes). | Row renders **#QA-INV-727502 · QA Edge Station · 100 لتر · تم المطالبة**. |
| **QA-22** | **P2** | Status vocabulary mismatch — the UI mapped `pending/approved/rejected`, none of which the DocType accepts. | Uses the real vocabulary: لم يتم المطالبة / تم المطالبة / تمت التسوية / مغلقة. | No English on screen. |
| **QA-23** | **P2** | «تسوية الوقود» showed blank station/tank columns. | Endpoint returns station and tank names. | Code path covered. |
| — | **UX** | Save confirmations vanished: the toast lived inside the form and the form redirected a second later. | Toasts render at layout level and outlive the redirect. | «تم حفظ بيانات المحطة بنجاح» still visible after the redirect. |

Carried over from the acceptance round and still standing: **QA-32** (opening baseline),
**QA-15** (station manager can close their own day), **QA-1** (logout kills the session),
**QA-5** (list filters).

---

## 2. What real-browser testing found that was NOT in the QA report

1. **Partial saves were invisible.** Readings post one gun at a time and the loop aborted on the
   first rejection — the guns *before* it were already stored while the screen showed one error
   and a stale `0/9 complete`. The operator had no way to know what had been kept. The save now
   continues and reports both counts: *«تم حفظ 1 قراءة بنجاح»* plus which guns failed and why.
2. **A negative litres figure was displayed.** A backwards reading showed
   **«اللترات المباعة -499,001 لتر»** — a number that reads as a catastrophic loss and means
   nothing. It now says sales cannot be calculated and points at the exception panel.
3. **A save could throw an error *after* succeeding.** The station form called `toast.value.show()`
   on an undefined variable after the write had landed, so a successful save reported failure.
4. **The price guard crashed on first run** (`NameError: _ is not defined`) — caught only because
   I tested the refusal path, not just the happy path.
5. **The API login contract is `username`/`password`,** not `usr`/`pwd`; a wrong guess returns
   «Username and password required» and looks like a credentials problem.

---

## 3. UX improvements made specifically for station employees

- **The 11:00 cycle is now something they can see and set** — on the station, not in a database.
- **A station with no cycle configured says so** («لم يتم ضبط وقت إقفال اليوم») instead of quietly
  showing 23:00.
- **A first-ever reading is labelled «قراءة افتتاحية»** with the explanation that it sets the
  baseline and is not counted as sales, and its misleading liters preview is suppressed.
- **A reset is a supported action**, not a dead end: the screen asks for the type and the reason,
  and the refusal message names both readings and says what to do.
- **Save outcomes are always quantified** — how many saved, how many failed, which guns and why.
- **A missing fuel price stops the day** with the fuel named and the screen to fix it.
- **Shortage claims read as Arabic business language**, not `NaN` and `claimed`.
- **Every confirmation now survives the redirect.**

---

## 4. What happens now when an employee opens Sejel for the day

Login → the readings screen shows **«دورة القراءة: 2026-11-20 11:00 ← 11:00»** and a tally
**«2/2 مكتملة»**. Each gun shows **القراءة السابقة (تلقائية)** already filled, an empty large
**القراءة الحالية** box, and the litres that will be sold. Rows are badged **بانتظار القراءة /
مسجلة / استثناء / قراءة افتتاحية**. One button saves everything and reports exactly what
happened. **إقفال اليوم** closes the day and produces the reconciliation with expected sales.

**Approximate cost of the daily task:** 1 click to reach the readings screen, 1 to pick the
station (0 once remembered), **one number typed per gun**, 1 click to save, 1 to close the day —
roughly **4 clicks plus typing, for any number of guns**. If the day is priced, it closes; if not,
it tells you why.

---

## 5. Browser and automated tests performed

**Browser (Playwright Chromium, real clicks and typing, backend cross-checked after every write):**
login/logout + back-button protection · readings entry, opening baseline, zero movement, decimal
readings, reset exception (saved), suspicious reading guidance · partial-save feedback · day close
and reconciliation · the two-day 11:00→11:00 cycle on four separate stations · income entry
(cash + coupons + POS) · station create/edit/detail · setup wizard · shortage claims · fuel-price
guard · dashboard and every report screen · responsive sweep at 390 / 1366 / 1920.

**Automated:** the dedicated 11:00-cycle suite (`qa-verify-qa32.js`) re-run on a freshly created
station after every change — currently **10/11**, the one failure being a test assertion that
compares against *all* historical reconciliations and therefore sees the 16,803 L pilot day that
predates the opening-baseline fix. The new days are exact: **2,000 L / 300.00 د.ل**.
Phase suite: 19/20 · 13/14 · 14/14 · 26/30 · 22/33 · 8/9.

**Mobile (390 px):** unchanged and still the weakest area — see below.

---

## 6. Remaining issues that genuinely block pilot use

**None of these stop a station employee from running their day**, but they should be scheduled:

| Priority | Item |
|---|---|
| High | **Dashboard is still an analytics page, not an operational panel.** It does not answer «شن المطلوب مني اليوم؟» — no explicit *إدخال القراءات* call-to-action, no «3 قراءات متبقية», and it never shows the reading cycle (QA-2). This is the single largest gap against the brief and the next thing I would do. |
| High | **Phone layout (QA-28/29):** 5 screens overflow at 390 px and tap targets are 34–36 px. The pump is a phone. |
| Medium | Income entry has no per-leg confirmation (QA-13); POS `transaction_count` hardcoded to 1 (QA-12); no export for multi-station reports (QA-25); duplicate station name fails silently (QA-6); tank-transfer error still English (QA-24). |
| Low | Station teardown needs an API to clear history (QA-9). |

**Not yet done from the brief:** the operational dashboard rework, the new-employee
end-to-end walkthrough, and a full re-run of phases 4–8 after this round's changes. I would not
call the product pilot-ready until the dashboard and phone layout are addressed.

---

## 7. Git

Backend `/home/frappe/bench/apps/sejel_app` (branch `develop`) — clean:

| Hash | Subject |
|---|---|
| `8a0f94c` | fix(readings): never book a meter counter as one day of sales |
| `eb2da2e` | fix(auth): logout ends the session on the server |
| `09af864` | fix(roles): let the station manager close their own day |
| `e71cae0` | fix(readings): a meter reset can finally be recorded |
| `79360e8` | fix(finance): never close a day priced at zero, and return real names |

Frontend/docs `/root/projects/Sejel` (branch `master`) — clean:

| Hash | Subject |
|---|---|
| `541b6ce` | fix(frontend): opening-reading badge, server-side logout, Arabic logout label |
| `d9d7e81` | fix(readings): tell the operator exactly what was saved |
| `6c044b7` | feat(stations): the reading cycle is configurable, and saves confirm themselves |
| `575eb6d` | fix(inventory): Arabic shortage statuses and no more NaN |

---

## 8. Final statement

**Yes** — a non-technical station employee can now complete the daily cycle without developer
guidance: enter every gun's reading, be told what was saved, record a meter reset when it happens,
see the missing fuel price explained in Arabic, close the day, and read the financial result.

Two honest caveats. First, the brief's real test — *hand it to a new employee and see if they
find the path unaided* — I have **not yet run**; the dashboard rework is the thing most likely to
affect that answer, and it is not done. Second, the phone experience still has genuine layout
problems at 390 px. Neither blocks the desktop/supervisor flow that the pilot runs on today, but
both should be finished before a station employee is asked to work from a phone.