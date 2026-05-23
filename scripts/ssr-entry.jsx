import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from '../src/App.jsx'
import { AppProvider } from '../src/context/AppContext.jsx'

// Render a given route to an HTML string. Used by the smoke test to confirm
// every page mounts without throwing during render.
export function renderRoute(path) {
  return renderToString(
    <StaticRouter location={path}>
      <AppProvider>
        <App />
      </AppProvider>
    </StaticRouter>,
  )
}
