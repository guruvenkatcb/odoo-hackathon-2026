import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
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
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
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
                        ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 font-medium'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="text-sm w-8 h-8 flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {user ? (
              <>
                <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                  {user.username} <span className="text-gray-400 dark:text-gray-500">· {user.role?.replace('_', ' ')}</span>
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
                <Link to="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Login</Link>
                <Link to="/register"><Button className="text-xs px-3 py-1.5">Sign up</Button></Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}