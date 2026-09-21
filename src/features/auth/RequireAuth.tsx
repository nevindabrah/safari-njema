// Wraps the private routes. Sends signed out visitors to the login screen.
// Exists so each private screen does not need its own redirect logic.
import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './useAuth'

export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p className="p-8 text-center text-muted">Loading your trip.</p>
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
