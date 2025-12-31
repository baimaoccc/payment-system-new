import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app.jsx'
import { store } from './store/index.js'
import { I18nProvider } from './plugins/i18n/index.jsx'
import './styles/index.css'

/**
 * 中文：应用入口，挂载 Redux 与 i18n 提供器，并启用 Router
 * English: App entry; mounts Redux and i18n providers, enables Router
 */
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </I18nProvider>
    </Provider>
  </React.StrictMode>
)
