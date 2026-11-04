'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

// Each item observes its own visibility and is delayed by its position, rather
// than relying on variant propagation from the container (which left items
// stuck at opacity 0 when nested inside another whileInView element).
const STAGGER = 0.06
const MAX_DELAY = 0.5

export function StaggerContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={className}>{children}</div>
}

export function StaggerItem({
  children,
  className,
  index = 0,
}: {
  children: ReactNode
  className?: string
  index?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * STAGGER, MAX_DELAY),
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
