import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import { Box, Container, Divider, Paper, Stack, Typography } from '@mui/material'
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid'

import type { DailyStatistic } from '../data/dailyStatistics.js'
import { DailyStatisticsGrid } from './DailyStatisticsGrid.js'
import { DateRangeFilter, type DateRange } from './DateRangeFilter.js'

interface DailyStatisticsViewProps {
  dateInputs: DateRange
  invalidDateRange: boolean
  rows: DailyStatistic[]
  rowCount: number
  pagination: GridPaginationModel
  sortModel: GridSortModel
  loading: boolean
  error: boolean
  onDateInputsChange: (dateRange: DateRange) => void
  onApplyDateRange: () => void
  onClearDateRange: () => void
  onPaginationChange: (pagination: GridPaginationModel) => void
  onSortChange: (sortModel: GridSortModel) => void
  onRetry: () => void
}

export function DailyStatisticsView({
  dateInputs,
  invalidDateRange,
  rows,
  rowCount,
  pagination,
  sortModel,
  loading,
  error,
  onDateInputsChange,
  onApplyDateRange,
  onClearDateRange,
  onPaginationChange,
  onSortChange,
  onRetry,
}: DailyStatisticsViewProps) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ height: 5, bgcolor: 'primary.main' }} />
      <Container
        component="header"
        maxWidth="xl"
        sx={{ py: { xs: 2.5, md: 3.5 } }}
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

      <Container component="main" maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>
        <Box sx={{ maxWidth: 900, mb: { xs: 5, md: 7 } }}>
          <Typography
            component="p"
            color="primary.main"
            sx={{
              fontWeight: 600,
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              mb: 2,
            }}
          >
            Finland / Power system
          </Typography>
          <Typography
            component="h1"
            variant="h1"
            sx={{ fontSize: { xs: '3rem', sm: '4.5rem', md: '6rem' } }}
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
              mt: 3,
            }}
          >
            Compare daily averages calculated from hourly production,
            consumption, and market price observations.
          </Typography>
        </Box>

        <Paper
          variant="outlined"
          sx={{ overflow: 'hidden', bgcolor: 'background.paper' }}
        >
          <DateRangeFilter
            dateRange={dateInputs}
            invalid={invalidDateRange}
            onChange={onDateInputsChange}
            onApply={onApplyDateRange}
            onClear={onClearDateRange}
          />
          <Divider />
          <DailyStatisticsGrid
            rows={rows}
            rowCount={rowCount}
            pagination={pagination}
            sortModel={sortModel}
            loading={loading}
            error={error}
            onPaginationChange={onPaginationChange}
            onSortChange={onSortChange}
            onRetry={onRetry}
          />
        </Paper>
      </Container>
    </Box>
  )
}
