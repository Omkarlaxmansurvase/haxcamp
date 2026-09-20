import { motion } from 'framer-motion'

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
  return (
    <motion.div
      initial={{ opacity: 0, y, scale: scale < 1 ? scale : 1 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ amount: threshold, once: triggerOnce }}
      transition={{
        duration,
        delay,
        ease: [0.2, 0.65, 0.3, 0.9],
      }}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  )
}
