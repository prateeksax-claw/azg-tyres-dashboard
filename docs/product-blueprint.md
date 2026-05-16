# Tyres Division Dashboard Blueprint

Created: 2026-05-16
Owner: Titan / Prateek

## Research basis

Best-practice signals reviewed:
- Microsoft Power BI dashboard design: audience-first, one-screen overview, important information top-left, use correct visual type, avoid clutter/3D/pie overuse, use context and consistent scales.
- Tableau dashboard best practices: know purpose/audience, top-left visual hierarchy, limit each dashboard to a few strong views, design for device size, add filters/highlighting.
- Klipfolio sales performance dashboard guide: separate sales performance from generic sales dashboards; include revenue, activity, CRM/pipeline/opportunity views; use drill-downs/filters; keep data current and audited.
- Geckoboard dashboard design: clear purpose, only important content, high data-ink ratio, round numbers, efficient visualizations, group related metrics, hierarchy, context/targets, evolve with feedback.
- Coupler sales analytics examples: pipeline health, team performance, lost deal analysis, revenue forecasting, win rate, deal stage distribution, days to close, funnel bottlenecks.
- Qlik sales dashboard examples/search result: executives need revenue/quota/target trend plus exploration by year, segment, region, rep, product group.

## Titan-specific data reality

Current local data sources already available:
- `tyres_sales_clean`: sales and returns, CompanyType=3, interbranch excluded, LA MASIA excluded; 2015-01-01 to 2026-05-16; ~479,937 rows; includes SalesMan, SMRegion, Branch, Division, Product, ProductGroup, Category/SubCategory, quantity, revenue, payment fields.
- `tyres_profitability`: CRM GP data, 2025-01-01 to 2026-05-16; ~28,198 rows; includes revenue, AvgCost, COGS, GrossProfit, CostedRevenue, CostedGrossProfit, UncostedRevenue, Region.
- `tyres_collections_clean`: receipt/PDC/journal adjusted collections, excluding Sales Returns and unclassified Jrn reversals per Titan business rules.
- `tyres_balance_aging`: outstanding and aging from balance target.
- Official 2026 budget in `scripts/tyres_config.py`.
- Monthly projection layer in `data/projections/current_month_projection.json` / `tyres_projection_2026_05.json`.

Gaps / to add:
- ETO source if ETO means Enquiry-to-Order: enquiry/quotation/order/lost reason data is not yet in current Tyres mirror.
- Inventory/stock source for stock aging, dead stock, SKU availability, stock turns, purchase planning.
- Product taxonomy cleanup: current `Category` is largely blank, so dashboard must derive tyre category from `ProductGroup` / product naming unless ERP product master is added.

## Product principle

Do not build one overloaded screen. Build a management cockpit:
1. Executive command center = one-screen verdict.
2. Focus pages = region, salesman, customer, product, GP, collections, projection, ETO/inventory.
3. Drill-through = invoice/product/customer detail.
4. Action center = what to chase today, who owns it, amount, blocker.

Every page must answer:
- What happened?
- Why did it happen?
- Is it good/bad vs target/history?
- Who/product/customer caused it?
- What should management do next?

## Recommended UI sitemap

### 1. Executive Command Center
Audience: Prateek / Amal / senior management.
Cards:
- MTD sales ex-VAT
- MTD GP AED and GP%
- Budget achievement %
- Projection achievement %
- Shortfall to budget and projection
- Required run-rate / day
- Collections MTD: bank receipts, journals, PDC
- Outstanding / overdue / risk bucket
- ETO pipeline value and conversion if source added
- Top 5 risks and top 5 opportunities

Visuals:
- MTD actual vs budget vs projection pace line
- Region contribution / shortfall bar
- GP trend line vs previous months
- Customer/product/salesman movers
- Alert/action list

### 2. Sales & Target Performance
- Daily MTD sales trend vs same period last month and budget pace
- Monthly comparison 12 months
- YoY/MoM growth
- Budget vs actual by salesman / region / product group
- Projection vs achieved vs LPO vs confirmed vs expectation
- Shortfall bridge: budget -> projection -> achieved -> pipeline -> gap

### 3. Region / Branch Analytics
- Abu Dhabi / Dubai / Sharjah / branch drilldown
- Sales, GP, GP%, collections, overdue, shortfall
- Region mix over time
- Product mix by region
- Customer concentration by region
- Region-specific alerts

### 4. Salesman / Team Performance
- Salesman leaderboard with budget %, projection %, GP%, collections, outstanding, active customers
- MTD trend per salesman
- Customer-level gap by salesman
- Projection expectation tracker
- Visit/follow-up integration from tracker DBs later
- Coaching flags: low GP%, heavy overdue, projection miss, no movement accounts

### 5. Product / Category / Brand / Size Analytics
- ProductGroup / derived category / product/SKU sales
- Quantity, revenue, GP AED, GP%, average selling price
- Price realization vs last purchase/cost if available
- Fast/slow movers
- Product mix change vs previous month / quarter / year
- GP leakage products and high-margin winners

### 6. Customer 360
- Customer profile: salesman, region, credit terms, payment mode, last invoice, last collection
- Sales trend 12 months
- GP trend and benchmark vs category/salesman
- Outstanding/overdue/PDC status
- Product buying mix
- Lost/recovered sales vs prior months
- Projection/expectation status
- Action notes / follow-ups

### 7. GP & Margin Control
- GP% by salesman, region, customer, product group, product
- Weighted GP% = SUM(CostedGrossProfit) / SUM(CostedRevenue), never average row GP%
- Uncosted revenue tracker
- GP vs April benchmark and rolling 3/6 month median
- Low-GP exceptions: customer-product lines below threshold
- Price leakage: same product sold at materially different GP/ASP across customers/salesmen

### 8. Collections / Credit / Receivables
- Bank receipts vs journal adjustments separated
- PDC/CDC compliance
- Outstanding aging: current, 1-30, 31-60, 61-90, 90+
- Overdue by salesman/customer/region
- Collection efficiency = collections / due amount
- DSO estimate
- Top collection risks and promised dates

### 9. Projection / Expectation / Shortfall Control
- Official Budget_2026 is the target basis; uploaded projection is planning layer.
- Projection by customer/salesman
- Achieved, LPO, Confirmed, Expectation, Gap
- Daily movement vs previous upload
- Customer expectation list before month-end / 25 May style chase
- Required billing by remaining working days

### 10. ETO / Pipeline Analytics
Assumption: ETO = Enquiry-to-Order. If different, adjust.
Required source fields:
- enquiry_id, enquiry_date, customer, salesman, region, product/category, quoted_value, quote_date, order_date, order_value, status, lost_reason, competitor, expected_close_date.
KPIs:
- enquiry count/value
- quote value
- order value
- enquiry-to-quote %, quote-to-order %, enquiry-to-order %
- days enquiry->quote, quote->order
- open pipeline age
- lost reason analysis
- forecast weighted by probability

### 11. Inventory / Stock Intelligence
Requires stock source.
KPIs:
- stock on hand by product/brand/size/warehouse
- stock value
- stock aging
- stock turns = COGS / average inventory
- days of stock = stock qty / average daily sales qty
- dead/slow stock
- stockout risk for fast movers
- margin-risk inventory

### 12. Action Center
- One page only for management actions.
Columns:
  - severity
  - owner/salesman
  - customer/product
  - issue type: shortfall / low GP / overdue / ETO stalled / stockout
  - AED impact
  - recommended action
  - due date
  - status / latest update

## Star schema

### Dimensions
- `dim_date(date_key, date, day, week, month, quarter, year, fiscal_month, is_working_day, days_elapsed_mtd, days_remaining_mtd)`
- `dim_salesman(salesman_key, salesman_id, salesman_name, normalized_name, team, region, active_flag, budget_owner_flag)`
- `dim_region(region_key, sm_region, branch, branch_id, emirate, team)`
- `dim_customer(customer_key, customer_id, div_customer_id, customer_name, billing_entity, normalized_name, credit_days, payment_mode, customer_type, active_flag, exclusion_flag)`
- `dim_product(product_key, product_id, product_name, product_group, derived_brand, derived_category, tyre_size, segment, vendor, active_flag)`
- `dim_payment(payment_key, payment_category, payment_mode, credit_type)`
- `dim_target(target_key, year, month, owner_type, owner_key, budget_amount, projection_amount, source)`

### Facts
- `fact_sales_line(sales_id, invoice_date_key, voucher_no, customer_key, salesman_key, product_key, region_key, qty, gross, discount, revenue_ex_vat, vat, net_amount, type_value, is_return)`
- `fact_profit_line(sales_id, invoice_date_key, voucher_no, customer_key, salesman_key, product_key, region_key, qty, revenue, cogs, gross_profit, costed_revenue, costed_gross_profit, uncosted_revenue, gp_percent_raw)`
- `fact_collection(refid, received_date_key, invoice_date_key, customer_key, salesman_key, voucher_no, receipt_voucher_no, voucher_type, adjusted_amount, bank, cheque_date, collection_type)`
- `fact_outstanding(snapshot_date_key, customer_key, salesman_key, invoice_date_key, voucher_no, outstanding_amount, credit_days, elapsed_days, aging_bucket, status)`
- `fact_budget(month_key, salesman_key, budget_amount)`
- `fact_projection(month_key, salesman_key, customer_key, projected_amount, workbook_achieved, lpo_amount, confirmed_amount, expectation_amount, source_file, loaded_at)`
- `fact_eto(enquiry_id, enquiry_date_key, quote_date_key, order_date_key, customer_key, salesman_key, product_key, enquiry_value, quote_value, order_value, status, lost_reason, competitor, probability)`
- `fact_inventory(snapshot_date_key, warehouse_key, product_key, stock_qty, stock_value, avg_cost, age_days, reserved_qty, reorder_level)`

## Core semantic views

### Sales and targets
- `v_sales_daily`: date, region, branch, salesman, customer, product_group, product, qty, revenue_ex_vat, returns, net_sales.
- `v_sales_mtd`: MTD/YTD sales by dimensions with previous month, previous year, delta %, rank.
- `v_budget_vs_actual`: month, salesman/team/region, budget, actual, achievement_pct, shortfall, required_daily_run_rate.
- `v_projection_vs_actual`: month, salesman, customer, projection, achieved, lpo, confirmed, expectation, gap, status.
- `v_shortfall_bridge`: budget, projection, achieved, pipeline, remaining gap.

### GP
- `v_gp_summary`: dimensions, revenue, costed_revenue, costed_gp, gp_pct, uncosted_revenue.
- `v_gp_alerts`: low GP customers/products vs thresholds and April/rolling benchmark.
- `v_price_leakage`: same product ASP/GP variance across customers/salesmen.

### Product/customer
- `v_product_mix`: product/category mix, revenue share, qty share, GP share, trend.
- `v_customer_360`: customer sales trend, GP, outstanding, overdue, collections, projection, latest invoice/collection.
- `v_customer_risk_score`: combines shortfall, overdue, GP decline, no movement, high dependency.

### Collections
- `v_collections_mtd`: bank receipts, PDC, journals separated.
- `v_ar_aging`: outstanding by bucket, salesman, customer, region.
- `v_pdc_cdc_compliance`: PDC received/overdue/over-tenure flags.

### ETO / inventory
- `v_eto_funnel`: enquiry->quote->order conversion by owner/customer/product.
- `v_eto_stalled`: open enquiries/quotes past SLA.
- `v_inventory_health`: stock days, aging, dead stock, stockout risk, reorder signals.

## UI / UX design

### Layout
- Desktop: 1440px-first responsive design.
- Mobile: summary cards + priority action lists, not dense charts.
- Top bar: period selector, compare selector, region, branch, salesman, product group, customer search.
- Left nav: Command Center, Sales, Region, Salesman, Product, Customer, GP, Collections, Projection, ETO, Inventory, Actions, Data Explorer.

### Visual language
- Cards for headline KPIs.
- Bars for comparisons.
- Lines for trends.
- Tables only for ranked action lists and drilldowns.
- Heatmaps for salesman/customer/product risk.
- Waterfall/bridge for shortfall.
- Scatter plot for sales vs GP% / outstanding risk.
- Avoid 3D, decorative pie charts, unnecessary labels.

### Interaction
- Cross-filter visuals on click.
- Drill path: Division -> Region -> Branch -> Salesman -> Customer -> Invoice/Product.
- Search-first customer/product drilldown.
- Saved filters/views.
- Export to Excel/PDF for management packs.
- Alert thresholds configurable.
- Every alert must show owner and recommended action.

### KPI colors
- Green: ahead / achieved / improving.
- Amber: watch.
- Red: shortfall / GP leakage / overdue / stale ETO.
- Blue/navy: neutral base.
- Use color only for meaning, not decoration.

## Technical architecture recommendation

Best fit for GitHub + Cloudflare:

1. Backend semantic layer remains in Python/DuckDB where business rules already exist.
2. Expose a small FastAPI service on the server for live queries.
3. Put it behind Cloudflare Tunnel + Cloudflare Access, not public raw DB access.
4. Frontend: Next.js/React on Cloudflare Pages.
5. API: Cloudflare Worker routes authenticated requests to the FastAPI origin or reads precomputed snapshots.
6. Cache/precompute heavy aggregates as JSON/Parquet snapshots in R2; keep D1 only for app metadata/users/settings, not heavy analytics.
7. GitHub Actions deploy frontend/worker.
8. Scheduled sync: MSSQL -> local SQLite mirror -> DuckDB semantic views -> materialized aggregates -> API/R2 snapshots.

Libraries:
- Frontend: Next.js, TypeScript, Tailwind, shadcn/ui, Apache ECharts or Recharts, TanStack Table.
- Backend: FastAPI, DuckDB, Pydantic, pandas/polars for batch exports.
- Auth: Cloudflare Access with Prateek/Amal allowed users.

## Build phases

Phase 1: Design prototype
- Static dashboard shell with realistic aggregates from current data.
- Executive, Salesman, Product, GP, Customer pages.

Phase 2: Semantic layer
- Build `dashboard_views.sql` and data dictionary.
- Add product taxonomy derivation.
- Add materialized daily/monthly aggregate tables.

Phase 3: Live app
- FastAPI + Cloudflare Tunnel + Cloudflare Pages UI.
- Auth, filters, drilldowns, exports.

Phase 4: Advanced intelligence
- Action Center.
- GP leakage detection.
- Forecasting/required run-rate.
- ETO if source is integrated.
- Inventory if stock source is integrated.

Phase 5: Management polish
- PDF/Excel management pack.
- WhatsApp summary screenshots/files.
- Alerts to relevant sales groups.

## Open decisions needed

- Confirm ETO definition: Enquiry-to-Order?
- Confirm required inventory/stock source.
- Confirm dashboard access users.
- Confirm whether this should be internal-only behind Cloudflare Access or public URL with login.
- Confirm preferred branding/colors/logo.
