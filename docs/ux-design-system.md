# Tyres Dashboard Design System

Created: 2026-05-16
Intent: international-standard, premium management cockpit for Al Zaabi Tyres.

## Design direction

Visual style: premium automotive analytics cockpit.

Keywords:
- clean
- confident
- executive
- high-contrast
- fast scanning
- tactical alerts
- polished but not decorative

Avoid:
- crowded Excel-like screens
- random colors
- 3D charts
- overuse of pie/donut charts
- tiny unreadable tables
- dashboards without action context

## Brand feel

Base palette:
- Midnight navy: `#07111F`
- Deep slate: `#0F172A`
- Panel dark: `#111827`
- Surface light: `#F8FAFC`
- Border: `#E2E8F0`
- Primary blue: `#2563EB`
- Cyan accent: `#06B6D4`
- Success green: `#16A34A`
- Warning amber: `#F59E0B`
- Critical red: `#DC2626`
- Premium gold: `#C99700`

Recommended default: light executive theme with dark command header.
Dark mode can come later.

## Typography

- App/UI font: Inter or Geist Sans.
- Numbers: tabular numerals enabled.
- Headline cards: 28-40px depending card size.
- Section headings: 16-20px semi-bold.
- Table body: 12-14px.
- Use AED/M/K formatting; avoid excessive decimals.

Number rules:
- AED 6,903,750 -> AED 6.90M
- AED 448,885 -> AED 448.9K
- GP% -> 1 decimal
- achievement % -> 1 decimal

## Layout

### Shell
- Left navigation rail.
- Top command bar with:
  - dashboard name
  - as-of timestamp
  - period selector
  - compare selector
  - global search
  - export button
- Main canvas max width: 1440-1600px.
- Responsive grid: 12 columns desktop, 6 tablet, 1 mobile.

### Page pattern
1. Verdict row
   - one sentence: “MTD sales AED X, shortfall AED Y, GP Z%.”
2. KPI cards
   - 4-8 cards max.
3. Primary visual
   - trend, bridge, or leaderboard.
4. Diagnostic panels
   - region/salesman/product/customer breakdowns.
5. Action table
   - what to do next.

## Executive Command Center wireframe

Top row:
- MTD Sales
- Budget Achievement
- GP%
- Collections
- Outstanding / Overdue
- Required Daily Run-rate

Second row:
- Shortfall bridge waterfall
- Daily sales vs pace line

Third row:
- Salesman risk leaderboard
- Product/category mix
- Top GP alerts

Bottom:
- Action Center: severity, owner, issue, AED impact, recommended action.

## Chart standards

Use:
- KPI cards for headline numbers
- line charts for trend
- bar charts for ranking/comparison
- waterfall for shortfall bridge
- heatmap for risk matrix
- scatter for sales vs GP% / overdue risk
- tables for action lists and drill-down detail

Avoid:
- pie charts except <=5 categories and part-to-whole only
- gauges except rare executive target status
- stacked bars with too many segments
- dual axes unless absolutely necessary

## Visual components

### KPI Card
Fields:
- title
- main value
- delta vs target/previous
- mini sparkline
- status badge
- footnote/context

States:
- success, warning, critical, neutral

### Leaderboard table
Columns:
- rank
- owner
- actual
- target
- achievement %
- shortfall
- GP%
- action badge

### Customer/action table
Columns:
- severity
- owner
- customer
- issue
- AED impact
- recommendation
- due/status

### Drilldown drawer
Click any row to open:
- customer/product details
- 12M trend
- invoice list
- GP detail
- outstanding detail
- latest follow-up notes

## UX rules

- Every number needs comparison: target, prior month, prior year, or benchmark.
- Every red alert needs owner + AED impact + recommended action.
- Default sorting must show the biggest business impact first.
- Search must be excellent for customer/product names.
- Use one global filter state across pages.
- Drilldown must preserve context.
- Exports must reflect active filters.

## Dashboard pages

### 1. Executive Command Center
Purpose: 60-second management verdict.

### 2. Sales & Targets
Purpose: explain target achievement and shortfall.

### 3. Region / Branch
Purpose: identify geography and branch performance.

### 4. Salesman / Team
Purpose: accountability, coaching, and chase list.

### 5. Product / Category
Purpose: product mix, growth, and demand signal.

### 6. Customer 360
Purpose: full customer intelligence.

### 7. GP & Margin
Purpose: margin protection.

### 8. Collections / Credit
Purpose: cash and risk control.

### 9. Projection / Expectation
Purpose: month-end closure control.

### 10. ETO / Pipeline
Purpose: funnel conversion once data source is available.

### 11. Inventory
Purpose: availability and stock health once source is available.

### 12. Action Center
Purpose: management execution list.

## Frontend stack recommendation

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Apache ECharts for advanced visuals
- TanStack Table for action/drilldown tables
- Zustand or URL state for filters
- Framer Motion for subtle transitions only

## International standard references applied

- Power BI: one-screen overview, important info top-left, context, correct visual choice.
- Tableau: audience/purpose first, limit visual overload, responsive/device layouts, filters/highlighting.
- Geckoboard/Tufte: high data-ink ratio, minimal noise, round numbers, group related metrics.
- Klipfolio/Coupler/Qlik: target-linked performance, pipeline health, team performance, revenue trend, drill by region/rep/product/customer.
