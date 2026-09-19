import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { api, productImage } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Checkout() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [done, setDone] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!ready) return
    if (!user) return
    loadCart()
  }, [ready, user])

  function loadCart() {
    setLoading(true)
    api.getCart().then(setItems).finally(() => setLoading(false))
  }

  async function updateQty(itemId, quantity) {
    if (quantity < 1) return
    await api.updateCartItem(itemId, quantity)
    loadCart()
  }

  async function removeItem(itemId) {
    await api.removeCartItem(itemId)
    loadCart()
  }

  async function handleCheckout() {
    setPlacing(true)
    setError('')
    try {
      const res = await api.checkout()
      setDone(res.orderId)
    } catch (err) {
      setError(err.message)
    } finally {
      setPlacing(false)
    }
  }

  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)

  if (ready && !user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div className="container" style={{ flex: 1 }}>
          <div className="empty-state">
            <p>Log in to view your cart.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Back to home</Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (done) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div className="container" style={{ flex: 1 }}>
          <div className="empty-state">
            <h2 style={{ marginBottom: 12 }}>Order placed</h2>
            <p>Your order #{done} has been confirmed.</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: 20 }}>
              Keep browsing
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="container" style={{ flex: 1 }}>
        <div style={{ padding: '48px 0 30px' }}>
          <h1 className="page-title">Checkout</h1>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <p>Your cart is empty.</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>
              Browse the catalog
            </Link>
          </div>
        ) : (
          <div style={{ maxWidth: 640, paddingBottom: 80 }}>
            {items.map((item) => (
              <div className="cart-row" key={item.id}>
                <div className="cart-thumb"><img src={productImage(item.image)} alt={item.name} /></div>
                <div>
                  <div className="product-name">{item.name}</div>
                  <div className="product-price">${Number(item.price).toFixed(0)}</div>
                </div>
                <div className="qty-stepper">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => removeItem(item.id)}>Remove</button>
              </div>
            ))}

            <div className="summary-row total">
              <span>Total</span>
              <span>${total.toFixed(0)}</span>
            </div>

            {error && <div className="form-error" style={{ marginTop: 12 }}>{error}</div>}

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 24 }}
              disabled={placing}
              onClick={handleCheckout}
            >
              {placing ? 'Placing order…' : 'Place order'}
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
