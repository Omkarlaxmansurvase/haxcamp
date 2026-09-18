import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth, requireAdmin)

router.get('/stats', async (req, res) => {
  const perProduct = await pool.query(
    `SELECT p.id, p.name,
       COALESCE(SUM(b.quantity), 0)::int AS units,
       COUNT(DISTINCT b.user_id)::int AS buyers,
       COALESCE(SUM(b.quantity * b.price), 0)::float AS revenue
     FROM products p
     LEFT JOIN (
       SELECT oi.product_id, oi.quantity, oi.price, o.user_id
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id AND o.status = 'bought'
     ) b ON b.product_id = p.id
     GROUP BY p.id ORDER BY p.id`)

  const perDay = await pool.query(
    `SELECT to_char(o.bought_at::date, 'YYYY-MM-DD') AS day,
       SUM(oi.quantity)::int AS units,
       SUM(oi.quantity * oi.price)::float AS revenue
     FROM orders o JOIN order_items oi ON oi.order_id = o.id
     WHERE o.status = 'bought'
     GROUP BY 1 ORDER BY 1`)

  const orderCount = await pool.query(
    "SELECT COUNT(*)::int AS n FROM orders WHERE status = 'bought'")

  res.json({
    totals: {
      orders: orderCount.rows[0].n,
      units: perProduct.rows.reduce((s, r) => s + r.units, 0),
      revenue: perProduct.rows.reduce((s, r) => s + r.revenue, 0),
    },
    perProduct: perProduct.rows,
    perDay: perDay.rows,
  })
})

router.get('/orders', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT o.id, o.bought_at, u.name AS user_name, u.email,
       json_agg(json_build_object(
         'name', p.name, 'quantity', oi.quantity, 'price', oi.price
       )) AS items,
       SUM(oi.quantity * oi.price) AS total
     FROM orders o
     JOIN users u ON u.id = o.user_id
     JOIN order_items oi ON oi.order_id = o.id
     JOIN products p ON p.id = oi.product_id
     WHERE o.status = 'bought'
     GROUP BY o.id, u.name, u.email ORDER BY o.bought_at DESC`)
  res.json(rows)
})

export default router