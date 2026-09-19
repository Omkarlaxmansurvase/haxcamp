import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth()
  const [role, setRole] = useState('user')
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', adminSecret: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  function update(field, value) {
    setError('')
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Basic client validation
    if (!form.email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (form.password.length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }
    if (tab === 'register' && !form.name.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (tab === 'register' && role === 'admin' && !form.adminSecret.trim()) {
      setError('Admin secret token is required.')
      return
    }

    setLoading(true)
    try {
      if (tab === 'login') {
        const user = await login({ email: form.email, password: form.password, role })
        setSuccessMsg(`Welcome back, ${user.name || 'member'}!`)
      } else {
        const user = await register({
          name: form.name,
          email: form.email,
          password: form.password,
          role,
          adminSecret: form.adminSecret,
        })
        setSuccessMsg(`Account created for ${user.name}!`)
      }
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 900)
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <motion.div
          className="auth-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }}
        >
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>

          {success ? (
            <motion.div
              className="auth-success-box"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }}
            >
              <div className="auth-success-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="auth-success-title">{tab === 'login' ? 'Authenticated' : 'Registered'}</h3>
              <p className="auth-success-text">{successMsg}</p>
            </motion.div>
          ) : (
            <>
              <div className="auth-header">
                {/* <span className="auth-tag">{"{ Luma Access }"}</span> */}
                <h3 className="auth-title">
                  {tab === 'login' ? 'Sign in to Luma' : 'Create an Account'}
                </h3>
                <p className="auth-sub">
                  {tab === 'login'
                    ? 'Access your curated catalog & bespoke items.'
                    : 'Join to explore contemporary interior solutions.'}
                </p>
              </div>

              {/* Animated Role Toggle */}
              <div className="role-toggle">
                <button
                  type="button"
                  className={`role-btn ${role === 'user' ? 'active' : ''}`}
                  onClick={() => setRole('user')}
                >
                  {role === 'user' && (
                    <motion.div
                      layoutId="rolePill"
                      className="role-pill-bg"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="role-btn-text">Customer</span>
                </button>
                <button
                  type="button"
                  className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                  onClick={() => setRole('admin')}
                >
                  {role === 'admin' && (
                    <motion.div
                      layoutId="rolePill"
                      className="role-pill-bg"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="role-btn-text">Admin</span>
                </button>
              </div>

              {/* Animated Tab Switch */}
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setTab('login')
                    setError('')
                  }}
                >
                  Sign In
                  {tab === 'login' && (
                    <motion.div
                      layoutId="tabUnderline"
                      className="auth-tab-underline"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
                <button
                  type="button"
                  className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setTab('register')
                    setError('')
                  }}
                >
                  Register
                  {tab === 'register' && (
                    <motion.div
                      layoutId="tabUnderline"
                      className="auth-tab-underline"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              </div>

              {/* Animated Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="form-error"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: [-6, 6, -4, 4, -2, 2, 0] }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg className="error-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} noValidate>
                <AnimatePresence initial={false}>
                  {tab === 'register' && (
                    <motion.div
                      className="field"
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 14 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25, ease: [0.2, 0.65, 0.3, 0.9] }}
                    >
                      <label>
                        Full Name <span className="req-star">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Omkar Survase"
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        autoComplete="name"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="field">
                  <label>
                    Email Address <span className="req-star">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className="field">
                  <label>
                    Password <span className="req-star">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  />
                </div>

                <AnimatePresence initial={false}>
                  {tab === 'register' && role === 'admin' && (
                    <motion.div
                      className="field"
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 14 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25, ease: [0.2, 0.65, 0.3, 0.9] }}
                    >
                      <label>
                        Admin key <span className="req-star">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="Enter master authorization key"
                        value={form.adminSecret}
                        onChange={(e) => update('adminSecret', e.target.value)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  className="btn btn-primary auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="auth-btn-loading">
                      <span className="auth-spinner"></span>
                      Authenticating…
                    </span>
                  ) : tab === 'login' ? (
                    role === 'admin' ? 'Sign in as Admin' : 'Sign In'
                  ) : (
                    role === 'admin' ? 'Register Admin Account' : 'Create Account'
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
