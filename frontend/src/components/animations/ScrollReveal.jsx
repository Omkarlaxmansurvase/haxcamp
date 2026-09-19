import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  duration = 0.7,
  y = 30,
  scale = 1,
  threshold = 0.1,
  triggerOnce = true,
  style = {},
  ...props
}) {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, scale: scale < 1 ? scale : 1 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y, scale: scale < 1 ? scale : 1 }}
      transition={{
        duration,
        delay,
        ease: [0.2, 0.65, 0.3, 0.9],
      }}
      className={className}
      style={{ willChange: 'transform, opacity', ...style }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
