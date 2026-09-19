import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { productImage } from '../api/client'

export default function ProductEditModal({ product, categories = [], onClose, onSave }) {
  const [form, setForm] = useState({
    name: product.name || '',
    category: product.category || '',
    price: product.price ?? '',
    brand: product.brand || '',
    color: product.color || '',
    weight: product.weight || '',
    description: product.description || '',
    long_description: product.long_description || '',
    materials: product.materials || '',
    dimensions: product.dimensions || '',
    care: product.care || '',
    features: Array.isArray(product.features) ? product.features.join('\n') : '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSave(product.id, {
        ...form,
        price: Number(form.price),
        features: form.features.split('\n').map((s) => s.trim()).filter(Boolean),
      })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay edit-overlay">
      <motion.div
        className="edit-card"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>

        <form className="edit-form" onSubmit={handleSubmit}>
          <div className="edit-body">
            <div className="edit-media">
              <div className="edit-image">
                <img src={productImage(product.image)} alt={product.name} />
              </div>
              <p className="edit-media-note">The image can not be changed.</p>
            </div>

            <div className="edit-fields">
              <h2 className="edit-title">Edit product</h2>

              <div className="edit-grid">
                <div className="field">
                  <label>Name</label>
                  <input required value={form.name} onChange={(e) => update('name', e.target.value)} />
                </div>
                <div className="field">
                  <label>Category</label>
                  <input
                    required
                    list="category-options"
                    value={form.category}
                    onChange={(e) => update('category', e.target.value)}
                  />
                  <datalist id="category-options">
                    {categories.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="field">
                  <label>Price ($)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => update('price', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Brand</label>
                  <input value={form.brand} onChange={(e) => update('brand', e.target.value)} />
                </div>
                <div className="field">
                  <label>Color / Finish</label>
                  <input value={form.color} onChange={(e) => update('color', e.target.value)} />
                </div>
                <div className="field">
                  <label>Weight</label>
                  <input value={form.weight} onChange={(e) => update('weight', e.target.value)} />
                </div>

                <div className="field full">
                  <label>Short description</label>
                  <input value={form.description} onChange={(e) => update('description', e.target.value)} />
                </div>
                <div className="field full">
                  <label>Long description</label>
                  <textarea
                    rows={4}
                    value={form.long_description}
                    onChange={(e) => update('long_description', e.target.value)}
                  />
                </div>
                <div className="field full">
                  <label>Materials</label>
                  <input value={form.materials} onChange={(e) => update('materials', e.target.value)} />
                </div>
                <div className="field full">
                  <label>Dimensions</label>
                  <input value={form.dimensions} onChange={(e) => update('dimensions', e.target.value)} />
                </div>
                <div className="field full">
                  <label>Care instructions</label>
                  <textarea rows={2} value={form.care} onChange={(e) => update('care', e.target.value)} />
                </div>
                <div className="field full">
                  <label>Highlights</label>
                  <textarea
                    rows={4}
                    value={form.features}
                    onChange={(e) => update('features', e.target.value)}
                  />
                  <p className="field-hint">One highlight per line.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="edit-footer">
            {error && <span className="form-error">{error}</span>}
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-dark" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}