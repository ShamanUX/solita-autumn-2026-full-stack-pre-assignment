import { once } from 'node:events'
import type { AddressInfo } from 'node:net'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createApp } from '../src/app.js'

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
      averageProduction: 34251.5,
      averageConsumption: null,
      averagePrice: 5.83,
    })
  })

  it('filters dates inclusively and returns rounded numeric averages', async () => {
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
          averageProduction: 29941,
          averageConsumption: 4033477.7,
          averagePrice: 1.044,
        },
      ],
      total: 1,
    })
  })

  it('applies page offsets and stable metric sorting with nulls last', async () => {
    const paginated = await app.service('daily-statistics').find({
      query: { page: 1, pageSize: 2 },
    })
    const sorted = await app.service('daily-statistics').find({
      query: {
        from: '2023-07-31',
        to: '2023-08-01',
        sortField: 'averageConsumption',
        sortDirection: 'desc',
      },
    })

    expect(paginated.data.map(({ date }) => date)).toEqual([
      '2024-09-29',
      '2024-09-28',
    ])
    expect(
      sorted.data.map(({ date, averageConsumption }) => ({
        date,
        averageConsumption,
      })),
    ).toEqual([
      { date: '2023-08-01', averageConsumption: 4219977.2 },
      { date: '2023-07-31', averageConsumption: null },
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
})
