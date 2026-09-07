import { createApp } from './app.js'

const app = createApp()
const host = process.env.HOST ?? '0.0.0.0'
const port = Number.parseInt(process.env.PORT ?? '3030', 10)

async function start() {
  await app.service('health').find()

  const server = await app.listen(port, host)
  console.log(`Feathers API listening on http://${host}:${port}`)

  const shutdown = async () => {
    server.close()
    await app.get('postgresqlClient').destroy()
  }

  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)
}

start().catch(async (error: unknown) => {
  console.error('Failed to start Feathers API', error)
  await app.get('postgresqlClient').destroy()
  process.exitCode = 1
})
