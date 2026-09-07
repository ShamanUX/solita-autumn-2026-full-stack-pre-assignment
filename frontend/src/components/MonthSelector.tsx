import dayjs from 'dayjs'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

interface MonthSelectorProps {
  month: string
  latestMonth: string
  onChange: (month: string) => void
}

export function MonthSelector({
  month,
  latestMonth,
  onChange,
}: MonthSelectorProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Month"
        views={['year', 'month']}
        openTo="month"
        value={month ? dayjs(`${month}-01`) : null}
        {...(latestMonth
          ? { maxDate: dayjs(`${latestMonth}-01`) }
          : {})}
        onChange={(value) => {
          if (value?.isValid()) onChange(value.format('YYYY-MM'))
        }}
        format="MMMM YYYY"
        slotProps={{
          textField: {
            size: 'small',
            sx: { width: 190 },
          },
        }}
      />
    </LocalizationProvider>
  )
}
