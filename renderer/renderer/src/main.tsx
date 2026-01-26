import './assets/main.css'
import '../../../Public/css/cool-gui.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import NovaGlassCodeStudio from './Beta_Index.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NovaGlassCodeStudio />
  </StrictMode>
)
