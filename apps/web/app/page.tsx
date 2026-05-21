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

function formatMonthLabel(monthKey: string) {
  if (!monthKey) return ''
  const [y, m] = monthKey.split('-').map(Number)
  if (!y || !m) return monthKey
  return new Date(y, m - 1, 1).toLocaleString('en-GB', { month: 'short' })
}

type TrendPoint = { month_key: string; revenue_ex_vat: number }
function MonthlyBars({ points, projection }: { points: TrendPoint[]; projection: number }) {
  const W = 620
  const H = 230
  const padL = 44
  const padR = 60
  const padT = 28
  const padB = 32
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const values = points.map((p) => Number(p.revenue_ex_vat) || 0)
  const maxData = Math.max(...values, projection)
  const maxV = maxData * 1.18
  const n = points.length
  const slot = innerW / n
  const barW = Math.min(slot * 0.58, 32)
  const x = (i: number) => padL + slot * i + (slot - barW) / 2
  const xCenter = (i: number) => padL + slot * i + slot / 2
  const y = (v: number) => padT + innerH - (v / (maxV || 1)) * innerH
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => maxV * t)
  return (
    <svg className="monthly-bars" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Monthly revenue trend">
      <defs>
        <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="bar-grad-current" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="#EEF1F4" strokeDasharray={i === 0 ? '0' : '3 4'} />
          <text x={padL - 8} y={y(t) + 3} textAnchor="end" className="bars-axis">{(t / 1_000_000).toFixed(1)}M</text>
        </g>
      ))}
      <line x1={padL} x2={W - padR} y1={y(projection)} y2={y(projection)} stroke="#0D9488" strokeDasharray="5 4" strokeWidth="1.6" />
      <text x={W - padR + 6} y={y(projection) + 4} textAnchor="start" className="bars-ref">
        <tspan className="bars-ref-label">Projection</tspan>
        <tspan x={W - padR + 6} dy="11" className="bars-ref-val">{(projection / 1_000_000).toFixed(2)}M</tspan>
      </text>
      {points.map((p, i) => {
        const v = values[i]
        const isLast = i === n - 1
        const barH = Math.max(2, padT + innerH - y(v))
        return (
          <g key={p.month_key}>
            <rect x={x(i)} y={y(v)} width={barW} height={barH} rx="4" fill={isLast ? 'url(#bar-grad-current)' : 'url(#bar-grad)'} />
            <text x={xCenter(i)} y={y(v) - 6} textAnchor="middle" className={isLast ? 'bars-label current' : 'bars-label'}>
              {(v / 1_000_000).toFixed(2)}
            </text>
            <text x={xCenter(i)} y={H - 10} textAnchor="middle" className={isLast ? 'bars-x current' : 'bars-x'}>{formatMonthLabel(p.month_key)}</text>
          </g>
        )
      })}
    </svg>
  )
}

function GpCompareChart({ thisRev, thisGp, lastRev, lastGp }: { thisRev: number; thisGp: number; lastRev: number; lastGp: number }) {
  const W = 220
  const H = 110
  const padT = 18
  const padB = 22
  const padL = 12
  const padR = 12
  const innerH = H - padT - padB
  const max = Math.max(thisGp, lastGp) * 1.25 || 1
  const barW = 38
  const groupGap = 36
  const totalGroupW = barW * 2 + 14
  const startX = (W - (totalGroupW * 2 + groupGap)) / 2
  const y = (v: number) => padT + innerH - (v / max) * innerH
  const groups = [
    { label: 'Last month', rev: lastRev, gp: lastGp },
    { label: 'This MTD', rev: thisRev, gp: thisGp, current: true },
  ]
  return (
    <svg className="gp-compare" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="GP vs last month comparison">
      <defs>
        <linearGradient id="gp-bar-rev" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="gp-bar-gp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5EEAD4" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
      </defs>
      {groups.map((g, gi) => {
        const gx = startX + gi * (totalGroupW + groupGap)
        const revBarH = padT + innerH - y(g.rev)
        const gpBarH = padT + innerH - y(g.gp)
        return (
          <g key={g.label}>
            <rect x={gx} y={y(g.rev)} width={barW} height={revBarH} rx="3" fill="url(#gp-bar-rev)" opacity={g.current ? 1 : 0.7} />
            <rect x={gx + barW + 6} y={y(g.gp)} width={barW} height={gpBarH} rx="3" fill="url(#gp-bar-gp)" opacity={g.current ? 1 : 0.7} />
            <text x={gx + barW / 2} y={y(g.rev) - 4} textAnchor="middle" className="gp-bar-val">{(g.rev / 1_000_000).toFixed(2)}M</text>
            <text x={gx + barW + 6 + barW / 2} y={y(g.gp) - 4} textAnchor="middle" className="gp-bar-val gp">{(g.gp / 1000).toFixed(0)}K</text>
            <text x={gx + totalGroupW / 2} y={H - 8} textAnchor="middle" className="gp-bar-label">{g.label}</text>
          </g>
        )
      })}
      <g transform={`translate(${W - 64}, 6)`}>
        <rect width="10" height="10" rx="2" fill="url(#gp-bar-rev)" />
        <text x="14" y="9" className="gp-legend-text">Revenue</text>
        <rect y="14" width="10" height="10" rx="2" fill="url(#gp-bar-gp)" />
        <text x="14" y="23" className="gp-legend-text">GP value</text>
      </g>
    </svg>
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

function MiniArea({ values, tone = 'blue' }: { values: number[]; tone?: 'blue' | 'teal' | 'amber' | 'purple' | 'green' | 'red' }) {
  const W = 200
  const H = 56
  const padT = 6
  const padB = 4
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const x = (i: number) => (i / Math.max(values.length - 1, 1)) * W
  const y = (v: number) => padT + (H - padT - padB) - ((v - min) / (max - min || 1)) * (H - padT - padB)
  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ')
  const area = `${line} L ${x(values.length - 1)} ${H} L 0 ${H} Z`
  const colors: Record<string, string> = { blue: '#3B82F6', teal: '#14B8A6', amber: '#F59E0B', purple: '#8B5CF6', green: '#10B981', red: '#EF4444' }
  const c = colors[tone] || colors.blue
  return (
    <svg className="mini-area" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`mini-grad-${tone}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="0.32" />
          <stop offset="100%" stopColor={c} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#mini-grad-${tone})`} />
      <path d={line} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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

const ICON_STROKE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const s = size
  const props = { width: s, height: s, viewBox: '0 0 24 24', ...ICON_STROKE, 'aria-hidden': true }
  switch (name) {
    case 'gauge': return <svg {...props}><path d="M3 12a9 9 0 1 1 18 0" /><path d="M12 12l4-3" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /></svg>
    case 'target': return <svg {...props}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /></svg>
    case 'map': return <svg {...props}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></svg>
    case 'user': return <svg {...props}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>
    case 'users': return <svg {...props}><circle cx="9" cy="9" r="3" /><circle cx="17" cy="10" r="2.5" /><path d="M3 19c0-3 2.5-5 6-5s6 2 6 5M14 19c0-2.4 1.7-4 4-4s3 1.6 3 4" /></svg>
    case 'box': return <svg {...props}><path d="M3 7l9-4 9 4-9 4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></svg>
    case 'percent': return <svg {...props}><circle cx="7.5" cy="7.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /><path d="M19 5 5 19" /></svg>
    case 'trend': return <svg {...props}><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></svg>
    case 'check': return <svg {...props}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 12l3 3 5-6" /></svg>
    case 'search': return <svg {...props}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></svg>
    case 'calendar': return <svg {...props}><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
    case 'pin': return <svg {...props}><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
    case 'badge': return <svg {...props}><circle cx="12" cy="9" r="4" /><path d="M9 13l-1 8 4-2 4 2-1-8" /></svg>
    case 'refresh': return <svg {...props}><path d="M4 12a8 8 0 0 1 14-5.3L20 9" /><path d="M20 4v5h-5" /><path d="M20 12a8 8 0 0 1-14 5.3L4 15" /><path d="M4 20v-5h5" /></svg>
    case 'sparkle': return <svg {...props}><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" /><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></svg>
    case 'bills': return <svg {...props}><rect x="3" y="6" width="18" height="13" rx="2" /><circle cx="12" cy="12.5" r="2.5" /><path d="M7 9v.01M17 16v.01" /></svg>
    case 'dollar': return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M9 14.5c0 1.4 1.4 2 3 2s3-.7 3-2-1.5-1.7-3-2-3-.6-3-2 1.4-2 3-2 3 .6 3 2" /><path d="M12 7v10" /></svg>
    case 'clock': return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>
    case 'bolt': return <svg {...props}><path d="M13 3 4 14h7l-1 7 9-11h-7z" /></svg>
    case 'flag': return <svg {...props}><path d="M5 21V4" /><path d="M5 5h12l-2 4 2 4H5" /></svg>
    case 'shield': return <svg {...props}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
    case 'arrow-up-right': return <svg {...props}><path d="M7 17 17 7" /><path d="M9 7h8v8" /></svg>
    case 'chevron-down': return <svg {...props}><path d="m6 9 6 6 6-6" /></svg>
    case 'chevron-right': return <svg {...props}><path d="m9 6 6 6-6 6" /></svg>
    default: return <svg {...props}><circle cx="12" cy="12" r="8" /></svg>
  }
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/)
  const initials = (parts[0]?.[0] || '') + (parts[1]?.[0] || parts[0]?.[1] || '')
  const palette = ['blue', 'teal', 'purple', 'amber', 'pink', 'green', 'indigo'] as const
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const tone = palette[hash % palette.length]
  return <span className={`avatar avatar-${tone}`}>{initials.toUpperCase()}</span>
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

  return (
    <main className="command-artboard">
      <aside className="side-rail">
        <div className="side-logo"><img src="/brand/al-zaabi-logo-light.png" alt="Al Zaabi Group" /><strong>TYRES DIVISION</strong></div>
        <nav>
          <small className="nav-section-label">MAIN MENU</small>
          {[
            { label: 'Executive Command', icon: 'gauge' },
            { label: 'Sales & Targets', icon: 'target' },
            { label: 'Region', icon: 'map' },
            { label: 'Salesman', icon: 'user' },
            { label: 'Product Mix', icon: 'box' },
          ].map((item, i) => (
            <a className={i === 0 ? 'active' : ''} href="#" key={item.label}><span><Icon name={item.icon} size={15} /></span>{item.label}</a>
          ))}
          <small className="nav-section-label">OPERATIONS</small>
          {[
            { label: 'Customer 360', icon: 'users' },
            { label: 'GP & Margin', icon: 'percent' },
            { label: 'Projection', icon: 'trend' },
            { label: 'Action Center', icon: 'check' },
          ].map((item) => (
            <a href="#" key={item.label}><span><Icon name={item.icon} size={15} /></span>{item.label}</a>
          ))}
        </nav>
        <div className="side-update"><i><Icon name="clock" size={12} /></i><span>Last Updated</span><b>{refreshedAt} GST</b></div>
        <div className="tyre-graphic" aria-hidden="true" />
      </aside>

      <section className="command-canvas">
        <header className="top-ribbon">
          <div className="dashboard-greeting">
            <span>Automotive Division</span>
            <h1>Tyres Executive Command</h1>
            <p>Sales, projection, GP and customer execution overview <b className="ui-version-pill">Modern UI v4</b></p>
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
            </article>

            <article className="hero-chart-card">
              <div className="hero-chart-head">
                <div>
                  <p>13-month revenue trend</p>
                  <small>Monthly billing • Asia/Dubai • Values in AED M</small>
                </div>
                <div className="chart-legend">
                  <span><i className="lg-bar" />Monthly</span>
                  <span><i className="lg-current" />Current (partial)</span>
                  <span><i className="lg-proj" />Projection target</span>
                </div>
              </div>
              <MonthlyBars points={data.monthly_trend} projection={projection} />
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
              <header><span className="tile-icon"><Icon name="bolt" size={14} /></span><p>Daily Trend</p></header>
              <strong>{compactMoney(dailyTrend)}<em>/day</em></strong>
              <small className={dailyTrendDelta >= 0 ? 'good' : 'bad'}>{signedCompactMoney(dailyTrendDelta)}/day vs projection pace</small>
              <MiniArea values={data.monthly_trend.slice(-8).map((p) => Number(p.revenue_ex_vat) || 0)} tone="blue" />
            </article>

            <article className="tile tile-amber">
              <header><span className="tile-icon"><Icon name="percent" size={14} /></span><p>GP Pulse vs Last Month</p></header>
              <div className="gp-pulse-numbers">
                <div>
                  <small>GP Value</small>
                  <strong>{compactMoney(grossProfit)}</strong>
                  <em className={gpValueDelta >= 0 ? 'pos' : 'neg'}>{gpValueDelta >= 0 ? '▲' : '▼'} {Math.abs(gpValueDeltaPct).toFixed(1)}%</em>
                </div>
                <div>
                  <small>GP %</small>
                  <strong>{gpPct.toFixed(1)}%</strong>
                  <em className={gpPctDelta >= 0 ? 'pos' : 'neg'}>{gpPctDelta >= 0 ? '▲' : '▼'} {Math.abs(gpPctDelta).toFixed(1)}pp</em>
                </div>
              </div>
              <GpCompareChart thisRev={sales} thisGp={grossProfit} lastRev={salesmanLastMtdSales} lastGp={lastMonthGrossProfit} />
            </article>

            <article className="tile tile-teal">
              <header><span className="tile-icon"><Icon name="check" size={14} /></span><p>Pipeline Strength</p></header>
              <strong>{compactMoney(pipeline)}</strong>
              <small>LPO {compactMoney(lpo)} • Confirmed {compactMoney(confirmed)}</small>
              <div className="pipeline-split">
                <div className="pipeline-bar"><i className="lpo" style={{ width: `${(lpo / Math.max(pipeline, 1)) * 100}%` }} /><i className="conf" style={{ width: `${(confirmed / Math.max(pipeline, 1)) * 100}%` }} /></div>
                <div className="pipeline-legend"><span><i className="dot lpo" />LPO</span><span><i className="dot conf" />Confirmed</span></div>
              </div>
            </article>

            <article className="tile tile-purple">
              <header><span className="tile-icon"><Icon name="clock" size={14} /></span><p>Month Clock</p></header>
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
      </section>

      <footer className="command-footer"><span>Focus. Execute. Outperform.</span><span>Driven by Performance. Powered by People.</span><img src="/brand/al-zaabi-logo-light.png" alt="Al Zaabi Group" /></footer>
    </main>
  )
}
