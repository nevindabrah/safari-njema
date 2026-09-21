// The blurred sticky top bar with the app name and sign in or sign out.
// Exists so every screen has the same way to get around.
import { Link } from 'react-router'
import { useAuth } from '../features/auth/useAuth'

export function TopBar() {
  const { user, signOut } = useAuth()
  return (
    <header className="sticky top-0 z-20 backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)' }}>
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
        <Link to={user ? '/trip' : '/'} className="font-display font-extrabold text-xl tracking-tight">
          Safari Njema
        </Link>
        <nav className="flex items-center gap-2 text-sm font-bold">
          {user && <Link to="/trip" className="px-3 py-2 rounded-pill hover:bg-tint">My trip</Link>}
          <Link to="/about" className="px-3 py-2 rounded-pill hover:bg-tint">About</Link>
          {user ? (
            <button onClick={signOut} className="px-3 py-2 rounded-pill hover:bg-tint cursor-pointer">Sign out</button>
          ) : (
            <Link to="/login" className="px-4 py-2 rounded-pill bg-primary text-on-primary">Log in</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
