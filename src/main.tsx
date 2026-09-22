// Entry point. Mounts the React app into index.html.
// Exists so App.tsx stays free of DOM setup.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const whenIdle = window.requestIdleCallback ?? ((run: () => void) => setTimeout(run, 1500))
whenIdle(() => {
  import('./features/trip/TripScreen')
  import('./features/lesson/LessonScreen')
  import('./features/demo/demoTrip')
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
