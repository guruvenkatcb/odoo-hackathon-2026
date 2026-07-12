import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './Button'

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/vehicles', label: 'Vehicles' },
  { to: '/drivers', label: 'Drivers' },
  { to: '/trips', label: 'Trips' },
  { to: '/maintenance', label: 'Maintenance' },
  { to: '/reports', label: 'Reports' },
  { to: '/fuel-expenses', label: 'Fuel & Expenses' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-xl font-bold text-indigo-600">TransitOps</Link>
        {user && (
          <div className="hidden md:flex gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm ${
                  location.pathname === link.to ? 'text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-600 hidden sm:inline">
              {user.username} <span className="text-gray-400">({user.role?.replace('_', ' ')})</span>
            </span>
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
            <Link to="/login" className="text-sm text-gray-600 hover:text-indigo-600">Login</Link>
            <Link to="/register"><Button>Sign up</Button></Link>
          </>
        )}
      </div>
    </nav>
  )
}
