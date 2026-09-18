import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'

export default function Navbar({ overlay = false }) {
  const { user, logout } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <>
      <header className={`navbar ${overlay ? 'navbar-overlay' : ''}`}>
        <Link to="/" className="logo">Luma</Link>

        <nav className="nav-links">
          <Link to="/products" className={isActive('/products') ? 'active' : ''}>Catalog</Link>
          <a href="#about">About</a>
          <a href="#delivery">Delivery</a>
          <a href="#support">Support</a>
          {user?.role === 'admin' && (
            <Link to="/admin/listing" className={isActive('/admin/listing') ? 'active' : ''}>
              Listing
            </Link>
          )}
        </nav>

        <div className="nav-right">
          {user ? (
            <>
              {user.role !== 'admin' && (
                <Link to="/checkout" className="btn btn-outline btn-sm">Cart</Link>
              )}
              <span className="nav-user">Hi, {user.name}</span>
              <button className="btn btn-outline btn-sm" onClick={logout}>Log out</button>
            </>
          ) : (
            <button className="btn btn-outline" onClick={() => setShowAuth(true)}>Login</button>
          )}
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
