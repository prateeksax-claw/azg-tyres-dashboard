# Tyres Dashboard KPI Dictionary

Created: 2026-05-16

## Non-negotiable data rules

- Sales source: `tyres_sales_clean` via DuckDB only.
- GP source: `tyres_profitability` via DuckDB only.
- Collections source: `tyres_collections_clean` via DuckDB only.
- Outstanding source: `tyres_balance_aging` / Focus-backed receivables rules where required.
- CompanyType=3 only.
- Interbranch excluded.
- LA MASIA excluded from sales.
- Sales returns net as negative revenue.
- Collections must split bank receipts from journal adjustments.
- GP% must be weighted: `SUM(CostedGrossProfit) / SUM(CostedRevenue)`, never average row GP%.
- Official target = Budget_2026.
- Customer-wise projection = planning layer, not official target replacement.

## Executive KPIs

### MTD Sales ex-VAT
Formula: `SUM(dash_sales_base.revenue_ex_vat)` for current month through as-of date.
Purpose: primary billing achievement.

### Budget Achievement %
Formula: `MTD Sales / Official Monthly Budget * 100`.
Color:
- Green >= pace
- Amber within 10% short of pace
- Red below pace by >10%

### Shortfall to Budget
Formula: `MAX(Budget - MTD Sales, 0)`.
Used for required run-rate and action center.

### Projection Achievement %
Formula: `Live Actual Sales / Uploaded Projection * 100` by salesman/customer.
Use for customer planning accountability.

### Required Daily Run-rate
Formula: `Shortfall / remaining calendar days` initially.
Later upgrade: use remaining working days / holiday calendar.

### MTD GP AED
Formula: `SUM(CostedGrossProfit)`.

### MTD GP%
Formula: `SUM(CostedGrossProfit) / SUM(CostedRevenue) * 100`.
Do not include uncosted revenue in denominator.

### Uncosted Revenue
Formula: `SUM(UncostedRevenue)`.
Meaning: lines with zero/incomplete costing; must be visible as data-quality/margin risk.

### MTD Collections
Formula:
- Bank receipts = `SUM(Adjusted WHERE VoucherType IN ('Rct','Pdr'))`
- Journal adjustments = `SUM(Adjusted WHERE VoucherType LIKE 'Jrn%')`
- Total = bank + journal
Display rule: bank and journal must always be separate.

### Outstanding
Formula: `SUM(OutStandingAmount)` from aging view/current source.

### Overdue
Formula: `SUM(OutStandingAmount WHERE ElapsedDays > CreditDays)`.

## Sales KPIs

- Revenue ex-VAT
- Quantity
- Invoice count
- Active customers
- Average invoice value = revenue / invoice count
- Revenue per active customer = revenue / active customers
- MoM growth = current month revenue vs prior month revenue
- YoY growth = current period revenue vs same period last year
- Return value = negative revenue where TypeValue=2

## Salesman KPIs

- Budget amount
- MTD actual
- Budget achievement %
- Shortfall
- Required daily run-rate
- Projection amount
- Projection achieved
- Open expectation
- GP AED / GP%
- Collections
- Outstanding / overdue
- Active customers
- Customer concentration risk: top 5 customers / total salesman sales

## Product KPIs

- Revenue
- Quantity
- GP AED / GP%
- ASP = revenue / qty
- Buying customers
- Product mix share = product revenue / total revenue
- Category mix share
- Brand mix share
- Uncosted revenue
- Price leakage: same product with abnormal ASP/GP spread by customer/salesman

## Customer KPIs

- MTD sales
- 3M/6M/12M sales trend
- GP AED / GP%
- Product mix
- Projection
- Achieved vs projection
- LPO / confirmed / expectation
- Outstanding / overdue
- Last invoice date
- Last collection date
- Risk score

## GP alert rules v1

- Negative GP: GP% < 0
- Critical low GP: GP% < 8
- Low GP: GP% < 12
- Uncosted revenue: CostedRevenue = 0 and UncostedRevenue > 0

Upgrade later:
- Compare customer/product GP% to April benchmark and rolling 3/6 month median.
- Flag large GP drops even if above absolute threshold.

## Projection status rules

- Achieved: actual >= projection
- On Track: actual >= 70% of projection
- At Risk: actual > 0 but < 70%
- Open: no actual yet
- Unplanned Sale: projection <= 0 and actual > 0

## Action Center severity

Severity 5:
- Budget shortfall >= AED 250K
- Expectation >= AED 100K
- Overdue >= AED 250K
- Negative GP

Severity 4:
- Budget shortfall >= AED 100K
- Expectation >= AED 50K
- Overdue >= AED 100K
- Critical low GP

Severity 3:
- Any remaining expectation
- Low GP
- Overdue > AED 25K

## Views already created

- `dash_context`
- `dash_sales_base`
- `dash_profit_base`
- `dash_collection_base`
- `dash_ar_base`
- `dash_sales_daily`
- `dash_sales_monthly`
- `dash_gp_monthly`
- `dash_collections_monthly`
- `dash_budget_vs_actual_current`
- `dash_projection_vs_actual_current`
- `dash_shortfall_bridge_current`
- `dash_customer_360_current`
- `dash_product_mix_current`
- `dash_gp_alerts_current`
- `dash_ar_aging_current`
- `dash_action_center_current`
