import axios from 'axios'

// In Codespaces, set VITE_API_URL in a .env file to your forwarded backend URL.
// Locally this defaults to the standard Django dev server port.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const client = axios.create({
  baseURL: API_BASE,
})

// Attach the auth token (if present) to every request automatically
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

export default client
