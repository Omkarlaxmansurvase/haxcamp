import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

async function getCartId(userId) {
  const found = await pool.query(
    "SELECT id FROM orders WHERE user_id = $1 AND status = 'cart'", [userId])
  if (found.rows[0]) return found.rows[0].id
  const created = await pool.query(
    'INSERT INTO orders (user_id) VALUES ($1) RETURNING id', [userId])
  return created.rows[0].id
}

router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT oi.id, oi.quantity, p.id AS product_id, p.name, p.price, p.image
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     JOIN products p ON p.id = oi.product_id
     WHERE o.user_id = $1 AND o.status = 'cart'
     ORDER BY oi.id`, [req.user.id])
  res.json(rows)
})

router.post('/', async (req, res) => {
  const { productId, quantity = 1 } = req.body
  const prod = await pool.query('SELECT price FROM products WHERE id = $1', [productId])
  if (!prod.rows[0]) return res.status(404).json({ error: 'Product not found' })
  const cartId = await getCartId(req.user.id)
  const existing = await pool.query(
    'SELECT id FROM order_items WHERE order_id = $1 AND product_id = $2', [cartId, productId])
  if (existing.rows[0]) {
    await pool.query(
      'UPDATE order_items SET quantity = quantity + $1 WHERE id = $2',
      [quantity, existing.rows[0].id])
  } else {
    await pool.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
      [cartId, productId, quantity, prod.rows[0].price])
  }
  res.status(201).json({ ok: true })
})

router.patch('/:itemId', async (req, res) => {
  const { quantity } = req.body
  if (!(quantity > 0)) return res.status(400).json({ error: 'Invalid quantity' })
  const { rowCount } = await pool.query(
    `UPDATE order_items oi SET quantity = $1 FROM orders o
     WHERE oi.id = $2 AND oi.order_id = o.id AND o.user_id = $3 AND o.status = 'cart'`,
    [quantity, req.params.itemId, req.user.id])
  if (!rowCount) return res.status(404).json({ error: 'Item not found' })
  res.json({ ok: true })
})

router.delete('/:itemId', async (req, res) => {
  const { rowCount } = await pool.query(
    `DELETE FROM order_items oi USING orders o
     WHERE oi.id = $1 AND oi.order_id = o.id AND o.user_id = $2 AND o.status = 'cart'`,
    [req.params.itemId, req.user.id])
  if (!rowCount) return res.status(404).json({ error: 'Item not found' })
  res.json({ ok: true })
})

export default router