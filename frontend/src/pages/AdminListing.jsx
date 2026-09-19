import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { api, productImage } from '../api/client'

export default function AdminListing() {
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    loadAll()
  }, [])

  function loadAll() {
    setLoading(true)
    Promise.all([api.getProducts(), api.adminStats()])
      .then(([prods, s]) => {
        setProducts(prods)
        setStats(s)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  function startEdit(p) {
    setEditingId(p.id)
    setEditForm({ name: p.name, category: p.category, description: p.description || '', price: p.price })
  }

  async function saveEdit(id) {
    try {
      await api.updateProduct(id, editForm)
      setEditingId(null)
      loadAll()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product? This cannot be undone.')) return
    try {
      await api.deleteProduct(id)
      loadAll()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingBottom: 100 }}>
        <div style={{ padding: '48px 0 30px' }}>
          <h1 className="page-title">Listing</h1>
          <p className="page-sub">Manage existing products, prices, and see how they're selling.</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        {loading ? (
          <p>Loading…</p>
        ) : (
          <>
            {stats && (
              <>
                <div className="stat-cards">
                  <div className="stat-card">
                    <div className="num">{stats.totals.orders}</div>
                    <div className="lbl">orders</div>
                  </div>
                  <div className="stat-card">
                    <div className="num">{stats.totals.units}</div>
                    <div className="lbl">units sold</div>
                  </div>
                  <div className="stat-card">
                    <div className="num">${stats.totals.revenue.toFixed(0)}</div>
                    <div className="lbl">revenue</div>
                  </div>
                </div>

                <div className="chart-wrap">
                  <p className="eyebrow">Revenue by product</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={stats.perProduct}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#FAE993" stroke="#000" strokeWidth={1} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  editingId === p.id ? (
                    <tr className="edit-row" key={p.id}>
                      <td><img src={productImage(p.image)} alt={p.name} /></td>
                      <td>
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        />
                      </td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => saveEdit(p.id)}>Save</button>{' '}
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={p.id}>
                      <td><img src={productImage(p.image)} alt={p.name} /></td>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>${Number(p.price).toFixed(0)}</td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => startEdit(p)}>Edit</button>{' '}
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
