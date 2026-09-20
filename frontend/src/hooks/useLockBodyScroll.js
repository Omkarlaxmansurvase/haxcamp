import { useEffect } from 'react'

// Locks page scroll while a modal is mounted, and restores it on close.
export default function useLockBodyScroll() {
  useEffect(() => {
    const { overflow, paddingRight } = document.body.style
    // hiding the scrollbar would shift the page sideways, so pad by its width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [])
}