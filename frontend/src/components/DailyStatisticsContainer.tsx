import { useEffect, useState } from 'react'
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid'

import {
  getDailyStatisticDetail,
  type DailyStatisticDetail,
} from '../data/dailyStatisticDetail.js'
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
  const [month, setMonth] = useState('2024-09')
  const [tableRows, setTableRows] = useState<DailyStatistic[]>([])
  const [tableRowCount, setTableRowCount] = useState(0)
  const [tableLoading, setTableLoading] = useState(true)
  const [tableError, setTableError] = useState(false)
  const [tableLoadAttempt, setTableLoadAttempt] = useState(0)
  const [graphRows, setGraphRows] = useState<DailyStatistic[]>([])
  const [graphLoading, setGraphLoading] = useState(false)
  const [graphError, setGraphError] = useState(false)
  const [graphLoadAttempt, setGraphLoadAttempt] = useState(0)
  const [graphActivated, setGraphActivated] = useState(false)
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'date', sort: 'desc' },
  ])
  const [display, setDisplay] = useState<StatisticsDisplay>('table')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [detail, setDetail] = useState<DailyStatisticDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(false)
  const [detailLoadAttempt, setDetailLoadAttempt] = useState(0)
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

    setTableLoading(true)
    setTableError(false)

    const selectedSort = sortModel[0]
    void getDailyStatistics({
      from: appliedDateRange.from,
      to: appliedDateRange.to,
      page: pagination.page,
      pageSize: 10,
      sortField: (selectedSort?.field ?? 'date') as StatisticSortField,
      sortDirection: selectedSort?.sort ?? ('desc' as const),
    })
      .then((result) => {
        if (!current) return

        setTableRows(result.data)
        setTableRowCount(result.total)
      })
      .catch(() => {
        if (current) setTableError(true)
      })
      .finally(() => {
        if (current) setTableLoading(false)
      })

    return () => {
      current = false
    }
  }, [appliedDateRange, pagination.page, sortModel, tableLoadAttempt])

  useEffect(() => {
    if (!graphActivated) return

    let current = true
    setGraphLoading(true)
    setGraphError(false)

    void getDailyStatistics({
      from: `${month}-01`,
      to: getMonthEnd(month),
      page: 0,
      pageSize: 31,
      sortField: 'date',
      sortDirection: 'asc',
    })
      .then((result) => {
        if (current) setGraphRows(result.data)
      })
      .catch(() => {
        if (current) setGraphError(true)
      })
      .finally(() => {
        if (current) setGraphLoading(false)
      })

    return () => {
      current = false
    }
  }, [graphActivated, graphLoadAttempt, month])

  useEffect(() => {
    if (selectedDate === null) return

    let current = true
    setDetail(null)
    setDetailLoading(true)
    setDetailError(false)

    void getDailyStatisticDetail(selectedDate)
      .then((result) => {
        if (current) setDetail(result)
      })
      .catch(() => {
        if (current) setDetailError(true)
      })
      .finally(() => {
        if (current) setDetailLoading(false)
      })

    return () => {
      current = false
    }
  }, [detailLoadAttempt, selectedDate])

  function changeMonth(nextMonth: string) {
    setGraphLoading(true)
    setMonth(nextMonth)
  }

  function changeSort(sort: GridSortModel) {
    setSortModel(sort)
    setPagination((current) => ({ ...current, page: 0 }))
  }

  function changeDisplay(nextDisplay: StatisticsDisplay) {
    if (nextDisplay === 'graph' && !graphActivated) {
      setGraphLoading(true)
      setGraphActivated(true)
    }
    setDisplay(nextDisplay)
  }

  const rows = display === 'table' ? tableRows : graphRows
  const loading = display === 'table' ? tableLoading : graphLoading
  const error = display === 'table' ? tableError : graphError

  return (
    <DailyStatisticsView
      month={month}
      latestMonth=""
      rows={rows}
      rowCount={tableRowCount}
      pagination={pagination}
      sortModel={sortModel}
      loading={loading}
      error={error}
      display={display}
      dateRange={dateRange}
      invalidDateRange={invalidDateRange}
      selectedDate={selectedDate}
      detail={detail}
      detailLoading={detailLoading}
      detailError={detailError}
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
      onRetry={() => {
        if (display === 'table') {
          setTableLoadAttempt((value) => value + 1)
        } else {
          setGraphLoadAttempt((value) => value + 1)
        }
      }}
      onDisplayChange={changeDisplay}
      onDaySelect={setSelectedDate}
      onDetailBack={() => setSelectedDate(null)}
      onDetailRetry={() => setDetailLoadAttempt((value) => value + 1)}
    />
  )
}
