// The shape of a profile row as the app reads it, and the profile the demo account uses.
// Exists so the auth provider and the profile hook share one definition without importing each other.
export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  is_teacher: boolean
}

export const DEMO_PROFILE: Profile = { id: 'demo-user', username: 'demo', display_name: 'Demo traveller', is_teacher: false }

export const PROFILE_COLUMNS = 'id, username, display_name, is_teacher'
