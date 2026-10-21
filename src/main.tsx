import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { SesionCompartida } from './data/SesionCompartida'
import './styles/base.css'
import './styles/secciones.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SesionCompartida>
        <App />
      </SesionCompartida>
    </BrowserRouter>
  </StrictMode>,
)
