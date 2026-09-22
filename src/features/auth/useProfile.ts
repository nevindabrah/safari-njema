// The signed in user's profile, read from the auth context so every screen sees the same row.
// Exists so screens can say useProfile() and get the profile, whether it is loading, and the ways to save and reload it.
import { useAuth } from './useAuth'
export type { Profile } from './profile'

export function useProfile() {
  const { profile, profileLoading, saveProfile, refreshProfile } = useAuth()
  return { profile, loading: profileLoading, save: saveProfile, reload: refreshProfile }
}
