import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider } from '@mui/material'

import { App } from './App.js'
import { theme } from './theme.js'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Application root element was not found')
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
