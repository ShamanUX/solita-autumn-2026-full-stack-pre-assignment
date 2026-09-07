import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getDailyStatistics } from '../data/dailyStatistics.js'
import { getDailyStatisticDetail } from '../data/dailyStatisticDetail.js'
import { DailyStatisticsContainer } from './DailyStatisticsContainer.js'

vi.mock('../data/dailyStatistics.js', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../data/dailyStatistics.js')>()

  return {
    ...actual,
    getDailyStatistics: vi.fn(),
  }
})

vi.mock('../data/dailyStatisticDetail.js', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../data/dailyStatisticDetail.js')>()

  return {
    ...actual,
    getDailyStatisticDetail: vi.fn(),
  }
})

vi.mock('./DateRangeFilter.js', () => ({
  DateRangeFilter: ({
    dateRange,
    invalid,
    onChange,
    onApply,
    onClear,
  }: {
    dateRange: { from: string; to: string }
    invalid: boolean
    onChange: (dateRange: { from: string; to: string }) => void
    onApply: () => void
    onClear: () => void
  }) => (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
    >
      <label>
        From
        <input
          aria-label="From"
          type="date"
          value={dateRange.from}
          onChange={(event) =>
            onChange({ ...dateRange, from: event.target.value })
          }
        />
      </label>
      <label>
        To
        <input
          aria-label="To"
          type="date"
          value={dateRange.to}
          onChange={(event) =>
            onChange({ ...dateRange, to: event.target.value })
          }
        />
      </label>
      <button type="submit" disabled={invalid}>
        Apply dates
      </button>
      <button type="button" onClick={onClear}>
        Clear
      </button>
    </form>
  ),
}))

vi.mock('./DailyStatisticsChart.js', () => ({
  DailyStatisticsChart: ({
    rows,
    onDaySelect,
  }: {
    rows: Array<{ date: string }>
    onDaySelect: (date: string) => void
  }) => (
    <button
      aria-label="Open graph day"
      onClick={() => {
        const date = rows[0]?.date
        if (date) onDaySelect(date)
      }}
    >
      <span role="img" aria-label="Daily electricity statistics graph" />
    </button>
  ),
}))

vi.mock('./DailyStatisticsGrid.js', () => ({
  DailyStatisticsGrid: ({
    rows,
    onDaySelect,
  }: {
    rows: Array<{ date: string }>
    onDaySelect: (date: string) => void
  }) => (
    <div>
      {rows.map((row) => (
        <div key={row.date}>
          <span>{row.date}</span>
          <button onClick={() => onDaySelect(row.date)}>View day</button>
        </div>
      ))}
    </div>
  ),
}))

vi.mock('./MonthSelector.js', () => ({
  MonthSelector: ({
    month,
    onChange,
  }: {
    month: string
    onChange: (month: string) => void
  }) => (
    <button onClick={() => onChange('2024-08')}>
      Month {month || 'not selected'}
    </button>
  ),
}))

const mockedGetDailyStatistics = vi.mocked(getDailyStatistics)
const mockedGetDailyStatisticDetail = vi.mocked(getDailyStatisticDetail)

const statistic = {
  date: '2024-09-20',
  totalProduction: 729494,
  totalConsumption: 110901,
  averagePrice: 9.087,
}

const detail = {
  date: statistic.date,
  totalProduction: 729494,
  totalConsumption: 110901,
  averagePrice: 9.087,
  peakConsumptionRatioHour: {
    startTime: '2024-09-20T09:00:00',
    production: 22908.13,
    consumption: 4963.616432,
    price: 18.824,
    consumptionProductionRatio: 0.217,
  },
  cheapestHours: [
    {
      startTime: '2024-09-20T00:00:00',
      production: 34029.69,
      consumption: 3766.928185,
      price: 0.872,
    },
  ],
  hours: [],
}

afterEach(() => {
  cleanup()
  mockedGetDailyStatistics.mockReset()
  mockedGetDailyStatisticDetail.mockReset()
})

beforeEach(() => {
  mockedGetDailyStatistics.mockImplementation(({ from }) => {
    const data =
      from === '2024-08-01'
        ? [{ ...statistic, date: '2024-08-20' }]
        : [statistic]
    return Promise.resolve({ data, total: data.length })
  })
  mockedGetDailyStatisticDetail.mockResolvedValue(detail)
})

describe('DailyStatisticsContainer', () => {
  it('loads an unfiltered page of 10 table rows', async () => {
    render(<DailyStatisticsContainer />)

    expect(screen.getByText('Loading records...')).toBeInTheDocument()
    expect(await screen.findByText('1 days found')).toBeInTheDocument()
    expect(screen.getByText('2024-09-20')).toBeInTheDocument()
    expect(screen.queryByText(/Month /)).not.toBeInTheDocument()
    expect(mockedGetDailyStatistics).toHaveBeenCalledOnce()
    expect(mockedGetDailyStatistics).toHaveBeenCalledWith({
      from: '',
      to: '',
      page: 0,
      pageSize: 10,
      sortField: 'date',
      sortDirection: 'desc',
    })
  })

  it('applies a date range only to the table', async () => {
    const user = userEvent.setup()
    render(<DailyStatisticsContainer />)
    await screen.findByText('1 days found')

    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2024-09-01' },
    })
    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: '2024-09-30' },
    })
    await user.click(screen.getByRole('button', { name: 'Apply dates' }))

    expect(mockedGetDailyStatistics).toHaveBeenLastCalledWith({
      from: '2024-09-01',
      to: '2024-09-30',
      page: 0,
      pageSize: 10,
      sortField: 'date',
      sortDirection: 'desc',
    })

    await user.click(screen.getByRole('button', { name: 'Graph' }))
    expect(screen.queryByLabelText('From')).not.toBeInTheDocument()

    await waitFor(() =>
      expect(mockedGetDailyStatistics).toHaveBeenCalledTimes(3),
    )
    await user.click(screen.getByRole('button', { name: 'Data table' }))

    expect(screen.getByLabelText('From')).toHaveValue('2024-09-01')
    expect(screen.getByLabelText('To')).toHaveValue('2024-09-30')
    expect(mockedGetDailyStatistics).toHaveBeenCalledTimes(3)
  })

  it('loads September 2024 as the default graph month', async () => {
    const user = userEvent.setup()
    render(<DailyStatisticsContainer />)
    await screen.findByText('1 days found')

    await user.click(screen.getByRole('button', { name: 'Graph' }))

    expect(
      await screen.findByRole('button', { name: 'Month 2024-09' }),
    ).toBeInTheDocument()
    expect(mockedGetDailyStatistics).toHaveBeenNthCalledWith(2, {
      from: '2024-09-01',
      to: '2024-09-30',
      page: 0,
      pageSize: 31,
      sortField: 'date',
      sortDirection: 'asc',
    })
  })

  it('loads all daily statistics for a selected month', async () => {
    const user = userEvent.setup()
    render(<DailyStatisticsContainer />)
    await screen.findByText('1 days found')

    await user.click(screen.getByRole('button', { name: 'Graph' }))
    await screen.findByRole('button', { name: 'Month 2024-09' })
    await user.click(screen.getByRole('button', { name: 'Month 2024-09' }))

    expect(
      await screen.findByRole('button', { name: 'Month 2024-08' }),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(mockedGetDailyStatistics).toHaveBeenLastCalledWith({
        from: '2024-08-01',
        to: '2024-08-31',
        page: 0,
        pageSize: 31,
        sortField: 'date',
        sortDirection: 'asc',
      })
    })
  })

  it('retries a failed request', async () => {
    const user = userEvent.setup()
    mockedGetDailyStatistics.mockRejectedValueOnce(new Error('Unavailable'))
    render(<DailyStatisticsContainer />)

    expect(
      await screen.findByText('Daily statistics could not be loaded.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('1 days found')).toBeInTheDocument()
    expect(mockedGetDailyStatistics).toHaveBeenCalledTimes(2)
  })

  it('switches between the data table and graph', async () => {
    const user = userEvent.setup()
    render(<DailyStatisticsContainer />)
    await screen.findByText('1 days found')

    await user.click(screen.getByRole('button', { name: 'Graph' }))

    expect(
      screen.getByRole('img', {
        name: 'Daily electricity statistics graph',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Graph' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText('Daily statistics by month.')).toBeInTheDocument()
    await waitFor(() =>
      expect(mockedGetDailyStatistics).toHaveBeenCalledTimes(2),
    )

    await user.click(screen.getByRole('button', { name: 'Data table' }))
    await user.click(screen.getByRole('button', { name: 'Graph' }))

    expect(mockedGetDailyStatistics).toHaveBeenCalledTimes(2)
  })

  it('opens a day and returns to the unchanged overview', async () => {
    const user = userEvent.setup()
    render(<DailyStatisticsContainer />)
    await screen.findByText('1 days found')

    await user.click(screen.getByRole('button', { name: 'View day' }))

    expect(
      await screen.findByText('Total consumption (MWh)'),
    ).toBeInTheDocument()
    expect(mockedGetDailyStatisticDetail).toHaveBeenCalledWith('2024-09-20')

    await user.click(
      screen.getByRole('button', { name: 'Back to daily statistics' }),
    )

    expect(screen.getByText('1 days found')).toBeInTheDocument()
    expect(mockedGetDailyStatistics).toHaveBeenCalledOnce()
  })

  it('opens a plotted day and returns to the graph', async () => {
    const user = userEvent.setup()
    render(<DailyStatisticsContainer />)
    await screen.findByText('1 days found')

    await user.click(screen.getByRole('button', { name: 'Graph' }))
    await screen.findByRole('button', { name: 'Month 2024-09' })
    await user.click(screen.getByRole('button', { name: 'Open graph day' }))

    expect(
      await screen.findByText('Total consumption (MWh)'),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Back to daily statistics' }),
    )
    expect(screen.getByRole('button', { name: 'Graph' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('retries a failed single-day request', async () => {
    const user = userEvent.setup()
    mockedGetDailyStatisticDetail.mockRejectedValueOnce(
      new Error('Unavailable'),
    )
    render(<DailyStatisticsContainer />)
    await screen.findByText('1 days found')

    await user.click(screen.getByRole('button', { name: 'View day' }))
    expect(
      await screen.findByText('Statistics for this day could not be loaded.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(
      await screen.findByText('Total production (MWh)'),
    ).toBeInTheDocument()
    expect(mockedGetDailyStatisticDetail).toHaveBeenCalledTimes(2)
  })
})
