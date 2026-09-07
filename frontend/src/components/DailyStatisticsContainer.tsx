import { useEffect, useState } from 'react'
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid'

import {
  getDailyStatistics,
  type DailyStatistic,
  type StatisticSortField,
} from '../data/dailyStatistics.js'
import type { StatisticsDisplay } from './DailyStatisticsDisplay.js'
import { DailyStatisticsView } from './DailyStatisticsView.js'
import type { DateRange } from './DateRangeFilter.js'

function getMonthEnd(month: string) {
  const firstDay = new Date(`${month}-01T00:00:00Z`)
  return new Date(
    Date.UTC(firstDay.getUTCFullYear(), firstDay.getUTCMonth() + 1, 0),
  )
    .toISOString()
    .slice(0, 10)
}

export function DailyStatisticsContainer() {
  const [month, setMonth] = useState('')
  const [latestMonth, setLatestMonth] = useState('')
  const [rows, setRows] = useState<DailyStatistic[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'date', sort: 'desc' },
  ])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [display, setDisplay] = useState<StatisticsDisplay>('table')
  const [dateRange, setDateRange] = useState<DateRange>({ from: '', to: '' })
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange>({
    from: '',
    to: '',
  })
  const invalidDateRange = Boolean(
    dateRange.from && dateRange.to && dateRange.from > dateRange.to,
  )

  useEffect(() => {
    let current = true

    setLoading(true)
    setError(false)

    const selectedSort = sortModel[0]
    const query =
      display === 'table'
        ? {
            from: appliedDateRange.from,
            to: appliedDateRange.to,
            page: pagination.page,
            pageSize: 10,
            sortField: (selectedSort?.field ?? 'date') as StatisticSortField,
            sortDirection: selectedSort?.sort ?? ('desc' as const),
          }
        : month
          ? {
              from: `${month}-01`,
              to: getMonthEnd(month),
              page: 0,
              pageSize: 31,
              sortField: 'date' as StatisticSortField,
              sortDirection: 'asc' as const,
            }
          : {
              from: '',
              to: '',
              page: 0,
              pageSize: 1,
              sortField: 'date' as StatisticSortField,
              sortDirection: 'desc' as const,
            }

    void getDailyStatistics(query)
      .then((result) => {
        if (!current) return

        if (display === 'graph' && !month) {
          const latestDate = result.data[0]?.date
          if (latestDate) {
            const availableMonth = latestDate.slice(0, 7)
            setLatestMonth(availableMonth)
            setMonth(availableMonth)
          } else {
            setRows([])
          }
          return
        }

        setRows(result.data)
        setRowCount(result.total)
      })
      .catch(() => {
        if (current) setError(true)
      })
      .finally(() => {
        if (current) setLoading(false)
      })

    return () => {
      current = false
    }
  }, [appliedDateRange, display, loadAttempt, month, pagination.page, sortModel])

  function changeMonth(nextMonth: string) {
    setMonth(nextMonth)
  }

  function changeSort(sort: GridSortModel) {
    setSortModel(sort)
    setPagination((current) => ({ ...current, page: 0 }))
  }

  return (
    <DailyStatisticsView
      month={month}
      latestMonth={latestMonth}
      rows={rows}
      rowCount={rowCount}
      pagination={pagination}
      sortModel={sortModel}
      loading={loading}
      error={error}
      display={display}
      dateRange={dateRange}
      invalidDateRange={invalidDateRange}
      onMonthChange={changeMonth}
      onDateRangeChange={setDateRange}
      onDateRangeApply={() => {
        if (invalidDateRange) return
        setPagination((current) => ({ ...current, page: 0 }))
        setAppliedDateRange(dateRange)
      }}
      onDateRangeClear={() => {
        const emptyRange = { from: '', to: '' }
        setDateRange(emptyRange)
        setAppliedDateRange(emptyRange)
        setPagination((current) => ({ ...current, page: 0 }))
      }}
      onPaginationChange={setPagination}
      onSortChange={changeSort}
      onRetry={() => setLoadAttempt((value) => value + 1)}
      onDisplayChange={setDisplay}
    />
  )
}
