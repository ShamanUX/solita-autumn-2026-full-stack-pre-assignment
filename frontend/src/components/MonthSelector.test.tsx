import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MonthSelector } from './MonthSelector.js'

afterEach(cleanup)

describe('MonthSelector', () => {
  it('displays the selected month and reports picker changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <MonthSelector
        month="2024-09"
        latestMonth="2024-09"
        onChange={onChange}
      />,
    )

    expect(screen.getByRole('spinbutton', { name: 'Month' })).toHaveAttribute(
      'aria-valuetext',
      'September',
    )

    await user.click(
      screen.getByRole('button', { name: /Choose date, selected date/ }),
    )
    await user.click(screen.getByRole('radio', { name: 'August' }))

    expect(onChange).toHaveBeenCalledWith('2024-08')
  })
})
