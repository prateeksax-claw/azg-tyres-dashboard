import { dashboardData, type DashboardSample } from './dashboard-data'

export type ComparisonBasis = 'mtd-actual' | 'prorated' | 'unavailable'

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

  // Last month aggregates from salesman_leaderboard
  const salesmanLastMtd = data.salesman_leaderboard.reduce((sum, row) => sum + Number(row.last_month_mtd_sales || 0), 0)
  const salesmanLastGp = data.salesman_leaderboard.reduce((sum, row) => sum + Number(row.last_month_gross_profit || 0), 0)
  const salesmanLastCostedRev = data.salesman_leaderboard.reduce((sum, row) => sum + Number(row.last_month_costed_revenue || 0), 0)

  // Last month GP value: prefer salesman aggregate, otherwise fall back to revenue × baseline GP%
  let lastGpFull: number
  let lastGpPct: number
  if (salesmanLastCostedRev > 0 && salesmanLastGp > 0) {
    lastGpFull = salesmanLastGp
    lastGpPct = (salesmanLastGp / salesmanLastCostedRev) * 100
  } else {
    const fallbackGpPct = thisGpPct > 0 ? thisGpPct : DEFAULT_LAST_GP_PCT_FALLBACK
    lastGpPct = fallbackGpPct
    lastGpFull = lastRevFull * (fallbackGpPct / 100)
  }

  // Pick the comparison basis:
  // - 'mtd-actual'  → the snapshot's same-period MTD aggregate looks valid (> 0 and < 85% of full)
  // - 'prorated'    → fall back to uniform proration of last month's full value
  // - 'unavailable' → leaderboard is empty (early in the month) and prorated comparison would
  //                   mislead because most businesses (incl. tyres) bill back-loaded — better
  //                   to surface a "(forming)" tag than show a fabricated number
  const lastMonthMtdLooksReal =
    salesmanLastMtd > 0 && salesmanLastMtd < lastRevFull * 0.85

  let basis: ComparisonBasis
  let lastRev: number
  let lastGp: number
  let label: string

  const earlyMonth = elapsedDays <= 4 && !lastMonthMtdLooksReal

  if (lastMonthMtdLooksReal) {
    // Use the real same-period MTD aggregate from the snapshot
    basis = 'mtd-actual'
    lastRev = salesmanLastMtd
    // Scale GP by the same MTD/full ratio
    const lastMtdFraction = salesmanLastMtd / Math.max(lastRevFull, 1)
    lastGp = lastGpFull * lastMtdFraction
    label = 'same period last month'
  } else if (earlyMonth) {
    // Too early to compare — proration would mislead since last month was back-loaded
    basis = 'unavailable'
    lastRev = 0
    lastGp = 0
    label = 'same period last month'
  } else {
    // Mid/late month with missing data → uniform proration (rough but better than nothing)
    basis = 'prorated'
    const elapsedFraction = daysInLastMonth > 0 ? elapsedDays / daysInLastMonth : 0
    lastRev = lastRevFull * elapsedFraction
    lastGp = lastGpFull * elapsedFraction
    label = 'prorated last month'
  }

  const revDelta = basis === 'unavailable' ? 0 : thisRev - lastRev
  const revDeltaPct = basis === 'unavailable' || lastRev <= 0 ? null : (revDelta / lastRev) * 100
  const gpDelta = basis === 'unavailable' ? 0 : thisGp - lastGp
  const gpDeltaPct = basis === 'unavailable' || lastGp <= 0 ? null : (gpDelta / lastGp) * 100
  const gpPctDelta = basis === 'unavailable' ? 0 : thisGpPct - lastGpPct

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
    label,
    elapsedDays,
    daysInMonth,
  }
}
