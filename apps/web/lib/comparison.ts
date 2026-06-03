import { dashboardData, type DashboardSample } from './dashboard-data'

export type ComparisonBasis = 'mtd-actual' | 'prorated'

export type PeriodComparison = {
  /** Current MTD figures */
  thisRev: number
  thisGp: number
  thisGpPct: number

  /** Last-month equivalent values (prorated to current elapsed days when needed) */
  lastRev: number
  lastGp: number
  lastGpPct: number

  /** Full last-month values for reference */
  lastRevFull: number
  lastGpFull: number

  /** Deltas */
  revDelta: number
  revDeltaPct: number | null
  gpDelta: number
  gpDeltaPct: number | null
  gpPctDelta: number

  /** Which comparison basis was applied */
  basis: ComparisonBasis
  /** Human-readable label e.g. "May prorated to Day 3" or "same period last month" */
  label: string

  elapsedDays: number
  daysInMonth: number
}

const DEFAULT_LAST_GP_PCT_FALLBACK = 22.0

function daysInMonthFromKey(monthKey: string): number {
  const [y, m] = monthKey.split('-').map(Number)
  if (!y || !m) return 31
  return new Date(y, m, 0).getDate()
}

/**
 * Compute current-month MTD vs same-period last-month, with safe fallbacks.
 *
 * Why this exists: the snapshot's `salesman_leaderboard[].last_month_mtd_sales` field
 * is unreliable across boundaries — on the first few days of a new month it tends to
 * return the previous month's *full* total instead of the same-day MTD, which produces
 * nonsense deltas like "−92.6% vs last month" when comparing 3 days to 31 days.
 *
 * This helper computes the comparison ourselves by prorating last month's known
 * full-period values to the same fraction of elapsed days. It always returns deltas
 * with both an AED amount and a %.
 */
export function computeComparison(data: DashboardSample = dashboardData): PeriodComparison {
  const ctx = data.context
  const bridge = data.command_center.shortfall_bridge
  const gp = data.command_center.gp_mtd

  const elapsedDays = Math.max(Number(ctx.day_of_month || 0), 1)
  const daysInMonth = Math.max(Number(ctx.days_in_month || elapsedDays), elapsedDays)

  // Current MTD values
  const thisRev = Number(bridge.actual_sales || 0)
  const thisGp = Number(gp.gross_profit || 0)
  const thisGpPct = Number(gp.gp_pct || 0)

  // Last month full values: monthly_trend[-2] is the just-completed prior month
  const monthly = data.monthly_trend as Array<{ month_key: string; revenue_ex_vat: number }>
  const lastMonthEntry = monthly.length >= 2 ? monthly[monthly.length - 2] : null
  const lastRevFull = Number(lastMonthEntry?.revenue_ex_vat || 0)
  const lastMonthKey = String(lastMonthEntry?.month_key || '')
  const daysInLastMonth = lastMonthKey ? daysInMonthFromKey(lastMonthKey) : 31

  // Last month GP value: try salesman_leaderboard aggregate, fall back to imputed
  const salesmanLastGp = data.salesman_leaderboard.reduce((sum, row) => sum + Number(row.last_month_gross_profit || 0), 0)
  const salesmanLastCostedRev = data.salesman_leaderboard.reduce((sum, row) => sum + Number(row.last_month_costed_revenue || 0), 0)

  // If the salesman_leaderboard aggregate is healthy, use it; otherwise fall back to revenue × baseline GP%
  let lastGpFull: number
  let lastGpPct: number
  if (salesmanLastCostedRev > 0 && salesmanLastGp > 0) {
    lastGpFull = salesmanLastGp
    lastGpPct = (salesmanLastGp / salesmanLastCostedRev) * 100
  } else {
    // Fallback: assume last month closed at the snapshot's baseline GP%
    const fallbackGpPct = thisGpPct > 0 ? thisGpPct : DEFAULT_LAST_GP_PCT_FALLBACK
    lastGpPct = fallbackGpPct
    lastGpFull = lastRevFull * (fallbackGpPct / 100)
  }

  // Prorate to the same fraction of elapsed days
  const elapsedFraction = daysInLastMonth > 0 ? elapsedDays / daysInLastMonth : 0
  const proratedLastRev = lastRevFull * elapsedFraction
  const proratedLastGp = lastGpFull * elapsedFraction

  // Lean on the prorated comparison when current month is materially incomplete or
  // when MTD-actual would be wildly larger than current MTD (signals a bad MTD field)
  const basis: ComparisonBasis = 'prorated'
  const lastRev = proratedLastRev
  const lastGp = proratedLastGp

  const revDelta = thisRev - lastRev
  const revDeltaPct = lastRev > 0 ? (revDelta / lastRev) * 100 : null
  const gpDelta = thisGp - lastGp
  const gpDeltaPct = lastGp > 0 ? (gpDelta / lastGp) * 100 : null
  const gpPctDelta = thisGpPct - lastGpPct

  return {
    thisRev,
    thisGp,
    thisGpPct,
    lastRev,
    lastGp,
    lastGpPct,
    lastRevFull,
    lastGpFull,
    revDelta,
    revDeltaPct,
    gpDelta,
    gpDeltaPct,
    gpPctDelta,
    basis,
    label: 'same period last month',
    elapsedDays,
    daysInMonth,
  }
}
