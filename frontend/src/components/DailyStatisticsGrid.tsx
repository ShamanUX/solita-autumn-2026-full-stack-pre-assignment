import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import { Box, Button, Stack, Typography } from '@mui/material'
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
} from '@mui/x-data-grid'

import type { DailyStatistic } from '../data/dailyStatistics.js'

const numberFormatter = new Intl.NumberFormat('fi-FI', {
  maximumFractionDigits: 0,
})
const priceFormatter = new Intl.NumberFormat('fi-FI', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

function formatValue(
  value: number | null | undefined,
  formatter: Intl.NumberFormat,
) {
  return typeof value === 'number' && Number.isFinite(value)
    ? formatter.format(value)
    : 'Not available'
}

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
    field: 'totalProduction',
    headerName: 'Total production (MWh)',
    minWidth: 205,
    flex: 1,
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (value: number | null) =>
      formatValue(value, numberFormatter),
  },
  {
    field: 'totalConsumption',
    headerName: 'Total consumption (MWh)',
    minWidth: 215,
    flex: 1,
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (value: number | null) =>
      formatValue(value, numberFormatter),
  },
  {
    field: 'averagePrice',
    headerName: 'Price average (c/kWh)',
    minWidth: 170,
    flex: 0.8,
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (value: number | null) =>
      formatValue(value, priceFormatter),
  },
  {
    field: 'longestNegativePriceStreakHours',
    headerName: 'Longest negative-price streak (h)',
    minWidth: 225,
    flex: 1,
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (value: number | null) =>
      formatValue(value, numberFormatter),
  },
]

interface DailyStatisticsGridProps {
  rows: DailyStatistic[]
  rowCount: number
  pagination: GridPaginationModel
  sortModel: GridSortModel
  loading: boolean
  onPaginationChange: (pagination: GridPaginationModel) => void
  onSortChange: (sortModel: GridSortModel) => void
  onDaySelect: (date: string) => void
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
  onPaginationChange,
  onSortChange,
  onDaySelect,
}: DailyStatisticsGridProps) {
  const selectableColumns: GridColDef<DailyStatistic>[] = [
    ...columns,
    {
      field: 'viewDay',
      headerName: '',
      sortable: false,
      filterable: false,
      width: 120,
      align: 'right',
      renderCell: ({ row }) => (
        <Button size="small" onClick={() => onDaySelect(row.date)}>
          View day
        </Button>
      ),
    },
  ]

  return (
    <Box
      sx={{
        height: 629,
        mt: 2,
        minWidth: 0,
      }}
    >
      <DataGrid
        rows={rows}
        rowCount={rowCount}
        columns={selectableColumns}
        getRowId={(row) => row.date}
        loading={loading}
        paginationModel={pagination}
        onPaginationModelChange={onPaginationChange}
        paginationMode="server"
        sortModel={sortModel}
        onSortModelChange={onSortChange}
        sortingMode="server"
        pageSizeOptions={[10]}
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
  )
}
