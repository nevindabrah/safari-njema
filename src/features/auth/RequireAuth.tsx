// Wraps the private routes. Sends signed out visitors to the login screen, and accounts with no username to the welcome step.
// Exists so each private screen does not need its own redirect logic.
import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './useAuth'
import { useProfile } from './useProfile'

export function RequireAuth() {
  const { user, loading } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const location = useLocation()

  if (loading || (user && profileLoading)) {
    return <p className="p-8 text-center text-muted">Loading your trip.</p>
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (profile && !profile.username && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />
  }
  return <Outlet />
}
