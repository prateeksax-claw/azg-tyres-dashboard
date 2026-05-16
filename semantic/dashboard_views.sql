-- Tyres Division Dashboard semantic views
-- Purpose: clean, reusable BI layer for the online Tyres management cockpit.
-- Loaded by scripts/dashboard_semantic.py after seeding budget/projection tables.

CREATE OR REPLACE VIEW dash_context AS
WITH maxes AS (
    SELECT CAST(MAX(InvoiceDate) AS DATE) AS as_of_date
    FROM tyres_sales_clean
)
SELECT
    as_of_date,
    DATE_TRUNC('month', as_of_date)::DATE AS month_start,
    LAST_DAY(as_of_date)::DATE AS month_end,
    EXTRACT(day FROM as_of_date)::INTEGER AS day_of_month,
    EXTRACT(day FROM LAST_DAY(as_of_date))::INTEGER AS days_in_month,
    GREATEST(EXTRACT(day FROM LAST_DAY(as_of_date))::INTEGER - EXTRACT(day FROM as_of_date)::INTEGER, 0) AS days_remaining_month,
    STRFTIME(as_of_date, '%Y-%m') AS month_key,
    EXTRACT(month FROM as_of_date)::INTEGER AS month_num,
    EXTRACT(year FROM as_of_date)::INTEGER AS year_num
FROM maxes;

CREATE OR REPLACE VIEW dash_sales_base AS
SELECT
    CAST(s.InvoiceDate AS DATE) AS invoice_date,
    STRFTIME(CAST(s.InvoiceDate AS DATE), '%Y-%m') AS month_key,
    EXTRACT(year FROM CAST(s.InvoiceDate AS DATE))::INTEGER AS year_num,
    EXTRACT(month FROM CAST(s.InvoiceDate AS DATE))::INTEGER AS month_num,
    s.SalesId,
    s.VoucherNo,
    COALESCE(NULLIF(TRIM(s.DivCustomer), ''), s.Customer) AS customer_name,
    COALESCE(NULLIF(s.DivCustomerId, 0), s.CustomerId) AS customer_id,
    s.Customer AS billing_entity,
    s.CustomerId AS billing_entity_id,
    UPPER(TRIM(COALESCE(s.SalesMan, 'UNKNOWN'))) AS salesman,
    s.SalesManId AS salesman_id,
    COALESCE(NULLIF(TRIM(s.SMRegion), ''), NULLIF(TRIM(s.Branch), ''), 'UNMAPPED') AS region,
    COALESCE(NULLIF(TRIM(s.Branch), ''), 'UNMAPPED') AS branch,
    s.BranchId AS branch_id,
    COALESCE(NULLIF(TRIM(s.Division), ''), 'TYRES') AS division,
    COALESCE(NULLIF(TRIM(s.ProductGroup), ''), 'UNMAPPED') AS product_group,
    COALESCE(NULLIF(TRIM(s.Product), ''), 'UNMAPPED') AS product,
    s.ProductId AS product_id,
    CASE
        WHEN UPPER(COALESCE(s.ProductGroup,'') || ' ' || COALESCE(s.Product,'')) LIKE '%SPARE%' THEN 'SPARE PARTS'
        WHEN UPPER(COALESCE(s.ProductGroup,'') || ' ' || COALESCE(s.Product,'')) LIKE '%BATTER%' THEN 'BATTERY'
        WHEN UPPER(COALESCE(s.ProductGroup,'') || ' ' || COALESCE(s.Product,'')) LIKE '%RETREAD%'
          OR UPPER(COALESCE(s.ProductGroup,'') || ' ' || COALESCE(s.Product,'')) LIKE '%HOTCURE%'
          OR UPPER(COALESCE(s.ProductGroup,'') || ' ' || COALESCE(s.Product,'')) LIKE '%COLD CURE%' THEN 'RETREAD / SERVICE'
        WHEN UPPER(COALESCE(s.ProductGroup,'') || ' ' || COALESCE(s.Product,'')) LIKE '%OTR%'
          OR REGEXP_MATCHES(UPPER(COALESCE(s.Product,'')), '(^|[^0-9])(14|16|17|20|23|26|29)\.5[- ]?25') THEN 'OTR'
        WHEN UPPER(COALESCE(s.ProductGroup,'') || ' ' || COALESCE(s.Product,'')) LIKE '%PCR%'
          OR REGEXP_MATCHES(UPPER(COALESCE(s.Product,'')), '^[0-9]{3}/[0-9]{2}R(1[3-9]|2[0-4])') THEN 'PCR / LTR'
        WHEN UPPER(COALESCE(s.ProductGroup,'') || ' ' || COALESCE(s.Product,'')) LIKE '%TBR%'
          OR REGEXP_MATCHES(UPPER(COALESCE(s.Product,'')), 'R(20|22\.5|24)') THEN 'TBR'
        ELSE 'OTHER TYRES'
    END AS derived_category,
    CASE
        WHEN POSITION('-' IN COALESCE(s.ProductGroup,'')) > 1 THEN TRIM(SPLIT_PART(s.ProductGroup, '-', 1))
        WHEN POSITION(' ' IN COALESCE(s.ProductGroup,'')) > 1 THEN TRIM(SPLIT_PART(s.ProductGroup, ' ', 1))
        ELSE COALESCE(NULLIF(TRIM(s.ProductGroup), ''), 'UNMAPPED')
    END AS derived_brand,
    s.Quantity AS qty,
    s.Gross AS gross_amount,
    s.Discount AS discount_amount,
    s.NetAmountWithoutVAT AS net_amount_without_vat_raw,
    s.revenue_ex_vat AS revenue_ex_vat,
    s.VATAmount AS vat_amount,
    s.NetAmount AS net_amount,
    s.TypeValue AS type_value,
    CASE WHEN s.TypeValue = 2 THEN 1 ELSE 0 END AS is_return,
    s.PaymentCategory AS payment_category,
    s.PaymentModeId AS payment_mode_id,
    s.Warehouse AS warehouse,
    s.Vendor AS vendor
FROM tyres_sales_clean s;

CREATE OR REPLACE VIEW dash_profit_base AS
SELECT
    CAST(p.InvoiceDate AS DATE) AS invoice_date,
    STRFTIME(CAST(p.InvoiceDate AS DATE), '%Y-%m') AS month_key,
    EXTRACT(year FROM CAST(p.InvoiceDate AS DATE))::INTEGER AS year_num,
    EXTRACT(month FROM CAST(p.InvoiceDate AS DATE))::INTEGER AS month_num,
    p.SalesId,
    p.VoucherNo,
    COALESCE(NULLIF(TRIM(p.Customer), ''), 'UNMAPPED') AS customer_name,
    UPPER(TRIM(COALESCE(p.SalesMan, 'UNKNOWN'))) AS salesman,
    COALESCE(NULLIF(TRIM(p.Region), ''), NULLIF(TRIM(p.Branch), ''), 'UNMAPPED') AS region,
    COALESCE(NULLIF(TRIM(p.Branch), ''), 'UNMAPPED') AS branch,
    COALESCE(NULLIF(TRIM(p.ProductGroup), ''), 'UNMAPPED') AS product_group,
    COALESCE(NULLIF(TRIM(p.Product), ''), 'UNMAPPED') AS product,
    CASE
        WHEN UPPER(COALESCE(p.ProductGroup,'') || ' ' || COALESCE(p.Product,'')) LIKE '%SPARE%' THEN 'SPARE PARTS'
        WHEN UPPER(COALESCE(p.ProductGroup,'') || ' ' || COALESCE(p.Product,'')) LIKE '%BATTER%' THEN 'BATTERY'
        WHEN UPPER(COALESCE(p.ProductGroup,'') || ' ' || COALESCE(p.Product,'')) LIKE '%RETREAD%'
          OR UPPER(COALESCE(p.ProductGroup,'') || ' ' || COALESCE(p.Product,'')) LIKE '%HOTCURE%' THEN 'RETREAD / SERVICE'
        WHEN UPPER(COALESCE(p.ProductGroup,'') || ' ' || COALESCE(p.Product,'')) LIKE '%OTR%' THEN 'OTR'
        WHEN UPPER(COALESCE(p.ProductGroup,'') || ' ' || COALESCE(p.Product,'')) LIKE '%PCR%' THEN 'PCR / LTR'
        WHEN UPPER(COALESCE(p.ProductGroup,'') || ' ' || COALESCE(p.Product,'')) LIKE '%TBR%' THEN 'TBR'
        ELSE 'OTHER TYRES'
    END AS derived_category,
    p.Quantity AS qty,
    p.SellingPrice AS selling_price,
    p.Revenue AS revenue,
    p.AvgCost AS avg_cost,
    p.COGS AS cogs,
    p.GrossProfit AS gross_profit,
    p.CostedRevenue AS costed_revenue,
    p.CostedGrossProfit AS costed_gross_profit,
    p.UncostedRevenue AS uncosted_revenue,
    p.UncostedGrossProfit AS uncosted_gross_profit,
    p.GPPercent AS gp_percent_raw
FROM tyres_profitability p;

CREATE OR REPLACE VIEW dash_collection_base AS
SELECT
    CAST(c.ReceivedOn AS DATE) AS received_date,
    CAST(c.InvoiceDate AS DATE) AS invoice_date,
    STRFTIME(CAST(c.ReceivedOn AS DATE), '%Y-%m') AS month_key,
    EXTRACT(year FROM CAST(c.ReceivedOn AS DATE))::INTEGER AS year_num,
    EXTRACT(month FROM CAST(c.ReceivedOn AS DATE))::INTEGER AS month_num,
    c.Refid,
    c.Customer AS customer_name,
    c.CustomerId AS customer_id,
    c.BillingEntity AS billing_entity,
    UPPER(TRIM(COALESCE(c.SalesMan, 'UNKNOWN'))) AS salesman,
    c.SalesManId AS salesman_id,
    COALESCE(NULLIF(TRIM(c.Branch), ''), 'UNMAPPED') AS branch,
    COALESCE(NULLIF(TRIM(c.Division), ''), 'TYRES') AS division,
    c.InvoiceVoucherNo AS invoice_voucher_no,
    c.ReceiptVoucherNo AS receipt_voucher_no,
    c.VoucherType AS voucher_type,
    c.Adjusted AS adjusted_amount,
    CASE WHEN c.VoucherType IN ('Rct','Pdr') THEN c.Adjusted ELSE 0 END AS bank_receipt_amount,
    CASE WHEN c.VoucherType = 'Rct' THEN c.Adjusted ELSE 0 END AS receipt_amount,
    CASE WHEN c.VoucherType = 'Pdr' THEN c.Adjusted ELSE 0 END AS pdc_amount,
    CASE WHEN c.VoucherType LIKE 'Jrn%' THEN c.Adjusted ELSE 0 END AS journal_adjustment_amount,
    c.Bank AS bank,
    CAST(c.ChequeDate AS DATE) AS cheque_date,
    c.CollectionType AS collection_type,
    c.PDCStatus AS pdc_status,
    c.DueDays AS due_days,
    c.ICDiv AS ic_division_tag
FROM tyres_collections_clean c
WHERE c.ReceivedOn IS NOT NULL;

CREATE OR REPLACE VIEW dash_ar_base AS
SELECT
    (SELECT as_of_date FROM dash_context) AS snapshot_date,
    CAST(a.InvoiceDate AS DATE) AS invoice_date,
    a.Customer AS customer_name,
    UPPER(TRIM(COALESCE(a.SalesMan, 'UNKNOWN'))) AS salesman,
    a.CustomerId AS customer_id,
    a.SalesManId AS salesman_id,
    a.VoucherNo AS voucher_no,
    a.CreditDays AS credit_days,
    a.ElapsedDays AS elapsed_days,
    a.Status AS status,
    a.OutStandingAmount AS outstanding_amount,
    CASE
        WHEN COALESCE(a.ElapsedDays, 0) <= COALESCE(a.CreditDays, 0) THEN 'CURRENT'
        WHEN COALESCE(a.ElapsedDays, 0) - COALESCE(a.CreditDays, 0) <= 30 THEN '1-30'
        WHEN COALESCE(a.ElapsedDays, 0) - COALESCE(a.CreditDays, 0) <= 60 THEN '31-60'
        WHEN COALESCE(a.ElapsedDays, 0) - COALESCE(a.CreditDays, 0) <= 90 THEN '61-90'
        ELSE '90+'
    END AS aging_bucket,
    GREATEST(COALESCE(a.ElapsedDays, 0) - COALESCE(a.CreditDays, 0), 0) AS overdue_days,
    CASE WHEN COALESCE(a.ElapsedDays, 0) > COALESCE(a.CreditDays, 0) THEN a.OutStandingAmount ELSE 0 END AS overdue_amount
FROM tyres_balance_aging a
WHERE COALESCE(a.OutStandingAmount, 0) <> 0;

CREATE OR REPLACE VIEW dash_sales_daily AS
SELECT
    invoice_date,
    month_key,
    region,
    branch,
    salesman,
    customer_name,
    product_group,
    product,
    derived_category,
    derived_brand,
    SUM(qty) AS qty,
    SUM(revenue_ex_vat) AS revenue_ex_vat,
    SUM(CASE WHEN is_return = 1 THEN revenue_ex_vat ELSE 0 END) AS returns_ex_vat,
    COUNT(DISTINCT VoucherNo) AS invoice_count,
    COUNT(DISTINCT customer_name) AS active_customers
FROM dash_sales_base
GROUP BY 1,2,3,4,5,6,7,8,9,10;

CREATE OR REPLACE VIEW dash_sales_monthly AS
SELECT
    month_key,
    year_num,
    month_num,
    region,
    branch,
    salesman,
    product_group,
    derived_category,
    derived_brand,
    SUM(qty) AS qty,
    SUM(revenue_ex_vat) AS revenue_ex_vat,
    COUNT(DISTINCT VoucherNo) AS invoice_count,
    COUNT(DISTINCT customer_name) AS active_customers
FROM dash_sales_base
GROUP BY 1,2,3,4,5,6,7,8,9;

CREATE OR REPLACE VIEW dash_gp_monthly AS
SELECT
    month_key,
    year_num,
    month_num,
    region,
    branch,
    salesman,
    product_group,
    derived_category,
    SUM(qty) AS qty,
    SUM(revenue) AS revenue,
    SUM(costed_revenue) AS costed_revenue,
    SUM(costed_gross_profit) AS gross_profit,
    SUM(uncosted_revenue) AS uncosted_revenue,
    CASE WHEN SUM(costed_revenue) <> 0 THEN SUM(costed_gross_profit) / SUM(costed_revenue) * 100 ELSE NULL END AS gp_pct
FROM dash_profit_base
GROUP BY 1,2,3,4,5,6,7,8;

CREATE OR REPLACE VIEW dash_collections_monthly AS
SELECT
    month_key,
    year_num,
    month_num,
    salesman,
    branch,
    SUM(bank_receipt_amount) AS bank_receipts,
    SUM(receipt_amount) AS cash_receipts,
    SUM(pdc_amount) AS pdc_receipts,
    SUM(journal_adjustment_amount) AS journal_adjustments,
    SUM(adjusted_amount) AS total_collections,
    COUNT(DISTINCT customer_name) AS paying_customers
FROM dash_collection_base
GROUP BY 1,2,3,4,5;

CREATE OR REPLACE VIEW dash_budget_vs_actual_current AS
WITH ctx AS (SELECT * FROM dash_context),
actual AS (
    SELECT salesman, SUM(revenue_ex_vat) AS actual_sales
    FROM dash_sales_base, ctx
    WHERE invoice_date BETWEEN ctx.month_start AND ctx.as_of_date
    GROUP BY salesman
),
gp AS (
    SELECT salesman,
           SUM(costed_revenue) AS costed_revenue,
           SUM(costed_gross_profit) AS gross_profit,
           CASE WHEN SUM(costed_revenue) <> 0 THEN SUM(costed_gross_profit) / SUM(costed_revenue) * 100 ELSE NULL END AS gp_pct
    FROM dash_profit_base, ctx
    WHERE invoice_date BETWEEN ctx.month_start AND ctx.as_of_date
    GROUP BY salesman
)
SELECT
    ctx.as_of_date,
    ctx.month_key,
    b.salesman,
    b.budget_amount,
    COALESCE(a.actual_sales, 0) AS actual_sales,
    COALESCE(g.gross_profit, 0) AS gross_profit,
    g.gp_pct,
    CASE WHEN b.budget_amount <> 0 THEN COALESCE(a.actual_sales, 0) / b.budget_amount * 100 ELSE NULL END AS budget_achievement_pct,
    GREATEST(b.budget_amount - COALESCE(a.actual_sales, 0), 0) AS budget_shortfall,
    CASE WHEN ctx.days_remaining_month > 0 THEN GREATEST(b.budget_amount - COALESCE(a.actual_sales, 0), 0) / ctx.days_remaining_month ELSE 0 END AS required_daily_run_rate
FROM dash_budget_2026_seed b
JOIN ctx ON b.year_num = ctx.year_num AND b.month_num = ctx.month_num
LEFT JOIN actual a ON a.salesman = b.salesman
LEFT JOIN gp g ON g.salesman = b.salesman;

CREATE OR REPLACE VIEW dash_projection_vs_actual_current AS
WITH ctx AS (SELECT * FROM dash_context),
actual AS (
    SELECT
        salesman,
        UPPER(TRIM(customer_name)) AS customer_key,
        SUM(revenue_ex_vat) AS actual_sales
    FROM dash_sales_base, ctx
    WHERE invoice_date BETWEEN ctx.month_start AND ctx.as_of_date
    GROUP BY 1,2
)
SELECT
    p.month_key,
    p.salesman,
    p.customer_name,
    p.projected_amount,
    p.workbook_achieved,
    COALESCE(a.actual_sales, 0) AS live_actual_sales,
    p.lpo_amount,
    p.confirmed_amount,
    p.total_pipeline_amount,
    p.expectation_amount,
    GREATEST(p.projected_amount - COALESCE(a.actual_sales, 0), 0) AS live_projection_gap,
    CASE
        WHEN p.projected_amount <= 0 AND COALESCE(a.actual_sales, 0) > 0 THEN 'UNPLANNED SALE'
        WHEN p.projected_amount <= 0 THEN 'NO TARGET'
        WHEN COALESCE(a.actual_sales, 0) >= p.projected_amount THEN 'ACHIEVED'
        WHEN COALESCE(a.actual_sales, 0) / p.projected_amount >= 0.70 THEN 'ON TRACK'
        WHEN COALESCE(a.actual_sales, 0) > 0 THEN 'AT RISK'
        ELSE 'OPEN'
    END AS projection_status
FROM dash_projection_status_seed p
LEFT JOIN actual a
  ON a.salesman = p.salesman
 AND a.customer_key = UPPER(TRIM(p.customer_name));

CREATE OR REPLACE VIEW dash_shortfall_bridge_current AS
WITH ctx AS (SELECT * FROM dash_context),
sales AS (
    SELECT SUM(revenue_ex_vat) AS actual_sales
    FROM dash_sales_base, ctx
    WHERE invoice_date BETWEEN ctx.month_start AND ctx.as_of_date
),
budget AS (
    SELECT SUM(budget_amount) AS budget_amount
    FROM dash_budget_2026_seed b, ctx
    WHERE b.year_num = ctx.year_num AND b.month_num = ctx.month_num
),
projection AS (
    SELECT SUM(projected_amount) AS projected_amount,
           SUM(lpo_amount) AS lpo_amount,
           SUM(confirmed_amount) AS confirmed_amount,
           SUM(expectation_amount) AS expectation_amount
    FROM dash_projection_status_seed p, ctx
    WHERE p.month_key = ctx.month_key
)
SELECT
    ctx.as_of_date,
    ctx.month_key,
    budget.budget_amount,
    projection.projected_amount,
    sales.actual_sales,
    projection.lpo_amount,
    projection.confirmed_amount,
    projection.expectation_amount,
    GREATEST(budget.budget_amount - sales.actual_sales, 0) AS shortfall_to_budget,
    GREATEST(projection.projected_amount - sales.actual_sales, 0) AS shortfall_to_projection,
    CASE WHEN ctx.days_remaining_month > 0 THEN GREATEST(budget.budget_amount - sales.actual_sales, 0) / ctx.days_remaining_month ELSE 0 END AS daily_required_for_budget,
    CASE WHEN ctx.days_remaining_month > 0 THEN GREATEST(projection.projected_amount - sales.actual_sales, 0) / ctx.days_remaining_month ELSE 0 END AS daily_required_for_projection
FROM ctx, sales, budget, projection;

CREATE OR REPLACE VIEW dash_customer_360_current AS
WITH ctx AS (SELECT * FROM dash_context),
sales AS (
    SELECT salesman, customer_name,
           SUM(revenue_ex_vat) AS mtd_sales,
           COUNT(DISTINCT VoucherNo) AS invoices,
           MAX(invoice_date) AS last_invoice_date
    FROM dash_sales_base, ctx
    WHERE invoice_date BETWEEN ctx.month_start AND ctx.as_of_date
    GROUP BY 1,2
),
gp AS (
    SELECT salesman, customer_name,
           SUM(costed_revenue) AS costed_revenue,
           SUM(costed_gross_profit) AS gross_profit,
           CASE WHEN SUM(costed_revenue) <> 0 THEN SUM(costed_gross_profit)/SUM(costed_revenue)*100 ELSE NULL END AS gp_pct,
           SUM(uncosted_revenue) AS uncosted_revenue
    FROM dash_profit_base, ctx
    WHERE invoice_date BETWEEN ctx.month_start AND ctx.as_of_date
    GROUP BY 1,2
),
coll AS (
    SELECT salesman, customer_name,
           SUM(bank_receipt_amount) AS bank_receipts,
           SUM(journal_adjustment_amount) AS journal_adjustments,
           MAX(received_date) AS last_collection_date
    FROM dash_collection_base, ctx
    WHERE received_date BETWEEN ctx.month_start AND ctx.as_of_date
    GROUP BY 1,2
),
ar AS (
    SELECT salesman, customer_name,
           SUM(outstanding_amount) AS outstanding_amount,
           SUM(overdue_amount) AS overdue_amount,
           MAX(overdue_days) AS max_overdue_days
    FROM dash_ar_base
    GROUP BY 1,2
),
proj AS (
    SELECT salesman, customer_name,
           SUM(projected_amount) AS projected_amount,
           SUM(expectation_amount) AS expectation_amount,
           SUM(lpo_amount) AS lpo_amount,
           SUM(confirmed_amount) AS confirmed_amount
    FROM dash_projection_status_seed p, ctx
    WHERE p.month_key = ctx.month_key
    GROUP BY 1,2
),
keys AS (
    SELECT salesman, customer_name FROM sales
    UNION SELECT salesman, customer_name FROM gp
    UNION SELECT salesman, customer_name FROM coll
    UNION SELECT salesman, customer_name FROM ar
    UNION SELECT salesman, customer_name FROM proj
)
SELECT
    k.salesman,
    k.customer_name,
    COALESCE(s.mtd_sales, 0) AS mtd_sales,
    COALESCE(g.gross_profit, 0) AS gross_profit,
    g.gp_pct,
    COALESCE(g.uncosted_revenue, 0) AS uncosted_revenue,
    COALESCE(c.bank_receipts, 0) AS bank_receipts,
    COALESCE(c.journal_adjustments, 0) AS journal_adjustments,
    COALESCE(a.outstanding_amount, 0) AS outstanding_amount,
    COALESCE(a.overdue_amount, 0) AS overdue_amount,
    COALESCE(a.max_overdue_days, 0) AS max_overdue_days,
    COALESCE(p.projected_amount, 0) AS projected_amount,
    COALESCE(p.lpo_amount, 0) AS lpo_amount,
    COALESCE(p.confirmed_amount, 0) AS confirmed_amount,
    COALESCE(p.expectation_amount, 0) AS expectation_amount,
    s.invoices,
    s.last_invoice_date,
    c.last_collection_date
FROM keys k
LEFT JOIN sales s USING (salesman, customer_name)
LEFT JOIN gp g USING (salesman, customer_name)
LEFT JOIN coll c USING (salesman, customer_name)
LEFT JOIN ar a USING (salesman, customer_name)
LEFT JOIN proj p USING (salesman, customer_name);

CREATE OR REPLACE VIEW dash_product_mix_current AS
WITH ctx AS (SELECT * FROM dash_context)
SELECT
    s.derived_category,
    s.derived_brand,
    s.product_group,
    s.product,
    SUM(s.qty) AS qty,
    SUM(s.revenue_ex_vat) AS revenue_ex_vat,
    COUNT(DISTINCT s.customer_name) AS buying_customers,
    COUNT(DISTINCT s.VoucherNo) AS invoice_count,
    COALESCE(SUM(p.costed_gross_profit), 0) AS gross_profit,
    CASE WHEN SUM(p.costed_revenue) <> 0 THEN SUM(p.costed_gross_profit)/SUM(p.costed_revenue)*100 ELSE NULL END AS gp_pct
FROM dash_sales_base s
CROSS JOIN ctx
LEFT JOIN dash_profit_base p
  ON p.SalesId = s.SalesId AND p.product = s.product
WHERE s.invoice_date BETWEEN ctx.month_start AND ctx.as_of_date
GROUP BY 1,2,3,4;

CREATE OR REPLACE VIEW dash_gp_alerts_current AS
WITH ctx AS (SELECT * FROM dash_context),
base AS (
    SELECT
        salesman,
        customer_name,
        product_group,
        product,
        SUM(costed_revenue) AS costed_revenue,
        SUM(costed_gross_profit) AS gross_profit,
        SUM(uncosted_revenue) AS uncosted_revenue,
        CASE WHEN SUM(costed_revenue) <> 0 THEN SUM(costed_gross_profit)/SUM(costed_revenue)*100 ELSE NULL END AS gp_pct
    FROM dash_profit_base, ctx
    WHERE invoice_date BETWEEN ctx.month_start AND ctx.as_of_date
    GROUP BY 1,2,3,4
)
SELECT
    *,
    CASE
        WHEN costed_revenue <= 0 AND uncosted_revenue > 0 THEN 'UNCOSTED REVENUE'
        WHEN gp_pct < 0 THEN 'NEGATIVE GP'
        WHEN gp_pct < 8 THEN 'CRITICAL LOW GP'
        WHEN gp_pct < 12 THEN 'LOW GP'
        ELSE 'WATCH'
    END AS alert_type,
    CASE
        WHEN costed_revenue <= 0 AND uncosted_revenue > 0 THEN 4
        WHEN gp_pct < 0 THEN 5
        WHEN gp_pct < 8 THEN 4
        WHEN gp_pct < 12 THEN 3
        ELSE 2
    END AS severity
FROM base
WHERE (costed_revenue > 0 AND gp_pct < 12)
   OR uncosted_revenue > 0;

CREATE OR REPLACE VIEW dash_ar_aging_current AS
SELECT
    salesman,
    customer_name,
    aging_bucket,
    SUM(outstanding_amount) AS outstanding_amount,
    SUM(overdue_amount) AS overdue_amount,
    COUNT(DISTINCT voucher_no) AS open_invoices,
    MAX(overdue_days) AS max_overdue_days
FROM dash_ar_base
GROUP BY 1,2,3;

CREATE OR REPLACE VIEW dash_action_center_current AS
SELECT
    'BUDGET SHORTFALL' AS issue_type,
    CASE WHEN budget_shortfall >= 250000 THEN 5 WHEN budget_shortfall >= 100000 THEN 4 WHEN budget_shortfall > 0 THEN 3 ELSE 1 END AS severity,
    salesman AS owner,
    NULL AS customer_name,
    NULL AS product_group,
    budget_shortfall AS impact_aed,
    'Close daily billing run-rate gap vs official budget' AS recommended_action,
    required_daily_run_rate AS required_daily_value
FROM dash_budget_vs_actual_current
WHERE budget_shortfall > 0
UNION ALL
SELECT
    'PROJECTION EXPECTATION',
    CASE WHEN expectation_amount >= 100000 THEN 5 WHEN expectation_amount >= 50000 THEN 4 ELSE 3 END,
    salesman,
    customer_name,
    NULL,
    expectation_amount,
    'Get firm LPO/confirmed amount and billing date before month-end',
    NULL
FROM dash_projection_vs_actual_current
WHERE expectation_amount > 0
UNION ALL
SELECT
    'LOW GP',
    severity,
    salesman,
    customer_name,
    product_group,
    ABS(gross_profit) AS impact_aed,
    'Review price/cost and stop margin leakage on this product/customer line',
    NULL
FROM dash_gp_alerts_current
WHERE severity >= 3
UNION ALL
SELECT
    'OVERDUE RECEIVABLE',
    CASE WHEN overdue_amount >= 250000 THEN 5 WHEN overdue_amount >= 100000 THEN 4 ELSE 3 END,
    salesman,
    customer_name,
    NULL,
    overdue_amount,
    'Collect overdue amount / verify PDC or committed payment date',
    NULL
FROM (
    SELECT salesman, customer_name, SUM(overdue_amount) AS overdue_amount
    FROM dash_ar_base
    GROUP BY 1,2
) o
WHERE overdue_amount > 25000;
