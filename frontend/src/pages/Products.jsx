import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import ProductDetailModal from '../components/ProductDetailModal'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import AnimatedTitle from '../components/animations/AnimatedTitle'
import AnimatedBody from '../components/animations/AnimatedBody'
import ScrollReveal from '../components/animations/ScrollReveal'

export default function Products() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [allProducts, setAllProducts] = useState([])
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    setLoading(true)
    api.getProducts(category || undefined)
      .then(setAllProducts)
      .finally(() => setLoading(false))
  }, [category])

  const categories = Array.from(new Set(allProducts.map((p) => p.category)))

  async function handleAddToCart(product, quantity = 1) {
    if (!user) {
      setToast('Log in to add items to your cart')
      return
    }
    setAddingId(product.id)
    try {
      await api.addToCart(product.id, quantity)
      setToast(`${product.name} (${quantity}) added to cart`)
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
          <AnimatedTitle text="Catalog" className="page-title" tag="h1" delay={0.05} />
          <AnimatedBody text={`${allProducts.length} products`} className="page-sub" delay={0.2} />
        </div>

        {toast && (
          <ScrollReveal delay={0} y={-10}>
            <div style={{ marginBottom: 20, fontSize: 14 }}>
              {toast}{' '}
              {!user && (
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
                  go to landing to log in
                </button>
              )}
            </div>
          </ScrollReveal>
        )}

        <div className="catalog-layout">
          <aside className="catalog-sidebar">
            <ScrollReveal delay={0.1} y={15}>
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
            </ScrollReveal>
          </aside>

          <div>
            {loading ? (
              <p>Loading…</p>
            ) : allProducts.length === 0 ? (
              <div className="empty-state">No products in this category yet.</div>
            ) : (
              <div className="product-grid">
                {allProducts.map((p, idx) => (
                  <ScrollReveal key={p.id} delay={Math.min((idx % 8) * 0.05, 0.35)} y={15}>
                    <ProductCard
                      product={p}
                      onAddToCart={handleAddToCart}
                      adding={addingId === p.id}
                      onClick={(product) => setSelectedProduct(product)}
                    />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          adding={addingId === selectedProduct.id}
        />
      )}

      <Footer />
    </div>
  )
}
