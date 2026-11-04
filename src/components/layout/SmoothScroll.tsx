'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setDisabled(mq.matches)

    const handler = (e: MediaQueryListEvent) => {
      setDisabled(e.matches)
      if (e.matches) {
        const lenis = (window as any).__lenis
        if (lenis) {
          lenis.destroy()
          delete (window as any).__lenis
        }
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (disabled) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    })
    ;(window as any).__lenis = lenis

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      delete (window as any).__lenis
    }
  }, [disabled])

  return children
}
