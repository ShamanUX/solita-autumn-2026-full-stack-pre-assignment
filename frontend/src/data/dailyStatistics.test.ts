import { afterEach, describe, expect, it, vi } from 'vitest'

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

const page = {
  data: [
    {
      date: '2024-09-01',
      totalProduction: 718585,
      totalConsumption: 96803,
      averagePrice: 1.044,
    },
  ],
  total: 1,
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getDailyStatistics', () => {
  it('requests the backend with filters, sorting, and pagination', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(page),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await getDailyStatistics({
      ...defaultQuery,
      from: '2024-09-01',
      to: '2024-09-30',
      page: 1,
      pageSize: 5,
      sortField: 'averagePrice',
      sortDirection: 'desc',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/daily-statistics?from=2024-09-01&to=2024-09-30&page=1&pageSize=5&sortField=averagePrice&sortDirection=desc',
    )
    expect(result).toEqual(page)
  })

  it('omits empty date filters', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(page),
    })
    vi.stubGlobal('fetch', fetchMock)

    await getDailyStatistics(defaultQuery)

    expect(fetchMock).toHaveBeenCalledWith(
      '/daily-statistics?page=0&pageSize=10&sortField=date&sortDirection=asc',
    )
  })

  it('rejects unsuccessful responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    )

    await expect(getDailyStatistics(defaultQuery)).rejects.toThrow(
      'Daily statistics request failed with 503',
    )
  })
})
