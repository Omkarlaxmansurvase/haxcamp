import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { pool } from './db.js'
import authRoutes from './routes/auth.js' 
import productRoutes from './routes/products.js'
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/orders.js'
import adminRoutes from './routes/admin.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', async (req, res) => {
  const { rows } = await pool.query('SELECT NOW()')
  res.json({ ok: true, time: rows[0].now })
})

app.listen(process.env.PORT, () =>
  console.log(`API running on http://localhost:${process.env.PORT}`)
)