// The root component. Wraps the router in the auth provider.
// Exists so every screen can read the signed in user from one place.
import { RouterProvider } from 'react-router'
import { AuthProvider } from './features/auth/AuthProvider'
import { router } from './routes'

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
