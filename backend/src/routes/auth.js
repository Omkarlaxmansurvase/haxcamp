import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const sign = (u) =>
  jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role })

router.post('/register', async (req, res) => {
  const { name, email, password, role = 'user', adminSecret } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields required' })
  if (role === 'admin' && adminSecret !== process.env.ADMIN_SECRET)
    return res.status(403).json({ error: 'Invalid admin secret' })
  try {
    const hash = await bcrypt.hash(password, 10)
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email.toLowerCase(), hash, role === 'admin' ? 'admin' : 'user']
    )
    res.status(201).json({ token: sign(rows[0]), user: publicUser(rows[0]) })
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email already registered' })
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password, role } = req.body
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email?.toLowerCase()])
  const user = rows[0]
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: 'Wrong email or password' })
  if (role && role !== user.role)
    return res.status(403).json({ error: `This account is not a ${role} account` })
  res.json({ token: sign(user), user: publicUser(user) })
})

router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id])
  if (!rows[0]) return res.status(401).json({ error: 'User not found' })
  res.json({ user: publicUser(rows[0]) })
})

export default router