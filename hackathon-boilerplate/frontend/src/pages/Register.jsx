import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  function validate() {
    const errs = {}
    if (!username.trim()) errs.username = 'Username is required.'
    if (!email.trim()) errs.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email.'
    if (!password || password.length < 6) errs.password = 'Password must be at least 6 characters.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      await register(username, email, password)
      navigate('/')
    } catch (err) {
      setErrors({ form: 'Could not create account. Username may already be taken.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Create account</h1>
      <form onSubmit={handleSubmit}>
        <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} error={errors.username} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        {errors.form && <p className="text-sm text-red-600 mb-4">{errors.form}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Sign up'}
        </Button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        Already have an account? <Link to="/login" className="text-indigo-600">Log in</Link>
      </p>
    </div>
  )
}
