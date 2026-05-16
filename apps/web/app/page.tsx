import type { CSSProperties } from 'react'
import { dashboardData, money, pct } from '../lib/dashboard-data'

type Tone = 'brand' | 'dark' | 'blue' | 'green' | 'amber' | 'red' | 'gold' | 'cyan'

type Kpi = {
  label: string
  value: string
  sub: string
  icon: string
  tone: Tone
}

function perfTone(value: number): Tone {
  if (value >= 80) return 'green'
  if (value >= 50) return 'amber'
  return 'red'
}

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <span className={`badge ${tone}`}>{children}</span>
}

function KpiTile({ item }: { item: Kpi }) {
  return (
    <article className={`kpi-tile ${item.tone}`}>
      <div className="kpi-icon">{item.icon}</div>
      <span>{item.label}</span>
      <strong>{item.value}</strong>
      <small>{item.sub}</small>
    </article>
  )
}

function MiniBar({ value, max, tone = 'brand' }: { value: number; max: number; tone?: Tone }) {
  const pctValue = max > 0 ? value / max * 100 : 0
  return (
    <i className="mini-bar">
      <b className={tone} style={{ width: `${Math.min(Math.max(pctValue, 3), 100)}%` }} />
    </i>
  )
}

function WaterfallBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: Tone }) {
  const height = Math.max(max > 0 ? value / max * 220 : 40, 42)
  return (
    <div className="waterfall-item">
      <span>{money(value)}</span>
      <div className={`waterfall-bar ${tone}`} style={{ height }} />
      <small>{label}</small>
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
  const waterfallMax = Math.max(budget, projection, actualSales + pipeline, budgetGap, 1)

  const regionTotal = data.region_current.reduce((sum, row) => sum + Number(row.revenue_ex_vat || 0), 0)
  const topProducts = data.product_mix_top.slice(0, 6)
  const maxProduct = Math.max(...topProducts.map((row) => Number(row.revenue_ex_vat || 0)), 1)
  const topSalesmen = [...data.salesman_leaderboard]
    .sort((a, b) => Number(b.actual_sales || 0) - Number(a.actual_sales || 0))
    .slice(0, 7)
  const maxSalesman = Math.max(...topSalesmen.map((row) => Number(row.actual_sales || 0)), 1)
  const customerWatch = [...data.customer_top]
    .filter((row) => Number(row.projected_amount || 0) > 0)
    .sort((a, b) => Number(b.expectation_amount || 0) - Number(a.expectation_amount || 0))
    .slice(0, 6)
  const gpWatch = data.gp_alerts_top.slice(0, 5)

  const kpis: Kpi[] = [
    { label: 'MTD Sales', value: money(actualSales), sub: 'current month billing', icon: '↗', tone: 'green' },
    { label: 'Budget Ach.', value: pct(budgetAchievement), sub: `${money(budget)} target`, icon: '◎', tone: perfTone(budgetAchievement) },
    { label: 'GP %', value: pct(gp.gp_pct), sub: `${money(gp.gross_profit)} gross profit`, icon: '◇', tone: 'gold' },
    { label: 'Projection Ach.', value: pct(projectionAchievement), sub: `${money(projection)} projection`, icon: '◌', tone: perfTone(projectionAchievement) },
    { label: 'Sales Pipeline', value: money(pipeline), sub: 'LPO + confirmed', icon: '▰', tone: 'blue' },
    { label: 'Daily Pace', value: money(dailyRequired), sub: `${ctx.days_remaining_month} days remaining`, icon: '⚑', tone: 'brand' },
  ]

  return (
    <div className="azg-screen">
      <aside className="azg-sidebar">
        <div className="azg-logo-block">
          <img src="/brand/al-zaabi-logo-light.png" alt="Al Zaabi Group" />
          <p>TYRES DIVISION</p>
        </div>
        <nav>
          {['Executive Command', 'Sales & Targets', 'Region Analysis', 'Salesman View', 'Product Mix', 'Customer Watch', 'GP & Margin', 'Projection Control'].map((item, index) => (
            <a href="#" className={index === 0 ? 'active' : ''} key={item}>
              <span>{['🏁', '🎯', '🗺️', '👥', '🛞', '🏢', '💰', '📈'][index]}</span>
              {item}
            </a>
          ))}
        </nav>
        <div className="sidebar-signature">
          <img src="/brand/al-zaabi-tyre-icon.png" alt="Tyres" />
          <strong>Focus. Execute. Outperform.</strong>
          <small>Sales · GP · Target · Projection</small>
        </div>
      </aside>

      <main className="azg-main">
        <header className="azg-header">
          <div className="header-title">
            <img src="/brand/al-zaabi-logo-dark.png" alt="Al Zaabi Group" />
            <div>
              <p>Executive Command Center</p>
              <h1>Tyres Sales Performance</h1>
            </div>
          </div>
          <div className="header-filters">
            <span>{ctx.month_key}</span>
            <span>As of {ctx.as_of_date}</span>
            <span>All Regions</span>
            <button>Export</button>
          </div>
        </header>

        <section className="command-hero">
          <div className="hero-left">
            <Badge tone={perfTone(budgetAchievement)}>Budget achievement {pct(budgetAchievement)}</Badge>
            <h2>{money(actualSales)} Sales</h2>
            <div className="hero-metrics">
              <div>
                <span>GP</span>
                <strong>{pct(gp.gp_pct)}</strong>
                <small>{money(gp.gross_profit)}</small>
              </div>
              <div>
                <span>Budget Gap</span>
                <strong>{money(budgetGap)}</strong>
                <small>{money(dailyRequired)} / day</small>
              </div>
              <div>
                <span>Projection</span>
                <strong>{pct(projectionAchievement)}</strong>
                <small>{money(projectionGap)} gap</small>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="big-gauge" style={{ '--meter': `${Math.min(Math.max(budgetAchievement, 0), 100)}%` } as CSSProperties}>
              <div>
                <strong>{pct(budgetAchievement)}</strong>
                <span>Budget</span>
              </div>
            </div>
            <div className="coverage-card">
              <span>Committed Coverage</span>
              <strong>{pct(coverage)}</strong>
              <small>Actual + LPO/confirmed vs budget</small>
            </div>
          </div>
        </section>

        <section className="kpi-row">
          {kpis.map((item) => <KpiTile item={item} key={item.label} />)}
        </section>

        <section className="dashboard-grid primary-grid">
          <article className="panel-card region-performance">
            <div className="panel-head">
              <div>
                <p>Region sales performance</p>
                <h3>Market contribution and customer activity</h3>
              </div>
              <Badge tone="brand">Regional pulse</Badge>
            </div>
            <div className="region-map-grid">
              {data.region_current.map((region, index) => {
                const share = regionTotal ? Number(region.revenue_ex_vat) / regionTotal * 100 : 0
                return (
                  <div className="region-map-card" key={region.region}>
                    <div className={`map-blob blob-${index}`} />
                    <div>
                      <span>{region.region}</span>
                      <strong>{money(region.revenue_ex_vat)}</strong>
                      <small>{pct(share)} sales share · {region.active_customers} customers</small>
                      <MiniBar value={share} max={100} tone={perfTone(share)} />
                    </div>
                  </div>
                )
              })}
            </div>
          </article>

          <article className="panel-card bridge-performance">
            <div className="panel-head">
              <div>
                <p>Budget to projection bridge</p>
                <h3>Where the month stands now</h3>
              </div>
            </div>
            <div className="waterfall">
              <WaterfallBar label="Budget" value={budget} max={waterfallMax} tone="dark" />
              <WaterfallBar label="Projection" value={projection} max={waterfallMax} tone="gold" />
              <WaterfallBar label="Achieved" value={actualSales} max={waterfallMax} tone="green" />
              <WaterfallBar label="Pipeline" value={pipeline} max={waterfallMax} tone="blue" />
              <WaterfallBar label="Gap" value={budgetGap} max={waterfallMax} tone="brand" />
            </div>
          </article>
        </section>

        <section className="dashboard-grid insight-grid">
          <article className="panel-card product-panel">
            <div className="panel-head compact">
              <div><p>Product mix</p><h3>Top sales groups</h3></div>
            </div>
            <div className="stack-list">
              {topProducts.map((product) => (
                <div className="stack-row" key={`${product.product_group}-${product.product}`}>
                  <div>
                    <strong>{product.product_group}</strong>
                    <small>{product.derived_category} · GP {pct(product.gp_pct)}</small>
                  </div>
                  <span>{money(product.revenue_ex_vat)}</span>
                  <MiniBar value={Number(product.revenue_ex_vat)} max={maxProduct} tone="gold" />
                </div>
              ))}
            </div>
          </article>

          <article className="panel-card salesman-panel">
            <div className="panel-head compact">
              <div><p>Salesman command</p><h3>Owner performance</h3></div>
            </div>
            <div className="salesman-list">
              {topSalesmen.map((row) => (
                <div className="salesman-row" key={row.salesman}>
                  <div className="avatar">{row.salesman.replace('SM-', '')}</div>
                  <div>
                    <strong>{row.salesman}</strong>
                    <small>{pct(row.budget_achievement_pct)} target · GP {pct(row.gp_pct)}</small>
                    <MiniBar value={Number(row.actual_sales)} max={maxSalesman} tone="blue" />
                  </div>
                  <span>{money(row.actual_sales)}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel-card customer-panel">
            <div className="panel-head compact">
              <div><p>Customer watch</p><h3>Projection gaps</h3></div>
            </div>
            <div className="stack-list">
              {customerWatch.map((row) => {
                const achieved = Number(row.projected_amount) ? Number(row.mtd_sales) / Number(row.projected_amount) * 100 : 0
                return (
                  <div className="stack-row" key={`${row.salesman}-${row.customer_name}`}>
                    <div>
                      <strong>{row.customer_name}</strong>
                      <small>{row.salesman} · {pct(achieved)} projection</small>
                    </div>
                    <span>{money(row.expectation_amount)}</span>
                    <MiniBar value={achieved} max={100} tone={perfTone(achieved)} />
                  </div>
                )
              })}
            </div>
          </article>

          <article className="panel-card action-panel">
            <div className="panel-head compact">
              <div><p>Sales / GP actions</p><h3>Priority watchlist</h3></div>
            </div>
            <div className="action-list">
              {gpWatch.map((row, index) => (
                <div className="action-row" key={`${row.customer_name}-${row.product_group}`}>
                  <em>{index + 1}</em>
                  <div>
                    <strong>{row.alert_type}</strong>
                    <small>{row.customer_name} · {row.product_group}</small>
                  </div>
                  <Badge tone={Number(row.gp_pct) < 0 ? 'red' : 'amber'}>{pct(row.gp_pct)}</Badge>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}
