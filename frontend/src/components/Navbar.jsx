import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'

export default function Navbar({ overlay = false }) {
  const { user, logout } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  return (
    <>
      <header className={`navbar ${overlay ? 'navbar-overlay' : ''}`}>
        <Link to="/" className="logo">Luma</Link>

        <nav className="nav-links">
          <Link to="/products" className={isActive('/products') ? 'active' : ''}>Catalog</Link>
          <a href="#about">About</a>
          <a href="#delivery">Delivery</a>
          <a href="#support">Support</a>
        </nav>

        <div className="nav-right" ref={menuRef} style={{ position: 'relative' }}>
          {user ? (
            <>
              <button
                className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="Toggle user menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>

              {menuOpen && (
                <div className="nav-menu-dropdown">
                  {user.role === 'admin' ? (
                    <Link
                      to="/admin/listing"
                      className="nav-menu-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      Listing
                    </Link>
                  ) : (
                    <Link
                      to="/checkout"
                      className="nav-menu-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      Cart
                    </Link>
                  )}
                  <button
                    className="nav-menu-item"
                    onClick={() => {
                      setMenuOpen(false)
                      logout()
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <button className="nav-login" onClick={() => setShowAuth(true)}>Login</button>
          )}
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
