import { useEffect } from 'react'
import { useAnimation, motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export default function AnimatedTitle({
  text = '',
  className = '',
  wordSpace = '',
  charSpace = '',
  delay = 0,
  tag = 'h2',
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

  const wordAnimation = {
    hidden: {},
    visible: {},
  }

  const characterAnimation = {
    hidden: {
      opacity: 0,
      y: '0.25em',
    },
    visible: {
      opacity: 1,
      y: '0em',
      transition: {
        duration: 0.8,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  }

  const HeadingTag = tag

  return (
    <HeadingTag aria-label={text} className={className} ref={ref} style={style}>
      {text.split(' ').map((word, index) => {
        return (
          <motion.span
            aria-hidden="true"
            key={index}
            initial="hidden"
            animate={ctrls}
            variants={wordAnimation}
            transition={{
              delayChildren: delay + index * 0.12,
              staggerChildren: 0.03,
            }}
            className={`inline-block whitespace-nowrap ${wordSpace}`}
            style={{ display: 'inline-block', marginRight: '0.28em' }}
          >
            {word.split('').map((character, cIdx) => {
              return (
                <motion.span
                  aria-hidden="true"
                  key={cIdx}
                  variants={characterAnimation}
                  className={`inline-block ${charSpace}`}
                  style={{ display: 'inline-block' }}
                >
                  {character}
                </motion.span>
              )
            })}
          </motion.span>
        );
      })}
    </HeadingTag>
  )
}
