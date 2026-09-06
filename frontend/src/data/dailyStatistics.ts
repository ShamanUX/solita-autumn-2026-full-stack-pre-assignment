export interface DailyStatistic {
  date: string
  averageProduction: number | null
  averageConsumption: number | null
  averagePrice: number | null
}

export type StatisticSortField = keyof DailyStatistic
export type SortDirection = 'asc' | 'desc'

export interface DailyStatisticsQuery {
  from: string
  to: string
  page: number
  pageSize: number
  sortField: StatisticSortField
  sortDirection: SortDirection
}

export interface DailyStatisticsPage {
  data: DailyStatistic[]
  total: number
}

const dailyStatistics: DailyStatistic[] = [
  {
    date: '2024-09-01',
    averageProduction: 29941,
    averageConsumption: 4033477.7,
    averagePrice: 1.044,
  },
  {
    date: '2024-09-02',
    averageProduction: 32680.7,
    averageConsumption: 4619430.2,
    averagePrice: 2.999,
  },
  {
    date: '2024-09-03',
    averageProduction: 28823.3,
    averageConsumption: 4621043.9,
    averagePrice: 8.528,
  },
  {
    date: '2024-09-04',
    averageProduction: 26104.7,
    averageConsumption: 4642882.9,
    averagePrice: 9.692,
  },
  {
    date: '2024-09-05',
    averageProduction: 25042,
    averageConsumption: 4633565.3,
    averagePrice: 9.188,
  },
  {
    date: '2024-09-06',
    averageProduction: 29982.4,
    averageConsumption: 4557903.2,
    averagePrice: 4.773,
  },
  {
    date: '2024-09-07',
    averageProduction: 29543.7,
    averageConsumption: 4076202.6,
    averagePrice: 2.271,
  },
  {
    date: '2024-09-08',
    averageProduction: 27845.6,
    averageConsumption: 3986060.7,
    averagePrice: 1.821,
  },
  {
    date: '2024-09-09',
    averageProduction: 31409.2,
    averageConsumption: 4573993.5,
    averagePrice: 0.185,
  },
  {
    date: '2024-09-10',
    averageProduction: 31986.4,
    averageConsumption: 4634939.7,
    averagePrice: 0.075,
  },
  {
    date: '2024-09-11',
    averageProduction: 30327.3,
    averageConsumption: 4618696,
    averagePrice: 5.196,
  },
  {
    date: '2024-09-12',
    averageProduction: 26447.7,
    averageConsumption: 4536838.4,
    averagePrice: 14.024,
  },
  {
    date: '2024-09-13',
    averageProduction: 23932.4,
    averageConsumption: 4565281.1,
    averagePrice: 24.864,
  },
  {
    date: '2024-09-14',
    averageProduction: 26506.8,
    averageConsumption: 4238389,
    averagePrice: 7.907,
  },
  {
    date: '2024-09-15',
    averageProduction: 25604.1,
    averageConsumption: 4120652.2,
    averagePrice: 11.201,
  },
  {
    date: '2024-09-16',
    averageProduction: 26664.4,
    averageConsumption: 4691704.2,
    averagePrice: 22.094,
  },
  {
    date: '2024-09-17',
    averageProduction: 26476.2,
    averageConsumption: 4686383.9,
    averagePrice: 15.548,
  },
  {
    date: '2024-09-18',
    averageProduction: 29767.8,
    averageConsumption: 4796654.7,
    averagePrice: 6.889,
  },
  {
    date: '2024-09-19',
    averageProduction: 30533.2,
    averageConsumption: 4754733.7,
    averagePrice: 7.27,
  },
  {
    date: '2024-09-20',
    averageProduction: 30395.6,
    averageConsumption: 4620873,
    averagePrice: 9.087,
  },
]

export async function getDailyStatistics(
  query: DailyStatisticsQuery,
): Promise<DailyStatisticsPage> {
  const filtered = dailyStatistics.filter(
    ({ date }) =>
      (!query.from || date >= query.from) && (!query.to || date <= query.to),
  )

  const sorted = [...filtered].sort((left, right) => {
    const leftValue = left[query.sortField]
    const rightValue = right[query.sortField]

    if (leftValue === rightValue) return 0
    if (leftValue === null) return 1
    if (rightValue === null) return -1

    const order = leftValue < rightValue ? -1 : 1
    return query.sortDirection === 'asc' ? order : -order
  })
  const start = query.page * query.pageSize

  return Promise.resolve({
    data: sorted.slice(start, start + query.pageSize),
    total: sorted.length,
  })
}
