import { Box, Button, Stack, TextField, Typography } from '@mui/material'

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
        '& input[type="date"]': { colorScheme: 'dark' },
      }}
    >
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
        <TextField
          label="From"
          type="date"
          value={dateRange.from}
          onChange={(event) =>
            onChange({ ...dateRange, from: event.target.value })
          }
          error={invalid}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { max: dateRange.to || undefined },
          }}
          sx={{ width: { md: 190 } }}
        />
        <TextField
          label="To"
          type="date"
          value={dateRange.to}
          onChange={(event) =>
            onChange({ ...dateRange, to: event.target.value })
          }
          error={invalid}
          helperText={invalid ? 'To date must follow from date' : ' '}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: dateRange.from || undefined },
          }}
          sx={{ width: { md: 190 } }}
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
    </Box>
  )
}
