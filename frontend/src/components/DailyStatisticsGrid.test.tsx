import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DailyStatisticsGrid } from './DailyStatisticsGrid.js'

afterEach(cleanup)

const defaultProps = {
  rows: [
    {
      date: '2024-09-20',
      averageProduction: 30395.6,
      averageConsumption: 4620873,
      averagePrice: 9.087,
    },
  ],
  rowCount: 1,
  pagination: { page: 0, pageSize: 10 },
  sortModel: [{ field: 'date', sort: 'desc' as const }],
  loading: false,
  error: false,
  onPaginationChange: vi.fn(),
  onSortChange: vi.fn(),
  onRetry: vi.fn(),
}

describe('DailyStatisticsGrid', () => {
  it('displays the result count and formatted row date', () => {
    render(<DailyStatisticsGrid {...defaultProps} />)

    expect(screen.getByText('1 days found')).toBeInTheDocument()
    expect(screen.getByText('20 Sept 2024')).toBeInTheDocument()
  })

  it('displays loading and empty states', async () => {
    const { rerender } = render(
      <DailyStatisticsGrid {...defaultProps} rows={[]} loading />,
    )

    expect(screen.getByText('Loading records...')).toBeInTheDocument()

    rerender(
      <DailyStatisticsGrid
        {...defaultProps}
        rows={[]}
        rowCount={0}
        loading={false}
      />,
    )

    expect(await screen.findByText('0 days found')).toBeInTheDocument()
    expect(await screen.findByText('No days in this range')).toBeInTheDocument()
  })

  it('displays an error and reports retry requests', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(
      <DailyStatisticsGrid {...defaultProps} error onRetry={onRetry} />,
    )

    expect(
      screen.getByText('Daily statistics could not be loaded.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })
})
