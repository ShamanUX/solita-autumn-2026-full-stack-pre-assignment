import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DateRangeFilter } from './DateRangeFilter.js'

afterEach(cleanup)

describe('DateRangeFilter', () => {
  it('reports input changes and form actions', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onApply = vi.fn()
    const onClear = vi.fn()

    render(
      <DateRangeFilter
        dateRange={{ from: '', to: '' }}
        invalid={false}
        onChange={onChange}
        onApply={onApply}
        onClear={onClear}
      />,
    )

    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2024-09-15' },
    })
    expect(onChange).toHaveBeenCalledWith({ from: '2024-09-15', to: '' })

    await user.click(screen.getByRole('button', { name: 'Apply dates' }))
    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onApply).toHaveBeenCalledOnce()
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('shows and prevents submission of an invalid range', () => {
    render(
      <DateRangeFilter
        dateRange={{ from: '2024-09-20', to: '2024-09-10' }}
        invalid
        onChange={vi.fn()}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    expect(
      screen.getByText('To date must follow from date'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply dates' })).toBeDisabled()
  })
})
