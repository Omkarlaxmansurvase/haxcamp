import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth()
  const [role, setRole] = useState('user')
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', adminSecret: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await login({ email: form.email, password: form.password, role })
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          role,
          adminSecret: form.adminSecret,
        })
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>

        <div className="role-toggle">
          <button
            type="button"
            className={role === 'user' ? 'active' : ''}
            onClick={() => setRole('user')}
          >
            User
          </button>
          <button
            type="button"
            className={role === 'admin' ? 'active' : ''}
            onClick={() => setRole('admin')}
          >
            Admin
          </button>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={tab === 'login' ? 'active' : ''}
            onClick={() => setTab('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={tab === 'register' ? 'active' : ''}
            onClick={() => setTab('register')}
          >
            Register
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="field">
              <label>Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>
          )}

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </div>

          {tab === 'register' && role === 'admin' && (
            <div className="field">
              <label>Admin secret</label>
              <input
                required
                value={form.adminSecret}
                onChange={(e) => update('adminSecret', e.target.value)}
              />
            </div>
          )}

          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Please wait…' : tab === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
