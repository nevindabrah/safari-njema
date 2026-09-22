// One file that lists every screen and its URL.
// Exists so anyone can see the whole app's map of routes at a glance.
import { createBrowserRouter } from 'react-router'
import { LandingScreen } from './features/landing/LandingScreen'
import { AboutScreen } from './features/landing/AboutScreen'
import { LoginScreen } from './features/auth/LoginScreen'
import { SignupScreen } from './features/auth/SignupScreen'
import { ForgotPasswordScreen, ResetPasswordScreen } from './features/auth/PasswordScreens'
import { RequireAuth } from './features/auth/RequireAuth'
import { PrivacyScreen } from './features/landing/PrivacyScreen'
import { NotFoundScreen } from './features/landing/NotFoundScreen'

const loading = <p className="p-8 text-center text-muted">Loading.</p>

export const router = createBrowserRouter([
  { path: '/', element: <LandingScreen />, errorElement: <NotFoundScreen /> },
  { path: '/privacy', element: <PrivacyScreen /> },
  {
    path: '/phrasebook',
    hydrateFallbackElement: loading,
    errorElement: <NotFoundScreen />,
    lazy: async () => ({ Component: (await import('./features/phrasebook/PhrasebookScreen')).PhrasebookScreen }),
  },
  {
    path: '/time',
    hydrateFallbackElement: loading,
    errorElement: <NotFoundScreen />,
    lazy: async () => ({ Component: (await import('./features/time/TimeScreen')).TimeScreen }),
  },
  { path: '/about', element: <AboutScreen /> },
  { path: '/login', element: <LoginScreen /> },
  { path: '/signup', element: <SignupScreen /> },
  { path: '/forgot', element: <ForgotPasswordScreen /> },
  { path: '/reset', element: <ResetPasswordScreen /> },
  {
    path: '/preview',
    hydrateFallbackElement: loading,
    lazy: async () => ({ Component: (await import('./features/lesson/PreviewLessonScreen')).PreviewLessonScreen }),
  },
  {
    element: <RequireAuth />,
    hydrateFallbackElement: loading,
    errorElement: <NotFoundScreen />,
    children: [
      {
        path: '/trip',
        lazy: async () => ({ Component: (await import('./features/trip/TripScreen')).TripScreen }),
      },
      {
        path: '/trip/:tripId',
        lazy: async () => ({ Component: (await import('./features/trip/TripScreen')).TripScreen }),
      },
      {
        path: '/welcome',
        lazy: async () => ({ Component: (await import('./features/auth/WelcomeScreen')).WelcomeScreen }),
      },
      {
        path: '/review',
        lazy: async () => ({ Component: (await import('./features/review/ReviewScreen')).ReviewScreen }),
      },
      {
        path: '/teacher',
        lazy: async () => ({ Component: (await import('./features/teacher/TeacherScreen')).TeacherScreen }),
      },
      {
        path: '/friends',
        lazy: async () => ({ Component: (await import('./features/friends/FriendsScreen')).FriendsScreen }),
      },
      {
        path: '/account',
        lazy: async () => ({ Component: (await import('./features/account/AccountScreen')).AccountScreen }),
      },
      {
        path: '/kangas',
        lazy: async () => ({ Component: (await import('./features/kangas/KangasScreen')).KangasScreen }),
      },
      {
        path: '/card/:id',
        lazy: async () => ({ Component: (await import('./features/card/PocketCardScreen')).PocketCardScreen }),
      },
      {
        path: '/lesson/:id',
        lazy: async () => ({ Component: (await import('./features/lesson/LessonScreen')).LessonScreen }),
      },
    ],
  },
  { path: '*', element: <NotFoundScreen /> },
])
