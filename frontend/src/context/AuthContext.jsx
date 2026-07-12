import { createContext, useContext, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const username = localStorage.getItem('username')
    const role = localStorage.getItem('role')
    return username ? { username, role } : null
  })

  async function login(username, password) {
    const res = await client.post('/auth/login/', { username, password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('username', res.data.username)
    localStorage.setItem('role', res.data.role || '')
    setUser({ username: res.data.username, role: res.data.role })
  }

  async function register(username, email, password, role) {
    const res = await client.post('/auth/register/', { username, email, password, role })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('username', res.data.user.username)
    localStorage.setItem('role', res.data.user.profile?.role || role)
    setUser({ username: res.data.user.username, role: res.data.user.profile?.role || role })
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
