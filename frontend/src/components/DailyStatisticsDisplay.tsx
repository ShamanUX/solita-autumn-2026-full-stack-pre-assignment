import RefreshIcon from '@mui/icons-material/Refresh'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import TableRowsIcon from '@mui/icons-material/TableRows'
import {
  Alert,
  Box,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid'

import type { DailyStatistic } from '../data/dailyStatistics.js'
import { DailyStatisticsChart } from './DailyStatisticsChart.js'
import { DailyStatisticsGrid } from './DailyStatisticsGrid.js'
import { DateRangeFilter, type DateRange } from './DateRangeFilter.js'
import { MonthSelector } from './MonthSelector.js'

export type StatisticsDisplay = 'graph' | 'table'

interface DailyStatisticsDisplayProps {
  display: StatisticsDisplay
  month: string
  latestMonth: string
  rows: DailyStatistic[]
  rowCount: number
  pagination: GridPaginationModel
  sortModel: GridSortModel
  loading: boolean
  error: boolean
  dateRange: DateRange
  invalidDateRange: boolean
  onDisplayChange: (display: StatisticsDisplay) => void
  onMonthChange: (month: string) => void
  onDateRangeChange: (dateRange: DateRange) => void
  onDateRangeApply: () => void
  onDateRangeClear: () => void
  onPaginationChange: (pagination: GridPaginationModel) => void
  onSortChange: (sortModel: GridSortModel) => void
  onRetry: () => void
  onDaySelect: (date: string) => void
}

export function DailyStatisticsDisplay({
  display,
  month,
  latestMonth,
  rows,
  rowCount,
  pagination,
  sortModel,
  loading,
  error,
  dateRange,
  invalidDateRange,
  onDisplayChange,
  onMonthChange,
  onDateRangeChange,
  onDateRangeApply,
  onDateRangeClear,
  onPaginationChange,
  onSortChange,
  onRetry,
  onDaySelect,
}: DailyStatisticsDisplayProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flex: { md: 1 },
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Box sx={{ p: { xs: 2.5, md: 2 }, pb: '0 !important' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>
              {display === 'graph'
                ? 'Daily statistics by month.'
                : 'Daily statistics'}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {loading
                ? 'Loading records...'
                : `${display === 'table' ? rowCount : rows.length} days found`}
            </Typography>
          </Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { sm: 'center' } }}
          >
            {display === 'graph' && (
              <MonthSelector
                month={month}
                latestMonth={latestMonth}
                onChange={onMonthChange}
              />
            )}
            <ToggleButtonGroup
              value={display}
              exclusive
              size="small"
              aria-label="Statistics display"
              onChange={(_event, value: StatisticsDisplay | null) => {
                if (value) onDisplayChange(value)
              }}
            >
              <ToggleButton value="graph" aria-label="Graph">
                <ShowChartIcon fontSize="small" sx={{ mr: 1 }} />
                Graph
              </ToggleButton>
              <ToggleButton value="table" aria-label="Data table">
                <TableRowsIcon fontSize="small" sx={{ mr: 1 }} />
                Data table
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>
      </Box>

      {display === 'table' && (
        <DateRangeFilter
          dateRange={dateRange}
          invalid={invalidDateRange}
          onChange={onDateRangeChange}
          onApply={onDateRangeApply}
          onClear={onDateRangeClear}
        />
      )}

      {error ? (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              Retry
            </Button>
          }
          sx={{ m: 3 }}
        >
          Daily statistics could not be loaded.
        </Alert>
      ) : display === 'graph' ? (
        <DailyStatisticsChart
          rows={rows}
          loading={loading}
          onDaySelect={onDaySelect}
        />
      ) : (
        <DailyStatisticsGrid
          rows={rows}
          rowCount={rowCount}
          pagination={pagination}
          sortModel={sortModel}
          loading={loading}
          onPaginationChange={onPaginationChange}
          onSortChange={onSortChange}
          onDaySelect={onDaySelect}
        />
      )}
    </Box>
  )
}
