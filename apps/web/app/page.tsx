import { dashboardData, money, pct } from '../lib/dashboard-data'

type Tone = 'blue' | 'green' | 'amber' | 'red' | 'gold' | 'cyan'

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

export default function Page() {
  const data = dashboardData
  const ctx = data.context
  const bridge = data.command_center.shortfall_bridge
  const gp = data.command_center.gp_mtd
  const collections = data.command_center.collections_mtd
  const ar = data.command_center.ar_current
  const achievement = Number(bridge.actual_sales) / Number(bridge.budget_amount) * 100
  const topSalesmen = data.salesman_leaderboard.slice(0, 9)
  const topProducts = data.product_mix_top.slice(0, 8)
  const topActions = data.action_center_top.slice(0, 12)
  const maxSales = Math.max(...topSalesmen.map((row) => Number(row.actual_sales || 0)), 1)
  const maxProduct = Math.max(...topProducts.map((row) => Number(row.revenue_ex_vat || 0)), 1)

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">AZ</div>
          <div>
            <strong>Tyres Cockpit</strong>
            <span>Al Zaabi Automotive</span>
          </div>
        </div>
        <nav className="nav-list" aria-label="Dashboard sections">
          {['Executive Command', 'Sales & Targets', 'Region / Branch', 'Salesman', 'Product Mix', 'Customer 360', 'GP & Margin', 'Collections', 'Projection', 'Action Center'].map((item, index) => (
            <a key={item} className={index === 0 ? 'active' : ''} href="#">
              <span>{['🏁', '📈', '🗺️', '👥', '🛞', '🏢', '💰', '🏦', '🎯', '⚡'][index]}</span>
              {item}
            </a>
          ))}
        </nav>
      </aside>

      <main className="main-canvas">
        <header className="topbar">
          <div>
            <p className="eyebrow">Tyres Division Dashboard</p>
            <h1>Executive Command Center</h1>
          </div>
          <div className="filter-row">
            <span>As of {ctx.as_of_date}</span>
            <span>{ctx.month_key}</span>
            <span>All Regions</span>
          </div>
        </header>

        <section className="verdict-card">
          <div>
            <p className="eyebrow inverse">Management verdict</p>
            <h2>
              MTD sales are <strong>{money(bridge.actual_sales)}</strong>; budget shortfall is <strong>{money(bridge.shortfall_to_budget)}</strong>.
            </h2>
            <p>
              Required run-rate is {money(bridge.daily_required_for_budget)} per day. GP is {pct(gp.gp_pct)}, bank receipts are {money(collections.bank_receipts)}, and open expectation remains {money(bridge.expectation_amount)}.
            </p>
          </div>
          <div className="verdict-meter">
            <span>{pct(achievement)}</span>
            <small>Budget achievement</small>
          </div>
        </section>

        <section className="kpi-grid">
          <KpiCard title="MTD Sales" value={money(bridge.actual_sales)} subtitle="Ex-VAT billing through as-of date" tone="green" />
          <KpiCard title="Budget Achievement" value={pct(achievement)} subtitle={`Budget ${money(bridge.budget_amount)}`} tone="amber" />
          <KpiCard title="GP %" value={pct(gp.gp_pct)} subtitle={`GP ${money(gp.gross_profit)}`} tone="gold" />
          <KpiCard title="Bank Receipts" value={money(collections.bank_receipts)} subtitle={`Journals ${money(collections.journal_adjustments)}`} tone="blue" />
          <KpiCard title="Overdue" value={money(ar.overdue_amount)} subtitle={`Outstanding ${money(ar.outstanding_amount)}`} tone="red" />
          <KpiCard title="Daily Required" value={money(bridge.daily_required_for_budget)} subtitle={`${ctx.days_remaining_month} days remaining`} tone="red" />
        </section>

        <section className="content-grid">
          <div className="panel bridge-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Shortfall bridge</p>
                <h3>Budget → projection → achieved → pipeline → gap</h3>
              </div>
            </div>
            <div className="bridge-chart">
              <div className="bridge-step budget"><small>Budget</small><strong>{money(bridge.budget_amount)}</strong></div>
              <div className="bridge-step projection"><small>Projection</small><strong>{money(bridge.projected_amount)}</strong></div>
              <div className="bridge-step achieved"><small>Achieved</small><strong>{money(bridge.actual_sales)}</strong></div>
              <div className="bridge-step pipeline"><small>LPO + Confirmed</small><strong>{money(Number(bridge.lpo_amount) + Number(bridge.confirmed_amount))}</strong></div>
              <div className="bridge-step gap"><small>Budget Gap</small><strong>{money(bridge.shortfall_to_budget)}</strong></div>
            </div>
          </div>

          <div className="panel">
            <p className="eyebrow">Region pulse</p>
            <div className="region-list">
              {data.region_current.map((region) => (
                <div className="region-pill" key={region.region}>
                  <span>{region.region}</span>
                  <strong>{money(region.revenue_ex_vat)}</strong>
                  <small>{region.active_customers} customers</small>
                </div>
              ))}
            </div>
            <p className="eyebrow product-heading">Top product groups</p>
            <div className="product-list">
              {topProducts.map((product) => (
                <div className="product-row" key={`${product.product_group}-${product.product}`}>
                  <div>
                    <strong>{product.product_group}</strong>
                    <small>{product.derived_category} · {product.product}</small>
                  </div>
                  <span>{money(product.revenue_ex_vat)}</span>
                  <i><b style={{ width: `${Math.max(Number(product.revenue_ex_vat) / maxProduct * 100, 3)}%` }} /></i>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <p className="eyebrow">Salesman leaderboard</p>
            <table className="leaderboard">
              <thead><tr><th>Salesman</th><th>Actual</th><th>Ach%</th><th>Shortfall</th><th>GP%</th></tr></thead>
              <tbody>
                {topSalesmen.map((row) => (
                  <tr key={row.salesman}>
                    <td><strong>{row.salesman}</strong><i><b style={{ width: `${Math.max(Number(row.actual_sales) / maxSales * 100, 3)}%` }} /></i></td>
                    <td>{money(row.actual_sales)}</td>
                    <td>{pct(row.budget_achievement_pct)}</td>
                    <td>{money(row.budget_shortfall)}</td>
                    <td>{pct(row.gp_pct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <p className="eyebrow">Priority action center</p>
            <table className="actions-table">
              <thead><tr><th>Sev</th><th>Issue</th><th>Owner</th><th>Customer</th><th>Impact</th></tr></thead>
              <tbody>
                {topActions.map((row, idx) => (
                  <tr key={`${row.issue_type}-${row.owner}-${idx}`}>
                    <td><SeverityBadge value={Number(row.severity)} /></td>
                    <td><strong>{row.issue_type}</strong><span>{row.recommended_action}</span></td>
                    <td>{row.owner}</td>
                    <td>{row.customer_name ?? '—'}</td>
                    <td>{money(row.impact_aed)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
