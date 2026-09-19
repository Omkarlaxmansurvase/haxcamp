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
  const itemCount = items.reduce((n, i) => n + i.quantity, 0)
  const countLabel = `{${itemCount} ${itemCount === 1 ? 'item' : 'items'}}`

  if (ready && !user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div className="container" style={{ flex: 1 }}>
          <div className="empty-state">
            <h2>Your cart is waiting.</h2>
            <p>Log in to view your cart.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 24 }}>Back to home</Link>
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
          <div className="checkout-done">
            <p className="eyebrow">Order #{done}</p>
            <h2>Thank you.</h2>
            <p>Your order has been confirmed.</p>
            <Link to="/products" className="btn btn-dark" style={{ marginTop: 28 }}>
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
        <div className="checkout-head">
          <h1>Checkout</h1>
          {!loading && items.length > 0 && <p className="checkout-count">{countLabel}</p>}
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h2>Your cart is empty.</h2>
            <p>Find something you love in the catalog.</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: 24 }}>
              Browse the catalog
            </Link>
          </div>
        ) : (
          <div className="checkout-layout">
            <div className="checkout-items">
              {items.map((item) => (
                <div className="checkout-row" key={item.id}>
                  <div className="checkout-thumb">
                    <img src={productImage(item.image)} alt={item.name} />
                  </div>

                  <div>
                    <div className="checkout-name">{item.name}</div>
                    <div className="checkout-unit">${Number(item.price).toFixed(0)} each</div>
                    <button className="checkout-remove" onClick={() => removeItem(item.id)}>
                      Remove
                    </button>
                  </div>

                  <div className="qty-pill">
                    <button
                      aria-label="Decrease quantity"
                      disabled={item.quantity <= 1}
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="checkout-line-total">
                    ${(Number(item.price) * item.quantity).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>

            <aside className="checkout-summary">
              <h2>Order summary</h2>
              <div className="summary-row"><span>Items</span><span>{itemCount}</span></div>
              <div className="summary-row"><span>Subtotal</span><span>${total.toFixed(0)}</span></div>
              <div className="summary-row total"><span>Total</span><span>${total.toFixed(0)}</span></div>

              {error && <div className="form-error" style={{ marginTop: 12 }}>{error}</div>}

              <button className="btn btn-dark" disabled={placing} onClick={handleCheckout}>
                {placing ? 'Placing order…' : 'Place order'}
              </button>
              <p className="checkout-note">Free returns within 30 days.</p>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}