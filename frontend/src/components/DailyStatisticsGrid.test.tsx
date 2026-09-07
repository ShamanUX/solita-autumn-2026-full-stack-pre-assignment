import { cleanup, render, screen } from '@testing-library/react'
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
  onPaginationChange: vi.fn(),
  onSortChange: vi.fn(),
}

describe('DailyStatisticsGrid', () => {
  it('displays the formatted row date', () => {
    render(<DailyStatisticsGrid {...defaultProps} />)

    expect(screen.getByText('20 Sept 2024')).toBeInTheDocument()
  })

  it('displays an empty state', async () => {
    render(
      <DailyStatisticsGrid {...defaultProps} rows={[]} rowCount={0} />,
    )

    expect(await screen.findByText('No days in this range')).toBeInTheDocument()
  })
})
