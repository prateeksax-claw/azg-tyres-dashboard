import { dashboardData, type DashboardSample } from './dashboard-data'

export type EtoMethod = 'linear' | 'smoothed'

export type EtoResult = {
  /** Estimated month-end revenue close (AED) */
  eto: number
  /** Multiplier applied to MTD to project ETO */
  ratio: number
  /** Which methodology was applied */
  method: EtoMethod
  /** Components for explainability */
  components: {
    elapsedDays: number
    daysInMonth: number
    daysRemaining: number
    sales: number
    /** Last full month revenue (from monthly_trend) */
    lastMonthFull: number
    /** Last month sales by the same day-of-month (from salesman_leaderboard.last_month_mtd_sales aggregate) */
    lastMonthMtdAtSamePeriod: number
    /** Pure MTD ÷ elapsed × total */
    linearRatio: number
    /** lastMonthFull ÷ lastMonthMtdAtSamePeriod */
    calibrationRatio: number | null
    /** Same as calibrationRatio but capped to ±25% of linearRatio */
    safeCalibrationRatio: number | null
    /** Linear ETO value (for comparison) */
    linearEto: number
  }
}

/**
 * Smoothed ETO estimate.
 *
 * Pure linear extrapolation (MTD ÷ elapsed × total) is noisy day-to-day — a few
 * heavy days late in the month can swing the close estimate by hundreds of
 * thousands. We don't have daily-granularity data in the snapshot, so a true
 * EWMA over recent days is not possible. Instead we anchor the projection
 * against last month's actual same-period-to-full ratio (a snapshot's
 * `salesman.last_month_mtd_sales` aggregate gives us MTD-at-same-day for the
 * previous month, and `monthly_trend[-2]` gives us full-month revenue).
 *
 * The final multiplier is a 60/40 blend of the calibration ratio and the
 * linear ratio, with the calibration ratio capped to ±25% of linear to avoid
 * blow-ups when last month was anomalous (e.g. holiday-shortened).
 */
export function computeEto(data: DashboardSample = dashboardData): EtoResult {
  const ctx = data.context
  const bridge = data.command_center.shortfall_bridge
  const sales = Number(bridge.actual_sales || 0)
  const elapsedDays = Math.max(Number(ctx.day_of_month || 0), 1)
  const daysInMonth = Math.max(Number(ctx.days_in_month || elapsedDays), elapsedDays)
  const daysRemaining = Math.max(daysInMonth - elapsedDays, 0)

  const linearRatio = daysInMonth / elapsedDays
  const linearEto = sales * linearRatio

  const monthly = data.monthly_trend as Array<{ month_key: string; revenue_ex_vat: number }>
  const lastMonthFull = monthly.length >= 2 ? Number(monthly[monthly.length - 2].revenue_ex_vat || 0) : 0
  const lastMonthMtdAtSamePeriod = data.salesman_leaderboard.reduce((sum, row) => sum + Number(row.last_month_mtd_sales || 0), 0)

  let ratio = linearRatio
  let method: EtoMethod = 'linear'
  let calibrationRatio: number | null = null
  let safeCalibrationRatio: number | null = null

  if (lastMonthFull > 0 && lastMonthMtdAtSamePeriod > 0) {
    calibrationRatio = lastMonthFull / lastMonthMtdAtSamePeriod
    // Cap to ±25% of linear so an anomalous last month can't blow the projection up or down
    safeCalibrationRatio = Math.max(
      linearRatio * 0.75,
      Math.min(linearRatio * 1.25, calibrationRatio),
    )
    // 60% calibration, 40% linear — favours the more stable pattern but stays anchored to current pace
    ratio = 0.6 * safeCalibrationRatio + 0.4 * linearRatio
    method = 'smoothed'
  }

  const eto = sales * ratio

  return {
    eto,
    ratio,
    method,
    components: {
      elapsedDays,
      daysInMonth,
      daysRemaining,
      sales,
      lastMonthFull,
      lastMonthMtdAtSamePeriod,
      linearRatio,
      calibrationRatio,
      safeCalibrationRatio,
      linearEto,
    },
  }
}
