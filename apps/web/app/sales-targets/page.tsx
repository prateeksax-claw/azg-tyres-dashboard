'use client'

import { useMemo, useState } from 'react'
import { dashboardData } from '../../lib/dashboard-data'
import { computeEto } from '../../lib/eto'
import {
  compactMoney,
  formatMonthLabel,
  safePct,
  signedCompactMoney,
  signedPct,
} from '../../lib/format'
import { Icon } from '../components/Icon'
import { Initials } from '../components/Initials'
import { CardOptions } from '../components/CardOptions'
import { SidebarToggle } from '../components/DashboardShell'

export default function SalesTargetsPage() {
  const data = dashboardData
  const ctx = data.context
  const bridge = data.command_center.shortfall_bridge
  const monthName = new Date(`${ctx.month_start}T00:00:00+04:00`).toLocaleString('en-GB', { month: 'long', timeZone: 'Asia/Dubai' })
  const monthShort = new Date(`${ctx.month_start}T00:00:00+04:00`).toLocaleString('en-GB', { month: 'short', timeZone: 'Asia/Dubai' })

  const sales = Number(bridge.actual_sales || 0)
  const projection = Number(bridge.projected_amount || 0)
  const lpo = Number(bridge.lpo_amount || 0)
  const confirmed = Number(bridge.confirmed_amount || 0)
  const pipeline = lpo + confirmed
  const projectionGap = Number(bridge.shortfall_to_projection || 0)
  const elapsedDays = Math.max(Number(ctx.day_of_month || 0), 1)
  const daysInMonth = Math.max(Number(ctx.days_in_month || elapsedDays), elapsedDays)
  const daysRemaining = Number(ctx.days_remaining_month || 0)
  const dailyTrend = sales / elapsedDays
  const etoCalc = computeEto(data)
  const eto = etoCalc.eto
  const projectionAch = projection ? (sales / projection) * 100 : 0
  const etoAch = projection ? (eto / projection) * 100 : 0
  const requiredDaily = Number(bridge.daily_required_for_projection || 0)

  const salesmen = useMemo(() => (
    [...data.salesman_leaderboard]
      .filter((s) => Number(s.projection_amount || 0) > 0)
      .sort((a, b) => Number(b.projection_amount || 0) - Number(a.projection_amount || 0))
  ), [data])

  const onTrack = salesmen.filter((s) => Number(s.eto_projection_variance || 0) >= 0)
  const behind = salesmen.filter((s) => Number(s.eto_projection_variance || 0) < 0)

  const watchCustomers = useMemo<Record<string, any>[]>(() => (
    ([...data.customer_top] as Record<string, any>[])
      .filter((c) => Number(c.projected_amount || 0) > 0)
      .map((c) => ({ ...c, gap: Number(c.eto_projection_variance || 0) }))
      .sort((a, b) => Number(a.gap) - Number(b.gap))
      .slice(0, 6)
  ), [data])

  const topCustomers = useMemo<Record<string, any>[]>(() => (
    ([...data.customer_top] as Record<string, any>[])
      .filter((c) => Number(c.mtd_sales || 0) > 0)
      .sort((a, b) => Number(b.mtd_sales || 0) - Number(a.mtd_sales || 0))
      .slice(0, 6)
  ), [data])

  // Monthly trend with projection target reference
  const monthly = data.monthly_trend as Array<{ month_key: string; revenue_ex_vat: number }>
  const monthlyMax = Math.max(...monthly.map((m) => Number(m.revenue_ex_vat) || 0), projection) * 1.18
  const lastMonthKey = monthly.length >= 1 ? String(monthly[monthly.length - 1].month_key) : ''

  // AI insights
  const topSalesman = salesmen[0]
  const bestPctSalesman = [...salesmen].sort((a, b) => Number(b.projection_achievement_pct || 0) - Number(a.projection_achievement_pct || 0))[0]
  const worstSalesman = [...salesmen].sort((a, b) => Number(a.eto_projection_variance || 0) - Number(b.eto_projection_variance || 0))[0]

  return (
    <>
      <header className="top-ribbon">
        <div className="dashboard-greeting">
          <SidebarToggle />
          <div className="greeting-text">
            <span>Automotive Division</span>
            <h1>Sales &amp; Targets</h1>
            <p>Monthly target vs achievement, salesman bench and customer projection watch <b className="ui-version-pill">{monthName} {ctx.day_of_month} of {ctx.days_in_month}</b></p>
          </div>
        </div>
        <div className="top-control-cluster">
          <label className="global-search"><Icon name="search" size={15} /> <em>Search salesman / customer&hellip;</em></label>
          <div className="filter-row">
            <button><Icon name="calendar" size={14} /> {monthShort} 1 – {monthShort} {ctx.day_of_month}</button>
            <button><Icon name="pin" size={14} /> All Regions</button>
            <button><Icon name="badge" size={14} /> All Salesmen</button>
            <button className="export"><Icon name="refresh" size={14} /> Refresh</button>
          </div>
          <button className="ai-pill" type="button"><Icon name="sparkle" size={14} /> Ask Titan</button>
        </div>
      </header>

      {/* Hero KPI strip — projection-centric */}
      <section className="kpi-grid">
        <article className="kpi-card">
          <div className="kpi-icon blue"><Icon name="bills" size={20} /></div>
          <div className="kpi-content">
            <p>MTD Sales</p>
            <strong>{compactMoney(sales)}</strong>
            <div className="kpi-foot"><span>vs Projection</span><b className={projectionAch >= 100 ? 'good' : 'bad'}>{signedPct(projectionAch - 100)}</b></div>
          </div>
        </article>
        <article className="kpi-card">
          <div className="kpi-icon teal"><Icon name="trend" size={20} /></div>
          <div className="kpi-content">
            <p>ETO Close <em className="amount-method" title={etoCalc.method === 'smoothed' ? 'Smoothed: 60% last-month MTD→full ratio + 40% linear MTD÷elapsed×total, capped ±25%' : 'Linear: MTD ÷ elapsed × total days'}>{etoCalc.method === 'smoothed' ? 'smoothed' : 'linear'}</em></p>
            <strong>{compactMoney(eto)}</strong>
            <div className="kpi-foot"><span>vs Projection</span><b className={etoAch >= 100 ? 'good' : 'bad'}>{safePct(etoAch)}</b></div>
          </div>
        </article>
        <article className="kpi-card">
          <div className="kpi-icon gold"><Icon name="target" size={20} /></div>
          <div className="kpi-content">
            <p>Projection Target</p>
            <strong>{compactMoney(projection)}</strong>
            <div className="kpi-foot"><span>{compactMoney(projectionGap)} gap</span><b className="bad">{daysRemaining}d left</b></div>
          </div>
        </article>
        <article className="kpi-card">
          <div className="kpi-icon ink"><Icon name="layers" size={20} /></div>
          <div className="kpi-content">
            <p>Pipeline (LPO + Confirmed)</p>
            <strong>{compactMoney(pipeline)}</strong>
            <div className="kpi-foot"><span>LPO {compactMoney(lpo)}</span><b>Conf {compactMoney(confirmed)}</b></div>
          </div>
        </article>
        <article className="kpi-card">
          <div className="kpi-icon green"><Icon name="badge" size={20} /></div>
          <div className="kpi-content">
            <p>On-Track Salesmen</p>
            <strong>{onTrack.length}<em style={{ fontStyle: 'normal', fontSize: '13px', fontWeight: 700, color: 'var(--muted)' }}>/{salesmen.length}</em></strong>
            <div className="kpi-foot"><span>Behind Projection</span><b className="bad">{behind.length}</b></div>
          </div>
        </article>
        <article className="kpi-card">
          <div className="kpi-icon red"><Icon name="bolt" size={20} /></div>
          <div className="kpi-content">
            <p>Daily Run Rate</p>
            <strong>{compactMoney(dailyTrend)}<em style={{ fontStyle: 'normal', fontSize: '13px', fontWeight: 700, color: 'var(--muted)' }}>/day</em></strong>
            <div className="kpi-foot"><span>Needed</span><b className={dailyTrend >= requiredDaily ? 'good' : 'bad'}>{compactMoney(requiredDaily)}/d</b></div>
          </div>
        </article>
      </section>

      {/* AI insights ribbon */}
      <section className="ai-insights-row">
        <div className="ai-ribbon-head">
          <span className="ai-dot"><Icon name="sparkle" size={11} /></span>
          <h2>Titan Sales Insights — {monthName} Highlights</h2>
          <CardOptions label="AI insights" />
        </div>
        <div className="ai-insights-grid">
          <article className="ai-card good">
            <header><span><Icon name="badge" size={14} /></span><p>Best Achievement</p></header>
            <strong>{bestPctSalesman?.salesman || '—'}</strong>
            <small>{Math.round(Number(bestPctSalesman?.projection_achievement_pct || 0))}% of projection · {compactMoney(Number(bestPctSalesman?.actual_sales || 0))} MTD</small>
          </article>
          <article className="ai-card bad">
            <header><span><Icon name="shield" size={14} /></span><p>Largest ETO Shortfall</p></header>
            <strong>{worstSalesman?.salesman || '—'}</strong>
            <small>Short by {compactMoney(Math.abs(Number(worstSalesman?.eto_projection_variance || 0)))} vs projection</small>
          </article>
          <article className="ai-card neutral">
            <header><span><Icon name="dollar" size={14} /></span><p>Top Revenue (MTD)</p></header>
            <strong>{topSalesman?.salesman || '—'}</strong>
            <small>{compactMoney(Number(topSalesman?.actual_sales || 0))} MTD · projection {compactMoney(Number(topSalesman?.projection_amount || 0))}</small>
          </article>
          <article className="ai-card warning">
            <header><span><Icon name="bolt" size={14} /></span><p>Pace Required</p></header>
            <strong>{compactMoney(requiredDaily)}/day</strong>
            <small>Currently averaging {compactMoney(dailyTrend)}/day · {signedCompactMoney(dailyTrend - requiredDaily)}/day gap</small>
          </article>
        </div>
      </section>

      {/* Monthly target vs achievement chart */}
      <section className="card targets-chart-card">
        <div className="card-title">
          <div>
            <h3>13-Month Revenue vs Projection Target</h3>
            <small>Monthly billing trend with current projection target reference line</small>
          </div>
          <CardOptions label="Targets chart" />
        </div>
        <svg viewBox="0 0 920 280" className="monthly-bars" style={{ width: '100%', height: 'auto' }}>
          <defs>
            <linearGradient id="st-bar-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="st-bar-current" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
            const v = monthlyMax * t
            const y = 30 + 200 - (v / monthlyMax) * 200
            return (
              <g key={i}>
                <line x1="56" x2="904" y1={y} y2={y} stroke="#EEF1F4" strokeDasharray={i === 0 ? '0' : '3 4'} />
                <text x="48" y={y + 4} textAnchor="end" className="bars-axis">{(v / 1_000_000).toFixed(1)}M</text>
              </g>
            )
          })}
          {/* Projection target on the current month only */}
          {(() => {
            const i = monthly.length - 1
            const slot = (904 - 56) / monthly.length
            const xCenter = 56 + slot * i + slot / 2
            const projY = 30 + 200 - (projection / monthlyMax) * 200
            return (
              <g>
                <line x1={xCenter - 16} x2={xCenter + 16} y1={projY} y2={projY} stroke="#0D9488" strokeDasharray="4 3" strokeWidth="2" strokeLinecap="round" />
                <text x={xCenter + 22} y={projY + 4} className="target-side-label">{monthShort} target {(projection / 1_000_000).toFixed(2)}M</text>
              </g>
            )
          })()}
          {monthly.map((m, i) => {
            const v = Number(m.revenue_ex_vat) || 0
            const slot = (904 - 56) / monthly.length
            const barW = Math.min(slot * 0.5, 32)
            const x = 56 + slot * i + (slot - barW) / 2
            const y = 30 + 200 - (v / monthlyMax) * 200
            const isCurrent = String(m.month_key) === lastMonthKey
            return (
              <g key={m.month_key}>
                <rect x={x} y={y} width={barW} height={30 + 200 - y} rx="3" fill={isCurrent ? 'url(#st-bar-current)' : 'url(#st-bar-grad)'} />
                <text x={x + barW / 2} y={y - 6} textAnchor="middle" className={isCurrent ? 'bars-val rev current' : 'bars-val rev'}>{(v / 1_000_000).toFixed(2)}</text>
                <text x={x + barW / 2} y={272} textAnchor="middle" className={isCurrent ? 'bars-x current' : 'bars-x'}>{formatMonthLabel(m.month_key)}</text>
              </g>
            )
          })}
        </svg>
      </section>

      {/* Salesman target leaderboard */}
      <section className="card salesman-target-card">
        <div className="card-title">
          <div>
            <h3>Salesman Target Board</h3>
            <small>Sorted by projection amount · achievement bars show MTD vs projection</small>
          </div>
          <CardOptions label="Salesman target board" />
        </div>
        <div className="target-board">
          {salesmen.map((s, i) => {
            const proj = Number(s.projection_amount || 0)
            const act = Number(s.actual_sales || 0)
            const ach = proj ? (act / proj) * 100 : 0
            const etoVar = Number(s.eto_projection_variance || 0)
            const etoClose = Number(s.eto_close || 0)
            return (
              <article key={s.salesman} className={`target-row ${etoVar >= 0 ? 'pos' : 'neg'}`}>
                <div className="target-row-rank">{i + 1}</div>
                <div className="target-row-id">
                  <Initials name={String(s.salesman)} />
                  <div>
                    <strong>{s.salesman}</strong>
                    <small>Projection {compactMoney(proj)}</small>
                  </div>
                </div>
                <div className="target-row-meter">
                  <div className="meter-head">
                    <span>MTD {compactMoney(act)}</span>
                    <span>{ach.toFixed(0)}%</span>
                  </div>
                  <div className="meter-track">
                    <i className="meter-fill ach" style={{ width: `${Math.min(ach, 100)}%` }} />
                  </div>
                  <div className="meter-foot">
                    <span>ETO {compactMoney(etoClose)}</span>
                    <em className={etoVar >= 0 ? 'pos' : 'neg'}>{signedCompactMoney(etoVar)}</em>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Customer split */}
      <section className="customer-split-grid">
        <article className="card">
          <div className="card-title">
            <div>
              <h3>Customers at Risk</h3>
              <small>Largest negative ETO vs projection variance — needs attention</small>
            </div>
            <CardOptions label="Customers at risk" />
          </div>
          <ul className="customer-list">
            {watchCustomers.map((c, i) => (
              <li key={String(c.customer_name) + i}>
                <div className="cust-id">
                  <span className="cust-rank">{i + 1}</span>
                  <div>
                    <strong>{String(c.customer_name).split(' ').slice(0, 5).join(' ')}</strong>
                    <small>{c.salesman} · projection {compactMoney(Number(c.projected_amount || 0))}</small>
                  </div>
                </div>
                <div className="cust-metrics">
                  <em className="neg">{signedCompactMoney(c.gap)}</em>
                  <small>MTD {compactMoney(Number(c.mtd_sales || 0))}</small>
                </div>
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <div className="card-title">
            <div>
              <h3>Top Customers (MTD)</h3>
              <small>Highest billing this month</small>
            </div>
            <CardOptions label="Top customers" />
          </div>
          <ul className="customer-list">
            {topCustomers.map((c, i) => (
              <li key={String(c.customer_name) + i}>
                <div className="cust-id">
                  <span className="cust-rank pos">{i + 1}</span>
                  <div>
                    <strong>{String(c.customer_name).split(' ').slice(0, 5).join(' ')}</strong>
                    <small>{c.salesman} · GP {safePct(Number(c.gp_pct || 0))}</small>
                  </div>
                </div>
                <div className="cust-metrics">
                  <em className="pos-val">{compactMoney(Number(c.mtd_sales || 0))}</em>
                  <small>{Math.round((Number(c.mtd_sales || 0) / sales) * 1000) / 10}% of div MTD</small>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  )
}
