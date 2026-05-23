import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import ConsoleApp from './ConsoleApp.jsx'
import { AppProvider } from '../context/AppContext.jsx'

// Self-hosted fonts — shared with the consumer app.
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/geist-sans/400.css'
import '@fontsource/geist-sans/500.css'
import '@fontsource/geist-sans/600.css'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/500.css'

import '../index.css'

// HashRouter keeps the console deployable as a standalone static app on its own
// port/host with no server-side route rewrites.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AppProvider>
        <ConsoleApp />
      </AppProvider>
    </HashRouter>
  </React.StrictMode>,
)
