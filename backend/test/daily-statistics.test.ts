import { once } from 'node:events'
import type { AddressInfo } from 'node:net'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createApp } from '../src/application.js'

const app = createApp()
let server: Awaited<ReturnType<typeof app.listen>>
let baseUrl: string

beforeAll(async () => {
  server = await app.listen(0, '127.0.0.1')
  if (!server.listening) await once(server, 'listening')
  const address = server.address() as AddressInfo
  baseUrl = `http://127.0.0.1:${address.port}`
})

afterAll(async () => {
  server.close()
  await app.get('postgresqlClient').destroy()
})

describe('daily statistics service', () => {
  it('returns a paginated newest-first daily summary', async () => {
    const result = await app.service('daily-statistics').find()

    expect(result.total).toBe(1371)
    expect(result.data).toHaveLength(10)
    expect(result.data[0]).toEqual({
      date: '2024-10-01',
      totalProduction: 719282,
      totalConsumption: null,
      averagePrice: 5.83,
    })
  })

  it('filters dates inclusively and returns rounded numeric statistics', async () => {
    const result = await app.service('daily-statistics').find({
      query: {
        from: '2024-09-01',
        to: '2024-09-01',
      },
    })

    expect(result).toEqual({
      data: [
        {
          date: '2024-09-01',
          totalProduction: 718585,
          totalConsumption: 96803,
          averagePrice: 1.044,
        },
      ],
      total: 1,
    })
  })

  it('returns totals and hourly insights for one day', async () => {
    const result = await app.service('daily-statistics').get('2024-09-01')

    expect(result).toMatchObject({
      date: '2024-09-01',
      totalProduction: 718585,
      totalConsumption: 96803,
      averagePrice: 1.044,
      peakConsumptionRatioHour: {
        startTime: '2024-09-01T10:00:00',
        consumptionProductionRatio: 0.151,
      },
    })
    expect(result.hours).toHaveLength(24)
    expect(result.hours[0]).toEqual({
      startTime: '2024-09-01T00:00:00',
      production: 30687.35,
      consumption: 3456.794951,
      price: 0,
    })
    expect(result.cheapestHours).toHaveLength(5)
    expect(result.cheapestHours.map(({ startTime }) => startTime)).toEqual([
      '2024-09-01T00:00:00',
      '2024-09-01T03:00:00',
      '2024-09-01T04:00:00',
      '2024-09-01T05:00:00',
      '2024-09-01T06:00:00',
    ])
  })

  it('keeps unavailable single-day measurements null', async () => {
    const result = await app.service('daily-statistics').get('2024-10-01')

    expect(result.totalConsumption).toBeNull()
    expect(result.peakConsumptionRatioHour).toBeNull()
    expect(result.hours.every(({ consumption }) => consumption === null)).toBe(
      true,
    )
  })

  it('rejects invalid and unavailable single-day dates', async () => {
    await expect(
      app.service('daily-statistics').get('2024-02-30'),
    ).rejects.toMatchObject({ code: 400 })
    await expect(
      app.service('daily-statistics').get('2030-01-01'),
    ).rejects.toMatchObject({ code: 404 })
  })

  it('applies page offsets and stable metric sorting with nulls last', async () => {
    const paginated = await app.service('daily-statistics').find({
      query: { page: 1, pageSize: 2 },
    })
    const sorted = await app.service('daily-statistics').find({
      query: {
        from: '2023-07-31',
        to: '2023-08-01',
        sortField: 'totalConsumption',
        sortDirection: 'desc',
      },
    })

    expect(paginated.data.map(({ date }) => date)).toEqual([
      '2024-09-29',
      '2024-09-28',
    ])
    expect(
      sorted.data.map(({ date, totalConsumption }) => ({
        date,
        totalConsumption,
      })),
    ).toEqual([
      { date: '2023-08-01', totalConsumption: 101279 },
      { date: '2023-07-31', totalConsumption: null },
    ])
  })

  it.each([
    [{ from: '2024-02-30' }, 'from must be a valid date'],
    [
      { from: '2024-09-02', to: '2024-09-01' },
      'from must not be later than to',
    ],
    [{ page: -1 }, 'page must be an integer at least 0'],
    [{ page: Number.MAX_SAFE_INTEGER }, 'page is too large'],
    [{ pageSize: 101 }, 'pageSize must be an integer between 1 and 100'],
    [{ sortField: 'id' }, 'sortField must be one of'],
    [{ sortDirection: 'sideways' }, 'sortDirection must be asc or desc'],
  ])('rejects invalid query %j', async (query, message) => {
    await expect(
      app.service('daily-statistics').find({ query }),
    ).rejects.toMatchObject({
      code: 400,
      message: expect.stringContaining(message),
    })
  })

  it('exposes the query through REST and serializes validation errors', async () => {
    const response = await fetch(
      `${baseUrl}/daily-statistics?from=2024-09-01&to=2024-09-01&page=0&pageSize=5`,
    )
    const invalidResponse = await fetch(
      `${baseUrl}/daily-statistics?pageSize=invalid`,
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ total: 1 })
    expect(invalidResponse.status).toBe(400)
    await expect(invalidResponse.json()).resolves.toMatchObject({
      code: 400,
      name: 'BadRequest',
    })
  })

  it('exposes a single-day detail through REST', async () => {
    const response = await fetch(`${baseUrl}/daily-statistics/2024-09-01`)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      date: '2024-09-01',
      averagePrice: 1.044,
    })
  })
})
