import { money, pct } from './dashboard-data'

export function safePct(value: number) {
  return Number.isFinite(value) ? pct(value) : '—'
}

export function compactMoney(value: number) {
  return money(value).replace('.00', '')
}

export function signedCompactMoney(value: number) {
  const sign = value >= 0 ? '+' : '-'
  return `${sign}${compactMoney(Math.abs(value)).replace('AED ', '')}`
}

export function signedPct(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  const n = Number(value)
  const sign = n >= 0 ? '+' : '-'
  return `${sign}${Math.abs(n).toFixed(1)}%`
}

export function signedPp(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  const n = Number(value)
  const sign = n >= 0 ? '+' : '-'
  return `${sign}${Math.abs(n).toFixed(1)} pp`
}

export function formatMonthLabel(monthKey: string) {
  if (!monthKey) return ''
  const [y, m] = monthKey.split('-').map(Number)
  if (!y || !m) return monthKey
  return new Date(y, m - 1, 1).toLocaleString('en-GB', { month: 'short' })
}

export function formatGeneratedAt(value: string | null | undefined) {
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

export function metric(row: Record<string, unknown>, key: string, fallback = 0) {
  const value = row[key]
  if (value === null || value === undefined || value === '') return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function optionalMetric(row: Record<string, unknown>, key: string) {
  const value = row[key]
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}
