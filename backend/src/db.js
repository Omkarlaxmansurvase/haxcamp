import pg from 'pg'
import 'dotenv/config'

const useSsl = /render\.com/.test(process.env.DATABASE_URL || '')

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
})