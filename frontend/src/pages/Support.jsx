import { useEffect, useRef } from 'react'
import lottie from 'lottie-web'
import Navbar from '../components/Navbar'
import animationData from '../assets/delivery.json'

const contacts = [
  { title: 'Email', detail: 'support@luma.example' },
  { title: 'Phone', detail: '+1 555 010 0199' },
  { title: 'Hours', detail: 'Mon–Sat · 9am–6pm' },
]

const topics = [
  { name: 'Returns', lines: ['30-day free returns', 'Pickup from your door', 'Refund in 5–7 days'] },
  { name: 'Assembly', lines: ['Most pieces ship assembled', 'Guides and tools included', 'White glove available'] },
  { name: 'Order tracking', lines: ['Tracking link by email', 'Live status on your order', 'Delivery slot by SMS'] },
  { name: 'Warranty', lines: ['5-year frame warranty', 'Covers defects and joins', 'Claim by email in minutes'] },
]

export default function Support() {
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

  return (
    <div className="delivery-page">
      <div className="delivery-lottie" ref={lottieRef} />
      <div className="delivery-veil" />
      <Navbar overlay />

      <div className="delivery-stage">
        <div className="delivery-panel">
          <div className="delivery-left">
            <div>
              <p className="eyebrow">Support</p>
              <h1 className="delivery-title">We are here to help.</h1>
              <p className="body-text">
                Questions about an order, a return or how to care for a piece?
                Our team replies within one working day.
              </p>
            </div>

            <div>
              {contacts.map((c) => (
                <div className="delivery-service" key={c.title}>
                  <h3>{c.title}</h3>
                  <span className="chip">{c.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="delivery-right">
            <p className="eyebrow">Common topics</p>
            <div className="delivery-regions">
              {topics.map((t) => (
                <div key={t.name}>
                  <h3>{t.name}</h3>
                  <ul>
                    {t.lines.map((l) => <li key={l}>{l}</li>)}
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