import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DailyStatisticsDisplay } from './DailyStatisticsDisplay.js'

vi.mock('./DailyStatisticsChart.js', () => ({
  DailyStatisticsChart: () => (
    <div role="img" aria-label="Daily electricity statistics graph" />
  ),
}))

vi.mock('./MonthSelector.js', () => ({
  MonthSelector: ({ onChange }: { onChange: (month: string) => void }) => (
    <button onClick={() => onChange('2024-08')}>August 2024</button>
  ),
}))

afterEach(cleanup)

const defaultProps = {
  display: 'table' as const,
  month: '2024-09',
  latestMonth: '2024-09',
  rows: [],
  rowCount: 0,
  pagination: { page: 0, pageSize: 10 },
  sortModel: [{ field: 'date', sort: 'desc' as const }],
  loading: false,
  error: false,
  dateRange: { from: '', to: '' },
  invalidDateRange: false,
  onDisplayChange: vi.fn(),
  onMonthChange: vi.fn(),
  onDateRangeChange: vi.fn(),
  onDateRangeApply: vi.fn(),
  onDateRangeClear: vi.fn(),
  onPaginationChange: vi.fn(),
  onSortChange: vi.fn(),
  onRetry: vi.fn(),
  onDaySelect: vi.fn(),
}

describe('DailyStatisticsDisplay', () => {
  it('reports graph and table display changes', async () => {
    const user = userEvent.setup()
    const onDisplayChange = vi.fn()
    const { rerender } = render(
      <DailyStatisticsDisplay
        {...defaultProps}
        onDisplayChange={onDisplayChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Graph' }))
    expect(onDisplayChange).toHaveBeenCalledWith('graph')
    expect(screen.getByRole('group', { name: 'From' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'August 2024' }),
    ).not.toBeInTheDocument()

    rerender(
      <DailyStatisticsDisplay
        {...defaultProps}
        display="graph"
        onDisplayChange={onDisplayChange}
      />,
    )
    expect(
      screen.getByRole('img', {
        name: 'Daily electricity statistics graph',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('group', { name: 'From' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'August 2024' }))
    expect(defaultProps.onMonthChange).toHaveBeenCalledWith('2024-08')

    await user.click(screen.getByRole('button', { name: 'Data table' }))
    expect(onDisplayChange).toHaveBeenLastCalledWith('table')
  })

  it('displays loading, result, and error states', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(
      <DailyStatisticsDisplay {...defaultProps} loading />,
    )

    expect(screen.getByText('Loading records...')).toBeInTheDocument()

    rerender(
      <DailyStatisticsDisplay {...defaultProps} error onRetry={onRetry} />,
    )
    expect(screen.getByText('0 days found')).toBeInTheDocument()
    expect(
      screen.getByText('Daily statistics could not be loaded.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
