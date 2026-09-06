import { useEffect, useState } from 'react'
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid'

import {
  getDailyStatistics,
  type DailyStatistic,
  type StatisticSortField,
} from '../data/dailyStatistics.js'
import { DailyStatisticsView } from './DailyStatisticsView.js'
import type { DateRange } from './DateRangeFilter.js'

const emptyDateRange: DateRange = { from: '', to: '' }

export function DailyStatisticsContainer() {
  const [dateInputs, setDateInputs] = useState<DateRange>(emptyDateRange)
  const [dateRange, setDateRange] = useState<DateRange>(emptyDateRange)
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

  const invalidDateRange = Boolean(
    dateInputs.from && dateInputs.to && dateInputs.from > dateInputs.to,
  )

  useEffect(() => {
    let current = true
    const sort = sortModel[0]

    setLoading(true)
    setError(false)

    void getDailyStatistics({
      ...dateRange,
      page: pagination.page,
      pageSize: pagination.pageSize,
      sortField: (sort?.field ?? 'date') as StatisticSortField,
      sortDirection: sort?.sort === 'asc' ? 'asc' : 'desc',
    })
      .then((result) => {
        if (!current) return
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
  }, [dateRange, loadAttempt, pagination, sortModel])

  function applyDateRange() {
    if (invalidDateRange) return

    setPagination((current) => ({ ...current, page: 0 }))
    setDateRange(dateInputs)
  }

  function clearDateRange() {
    setDateInputs(emptyDateRange)
    setDateRange(emptyDateRange)
    setPagination((current) => ({ ...current, page: 0 }))
  }

  function changeSort(sort: GridSortModel) {
    setSortModel(sort)
    setPagination((current) => ({ ...current, page: 0 }))
  }

  return (
    <DailyStatisticsView
      dateInputs={dateInputs}
      invalidDateRange={invalidDateRange}
      rows={rows}
      rowCount={rowCount}
      pagination={pagination}
      sortModel={sortModel}
      loading={loading}
      error={error}
      onDateInputsChange={setDateInputs}
      onApplyDateRange={applyDateRange}
      onClearDateRange={clearDateRange}
      onPaginationChange={setPagination}
      onSortChange={changeSort}
      onRetry={() => setLoadAttempt((value) => value + 1)}
    />
  )
}
