import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#d7ff3f',
      contrastText: '#070707',
    },
    secondary: {
      main: '#ff6b35',
    },
    background: {
      default: '#070707',
      paper: '#111212',
    },
    text: {
      primary: '#f4f4f2',
      secondary: '#b3b5b7',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"DM Sans", Arial, sans-serif',
    h1: {
      fontFamily: 'Jost, Arial, sans-serif',
      fontWeight: 600,
      lineHeight: 0.96,
      letterSpacing: '-0.045em',
    },
    h2: {
      fontFamily: 'Jost, Arial, sans-serif',
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minWidth: 320,
        },
        '*::selection': {
          color: '#070707',
          backgroundColor: '#d7ff3f',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          paddingInline: 20,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
  },
})
