import type { CSSProperties } from 'react'
import { dashboardData, money, pct } from '../lib/dashboard-data'

type Tone = 'blue' | 'green' | 'amber' | 'red' | 'gold' | 'cyan' | 'brand'

type SalesAction = {
  severity: number
  issue: string
  owner: string
  subject: string
  impact: number
  action: string
}

function KpiCard({ title, value, subtitle, tone = 'blue' }: { title: string; value: string; subtitle: string; tone?: Tone }) {
  return (
    <section className={`kpi-card ${tone}`}>
      <div className="kpi-label">{title}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-subtitle">{subtitle}</div>
    </section>
  )
}

function SeverityBadge({ value }: { value: number }) {
  return <span className={`severity severity-${value}`}>{value}</span>
}

function ProgressBar({ value, tone = 'blue' }: { value: number; tone?: 'blue' | 'gold' | 'green' | 'red' }) {
  return (
    <i className={`progress ${tone}`}>
      <b style={{ width: `${Math.min(Math.max(value, 3), 100)}%` }} />
    </i>
  )
}

export default function Page() {
  const data = dashboardData
  const ctx = data.context
  const bridge = data.command_center.shortfall_bridge
  const gp = data.command_center.gp_mtd
  const achievement = Number(bridge.actual_sales) / Number(bridge.budget_amount) * 100
  const projectionAchievement = Number(bridge.actual_sales) / Number(bridge.projected_amount) * 100
  const pipeline = Number(bridge.lpo_amount) + Number(bridge.confirmed_amount)

  const topSalesmen = data.salesman_leaderboard.slice(0, 9)
  const topProducts = data.product_mix_top.slice(0, 8)
  const customerWatch = [...data.customer_top]
    .filter((row) => Number(row.projected_amount || 0) > 0)
    .sort((a, b) => Number(b.expectation_amount || 0) - Number(a.expectation_amount || 0))
    .slice(0, 8)
  const topGrowthCustomers = data.customer_top.slice(0, 6)
  const gpAlerts = data.gp_alerts_top.slice(0, 5)

  const maxSales = Math.max(...topSalesmen.map((row) => Number(row.actual_sales || 0)), 1)
  const maxProduct = Math.max(...topProducts.map((row) => Number(row.revenue_ex_vat || 0)), 1)

  const salesActions: SalesAction[] = [
    ...[...topSalesmen]
      .sort((a, b) => Number(b.budget_shortfall || 0) - Number(a.budget_shortfall || 0))
      .slice(0, 4)
      .map((row) => ({
        severity: Number(row.budget_shortfall) > 500000 ? 5 : Number(row.budget_shortfall) > 250000 ? 4 : 3,
        issue: 'Budget shortfall',
        owner: row.salesman,
        subject: 'Sales run-rate',
        impact: Number(row.budget_shortfall || 0),
        action: `Needs ${money(row.required_daily_run_rate)} daily billing pace`,
      })),
    ...customerWatch.slice(0, 4).map((row) => ({
      severity: Number(row.expectation_amount) > 100000 ? 5 : 4,
      issue: 'Projection gap',
      owner: row.salesman,
      subject: row.customer_name,
      impact: Number(row.expectation_amount || 0),
      action: 'Lock LPO / confirmed billing date',
    })),
    ...gpAlerts.slice(0, 4).map((row) => ({
      severity: Number(row.severity || 3),
      issue: row.alert_type,
      owner: row.salesman,
      subject: `${row.customer_name} · ${row.product_group}`,
      impact: Math.abs(Number(row.gross_profit || row.costed_revenue || 0)),
      action: 'Review pricing and GP leakage',
    })),
  ].slice(0, 10)

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <img src="/brand/al-zaabi-logo-light.png" alt="Al Zaabi Group" />
          <span>Tyres Division</span>
        </div>
        <nav className="nav-list" aria-label="Dashboard sections">
          {['Executive Command', 'Sales & Targets', 'Region', 'Salesman', 'Product Mix', 'Customer 360', 'GP & Margin', 'Projection', 'Action Center'].map((item, index) => (
            <a key={item} className={index === 0 ? 'active' : ''} href="#">
              <span>{['🏁', '📈', '🗺️', '👥', '🛞', '🏢', '💰', '🎯', '⚡'][index]}</span>
              {item}
            </a>
          ))}
        </nav>
        <div className="side-card">
          <img src="/brand/al-zaabi-tyre-icon.png" alt="Tyres" />
          <strong>Sales + GP cockpit</strong>
          <small>Targets, projection and margin command view</small>
        </div>
      </aside>

      <main className="main-canvas">
        <header className="topbar">
          <div className="title-lockup">
            <img src="/brand/al-zaabi-logo-dark.png" alt="Al Zaabi Group" />
            <div>
              <p className="eyebrow">Tyres Division Dashboard</p>
              <h1>Executive Command Center</h1>
            </div>
          </div>
          <div className="filter-row">
            <span>As of {ctx.as_of_date}</span>
            <span>{ctx.month_key}</span>
            <span>All Regions</span>
            <span>All Salesmen</span>
          </div>
        </header>

        <section className="verdict-card">
          <div className="verdict-copy">
            <p className="eyebrow inverse">Management verdict</p>
            <h2>
              Sales <strong>{money(bridge.actual_sales)}</strong> · GP <strong>{pct(gp.gp_pct)}</strong> · Budget gap <strong>{money(bridge.shortfall_to_budget)}</strong>
            </h2>
            <p>
              Projection achievement is {pct(projectionAchievement)} with {money(pipeline)} in LPO/confirmed sales pipeline. Required sales run-rate is {money(bridge.daily_required_for_budget)} per day for the remaining {ctx.days_remaining_month} days.
            </p>
          </div>
          <div className="verdict-meter" style={{ '--meter': `${Math.min(Math.max(achievement, 0), 100)}%` } as CSSProperties}>
            <span>{pct(achievement)}</span>
            <small>Budget achievement</small>
          </div>
        </section>

        <section className="kpi-grid">
          <KpiCard title="MTD Sales" value={money(bridge.actual_sales)} subtitle="Ex-VAT billing through as-of date" tone="green" />
          <KpiCard title="Budget Achievement" value={pct(achievement)} subtitle={`Budget ${money(bridge.budget_amount)}`} tone="brand" />
          <KpiCard title="GP %" value={pct(gp.gp_pct)} subtitle={`Gross profit ${money(gp.gross_profit)}`} tone="gold" />
          <KpiCard title="Projection Achievement" value={pct(projectionAchievement)} subtitle={`Projection ${money(bridge.projected_amount)}`} tone="cyan" />
          <KpiCard title="Sales Pipeline" value={money(pipeline)} subtitle="LPO + confirmed sales only" tone="blue" />
          <KpiCard title="Daily Sales Required" value={money(bridge.daily_required_for_budget)} subtitle={`${ctx.days_remaining_month} days remaining`} tone="red" />
        </section>

        <section className="content-grid top-grid">
          <div className="panel bridge-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Sales shortfall bridge</p>
                <h3>Budget → projection → achieved → pipeline → gap</h3>
              </div>
              <span className="status-pill danger">Action required</span>
            </div>
            <div className="bridge-chart">
              <div className="bridge-step budget"><small>Budget</small><strong>{money(bridge.budget_amount)}</strong></div>
              <div className="bridge-step projection"><small>Projection</small><strong>{money(bridge.projected_amount)}</strong></div>
              <div className="bridge-step achieved"><small>Achieved</small><strong>{money(bridge.actual_sales)}</strong></div>
              <div className="bridge-step pipeline"><small>LPO + Confirmed</small><strong>{money(pipeline)}</strong></div>
              <div className="bridge-step gap"><small>Remaining Gap</small><strong>{money(bridge.shortfall_to_budget)}</strong></div>
            </div>
          </div>

          <div className="panel insight-panel">
            <p className="eyebrow">Region sales pulse</p>
            <div className="region-list">
              {data.region_current.map((region) => (
                <div className="region-pill" key={region.region}>
                  <span>{region.region}</span>
                  <strong>{money(region.revenue_ex_vat)}</strong>
                  <small>{region.active_customers} active customers</small>
                </div>
              ))}
            </div>
            <p className="eyebrow product-heading">Product / category mix</p>
            <div className="product-list">
              {topProducts.map((product) => (
                <div className="product-row" key={`${product.product_group}-${product.product}`}>
                  <div>
                    <strong>{product.product_group}</strong>
                    <small>{product.derived_category} · GP {pct(product.gp_pct)}</small>
                  </div>
                  <span>{money(product.revenue_ex_vat)}</span>
                  <ProgressBar tone="gold" value={Number(product.revenue_ex_vat) / maxProduct * 100} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="wide-scroll-section">
          <div className="panel leaderboard-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Salesman performance</p>
                <h3>Actual sales, target achievement, GP%, and shortfall</h3>
              </div>
              <span className="status-pill">Top owners</span>
            </div>
            <div className="table-wrap">
              <table className="leaderboard">
                <thead><tr><th>Salesman</th><th>Actual Sales</th><th>Budget</th><th>Ach%</th><th>GP%</th><th>Shortfall</th><th>Daily Required</th></tr></thead>
                <tbody>
                  {topSalesmen.map((row) => (
                    <tr key={row.salesman}>
                      <td><strong>{row.salesman}</strong><ProgressBar value={Number(row.actual_sales) / maxSales * 100} /></td>
                      <td>{money(row.actual_sales)}</td>
                      <td>{money(row.budget_amount)}</td>
                      <td>{pct(row.budget_achievement_pct)}</td>
                      <td>{pct(row.gp_pct)}</td>
                      <td>{money(row.budget_shortfall)}</td>
                      <td>{money(row.required_daily_run_rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="content-grid lower-grid">
          <div className="panel customer-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Customer performance watch</p>
                <h3>Projection gaps and low-GP watchlist</h3>
              </div>
            </div>
            <div className="customer-watch-list">
              {customerWatch.map((row) => {
                const achieved = Number(row.projected_amount) > 0 ? Number(row.mtd_sales) / Number(row.projected_amount) * 100 : 0
                return (
                  <div className="customer-card" key={`${row.salesman}-${row.customer_name}`}>
                    <div>
                      <strong>{row.customer_name}</strong>
                      <small>{row.salesman} · GP {pct(row.gp_pct)}</small>
                    </div>
                    <div className="customer-metrics">
                      <span>{money(row.mtd_sales)} sales</span>
                      <span>{money(row.projected_amount)} projection</span>
                      <span>{money(row.expectation_amount)} gap</span>
                    </div>
                    <ProgressBar tone={achieved >= 70 ? 'green' : achieved >= 35 ? 'gold' : 'red'} value={achieved} />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="panel action-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Sales / GP action center</p>
                <h3>Priority actions for closing target gap</h3>
              </div>
            </div>
            <table className="actions-table">
              <thead><tr><th>Sev</th><th>Issue</th><th>Owner</th><th>Subject</th><th>Impact</th></tr></thead>
              <tbody>
                {salesActions.map((row, idx) => (
                  <tr key={`${row.issue}-${row.owner}-${idx}`}>
                    <td><SeverityBadge value={row.severity} /></td>
                    <td><strong>{row.issue}</strong><span>{row.action}</span></td>
                    <td>{row.owner}</td>
                    <td>{row.subject}</td>
                    <td>{money(row.impact)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel growth-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Top customer sales contribution</p>
              <h3>Clean customer view for management drilldown</h3>
            </div>
          </div>
          <div className="growth-grid">
            {topGrowthCustomers.map((row) => (
              <div className="growth-card" key={`${row.salesman}-${row.customer_name}`}>
                <span>{row.salesman}</span>
                <strong>{row.customer_name}</strong>
                <b>{money(row.mtd_sales)}</b>
                <small>GP {pct(row.gp_pct)} · Projection {money(row.projected_amount)}</small>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
