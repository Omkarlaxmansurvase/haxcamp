import { motion, useAnimation } from 'framer-motion'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

export default function AnimatedWords2({ title = '', style = '', className = '', delay = 0 }) {
  const ctrls = useAnimation()

  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  })

  useEffect(() => {
    if (inView) {
      ctrls.start('animate')
    } else {
      ctrls.start('initial')
    }
  }, [ctrls, inView])

  const wordAnimation2 = {
    initial: {
      opacity: 0,
      y: 80,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        ease: [0.2, 0.65, 0.3, 0.9],
        duration: 0.8,
      },
    },
  }

  return (
    <div aria-label={title} className={className}>
      <motion.span className={style} ref={ref}>
        {title.split(' ').map((word, index) => (
          <motion.div
            key={index}
            initial="initial"
            animate={ctrls}
            className="inline-flex items-center justify-center overflow-hidden pb-2 sm:pb-0"
            transition={{
              delayChildren: delay + index * 0.15,
              staggerChildren: 0.05,
            }}
            style={{ display: 'inline-flex', marginRight: '0.25em' }}
          >
            <motion.span
              className="inline-block overflow-hidden pt-1"
              variants={wordAnimation2}
            >
              {word}
            </motion.span>
          </motion.div>
        ))}
      </motion.span>
    </div>
  )
}
