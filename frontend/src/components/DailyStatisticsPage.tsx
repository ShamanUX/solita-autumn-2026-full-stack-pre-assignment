import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import { Box, Container, Divider, Paper, Stack, Typography } from '@mui/material'
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid'

import type { DailyStatistic } from '../data/dailyStatistics.js'
import type { DailyStatisticDetail } from '../data/dailyStatisticDetail.js'
import {
  DailyStatisticsOverview,
  type StatisticsMode,
} from './DailyStatisticsOverview.js'
import type { DateRange } from './DateRangeFilter.js'
import { SingleDayDetails } from './SingleDayDetails.js'

interface DailyStatisticsPageProps {
  month: string
  latestMonth: string
  rows: DailyStatistic[]
  rowCount: number
  pagination: GridPaginationModel
  sortModel: GridSortModel
  loading: boolean
  error: boolean
  mode: StatisticsMode
  dateRange: DateRange
  invalidDateRange: boolean
  selectedDate: string | null
  detail: DailyStatisticDetail | null
  detailLoading: boolean
  detailError: boolean
  onMonthChange: (month: string) => void
  onDateRangeChange: (dateRange: DateRange) => void
  onDateRangeApply: () => void
  onDateRangeClear: () => void
  onPaginationChange: (pagination: GridPaginationModel) => void
  onSortChange: (sortModel: GridSortModel) => void
  onRetry: () => void
  onModeChange: (mode: StatisticsMode) => void
  onDaySelect: (date: string) => void
  onDetailBack: () => void
  onDetailRetry: () => void
}

export function DailyStatisticsPage({
  month,
  latestMonth,
  rows,
  rowCount,
  pagination,
  sortModel,
  loading,
  error,
  mode,
  dateRange,
  invalidDateRange,
  selectedDate,
  detail,
  detailLoading,
  detailError,
  onMonthChange,
  onDateRangeChange,
  onDateRangeApply,
  onDateRangeClear,
  onPaginationChange,
  onSortChange,
  onRetry,
  onModeChange,
  onDaySelect,
  onDetailBack,
  onDetailRetry,
}: DailyStatisticsPageProps) {
  return (
    <Box
      sx={{
        minHeight: { xs: '100vh', md: 900 },
        height: { md: '100vh' },
        display: { md: 'flex' },
        flexDirection: { md: 'column' },
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ height: 5, bgcolor: 'primary.main' }} />
      <Container
        component="header"
        maxWidth="xl"
        sx={{ py: { xs: 2.5, md: 1.5 } }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                width: 34,
                height: 34,
              }}
            >
              <ElectricBoltIcon fontSize="small" />
            </Box>
            <Typography sx={{ fontWeight: 600 }}>
              Finnish electricity data
            </Typography>
          </Stack>
        </Stack>
      </Container>

      <Divider />

      <Container
        component="main"
        maxWidth="xl"
        sx={{
          py: { xs: 5, md: 3 },
          display: { md: 'flex' },
          flex: { md: 1 },
          flexDirection: { md: 'column' },
          minHeight: 0,
        }}
      >
        <Box sx={{ maxWidth: 900, mb: { xs: 5, md: 3 } }}>
          <Typography
            component="p"
            color="primary.main"
            sx={{
              fontWeight: 600,
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              mb: { xs: 2, md: 1 },
            }}
          >
            Finland / Power system
          </Typography>
          <Typography
            component="h1"
            variant="h1"
            sx={{ fontSize: { xs: '3rem', sm: '4.5rem', md: '3.75rem' } }}
          >
            Electricity,
            <Box component="span" sx={{ color: 'text.secondary' }}>
              {' '}
              day by day.
            </Box>
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              fontSize: { xs: '1rem', md: '1.15rem' },
              maxWidth: 660,
              mt: { xs: 3, md: 1 },
            }}
          >
            Compare daily production and consumption totals with average market
            prices calculated from hourly observations.
          </Typography>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            overflow: 'hidden',
            bgcolor: 'background.paper',
            display: { md: 'flex' },
            flex: { md: 1 },
            flexDirection: { md: 'column' },
            minHeight: { md: 0 },
          }}
        >
          <Box
            key={selectedDate ?? mode}
            sx={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              minHeight: 0,
              animation: 'viewEnter 240ms ease-out',
              '@keyframes viewEnter': {
                from: { opacity: 0, transform: 'translateY(6px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
              },
            }}
          >
            {selectedDate === null ? (
              <DailyStatisticsOverview
                mode={mode}
                month={month}
                latestMonth={latestMonth}
                rows={rows}
                rowCount={rowCount}
                pagination={pagination}
                sortModel={sortModel}
                loading={loading}
                error={error}
                dateRange={dateRange}
                invalidDateRange={invalidDateRange}
                onPaginationChange={onPaginationChange}
                onSortChange={onSortChange}
                onRetry={onRetry}
                onModeChange={onModeChange}
                onMonthChange={onMonthChange}
                onDateRangeChange={onDateRangeChange}
                onDateRangeApply={onDateRangeApply}
                onDateRangeClear={onDateRangeClear}
                onDaySelect={onDaySelect}
              />
            ) : (
              <SingleDayDetails
                date={selectedDate}
                detail={detail}
                loading={detailLoading}
                error={detailError}
                onBack={onDetailBack}
                onRetry={onDetailRetry}
              />
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
