import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material'

import type { DailyStatisticDetail } from '../data/dailyStatisticDetail.js'

const numberFormatter = new Intl.NumberFormat('fi-FI', {
  maximumFractionDigits: 0,
})
const priceFormatter = new Intl.NumberFormat('fi-FI', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})
const ratioFormatter = new Intl.NumberFormat('fi-FI', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

interface SingleDayDetailsProps {
  date: string
  detail: DailyStatisticDetail | null
  loading: boolean
  error: boolean
  onBack: () => void
  onRetry: () => void
}

function formatValue(value: number | null) {
  return value === null ? 'Not available' : numberFormatter.format(value)
}

function formatPrice(value: number | null) {
  return value === null ? 'Not available' : priceFormatter.format(value)
}

function formatTime(startTime: string) {
  return startTime.slice(11, 16)
}

export function SingleDayDetails({
  date,
  detail,
  loading,
  error,
  onBack,
  onRetry,
}: SingleDayDetailsProps) {
  return (
    <Box sx={{ overflowY: 'auto', p: { xs: 2.5, md: 3 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: '1.75rem', md: '2rem' } }}
          >
            {dateFormatter.format(new Date(`${date}T00:00:00Z`))}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Daily totals and hourly electricity insights
          </Typography>
        </Box>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          Back to daily statistics
        </Button>
      </Stack>

      {loading ? (
        <Stack
          spacing={2}
          sx={{
            minHeight: 320,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={32} />
          <Typography color="text.secondary">Loading day...</Typography>
        </Stack>
      ) : error ? (
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
          sx={{ mt: 3 }}
        >
          Statistics for this day could not be loaded.
        </Alert>
      ) : detail ? (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 1,
              mt: 3,
            }}
          >
            {[
              [
                'Total consumption (MWh)',
                formatValue(detail.totalConsumption),
              ],
              ['Total production (MWh)', formatValue(detail.totalProduction)],
              ['Average price (c/kWh)', formatPrice(detail.averagePrice)],
              [
                'Highest consumption / production',
                detail.peakConsumptionRatioHour === null
                  ? 'Not available'
                  : `${ratioFormatter.format(detail.peakConsumptionRatioHour.consumptionProductionRatio)}x at ${formatTime(detail.peakConsumptionRatioHour.startTime)}`,
              ],
            ].map(([label, value]) => (
              <Box
                key={label}
                sx={{
                  minHeight: 130,
                  p: 2.5,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: '#171818',
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ minHeight: 40 }}
                >
                  {label}
                </Typography>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 600, mt: 1 }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>
            Five cheapest hours
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
            Ranked by hourly price, with equal prices ordered by time.
          </Typography>

          {detail.cheapestHours.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 3 }}>
              Price observations are not available for this day.
            </Typography>
          ) : (
            <Box
              component="ol"
              sx={{
                listStyle: 'none',
                m: 0,
                mt: 2,
                p: 0,
              }}
            >
              {detail.cheapestHours.map((hour, index) => (
                <Box
                  component="li"
                  key={hour.startTime}
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    py: 1.5,
                    '&:last-child': { borderBottom: 0 },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: 'center' }}
                  >
                    <Typography
                      color="primary.main"
                      variant="body2"
                      sx={{ width: 24 }}
                    >
                      {index + 1}.
                    </Typography>
                    <Typography sx={{ fontWeight: 600, minWidth: 52 }}>
                      {formatTime(hour.startTime)}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Price {formatPrice(hour.price)} c/kWh
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Box>
          )}
        </>
      ) : null}
    </Box>
  )
}
