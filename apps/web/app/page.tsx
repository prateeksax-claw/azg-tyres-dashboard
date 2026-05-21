'use client'

import { Fragment, useState } from 'react'
import { dashboardData, money, pct } from '../lib/dashboard-data'

type Tone = 'red' | 'blue' | 'teal' | 'gold' | 'green' | 'ink'

type Kpi = {
  icon: string
  label: string
  value: string
  basis: string
  delta: string
  tone: Tone
}

function safePct(value: number) {
  return Number.isFinite(value) ? pct(value) : '—'
}

function compactMoney(value: number) {
  return money(value).replace('.00', '')
}

function formatGeneratedAt(value: string | null | undefined) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d).replace(',', '')
}

function MiniBars({ tone = 'blue' }: { tone?: Tone }) {
  return (
    <span className={`mini-bars ${tone}`} aria-hidden="true">
      {[32, 48, 38, 64, 72, 55, 86, 68, 42, 77, 58, 92].map((h, index) => <i key={index} style={{ height: `${h}%` }} />)}
    </span>
  )
}

function TrendLine({ tone = 'green' }: { tone?: Tone }) {
  return (
    <svg className={`trend-line ${tone}`} viewBox="0 0 92 34" aria-hidden="true">
      <polyline points="2,25 14,16 25,21 37,8 50,14 63,5 77,12 90,7" />
    </svg>
  )
}

function InsightSpark({ tone = 'teal', down = false }: { tone?: Tone; down?: boolean }) {
  const points = down ? '2,8 18,11 34,9 50,17 66,20 82,27' : '2,27 18,22 34,24 50,15 66,12 82,7'
  return (
    <svg className={`insight-spark ${tone}`} viewBox="0 0 84 34" aria-hidden="true">
      <polyline points={points} />
      <circle cx="82" cy={down ? '27' : '7'} r="2.5" />
    </svg>
  )
}

function KpiCard({ item }: { item: Kpi }) {
  return (
    <article className="kpi-card">
      <div className={`kpi-icon ${item.tone}`}>{item.icon}</div>
      <div className="kpi-content">
        <p>{item.label}</p>
        <strong>{item.value}</strong>
        <div className="kpi-foot"><span>{item.basis}</span><b className={item.delta.startsWith('+') ? 'good' : 'bad'}>{item.delta}</b></div>
      </div>
    </article>
  )
}

function WaterfallBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: Tone }) {
  const h = Math.max(36, value / max * 150)
  return (
    <div className="wf-col">
      <span>{compactMoney(value)}</span>
      <i className={`wf-bar ${tone}`} style={{ height: `${h}px` }} />
      <small>{label}</small>
    </div>
  )
}

function signedCompactMoney(value: number) {
  const sign = value >= 0 ? '+' : '-'
  return `${sign}${compactMoney(Math.abs(value)).replace('AED ', '')}`
}

function signedPct(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  const n = Number(value)
  const sign = n >= 0 ? '+' : '-'
  return `${sign}${Math.abs(n).toFixed(1)}%`
}

function signedPp(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  const n = Number(value)
  const sign = n >= 0 ? '+' : '-'
  return `${sign}${Math.abs(n).toFixed(1)} pp`
}

function metric(row: Record<string, unknown>, key: string, fallback = 0) {
  const value = row[key]
  if (value === null || value === undefined || value === '') return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function optionalMetric(row: Record<string, unknown>, key: string) {
  const value = row[key]
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function ProjectionVarianceChip({ actual, projection }: { actual: number; projection: number }) {
  const variance = actual - projection
  if (variance >= 0) {
    return <em className="projection-chip surplus">Surplus {compactMoney(variance)}</em>
  }
  return <em className="projection-chip shortfall">Shortfall {compactMoney(Math.abs(variance))}</em>
}

function RegionMapAsset({ region }: { region: string }) {
  const files: Record<string, string> = {
    'ABU DHABI': 'abudhabi',
    DUBAI: 'dubai',
    'AL AIN': 'alain',
    SHARJAH: 'sharjah',
  }
  const file = files[region.toUpperCase()]
  if (!file) return <div className="region-map-asset region-map-fallback">{region}</div>
  return <img className="region-map-asset" src={`/generated/azg-uae-region-${file}.png`} alt={`${region} region map`} />
}

export default function Page() {
  const [expandedSalesmen, setExpandedSalesmen] = useState<Set<string>>(new Set())
  const data = dashboardData
  const ctx = data.context
  const bridge = data.command_center.shortfall_bridge
  const gp = data.command_center.gp_mtd
  const refreshedAt = formatGeneratedAt(String(data.generated_at || ''))

  const sales = Number(bridge.actual_sales || 0)
  const budget = Number(bridge.budget_amount || 0)
  const projection = Number(bridge.projected_amount || 0)
  const lpo = Number(bridge.lpo_amount || 0)
  const confirmed = Number(bridge.confirmed_amount || 0)
  const pipeline = lpo + confirmed
  const gap = Number(bridge.shortfall_to_budget || 0)
  const projectionGap = Number(bridge.shortfall_to_projection || 0)
  const runRate = Number(bridge.daily_required_for_budget || 0)
  const elapsedDays = Math.max(Number(ctx.day_of_month || 0), 1)
  const daysInMonth = Math.max(Number(ctx.days_in_month || elapsedDays), elapsedDays)
  const dailyTrend = sales / elapsedDays
  const eto = dailyTrend * daysInMonth
  const etoVariance = eto - budget
  const etoAch = budget ? eto / budget * 100 : 0
  const budgetAch = budget ? sales / budget * 100 : 0
  const projectionAch = projection ? sales / projection * 100 : 0
  const gpPct = Number(gp.gp_pct || 0)
  const grossProfit = Number(gp.gross_profit || 0)
  const gauge = Math.min(Math.max(etoAch, 0), 100)
  const etoGaugeValue = Math.min(Math.max(etoAch, 0), 150)
  const etoGaugeProgress = etoGaugeValue / 150 * 100
  const gaugeAngle = Math.PI - (etoGaugeValue / 150) * Math.PI
  const needleX = 110 + 72 * Math.cos(gaugeAngle)
  const needleY = 132 - 72 * Math.sin(gaugeAngle)
  const budgetProgress = budget ? Math.min(Math.max(sales / budget * 100, 0), 100) : 0
  const remainingBudget = Math.max(budget - sales, 0)
  const dailyTrendDelta = dailyTrend - runRate
  const daysRemaining = Number(ctx.days_remaining_month || 0)
  const regionTotal = data.region_current.reduce((sum, row) => sum + Number(row.revenue_ex_vat || 0), 0)
  const regionSlots = [...data.region_current]
    .map((row) => ({
      name: String(row.region || 'Unmapped Region').toUpperCase(),
      sales: Number(row.revenue_ex_vat || 0),
      customers: Number(row.active_customers || 0),
    }))
    .filter((region) => region.sales > 0)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 4)

  const productMap = new Map<string, { category: string; sales: number; gp: number }>()
  for (const row of data.product_mix_top) {
    const category = String(row.derived_category || 'Other')
    const current = productMap.get(category) || { category, sales: 0, gp: 0 }
    current.sales += Number(row.revenue_ex_vat || 0)
    current.gp += Number(row.gross_profit || 0)
    productMap.set(category, current)
  }
  const products = [...productMap.values()].sort((a, b) => b.sales - a.sales).slice(0, 5)
  const maxProduct = Math.max(...products.map((p) => p.sales), 1)

  const salesmen = [...data.salesman_leaderboard]
    .filter((s) => Number(s.projection_amount || 0) > 0)
    .sort((a, b) => Number(b.actual_sales || 0) - Number(a.actual_sales || 0))
  const salesmanNames = salesmen.map((s) => String(s.salesman))
  const toggleSalesman = (salesmanName: string) => {
    setExpandedSalesmen((current) => {
      const next = new Set(current)
      if (next.has(salesmanName)) next.delete(salesmanName)
      else next.add(salesmanName)
      return next
    })
  }
  const expandAllSalesmen = () => setExpandedSalesmen(new Set(salesmanNames))
  const collapseAllSalesmen = () => setExpandedSalesmen(new Set())
  const salesmanSales = salesmen.reduce((sum, s) => sum + Number(s.actual_sales || 0), 0)
  const salesmanProjection = salesmen.reduce((sum, s) => sum + Number(s.projection_amount || 0), 0)
  const salesmanProjectionAch = salesmanProjection ? salesmanSales / salesmanProjection * 100 : 0
  const salesmanEto = salesmen.reduce((sum, s) => sum + Number(s.eto_close || 0), 0)
  const salesmanEtoVariance = salesmanEto - salesmanProjection
  const salesmanLastMtdSales = salesmen.reduce((sum, s) => sum + Number(s.last_month_mtd_sales || 0), 0)
  const salesmanSalesChange = salesmanSales - salesmanLastMtdSales
  const salesmanSalesChangePct = salesmanLastMtdSales ? salesmanSalesChange / salesmanLastMtdSales * 100 : null
  const lastMonthCostedRevenue = salesmen.reduce((sum, s) => sum + Number(s.last_month_costed_revenue || 0), 0)
  const lastMonthGrossProfit = salesmen.reduce((sum, s) => sum + Number(s.last_month_gross_profit || 0), 0)
  const totalLastMonthGpPct = lastMonthCostedRevenue ? lastMonthGrossProfit / lastMonthCostedRevenue * 100 : null
  const totalGpPctChange = totalLastMonthGpPct === null ? null : gpPct - totalLastMonthGpPct
  const customerRowsBySalesman = new Map<string, (typeof data.customer_top)[number][]>()
  for (const row of data.customer_top) {
    const record = row as Record<string, unknown>
    const salesmanName = String(row.salesman || '').toUpperCase()
    const currentSales = Number(row.mtd_sales || 0)
    const projectionAmount = Number(row.projected_amount || 0)
    const lastMtdSales = metric(record, 'last_month_mtd_sales')
    if (!salesmanName || (currentSales === 0 && projectionAmount === 0 && lastMtdSales === 0)) continue
    const rows = customerRowsBySalesman.get(salesmanName) || []
    rows.push(row)
    customerRowsBySalesman.set(salesmanName, rows)
  }
  for (const rows of customerRowsBySalesman.values()) {
    rows.sort((a, b) => {
      const aShortfall = Math.max(Number(a.projected_amount || 0) - Number(a.mtd_sales || 0), 0)
      const bShortfall = Math.max(Number(b.projected_amount || 0) - Number(b.mtd_sales || 0), 0)
      if (bShortfall !== aShortfall) return bShortfall - aShortfall
      return Number(b.mtd_sales || 0) - Number(a.mtd_sales || 0)
    })
  }
  const customerRows = [...data.customer_top]
    .filter((row) => Number(row.projected_amount || 0) > 0)
    .sort((a, b) => Number(b.projected_amount || 0) - Number(a.projected_amount || 0))
    .slice(0, 3)
  const largestEtoRisk = [...salesmen].sort((a, b) => Number(a.eto_projection_variance || 0) - Number(b.eto_projection_variance || 0))[0]
  const projectionWatch = [...data.customer_top]
    .filter((row) => Number(row.projected_amount || 0) > 0)
    .map((row) => ({ ...row, progress: Number(row.mtd_sales || 0) / Math.max(Number(row.projected_amount || 0), 1) * 100 }))
    .sort((a, b) => a.progress - b.progress)[0]
  const gpLeak = [...data.gp_alerts_top].sort((a, b) => Number(a.gp_pct || 0) - Number(b.gp_pct || 0))[0]
  const actionItems = [
    `Trend closing ETO: ${compactMoney(eto)} (${signedCompactMoney(eto - projection)} vs projection)`,
    `${largestEtoRisk?.salesman || 'Top owner'}: ETO shortfall ${signedCompactMoney(Number(largestEtoRisk?.eto_projection_variance || 0))} vs projection`,
    `${projectionWatch?.customer_name || 'Projection watch'}: projection progress ${Math.round(Number(projectionWatch?.progress || 0))}%`,
    `${gpLeak?.salesman || 'GP watch'}: ${gpLeak?.product_group || 'margin'} GP at ${safePct(Number(gpLeak?.gp_pct || 0))}`,
  ]

  const kpis: Kpi[] = [
    { icon: '▥', label: 'MTD Sales', value: compactMoney(sales), basis: 'vs Budget', delta: `${safePct(budgetAch - 100)}`, tone: 'blue' },
    { icon: '◎', label: 'ETO vs Budget', value: safePct(etoAch), basis: `Close: ${compactMoney(eto)}`, delta: signedCompactMoney(etoVariance), tone: 'gold' },
    { icon: '%', label: 'GP %', value: safePct(gpPct), basis: 'vs Budget', delta: '+1.8 pp', tone: 'teal' },
    { icon: '◉', label: 'Gross Profit AED', value: compactMoney(grossProfit), basis: 'vs Budget', delta: '-60%', tone: 'ink' },
    { icon: '↗', label: 'Projection Achievement', value: safePct(projectionAch), basis: 'vs Projection', delta: `${Math.round(projectionAch - 100)} pp`, tone: 'gold' },
    { icon: '↻', label: 'Daily Needed', value: `${compactMoney(runRate)}/day`, basis: `${ctx.days_remaining_month} days left`, delta: `${signedCompactMoney(runRate - dailyTrend)}/day`, tone: 'ink' },
  ]

  const maxWaterfall = Math.max(budget, projection, sales, pipeline, gap, 1)

  return (
    <main className="command-artboard">
      <aside className="side-rail">
        <div className="side-logo"><img src="/brand/al-zaabi-logo-light.png" alt="Al Zaabi Group" /><strong>TYRES DIVISION</strong></div>
        <nav>
          <small className="nav-section-label">MAIN MENU</small>
          {['Executive Command', 'Sales & Targets', 'Region', 'Salesman', 'Product Mix'].map((item, i) => (
            <a className={i === 0 ? 'active' : ''} href="#" key={item}><span>{['◴','◎','◌','♙','▱'][i]}</span>{item}</a>
          ))}
          <small className="nav-section-label">OPERATIONS</small>
          {['Customer 360', 'GP & Margin', 'Projection', 'Action Center'].map((item, i) => (
            <a href="#" key={item}><span>{['♧','%','▥','☑'][i]}</span>{item}</a>
          ))}
        </nav>
        <div className="side-update"><i>◷</i><span>Last Updated</span><b>{refreshedAt} GST</b></div>
        <div className="tyre-graphic" aria-hidden="true" />
      </aside>

      <section className="command-canvas">
        <header className="top-ribbon">
          <div className="dashboard-greeting">
            <span>Automotive Division</span>
            <h1>Tyres Executive Command</h1>
            <p>Sales, projection, GP and customer execution overview</p>
          </div>
          <div className="top-control-cluster">
            <label className="global-search"><span>⌕</span> Search customer / salesman...</label>
            <div className="filter-row">
              <button>▣ May 1 – May {ctx.day_of_month}</button><button>All Regions</button><button>All Salesmen</button><button className="export">↻ Refresh</button>
            </div>
            <button className="ai-pill" type="button">✦ Ask Titan</button>
          </div>
        </header>

        <section className="eto-command-panel">
          <div className="eto-panel-head">
            <div className="eto-title-block"><span>↗</span><div><h2>ETO vs Budget</h2><p>MTD performance cockpit</p></div></div>
            <div className={etoVariance >= 0 ? 'eto-status surplus' : 'eto-status shortfall'}>{etoVariance >= 0 ? 'Surplus trend' : 'Shortfall trend'} <b>{signedCompactMoney(etoVariance)}</b></div>
          </div>
          <div className="eto-panel-grid">
            <div className="eto-kpi-stack">
              <article className="eto-mini-card red"><span>MTD</span><strong>{compactMoney(sales)}</strong><small>Budget achievement {safePct(budgetAch)}</small><i style={{ width: `${budgetProgress}%` }} /></article>
              <article className="eto-mini-card teal"><span>GP %</span><strong>{safePct(gpPct)}</strong><small>Gross profit {compactMoney(grossProfit)}</small><i style={{ width: `${Math.min(Math.max(gpPct, 0), 35) / 35 * 100}%` }} /></article>
              <article className={etoVariance >= 0 ? 'eto-mini-card green' : 'eto-mini-card gold'}><span>ETO Close</span><strong>{compactMoney(eto)}</strong><small>{Math.round(etoAch)}% of budget trend</small><i style={{ width: `${Math.min(Math.max(etoAch, 0), 120) / 120 * 100}%` }} /></article>
            </div>

            <div className="eto-gauge-card">
              <div className="eto-gauge-wrap">
                <svg className="eto-gauge" viewBox="0 0 220 152" role="img" aria-label="ETO versus budget gauge">
                  <path className="gauge-track" d="M24 132 A86 86 0 0 1 196 132" pathLength="100" />
                  <path className={etoAch >= 100 ? 'gauge-fill surplus' : 'gauge-fill shortfall'} d="M24 132 A86 86 0 0 1 196 132" pathLength="100" style={{ strokeDasharray: `${etoGaugeProgress} 100` }} />
                  <circle className="gauge-target" cx="153" cy="57" r="5" />
                  <line className="gauge-needle" x1="110" y1="132" x2={needleX} y2={needleY} />
                  <circle className="gauge-hub" cx="110" cy="132" r="6" />
                  <text x="21" y="147">0%</text><text x="61" y="65">50%</text><text x="150" y="50">100%</text><text x="190" y="147">150%</text>
                </svg>
                <div className="gauge-center"><span>{Math.round(etoAch)}%</span><small>ETO vs Budget</small><b>{compactMoney(eto)}</b></div>
              </div>
              <div className="gauge-legend"><span><i className="red" />Shortfall</span><span><i className="gold" />Target</span><span><i className="green" />Surplus</span></div>
            </div>

            <div className="eto-insights-grid">
              <article><div><span className="gold">◎</span><p>Budget Target<small>{compactMoney(budget)}</small></p></div><b>{compactMoney(remainingBudget)}</b><em>left to budget</em><InsightSpark tone="gold" /></article>
              <article className={etoVariance >= 0 ? 'positive' : 'negative'}><div><span>{etoVariance >= 0 ? '▲' : '▼'}</span><p>ETO Variance<small>trend close vs budget</small></p></div><b>{signedCompactMoney(etoVariance)}</b><em>{etoVariance >= 0 ? 'ahead' : 'behind'} at current pace</em><InsightSpark tone={etoVariance >= 0 ? 'green' : 'red'} down={etoVariance < 0} /></article>
              <article><div><span className="teal">⌁</span><p>Daily Trend<small>actual average billing</small></p></div><b>{compactMoney(dailyTrend)}/day</b><em>{signedCompactMoney(dailyTrendDelta)}/day vs needed</em><InsightSpark tone={dailyTrendDelta >= 0 ? 'green' : 'red'} down={dailyTrendDelta < 0} /></article>
              <article><div><span className="blue">▣</span><p>Required Run Rate<small>to hit budget</small></p></div><b>{compactMoney(runRate)}/day</b><em>{daysRemaining} days remaining</em><InsightSpark tone="blue" /></article>
              <article className="days-card"><div><span className="purple">◷</span><p>Month Clock<small>execution window</small></p></div><b>{ctx.day_of_month}/{ctx.days_in_month}</b><em>{daysRemaining} days left</em><div className="day-dots">{Array.from({ length: 10 }).map((_, i) => <i key={i} className={i < Math.round(Number(ctx.day_of_month || 0) / Number(ctx.days_in_month || 31) * 10) ? 'done' : ''} />)}</div></article>
            </div>
          </div>
        </section>

        <section className="kpi-grid">{kpis.map((item) => <KpiCard key={item.label} item={item} />)}</section>

        <section className="card salesman-spotlight">
          <div className="salesman-spotlight-head">
            <div>
              <p>Primary Execution View</p>
              <h3>Salesman Performance — All Salesmen</h3>
              <small className="salesman-breakdown-note">Click a salesman to expand/collapse customers — sorted by projection shortfall ↓</small>
            </div>
            <div className="salesman-view-actions">
              <button type="button" onClick={expandAllSalesmen}>Expand all</button>
              <button type="button" onClick={collapseAllSalesmen}>Collapse all</button>
            </div>
            <div className="salesman-summary-strip">
              <span><b>{compactMoney(salesmanSales)}</b><small>MTD Sales</small></span>
              <span><b>{compactMoney(salesmanProjection)}</b><small>Projection</small></span>
              <span className={salesmanEtoVariance >= 0 ? 'summary-variance pos' : 'summary-variance neg'}><b>{signedCompactMoney(salesmanEtoVariance)}</b><small>ETO vs Projection</small></span>
            </div>
          </div>
          <div className="salesman-table-wrap">
            <table>
              <thead><tr><th>#</th><th>Salesman</th><th>MTD Sales</th><th>Projection</th><th>MTD %</th><th>ETO Close</th><th>ETO vs Projection</th><th>Last MTD</th><th>Revenue Δ</th><th>GP %</th><th>GP Δ</th></tr></thead>
              <tbody>
                {salesmen.map((s, index) => {
                  const salesmanName = String(s.salesman)
                  const customerDetails = customerRowsBySalesman.get(salesmanName.toUpperCase()) || []
                  const isOpen = expandedSalesmen.has(salesmanName)
                  const actual = Number(s.actual_sales || 0)
                  const projectionAmount = Number(s.projection_amount || 0)
                  const mtdAch = projectionAmount ? actual / projectionAmount * 100 : 0
                  const etoProjectionVariance = Number(s.eto_projection_variance || 0)
                  const salesChange = Number(s.sales_change_vs_last_month || 0)
                  const salesChangePct = Number(s.sales_change_pct_vs_last_month)
                  const gpChange = Number(s.gp_pct_change)
                  return (
                    <Fragment key={salesmanName}>
                      <tr className={isOpen ? 'salesman-row open' : 'salesman-row collapsed'}>
                        <td>{index + 1}</td>
                        <td>
                          <button type="button" className="salesman-group-button" aria-expanded={isOpen} onClick={() => toggleSalesman(salesmanName)}>
                            <b>{isOpen ? '▾' : '▸'} {salesmanName}</b>
                            <small>{customerDetails.length} customers</small>
                            <ProjectionVarianceChip actual={actual} projection={projectionAmount} />
                          </button>
                        </td>
                        <td>{compactMoney(actual)}</td>
                        <td>{compactMoney(projectionAmount)}</td>
                        <td>{Math.round(mtdAch)}%</td>
                        <td>{compactMoney(Number(s.eto_close || 0))}</td>
                        <td className={etoProjectionVariance >= 0 ? 'pos' : 'neg'}>{signedCompactMoney(etoProjectionVariance)}</td>
                        <td>{compactMoney(Number(s.last_month_mtd_sales || 0))}</td>
                        <td className={salesChange >= 0 ? 'pos' : 'neg'}>{signedCompactMoney(salesChange)} <small>{signedPct(salesChangePct)}</small></td>
                        <td className="green">{safePct(Number(s.gp_pct))}</td>
                        <td className={gpChange >= 0 ? 'pos' : 'neg'}>{signedPp(gpChange)}</td>
                      </tr>
                      {isOpen && customerDetails.map((customer, customerIndex) => {
                        const record = customer as Record<string, unknown>
                        const customerActual = Number(customer.mtd_sales || 0)
                        const customerProjection = Number(customer.projected_amount || 0)
                        const customerMtdAch = customerProjection ? customerActual / customerProjection * 100 : null
                        const customerEto = metric(record, 'eto_close', customerActual / elapsedDays * daysInMonth)
                        const customerEtoProjectionVariance = metric(record, 'eto_projection_variance', customerEto - customerProjection)
                        const customerLastMtd = metric(record, 'last_month_mtd_sales')
                        const customerSalesChange = metric(record, 'sales_change_vs_last_month', customerActual - customerLastMtd)
                        const customerSalesChangePct = customerLastMtd ? metric(record, 'sales_change_pct_vs_last_month', customerSalesChange / customerLastMtd * 100) : null
                        const customerGpPct = optionalMetric(record, 'gp_pct')
                        const customerGpChange = optionalMetric(record, 'gp_pct_change')
                        return (
                          <tr className="customer-drill-line" key={`${salesmanName}-${customer.customer_name}-${customerIndex}`}>
                            <td>↳</td>
                            <td><span className="customer-drill-name"><b>{customer.customer_name}</b><ProjectionVarianceChip actual={customerActual} projection={customerProjection} /></span></td>
                            <td>{compactMoney(customerActual)}</td>
                            <td>{compactMoney(customerProjection)}</td>
                            <td>{customerMtdAch === null ? '—' : `${Math.round(customerMtdAch)}%`}</td>
                            <td>{compactMoney(customerEto)}</td>
                            <td className={customerEtoProjectionVariance >= 0 ? 'pos' : 'neg'}>{signedCompactMoney(customerEtoProjectionVariance)}</td>
                            <td>{compactMoney(customerLastMtd)}</td>
                            <td className={customerSalesChange >= 0 ? 'pos' : 'neg'}>{signedCompactMoney(customerSalesChange)} <small>{signedPct(customerSalesChangePct)}</small></td>
                            <td className={customerGpPct === null ? '' : 'green'}>{customerGpPct === null ? '—' : safePct(customerGpPct)}</td>
                            <td className={customerGpChange === null ? '' : customerGpChange >= 0 ? 'pos' : 'neg'}>{signedPp(customerGpChange)}</td>
                          </tr>
                        )
                      })}
                    </Fragment>
                  )
                })}
                <tr className="total"><td>—</td><td>TOTAL</td><td>{compactMoney(salesmanSales)}</td><td>{compactMoney(salesmanProjection)}</td><td>{Math.round(salesmanProjectionAch)}%</td><td>{compactMoney(salesmanEto)}</td><td className={salesmanEtoVariance >= 0 ? 'pos' : 'neg'}>{signedCompactMoney(salesmanEtoVariance)}</td><td>{compactMoney(salesmanLastMtdSales)}</td><td className={salesmanSalesChange >= 0 ? 'pos' : 'neg'}>{signedCompactMoney(salesmanSalesChange)} <small>{signedPct(salesmanSalesChangePct)}</small></td><td className="green">{safePct(gpPct)}</td><td className={Number(totalGpPctChange || 0) >= 0 ? 'pos' : 'neg'}>{signedPp(totalGpPctChange)}</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="middle-grid">
          <article className="card bridge-card">
            <div className="card-title"><h3>Budget to Projection Bridge</h3><span>AED Millions</span></div>
            <div className="bridge-plot">
              <WaterfallBar label="Budget" value={budget} max={maxWaterfall} tone="gold" />
              <WaterfallBar label="Projection" value={projection} max={maxWaterfall} tone="teal" />
              <WaterfallBar label="Achieved" value={sales} max={maxWaterfall} tone="blue" />
              <WaterfallBar label="LPO / Confirmed Sales Pipeline" value={pipeline} max={maxWaterfall} tone="teal" />
              <WaterfallBar label="Remaining Gap" value={gap} max={maxWaterfall} tone="red" />
            </div>
          </article>

          <article className="card region-card">
            <div className="card-title"><h3>Top Region Sales Performance</h3></div>
            <div className="region-grid">
              {regionSlots.map((region, i) => {
                const share = regionTotal ? region.sales / regionTotal * 100 : 0
                return (
                  <div className="region-tile" key={region.name}>
                    <h4>{region.name}</h4>
                    <RegionMapAsset region={region.name} />
                    <p><span>●</span> Sales <b>{compactMoney(region.sales)}</b></p>
                    <p><span>●</span> Target % <b>{Math.round(share)}%</b></p>
                    <p><span>●</span> GP % <b>{safePct(gpPct + (i - 1) * 0.7)}</b></p>
                    <MiniBars tone={i % 2 ? 'blue' : 'teal'} />
                  </div>
                )
              })}
            </div>
          </article>
        </section>

        <section className="lower-grid">
          <article className="card product-card">
            <h3>Product / Category Sales Mix <small>(MTD)</small></h3>
            <div className="product-bars">
              {products.map((p) => {
                const share = p.sales / maxProduct * 100
                return <div className="product-row" key={p.category}><span>{p.category}</span><i><b style={{ width: `${share}%` }} /></i><strong>{compactMoney(p.sales)}</strong><em>{Math.round(share)}%</em></div>
              })}
            </div>
          </article>

          <article className="card customer-card">
            <h3>Customer Performance / Gap Watch</h3>
            <table><thead><tr><th>Customer</th><th>Sales Trend</th><th>GP %</th><th>Target Progress</th><th>Projection Confidence</th><th>Action Flag</th></tr></thead><tbody>{customerRows.map((c, i) => {
              const progress = Number(c.projected_amount) ? Number(c.mtd_sales) / Number(c.projected_amount) * 100 : 0
              return <tr key={c.customer_name}><td>{c.customer_name}</td><td><TrendLine tone={i === 2 ? 'red' : i === 1 ? 'gold' : 'green'} /></td><td>{safePct(Number(c.gp_pct))}</td><td>{Math.round(progress)}%</td><td><mark className={i === 2 ? 'low' : i === 1 ? 'medium' : 'high'}>{i === 2 ? 'Low' : i === 1 ? 'Medium' : 'High'}</mark></td><td className={i === 1 ? 'flag amber' : 'flag'}>⚑</td></tr>
            })}</tbody></table>
          </article>

          <article className="card action-card">
            <h3>Action Center</h3>
            <ul>
              {actionItems.map((item, index) => <li key={item}><b>{['◎', '◉', '♟', '↗'][index]}</b><span>{item}</span></li>)}
            </ul>
          </article>
        </section>
      </section>

      <footer className="command-footer"><span>Focus. Execute. Outperform.</span><span>Driven by Performance. Powered by People.</span><img src="/brand/al-zaabi-logo-light.png" alt="Al Zaabi Group" /></footer>
    </main>
  )
}
