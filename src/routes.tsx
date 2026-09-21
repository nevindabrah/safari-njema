// One file that lists every screen and its URL.
// Exists so anyone can see the whole app's map of routes at a glance.
import { createBrowserRouter } from 'react-router'
import { LandingScreen } from './features/landing/LandingScreen'
import { AboutScreen } from './features/landing/AboutScreen'
import { LoginScreen } from './features/auth/LoginScreen'
import { SignupScreen } from './features/auth/SignupScreen'
import { RequireAuth } from './features/auth/RequireAuth'

// The heavier screens are loaded only when visited, so the landing page stays small.
export const router = createBrowserRouter([
  { path: '/', element: <LandingScreen /> },
  { path: '/about', element: <AboutScreen /> },
  { path: '/login', element: <LoginScreen /> },
  { path: '/signup', element: <SignupScreen /> },
  {
    path: '/preview',
    lazy: async () => ({ Component: (await import('./features/lesson/PreviewLessonScreen')).PreviewLessonScreen }),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/trip',
        lazy: async () => ({ Component: (await import('./features/trip/TripScreen')).TripScreen }),
      },
      {
        path: '/lesson/:id',
        lazy: async () => ({ Component: (await import('./features/lesson/LessonScreen')).LessonScreen }),
      },
    ],
  },
])
