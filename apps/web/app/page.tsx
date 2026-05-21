'use client'

import { Fragment, useState } from 'react'
import { dashboardData } from '../lib/dashboard-data'
import {
  compactMoney,
  formatMonthLabel,
  metric,
  optionalMetric,
  safePct,
  signedCompactMoney,
  signedPct,
  signedPp,
} from '../lib/format'
import { Icon } from './components/Icon'
import { Initials } from './components/Initials'
import { CardOptions } from './components/CardOptions'
import { SidebarToggle } from './components/DashboardShell'

type Tone = 'red' | 'blue' | 'teal' | 'gold' | 'green' | 'ink'

type Kpi = {
  icon: string
  label: string
  value: string
  basis: string
  delta: string
  tone: Tone
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

type TrendPoint = { month_key: string; revenue_ex_vat: number; gp_value: number; gp_pct: number; isCurrent?: boolean }

function MonthlyBars({ points, projection, eto, etoGp }: { points: TrendPoint[]; projection: number; eto: number; etoGp: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 920
  const H = 380
  const padL = 56
  const padR = 56
  const padT = 56
  const padB = 50
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const revVals = points.map((p) => Number(p.revenue_ex_vat) || 0)
  const gpVals = points.map((p) => Number(p.gp_value) || 0)
  const gpPcts = points.map((p) => Number(p.gp_pct) || 0)
  const maxRev = Math.max(...revVals, eto, projection) * 1.22
  const maxGpPct = Math.max(...gpPcts, 25) * 1.1
  const n = points.length
  const slot = innerW / n
  const barW = Math.min(slot * 0.36, 24)
  const gpBarW = Math.min(slot * 0.26, 17)
  const x = (i: number) => padL + slot * i + (slot - barW - gpBarW - 3) / 2
  const xCenter = (i: number) => padL + slot * i + slot / 2
  const y = (v: number) => padT + innerH - (v / (maxRev || 1)) * innerH
  const yGpPct = (v: number) => padT + innerH - (v / (maxGpPct || 1)) * innerH
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => maxRev * t)
  const gpTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => maxGpPct * t)
  const lastIdx = n - 1
  const gpLine = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xCenter(i)} ${yGpPct(Number(p.gp_pct) || 0)}`).join(' ')

  return (
    <div className="chart-host">
      <svg className="monthly-bars" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Monthly revenue and GP trend">
        <defs>
          <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="bar-grad-current" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="gp-bar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
          <linearGradient id="gp-bar-current" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="eto-overlay" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C4B5FD" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
          <pattern id="eto-stripe" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#C4B5FD" opacity="0.32" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#7C3AED" strokeWidth="1.4" opacity="0.5" />
          </pattern>
        </defs>

        {/* horizontal gridlines + left revenue axis */}
        {ticks.map((t, i) => (
          <g key={`t-${i}`}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="#EEF1F4" strokeDasharray={i === 0 ? '0' : '3 4'} />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" className="bars-axis">{(t / 1_000_000).toFixed(1)}M</text>
          </g>
        ))}

        {/* right GP% axis labels */}
        {gpTicks.map((t, i) => (
          <text key={`gpt-${i}`} x={W - padR + 8} y={yGpPct(t) + 4} textAnchor="start" className="bars-axis gp-axis">{t.toFixed(0)}%</text>
        ))}
        <text x={padL} y={padT - 22} textAnchor="start" className="axis-title">Revenue · AED M</text>
        <text x={W - padR} y={padT - 22} textAnchor="end" className="axis-title gp">GP %</text>

        {/* bars */}
        {points.map((p, i) => {
          const rev = revVals[i]
          const gpv = gpVals[i]
          const isLast = p.isCurrent
          const isHover = hover === i
          const revBarX = x(i)
          const gpBarX = revBarX + barW + 3
          const revBarH = Math.max(2, padT + innerH - y(rev))
          const gpBarH = Math.max(2, padT + innerH - y(gpv))
          const revOpacity = hover === null || isHover ? 1 : 0.4
          const gpOpacity = hover === null || isHover ? 0.9 : 0.32
          return (
            <g key={p.month_key}>
              {/* MTD revenue bar */}
              <rect x={revBarX} y={y(rev)} width={barW} height={revBarH} rx="3" fill={isLast ? 'url(#bar-grad-current)' : 'url(#bar-grad)'} opacity={revOpacity} />
              {/* GP bar */}
              <rect x={gpBarX} y={y(gpv)} width={gpBarW} height={gpBarH} rx="3" fill={isLast ? 'url(#gp-bar-current)' : 'url(#gp-bar-grad)'} opacity={gpOpacity} />

              {/* ETO overlay above the MTD bar (current month only) */}
              {isLast && eto > rev && (
                <g opacity={hover === null || isHover ? 1 : 0.5}>
                  <rect x={revBarX} y={y(eto)} width={barW} height={y(rev) - y(eto)} rx="3" fill="url(#eto-stripe)" stroke="#7C3AED" strokeWidth="1.2" strokeDasharray="3 3" />
                </g>
              )}
              {/* ETO GP overlay above GP bar (current month only) */}
              {isLast && etoGp > gpv && (
                <g opacity={hover === null || isHover ? 0.85 : 0.4}>
                  <rect x={gpBarX} y={y(etoGp)} width={gpBarW} height={y(gpv) - y(etoGp)} rx="3" fill="#FDE68A" stroke="#D97706" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
                </g>
              )}

              {/* Revenue value label above bar (or above ETO if current) */}
              <text x={revBarX + barW / 2} y={(isLast && eto > rev ? y(eto) : y(rev)) - 6} textAnchor="middle" className={isLast ? 'bars-val rev current' : 'bars-val rev'}>
                {(((isLast && eto > rev) ? eto : rev) / 1_000_000).toFixed(2)}
              </text>
              {/* GP value label above GP bar — millions with 2 decimals to match revenue */}
              <text x={gpBarX + gpBarW / 2} y={(isLast && etoGp > gpv ? y(etoGp) : y(gpv)) - 6} textAnchor="middle" className={isLast ? 'bars-val gp current' : 'bars-val gp'}>
                {(((isLast && etoGp > gpv) ? etoGp : gpv) / 1_000_000).toFixed(2)}
              </text>

              {/* Month x-label */}
              <text x={xCenter(i)} y={H - padB + 22} textAnchor="middle" className={isLast ? 'bars-x current' : 'bars-x'}>{formatMonthLabel(p.month_key)}</text>
            </g>
          )
        })}

        {/* GP% line overlay (right axis) */}
        <path d={gpLine} fill="none" stroke="#6366F1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" opacity={hover === null ? 0.55 : 0.3} />
        {points.map((p, i) => (
          <circle key={`gp-pt-${p.month_key}`} cx={xCenter(i)} cy={yGpPct(Number(p.gp_pct) || 0)} r={hover === i ? 4 : 2.2} fill="#fff" stroke="#6366F1" strokeWidth="1.5" />
        ))}

        {/* hit areas */}
        {points.map((p, i) => (
          <rect
            key={`hit-${p.month_key}`}
            x={padL + slot * i}
            y={padT}
            width={slot}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}

        {/* hover guide line */}
        {hover !== null && (
          <line x1={xCenter(hover)} x2={xCenter(hover)} y1={padT} y2={padT + innerH} stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
        )}
      </svg>

      {/* HTML tooltip */}
      {hover !== null && (() => {
        const p = points[hover]
        const leftPct = ((padL + slot * hover + slot / 2) / W) * 100
        const isRightHalf = leftPct > 60
        return (
          <div className="chart-tip" style={{ left: `${leftPct}%`, transform: `translateX(${isRightHalf ? '-100%' : '0%'})` }}>
            <div className="tip-head">
              <span className="tip-month">{formatMonthLabel(p.month_key)} {String(p.month_key).split('-')[0]}</span>
              {p.isCurrent && <em className="tip-tag">partial · MTD</em>}
            </div>
            <div className="tip-row"><i className="tip-dot rev" /><span>{p.isCurrent ? 'MTD Revenue' : 'Revenue'}</span><b>{compactMoney(Number(p.revenue_ex_vat) || 0)}</b></div>
            {p.isCurrent && (
              <div className="tip-row"><i className="tip-dot eto" /><span>ETO close</span><b>{compactMoney(eto)}</b></div>
            )}
            <div className="tip-row"><i className="tip-dot gp" /><span>{p.isCurrent ? 'MTD GP value' : 'GP value'}</span><b>{compactMoney(Number(p.gp_value) || 0)}</b></div>
            {p.isCurrent && (
              <div className="tip-row"><i className="tip-dot gpeto" /><span>ETO GP value</span><b>{compactMoney(etoGp)}</b></div>
            )}
            <div className="tip-row"><i className="tip-dot gppct" /><span>GP %</span><b>{(Number(p.gp_pct) || 0).toFixed(1)}%</b></div>
            {p.isCurrent && (
              <div className="tip-target">Projection: <b>{compactMoney(projection)}</b></div>
            )}
          </div>
        )
      })()}
    </div>
  )
}

function HBarPair({ thisLabel, thisValue, lastLabel, lastValue, thisDisplay, lastDisplay, color }: {
  thisLabel: string; thisValue: number; lastLabel: string; lastValue: number; thisDisplay: string; lastDisplay: string; color: string;
}) {
  const max = Math.max(thisValue, lastValue, 1)
  const thisPct = (thisValue / max) * 100
  const lastPct = (lastValue / max) * 100
  return (
    <div className="hbar-pair">
      <div className="hbar-row">
        <span className="hbar-label">{lastLabel}</span>
        <div className="hbar-track"><i className="hbar-fill last" style={{ width: `${lastPct}%`, background: color }} /></div>
        <span className="hbar-val">{lastDisplay}</span>
      </div>
      <div className="hbar-row">
        <span className="hbar-label this">{thisLabel}</span>
        <div className="hbar-track"><i className="hbar-fill this" style={{ width: `${thisPct}%`, background: color }} /></div>
        <span className="hbar-val this">{thisDisplay}</span>
      </div>
    </div>
  )
}

function ComparisonStrip({ thisRev, thisGp, thisGpPct, lastRev, lastGp, lastGpPct }: { thisRev: number; thisGp: number; thisGpPct: number; lastRev: number; lastGp: number; lastGpPct: number }) {
  const revDelta = lastRev ? ((thisRev - lastRev) / lastRev) * 100 : null
  const gpDelta = lastGp ? ((thisGp - lastGp) / lastGp) * 100 : null
  const gpPctDelta = thisGpPct - lastGpPct
  const items = [
    { label: 'MTD Revenue', value: compactMoney(thisRev), delta: revDelta, deltaSuffix: '%', tone: 'blue' as const },
    { label: 'MTD GP Value', value: compactMoney(thisGp), delta: gpDelta, deltaSuffix: '%', tone: 'teal' as const },
    { label: 'MTD GP %', value: `${thisGpPct.toFixed(1)}%`, delta: gpPctDelta, deltaSuffix: 'pp', tone: 'purple' as const },
  ]
  return (
    <div className="compare-strip">
      {items.map((it) => {
        const positive = (it.delta ?? 0) >= 0
        return (
          <div className={`compare-cell tone-${it.tone}`} key={it.label}>
            <small>{it.label}</small>
            <strong>{it.value}</strong>
            {it.delta !== null && (
              <em className={positive ? 'pos' : 'neg'}>
                {positive ? '▲' : '▼'} {Math.abs(it.delta).toFixed(1)}{it.deltaSuffix} <span>vs last month</span>
              </em>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SegmentBar({ achieved, projected, budget }: { achieved: number; projected: number; budget: number }) {
  const total = Math.max(budget, projected, achieved, 1)
  const achPct = (achieved / total) * 100
  const projAdd = Math.max(projected - achieved, 0)
  const projPct = (projAdd / total) * 100
  const gap = Math.max(budget - Math.max(projected, achieved), 0)
  const gapPct = (gap / total) * 100
  return (
    <div className="segment-bar">
      <div className="segment-track">
        <div className="seg seg-ach" style={{ width: `${achPct}%` }} title={`Achieved ${achPct.toFixed(1)}%`} />
        <div className="seg seg-proj" style={{ width: `${projPct}%` }} title={`Projection +${projPct.toFixed(1)}%`} />
        <div className="seg seg-gap" style={{ width: `${gapPct}%` }} title={`Gap ${gapPct.toFixed(1)}%`} />
      </div>
      <div className="segment-legend">
        <span><i className="legend-ach" />MTD <b>{achPct.toFixed(1)}%</b></span>
        <span><i className="legend-proj" />Pipeline <b>+{projPct.toFixed(1)}%</b></span>
        <span><i className="legend-gap" />Gap <b>{gapPct.toFixed(1)}%</b></span>
      </div>
    </div>
  )
}

function Donut({ pct, tone = 'teal' }: { pct: number; tone?: 'teal' | 'green' | 'amber' | 'blue' }) {
  const r = 28
  const C = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(pct, 100))
  const dash = (clamped / 100) * C
  const palette: Record<string, string> = { teal: '#14B8A6', green: '#10B981', amber: '#F59E0B', blue: '#3B82F6' }
  const color = palette[tone] || palette.teal
  return (
    <svg className="donut" viewBox="0 0 80 80" role="img" aria-label={`${clamped.toFixed(1)} percent`}>
      <circle cx="40" cy="40" r={r} fill="none" stroke="#EEF1F4" strokeWidth="9" />
      <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
        strokeDasharray={`${dash} ${C - dash}`} transform="rotate(-90 40 40)" />
      <text x="40" y="44" textAnchor="middle" className="donut-label">{clamped.toFixed(1)}%</text>
    </svg>
  )
}

function MiniArea({ values, labels, tone = 'blue' }: { values: number[]; labels?: string[]; tone?: 'blue' | 'teal' | 'amber' | 'purple' | 'green' | 'red' }) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 320
  const H = labels ? 100 : 70
  const padT = 18
  const padB = labels ? 22 : 8
  const padX = 12
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const x = (i: number) => padX + (i / Math.max(values.length - 1, 1)) * (W - padX * 2)
  const y = (v: number) => padT + (H - padT - padB) - ((v - min) / (max - min || 1)) * (H - padT - padB)
  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ')
  const area = `${line} L ${x(values.length - 1)} ${H - padB} L ${x(0)} ${H - padB} Z`
  const colors: Record<string, string> = { blue: '#3B82F6', teal: '#14B8A6', amber: '#F59E0B', purple: '#8B5CF6', green: '#10B981', red: '#EF4444' }
  const c = colors[tone] || colors.blue
  const slot = (W - padX * 2) / Math.max(values.length - 1, 1)
  return (
    <div className="chart-host mini">
      <svg className="mini-area" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <defs>
          <linearGradient id={`mini-grad-${tone}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c} stopOpacity="0.34" />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#mini-grad-${tone})`} />
        <path d={line} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((v, i) => {
          const isLast = i === values.length - 1
          const isHover = hover === i
          return <circle key={i} cx={x(i)} cy={y(v)} r={isHover ? 4 : isLast ? 3 : 2} fill={isLast || isHover ? c : '#fff'} stroke={c} strokeWidth={1.4} />
        })}
        {labels && labels.map((lab, i) => (
          <text key={`x-${i}`} x={x(i)} y={H - 5} textAnchor="middle" className="mini-area-x">{lab}</text>
        ))}
        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 3" opacity="0.55" />
        )}
        {values.map((_, i) => (
          <rect
            key={`hit-${i}`}
            x={x(i) - slot / 2}
            y={0}
            width={slot}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      {hover !== null && labels && (() => {
        const leftPct = (x(hover) / W) * 100
        const isRight = leftPct > 60
        return (
          <div className="chart-tip mini-tip" style={{ left: `${leftPct}%`, transform: `translateX(${isRight ? '-100%' : '0%'})` }}>
            <div className="tip-head"><span className="tip-month">{labels[hover]}</span></div>
            <div className="tip-row"><i className="tip-dot rev" /><span>Revenue</span><b>{compactMoney(values[hover])}</b></div>
          </div>
        )
      })()}
    </div>
  )
}

function MiniBarChart({ values, tone = 'amber' }: { values: number[]; tone?: 'blue' | 'teal' | 'amber' | 'purple' | 'green' }) {
  const max = Math.max(...values, 1)
  return (
    <div className={`mini-barchart tone-${tone}`} aria-hidden="true">
      {values.map((v, i) => <i key={i} style={{ height: `${Math.max((v / max) * 100, 8)}%` }} />)}
    </div>
  )
}

function DayProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="day-progress" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <i key={i} className={i < current ? 'done' : ''} />
      ))}
    </div>
  )
}

function KpiCard({ item }: { item: Kpi }) {
  return (
    <article className="kpi-card">
      <div className={`kpi-icon ${item.tone}`}><Icon name={item.icon} size={20} /></div>
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

  const sales = Number(bridge.actual_sales || 0)
  const budget = Number(bridge.budget_amount || 0)
  const projection = Number(bridge.projected_amount || 0)
  const lpo = Number(bridge.lpo_amount || 0)
  const confirmed = Number(bridge.confirmed_amount || 0)
  const pipeline = lpo + confirmed
  const gap = Number(bridge.shortfall_to_budget || 0)
  const projectionGap = Number(bridge.shortfall_to_projection || 0)
  const runRate = Number(bridge.daily_required_for_projection || 0)
  const elapsedDays = Math.max(Number(ctx.day_of_month || 0), 1)
  const daysInMonth = Math.max(Number(ctx.days_in_month || elapsedDays), elapsedDays)
  const dailyTrend = sales / elapsedDays
  const eto = dailyTrend * daysInMonth
  const etoVariance = eto - projection
  const etoAch = projection ? eto / projection * 100 : 0
  const projectionAch = projection ? sales / projection * 100 : 0
  const gpPct = Number(gp.gp_pct || 0)
  const grossProfit = Number(gp.gross_profit || 0)
  const etoGp = grossProfit / elapsedDays * daysInMonth
  const remainingProjection = Math.max(projection - sales, 0)
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

  const lastMonthGpPct = totalLastMonthGpPct ?? 0
  const gpValueDelta = grossProfit - lastMonthGrossProfit
  const gpValueDeltaPct = lastMonthGrossProfit ? (gpValueDelta / lastMonthGrossProfit) * 100 : 0
  const gpPctDelta = totalGpPctChange ?? 0
  const revVsLastDelta = sales - salesmanLastMtdSales
  const revVsLastDeltaPct = salesmanLastMtdSales ? (revVsLastDelta / salesmanLastMtdSales) * 100 : 0

  const kpis: Kpi[] = [
    { icon: 'bills', label: 'MTD Sales', value: compactMoney(sales), basis: 'vs Projection', delta: `${safePct(projectionAch - 100)}`, tone: 'blue' },
    { icon: 'target', label: 'ETO vs Projection', value: safePct(etoAch), basis: `Close: ${compactMoney(eto)}`, delta: signedCompactMoney(etoVariance), tone: 'gold' },
    { icon: 'percent', label: 'GP %', value: safePct(gpPct), basis: 'vs Last Month', delta: signedPp(gpPctDelta), tone: 'teal' },
    { icon: 'dollar', label: 'Gross Profit AED', value: compactMoney(grossProfit), basis: 'vs Last Month', delta: `${gpValueDeltaPct >= 0 ? '+' : '-'}${Math.abs(gpValueDeltaPct).toFixed(1)}%`, tone: 'ink' },
    { icon: 'trend', label: 'Projection Achievement', value: safePct(projectionAch), basis: 'vs Projection', delta: `${Math.round(projectionAch - 100)} pp`, tone: 'gold' },
    { icon: 'bolt', label: 'Revenue Δ', value: `${revVsLastDeltaPct >= 0 ? '+' : '-'}${Math.abs(revVsLastDeltaPct).toFixed(1)}%`, basis: 'vs Same-Day LM', delta: signedCompactMoney(revVsLastDelta), tone: 'green' },
  ]

  const maxWaterfall = Math.max(projection, sales, pipeline, projectionGap, 1)

  // Monthly GP overlay uses actual CRM profitability values from the snapshot.
  // Current and historical months both use gp_value / gp_pct; no modeled monthly GP.
  const monthly = data.monthly_trend as Array<{ month_key: string; revenue_ex_vat: number; gp_value?: number; gp_pct?: number }>
  const currentMonthKey = monthly.length >= 1 ? String(monthly[monthly.length - 1].month_key) : ''
  const monthlyEnriched = monthly.map((p) => {
    const key = String(p.month_key)
    return {
      ...p,
      gp_value: Number(p.gp_value || 0),
      gp_pct: Number(p.gp_pct || 0),
      isCurrent: key === currentMonthKey,
    }
  })

  // AI-style insights for the projection pacing card
  const topSalesman = [...data.salesman_leaderboard]
    .filter((s) => Number(s.projection_amount || 0) > 0)
    .sort((a, b) => Number(b.projection_achievement_pct || 0) - Number(a.projection_achievement_pct || 0))[0]
  const watchSalesman = [...data.salesman_leaderboard]
    .filter((s) => Number(s.projection_amount || 0) > 0)
    .sort((a, b) => Number(a.eto_projection_variance || 0) - Number(b.eto_projection_variance || 0))[0]
  const topCustomer = [...data.customer_top]
    .sort((a, b) => Number(b.mtd_sales || 0) - Number(a.mtd_sales || 0))[0]
  const categoryMap = new Map<string, number>()
  for (const r of data.product_mix_top) {
    const c = String(r.derived_category || 'Other')
    categoryMap.set(c, (categoryMap.get(c) || 0) + Number(r.revenue_ex_vat || 0))
  }
  const topCategory = [...categoryMap.entries()].sort((a, b) => b[1] - a[1])[0]
  const insights = [
    {
      icon: 'badge' as const,
      tone: 'green' as const,
      label: 'Top performer',
      body: `${topSalesman?.salesman || '—'} — ${Math.round(Number(topSalesman?.projection_achievement_pct || 0))}% of projection`,
    },
    {
      icon: 'user' as const,
      tone: 'blue' as const,
      label: 'Biggest customer (MTD)',
      body: `${String(topCustomer?.customer_name || '—').split(' ').slice(0, 4).join(' ')} — ${compactMoney(Number(topCustomer?.mtd_sales || 0))}`,
    },
    {
      icon: 'box' as const,
      tone: 'purple' as const,
      label: 'Leading category',
      body: `${topCategory?.[0] || '—'} — ${compactMoney(topCategory?.[1] || 0)}`,
    },
    {
      icon: 'shield' as const,
      tone: 'red' as const,
      label: 'Watchlist',
      body: `${watchSalesman?.salesman || '—'} — ETO short by ${compactMoney(Math.abs(Number(watchSalesman?.eto_projection_variance || 0)))}`,
    },
  ]

  return (
    <>
        <header className="top-ribbon">
          <div className="dashboard-greeting">
            <SidebarToggle />
            <div className="greeting-text">
              <span>Automotive Division</span>
              <h1>Tyres Executive Command</h1>
              <p>Sales, projection, GP and customer execution overview <b className="ui-version-pill">Modern UI v4</b></p>
            </div>
          </div>
          <div className="top-control-cluster">
            <label className="global-search"><Icon name="search" size={15} /> <em>Search customer / salesman&hellip;</em></label>
            <div className="filter-row">
              <button><Icon name="calendar" size={14} /> May 1 – May {ctx.day_of_month}</button>
              <button><Icon name="pin" size={14} /> All Regions</button>
              <button><Icon name="badge" size={14} /> All Salesmen</button>
              <button className="export"><Icon name="refresh" size={14} /> Refresh</button>
            </div>
            <button className="ai-pill" type="button"><Icon name="sparkle" size={14} /> Ask Titan</button>
          </div>
        </header>

        <section className="performance-cockpit">
          <header className="cockpit-head">
            <div className="cockpit-title">
              <span className="cockpit-icon"><Icon name="trend" size={18} /></span>
              <div>
                <p>Performance Cockpit</p>
                <h2>May Execution Status <em className="cockpit-period">Day {ctx.day_of_month} of {ctx.days_in_month}</em></h2>
              </div>
            </div>
            <div className="cockpit-status-row">
              <div className={`status-pill ${etoVariance >= 0 ? 'surplus' : 'shortfall'}`}>
                <Icon name={etoVariance >= 0 ? 'trend' : 'shield'} size={14} />
                <span>{etoVariance >= 0 ? 'Pacing ahead of projection' : 'Pacing behind projection'}</span>
                <b>{signedCompactMoney(etoVariance)}</b>
              </div>
              <div className="status-pill neutral">
                <Icon name="clock" size={14} />
                <span>{daysRemaining} days left</span>
              </div>
            </div>
          </header>

          <div className="cockpit-hero">
            <article className="hero-progress-card">
              <div className="hero-progress-head">
                <p>Projection pacing</p>
                <small>MTD &rarr; ETO Close &rarr; Projection Target</small>
              </div>
              <div className="hero-amounts">
                <div className="amount achieved">
                  <small>MTD Sales</small>
                  <strong>{compactMoney(sales)}</strong>
                  <em>{safePct(projectionAch)} of projection</em>
                </div>
                <div className="amount projected">
                  <small>ETO Close</small>
                  <strong>{compactMoney(eto)}</strong>
                  <em>{safePct(etoAch)} of projection</em>
                </div>
                <div className="amount budget">
                  <small>Projection Target</small>
                  <strong>{compactMoney(projection)}</strong>
                  <em>{compactMoney(remainingProjection)} remaining</em>
                </div>
              </div>
              <SegmentBar achieved={sales} projected={Math.max(eto, sales)} budget={projection} />

              <div className="pacing-gp">
                <div className="pacing-gp-cell">
                  <small>MTD GP Value</small>
                  <strong>{compactMoney(grossProfit)}</strong>
                  <em className={gpValueDelta >= 0 ? 'pos' : 'neg'}>{gpValueDelta >= 0 ? '▲' : '▼'} {Math.abs(gpValueDeltaPct).toFixed(1)}% <span>vs last month</span></em>
                </div>
                <div className="pacing-gp-cell">
                  <small>MTD GP %</small>
                  <strong>{gpPct.toFixed(1)}%</strong>
                  <em className={gpPctDelta >= 0 ? 'pos' : 'neg'}>{gpPctDelta >= 0 ? '▲' : '▼'} {Math.abs(gpPctDelta).toFixed(1)}pp <span>vs last month</span></em>
                </div>
              </div>

              <div className="pacing-insights">
                <div className="pacing-insights-head">
                  <span className="ai-dot"><Icon name="sparkle" size={11} /></span>
                  <p>Titan insights — May highlights</p>
                </div>
                <ul>
                  {insights.map((it) => (
                    <li key={it.label} className={`insight-${it.tone}`}>
                      <span className="insight-icon"><Icon name={it.icon} size={12} /></span>
                      <div>
                        <small>{it.label}</small>
                        <strong>{it.body}</strong>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <article className="hero-chart-card">
              <div className="hero-chart-head">
                <div>
                  <p>13-month performance trend</p>
                  <small>Revenue (left) • GP value (right of each bar) • GP % (dashed line) • Hover for details</small>
                </div>
                <div className="hero-chart-actions">
                  <div className="chart-legend">
                    <span><i className="lg-bar" />Revenue (MTD)</span>
                    <span><i className="lg-eto" />ETO projection</span>
                    <span><i className="lg-gpbar" />GP value</span>
                    <span><i className="lg-gpline" />GP %</span>
                  </div>
                  <CardOptions label="13-month trend" />
                </div>
              </div>
              <MonthlyBars points={monthlyEnriched} projection={projection} eto={eto} etoGp={etoGp} />
              <ComparisonStrip
                thisRev={sales}
                thisGp={grossProfit}
                thisGpPct={gpPct}
                lastRev={salesmanLastMtdSales}
                lastGp={lastMonthGrossProfit}
                lastGpPct={lastMonthGpPct}
              />
            </article>
          </div>

          <div className="cockpit-tiles">
            <article className="tile tile-blue">
              <header>
                <span className="tile-icon"><Icon name="bolt" size={14} /></span>
                <p>Daily Trend</p>
                <CardOptions label="Daily trend" />
              </header>
              <strong>{compactMoney(dailyTrend)}<em>/day</em></strong>
              <small className={dailyTrendDelta >= 0 ? 'good' : 'bad'}>{signedCompactMoney(dailyTrendDelta)}/day vs projection pace</small>
              <MiniArea
                values={data.monthly_trend.slice(-8).map((p) => Number(p.revenue_ex_vat) || 0)}
                labels={data.monthly_trend.slice(-8).map((p) => formatMonthLabel(p.month_key))}
                tone="blue"
              />
            </article>

            <article className="tile tile-amber gp-pulse-tile">
              <header>
                <span className="tile-icon"><Icon name="percent" size={14} /></span>
                <p>GP Pulse vs Last Month</p>
                <CardOptions label="GP pulse" />
              </header>
              <div className="gp-pulse-grid">
                <div className="gp-pulse-metric">
                  <small>GP Value</small>
                  <strong>{compactMoney(grossProfit)}</strong>
                  <em className={gpValueDelta >= 0 ? 'pos' : 'neg'}>
                    {gpValueDelta >= 0 ? '▲' : '▼'} {Math.abs(gpValueDeltaPct).toFixed(1)}% vs last
                  </em>
                  <div className="gp-pulse-bars">
                    <div className="gp-pulse-bar last" style={{ width: `${(lastMonthGrossProfit / Math.max(grossProfit, lastMonthGrossProfit, 1)) * 100}%` }}><span>{compactMoney(lastMonthGrossProfit).replace('AED ', '')}</span></div>
                    <div className="gp-pulse-bar this teal" style={{ width: `${(grossProfit / Math.max(grossProfit, lastMonthGrossProfit, 1)) * 100}%` }}><span>{compactMoney(grossProfit).replace('AED ', '')}</span></div>
                  </div>
                </div>
                <div className="gp-pulse-divider" />
                <div className="gp-pulse-metric">
                  <small>GP %</small>
                  <strong>{gpPct.toFixed(1)}%</strong>
                  <em className={gpPctDelta >= 0 ? 'pos' : 'neg'}>
                    {gpPctDelta >= 0 ? '▲' : '▼'} {Math.abs(gpPctDelta).toFixed(1)}pp vs last
                  </em>
                  <div className="gp-pulse-bars">
                    <div className="gp-pulse-bar last amber" style={{ width: `${(lastMonthGpPct / Math.max(gpPct, lastMonthGpPct, 1)) * 100}%` }}><span>{lastMonthGpPct.toFixed(1)}%</span></div>
                    <div className="gp-pulse-bar this amber-deep" style={{ width: `${(gpPct / Math.max(gpPct, lastMonthGpPct, 1)) * 100}%` }}><span>{gpPct.toFixed(1)}%</span></div>
                  </div>
                </div>
              </div>
              <div className="gp-pulse-legend">
                <span><i className="dot last" />Last month</span>
                <span><i className="dot this" />This MTD</span>
              </div>
            </article>

            <article className="tile tile-teal">
              <header>
                <span className="tile-icon"><Icon name="check" size={14} /></span>
                <p>Pipeline Strength</p>
                <CardOptions label="Pipeline" />
              </header>
              <strong>{compactMoney(pipeline)}</strong>
              <small>LPO {compactMoney(lpo)} • Confirmed {compactMoney(confirmed)}</small>
              <div className="pipeline-split">
                <div className="pipeline-bar"><i className="lpo" style={{ width: `${(lpo / Math.max(pipeline, 1)) * 100}%` }} /><i className="conf" style={{ width: `${(confirmed / Math.max(pipeline, 1)) * 100}%` }} /></div>
                <div className="pipeline-legend"><span><i className="dot lpo" />LPO</span><span><i className="dot conf" />Confirmed</span></div>
              </div>
            </article>

            <article className="tile tile-purple">
              <header>
                <span className="tile-icon"><Icon name="clock" size={14} /></span>
                <p>Month Clock</p>
                <CardOptions label="Month clock" />
              </header>
              <strong>{ctx.day_of_month}<em>/{ctx.days_in_month}</em></strong>
              <small>{daysRemaining} days remaining • {Math.round(Number(ctx.day_of_month) / Number(ctx.days_in_month) * 100)}% elapsed</small>
              <DayProgress current={Number(ctx.day_of_month) || 0} total={Number(ctx.days_in_month) || 31} />
            </article>
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
                            <b><span className={`salesman-caret ${isOpen ? 'open' : ''}`}><Icon name="chevron-right" size={12} /></span><Initials name={salesmanName} />{salesmanName}</b>
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
            <div className="card-title"><h3>Projection Bridge</h3><span>AED Millions</span></div>
            <div className="bridge-plot bridge-plot-4">
              <WaterfallBar label="Projection Target" value={projection} max={maxWaterfall} tone="teal" />
              <WaterfallBar label="Achieved (MTD)" value={sales} max={maxWaterfall} tone="blue" />
              <WaterfallBar label="LPO + Confirmed Pipeline" value={pipeline} max={maxWaterfall} tone="green" />
              <WaterfallBar label="Remaining Gap" value={projectionGap} max={maxWaterfall} tone="red" />
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
              {actionItems.map((item, index) => <li key={item}><b><Icon name={['target', 'dollar', 'user', 'trend'][index]} size={14} /></b><span>{item}</span></li>)}
            </ul>
          </article>
        </section>
    </>
  )
}
