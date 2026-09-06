import type {
  DailyStatistic,
  DailyStatisticsPage,
} from '../../../backend/src/daily-statistics.js'

export type { DailyStatistic }

export type StatisticSortField = keyof DailyStatistic
export type SortDirection = 'asc' | 'desc'

export interface DailyStatisticsQuery {
  from: string
  to: string
  page: number
  pageSize: number
  sortField: StatisticSortField
  sortDirection: SortDirection
}

export async function getDailyStatistics(
  query: DailyStatisticsQuery,
): Promise<DailyStatisticsPage> {
  const parameters = new URLSearchParams()

  if (query.from) parameters.set('from', query.from)
  if (query.to) parameters.set('to', query.to)
  parameters.set('page', String(query.page))
  parameters.set('pageSize', String(query.pageSize))
  parameters.set('sortField', query.sortField)
  parameters.set('sortDirection', query.sortDirection)

  const url = `/daily-statistics?${parameters}`
  console.debug('Fetching daily statistics', url)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Daily statistics request failed with ${response.status}`)
  }

  return response.json() as Promise<DailyStatisticsPage>
}
