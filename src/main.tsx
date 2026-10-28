import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/iosevka/300.css'
import '@fontsource/iosevka/400.css'
import '@fontsource/iosevka/500.css'
import './styles/tokens.css'
import './styles/global.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
