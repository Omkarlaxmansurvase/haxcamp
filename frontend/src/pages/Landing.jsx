import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { api, productImage } from '../api/client'
import AnimatedTitle from '../components/animations/AnimatedTitle'
import AnimatedBody from '../components/animations/AnimatedBody'
import ScrollReveal from '../components/animations/ScrollReveal'

export default function Landing() {
  const [products, setProducts] = useState([])
  const [activeCategory, setActiveCategory] = useState('Furniture')

  useEffect(() => {
    api.getProducts().then(setProducts).catch(() => {})
  }, [])

  const categories = Array.from(new Set(products.map((p) => p.category))).slice(0, 5)
  const shownCategories = categories.length ? categories : ['Furniture', 'Lighting', 'Decor', 'Textiles', 'Storage']
  const categoryProducts = products.filter((p) => p.category === activeCategory)
  const featured = (categoryProducts.length ? categoryProducts : products).slice(0, 4)
  const brandCount = 50

  // Cap and loop smoothly with GPU acceleration to prevent lag
  const sourceProducts = products.length ? products.slice(0, 8) : []
  const loopProducts = sourceProducts.length
    ? Array.from({ length: Math.ceil(8 / sourceProducts.length) }, () => sourceProducts).flat()
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
            <ScrollReveal delay={0.1} y={15}>
              <p className="eyebrow">Our approach</p>
            </ScrollReveal>
            <AnimatedTitle
              text="Furniture, décor, and lighting for those who value style, quality, and a convenient shopping experience."
              className="lead-text"
              tag="p"
              delay={0.2}
            />
            <AnimatedBody
              text="We bring together trusted products and contemporary interior design solutions in one space."
              className="body-text"
              delay={0.35}
            />
            <ScrollReveal className="stat-block" delay={0.45} y={20}>
              <div className="stat-number">{products.length || 1209}</div>
              <div className="stat-label">products in the catalog</div>
            </ScrollReveal>
          </div>
          <div className="media-grid">
            <ScrollReveal className="media-tile" delay={0.1} y={25}>
              <img src={productImage(featured[0]?.image)} alt="" loading="lazy" decoding="async" />
            </ScrollReveal>
            <ScrollReveal className="media-tile" delay={0.2} y={25}>
              <img src="/images/lifestyle-1.jpg" alt="" loading="lazy" decoding="async" />
            </ScrollReveal>
            <ScrollReveal className="media-tile" delay={0.3} y={25}>
              <img src="/images/lifestyle-2.jpg" alt="" loading="lazy" decoding="async" />
            </ScrollReveal>
            <ScrollReveal className="stat-block" delay={0.4} y={25}>
              <div className="stat-number">{brandCount}+</div>
              <div className="stat-label">brands and sellers</div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="category-list">
          {shownCategories.map((cat, idx) => (
            <ScrollReveal key={cat} delay={idx * 0.08} y={15}>
              <div
                className={`category-row ${cat === activeCategory ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                <span className="category-name">
                  {cat === activeCategory ? `{${cat}}` : cat}
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal className="category-media" delay={0.2} scale={0.97}>
          <img
            key={activeCategory}
            src={productImage(featured[0]?.image) || '/images/lifestyle-3.jpg'}
            alt={activeCategory}
            loading="lazy"
            decoding="async"
          />
        </ScrollReveal>
      </section>

      <section className="section section-yellow">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
            <AnimatedTitle
              text="A balance of aesthetics, quality, and function in one catalog."
              className="lead-text"
              tag="p"
              style={{ maxWidth: 380 }}
              delay={0.1}
            />
            <ScrollReveal delay={0.25} y={15}>
              <Link to="/products" className="btn btn-outline">Explore Catalog</Link>
            </ScrollReveal>
          </div>
        </div>

        <div className="carousel-viewport">
          <div
            className="carousel-track"
            style={{ animationDuration: `${Math.max(loopProducts.length * 3.5, 20)}s` }}
          >
            {[0, 1].map((copy) => (
              <div className="carousel-half" key={copy}>
                {loopProducts.map((p, i) => (
                  <div key={`${copy}-${i}`} className="product-card carousel-card">
                    <div className="product-thumb">
                      <img src={productImage(p.image)} alt={p.name} loading="lazy" decoding="async" />
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
