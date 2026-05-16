import { dashboardData, money, pct } from '../lib/dashboard-data'

type Tone = 'brand' | 'ink' | 'blue' | 'green' | 'amber' | 'red' | 'gold' | 'cyan'

type Kpi = {
  label: string
  value: string
  sub: string
  tone: Tone
  trend: number[]
}

function toneFor(value: number): Tone {
  if (value >= 80) return 'green'
  if (value >= 50) return 'amber'
  return 'red'
}

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <span className={`v4-badge ${tone}`}>{children}</span>
}

function Sparkline({ values, tone }: { values: number[]; tone: Tone }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const points = values.map((value, index) => {
    const x = index * (120 / (values.length - 1))
    const y = 34 - ((value - min) / Math.max(max - min, 1)) * 28
    return `${x},${y}`
  }).join(' ')
  return (
    <svg className={`spark ${tone}`} viewBox="0 0 120 40" aria-hidden="true">
      <polyline points={points} fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Gauge({ value }: { value: number }) {
  const clamped = Math.min(Math.max(value, 0), 100)
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const dash = circumference * clamped / 100
  return (
    <div className="v4-gauge">
      <svg viewBox="0 0 110 110" aria-hidden="true">
        <circle cx="55" cy="55" r={radius} className="track" />
        <circle cx="55" cy="55" r={radius} className="meter" strokeDasharray={`${dash} ${circumference - dash}`} />
      </svg>
      <div><strong>{pct(value)}</strong><span>Budget</span></div>
    </div>
  )
}

function KpiCard({ item }: { item: Kpi }) {
  return (
    <article className={`v4-kpi ${item.tone}`}>
      <div className="v4-kpi-head"><span>{item.label}</span><i /></div>
      <strong>{item.value}</strong>
      <small>{item.sub}</small>
      <Sparkline values={item.trend} tone={item.tone} />
    </article>
  )
}

function MiniBar({ value, max, tone = 'brand' }: { value: number; max: number; tone?: Tone }) {
  const width = Math.min(Math.max(max > 0 ? value / max * 100 : 0, 3), 100)
  return <i className="v4-mini"><b className={tone} style={{ width: `${width}%` }} /></i>
}

function Waterfall({ bars }: { bars: { label: string; value: number; tone: Tone }[] }) {
  const max = Math.max(...bars.map((bar) => bar.value), 1)
  return (
    <div className="v4-waterfall">
      {bars.map((bar) => (
        <div className="v4-waterfall-col" key={bar.label}>
          <span>{money(bar.value)}</span>
          <div className={`v4-waterfall-bar ${bar.tone}`} style={{ height: `${Math.max(bar.value / max * 220, 46)}px` }} />
          <small>{bar.label}</small>
        </div>
      ))}
    </div>
  )
}

export default function Page() {
  const data = dashboardData
  const ctx = data.context
  const bridge = data.command_center.shortfall_bridge
  const gp = data.command_center.gp_mtd

  const actualSales = Number(bridge.actual_sales || 0)
  const budget = Number(bridge.budget_amount || 0)
  const projection = Number(bridge.projected_amount || 0)
  const pipeline = Number(bridge.lpo_amount || 0) + Number(bridge.confirmed_amount || 0)
  const budgetGap = Number(bridge.shortfall_to_budget || 0)
  const projectionGap = Number(bridge.shortfall_to_projection || 0)
  const dailyRequired = Number(bridge.daily_required_for_budget || 0)
  const budgetAchievement = budget ? actualSales / budget * 100 : 0
  const projectionAchievement = projection ? actualSales / projection * 100 : 0
  const coverage = budget ? (actualSales + pipeline) / budget * 100 : 0

  const regionTotal = data.region_current.reduce((sum, row) => sum + Number(row.revenue_ex_vat || 0), 0)
  const topRegions = data.region_current.slice(0, 3)
  const topProducts = data.product_mix_top.slice(0, 5)
  const maxProduct = Math.max(...topProducts.map((row) => Number(row.revenue_ex_vat || 0)), 1)
  const topSalesmen = [...data.salesman_leaderboard]
    .sort((a, b) => Number(b.actual_sales || 0) - Number(a.actual_sales || 0))
    .slice(0, 5)
  const maxSalesman = Math.max(...topSalesmen.map((row) => Number(row.actual_sales || 0)), 1)
  const customerWatch = [...data.customer_top]
    .filter((row) => Number(row.projected_amount || 0) > 0)
    .sort((a, b) => Number(b.expectation_amount || 0) - Number(a.expectation_amount || 0))
    .slice(0, 5)
  const gpWatch = data.gp_alerts_top.slice(0, 4)

  const kpis: Kpi[] = [
    { label: 'MTD Sales', value: money(actualSales), sub: 'Current month sales', tone: 'green', trend: [18, 28, 24, 36, 41, 55, 62] },
    { label: 'Budget Ach.', value: pct(budgetAchievement), sub: `${money(budget)} target`, tone: toneFor(budgetAchievement), trend: [10, 16, 22, 24, 29, 31, 33] },
    { label: 'GP %', value: pct(gp.gp_pct), sub: `${money(gp.gross_profit)} GP`, tone: 'gold', trend: [20, 21, 19, 23, 22, 24, 22] },
    { label: 'Projection Ach.', value: pct(projectionAchievement), sub: `${money(projectionGap)} gap`, tone: toneFor(projectionAchievement), trend: [14, 19, 25, 28, 32, 35, 38] },
    { label: 'Sales Pipeline', value: money(pipeline), sub: 'LPO + confirmed', tone: 'blue', trend: [20, 25, 31, 30, 39, 44, 48] },
    { label: 'Daily Run Rate', value: money(dailyRequired), sub: `${ctx.days_remaining_month} days left`, tone: 'brand', trend: [70, 66, 61, 57, 52, 49, 45] },
  ]

  return (
    <div className="v4-shell">
      <aside className="v4-sidebar">
        <div className="v4-logo">
          <img src="/brand/al-zaabi-logo-light.png" alt="Al Zaabi Group" />
          <span>TYRES DIVISION</span>
        </div>
        <nav>
          {['Executive Command', 'Sales & Targets', 'Region Analysis', 'Salesman View', 'Product Mix', 'Customer Watch', 'GP & Margin', 'Projection Control'].map((item, index) => (
            <a href="#" className={index === 0 ? 'active' : ''} key={item}>
              <span>{['🏁', '🎯', '🗺️', '👥', '🛞', '🏢', '💰', '📈'][index]}</span>{item}
            </a>
          ))}
        </nav>
        <div className="v4-sidebar-card">
          <img src="/brand/al-zaabi-tyre-icon.png" alt="Tyres" />
          <strong>Executive sales cockpit</strong>
          <small>Sales · GP · Targets · Projection</small>
        </div>
      </aside>

      <main className="v4-main">
        <header className="v4-header">
          <div className="v4-title">
            <img src="/brand/al-zaabi-logo-dark.png" alt="Al Zaabi Group" />
            <div><p>Executive Command Center</p><h1>Tyres Sales Performance</h1></div>
          </div>
          <div className="v4-filters"><span>{ctx.month_key}</span><span>As of {ctx.as_of_date}</span><span>All Regions</span><button>Export</button></div>
        </header>

        <section className="v4-hero-card">
          <div className="v4-hero-top">
            <div><Badge tone={toneFor(budgetAchievement)}>Budget achievement {pct(budgetAchievement)}</Badge><h2>Command view for sales target closure</h2></div>
            <Gauge value={budgetAchievement} />
          </div>
          <div className="v4-hero-metrics">
            <article><span>MTD Sales</span><strong>{money(actualSales)}</strong><small>Ex-VAT sales through current date</small></article>
            <article><span>GP Performance</span><strong>{pct(gp.gp_pct)}</strong><small>{money(gp.gross_profit)} gross profit</small></article>
            <article className="risk"><span>Budget Gap</span><strong>{money(budgetGap)}</strong><small>{money(dailyRequired)} daily sales run-rate needed</small></article>
          </div>
          <div className="v4-coverage"><span>Committed Coverage</span><MiniBar value={coverage} max={100} tone={toneFor(coverage)} /><strong>{pct(coverage)}</strong><small>Actual sales + LPO / confirmed pipeline vs budget</small></div>
        </section>

        <section className="v4-kpi-strip">{kpis.map((item) => <KpiCard item={item} key={item.label} />)}</section>

        <section className="v4-grid v4-grid-main">
          <article className="v4-card v4-bridge-card">
            <div className="v4-card-head"><div><p>Budget to projection bridge</p><h3>Where the month stands now</h3></div><Badge tone="brand">Sales runway</Badge></div>
            <Waterfall bars={[{ label: 'Budget', value: budget, tone: 'ink' }, { label: 'Projection', value: projection, tone: 'gold' }, { label: 'Achieved', value: actualSales, tone: 'green' }, { label: 'Pipeline', value: pipeline, tone: 'blue' }, { label: 'Gap', value: budgetGap, tone: 'brand' }]} />
          </article>

          <article className="v4-card v4-region-card">
            <div className="v4-card-head"><div><p>Region sales performance</p><h3>Market contribution and activity</h3></div></div>
            <div className="v4-region-list">
              {topRegions.map((region, index) => {
                const share = regionTotal ? Number(region.revenue_ex_vat) / regionTotal * 100 : 0
                return <div className="v4-region" key={region.region}><div className={`v4-map map-${index}`} /><div><span>{region.region}</span><strong>{money(region.revenue_ex_vat)}</strong><small>{pct(share)} sales share · {region.active_customers} customers</small><MiniBar value={share} max={100} tone={toneFor(share)} /></div></div>
              })}
            </div>
          </article>
        </section>

        <section className="v4-grid v4-grid-lower">
          <article className="v4-card"><div className="v4-card-head compact"><div><p>Product mix</p><h3>Top sales groups</h3></div></div><div className="v4-list">{topProducts.map((product) => <div className="v4-row" key={product.product_group}><div><strong>{product.product_group}</strong><small>{product.derived_category} · GP {pct(product.gp_pct)}</small></div><span>{money(product.revenue_ex_vat)}</span><MiniBar value={Number(product.revenue_ex_vat)} max={maxProduct} tone="gold" /></div>)}</div></article>
          <article className="v4-card"><div className="v4-card-head compact"><div><p>Salesman command</p><h3>Owner performance</h3></div></div><div className="v4-list">{topSalesmen.map((row) => <div className="v4-owner" key={row.salesman}><em>{row.salesman.replace('SM-', '')}</em><div><strong>{row.salesman}</strong><small>{pct(row.budget_achievement_pct)} target · GP {pct(row.gp_pct)}</small><MiniBar value={Number(row.actual_sales)} max={maxSalesman} tone="blue" /></div><span>{money(row.actual_sales)}</span></div>)}</div></article>
          <article className="v4-card"><div className="v4-card-head compact"><div><p>Customer watch</p><h3>Projection gaps</h3></div></div><div className="v4-list">{customerWatch.map((row) => { const achieved = Number(row.projected_amount) ? Number(row.mtd_sales) / Number(row.projected_amount) * 100 : 0; return <div className="v4-row" key={`${row.salesman}-${row.customer_name}`}><div><strong>{row.customer_name}</strong><small>{row.salesman} · {pct(achieved)} projection</small></div><span>{money(row.expectation_amount)}</span><MiniBar value={achieved} max={100} tone={toneFor(achieved)} /></div> })}</div></article>
          <article className="v4-card"><div className="v4-card-head compact"><div><p>GP watch</p><h3>Margin leakage</h3></div></div><div className="v4-list">{gpWatch.map((row, index) => <div className="v4-action" key={`${row.customer_name}-${row.product_group}`}><em>{index + 1}</em><div><strong>{row.alert_type}</strong><small>{row.customer_name} · {row.product_group}</small></div><Badge tone={Number(row.gp_pct) < 0 ? 'red' : 'amber'}>{pct(row.gp_pct)}</Badge></div>)}</div></article>
        </section>
      </main>
    </div>
  )
}
