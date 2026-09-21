// One file that lists every screen and its URL.
// Exists so anyone can see the whole app's map of routes at a glance.
import { createBrowserRouter } from 'react-router'
import { LandingScreen } from './features/landing/LandingScreen'
import { AboutScreen } from './features/landing/AboutScreen'
import { LoginScreen } from './features/auth/LoginScreen'
import { SignupScreen } from './features/auth/SignupScreen'
import { RequireAuth } from './features/auth/RequireAuth'
import { TripScreen } from './features/trip/TripScreen'
import { LessonScreen } from './features/lesson/LessonScreen'

export const router = createBrowserRouter([
  { path: '/', element: <LandingScreen /> },
  { path: '/about', element: <AboutScreen /> },
  { path: '/login', element: <LoginScreen /> },
  { path: '/signup', element: <SignupScreen /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/trip', element: <TripScreen /> },
      { path: '/lesson/:id', element: <LessonScreen /> },
    ],
  },
])
