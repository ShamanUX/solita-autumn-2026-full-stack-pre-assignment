import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import dayjs, { type Dayjs } from 'dayjs'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DateRangeFilter } from './DateRangeFilter.js'

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({
    label,
    value,
    minDate,
    maxDate,
    onChange,
  }: {
    label: string
    value: Dayjs | null
    minDate?: Dayjs
    maxDate?: Dayjs
    onChange: (value: Dayjs | null) => void
  }) => (
    <input
      aria-label={label}
      type="date"
      value={value?.format('YYYY-MM-DD') ?? ''}
      min={minDate?.format('YYYY-MM-DD')}
      max={maxDate?.format('YYYY-MM-DD')}
      onChange={(event) =>
        onChange(event.target.value ? dayjs(event.target.value) : null)
      }
    />
  ),
}))

afterEach(cleanup)

describe('DateRangeFilter', () => {
  it('converts picker values to ISO dates and constrains the range', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <DateRangeFilter
        dateRange={{ from: '', to: '2024-09-30' }}
        invalid={false}
        onChange={onChange}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('From')).toHaveAttribute('max', '2024-09-30')
    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2024-09-01' },
    })
    expect(onChange).toHaveBeenCalledWith({
      from: '2024-09-01',
      to: '2024-09-30',
    })

    rerender(
      <DateRangeFilter
        dateRange={{ from: '2024-09-01', to: '' }}
        invalid={false}
        onChange={onChange}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('To')).toHaveAttribute('min', '2024-09-01')
  })
})
