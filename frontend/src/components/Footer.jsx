import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="logo footer-logo">Luma</Link>
            <p className="footer-tagline">
              Soft forms, natural materials, and the quiet of the space.
            </p>
          </div>

          <div className="footer-nav">
            <div className="footer-col">
              <span className="footer-col-title">Navigation</span>
              <div className="footer-links-row">
                <Link to="/products" className="footer-link">Catalog</Link>
                <a href="#about" className="footer-link">About</a>
                <a href="#delivery" className="footer-link">Delivery</a>
                <a href="#support" className="footer-link">Support</a>
              </div>
            </div>

            <div className="footer-col">
              <span className="footer-col-title">Studio</span>
              <div className="footer-links-row">
                <span className="footer-info">contact@luma.studio</span>
                <span className="footer-info">Panvel,Mumbai</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© {new Date().getFullYear()} Luma. All rights reserved.</p>
          <div className="footer-legal">
            <span className="footer-legal-link">Privacy Policy</span>
            <span className="footer-legal-link">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
