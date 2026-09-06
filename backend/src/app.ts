import { feathers } from '@feathersjs/feathers'
import { bodyParser, errorHandler, koa, rest } from '@feathersjs/koa'
import knex, { type Knex } from 'knex'

export interface HealthStatus {
  status: 'ok'
  database: 'connected'
}

class HealthService {
  constructor(private readonly database: Knex) {}

  async find(): Promise<HealthStatus> {
    const record = await this.database('electricitydata').select('id').first()

    if (!record) {
      throw new Error('The electricity database contains no data')
    }

    return {
      status: 'ok',
      database: 'connected'
    }
  }
}

interface ServiceTypes {
  health: HealthService
}

interface Configuration {
  postgresqlClient: Knex
}

const defaultDatabaseUrl = 'postgresql://academy:academy@localhost:15432/electricity'

export function createApp(databaseUrl = process.env.DATABASE_URL ?? defaultDatabaseUrl) {
  const app = koa(feathers<ServiceTypes, Configuration>())
  const postgresqlClient = knex({
    client: 'pg',
    connection: databaseUrl
  })

  app.set('postgresqlClient', postgresqlClient)
  app.use(errorHandler())
  app.use(bodyParser())
  app.configure(rest())
  app.use('health', new HealthService(postgresqlClient), {
    methods: ['find']
  })

  return app
}
