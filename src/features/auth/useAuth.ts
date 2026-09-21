// A one line hook to read the auth context.
// Exists so components import useAuth instead of the context object.
import { useContext } from 'react'
import { AuthContext } from './AuthProvider'

export function useAuth() {
  return useContext(AuthContext)
}
