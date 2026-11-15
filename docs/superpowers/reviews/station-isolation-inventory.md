# Station Isolation Inventory (2026-11-15)

**Rule:** every station is a separate isolated entity. No mixed station data/calculations in reports/views. One global station selector in the side menu for all functions. Bound users are restricted to their station; unbound users must select a station (no implicit all-station aggregation).

## Backend APIs

| Module / endpoint | Purpose | Scoping / behavior | Status |
|---|---|---|---|
| `api.views.get_dashboard` (`/api/dashboard/`) | Legacy dashboard summary | Requires selected/bound station; returns `station_required` if none (no all-station counts) | **Isolated (updated)** |
| `api.dashboard.dashboard_station` (`/api/dashboard-station/`) | Main dashboard payload | Single-station payload only; unbound+no station → `station_required` (no aggregate) | **Isolated (updated)** |
| `api.views.daily_sales` (`/reports/daily-sales/`) | Daily cash/coupon/e-payment totals | Selected/bound station only; no multi-station comparison/aggregation | **Isolated (updated)** |
| `api.views.generate_shifts` → `api.shift_gen.generate_shifts_for_date` | Generate shifts from definitions | Selected/bound station required for unbound users; no all-station bulk generation | **Isolated (updated)** |
| `api.reports.monthly_report` / `views.monthly_report` | Monthly reconciliation report | `_resolve_report_stations` (selected/bound) | Isolated |
| `api.reports.daily_report` / `views.daily_report` | Daily report | `_resolve_report_stations` | Isolated |
| `api.reports.daily_statement_report` / `views.daily_statement` | Monthly daily-statement (bank style) | `_resolve_report_stations` | Isolated (new) |
| `api.reports.monthly_balance_report` / `views.monthly_balance` | Monthly balance/deposits/deductions | `_resolve_report_stations` | Isolated |
| `api.reports.monthly_shipments_report` / `views.monthly_shipments` | Monthly shipment report | `_resolve_report_stations`; removed first-active-station fallback | **Isolated (updated)** |
| `api.reports.station_tank_summary` / `views.tank_summary` | Tank volume summary | `_resolve_report_stations`; removed fallback | **Isolated (updated)** |
| `api.reports.delivery_print_report` / `views.delivery_print` | Delivery print report | `_resolve_report_stations`; removed fallback | **Isolated (updated)** |
| `api.reports.station_total_received` / `views.total_received` | Total received fuel | `_resolve_report_stations`; removed fallback | **Isolated (updated)** |
| `api.reports.export_station_excel` / `views.export_station_excel_endpoint` | Excel export (station/reconciliation/shift) | Resolves record station + enforces bound-user scope check (no cross-station export) | Isolated (scoped) |
| CRUD/resources (stations, shifts, readings, tanks, deliveries, deposits, expenses, etc.) | Data operations | Frontend `api.js` auto-adds global `station` for station-bound resources; server-side station fields/filters apply per resource | **Needs ongoing server-side audit per resource** (readings/collections resolve via parent relations) |

## Frontend views (station context)

| View | Route | API(s) | Scoping | Status |
|---|---|---|---|---|
| Station select gate | `/select-station/` | stations list | Global selector (`sejel-current-station`) | Isolated |
| Layout/sidebar | global | station store | Global “المحطة الحالية” selector for all functions | Isolated |
| Dashboard | `/` | `/dashboard-station/` | Uses global station; reacts to changes | Isolated (updated backend) |
| Readings | `/readings` | readings/resources | Global station scoping | Isolated |
| Monthly report | `/reports/monthly` | `/reports/monthly/` | Global station, no local picker | Isolated |
| Daily report | `/reports/daily` | `/reports/daily/` | Global station | Isolated |
| Daily statement (new) | `/reports/daily-statement` | `/reports/daily-statement/` | Global station | Isolated (new) |
| Balance report | `/reports/balance` | `/reports/balance/` | Global station | Isolated |
| Shipment report | `/reports/shipments` | `/reports/monthly-shipments/` | Global station | Isolated (updated backend) |
| Delivery print | `/reports/delivery-print` | `/delivery-print/` | Global station | Isolated (updated backend) |
| Daily sales (finance) | `/finance/daily-sales` | `/reports/daily-sales/` | Global station; removed “مقارنة المحطات” comparison | **Isolated (updated)** |
| Station setup/list/detail, shifts, deliveries, deposits, expenses, etc. | various | various resources | Rely on global station store + `api.js` scoping; many list/detail pages need per-page verification | **Sweep/verify recommended** |

## Notes / follow-ups
- `reports._scoped_station_list` removed (unused). No remaining `frappe.get_all("Station"` in `sejel_app/api`.
- Nginx route for `/api/reports/daily-statement/` added in `/etc/nginx/sites-enabled/sejel` (server-only, not in repo).
- Built SPA assets updated (`sejel/staticfiles/vue/assets/*`).
- Pending (separate approvals): Oct 7 2026 outlier correction on production (`6fqbru2crs`/`34ct3ki4an`, chained 2026-10-08 M01A) with before/after evidence; configure offsite backup.
