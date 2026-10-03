# SEJEL — Round 4: Final Adversarial Verification

**Date:** 2026-10-03 · **Scope:** no features unless a real defect was found.
Every product claim below was driven through Chromium (Playwright) against
`http://localhost:8004`; the backend and Postgres were read only to corroborate
what the UI said.

**Backend commit:** `d83137b` · **Frontend/QA commit:** `180692a`
(this report and `docs/PILOT_HANDOFF_AR.md` follow it on `master`).

**Bottom line:** 295 steps, 0 failures, across 15 suites — and the two most
important numbers in this round are not green ones: **13 endpoints that served
data to anyone on the network are closed**, and **nine assertions that could
not fail** are now real.

---

## §12 — Classification

### A. VERIFIED

| # | Area | Evidence |
|---|------|----------|
| A1 | Test-harness safety | `qa-harness-safety.js` **12/12** — every destructive helper is date- and station-scoped; foreign rows survive |
| A2 | API station isolation | `qa-round4-isolation.js` **25/25** |
| A3 | Same-fuel tank transfer (the one untested path) | `qa-transfer-test.js` **19/19**, fixture **10/10**, teardown **4/4** |
| A4 | Adversarial readings | `qa-phase3-readings.js` **42/42** + `qa-exceptions-matrix.js` **13/13** |
| A5 | Financial invariants | `qa-phase4-finance.js` **38/38** (16,803 L → 2,520.45 expected, 2,390 collected, −130.45) |
| A6 | Day cycles | `qa-cycle-matrix.js` **16/16** + `qa-round4-cycle.js` **8/8** (A=11:00 vs B=10:30, no bleed) |
| A7 | Mobile 390×844 | `qa-round4-mobile.js` **12/12** + `qa-phase7-responsive.js` **33/33** |
| A8 | New-employee journey | `qa-phase8-journey.js` **14/14** (8 guns, 8,000 L, cash 1,200, vouchers 40, day closed) |
| A9 | Reports / export | `qa-phase6-reports.js` **35/35** |
| A10 | Re-runnability | `qa-exceptions-matrix.js` run twice back to back: **13/13, 13/13** |
| A11 | Data safety | no client/UAT row exists on this site to touch; every cleanup named its own station or its own records |
| A12 | Session requirements | `auth/me` 401, login/logout intact after the guest-flag removal |

### B. REAL DEFECT — FIXED (product)

| # | Defect | Was | Now |
|---|--------|-----|-----|
| B1 | **13 endpoints accepted unauthenticated requests** — `allow_guest=True` on reports, daily sales, monthly, dashboard, dashboard-station, generate-shifts, setup-station, generic CRUD list/detail, close-shift, ensure-day-close, export | any visitor could download a station's full XLSX (8,152 bytes, no login) and read every report | only `api/auth.py` (4 routes) and the client-error reporter accept a guest; all probes return **403** |
| B2 | **Write path had no station check** | a bound supervisor POSTed a Tank Transfer onto another station and a bound finance user an Expense — both **HTTP 200**, both rows landed | `payload_station()` / `check_station_payload()` in `api/scoping.py`, called from `crud_list` (POST) and `crud_detail` (PUT) → **403** «غير مصرح لك بحفظ بيانات تخص محطة أخرى» |
| B3 | **`daily_sales()` had no station filter** | a bound supervisor's "my station" numbers actually summed the whole company's cash, coupons, POS and expenses | every aggregate joins `Shift` and is limited to the caller's stations; marker `777777` on a foreign station excluded |
| B4 | **Transfer could drive a tank below zero** | 25,000 L out of a 20,000 L tank was accepted → inventory showed −5,000 L silently | `check_source_has_the_quantity()` → Arabic refusal on the form |
| B5 | **Transfer could drive a tank over capacity** | 19,000 + 5,000 into a 20,000 L tank was accepted → 24,000 L | `check_destination_has_the_room()` → Arabic refusal with capacity, level and room left |
| B6 | **Transfer re-applied its stock movement on every save** | a later save of the same transfer moved the stock a second time | bounds run only `is_new()`; `apply_level_changes()` runs once, from `after_insert()` |

### B. REAL DEFECT — FIXED (test harness)

| # | Defect | Fix |
|---|--------|-----|
| B7 | `qa.js:qaResetStationDay` deleted by date only, across every station | date **and** station scoped, ownership resolved through the island→pump→meter tree |
| B8 | `qa-acceptance-reset.js` aborted when any foreign reading existed, and `qa-repair-counters.js` would zero a whole site | own-records-only + survival assertion; repair now requires a station argument |
| B9 | `qa-exceptions-matrix.js` was **not re-runnable** — a second run tripped over its own history (baseline → 417, gun C no longer counter-less, case 5 booked 0 L) | resets its own station's three days and re-seeds the fixture counters before asserting |
| B10 | `qa-round4-isolation.js` cleanup asserted `!r.__status` on a helper that returns `{status}` | asserts the real status; Frappe refuses to delete a User that owns rows (417) so cleanup now disables + unbinds, then reads the list back |

### C. REAL DEFECT — REMAINING

| # | Finding | Why it stays |
|---|---------|--------------|
| C1 | `phase1-master-data.js:25`, `phase9-user-journey.js:61,125`, `verify-fixes.js:37`, `qa-verify-qa32.js:122` still carry constant-true or vacuous `.every()` steps | legacy scripts that are **not** part of the round-3 claimed set; two are preceded by a `waitForSelector` that would abort the run instead of passing, so none of them can inflate the reported numbers. Reported here rather than silently repaired. |
| C2 | `verify-fixes.js:37` still calls shift activation a "known bug: no UI control" | stale comment — the control exists (`ShiftDetail.vue` «▶ بدء المناوبة» → `status: open`). Comment is wrong, the product is not. |

No product defect was found and left open in this round.

### D. UNTESTABLE — REQUIRES FIXTURE

None. The one path the round opened (a successful same-fuel transfer) was
closed with isolated fixture data — stations «QA R4 أ» / «QA R4 ب», created by
`qa-round4-fixture.js` and torn down by `qa-round4-reset.js`.

---

## §1–§8 — Results by section

**1. Test-harness safety — A1.** The audit's rule: no delete without an owner.
`qaResetStationDay` now takes a date *and* a station and resolves membership
through the station's own island→pump→meter tree (membership alone was not
enough — readings of a date live on that date's Shift). `qa-repair-counters.js`
refuses to run without a station argument. `qa-cleanup-phase8.js` will only
remove rows it created. New `qa-harness-safety.js` proves each behaviour
(12/12), including that foreign rows survive a reset of a neighbouring station.

**2. API station isolation — A2, B1–B3.** Three separate holes, all confirmed
by a real browser session first and then by reading Postgres: unauthenticated
data access, cross-station writes, and an unscoped aggregate. Verified after
the fix: list scoping, `?station=` cannot widen, foreign GET/PUT/create → 403,
the station picker hides foreign stations, daily-sales and daily-report show
own rows only, export 403 foreign / 200 own, and a fresh guest context gets
nothing.

**3. Same-fuel tank transfer — A3, B4–B6.** The last untested business path.
Successful transfer between two same-fuel tanks now has a real journey: create
via the form, levels move exactly once and by exactly the quantity, the list
shows the row, teardown restores the opening levels and removes only its own
rows. The three defects it exposed were fixed in `tank_transfer.py`; both
refusals appear in the form's own error box.

**4. Adversarial readings — A4.** 42 + 13. Continuity gaps, backwards counters
with/without type, with/without reason, reset semantics (dial value booked as
litres), identical readings (0 L day), decimals, 20-digit values, counter-less
baselines (`is_opening=1`, 0 L) and the day after a baseline booking real
litres.

**5. Financial invariants — A5.** Reconciliation arithmetic checked in the UI
and against backend rows: liters → expected → collected → difference.

**6. Day cycles — A6.** 11:00 → 10:30 → unset → restore on one station, plus
two stations with different cycles on the same readings screen and no bleed
between them. Both restored to their fixture values at the end.

**7. Mobile — A7.** 390×844 reached by tapping the bottom navigation (not by
typing URLs), no horizontal scroll on four screens, every visible button ≥40 px
high, and an invalid reading (123456) triggers the rule warning while saving
nothing.

**8. New employee — A8.** The full gun journey with a station-bound employee
login, ending in a closed day whose reconciliation matches what was entered.

**9. Weak assertions — B7–B10.** Nine removed from the claimed set:

| Suite | Was | Now |
|-------|-----|-----|
| `qa-phase3-readings.js:230` | `.catch(() => true)` — a missing locator passed | `.catch(() => false)` |
| `qa-phase3-readings.js:361` | `every()` over an array that could be empty | non-empty guard added |
| `qa-phase3-readings.js:386` | constant `true`, claiming an Arabic message nobody read | clicks حذف, confirms, reads the toast: «لا يمكن الحذف: هذا السجل مرتبط بـ الشحنة …» |
| `qa-phase5-inventory.js:72` | constant `true` for "empty submit blocked" | asserts the URL is still the create form |
| `qa-phase5-inventory.js:99` | constant `true` for "form filled" | reads the invoice input back: `QA-INV-640721` |
| `qa-exceptions-matrix.js:90` | constant `true` for the baseline | asserts HTTP 200 for every baseline POST |
| `qa-phase6-reports.js:212,214` | `every()` with no elements → vacuous pass | non-empty guard |
| `qa-round4-reset.js:45` | `all.length >= 0` — always true | before/after name comparison |
| `qa-round4-isolation.js` | `!r.__status` on a `{status}` helper — reported «HTTP 200» while both users were still enabled | real status + list read-back |

The evidence that these mattered: strengthening the baseline assertion made the
suite fail on its second run (B9), and the cleanup assertion failed on its own
(B10) — both had been green before.

**10. Remaining defects — C1, C2.** Nothing open in the product.

**11. Tests and counts — A10.**

| Set | Suites | Steps |
|-----|--------|-------|
| Round-3 claimed set (re-run with stronger assertions) | phase3 42 · phase4 38 · phase5 14 · phase6 35 · phase7 33 · phase8 14 · cycle 16 · exceptions 13 | **205** |
| Round-4 new | harness 12 · fixture 10 · transfer 19 · isolation 25 · cycle 8 · mobile 12 · reset 4 | **90** |
| **Total** | 15 suites | **295** |

Round 3 reported 204; the set is now 205 because the exception matrix gained a
prep step (B9). The number went up by one and the assertions got stronger —
that is the direction it should move in.

Run log: `sejel/e2e-tests/qa-checkpoints/qa-run-log.md`.

**12. Backend commit:** `d83137b` on `develop` (repo `sejel_app`).

**13. Frontend/QA commit:** `180692a` on `master` (repo `Sejel`) — the seven
new suites, the harness-safety fixes and the assertion audit. This report and
`docs/PILOT_HANDOFF_AR.md` are the commits that follow it.

**14. Working-tree status:** both repositories clean — 0 modified, 0 untracked
(`git status --porcelain` empty). Running any suite rewrites
`sejel/e2e-tests/qa-checkpoints/*` (run log and phase stamps), so those are
expected to show as modified after the next run; nothing else changes.
