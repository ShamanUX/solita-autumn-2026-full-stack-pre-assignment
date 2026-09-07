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
    averageProduction: 30396,
    averageConsumption: 4621,
    averagePrice: 9.087,
  },
  {
    date: '2024-09-19',
    averageProduction: 29880,
    averageConsumption: 4510,
    averagePrice: 8.942,
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
          series: Array<{ label: string; yAxisId: string }>
          yAxis: Array<{
            id: string
            position: string
            width?: number | 'auto'
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
          label: 'Production average (MWh)',
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
  })
})
