import { productImage } from '../api/client'

export default function ProductCard({ product, onAddToCart, adding }) {
  return (
    <div className="product-card">
      <div className="product-thumb">
        <img src={productImage(product.image)} alt={product.name} loading="lazy" decoding="async" />
      </div>
      <div className="product-meta">
        <span className="product-name">{product.name}</span>
        <span className="product-price">${Number(product.price).toFixed(0)}</span>
      </div>
      {onAddToCart && (
        <div className="product-card-actions">
          <button
            className="btn btn-outline btn-sm"
            style={{ width: '100%' }}
            disabled={adding}
            onClick={() => onAddToCart(product)}
          >
            {adding ? 'Adding…' : 'Add to cart'}
          </button>
        </div>
      )}
    </div>
  )
}
