import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  const { category } = req.query
  const { rows } = category
    ? await pool.query('SELECT * FROM products WHERE category = $1 ORDER BY id', [category])
    : await pool.query('SELECT * FROM products ORDER BY id')
  res.json(rows)
})

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id])
  if (!rows[0]) return res.status(404).json({ error: 'Product not found' })
  res.json(rows[0])
})


router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id])
  if (!rowCount) return res.status(404).json({ error: 'Product not found' })
  res.json({ ok: true })
})

// admin: edit details only (image is not editable)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const {
    name, category, description, price,
    long_description, brand, color, materials, dimensions, weight, care, features,
  } = req.body
  if (!name || !category || !(price >= 0))
    return res.status(400).json({ error: 'Name, category and valid price required' })
  if (features !== undefined && !Array.isArray(features))
    return res.status(400).json({ error: 'Features must be a list' })
  const { rows } = await pool.query(
    `UPDATE products SET
       name = $1, category = $2, description = $3, price = $4,
       long_description = COALESCE($5, long_description),
       brand            = COALESCE($6, brand),
       color            = COALESCE($7, color),
       materials        = COALESCE($8, materials),
       dimensions       = COALESCE($9, dimensions),
       weight           = COALESCE($10, weight),
       care             = COALESCE($11, care),
       features         = COALESCE($12, features)
     WHERE id = $13 RETURNING *`,
    [name, category, description, price, long_description, brand, color,
      materials, dimensions, weight, care, features, req.params.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Product not found' })
  res.json(rows[0])
})

export default router