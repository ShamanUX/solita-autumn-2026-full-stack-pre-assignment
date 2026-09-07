import { BadRequest, NotFound } from '@feathersjs/errors'
import type { Id, Params } from '@feathersjs/feathers'
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

export interface HourlyStatistic {
  startTime: string
  production: number | null
  consumption: number | null
  price: number | null
}

export interface PeakConsumptionRatioHour extends HourlyStatistic {
  consumptionProductionRatio: number
}

export interface DailyStatisticDetail {
  date: string
  totalProduction: number | null
  totalConsumption: number | null
  averagePrice: number | null
  peakConsumptionRatioHour: PeakConsumptionRatioHour | null
  cheapestHours: HourlyStatistic[]
  hours: HourlyStatistic[]
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

interface DatabaseHourlyStatistic {
  startTime: string
  production: string | null
  consumption: string | null
  price: string | null
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

function consumptionToMWh(value: string | null): number | null {
  return value === null ? null : Number(value) / 1000
}

function round(value: number, fractionDigits: number): number {
  const multiplier = 10 ** fractionDigits
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier
}

function sum(values: Array<number | null>, fractionDigits: number) {
  const availableValues = values.filter(
    (value): value is number => value !== null,
  )
  return availableValues.length === 0
    ? null
    : round(
        availableValues.reduce((total, value) => total + value, 0),
        fractionDigits,
      )
}

function average(values: Array<number | null>, fractionDigits: number) {
  const availableValues = values.filter(
    (value): value is number => value !== null,
  )
  return availableValues.length === 0
    ? null
    : round(
        availableValues.reduce((total, value) => total + value, 0) /
          availableValues.length,
        fractionDigits,
      )
}

export class DailyStatisticsService {
  constructor(private readonly database: Knex) {}

  async get(id: Id): Promise<DailyStatisticDetail> {
    const date = parseDate(id, 'date')
    if (date === undefined) throw new BadRequest('date is required')

    console.debug('Fetching daily statistic detail from database', { date })
    const rows = (await this.database('electricitydata')
      .select({
        startTime: this.database.raw(`TO_CHAR(??, 'YYYY-MM-DD"T"HH24:MI:SS')`, [
          'starttime',
        ]),
        production: 'productionamount',
        consumption: 'consumptionamount',
        price: 'hourlyprice',
      })
      .where('date', date)
      .whereNotNull('starttime')
      .orderBy('starttime', 'asc')) as DatabaseHourlyStatistic[]

    if (rows.length === 0) {
      throw new NotFound(`No electricity statistics found for ${date}`)
    }

    const hours = rows.map((row) => ({
      startTime: row.startTime,
      production: toNumber(row.production),
      consumption: consumptionToMWh(row.consumption),
      price: toNumber(row.price),
    }))
    const peakConsumptionRatioHour =
      hours.reduce<PeakConsumptionRatioHour | null>((peak, hour) => {
        if (
          hour.consumption === null ||
          hour.production === null ||
          hour.production === 0
        ) {
          return peak
        }

        const candidate = {
          ...hour,
          consumptionProductionRatio: round(
            hour.consumption / hour.production,
            3,
          ),
        }
        return peak === null ||
          candidate.consumptionProductionRatio > peak.consumptionProductionRatio
          ? candidate
          : peak
      }, null)
    const cheapestHours = hours
      .filter(
        (hour): hour is HourlyStatistic & { price: number } =>
          hour.price !== null,
      )
      .sort(
        (first, second) =>
          first.price - second.price ||
          first.startTime.localeCompare(second.startTime),
      )
      .slice(0, 5)

    return {
      date,
      totalProduction: sum(
        hours.map((hour) => hour.production),
        0,
      ),
      totalConsumption: sum(
        hours.map((hour) => hour.consumption),
        0,
      ),
      averagePrice: average(
        hours.map((hour) => hour.price),
        3,
      ),
      peakConsumptionRatioHour,
      cheapestHours,
      hours,
    }
  }

  async find(
    params?: Params<Record<string, unknown>>,
  ): Promise<DailyStatisticsPage> {
    const query = parseQuery(params?.query)
    console.debug('Fetching daily statistics from database', query)
    const filteredRows = this.database('electricitydata').whereNotNull('date')

    if (query.from) filteredRows.where('date', '>=', query.from)
    if (query.to) filteredRows.where('date', '<=', query.to)

    const statisticsQuery = filteredRows
      .clone()
      .select({
        date: this.database.raw("TO_CHAR(??, 'YYYY-MM-DD')", ['date']),
        averageProduction: this.database.raw('ROUND(AVG(??), 0)', [
          'productionamount',
        ]),
        averageConsumption: this.database.raw('ROUND(AVG(??) / 1000, 0)', [
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
