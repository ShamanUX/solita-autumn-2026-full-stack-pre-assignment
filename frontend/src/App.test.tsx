import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { App } from './App.js'
import { getDailyStatistics } from './data/dailyStatistics.js'

vi.mock('./data/dailyStatistics.js', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('./data/dailyStatistics.js')>()

  return {
    ...actual,
    getDailyStatistics: vi.fn(actual.getDailyStatistics),
  }
})

const mockedGetDailyStatistics = vi.mocked(getDailyStatistics)

afterEach(() => {
  cleanup()
  mockedGetDailyStatistics.mockClear()
})

describe('App', () => {
  it('loads and displays the available daily statistics', async () => {
    render(<App />)

    expect(screen.getByText('Finnish electricity data')).toBeInTheDocument()
    expect(screen.getByText('Loading records...')).toBeInTheDocument()
    expect(await screen.findByText('20 days found')).toBeInTheDocument()
    expect(screen.getByText('20 Sept 2024')).toBeInTheDocument()
  })

  it('applies and clears an inclusive date range', async () => {
    const user = userEvent.setup()
    render(<App />)
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

  it('rejects a date range in reverse order', async () => {
    render(<App />)
    await screen.findByText('20 days found')

    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2024-09-20' },
    })
    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: '2024-09-10' },
    })

    expect(
      screen.getByText('To date must follow from date'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply dates' })).toBeDisabled()
  })

  it('shows an empty state when no dates match', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('20 days found')

    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2024-10-01' },
    })
    await user.click(screen.getByRole('button', { name: 'Apply dates' }))

    expect(await screen.findByText('0 days found')).toBeInTheDocument()
    expect(await screen.findByText('No days in this range')).toBeInTheDocument()
  })

  it('keeps the loading state visible while data is pending', () => {
    mockedGetDailyStatistics.mockReturnValueOnce(new Promise(() => undefined))

    render(<App />)

    expect(screen.getByText('Loading records...')).toBeInTheDocument()
  })

  it('shows a recoverable error when loading fails', async () => {
    const user = userEvent.setup()
    mockedGetDailyStatistics.mockRejectedValueOnce(new Error('Unavailable'))
    render(<App />)

    expect(
      await screen.findByText('Daily statistics could not be loaded.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('20 days found')).toBeInTheDocument()
  })
})
