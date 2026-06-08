'use client'

import { useRef, useState, useEffect, type ReactNode, type MouseEvent } from 'react'
import { motion } from 'framer-motion'

interface TiltCardProps {
  children: ReactNode
  className?: string
  maxTilt?: number
  perspective?: number
  glare?: boolean
}

export default function TiltCard({
  children,
  className,
  maxTilt = 6,
  perspective = 1000,
  glare = false,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setTilt({ x: (y - 0.5) * -maxTilt, y: (x - 0.5) * maxTilt })
    if (glare) setGlarePos({ x: x * 100, y: y * 100 })
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 })
    if (glare) setGlarePos({ x: 50, y: 50 })
  }

  const tiltProps = reducedMotion
    ? {}
    : {
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
        style: { perspective, position: 'relative' } as const,
        animate: { rotateX: tilt.x, rotateY: tilt.y },
      }

  return (
    <motion.div
      ref={ref}
      className={className}
      {...tiltProps}
      transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.5 }}
    >
      {children}
      {glare && !reducedMotion && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.08), transparent 60%)`,
            transition: 'background 0.1s ease',
          }}
        />
      )}
    </motion.div>
  )
}
