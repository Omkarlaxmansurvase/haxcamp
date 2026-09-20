import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import lottie from 'lottie-web'
import addToCartAnimation from '../assets/add_to_cart.json'
import doneAnimation from '../assets/done.json'
import wrongAnimation from '../assets/wrong.json'

const ANIMATIONS = {
  success: addToCartAnimation,
  done: doneAnimation,
  error: wrongAnimation,
}

export default function Toast({
  message,
  type = 'info',
  actionLabel,
  actionTo,
  duration = 3500,
  onClose,
}) {
  const [leaving, setLeaving] = useState(false)
  const iconRef = useRef(null)
  const animationData = ANIMATIONS[type]

  useEffect(() => {
    const hide = setTimeout(() => setLeaving(true), duration - 300)
    const done = setTimeout(onClose, duration)
    return () => {
      clearTimeout(hide)
      clearTimeout(done)
    }
  }, [duration, onClose])

  useEffect(() => {
    if (!animationData) return
    const anim = lottie.loadAnimation({
      container: iconRef.current,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      animationData,
    })
    return () => anim.destroy()
  }, [animationData])

  function handleClose() {
    setLeaving(true)
    setTimeout(onClose, 300)
  }

  return createPortal(
    <div
      className={`toast toast-${type} ${leaving ? 'leaving' : ''}`}
      role="status"
      aria-live="polite"
    >
      {animationData && <div className="toast-icon" ref={iconRef} />}
      <span className="toast-msg">{message}</span>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="toast-link">{actionLabel}</Link>
      )}
      <button className="toast-close" onClick={handleClose} aria-label="Close">&times;</button>
      <span className="toast-bar" style={{ animationDuration: `${duration}ms` }} />
    </div>,
    document.body
  )
}