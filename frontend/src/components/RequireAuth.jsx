import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Mandatory rule: only authenticated users should access the application.
export default function RequireAuth({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}
