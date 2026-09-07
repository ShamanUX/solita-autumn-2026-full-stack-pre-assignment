import { Box, Typography } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'

import type { DailyStatistic } from '../data/dailyStatistics.js'

const axisNumberFormatter = new Intl.NumberFormat('en-FI', {
  notation: 'compact',
  maximumFractionDigits: 1,
})
const valueFormatter = new Intl.NumberFormat('en-FI', {
  maximumFractionDigits: 1,
})
const priceFormatter = new Intl.NumberFormat('en-FI', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
})

interface DailyStatisticsChartProps {
  rows: DailyStatistic[]
  loading: boolean
  onDaySelect: (date: string) => void
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`))
}

export function DailyStatisticsChart({
  rows,
  loading,
  onDaySelect,
}: DailyStatisticsChartProps) {
  const chartRows: Array<Record<string, string | number | null>> = [...rows]
    .sort((first, second) => first.date.localeCompare(second.date))
    .map((row) => ({ ...row }))

  return (
    <Box sx={{ minWidth: 0, mt: 1 }}>
      <Box
        role="img"
        aria-label="Daily electricity statistics graph"
        sx={{ height: 360, minWidth: 0, px: { xs: 0.5, md: 2 } }}
      >
        <LineChart
          dataset={chartRows}
          loading={loading}
          height={360}
          onAxisClick={(_event, data) => {
            if (typeof data?.axisValue === 'string') {
              onDaySelect(data.axisValue)
            }
          }}
          xAxis={[
            {
              scaleType: 'point',
              dataKey: 'date',
              valueFormatter: formatDate,
            },
          ]}
          yAxis={[
            {
              id: 'electricity',
              position: 'left',
              valueFormatter: (value: number) =>
                axisNumberFormatter.format(value),
            },
            {
              id: 'price',
              position: 'right',
              valueFormatter: (value: number) => priceFormatter.format(value),
            },
          ]}
          series={[
            {
              dataKey: 'averageProduction',
              label: 'Production average',
              yAxisId: 'electricity',
              color: '#d7ff3f',
              valueFormatter: (value) =>
                value === null ? 'Not available' : valueFormatter.format(value),
            },
            {
              dataKey: 'averageConsumption',
              label: 'Consumption average',
              yAxisId: 'electricity',
              color: '#66c7f2',
              valueFormatter: (value) =>
                value === null ? 'Not available' : valueFormatter.format(value),
            },
            {
              dataKey: 'averagePrice',
              label: 'Price average',
              yAxisId: 'price',
              color: '#ff6b35',
              valueFormatter: (value) =>
                value === null ? 'Not available' : priceFormatter.format(value),
            },
          ]}
          grid={{ horizontal: true }}
          margin={{ top: 20, bottom: 10 }}
          sx={{
            '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': {
              stroke: 'rgba(255, 255, 255, 0.22)',
            },
            '& .MuiChartsGrid-line': {
              stroke: 'rgba(255, 255, 255, 0.08)',
            },
          }}
        />
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ px: { xs: 2.5, md: 3 }, pb: 2 }}
      >
        Select a plotted day to view its totals and hourly insights.
      </Typography>
    </Box>
  )
}
