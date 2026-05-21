'use client'

import { useMemo, useState } from 'react'
import { dashboardData } from '../../lib/dashboard-data'
import {
  compactMoney,
  safePct,
  signedCompactMoney,
  signedPct,
  signedPp,
} from '../../lib/format'
import { Icon } from '../components/Icon'
import { Initials } from '../components/Initials'
import { CardOptions } from '../components/CardOptions'
import { SidebarToggle } from '../components/DashboardShell'

type SortKey = 'mtd' | 'projection' | 'achievement' | 'eto' | 'gp' | 'growth'

export default function SalesmanPage() {
  const data = dashboardData
  const ctx = data.context
  const [sortKey, setSortKey] = useState<SortKey>('mtd')

  const salesmen = useMemo(() => (
    [...data.salesman_leaderboard].filter((s) => Number(s.projection_amount || 0) > 0)
  ), [data])

  const sorted = useMemo(() => {
    const arr = [...salesmen]
    arr.sort((a, b) => {
      switch (sortKey) {
        case 'mtd': return Number(b.actual_sales || 0) - Number(a.actual_sales || 0)
        case 'projection': return Number(b.projection_amount || 0) - Number(a.projection_amount || 0)
        case 'achievement': return Number(b.projection_achievement_pct || 0) - Number(a.projection_achievement_pct || 0)
        case 'eto': return Number(b.eto_projection_variance || 0) - Number(a.eto_projection_variance || 0)
        case 'gp': return Number(b.gp_pct || 0) - Number(a.gp_pct || 0)
        case 'growth': return Number(b.sales_change_pct_vs_last_month || 0) - Number(a.sales_change_pct_vs_last_month || 0)
      }
    })
    return arr
  }, [salesmen, sortKey])

  const totalMtd = salesmen.reduce((s, x) => s + Number(x.actual_sales || 0), 0)
  const totalProj = salesmen.reduce((s, x) => s + Number(x.projection_amount || 0), 0)
  const totalEto = salesmen.reduce((s, x) => s + Number(x.eto_close || 0), 0)
  const totalGp = salesmen.reduce((s, x) => s + Number(x.gross_profit || 0), 0)
  const totalCostedRev = salesmen.reduce((s, x) => s + Number(x.costed_revenue || 0), 0)
  const blendedGpPct = totalCostedRev ? (totalGp / totalCostedRev) * 100 : 0
  const onTrack = salesmen.filter((s) => Number(s.eto_projection_variance || 0) >= 0).length
  const ahead = salesmen.filter((s) => Number(s.projection_achievement_pct || 0) >= 100).length

  // Best / worst
  const topByProjPct = [...salesmen].sort((a, b) => Number(b.projection_achievement_pct || 0) - Number(a.projection_achievement_pct || 0))[0]
  const worstByEto = [...salesmen].sort((a, b) => Number(a.eto_projection_variance || 0) - Number(b.eto_projection_variance || 0))[0]
  const bestGrowth = [...salesmen].sort((a, b) => Number(b.sales_change_pct_vs_last_month || 0) - Number(a.sales_change_pct_vs_last_month || 0))[0]
  const bestGp = [...salesmen].sort((a, b) => Number(b.gp_pct || 0) - Number(a.gp_pct || 0))[0]

  // Customer count per salesman from customer_top
  const customersBySalesman = new Map<string, number>()
  for (const c of data.customer_top) {
    const key = String(c.salesman || '').toUpperCase()
    if (!key) continue
    customersBySalesman.set(key, (customersBySalesman.get(key) || 0) + 1)
  }

  return (
    <>
      <header className="top-ribbon">
        <div className="dashboard-greeting">
          <SidebarToggle />
          <div className="greeting-text">
            <span>Automotive Division</span>
            <h1>Salesman Performance</h1>
            <p>Per-salesman leaderboard, achievement bench and growth signals <b className="ui-version-pill">{salesmen.length} active</b></p>
          </div>
        </div>
        <div className="top-control-cluster">
          <label className="global-search"><Icon name="search" size={15} /> <em>Search salesman&hellip;</em></label>
          <div className="filter-row">
            <button><Icon name="calendar" size={14} /> May 1 – May {ctx.day_of_month}</button>
            <button><Icon name="pin" size={14} /> All Regions</button>
            <button><Icon name="layers" size={14} /> All Categories</button>
            <button className="export"><Icon name="refresh" size={14} /> Refresh</button>
          </div>
          <button className="ai-pill" type="button"><Icon name="sparkle" size={14} /> Ask Titan</button>
        </div>
      </header>

      {/* Hero KPIs */}
      <section className="kpi-grid">
        <article className="kpi-card">
          <div className="kpi-icon blue"><Icon name="user" size={20} /></div>
          <div className="kpi-content">
            <p>Active Salesmen</p>
            <strong>{salesmen.length}</strong>
            <div className="kpi-foot"><span>Customer accounts</span><b>{data.customer_top.length}</b></div>
          </div>
        </article>
        <article className="kpi-card">
          <div className="kpi-icon green"><Icon name="badge" size={20} /></div>
          <div className="kpi-content">
            <p>On Track</p>
            <strong>{onTrack}<em style={{ fontStyle: 'normal', fontSize: '13px', fontWeight: 700, color: 'var(--muted)' }}>/{salesmen.length}</em></strong>
            <div className="kpi-foot"><span>Ahead of Projection</span><b className="good">{ahead}</b></div>
          </div>
        </article>
        <article className="kpi-card">
          <div className="kpi-icon teal"><Icon name="bills" size={20} /></div>
          <div className="kpi-content">
            <p>Combined MTD</p>
            <strong>{compactMoney(totalMtd)}</strong>
            <div className="kpi-foot"><span>vs Projection</span><b className={totalMtd >= totalProj ? 'good' : 'bad'}>{signedPct((totalMtd / totalProj - 1) * 100)}</b></div>
          </div>
        </article>
        <article className="kpi-card">
          <div className="kpi-icon gold"><Icon name="trend" size={20} /></div>
          <div className="kpi-content">
            <p>Combined ETO Close</p>
            <strong>{compactMoney(totalEto)}</strong>
            <div className="kpi-foot"><span>Projection</span><b>{compactMoney(totalProj)}</b></div>
          </div>
        </article>
        <article className="kpi-card">
          <div className="kpi-icon ink"><Icon name="dollar" size={20} /></div>
          <div className="kpi-content">
            <p>Combined GP</p>
            <strong>{compactMoney(totalGp)}</strong>
            <div className="kpi-foot"><span>Blended GP %</span><b>{safePct(blendedGpPct)}</b></div>
          </div>
        </article>
        <article className="kpi-card">
          <div className="kpi-icon red"><Icon name="shield" size={20} /></div>
          <div className="kpi-content">
            <p>Largest Shortfall</p>
            <strong>{compactMoney(Math.abs(Number(worstByEto?.eto_projection_variance || 0)))}</strong>
            <div className="kpi-foot"><span>{String(worstByEto?.salesman || '—')}</span><b className="bad">ETO vs Proj</b></div>
          </div>
        </article>
      </section>

      {/* AI insights ribbon */}
      <section className="ai-insights-row">
        <div className="ai-ribbon-head">
          <span className="ai-dot"><Icon name="sparkle" size={11} /></span>
          <h2>Titan Salesman Insights — May Highlights</h2>
          <CardOptions label="AI insights" />
        </div>
        <div className="ai-insights-grid">
          <article className="ai-card good">
            <header><span><Icon name="badge" size={14} /></span><p>Best Achievement</p></header>
            <strong>{topByProjPct?.salesman || '—'}</strong>
            <small>{Math.round(Number(topByProjPct?.projection_achievement_pct || 0))}% of projection · {compactMoney(Number(topByProjPct?.actual_sales || 0))} MTD</small>
          </article>
          <article className="ai-card neutral">
            <header><span><Icon name="trend" size={14} /></span><p>Top Growth (MoM)</p></header>
            <strong>{bestGrowth?.salesman || '—'}</strong>
            <small>{signedPct(Number(bestGrowth?.sales_change_pct_vs_last_month || 0))} vs same-day last month</small>
          </article>
          <article className="ai-card warning">
            <header><span><Icon name="percent" size={14} /></span><p>Best Margin</p></header>
            <strong>{bestGp?.salesman || '—'}</strong>
            <small>{safePct(Number(bestGp?.gp_pct || 0))} GP · {compactMoney(Number(bestGp?.gross_profit || 0))} profit</small>
          </article>
          <article className="ai-card bad">
            <header><span><Icon name="shield" size={14} /></span><p>Watchlist</p></header>
            <strong>{worstByEto?.salesman || '—'}</strong>
            <small>Short by {compactMoney(Math.abs(Number(worstByEto?.eto_projection_variance || 0)))} vs projection</small>
          </article>
        </div>
      </section>

      {/* Sort controls */}
      <section className="card salesman-deep-card">
        <div className="card-title">
          <div>
            <h3>Salesman Deep-Dive</h3>
            <small>Sort by metric — full month-to-date snapshot per salesman</small>
          </div>
          <div className="sort-controls">
            {([
              ['mtd', 'MTD'],
              ['projection', 'Projection'],
              ['achievement', 'Achievement %'],
              ['eto', 'ETO Variance'],
              ['gp', 'GP %'],
              ['growth', 'Growth'],
            ] as [SortKey, string][]).map(([k, label]) => (
              <button key={k} type="button" className={sortKey === k ? 'active' : ''} onClick={() => setSortKey(k)}>{label}</button>
            ))}
            <CardOptions label="Salesman deep-dive" />
          </div>
        </div>
        <div className="deep-list">
          {sorted.map((s, i) => {
            const name = String(s.salesman)
            const mtd = Number(s.actual_sales || 0)
            const proj = Number(s.projection_amount || 0)
            const ach = proj ? (mtd / proj) * 100 : 0
            const etoVar = Number(s.eto_projection_variance || 0)
            const eto = Number(s.eto_close || 0)
            const growth = Number(s.sales_change_pct_vs_last_month || 0)
            const gpPct = Number(s.gp_pct || 0)
            const gpDelta = Number(s.gp_pct_change || 0)
            const custCount = customersBySalesman.get(name.toUpperCase()) || 0
            return (
              <article key={name} className={`deep-row ${etoVar >= 0 ? 'pos' : 'neg'}`}>
                <div className="deep-rank">#{i + 1}</div>
                <div className="deep-id">
                  <Initials name={name} />
                  <div>
                    <strong>{name}</strong>
                    <small>{custCount} customers · projection {compactMoney(proj)}</small>
                  </div>
                </div>
                <div className="deep-metrics">
                  <div className="deep-cell">
                    <small>MTD</small>
                    <strong>{compactMoney(mtd)}</strong>
                    <em className={growth >= 0 ? 'pos' : 'neg'}>{signedPct(growth)}</em>
                  </div>
                  <div className="deep-cell">
                    <small>ETO Close</small>
                    <strong>{compactMoney(eto)}</strong>
                    <em className={etoVar >= 0 ? 'pos' : 'neg'}>{signedCompactMoney(etoVar)}</em>
                  </div>
                  <div className="deep-cell">
                    <small>Achievement</small>
                    <strong>{ach.toFixed(0)}%</strong>
                    <em>{Math.min(ach, 999).toFixed(0)} pp</em>
                  </div>
                  <div className="deep-cell">
                    <small>GP %</small>
                    <strong>{safePct(gpPct)}</strong>
                    <em className={gpDelta >= 0 ? 'pos' : 'neg'}>{signedPp(gpDelta)}</em>
                  </div>
                </div>
                <div className="deep-meter">
                  <div className="meter-track">
                    <i className="meter-fill ach" style={{ width: `${Math.min(ach, 100)}%` }} />
                  </div>
                  <small>{ach.toFixed(0)}% of projection</small>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}
