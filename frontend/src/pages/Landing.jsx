import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { api, productImage } from '../api/client'


export default function Landing() {
  const [products, setProducts] = useState([])
  const [activeCategory, setActiveCategory] = useState('Furniture')



  useEffect(() => {
    api.getProducts().then(setProducts).catch(() => {})
  }, [])

//   useEffect(() => {
//   const id = setInterval(() => {
//     const el = trackRef.current
//     if (!el || pausedRef.current) return
//     const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
//     if (atEnd) el.scrollTo({ left: 0, behavior: 'smooth' })
//     else el.scrollBy({ left: 320, behavior: 'smooth' })
//   }, 2500)
//   return () => clearInterval(id)
// }, [])

  const categories = Array.from(new Set(products.map((p) => p.category))).slice(0, 5)
  const shownCategories = categories.length ? categories : ['Furniture', 'Lighting', 'Decor', 'Textiles', 'Storage']
  const categoryProducts = products.filter((p) => p.category === activeCategory)
  const featured = (categoryProducts.length ? categoryProducts : products).slice(0, 4)
  const brandCount = 50
  const loopProducts = products.length
  ? Array.from({ length: Math.ceil(8 / products.length) }, () => products).flat()
  : []

  return (
    <div>
      <Navbar overlay />

      <section className="hero">
        <img className="hero-bg" src="/images/hero.jpg" alt="" />
        <div className="hero-content">
          <h1>Natural Balance</h1>
          <p className="subtitle">{"{New collection '26}"}</p>
        </div>
        <div className="hero-note">
          <p>Soft forms, natural materials,<br />and the quiet of the space.</p>
          <Link to="/products" className="btn btn-primary">Explore</Link>
        </div>
      </section>

      <section className="section">
        <div className="container two-col">
          <div>
            <p className="eyebrow">Our approach</p>
            <p className="lead-text">
              Furniture, décor, and lighting for those who value style, quality, and a
              convenient shopping experience.
            </p>
            <p className="body-text">
              We bring together trusted products and contemporary interior design
              solutions in one space.
            </p>
            <div className="stat-block">
              <div className="stat-number">{products.length || 1209}</div>
              <div className="stat-label">products in the catalog</div>
            </div>
          </div>
          <div className="media-grid">
            <div className="media-tile"><img src={productImage(featured[0]?.image)} alt="" /></div>
            <div className="media-tile"><img src="/images/lifestyle-1.jpg" alt="" /></div>
            <div className="media-tile"><img src="/images/lifestyle-2.jpg" alt="" /></div>
            <div className="stat-block">
              <div className="stat-number">{brandCount}+</div>
              <div className="stat-label">brands and sellers</div>
            </div>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="category-list">
          {shownCategories.map((cat) => (
            <div
              key={cat}
              className={`category-row ${cat === activeCategory ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              <span className="category-name">
                {cat === activeCategory ? `{${cat}}` : cat}
              </span>
            </div>
          ))}
        </div>
        <div className="category-media">
          <img src={productImage(featured[0]?.image) || '/images/lifestyle-3.jpg'} alt="" />
        </div>
      </section>

<section className="section section-yellow">
  <div className="container">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
      <p className="lead-text" style={{ maxWidth: 380 }}>
        A balance of aesthetics, quality, and function in one catalog.
      </p>
      <Link to="/products" className="btn btn-outline">Explore Catalog</Link>
    </div>
  </div>

  <div className="carousel-viewport">
    <div
      className="carousel-track"
      style={{ animationDuration: `${loopProducts.length * 4}s` }}
    >
      {[0, 1].map((copy) => (
        <div className="carousel-half" key={copy}>
          {loopProducts.map((p, i) => (
            <div key={`${copy}-${i}`} className="product-card carousel-card">
              <div className="product-thumb"><img src={productImage(p.image)} alt={p.name} /></div>
              <div className="product-meta">
                {/* <span className="product-name">{p.name.toUpperCase()}</span> */}
                {/* <span className="product-price">${Number(p.price).toFixed(0)}</span> */}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
</section>
    </div>
  )
}
