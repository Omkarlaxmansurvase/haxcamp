import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'

const MAX_SIZE = 5 * 1024 * 1024

const EMPTY = {
  name: '', category: '', price: '', brand: '', color: '', weight: '',
  description: '', long_description: '', materials: '', dimensions: '', care: '', features: '',
}

const SHORT_FIELDS = [
  { key: 'name', label: 'Name', placeholder: 'Wooden Chair' },
  { key: 'category', label: 'Category', placeholder: 'Furniture', list: true },
  { key: 'price', label: 'Price ($)', placeholder: '149', type: 'number' },
  { key: 'brand', label: 'Brand', placeholder: 'Alder House' },
  { key: 'color', label: 'Color / Finish', placeholder: 'Natural oak' },
  { key: 'weight', label: 'Weight', placeholder: '5.2 kg' },
]

const WIDE_FIELDS = [
  { key: 'description', label: 'Short description', placeholder: 'One line shown on the product card' },
  { key: 'long_description', label: 'Long description', rows: 4 },
  { key: 'materials', label: 'Materials', placeholder: 'Solid oak frame, linen upholstery' },
  { key: 'dimensions', label: 'Dimensions', placeholder: 'W 54 x D 52 x H 78 cm' },
  { key: 'care', label: 'Care instructions', rows: 2 },
  { key: 'features', label: 'Highlights', rows: 4, hint: 'One highlight per line.' },
]

export default function ProductCreateModal({ categories = [], onClose, onCreate }) {
  const [form, setForm] = useState(EMPTY)
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function pickFile(f) {
    if (!f) return
    if (!f.type.startsWith('image/')) return setError('Only image files are allowed')
    if (f.size > MAX_SIZE) return setError('Image must be under 5 MB')
    setError('')
    setFile(f)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    pickFile(e.dataTransfer.files[0])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!file) return setError('Please upload a product image')
    const features = form.features.split('\n').map((s) => s.trim()).filter(Boolean)
    const blank = Object.values(form).some((v) => !v.trim())
    if (blank || !features.length) return setError('All fields are required')
    if (!(Number(form.price) > 0)) return setError('Price must be greater than 0')

    const data = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      if (key !== 'features') data.append(key, value.trim())
    })
    data.append('features', JSON.stringify(features))
    data.append('image', file)

    setSaving(true)
    try {
      await onCreate(data)
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

        <form className="edit-form" onSubmit={handleSubmit} noValidate>
          <div className="edit-body">
            <div className="edit-media">
              <label
                className={`upload-drop ${preview ? 'has-image' : ''} ${dragging ? 'dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => pickFile(e.target.files[0])}
                />
                {preview ? (
                  <img src={preview} alt="Preview" />
                ) : (
                  <div className="upload-prompt">
                    <span className="upload-plus">+</span>
                    <span>Upload product image</span>
                    <small>PNG or JPG, up to 5 MB</small>
                  </div>
                )}
              </label>
              <p className="edit-media-note">
                {file
                  ? `${file.name} · click the image to change it`
                  : 'Required. The image can not be changed after listing.'}
              </p>
            </div>

            <div className="edit-fields">
              <h2 className="edit-title" style={{ marginBottom: 6 }}>New listing</h2>
              <p className="edit-sub">Every field and the image are required.</p>

              <div className="edit-grid">
                {SHORT_FIELDS.map((f) => (
                  <div className="field" key={f.key}>
                    <label>{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      {...(f.type === 'number' && { min: '0.01', step: '0.01' })}
                      list={f.list ? 'new-category-options' : undefined}
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={(e) => update(f.key, e.target.value)}
                    />
                  </div>
                ))}
                <datalist id="new-category-options">
                  {categories.map((c) => <option key={c} value={c} />)}
                </datalist>

                {WIDE_FIELDS.map((f) => (
                  <div className="field full" key={f.key}>
                    <label>{f.label}</label>
                    {f.rows ? (
                      <textarea
                        rows={f.rows}
                        placeholder={f.placeholder}
                        value={form[f.key]}
                        onChange={(e) => update(f.key, e.target.value)}
                      />
                    ) : (
                      <input
                        placeholder={f.placeholder}
                        value={form[f.key]}
                        onChange={(e) => update(f.key, e.target.value)}
                      />
                    )}
                    {f.hint && <p className="field-hint">{f.hint}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="edit-footer">
            {error && <span className="form-error">{error}</span>}
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-dark" disabled={saving}>
              {saving ? 'Listing…' : 'List product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}