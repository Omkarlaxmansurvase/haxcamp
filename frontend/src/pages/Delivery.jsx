import { useEffect, useRef } from 'react'
import lottie from 'lottie-web'
import Navbar from '../components/Navbar'
import animationData from '../assets/delivery.json'

const services = [
  { title: 'Standard', detail: '5–7 days · free over $500' },
  { title: 'Express', detail: '2–3 days · flat $25' },
  { title: 'White glove', detail: 'Room placement and assembly' },
]

const regions = [
  { name: 'Asia', countries: ['India', 'Singapore', 'UAE', 'Japan', 'South Korea', 'Malaysia'] },
  { name: 'Europe', countries: ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands'] },
  { name: 'North America', countries: ['United States', 'Canada', 'Mexico'] },
  { name: 'Oceania', countries: ['Australia', 'New Zealand'] },
]

export default function Delivery() {
  const lottieRef = useRef(null)

  useEffect(() => {
    const anim = lottie.loadAnimation({
      container: lottieRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData,
      rendererSettings: { preserveAspectRatio: 'xMidYMid slice' },
    })
    return () => anim.destroy()
  }, [])

  const total = regions.reduce((n, r) => n + r.countries.length, 0)

  return (
    <div className="delivery-page">
      <div className="delivery-lottie" ref={lottieRef} />
      <div className="delivery-veil" />
      <Navbar overlay />

      <div className="delivery-stage">
        <div className="delivery-panel">
          <div className="delivery-left">
            <div>
              <p className="eyebrow">Delivery</p>
              <h1 className="delivery-title">We deliver to {total} countries.</h1>
              <p className="body-text">
                Every piece is packed with care, tracked door to door, and delivered
                by our trusted carrier partners.
              </p>
            </div>

            <div>
              {services.map((s) => (
                <div className="delivery-service" key={s.title}>
                  <h3>{s.title}</h3>
                  <span className="chip">{s.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="delivery-right">
            <p className="eyebrow">Where we deliver</p>
            <div className="delivery-regions">
              {regions.map((r) => (
                <div key={r.name}>
                  <h3>{r.name}</h3>
                  <ul>
                    {r.countries.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}