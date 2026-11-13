import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import '@fontsource/sacramento/400.css'
import './index.css'
import '@/components/ui/ui.css'
import './styles/hover.css'
import '@/motion/gsap'
import { router } from '@/app/routes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
