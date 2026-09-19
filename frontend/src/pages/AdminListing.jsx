import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductEditModal from '../components/ProductEditModal'
import { api, productImage } from '../api/client'

const METRICS = {
  revenue: 'Revenue',
  units: 'Units sold',
  buyers: 'Buyers',
}

export default function AdminListing() {
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [metric, setMetric] = useState('revenue')
  const [error, setError] = useState('')

  useEffect(() => {
    loadAll()
  }, [])

  function loadAll() {
    setError('')
    Promise.all([api.getProducts(), api.adminStats()])
      .then(([prods, s]) => {
        setProducts(prods)
        setStats(s)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  // errors are thrown to the modal, which shows them inside the form
  async function saveEdit(id, payload) {
    await api.updateProduct(id, payload)
    setEditingProduct(null)
    loadAll()
  }

  async function confirmDelete() {
    try {
      await api.deleteProduct(deleteTarget.id)
      setDeleteTarget(null)
      loadAll()
    } catch (err) {
      setDeleteTarget(null)
      setError(err.message)
    }
  }

  const categories = Array.from(new Set(products.map((p) => p.category)))
  const statsById = Object.fromEntries((stats?.perProduct || []).map((s) => [s.id, s]))
  const money = (v) => (metric === 'revenue' ? `$${v}` : v)

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
                  <div className="stat-card highlight">
                    <div className="num">${stats.totals.revenue.toFixed(0)}</div>
                    <div className="lbl">revenue</div>
                  </div>
                </div>

                <div className="chart-wrap">
                  <div className="chart-head">
                    <p className="eyebrow">Sales by product</p>
                    <div className="chart-tabs">
                      {Object.entries(METRICS).map(([key, label]) => (
                        <button
                          key={key}
                          className={metric === key ? 'active' : ''}
                          onClick={() => setMetric(key)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.perProduct} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                      <XAxis
                        dataKey="name"
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 12, fill: '#555' }}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: '#555' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={money}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                        contentStyle={{ border: '1px solid #e6e6de', borderRadius: 2, boxShadow: 'none', fontSize: 13 }}
                        formatter={(v) => [money(v), METRICS[metric]]}
                      />
                      <Bar dataKey={metric} fill="#FAE993" stroke="#000" strokeWidth={1} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            <p className="eyebrow">Products ({products.length})</p>

            {products.length === 0 ? (
              <div className="empty-state">No products listed.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Sold</th>
                    <th>Buyers</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const s = statsById[p.id]
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="admin-product">
                            <img src={productImage(p.image)} alt={p.name} />
                            <div>
                              <div className="admin-product-name">{p.name}</div>
                              {p.brand && <div className="admin-product-brand">{p.brand}</div>}
                            </div>
                          </div>
                        </td>
                        <td>{p.category}</td>
                        <td>${Number(p.price).toFixed(0)}</td>
                        <td>{s ? s.units : 0}</td>
                        <td>{s ? s.buyers : 0}</td>
                        <td className="admin-actions">
                          <button className="btn btn-outline btn-sm" onClick={() => setEditingProduct(p)}>
                            Edit
                          </button>
                          <button className="btn btn-ghost btn-sm admin-delete" onClick={() => setDeleteTarget(p)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSave={saveEdit}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="auth-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 28, marginBottom: 8 }}>Delete {deleteTarget.name}?</h3>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
              This also removes its sales history and cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-dark" onClick={confirmDelete}>Delete</button>
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}