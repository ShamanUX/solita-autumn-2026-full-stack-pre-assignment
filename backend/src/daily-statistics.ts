import { BadRequest } from '@feathersjs/errors'
import type { Params } from '@feathersjs/feathers'
import type { Knex } from 'knex'

export interface DailyStatistic {
  date: string
  averageProduction: number | null
  averageConsumption: number | null
  averagePrice: number | null
}

export interface DailyStatisticsPage {
  data: DailyStatistic[]
  total: number
}

type SortDirection = 'asc' | 'desc'
type SortField = keyof DailyStatistic

interface DailyStatisticsQuery {
  from?: string
  to?: string
  page: number
  pageSize: number
  sortField: SortField
  sortDirection: SortDirection
}

interface DatabaseDailyStatistic {
  date: string
  averageProduction: string | null
  averageConsumption: string | null
  averagePrice: string | null
}

interface DatabaseCount {
  total: string
}

const sortColumns: Record<SortField, string> = {
  date: 'date',
  averageProduction: 'averageProduction',
  averageConsumption: 'averageConsumption',
  averagePrice: 'averagePrice',
}

function parseDate(value: unknown, name: string): string | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequest(`${name} must be a date in YYYY-MM-DD format`)
  }

  const date = new Date(`${value}T00:00:00Z`)
  if (
    Number.isNaN(date.valueOf()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new BadRequest(`${name} must be a valid date`)
  }

  return value
}

function parseInteger(
  value: unknown,
  name: string,
  defaultValue: number,
  minimum: number,
  maximum?: number,
): number {
  if (value === undefined) return defaultValue

  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && /^(0|[1-9]\d*)$/.test(value)
        ? Number(value)
        : Number.NaN

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < minimum ||
    (maximum !== undefined && parsed > maximum)
  ) {
    const range =
      maximum === undefined
        ? `at least ${minimum}`
        : `between ${minimum} and ${maximum}`
    throw new BadRequest(`${name} must be an integer ${range}`)
  }

  return parsed
}

function parseQuery(query: Record<string, unknown> = {}): DailyStatisticsQuery {
  const from = parseDate(query.from, 'from')
  const to = parseDate(query.to, 'to')
  const page = parseInteger(query.page, 'page', 0, 0)
  const pageSize = parseInteger(query.pageSize, 'pageSize', 10, 1, 100)

  if (from && to && from > to) {
    throw new BadRequest('from must not be later than to')
  }
  if (!Number.isSafeInteger(page * pageSize)) {
    throw new BadRequest('page is too large')
  }

  const sortField = query.sortField ?? 'date'
  if (typeof sortField !== 'string' || !Object.hasOwn(sortColumns, sortField)) {
    throw new BadRequest(
      `sortField must be one of ${Object.keys(sortColumns).join(', ')}`,
    )
  }

  const sortDirection = query.sortDirection ?? 'desc'
  if (sortDirection !== 'asc' && sortDirection !== 'desc') {
    throw new BadRequest('sortDirection must be asc or desc')
  }

  return {
    ...(from === undefined ? {} : { from }),
    ...(to === undefined ? {} : { to }),
    page,
    pageSize,
    sortField: sortField as SortField,
    sortDirection,
  }
}

function toNumber(value: string | null): number | null {
  return value === null ? null : Number(value)
}

export class DailyStatisticsService {
  constructor(private readonly database: Knex) {}

  async find(
    params?: Params<Record<string, unknown>>,
  ): Promise<DailyStatisticsPage> {
    const query = parseQuery(params?.query)
    const filteredRows = this.database('electricitydata').whereNotNull('date')

    if (query.from) filteredRows.where('date', '>=', query.from)
    if (query.to) filteredRows.where('date', '<=', query.to)

    const statisticsQuery = filteredRows
      .clone()
      .select({
        date: this.database.raw("TO_CHAR(??, 'YYYY-MM-DD')", ['date']),
        averageProduction: this.database.raw('ROUND(AVG(??), 1)', [
          'productionamount',
        ]),
        averageConsumption: this.database.raw('ROUND(AVG(??), 1)', [
          'consumptionamount',
        ]),
        averagePrice: this.database.raw('ROUND(AVG(??), 3)', ['hourlyprice']),
      })
      .groupBy('date')
      .orderBy(sortColumns[query.sortField], query.sortDirection, 'last')
      .limit(query.pageSize)
      .offset(query.page * query.pageSize)

    if (query.sortField !== 'date') statisticsQuery.orderBy('date', 'desc')

    const [rows, count] = await Promise.all([
      statisticsQuery as Promise<DatabaseDailyStatistic[]>,
      filteredRows
        .clone()
        .countDistinct<DatabaseCount>({ total: 'date' })
        .first(),
    ])

    return {
      data: rows.map((row) => ({
        date: row.date,
        averageProduction: toNumber(row.averageProduction),
        averageConsumption: toNumber(row.averageConsumption),
        averagePrice: toNumber(row.averagePrice),
      })),
      total: Number(count?.total ?? 0),
    }
  }
}
