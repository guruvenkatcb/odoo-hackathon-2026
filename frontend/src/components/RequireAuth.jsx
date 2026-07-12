import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { canAccessRoute } from '../config/permissions'

// Mandatory rule: only authenticated users should access the application.
// Optionally also enforces role-based route access.
export default function RequireAuth({ children, path }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (path && !canAccessRoute(user.role, path)) return <Navigate to="/" replace />
  return children
}