import { useEffect, useState, type FormEvent } from 'react'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
} from '@mui/x-data-grid'

import {
  getDailyStatistics,
  type DailyStatistic,
  type StatisticSortField,
} from './data/dailyStatistics.js'

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

interface DateRange {
  from: string
  to: string
}

const emptyDateRange: DateRange = { from: '', to: '' }

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

export function App() {
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

  function applyDateRange(event: FormEvent) {
    event.preventDefault()
    if (invalidDateRange) return

    setPagination((current) => ({ ...current, page: 0 }))
    setDateRange(dateInputs)
  }

  function clearDateRange() {
    setDateInputs(emptyDateRange)
    setDateRange(emptyDateRange)
    setPagination((current) => ({ ...current, page: 0 }))
  }

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
          <Chip
            label="Fixture preview"
            size="small"
            variant="outlined"
            color="primary"
          />
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
          <Box
            component="form"
            onSubmit={applyDateRange}
            sx={{ p: { xs: 2.5, md: 3 } }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{ alignItems: { md: 'flex-start' } }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="h2" sx={{ fontSize: '1.25rem', mb: 0.5 }}>
                  Search by date
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Both dates are optional and included in the results.
                </Typography>
              </Box>
              <TextField
                label="From"
                type="date"
                value={dateInputs.from}
                onChange={(event) =>
                  setDateInputs((current) => ({
                    ...current,
                    from: event.target.value,
                  }))
                }
                error={invalidDateRange}
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { max: dateInputs.to || undefined },
                }}
                sx={{ width: { md: 190 } }}
              />
              <TextField
                label="To"
                type="date"
                value={dateInputs.to}
                onChange={(event) =>
                  setDateInputs((current) => ({
                    ...current,
                    to: event.target.value,
                  }))
                }
                error={invalidDateRange}
                helperText={
                  invalidDateRange ? 'To date must follow from date' : ' '
                }
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { min: dateInputs.from || undefined },
                }}
                sx={{ width: { md: 190 } }}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={invalidDateRange}
                >
                  Apply dates
                </Button>
                <Button type="button" color="inherit" onClick={clearDateRange}>
                  Clear
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Divider />

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
                  onClick={() => setLoadAttempt((value) => value + 1)}
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
                onPaginationModelChange={setPagination}
                sortModel={sortModel}
                onSortModelChange={(model) => {
                  setSortModel(model)
                  setPagination((current) => ({ ...current, page: 0 }))
                }}
                pageSizeOptions={[5, 10, 20]}
                disableRowSelectionOnClick
                slots={{ noRowsOverlay: EmptyResults }}
                sx={{
                  border: 0,
                  borderTop: 1,
                  borderColor: 'divider',
                  '& .MuiDataGrid-columnHeaders': { bgcolor: '#171818' },
                  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus':
                    {
                      outlineColor: 'primary.main',
                    },
                }}
              />
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  )
}
