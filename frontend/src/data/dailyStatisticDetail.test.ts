import { afterEach, describe, expect, it, vi } from 'vitest'

import { getDailyStatisticDetail } from './dailyStatisticDetail.js'

const detail = {
  date: '2024-09-01',
  totalProduction: 718585,
  totalConsumption: 96803463.9,
  averagePrice: 1.044,
  peakConsumptionRatioHour: null,
  cheapestHours: [],
  hours: [],
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getDailyStatisticDetail', () => {
  it('requests the selected date', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(detail),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(getDailyStatisticDetail('2024-09-01')).resolves.toEqual(detail)
    expect(fetchMock).toHaveBeenCalledWith('/daily-statistics/2024-09-01')
  })

  it('rejects unsuccessful responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    )

    await expect(getDailyStatisticDetail('2030-01-01')).rejects.toThrow(
      'Daily statistic detail request failed with 404',
    )
  })
})
