'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

type Direction = 'up' | 'down' | 'left' | 'right'

interface RevealProps {
  children: ReactNode
  direction?: Direction
  delay?: number
  duration?: number
  distance?: number
  className?: string
  style?: React.CSSProperties
  once?: boolean
}

export default function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  distance = 24,
  className,
  style,
  once = true,
}: RevealProps) {
  const offset = { x: 0, y: 0 }
  if (direction === 'up') offset.y = distance
  else if (direction === 'down') offset.y = -distance
  else if (direction === 'left') offset.x = distance
  else if (direction === 'right') offset.x = -distance

  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '-40px' }}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}
