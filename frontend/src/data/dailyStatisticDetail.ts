import type { DailyStatisticDetail } from '../../../backend/src/daily-statistics.js'

export type {
  DailyStatisticDetail,
  HourlyStatistic,
  PeakConsumptionRatioHour,
} from '../../../backend/src/daily-statistics.js'

export async function getDailyStatisticDetail(
  date: string,
): Promise<DailyStatisticDetail> {
  const url = `/daily-statistics/${encodeURIComponent(date)}`
  console.debug('Fetching daily statistic detail', url)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Daily statistic detail request failed with ${response.status}`,
    )
  }

  return response.json() as Promise<DailyStatisticDetail>
}
