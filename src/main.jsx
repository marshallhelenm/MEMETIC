import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'semantic-ui-css/semantic.min.css'
import { GuessyProvider } from './contexts/GuessyContext.jsx'
import { WSProvider } from './contexts/WSContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WSProvider>
      <GuessyProvider>
        <App />
      </GuessyProvider>
    </WSProvider>
  </React.StrictMode>,
)
