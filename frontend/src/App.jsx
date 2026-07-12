import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import RequireAuth from './components/RequireAuth'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Drivers from './pages/Drivers'
import Trips from './pages/Trips'
import Maintenance from './pages/Maintenance'
import FuelExpenses from './pages/FuelExpenses'
import Reports from './pages/Reports'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<RequireAuth path="/"><Dashboard /></RequireAuth>} />
              <Route path="/vehicles" element={<RequireAuth path="/vehicles"><Vehicles /></RequireAuth>} />
              <Route path="/drivers" element={<RequireAuth path="/drivers"><Drivers /></RequireAuth>} />
              <Route path="/trips" element={<RequireAuth path="/trips"><Trips /></RequireAuth>} />
              <Route path="/maintenance" element={<RequireAuth path="/maintenance"><Maintenance /></RequireAuth>} />
              <Route path="/fuel-expenses" element={<RequireAuth path="/fuel-expenses"><FuelExpenses /></RequireAuth>} />
              <Route path="/reports" element={<RequireAuth path="/reports"><Reports /></RequireAuth>} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}