import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Alert, Box, Button, Stack, Typography } from '@mui/material'
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
} from '@mui/x-data-grid'

import type { DailyStatistic } from '../data/dailyStatistics.js'

const numberFormatter = new Intl.NumberFormat('en-FI', {
  maximumFractionDigits: 1,
})
const priceFormatter = new Intl.NumberFormat('en-FI', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const columns: GridColDef<DailyStatistic>[] = [
  {
    field: 'date',
    headerName: 'Date',
    minWidth: 155,
    flex: 0.8,
    valueFormatter: (value: string) =>
      dateFormatter.format(new Date(`${value}T00:00:00Z`)),
  },
  {
    field: 'averageProduction',
    headerName: 'Production average',
    minWidth: 205,
    flex: 1,
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (value: number | null) =>
      value === null ? 'Not available' : numberFormatter.format(value),
  },
  {
    field: 'averageConsumption',
    headerName: 'Consumption average',
    minWidth: 215,
    flex: 1,
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (value: number | null) =>
      value === null ? 'Not available' : numberFormatter.format(value),
  },
  {
    field: 'averagePrice',
    headerName: 'Price average',
    minWidth: 170,
    flex: 0.8,
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (value: number | null) =>
      value === null ? 'Not available' : priceFormatter.format(value),
  },
]

interface DailyStatisticsGridProps {
  rows: DailyStatistic[]
  rowCount: number
  pagination: GridPaginationModel
  sortModel: GridSortModel
  loading: boolean
  error: boolean
  onPaginationChange: (pagination: GridPaginationModel) => void
  onSortChange: (sortModel: GridSortModel) => void
  onRetry: () => void
}

function EmptyResults() {
  return (
    <Stack
      spacing={1}
      sx={{
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
      }}
    >
      <CalendarMonthOutlinedIcon color="primary" />
      <Typography sx={{ fontWeight: 600 }}>No days in this range</Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: 'center' }}
      >
        Adjust the dates or clear the filter to see available records.
      </Typography>
    </Stack>
  )
}

export function DailyStatisticsGrid({
  rows,
  rowCount,
  pagination,
  sortModel,
  loading,
  error,
  onPaginationChange,
  onSortChange,
  onRetry,
}: DailyStatisticsGridProps) {
  return (
    <>
      <Box sx={{ p: { xs: 2.5, md: 3 }, pb: '0 !important' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>
              Daily statistics
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Averages are displayed in the source data units.
            </Typography>
          </Box>
          <Typography
            color="text.secondary"
            aria-live="polite"
            sx={{ fontSize: '0.875rem' }}
          >
            {loading ? 'Loading records...' : `${rowCount} days found`}
          </Typography>
        </Stack>
      </Box>

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
      ) : (
        <Box sx={{ height: 575, mt: 2, minWidth: 0 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.date}
            loading={loading}
            rowCount={rowCount}
            paginationMode="server"
            sortingMode="server"
            paginationModel={pagination}
            onPaginationModelChange={onPaginationChange}
            sortModel={sortModel}
            onSortModelChange={onSortChange}
            pageSizeOptions={[5, 10, 20]}
            disableRowSelectionOnClick
            slots={{ noRowsOverlay: EmptyResults }}
            sx={{
              border: 0,
              borderTop: 1,
              borderColor: 'divider',
              '& .MuiDataGrid-columnHeaders': { bgcolor: '#171818' },
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': {
                outlineColor: 'primary.main',
              },
            }}
          />
        </Box>
      )}
    </>
  )
}
