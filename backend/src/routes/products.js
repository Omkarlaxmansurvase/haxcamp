import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import multer from 'multer'
import { uploadBuffer, removeImage } from '../cloudinary.js'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new Error('Only image files are allowed')),
})

function uploadImage(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (!err) return next()
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 5 MB' : err.message
    res.status(400).json({ error: msg })
  })
}

function parseFeatures(raw) {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean)
  } catch {
    // not JSON, fall through to one-per-line
  }
  return String(raw).split('\n').map((s) => s.trim()).filter(Boolean)
}

const REQUIRED_FIELDS = [
  'name', 'category', 'description', 'long_description',
  'brand', 'color', 'materials', 'dimensions', 'weight', 'care',
]

router.get('/', async (req, res) => {
  const { category } = req.query
  const { rows } = category
    ? await pool.query('SELECT * FROM products WHERE category = $1 ORDER BY id', [category])
    : await pool.query('SELECT * FROM products ORDER BY id')
  res.json(rows)
})

// admin: list a new product (multipart form: fields + image file)
router.post('/', requireAuth, requireAdmin, uploadImage, async (req, res) => {
  const b = req.body
  const missing = REQUIRED_FIELDS.filter((f) => !b[f]?.trim())
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` })

  const price = Number(b.price)
  if (!(price > 0)) return res.status(400).json({ error: 'Price must be greater than 0' })

  const features = parseFeatures(b.features)
  if (!features.length) return res.status(400).json({ error: 'Add at least one highlight' })

  if (!req.file) return res.status(400).json({ error: 'Product image is required' })

  let uploaded
  try {
    uploaded = await uploadBuffer(req.file.buffer)
  } catch (err) {
    console.error('Cloudinary upload error:', err)
    return res.status(502).json({ error: 'Image upload failed' })
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO products
         (name, category, description, long_description, price, image, image_public_id,
          brand, color, materials, dimensions, weight, care, features)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        b.name.trim(), b.category.trim(), b.description.trim(), b.long_description.trim(),
        price, uploaded.secure_url, uploaded.public_id,
        b.brand.trim(), b.color.trim(), b.materials.trim(), b.dimensions.trim(),
        b.weight.trim(), b.care.trim(), features,
      ]
    )
    res.status(201).json(rows[0])
  } catch {
    // don't leave an orphaned image in Cloudinary
    await removeImage(uploaded.public_id).catch(() => {})
    res.status(500).json({ error: 'Could not save product' })
  }
})

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id])
  if (!rows[0]) return res.status(404).json({ error: 'Product not found' })
  res.json(rows[0])
})


router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    'DELETE FROM products WHERE id = $1 RETURNING image_public_id', [req.params.id])
  if (!rows[0]) return res.status(404).json({ error: 'Product not found' })
  if (rows[0].image_public_id) removeImage(rows[0].image_public_id).catch(() => {})
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