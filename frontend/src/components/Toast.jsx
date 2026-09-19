import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import lottie from 'lottie-web'
import addToCartAnimation from '../assets/add_to_cart.json'
import doneAnimation from '../assets/done.json'
import wrongAnimation from '../assets/wrong.json'

// which animation each toast type plays ('info' has none)
const ANIMATIONS = {
  success: addToCartAnimation, // item added to cart
  done: doneAnimation,         // something completed, e.g. product listed
  error: wrongAnimation,       // something failed
}

export default function Toast({
  message,
  type = 'info', // 'success' | 'done' | 'error' | 'info'
  actionLabel,
  actionTo,
  duration = 3500,
  onClose,
}) {
  const [leaving, setLeaving] = useState(false)
  const iconRef = useRef(null)
  const animationData = ANIMATIONS[type]

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

  // play the animation for this toast type once
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