import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DailyStatisticsChart } from './DailyStatisticsChart.js'

const { lineChartMock } = vi.hoisted(() => ({
  lineChartMock: vi.fn((_props: unknown) => (
    <div data-testid="mui-line-chart" />
  )),
}))

vi.mock('@mui/x-charts/LineChart', () => ({ LineChart: lineChartMock }))

afterEach(() => {
  cleanup()
  lineChartMock.mockClear()
})

const rows = [
  {
    date: '2024-09-20',
    totalProduction: 729494,
    totalConsumption: 110901,
    averagePrice: 9.087,
    longestNegativePriceStreakHours: 4,
  },
  {
    date: '2024-09-19',
    totalProduction: 717120,
    totalConsumption: 108240,
    averagePrice: 8.942,
    longestNegativePriceStreakHours: 0,
  },
]

describe('DailyStatisticsChart', () => {
  it('configures chronological series on separate value axes', () => {
    const onDaySelect = vi.fn()
    render(
      <DailyStatisticsChart
        rows={rows}
        loading={false}
        onDaySelect={onDaySelect}
      />,
    )

    const props = lineChartMock.mock.calls[0]?.[0] as
      | {
          dataset: Array<Record<string, unknown>>
          series: Array<{
            label: string
            yAxisId: string
            valueFormatter: (value: number | null) => string
          }>
          yAxis: Array<{
            id: string
            position: string
            width?: number | 'auto'
            valueFormatter: (value: number) => string
          }>
          onAxisClick: (
            event: unknown,
            data: { axisValue?: string | number | Date | null } | null,
          ) => void
        }
      | undefined

    expect(props?.dataset.map((row) => row.date)).toEqual([
      '2024-09-19',
      '2024-09-20',
    ])
    expect(props?.yAxis).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'price',
          position: 'right',
          width: 'auto',
        }),
      ]),
    )
    expect(props?.series).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Total production (MWh)',
          yAxisId: 'electricity',
        }),
        expect.objectContaining({
          label: 'Price average (c/kWh)',
          yAxisId: 'price',
        }),
      ]),
    )
    props?.onAxisClick({}, { axisValue: '2024-09-19' })
    expect(onDaySelect).toHaveBeenCalledWith('2024-09-19')

    expect(
      props?.yAxis.find((axis) => axis.id === 'electricity')?.valueFormatter(
        Number.NaN,
      ),
    ).toBe('Not available')
    expect(
      props?.series
        .find((series) => series.label === 'Total production (MWh)')
        ?.valueFormatter(Number.NaN),
    ).toBe('Not available')
  })
})
