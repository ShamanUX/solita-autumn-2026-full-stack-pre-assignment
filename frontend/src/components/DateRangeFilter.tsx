import { Box, Button, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

export interface DateRange {
  from: string
  to: string
}

interface DateRangeFilterProps {
  dateRange: DateRange
  invalid: boolean
  onChange: (dateRange: DateRange) => void
  onApply: () => void
  onClear: () => void
}

export function DateRangeFilter({
  dateRange,
  invalid,
  onChange,
  onApply,
  onClear,
}: DateRangeFilterProps) {
  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
      sx={{
        p: { xs: 2.5, md: 2 },
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { md: 'flex-start' } }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h2" sx={{ fontSize: '1.25rem', mb: 0.5 }}>
              Search by date
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Both dates are optional and included in the results.
            </Typography>
          </Box>
          <DatePicker
            label="From"
            value={dateRange.from ? dayjs(dateRange.from) : null}
            {...(dateRange.to ? { maxDate: dayjs(dateRange.to) } : {})}
            onChange={(value) =>
              onChange({
                ...dateRange,
                from: value?.isValid() ? value.format('YYYY-MM-DD') : '',
              })
            }
            slotProps={{
              textField: {
                error: invalid,
                sx: {
                  width: { md: 190 },
                  '& .MuiPickersInputBase-root': { height: 44 },
                },
              },
            }}
          />
          <DatePicker
            label="To"
            value={dateRange.to ? dayjs(dateRange.to) : null}
            {...(dateRange.from ? { minDate: dayjs(dateRange.from) } : {})}
            onChange={(value) =>
              onChange({
                ...dateRange,
                to: value?.isValid() ? value.format('YYYY-MM-DD') : '',
              })
            }
            slotProps={{
              textField: {
                error: invalid,
                helperText: invalid ? 'To date must follow from date' : ' ',
                sx: {
                  width: { md: 190 },
                  '& .MuiPickersInputBase-root': { height: 44 },
                },
              },
            }}
          />
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={invalid}>
              Apply dates
            </Button>
            <Button type="button" color="inherit" onClick={onClear}>
              Clear
            </Button>
          </Stack>
        </Stack>
      </LocalizationProvider>
    </Box>
  )
}
