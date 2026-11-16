'use client'

import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react'

/**
 * Tilts toward the mouse pointer, with an optional glare. The angle is written
 * to CSS variables once per frame, so moving the mouse doesn't re-render React.
 * Styles live in global.css (.tilt); they switch off on touch screens and for
 * reduced motion.
 */
export default function TiltCard({
  children,
  className = '',
  maxTilt = 6,
  glare = false,
}: {
  children: ReactNode
  className?: string
  maxTilt?: number
  glare?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const set = (tiltX: number, tiltY: number, glareX: number, glareY: number) => {
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const style = ref.current?.style
      if (!style) return
      style.setProperty('--tilt-x', `${tiltX}deg`)
      style.setProperty('--tilt-y', `${tiltY}deg`)
      style.setProperty('--glare-x', `${glareX}%`)
      style.setProperty('--glare-y', `${glareY}%`)
    })
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    set((y - 0.5) * -maxTilt, (x - 0.5) * maxTilt, x * 100, y * 100)
  }

  return (
    <div
      ref={ref}
      className={`tilt ${glare ? 'tilt-glare' : ''} ${className}`}
      style={{ transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease' }}
      onPointerMove={onPointerMove}
      onPointerLeave={() => set(0, 0, 50, 50)}
    >
      {children}
    </div>
  )
}
