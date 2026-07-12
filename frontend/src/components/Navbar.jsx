import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './Button'

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/vehicles', label: 'Vehicles' },
  { to: '/drivers', label: 'Drivers' },
  { to: '/trips', label: 'Trips' },
  { to: '/maintenance', label: 'Maintenance' },
  { to: '/fuel-expenses', label: 'Fuel & Expenses' },
  { to: '/reports', label: 'Reports' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
              <span className="text-blue-600">🚚</span> TransitOps
            </Link>
            {user && (
              <div className="hidden lg:flex gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                      location.pathname === link.to
                        ? 'text-blue-700 bg-blue-50 font-medium'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-500 hidden sm:inline">
                  {user.username} <span className="text-gray-400">· {user.role?.replace('_', ' ')}</span>
                </span>
                <Button
                  variant="secondary"
                  onClick={() => { logout(); navigate('/login') }}
                  className="text-xs px-3 py-1.5"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600">Login</Link>
                <Link to="/register"><Button className="text-xs px-3 py-1.5">Sign up</Button></Link>
              </>
            )}
          </div>
        </div>
        {user && (
          <div className="lg:hidden flex gap-1 overflow-x-auto pb-2 -mx-1 px-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-xs px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                  location.pathname === link.to ? 'text-blue-700 bg-blue-50 font-medium' : 'text-gray-500 bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
