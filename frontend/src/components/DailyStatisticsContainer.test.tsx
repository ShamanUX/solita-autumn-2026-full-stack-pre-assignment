import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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
  mockedGetDailyStatistics.mockImplementation(({ from }) =>
    Promise.resolve({
      data: [statistic],
      total: from === '2024-09-15' ? 6 : 20,
    }),
  )
})

describe('DailyStatisticsContainer', () => {
  it('loads statistics with the initial query', async () => {
    render(<DailyStatisticsContainer />)

    expect(screen.getByText('Loading records...')).toBeInTheDocument()
    expect(await screen.findByText('20 days found')).toBeInTheDocument()
    expect(screen.getByText('20 Sept 2024')).toBeInTheDocument()
    expect(mockedGetDailyStatistics).toHaveBeenCalledWith({
      from: '',
      to: '',
      page: 0,
      pageSize: 10,
      sortField: 'date',
      sortDirection: 'desc',
    })
  })

  it('applies and clears an inclusive date range', async () => {
    const user = userEvent.setup()
    render(<DailyStatisticsContainer />)
    await screen.findByText('20 days found')

    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2024-09-15' },
    })
    await user.click(screen.getByRole('button', { name: 'Apply dates' }))

    expect(await screen.findByText('6 days found')).toBeInTheDocument()
    expect(mockedGetDailyStatistics).toHaveBeenLastCalledWith(
      expect.objectContaining({ from: '2024-09-15', to: '' }),
    )

    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(await screen.findByText('20 days found')).toBeInTheDocument()
    expect(screen.getByLabelText('From')).toHaveValue('')
  })

  it('retries a failed request', async () => {
    const user = userEvent.setup()
    mockedGetDailyStatistics.mockRejectedValueOnce(new Error('Unavailable'))
    render(<DailyStatisticsContainer />)

    expect(
      await screen.findByText('Daily statistics could not be loaded.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('20 days found')).toBeInTheDocument()
    expect(mockedGetDailyStatistics).toHaveBeenCalledTimes(2)
  })
})
