'use client'

import { useEffect, useRef, useState } from 'react'
import type { Container } from '@tsparticles/engine'
import particlesConfig from '@/lib/particlesConfig'
import whenIdle from '@/lib/whenIdle'

/**
 * The animated background. The particle library is downloaded and started
 * only once the page is idle, so it never delays the first paint; it is off
 * for reduced motion.
 */
export default function ParticlesBackground({ theme }: { theme: string | null }) {
  const containerRef = useRef<Container | null>(null)
  const [reducedMotion, setReducedMotion] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (reducedMotion) return
    let disposed = false
    const cancelIdle = whenIdle(async () => {
      // Only the plugins the config uses (circles, moving, links, hover
      // repulse), not the "slim" bundle with ~25 more
      const [{ tsParticles }, basic, interactivity, repulse, links] = await Promise.all([
        import('@tsparticles/engine'),
        import('@tsparticles/basic'),
        import('@tsparticles/plugin-interactivity'),
        import('@tsparticles/interaction-external-repulse'),
        import('@tsparticles/interaction-particles-links'),
      ])
      await basic.loadBasic(tsParticles)
      await interactivity.loadInteractivityPlugin(tsParticles)
      await Promise.all([
        repulse.loadExternalRepulseInteraction(tsParticles),
        links.loadParticlesLinksInteraction(tsParticles),
      ])
      if (disposed) return
      const container = await tsParticles.load({
        id: 'tsparticles',
        options: particlesConfig(document.documentElement.dataset.theme ?? null),
      })
      if (disposed) container?.destroy()
      else containerRef.current = container ?? null
    })
    return () => {
      disposed = true
      cancelIdle()
      containerRef.current?.destroy()
      containerRef.current = null
    }
  }, [reducedMotion])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.options.load(particlesConfig(theme))
    container.refresh()
  }, [theme])

  return null
}
