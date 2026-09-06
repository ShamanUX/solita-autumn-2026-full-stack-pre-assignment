import { afterAll, describe, expect, it } from 'vitest'

import { createApp } from '../src/app.js'

const app = createApp()

afterAll(async () => {
  await app.get('postgresqlClient').destroy()
})

describe('health service', () => {
  it('connects to the seeded PostgreSQL database through Feathers', async () => {
    await expect(app.service('health').find()).resolves.toEqual({
      status: 'ok',
      database: 'connected'
    })
  })
})
