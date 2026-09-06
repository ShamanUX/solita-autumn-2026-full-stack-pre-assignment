import { describe, expect, it } from 'vitest'

import {
  getDailyStatistics,
  type DailyStatisticsQuery,
} from './dailyStatistics.js'

const defaultQuery: DailyStatisticsQuery = {
  from: '',
  to: '',
  page: 0,
  pageSize: 10,
  sortField: 'date',
  sortDirection: 'asc',
}

describe('getDailyStatistics', () => {
  it('filters dates inclusively', async () => {
    const result = await getDailyStatistics({
      ...defaultQuery,
      from: '2024-09-10',
      to: '2024-09-12',
    })

    expect(result.total).toBe(3)
    expect(result.data.map(({ date }) => date)).toEqual([
      '2024-09-10',
      '2024-09-11',
      '2024-09-12',
    ])
  })

  it('sorts and paginates numeric fields', async () => {
    const result = await getDailyStatistics({
      ...defaultQuery,
      page: 1,
      pageSize: 5,
      sortField: 'averagePrice',
      sortDirection: 'desc',
    })

    expect(result.total).toBe(20)
    expect(result.data).toHaveLength(5)
    expect(result.data.map(({ averagePrice }) => averagePrice)).toEqual([
      9.692, 9.188, 9.087, 8.528, 7.907,
    ])
  })
})
