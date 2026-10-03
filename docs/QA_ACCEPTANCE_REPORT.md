# SEJEL — BROWSER ACCEPTANCE REPORT

**Prepared for:** architect review / prioritisation
**Date:** 2026-10-03
**Environment:** `sejel.local`, Frappe bench web :8002 behind nginx SPA :8004
**Method:** real-browser testing (Playwright Chromium) driven as the station employee
(`owner@sejel.ly`, role **Sejel Manager**), with every screen cross-checked against the
database/API so a green UI could not hide a lost write.
**Evidence:** `sejel/e2e-tests/qa-checkpoints/qa-run-log.md`, `sejel/e2e-tests/shots/qa-*.png`

---

## 1. Headline answer

> **Can a station employee complete the full 11:00→11:00 cycle without Excel?**

**Yes — as of the fixes in this round.** It could not before. On a virgin system, driven
entirely through the UI by a user holding only the `Sejel Manager` role:

| Step | Result |
|---|---|
| Station runs an 11:00→11:00 cycle | ✅ «دورة القراءة: 2026-10-30 11:00 ← 11:00» |
| Day 1 — first reading of each gun | ✅ flagged «قراءة افتتاحية», books **0 L** (baseline, not revenue) |
| Day 1 — close the day | ✅ **«تم إقفال اليوم وإنشاء التسوية المالية بنجاح»** by the station owner |
| Day 2 — +1,000 L on every gun | ✅ screen shows **2,000 L** |
| Day 2 — close the day | ✅ **by the station owner**, reconciliation **2,000 L / 300.00 د.ل**, fuel summaries tie exactly |
| Income entry (cash + coupons + POS) | ✅ all three legs persist |

Two conditions still attach to "yes": the fuel **price must exist** (see QA-33) and the
**11:00 cycle must be configured** — which today can only be done outside the UI (QA-30).

---

## 2. Defects found and FIXED this round

| ID | Sev | Area | Defect | Fix | Verified |
|---|---|---|---|---|---|
| **QA-32** | **P0** | Readings | A meter with no opening counter had its **entire cumulative total booked as one day's sales**. Measured 8 guns entered at 1,000 L each recorded as **807,849 L / 121,177 د.ل**. The overflow flowed into the reconciliation, the daily report and the shortage verdict. | First reading of a meter with no counter and no history is flagged `is_opening` and books **0 L**; the next day books normally. Frontend shows «قراءة افتتاحية» and suppresses the misleading liters preview. | Day 1 → 0 L; Day 2 → exactly 2,000 L / 300.00 د.ل |
| **QA-15** | **P0** | Roles | `Sejel Manager` was absent from Voucher / POS Record / Shift Fuel Summary / Fuel Type. A station employee closing a day that had readings got `403 No permission for Shift Fuel Summary` — **they could never close their own day**. No user held `Sejel Finance` or `Sejel Supervisor`. | Granted `Sejel Manager` full rights on the first three, read-only on Fuel Type. | Owner closes the day; all 9 nav links usable; income entry stores cash + coupons + POS |
| **QA-1** | **P0** | Auth | Logout was client-side only — the `sid` cookie stayed valid, so Back or a cached tab restored a live session with no credential. | New `POST /api/auth/logout/` destroys the Frappe session server-side; SPA awaits it; icon-only button given an Arabic `aria-label`. | `/api/auth/me/` → **401** after logout; revisit `/` redirects to login |
| **QA-5** | **P2** | Generic list API | `?filters={...}` was never parsed and **silently ignored**, while any query param that was not a real column 500'd with `UndefinedColumn` (e.g. `?station=` on Meter Reading). | `_get_filters(doctype)` parses the documented JSON `filters`, keeps pagination keys, ignores unknown columns, rejects malformed JSON with an Arabic message. | `?filters=` now actually filters; `?station=` → 200; `?filters=notjson` → 417 |

---

## 3. Defects still OPEN (not fixed — awaiting architect decision)

| ID | Sev | Defect | Impact | Recommendation |
|---|---|---|---|---|
| **QA-10** | **P1** | **Exception readings can never be saved.** `end_reading` below the opening is rejected `417 «قراءة الاستثناء أقل من قراءة الافتتاح»` before the exception type is considered. A meter reset or counter replacement — a routine event — is unrecoverable in the UI. | Pump resets cannot be recorded; staff work around it in a notebook. | Highest-priority open item. Check the exception path **before** the negative-span guard, or exempt rows carrying an `exception_type`. |
| **QA-30** | **P1** | **The station's daily close time has no UI anywhere.** `Station.day_close_time` exists on the DocType and the setup endpoint accepts it, but the wizard, the station form and the station detail never expose it; the readings screen falls back to a hard-coded `23:00`. | An 11:00 station cannot be configured without a developer. New stations silently run on 23:00. | Add «وقت إقفال اليوم» to the setup wizard **and** the station edit form. Stop the hard-coded fallback. |
| **QA-13** | **P1** | **Income entry has no failure feedback.** Storage now works, but the cash leg was once written against a different shift than the one on screen, and the screen gives no success/failure confirmation for the individual legs. | Silent misposting between shifts. | Show a per-leg confirmation (cash / coupons / electronic) and bind the shift from the selection, not from stale state. |
| **QA-26** | **P1** | **Sidebar offered two screens that always 403.** *Resolved as a side-effect of QA-15* — both now load. Worth keeping a regression test. | — | Add a nav-level smoke test. |
| **QA-20** | **P1** | **Shortage claims screen renders garbage.** The screen reads `delivery_id_display`, `station_name`, `claimed_quantity`, `description`; the API returns `delivery`, `shortage_amount`, … Rendered row: `#` · blank station · **`NaN لتر`** · English status. | The whole shortage-claims workflow is unusable. | Align the screen with the API contract (or enrich the endpoint). Cheap fix, high visibility. |
| **QA-24** | **P2** | **English error in an all-Arabic UI:** «Tanks must contain the same fuel type». Aggravated because no station currently has two same-fuel tanks, so the transfer feature cannot be demonstrated end-to-end. | Untranslatable error; feature undemonstrable. | Localise the message; allow configuring two same-fuel tanks. |
| **QA-25** | **P2** | **No export for multi-station reports.** The Excel link renders only when the report covers exactly one station. The daily report has no export at all. | The accountant's consolidated report cannot leave the system as Excel. | Always render the export; pass the report's own filter set. |
| **QA-28** | **P2** | **Five screens break the phone layout** (390 px): `/shifts` 760 px, `/settings/users` 657, `/inventory/deliveries` 550, `/reports/daily` 517, `/finance/reconciliations` 589. Root cause: `DefaultLayout.vue:40` flex item has no `min-w-0`; `DailyReport.vue` has no `overflow-x-auto` around its table. | Right-hand table columns unreachable at the pump. | Add `min-w-0`; wrap report tables. |
| **QA-29** | **P3** | Tap targets of 34–36 px on every phone screen (up to 20 per screen), below the 44 px guideline. | Mistakes at the pump. | `min-h-11` on icon buttons and selects. |
| **QA-22** | **P2** | Shortage status vocabulary mismatch — backend allows `not_claimed/claimed/settled/closed`, the UI maps `pending/approved/rejected`, so **raw English** renders. | Leaks English to the operator. | Align the map. |
| **QA-23** | **P2** | «تسوية الوقود» shows blank station/tank columns (screen reads `station_name`/`tank_name`, API returns codes) and has no create path. | Dead screen. | Align fields; add the create action or drop the screen. |
| **QA-2** | **P2** | The dashboard never shows the reading cycle (`دورة القراءة` / 11:00) — only the readings screen does. | Supervisor cannot see which cycle a station runs. | Add the cycle to the dashboard KPI strip. |
| **QA-6** | **P2** | Duplicate station name in the wizard fails silently (417, no actionable Arabic message). | Wizard appears to do nothing. | Surface the backend message. |
| **QA-9** | **P3** | Station teardown with history returns 403 with no Arabic guidance; config cascade works, history cannot be cleared from the UI. | Test-data cleanup is API-only. | Add an explicit "clear history then delete" action. |
| **QA-33** | **P2** | **NEW — with no fuel price configured, sales silently compute as 0 د.ل.** A station can close a day reporting zero revenue with no warning anywhere. | Silent zero-revenue days. | Warn on the readings screen and in the reconciliation when no active price exists for a fuel type. |
| **QA-12** | **P2** | POS `transaction_count` is hardcoded to 1. | Electronic sales counts unreportable. | Make it an input. |

---

## 4. Suite results — clean-data re-run

| Phase | Area | Result | Note |
|---|---|---|---|
| 1 | Auth, dashboard, roles | **19 / 20** | QA-1 now passes |
| 2 | Master-data CRUD | **13 / 14** | QA-6 open |
| 3 | Pump readings | readings **verified correct** — M01A 8,223 L · M01B 8,580 L · M02A/M02B 0 L | script is not idempotent |
| 4 | Finance, income entry | all three legs **persist** | 2 cash @2,000 · 4 vouchers · 2 POS @300 |
| 5 | Inventory | **14 / 14** | delivery 4,900 L received / 100 L short — correct |
| 6 | Reports, exports, finance screens | **26 / 30** | all 9 nav links usable; export verified 200 (8.4 KB xlsx) |
| 7 | Responsive | **22 / 33** | laptop/desktop clean; phone issues = QA-28/29 |
| 8 | Full journey | **8 / 9** | day closed **by the owner**; the 1 failure is a test assertion, not a product defect |
| — | **Dedicated 11:00 cycle verification** | **11 / 11** | day 1 baseline + day 2 sales, end-to-end |

### Financial cross-check (arithmetic verified, not assumed)

| Quantity | Value | Check |
|---|---|---|
| Pilot day `0ktem5p0mn` | 16,803 L · 2,520.45 د.ل | 8,223 + 8,580 = 16,803 ✓ · × 0.15 = 2,520.45 ✓ |
| Per-fuel summaries | 1,233.45 + 1,287.00 | ties to the total exactly ✓ |
| QA Cycle 3 day 2 | 2,000 L · 300.00 د.ل | 2 × 1,000 × 0.15 ✓ |
| All-baseline day | 0 L sales vs 1,200 د.ل cash → **surplus** | correct: baselines are not revenue |

Fuel math, price freezing and shortage/surplus classification are **correct**.

---

## 5. Recommendations, in priority order

1. **QA-10** — unblock exception readings. A pump reset that cannot be recorded will push
   staff back to paper, which defeats the whole product.
2. **QA-30** — expose the day-close time. Without it the flagship 11:00 cycle is not
   configurable by the people who own the stations.
3. **QA-20 / QA-22 / QA-23** — align three inventory screens with their API contracts.
   Low effort, and today they display `NaN` and English to a station manager.
4. **QA-33** — refuse to close a day priced at zero. Silent zero revenue is worse than a
   visible error.
5. **QA-25** — export for consolidated reports.
6. **QA-28 / QA-29** — `min-w-0` plus 44 px targets; small change, the pump is a phone.
7. **QA-2 / QA-6 / QA-24 / QA-12 / QA-9** — polish.
8. **Re-run the full suite after each fix.** Phase 3 is currently not idempotent (it locks
   inputs once readings exist) — worth making the harness re-runnable before the next round.

---

## 6. Process notes the architect should know

- **The data-loss incident of 2026-10-01** (a diagnostic script deleted all stations
  including the client's UAT station «برهم») is disclosed in full in the run log. Recovery
  was completed and verified from Frappe's `tabDeleted Document` audit table. All data was
  since wiped again at the client's explicit instruction; a backup was taken immediately
  before each destructive step.
- **The backend is a separate git repository** (`/home/frappe/bench/apps/sejel_app`,
  branch `develop`) from the frontend/docs repo (`/root/projects/Sejel`, branch `master`).
  Worth confirming that split is intentional.
- **Backend code changes require `systemctl restart sejel-bench`** — the service runs
  `bench serve --noreload`, so edits are invisible until it is restarted. This cost real
  debugging time during the fix round.
- **Nothing from this round is committed yet.** Fixes sit uncommitted in both working trees.