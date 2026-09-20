import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { productImage } from '../api/client'
import useLockBodyScroll from '../hooks/useLockBodyScroll'

export default function ProductDetailModal({ product, onClose, onAddToCart, adding }) {
  useLockBodyScroll()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!product) return null

  // Ensure features are parsed cleanly whether array or string
  let featuresList = []
  if (Array.isArray(product.features)) {
    featuresList = product.features
  } else if (typeof product.features === 'string' && product.features.trim()) {
    try {
      const parsed = JSON.parse(product.features)
      if (Array.isArray(parsed)) featuresList = parsed
    } catch {
      featuresList = product.features.split(',').map((s) => s.trim()).filter(Boolean)
    }
  }

  const specRows = [
    { label: 'Category', value: product.category },
    { label: 'Brand', value: product.brand },
    { label: 'Color / Finish', value: product.color },
    { label: 'Materials', value: product.materials },
    { label: 'Dimensions', value: product.dimensions },
    { label: 'Weight', value: product.weight },
    { label: 'Care Instructions', value: product.care },
  ].filter((r) => Boolean(r.value))

  async function handleAdd() {
    if (onAddToCart) {
      await onAddToCart(product, qty)
      setAdded(true)
      setTimeout(() => setAdded(false), 2200)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay product-modal-overlay"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <motion.div
          className="product-detail-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }}
        >
          <button
            className="modal-close product-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>

          <div className="product-modal-grid">
            {/* Left Column: Product Image */}
            <div className="product-modal-media">
              <div className="product-modal-image-wrap">
                <img
                  src={productImage(product.image)}
                  alt={product.name}
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right Column: Details & Specs */}
            <div className="product-modal-info">
              <div className="product-modal-header">
                <span className="product-modal-category">
                  {`{ ${product.category} }`}
                </span>
                <h2 className="product-modal-title">{product.name}</h2>
                <div className="product-modal-price">
                  ${Number(product.price).toFixed(0)}
                </div>
              </div>

              {/* Description */}
              <div className="product-modal-section">
                <p className="product-modal-desc">
                  {product.long_description || product.description || 'Thoughtfully crafted design piece blending timeless aesthetics with everyday function.'}
                </p>
              </div>

              {/* Specifications / Detail Lines */}
              {specRows.length > 0 && (
                <div className="product-modal-specs">
                  <span className="product-modal-section-title">Specifications</span>
                  <div className="spec-table">
                    {specRows.map((row) => (
                      <div className="spec-row" key={row.label}>
                        <span className="spec-label">{row.label}</span>
                        <span className="spec-value">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features List */}
              {featuresList.length > 0 && (
                <div className="product-modal-features">
                  <span className="product-modal-section-title">Highlights</span>
                  <ul className="features-list">
                    {featuresList.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Add to Cart Actions */}
              <div className="product-modal-actions">
                <div className="product-qty-wrap">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                  >
                    −
                  </button>
                  <span className="qty-num">{qty}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQty((q) => q + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-primary product-modal-add-btn"
                  onClick={handleAdd}
                  disabled={adding}
                >
                  {adding ? (
                    'Adding…'
                  ) : added ? (
                    '✓ Added to Cart'
                  ) : (
                    `Add to cart — $${(Number(product.price) * qty).toFixed(0)}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
