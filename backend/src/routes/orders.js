import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import crypto from 'crypto'
import { razorpay } from '../razorpay.js'


const PHONE_RE = /^\+?\d{7,15}$/
const POSTAL_RE = /^[A-Za-z0-9 -]{3,10}$/

const router = Router()
router.use(requireAuth)

function validateShipping(body = {}) {
  const clean = (v) => (typeof v === 'string' ? v.trim() : '')
  const s = {
    phone: clean(body.phone).replace(/[\s()-]/g, ''),
    address_line: clean(body.address_line),
    city: clean(body.city),
    state: clean(body.state),
    postal_code: clean(body.postal_code),
    country: clean(body.country),
  }
  if (!PHONE_RE.test(s.phone)) return { error: 'Enter a valid phone number' }
  if (s.address_line.length < 5) return { error: 'Enter your full address' }
  if (!s.city) return { error: 'City is required' }
  if (!s.state) return { error: 'State is required' }
  if (!POSTAL_RE.test(s.postal_code)) return { error: 'Enter a valid postal code' }
  if (!s.country) return { error: 'Country is required' }
  if (Object.values(s).some((v) => v.length > 200)) return { error: 'Details are too long' }
  return { shipping: s }
}

router.post('/checkout', async (req, res) => {
  const { error, shipping } = validateShipping(req.body)
  if (error) return res.status(400).json({ error })

  const cart = await pool.query(
    `SELECT o.id FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = $1 AND o.status = 'cart' LIMIT 1`, [req.user.id])
  if (!cart.rows[0]) return res.status(400).json({ error: 'Cart is empty' })
  const orderId = cart.rows[0].id

  const user = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id])
  if (!user.rows[0]) return res.status(401).json({ error: 'User not found' })

  // Product prices are stored in USD. Calculate the INR charge on the server,
  // using the same reference-rate source as the checkout display.
  const totalRes = await pool.query(
    `SELECT SUM(oi.quantity * p.price) AS total
     FROM order_items oi JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`, [orderId])
  const totalUsd = Number(totalRes.rows[0].total)
  if (!(totalUsd > 0)) return res.status(400).json({ error: 'Cart is empty' })

  let amountPaise
  try {
    const rateResponse = await fetch('https://api.frankfurter.dev/v2/rate/USD/INR', {
      signal: AbortSignal.timeout(5000),
    })
    if (!rateResponse.ok) throw new Error(`Exchange rate request failed (${rateResponse.status})`)
    const { rate } = await rateResponse.json()
    if (!(Number(rate) > 0)) throw new Error('Invalid USD to INR exchange rate')
    amountPaise = Math.round(totalUsd * Number(rate) * 100)
  } catch (err) {
    console.error('USD to INR conversion failed:', err)
    return res.status(502).json({ error: 'Could not calculate the INR payment amount' })
  }

  let rpOrder
  try {
    rpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `order_${orderId}`,
    })
  } catch (err) {
    console.error('Razorpay order creation failed:', err)
    return res.status(502).json({ error: 'Could not start payment' })
  }

  await pool.query(
    `UPDATE orders SET
       shipping_name = $2, phone = $3, address_line = $4,
       city = $5, state = $6, postal_code = $7, country = $8,
       razorpay_order_id = $9, payment_amount = $10
     WHERE id = $1`,
    [orderId, user.rows[0].name, shipping.phone, shipping.address_line,
     shipping.city, shipping.state, shipping.postal_code, shipping.country,
     rpOrder.id, amountPaise]
  )

  res.json({
    orderId,
    razorpayOrderId: rpOrder.id,
    amount: amountPaise,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID,
  })
})

router.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
    return res.status(400).json({ error: 'Missing payment details' })

  const order = await pool.query(
    `SELECT id FROM orders
     WHERE razorpay_order_id = $1 AND user_id = $2 AND status = 'cart'`,
    [razorpay_order_id, req.user.id])
  if (!order.rows[0]) return res.status(404).json({ error: 'Order not found' })

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expected !== razorpay_signature)
    return res.status(400).json({ error: 'Payment verification failed' })

  const orderId = order.rows[0].id

  // lock in current prices at the moment of confirmed payment
  await pool.query(
    `UPDATE order_items oi SET price = p.price
     FROM products p WHERE oi.order_id = $1 AND p.id = oi.product_id`, [orderId])

  await pool.query(
    `UPDATE orders SET status = 'bought', bought_at = NOW(),
       razorpay_payment_id = $2, paid_at = NOW()
     WHERE id = $1`,
    [orderId, razorpay_payment_id]
  )

  res.json({ ok: true, orderId })
})

// buy now commented beacause the checkout rout now handles both 

// router.post('/buy-now', async (req, res) => {
//   const { productId, quantity = 1 } = req.body
//   const { error, shipping } = validateShipping(req.body)
//   if (error) return res.status(400).json({ error })

//   const prod = await pool.query('SELECT price FROM products WHERE id = $1', [productId])
//   if (!prod.rows[0]) return res.status(404).json({ error: 'Product not found' })

//   const user = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id])
//   if (!user.rows[0]) return res.status(401).json({ error: 'User not found' })

//   const order = await pool.query(
//     `INSERT INTO orders
//        (user_id, status, bought_at, shipping_name, phone, address_line, city, state, postal_code, country)
//      VALUES ($1, 'bought', NOW(), $2, $3, $4, $5, $6, $7, $8)
//      RETURNING id`,
//     [req.user.id, user.rows[0].name, shipping.phone, shipping.address_line,
//      shipping.city, shipping.state, shipping.postal_code, shipping.country]
//   )
//   await pool.query(
//     'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
//     [order.rows[0].id, productId, quantity, prod.rows[0].price])
//   res.status(201).json({ ok: true, orderId: order.rows[0].id })
// })

router.get('/mine', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT o.id, o.bought_at,
       o.shipping_name, o.phone, o.address_line, o.city, o.state, o.postal_code, o.country,
       json_agg(json_build_object(
         'name', p.name, 'image', p.image, 'quantity', oi.quantity, 'price', oi.price
       )) AS items,
       SUM(oi.quantity * oi.price) AS total
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     JOIN products p ON p.id = oi.product_id
     WHERE o.user_id = $1 AND o.status = 'bought'
     GROUP BY o.id ORDER BY o.bought_at DESC`, [req.user.id])
  res.json(rows)
})

export default router
