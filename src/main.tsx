import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import Garde from './components/Garde'
import { AppProvider } from './store/AppContext'
import './styles/index.css'

const racine = document.getElementById('root')
if (!racine) throw new Error('#root introuvable')

createRoot(racine).render(
  <StrictMode>
    <Garde>
      <AppProvider>
        <App />
      </AppProvider>
    </Garde>
  </StrictMode>,
)
