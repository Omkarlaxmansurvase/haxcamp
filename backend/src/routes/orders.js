import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.post('/checkout', async (req, res) => {
  const cart = await pool.query(
    `SELECT o.id FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = $1 AND o.status = 'cart' LIMIT 1`, [req.user.id])
  if (!cart.rows[0]) return res.status(400).json({ error: 'Cart is empty' })
  const orderId = cart.rows[0].id
  // lock in current prices at purchase time
  await pool.query(
    `UPDATE order_items oi SET price = p.price
     FROM products p WHERE oi.order_id = $1 AND p.id = oi.product_id`, [orderId])
  await pool.query(
    "UPDATE orders SET status = 'bought', bought_at = NOW() WHERE id = $1", [orderId])
  res.json({ ok: true, orderId })
})

router.post('/buy-now', async (req, res) => {
  const { productId, quantity = 1 } = req.body
  const prod = await pool.query('SELECT price FROM products WHERE id = $1', [productId])
  if (!prod.rows[0]) return res.status(404).json({ error: 'Product not found' })
  const order = await pool.query(
    "INSERT INTO orders (user_id, status, bought_at) VALUES ($1, 'bought', NOW()) RETURNING id",
    [req.user.id])
  await pool.query(
    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
    [order.rows[0].id, productId, quantity, prod.rows[0].price])
  res.status(201).json({ ok: true, orderId: order.rows[0].id })
})

router.get('/mine', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT o.id, o.bought_at,
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