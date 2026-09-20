import { useEffect, useRef } from 'react'
import lottie from 'lottie-web'
import Navbar from '../components/Navbar'
import animationData from '../assets/delivery.json'

const FOUNDED_YEAR = '2024'

const facts = [
  { title: 'Founded', detail: FOUNDED_YEAR },
  { title: 'Founder', detail: 'Omkar' },
  { title: 'Categories', detail: '5 collections' },
]

const values = [
  {
    name: 'Our story',
    lines: [`Started in ${FOUNDED_YEAR} by Omkar`, 'One idea: calm, natural homes', 'First collection of ten pieces'],
  },
  {
    name: 'Materials',
    lines: ['Solid wood and natural fibers', 'Honest, lasting finishes', 'Made to last for years'],
  },
  {
    name: 'Craft',
    lines: ['Trusted makers and studios', 'Every piece quality checked', 'Details before decoration'],
  },
  {
    name: 'Promise',
    lines: ['Fair prices, no clutter', 'Free returns for 30 days', 'Support that replies'],
  },
]

export default function About() {
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
              <p className="eyebrow">About</p>
              <h1 className="delivery-title">Founded by Omkar in {FOUNDED_YEAR}.</h1>
              <p className="body-text">
                Luma began with a simple belief: a home should feel calm. We bring
                together furniture, lighting and décor made from natural materials,
                for people who value style, quality and a convenient way to shop.
              </p>
            </div>

            <div>
              {facts.map((f) => (
                <div className="delivery-service" key={f.title}>
                  <h3>{f.title}</h3>
                  <span className="chip">{f.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="delivery-right">
            <p className="eyebrow">What we stand for</p>
            <div className="delivery-regions">
              {values.map((v) => (
                <div key={v.name}>
                  <h3>{v.name}</h3>
                  <ul>
                    {v.lines.map((l) => <li key={l}>{l}</li>)}
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