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
import { DailyStatisticsContainer } from './DailyStatisticsContainer.js'

vi.mock('../data/dailyStatistics.js', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../data/dailyStatistics.js')>()

  return {
    ...actual,
    getDailyStatistics: vi.fn(),
  }
})

vi.mock('./DailyStatisticsChart.js', () => ({
  DailyStatisticsChart: () => (
    <div role="img" aria-label="Daily electricity statistics graph" />
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

const statistic = {
  date: '2024-09-20',
  averageProduction: 30395.6,
  averageConsumption: 4620873,
  averagePrice: 9.087,
}

afterEach(() => {
  cleanup()
  mockedGetDailyStatistics.mockReset()
})

beforeEach(() => {
  mockedGetDailyStatistics.mockImplementation(({ from }) => {
    const data =
      from === '2024-08-01'
        ? [{ ...statistic, date: '2024-08-20' }]
        : [statistic]
    return Promise.resolve({ data, total: data.length })
  })
})

describe('DailyStatisticsContainer', () => {
  it('loads an unfiltered page of 10 table rows', async () => {
    render(<DailyStatisticsContainer />)

    expect(screen.getByText('Loading records...')).toBeInTheDocument()
    expect(await screen.findByText('1 days found')).toBeInTheDocument()
    expect(screen.getByText('20 Sept 2024')).toBeInTheDocument()
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
  })

  it('discovers and loads the latest available month for the graph', async () => {
    const user = userEvent.setup()
    render(<DailyStatisticsContainer />)
    await screen.findByText('1 days found')

    await user.click(screen.getByRole('button', { name: 'Graph' }))

    expect(
      await screen.findByRole('button', { name: 'Month 2024-09' }),
    ).toBeInTheDocument()
    expect(mockedGetDailyStatistics).toHaveBeenNthCalledWith(2, {
      from: '',
      to: '',
      page: 0,
      pageSize: 1,
      sortField: 'date',
      sortDirection: 'desc',
    })
    expect(mockedGetDailyStatistics).toHaveBeenLastCalledWith({
      from: '2024-09-01',
      to: '2024-09-30',
      page: 0,
      pageSize: 31,
      sortField: 'date',
      sortDirection: 'asc',
    })
  })

  it('loads all daily averages for a selected month', async () => {
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
    expect(
      screen.getByRole('button', { name: 'Graph' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })
})
