import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import lottie from 'lottie-web'
import addToCartAnimation from '../assets/add_to_cart.json'

export default function Toast({
  message,
  type = 'info', // 'success' | 'error' | 'info'
  actionLabel,
  actionTo,
  duration = 3500,
  onClose,
}) {
  const [leaving, setLeaving] = useState(false)
  const iconRef = useRef(null)

  // auto-dismiss: fade out shortly before closing
  useEffect(() => {
    const hide = setTimeout(() => setLeaving(true), duration - 300)
    const done = setTimeout(onClose, duration)
    return () => {
      clearTimeout(hide)
      clearTimeout(done)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration])

  // play the add-to-cart animation once on success
  useEffect(() => {
    if (type !== 'success') return
    const anim = lottie.loadAnimation({
      container: iconRef.current,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      animationData: addToCartAnimation,
    })
    return () => anim.destroy()
  }, [type])

  function handleClose() {
    setLeaving(true)
    setTimeout(onClose, 300)
  }

  return (
    <div
      className={`toast toast-${type} ${leaving ? 'leaving' : ''}`}
      role="status"
      aria-live="polite"
    >
      {type === 'success' && <div className="toast-icon" ref={iconRef} />}
      <span className="toast-msg">{message}</span>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="toast-link">{actionLabel}</Link>
      )}
      <button className="toast-close" onClick={handleClose} aria-label="Close">&times;</button>
      <span className="toast-bar" style={{ animationDuration: `${duration}ms` }} />
    </div>
  )
}