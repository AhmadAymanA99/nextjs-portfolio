'use client'

import { useEffect, type ReactNode } from 'react'
import type Lenis from 'lenis'
import whenIdle from '@/lib/whenIdle'

/**
 * Smooth wheel scrolling (Lenis) for mouse users. Skipped on touch screens,
 * where it has no effect, and for reduced motion; loaded once the page is idle.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mouse = window.matchMedia('(hover: hover) and (pointer: fine)')
    let lenis: Lenis | null = null
    let cancelIdle: (() => void) | null = null

    const stop = () => {
      cancelIdle?.()
      lenis?.destroy()
      lenis = null
      delete (window as any).__lenis
    }

    const start = () => {
      stop()
      if (motion.matches || !mouse.matches) return
      cancelIdle = whenIdle(async () => {
        const { default: LenisClass } = await import('lenis')
        lenis = new LenisClass({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          // Smooth-scroll in-page links such as the hero's #contact button
          anchors: true,
          // Lenis drives its own animation frames
          autoRaf: true,
        })
        ;(window as any).__lenis = lenis
      })
    }

    start()
    motion.addEventListener('change', start)
    mouse.addEventListener('change', start)
    return () => {
      motion.removeEventListener('change', start)
      mouse.removeEventListener('change', start)
      stop()
    }
  }, [])

  return children
}
