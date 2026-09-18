import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Products() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [allProducts, setAllProducts] = useState([])
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    setLoading(true)
    api.getProducts(category || undefined)
      .then(setAllProducts)
      .finally(() => setLoading(false))
  }, [category])

  const categories = Array.from(new Set(allProducts.map((p) => p.category)))

  async function handleAddToCart(product) {
    if (!user) {
      setToast('Log in to add items to your cart')
      return
    }
    setAddingId(product.id)
    try {
      await api.addToCart(product.id, 1)
      setToast(`${product.name} added to cart`)
    } catch (err) {
      setToast(err.message)
    } finally {
      setAddingId(null)
      setTimeout(() => setToast(''), 2500)
    }
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div style={{ padding: '48px 0 0' }}>
          <h1 className="page-title">Catalog</h1>
          <p className="page-sub">{allProducts.length} products</p>
        </div>

        {toast && (
          <div style={{ marginBottom: 20, fontSize: 14 }}>
            {toast}{' '}
            {!user && (
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
                go to landing to log in
              </button>
            )}
          </div>
        )}

        <div className="catalog-layout">
          <aside className="catalog-sidebar">
            <div
              className={`category-item ${!category ? 'active' : ''}`}
              onClick={() => setCategory('')}
            >
              All
            </div>
            {categories.map((cat) => (
              <div
                key={cat}
                className={`category-item ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </div>
            ))}
          </aside>

          <div>
            {loading ? (
              <p>Loading…</p>
            ) : allProducts.length === 0 ? (
              <div className="empty-state">No products in this category yet.</div>
            ) : (
              <div className="product-grid">
                {allProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={handleAddToCart}
                    adding={addingId === p.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
