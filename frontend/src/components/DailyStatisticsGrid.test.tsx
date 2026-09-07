import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DailyStatisticsGrid } from './DailyStatisticsGrid.js'

afterEach(cleanup)

const defaultProps = {
  rows: [
    {
      date: '2024-09-20',
      averageProduction: 30396,
      averageConsumption: 4621,
      averagePrice: 9.087,
    },
  ],
  rowCount: 1,
  pagination: { page: 0, pageSize: 10 },
  sortModel: [{ field: 'date', sort: 'desc' as const }],
  loading: false,
  onPaginationChange: vi.fn(),
  onSortChange: vi.fn(),
  onDaySelect: vi.fn(),
}

describe('DailyStatisticsGrid', () => {
  it('displays the formatted row date', () => {
    render(<DailyStatisticsGrid {...defaultProps} />)

    expect(screen.getByText('20 Sept 2024')).toBeInTheDocument()
  })

  it('shows units and Finnish-formatted values', () => {
    render(<DailyStatisticsGrid {...defaultProps} />)

    expect(
      screen.getByRole('columnheader', {
        name: 'Production average (MWh)',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', {
        name: 'Consumption average (MWh)',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Price average (c/kWh)' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText((content) => content.replace(/\s/g, '') === '30396'),
    ).toBeInTheDocument()
    expect(screen.getByText('9,087')).toBeInTheDocument()
  })

  it('opens the selected day', async () => {
    const user = userEvent.setup()
    const onDaySelect = vi.fn()
    render(<DailyStatisticsGrid {...defaultProps} onDaySelect={onDaySelect} />)

    await user.click(screen.getByRole('button', { name: 'View day' }))

    expect(onDaySelect).toHaveBeenCalledWith('2024-09-20')
  })

  it('displays an empty state', async () => {
    render(<DailyStatisticsGrid {...defaultProps} rows={[]} rowCount={0} />)

    expect(await screen.findByText('No days in this range')).toBeInTheDocument()
  })
})
