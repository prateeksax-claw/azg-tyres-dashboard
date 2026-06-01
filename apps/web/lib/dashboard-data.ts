import sample from '../../../mock-data/dashboard_actual_snapshot.json'

type Dict = Record<string, any>

export type KpiContext = {
  as_of_date: string
  month_start: string
  month_end: string
  day_of_month: number
  days_in_month: number
  days_remaining_month: number
  month_key: string
  month_num?: number
  year_num?: number
}

export type DashboardSample = {
  generated_at: string
  context: KpiContext
  command_center: {
    shortfall_bridge: Dict
    gp_mtd: Dict
  }
  monthly_trend: Dict[]
  salesman_leaderboard: Dict[]
  region_current: Dict[]
  product_mix_top: Dict[]
  customer_top: Dict[]
  gp_alerts_top: Dict[]
  [key: string]: any
}

export const dashboardData: DashboardSample = sample as unknown as DashboardSample

export function money(value: number | string | null | undefined) {
  const n = Number(value ?? 0)
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${sign}AED ${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}AED ${(abs / 1_000).toFixed(1)}K`
  return `${sign}AED ${abs.toFixed(0)}`
}

export function pct(value: number | string | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return `${Number(value).toFixed(1)}%`
}

export function compact(value: number | string | null | undefined) {
  const n = Number(value ?? 0)
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toFixed(0)
}
