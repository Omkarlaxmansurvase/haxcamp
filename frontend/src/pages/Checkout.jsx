import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ShippingAddressForm from '../components/ShippingAddressForm'
import SHIPPING_COUNTRIES from '../data/shippingCountries'
import { api, productImage } from '../api/client'
import { useAuth } from '../context/AuthContext'

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true)
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function formatMoney(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'USD' || currency === 'JPY' || currency === 'KRW' ? 0 : 2,
    maximumFractionDigits: currency === 'USD' || currency === 'JPY' || currency === 'KRW' ? 0 : 2,
  }).format(amount)
}

export default function Checkout() {
  const { user, ready } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [showShipping, setShowShipping] = useState(false)
  const [done, setDone] = useState(null)
  const [error, setError] = useState('')
  const [shipping, setShipping] = useState({ phone: '', address_line: '', city: '', state: '', postal_code: '', country: '' })
  const [exchangeRate, setExchangeRate] = useState({ currency: 'USD', rate: 1, error: false })

  useEffect(() => {
    if (!ready) return
    if (!user) return
    loadCart()
  }, [ready, user])

  const selectedCurrency = SHIPPING_COUNTRIES.find((country) => country.name === shipping.country)?.currency || 'USD'

  useEffect(() => {
    if (selectedCurrency === 'USD') return
    const controller = new AbortController()
    fetch(`https://api.frankfurter.dev/v2/rate/USD/${selectedCurrency}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Exchange rate unavailable')
        return response.json()
      })
      .then((result) => {
        if (!controller.signal.aborted) {
          setExchangeRate({ currency: selectedCurrency, rate: result.rate, error: false })
        }
      })
      .catch((error) => {
        if (error.name !== 'AbortError' && !controller.signal.aborted) {
          setExchangeRate({ currency: selectedCurrency, rate: 1, error: true })
        }
      })
    return () => controller.abort()
  }, [selectedCurrency])

  const rateLoading = selectedCurrency !== 'USD' && exchangeRate.currency !== selectedCurrency
  const rateError = selectedCurrency !== 'USD' && exchangeRate.currency === selectedCurrency && exchangeRate.error

  function loadCart() {
    // setLoading(true)
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

  function updateShipping(event) {
    const { name, value } = event.target
    setShipping((current) => ({ ...current, [name]: value }))
  }

  async function handleCheckout(event) {
    event.preventDefault()
    setPlacing(true)
    setError('')
    try {
      const scriptReady = await loadRazorpay()
      if (!scriptReady) throw new Error('Could not load Razorpay. Check your connection and try again.')
      const order = await api.checkout(shipping)
      new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Luma',
        description: 'Order payment',
        order_id: order.razorpayOrderId,
        prefill: { name: user?.name || '', email: user?.email || '', contact: shipping.phone },
        theme: { color: '#d9bd43' },
        handler: async (payment) => {
          try {
            await api.verifyPayment({
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
            })
            setDone(order.orderId)
            setItems([])
          } catch (verifyError) {
            setError(verifyError.message || 'Payment verification failed. Please contact support.')
          } finally {
            setPlacing(false)
          }
        },
        modal: { ondismiss: () => setPlacing(false) },
      }).open()
    } catch (err) {
      setError(err.message)
      setPlacing(false)
    }
  }

  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)
  const displayCurrency = rateError ? 'USD' : selectedCurrency
  const displayRate = displayCurrency === 'USD' ? 1 : exchangeRate.currency === displayCurrency && !exchangeRate.error ? exchangeRate.rate : null
  const displayMoney = (amount) => displayRate === null ? '…' : formatMoney(amount * displayRate, displayCurrency)
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
                    <div className="checkout-unit">{displayMoney(Number(item.price))} each</div>
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
                    {displayMoney(Number(item.price) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <aside className="checkout-summary">
              <h2>Order summary</h2>
              <div className="summary-row"><span>Items</span><span>{itemCount}</span></div>
              <div className="summary-row"><span>Subtotal</span><span>{displayMoney(total)}</span></div>
              <div className="summary-row total"><span>Total</span><span>{displayMoney(total)}</span></div>
              {/* {rateLoading && <p className="shipping-rate-note">Updating currency conversion…</p>}
              {rateError && <p className="shipping-rate-note">Conversion unavailable; showing USD.</p>}
              <label className="checkout-country-field">
                <span>Delivery country / currency</span>
                <select name="country" value={shipping.country} onChange={updateShipping}>
                  <option value="">Select country to convert prices</option>
                  {SHIPPING_COUNTRIES.map((country) => (
                    <option key={country.name} value={country.name}>{country.name} ({country.currency})</option>
                  ))}
                </select>
              </label> */}

              {!showShipping ? (
                <button className="btn btn-dark" disabled={placing} onClick={() => { setError(''); setShowShipping(true) }}>
                  Place order
                </button>
              ) : null}
              <p className="checkout-note">Free returns within 30 days.</p>
            </aside>
          </div>
        )}
        {showShipping && items.length > 0 && (
          <ShippingAddressForm
            value={shipping}
            onChange={updateShipping}
            onSubmit={handleCheckout}
            onClose={() => { if (!placing) { setShowShipping(false); setError('') } }}
            submitting={placing}
            error={error}
            totalLabel={displayMoney(total)}
            rateLoading={rateLoading}
            rateError={rateError}
          />
        )}
      </div>
      <Footer />
    </div>
  )
}
