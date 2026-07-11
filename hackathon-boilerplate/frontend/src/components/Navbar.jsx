import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './Button'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-indigo-600">
        HackApp
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-600">Hi, {user.username}</span>
            <Button
              variant="secondary"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-gray-600 hover:text-indigo-600">
              Login
            </Link>
            <Link to="/register">
              <Button>Sign up</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
