'use client'

import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react'

/** Furthest any edge may move toward or away from the viewer, in px */
const MAX_EDGE_SHIFT = 7
/** How far the card rises while hovered, in px */
const LIFT = 4
/** Time for the motion to cover ~63% of the way to the pointer, in ms */
const SMOOTHING = 90

type Pose = { x: number; y: number; gx: number; gy: number; lift: number }
const REST: Pose = { x: 0, y: 0, gx: 50, gy: 50, lift: 0 }

/** Largest angle (deg) that keeps an edge `size / 2` from the center within MAX_EDGE_SHIFT */
const angleCap = (size: number) =>
  (Math.asin(Math.min(1, MAX_EDGE_SHIFT / Math.max(size / 2, 1))) * 180) / Math.PI

/**
 * Tilts toward the mouse pointer, with an optional glare. The card eases
 * toward the pointer in a requestAnimationFrame loop, writing CSS variables
 * (no React re-renders), so it glides instead of jumping. The angle is capped
 * by the card's size, so a wide card doesn't swing its edges far left and
 * right. Styles live in global.css (.tilt); they switch off on touch screens
 * and for reduced motion.
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
  const last = useRef(0)
  const target = useRef<Pose>({ ...REST })
  const pose = useRef<Pose>({ ...REST })

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const tick = (now: number) => {
    const style = ref.current?.style
    if (!style) return
    const dt = Math.min(now - (last.current || now), 64)
    last.current = now
    const k = 1 - Math.exp(-dt / SMOOTHING)
    const p = pose.current
    const t = target.current
    let moving = false
    for (const key of Object.keys(p) as (keyof Pose)[]) {
      p[key] += (t[key] - p[key]) * k
      if (Math.abs(t[key] - p[key]) > 0.01) moving = true
      else p[key] = t[key]
    }
    style.setProperty('--tilt-x', `${p.x.toFixed(3)}deg`)
    style.setProperty('--tilt-y', `${p.y.toFixed(3)}deg`)
    style.setProperty('--tilt-lift', `${p.lift.toFixed(2)}px`)
    style.setProperty('--glare-x', `${p.gx.toFixed(1)}%`)
    style.setProperty('--glare-y', `${p.gy.toFixed(1)}%`)
    if (moving) frame.current = requestAnimationFrame(tick)
    else {
      frame.current = 0
      last.current = 0
    }
  }

  const animate = () => {
    if (!frame.current) frame.current = requestAnimationFrame(tick)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !ref.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    // rotateY swings the left/right edges, so it is capped by the width;
    // rotateX swings top/bottom, capped by the height
    const capY = Math.min(maxTilt, angleCap(rect.width))
    const capX = Math.min(maxTilt, angleCap(rect.height))
    target.current = {
      x: (y - 0.5) * -2 * capX,
      y: (x - 0.5) * 2 * capY,
      gx: x * 100,
      gy: y * 100,
      lift: -LIFT,
    }
    animate()
  }

  const onPointerLeave = () => {
    target.current = { ...REST }
    animate()
  }

  return (
    <div
      ref={ref}
      className={`tilt ${glare ? 'tilt-glare' : ''} ${className}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </div>
  )
}
