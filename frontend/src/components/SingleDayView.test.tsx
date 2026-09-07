import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SingleDayView } from './SingleDayView.js'

afterEach(cleanup)

const detail = {
  date: '2024-09-01',
  totalProduction: 718585,
  totalConsumption: 96803463.9,
  averagePrice: 1.044,
  peakConsumptionRatioHour: {
    startTime: '2024-09-01T10:00:00',
    production: 27854.8,
    consumption: 4214990.713,
    price: 0.4,
    consumptionProductionRatio: 151.32,
  },
  cheapestHours: [
    {
      startTime: '2024-09-01T00:00:00',
      production: 30687.35,
      consumption: 3456794.951,
      price: 0,
    },
  ],
  hours: [],
}

describe('SingleDayView', () => {
  it('shows daily summaries and cheapest hours', () => {
    render(
      <SingleDayView
        date={detail.date}
        detail={detail}
        loading={false}
        error={false}
        onBack={vi.fn()}
        onRetry={vi.fn()}
      />,
    )

    expect(screen.getByText('01 September 2024')).toBeInTheDocument()
    expect(
      screen.getByText(
        (content) => content.replace(/\s/g, '') === '96803463,9',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('151,320x at 10:00')).toBeInTheDocument()
    expect(screen.getByText(/0,000/)).toBeInTheDocument()
  })

  it('reports unavailable data and invokes navigation', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(
      <SingleDayView
        date={detail.date}
        detail={{
          ...detail,
          totalConsumption: null,
          peakConsumptionRatioHour: null,
          cheapestHours: [],
        }}
        loading={false}
        error={false}
        onBack={onBack}
        onRetry={vi.fn()}
      />,
    )

    expect(screen.getAllByText('Not available')).toHaveLength(2)
    expect(
      screen.getByText('Price observations are not available for this day.'),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Back to daily statistics' }),
    )
    expect(onBack).toHaveBeenCalledOnce()
  })
})
