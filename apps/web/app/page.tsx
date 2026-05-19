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
  const data = dashboardData
  const ctx = data.context
  const bridge = data.command_center.shortfall_bridge
  const gp = data.command_center.gp_mtd

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
    .map((s) => {
      const actual = Number(s.actual_sales || 0)
      const budgetAmount = Number(s.budget_amount || 0)
      const etoClose = actual / elapsedDays * daysInMonth
      return {
        ...s,
        eto_close: etoClose,
        eto_achievement_pct: budgetAmount ? etoClose / budgetAmount * 100 : 0,
        eto_variance: etoClose - budgetAmount,
      }
    })
    .sort((a, b) => Number(b.actual_sales || 0) - Number(a.actual_sales || 0))
    .slice(0, 5)
  const customerRows = [...data.customer_top]
    .filter((row) => Number(row.projected_amount || 0) > 0)
    .sort((a, b) => Number(b.projected_amount || 0) - Number(a.projected_amount || 0))
    .slice(0, 3)
  const largestEtoRisk = [...salesmen].sort((a, b) => Number(a.eto_variance || 0) - Number(b.eto_variance || 0))[0]
  const projectionWatch = [...data.customer_top]
    .filter((row) => Number(row.projected_amount || 0) > 0)
    .map((row) => ({ ...row, progress: Number(row.mtd_sales || 0) / Math.max(Number(row.projected_amount || 0), 1) * 100 }))
    .sort((a, b) => a.progress - b.progress)[0]
  const gpLeak = [...data.gp_alerts_top].sort((a, b) => Number(a.gp_pct || 0) - Number(b.gp_pct || 0))[0]
  const actionItems = [
    `Trend closing ETO: ${compactMoney(eto)} (${signedCompactMoney(etoVariance)} vs budget)`,
    `${largestEtoRisk?.salesman || 'Top owner'}: ETO risk ${signedCompactMoney(Number(largestEtoRisk?.eto_variance || 0))} vs budget`,
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
          {['Executive Command', 'Sales & Targets', 'Region', 'Salesman', 'Product Mix', 'Customer 360', 'GP & Margin', 'Projection', 'Action Center'].map((item, i) => (
            <a className={i === 0 ? 'active' : ''} href="#" key={item}><span>{['◴','◎','◌','♙','▱','♧','%','▥','☑'][i]}</span>{item}</a>
          ))}
        </nav>
        <div className="side-update"><i>◷</i><span>Last Updated</span><b>{ctx.as_of_date} 09:30 AM</b></div>
        <div className="tyre-graphic" aria-hidden="true" />
      </aside>

      <section className="command-canvas">
        <header className="top-ribbon">
          <h1>Al Zaabi Group — Tyres Division Executive Command Center</h1>
          <div className="filter-row">
            <button>▣ May 1 – May {ctx.day_of_month}</button><button>May 2026</button><button>All Regions</button><button>All Salesmen</button><label>Search Customer... <span>⌕</span></label><button className="export">⇩ Export</button>
          </div>
        </header>

        <section className="headline-panel">
          <div className="headline-numbers">
            <h2>MTD Sales <b>{compactMoney(sales)}</b></h2>
            <i />
            <h2>GP <b>{safePct(gpPct)}</b></h2>
            <i />
            <h2>ETO Close <b>{compactMoney(eto)}</b></h2>
          </div>
          <div className="achievement-donut" style={{ background: `conic-gradient(#ef3340 0 ${gauge * 2.45}deg, #16a3c7 ${gauge * 2.45}deg ${gauge * 3.6}deg, #e8e8e8 0)` }}><span>ETO vs<br />Budget</span><strong>{Math.round(etoAch)}%</strong></div>
          <div className="legend-box"><p><i className="gold" /> Budget <b>{compactMoney(budget)}</b></p><p><i className="teal" /> MTD Sales <b>{compactMoney(sales)}</b></p><p><i className="red" /> ETO Var. <b>{signedCompactMoney(etoVariance)}</b></p></div>
        </section>

        <section className="kpi-grid">{kpis.map((item) => <KpiCard key={item.label} item={item} />)}</section>

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

          <article className="card salesman-card">
            <h3>Salesman Performance</h3>
            <table><thead><tr><th>Salesman</th><th>Actual</th><th>Budget</th><th>ETO Close</th><th>ETO%</th><th>GP %</th></tr></thead><tbody>{salesmen.map((s) => <tr key={s.salesman}><td>{s.salesman}</td><td>{compactMoney(Number(s.actual_sales))}</td><td>{compactMoney(Number(s.budget_amount))}</td><td>{compactMoney(Number(s.eto_close))}</td><td><mark>{Math.round(Number(s.eto_achievement_pct))}%</mark></td><td className="green">{safePct(Number(s.gp_pct))}</td></tr>)}<tr className="total"><td>TOTAL</td><td>{compactMoney(sales)}</td><td>{compactMoney(budget)}</td><td>{compactMoney(eto)}</td><td>{Math.round(etoAch)}%</td><td>{safePct(gpPct)}</td></tr></tbody></table>
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
