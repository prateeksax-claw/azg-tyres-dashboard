import type { CSSProperties } from 'react'
import { dashboardData, money, pct } from '../lib/dashboard-data'

type Tone = 'brand' | 'blue' | 'green' | 'amber' | 'red' | 'gold' | 'cyan' | 'dark'

function toneFor(value: number, good = 75, warn = 45): Tone {
  if (value >= good) return 'green'
  if (value >= warn) return 'amber'
  return 'red'
}

function StatCard({ label, value, caption, tone = 'blue' }: { label: string; value: string; caption: string; tone?: Tone }) {
  return (
    <article className={`stat-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{caption}</small>
    </article>
  )
}

function RunwayBar({ label, value, target, tone = 'brand' }: { label: string; value: number; target: number; tone?: Tone }) {
  const percent = target > 0 ? value / target * 100 : 0
  return (
    <div className="runway-row">
      <div>
        <span>{label}</span>
        <strong>{money(value)}</strong>
      </div>
      <div className="runway-track">
        <i className={tone} style={{ width: `${Math.min(Math.max(percent, 2), 100)}%` }} />
      </div>
      <b>{pct(percent)}</b>
    </div>
  )
}

function MiniBar({ value, max, tone = 'brand' }: { value: number; max: number; tone?: Tone }) {
  return (
    <i className="mini-bar">
      <b className={tone} style={{ width: `${Math.min(Math.max(max ? value / max * 100 : 0, 3), 100)}%` }} />
    </i>
  )
}

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <span className={`badge ${tone}`}>{children}</span>
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
  const budgetAchievement = budget > 0 ? actualSales / budget * 100 : 0
  const projectionAchievement = projection > 0 ? actualSales / projection * 100 : 0
  const committedCoverage = budget > 0 ? (actualSales + pipeline) / budget * 100 : 0

  const topSalesmen = [...data.salesman_leaderboard]
    .sort((a, b) => Number(b.actual_sales || 0) - Number(a.actual_sales || 0))
    .slice(0, 6)
  const maxSalesmanSales = Math.max(...topSalesmen.map((row) => Number(row.actual_sales || 0)), 1)

  const regionTotal = data.region_current.reduce((sum, row) => sum + Number(row.revenue_ex_vat || 0), 0)
  const topProducts = data.product_mix_top.slice(0, 7)
  const maxProduct = Math.max(...topProducts.map((row) => Number(row.revenue_ex_vat || 0)), 1)

  const projectionWatch = [...data.customer_top]
    .filter((row) => Number(row.projected_amount || 0) > 0)
    .sort((a, b) => Number(b.expectation_amount || 0) - Number(a.expectation_amount || 0))
    .slice(0, 5)

  const marginWatch = data.gp_alerts_top.slice(0, 4)
  const topCustomers = data.customer_top.slice(0, 5)

  return (
    <div className="dashboard-shell">
      <aside className="command-rail">
        <div className="rail-logo">
          <img src="/brand/al-zaabi-logo-light.png" alt="Al Zaabi Group" />
          <span>TYRES DIVISION</span>
        </div>
        <nav aria-label="Dashboard sections">
          {['Command', 'Targets', 'Region', 'Salesman', 'Product', 'Customer', 'GP', 'Projection'].map((item, idx) => (
            <a href="#" className={idx === 0 ? 'active' : ''} key={item}>
              <span>{['🏁', '🎯', '🗺️', '👥', '🛞', '🏢', '💰', '📈'][idx]}</span>
              {item}
            </a>
          ))}
        </nav>
        <div className="rail-footer">
          <img src="/brand/al-zaabi-tyre-icon.png" alt="Tyres" />
          <strong>Executive sales cockpit</strong>
          <small>Sales · GP · Targets · Projection</small>
        </div>
      </aside>

      <main className="command-page">
        <header className="command-header">
          <div className="header-brand">
            <img src="/brand/al-zaabi-logo-dark.png" alt="Al Zaabi Group" />
            <div>
              <p>Al Zaabi Group</p>
              <h1>Tyres Executive Command</h1>
            </div>
          </div>
          <div className="header-actions">
            <span>{ctx.month_key}</span>
            <span>As of {ctx.as_of_date}</span>
            <span>All Regions</span>
            <button>Export</button>
          </div>
        </header>

        <section className="hero-command">
          <div className="hero-copy">
            <Badge tone={toneFor(budgetAchievement)}>Budget achievement {pct(budgetAchievement)}</Badge>
            <h2>{money(actualSales)} sales with {pct(gp.gp_pct)} GP</h2>
            <p>
              Budget gap is <strong>{money(budgetGap)}</strong>. Projection achievement is <strong>{pct(projectionAchievement)}</strong>, with <strong>{money(pipeline)}</strong> in LPO / confirmed sales pipeline.
            </p>
            <div className="hero-pills">
              <span>Required pace <b>{money(dailyRequired)}/day</b></span>
              <span>{ctx.days_remaining_month} days left</span>
              <span>Committed coverage <b>{pct(committedCoverage)}</b></span>
            </div>
          </div>
          <div className="hero-gauge" style={{ '--meter': `${Math.min(Math.max(budgetAchievement, 0), 100)}%` } as CSSProperties}>
            <div>
              <strong>{pct(budgetAchievement)}</strong>
              <span>of budget</span>
            </div>
          </div>
        </section>

        <section className="stat-strip">
          <StatCard label="MTD Sales" value={money(actualSales)} caption="Ex-VAT billing" tone="green" />
          <StatCard label="Gross Profit" value={money(gp.gross_profit)} caption={`GP ${pct(gp.gp_pct)}`} tone="gold" />
          <StatCard label="Budget Gap" value={money(budgetGap)} caption="Remaining to official target" tone="red" />
          <StatCard label="Projection Gap" value={money(projectionGap)} caption="Customer-wise planning gap" tone="amber" />
          <StatCard label="Sales Pipeline" value={money(pipeline)} caption="LPO + confirmed" tone="blue" />
          <StatCard label="Daily Pace" value={money(dailyRequired)} caption="Required run-rate" tone="brand" />
        </section>

        <section className="command-grid command-grid-primary">
          <article className="board-card target-runway">
            <div className="section-head">
              <div>
                <p>Target runway</p>
                <h3>How far we are from the month target</h3>
              </div>
              <Badge tone="brand">Sales focus</Badge>
            </div>
            <RunwayBar label="Actual vs Budget" value={actualSales} target={budget} tone="brand" />
            <RunwayBar label="Actual vs Projection" value={actualSales} target={projection} tone="gold" />
            <RunwayBar label="Committed vs Budget" value={actualSales + pipeline} target={budget} tone="blue" />
            <div className="runway-callout">
              <strong>{money(dailyRequired)}</strong>
              <span>daily sales pace needed to close official budget gap</span>
            </div>
          </article>

          <article className="board-card sales-bridge-card">
            <div className="section-head">
              <div>
                <p>Sales bridge</p>
                <h3>Budget → achieved → committed → gap</h3>
              </div>
            </div>
            <div className="sales-bridge">
              <div className="bridge-node budget"><span>Budget</span><strong>{money(budget)}</strong></div>
              <div className="bridge-node achieved"><span>Achieved</span><strong>{money(actualSales)}</strong></div>
              <div className="bridge-node pipeline"><span>Pipeline</span><strong>{money(pipeline)}</strong></div>
              <div className="bridge-node gap"><span>Open Gap</span><strong>{money(budgetGap)}</strong></div>
            </div>
          </article>
        </section>

        <section className="command-grid command-grid-secondary">
          <article className="board-card region-card">
            <div className="section-head">
              <div>
                <p>Region sales pulse</p>
                <h3>Contribution by market</h3>
              </div>
            </div>
            <div className="region-tile-grid">
              {data.region_current.map((region) => {
                const share = regionTotal ? Number(region.revenue_ex_vat) / regionTotal * 100 : 0
                return (
                  <div className="region-tile" key={region.region}>
                    <span>{region.region}</span>
                    <strong>{money(region.revenue_ex_vat)}</strong>
                    <small>{pct(share)} share · {region.active_customers} customers</small>
                    <MiniBar value={share} max={100} tone="brand" />
                  </div>
                )
              })}
            </div>
          </article>

          <article className="board-card product-card">
            <div className="section-head">
              <div>
                <p>Product / category mix</p>
                <h3>Where the sales are coming from</h3>
              </div>
            </div>
            <div className="mix-list">
              {topProducts.map((product) => (
                <div className="mix-row" key={`${product.product_group}-${product.product}`}>
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
        </section>

        <section className="board-card salesman-command-card">
          <div className="section-head">
            <div>
              <p>Salesman command matrix</p>
              <h3>Sales, achievement, GP%, and gap by owner</h3>
            </div>
            <Badge tone="blue">Top 6 by sales</Badge>
          </div>
          <div className="salesman-card-grid">
            {topSalesmen.map((row) => {
              const ach = Number(row.budget_achievement_pct || 0)
              return (
                <article className="salesman-card" key={row.salesman}>
                  <div className="salesman-topline">
                    <strong>{row.salesman}</strong>
                    <Badge tone={toneFor(ach)}>{pct(ach)}</Badge>
                  </div>
                  <b>{money(row.actual_sales)}</b>
                  <MiniBar value={Number(row.actual_sales)} max={maxSalesmanSales} tone="blue" />
                  <div className="salesman-metrics">
                    <span>GP {pct(row.gp_pct)}</span>
                    <span>Gap {money(row.budget_shortfall)}</span>
                    <span>Pace {money(row.required_daily_run_rate)}</span>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="command-grid command-grid-lower">
          <article className="board-card watch-card">
            <div className="section-head">
              <div>
                <p>Customer projection watch</p>
                <h3>Largest sales gaps to close</h3>
              </div>
            </div>
            <div className="watch-list">
              {projectionWatch.map((row) => {
                const achieved = Number(row.projected_amount) ? Number(row.mtd_sales) / Number(row.projected_amount) * 100 : 0
                return (
                  <div className="watch-row" key={`${row.salesman}-${row.customer_name}`}>
                    <div>
                      <strong>{row.customer_name}</strong>
                      <small>{row.salesman} · GP {pct(row.gp_pct)}</small>
                    </div>
                    <span>{money(row.expectation_amount)}</span>
                    <MiniBar value={achieved} max={100} tone={toneFor(achieved)} />
                  </div>
                )
              })}
            </div>
          </article>

          <article className="board-card watch-card">
            <div className="section-head">
              <div>
                <p>GP watch</p>
                <h3>Margin leakage requiring review</h3>
              </div>
            </div>
            <div className="watch-list compact">
              {marginWatch.map((row) => (
                <div className="watch-row" key={`${row.customer_name}-${row.product}`}>
                  <div>
                    <strong>{row.customer_name}</strong>
                    <small>{row.product_group} · {row.salesman}</small>
                  </div>
                  <span>{pct(row.gp_pct)}</span>
                  <Badge tone={Number(row.gp_pct) < 0 ? 'red' : 'amber'}>{row.alert_type}</Badge>
                </div>
              ))}
            </div>
          </article>

          <article className="board-card customer-rank-card">
            <div className="section-head">
              <div>
                <p>Top customer sales</p>
                <h3>Clean contribution view</h3>
              </div>
            </div>
            <div className="customer-rank-list">
              {topCustomers.map((row, index) => (
                <div className="rank-row" key={`${row.customer_name}-${row.salesman}`}>
                  <em>{index + 1}</em>
                  <div>
                    <strong>{row.customer_name}</strong>
                    <small>{row.salesman} · GP {pct(row.gp_pct)}</small>
                  </div>
                  <span>{money(row.mtd_sales)}</span>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}
