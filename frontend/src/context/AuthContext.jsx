import { createContext, useContext, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('username')
    return stored ? { username: stored } : null
  })

  async function login(username, password) {
    const res = await client.post('/auth/login/', { username, password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('username', res.data.username)
    setUser({ username: res.data.username })
  }

  async function register(username, email, password) {
    const res = await client.post('/auth/register/', { username, email, password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('username', res.data.user.username)
    setUser({ username: res.data.user.username })
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
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
