import { useEffect } from 'react'
import { useAnimation, motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export default function AnimatedBody({
  text,
  className = '',
  wordSpace = '',
  charSpace = '',
  delay = 0.1,
  tag = 'p',
  style = {},
}) {
  const ctrls = useAnimation()

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  useEffect(() => {
    if (inView) {
      ctrls.start('visible')
    } else {
      ctrls.start('hidden')
    }
  }, [ctrls, inView])

  const bodyAnimation = {
    hidden: {
      opacity: 0,
      y: '1em',
    },
    visible: {
      opacity: 1,
      y: '0em',
      transition: {
        delay: delay,
        duration: 0.9,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  }

  const MotionComponent = motion[tag] || motion.p

  return (
    <MotionComponent
      aria-label={text}
      className={className}
      ref={ref}
      initial="hidden"
      animate={ctrls}
      variants={bodyAnimation}
      style={style}
    >
      {text}
    </MotionComponent>
  )
}
