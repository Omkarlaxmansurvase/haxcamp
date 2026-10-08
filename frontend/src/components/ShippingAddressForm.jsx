import { useEffect } from 'react'
import { motion } from 'framer-motion'
import useLockBodyScroll from '../hooks/useLockBodyScroll'
import SHIPPING_COUNTRIES from '../data/shippingCountries'

function flagEmoji(code) {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
}

const fields = [
  { name: 'phone', label: 'Phone', autoComplete: 'tel', type: 'tel', required: true },
  { name: 'address_line', label: 'Street address', autoComplete: 'street-address', required: true, wide: true },
  { name: 'city', label: 'City', autoComplete: 'address-level2', required: true },
  { name: 'state', label: 'State / region', autoComplete: 'address-level1', required: true },
  { name: 'postal_code', label: 'Postal code', autoComplete: 'postal-code', required: true },
]

export default function ShippingAddressForm({ value, onChange, onSubmit, onClose, submitting, error, totalLabel, rateLoading, rateError }) {
  useLockBodyScroll()

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !submitting) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, submitting])

  return (
    <div className="modal-overlay shipping-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onClose() }}>
      <motion.section
        className="shipping-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shipping-modal-title"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.2, 0.65, 0.3, 0.9] }}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close" disabled={submitting}>&times;</button>
        <form className="shipping-form" onSubmit={onSubmit}>
          <div className="shipping-form-heading">
            <p className="eyebrow">Delivery details</p>
            <h2 id="shipping-modal-title">Where should we send it?</h2>
          </div>
          <div className="shipping-fields">
            {fields.map((field) => (
              <label className={field.wide ? 'shipping-field shipping-field-wide' : 'shipping-field'} key={field.name}>
                <span>{field.label}</span>
                <input
                  name={field.name}
                  type={field.type || 'text'}
                  autoComplete={field.autoComplete}
                  value={value[field.name]}
                  onChange={onChange}
                  required={field.required}
                  maxLength={200}
                />
              </label>
            ))}
            <label className="shipping-field shipping-field-wide">
  <span>Country</span>
  <select name="country" autoComplete="country-name" value={value.country} onChange={onChange} required>
    <option value="">Select country</option>
    {SHIPPING_COUNTRIES.map((country) => (
      <option key={country.name} value={country.name}>
  {flagEmoji(country.code)} {country.name} ({country.currency})
</option>
    ))}
  </select>
</label>
          </div>
          <div className="shipping-price-preview">
            <span>Estimated total</span>
            <strong>{rateLoading ? 'Updating…' : totalLabel}</strong>
          </div>
          {rateError && <p className="shipping-rate-note">Could not load the latest conversion rate. The amount is shown in USD.</p>}
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="btn btn-dark shipping-submit" type="submit" disabled={submitting}>
            {submitting ? 'Preparing payment…' : 'Continue to payment'}
          </button>
          <p className="shipping-secure-note">Payment is processed in INR through Razorpay.</p>
        </form>
      </motion.section>
    </div>
  )
}
