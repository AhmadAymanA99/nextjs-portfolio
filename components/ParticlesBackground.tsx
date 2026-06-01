import { useEffect, useRef } from 'react'
import { tsParticles, type Container } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'
import particlesConfig from '../lib/particlesConfig'

export default function ParticlesBackground({ theme }: { theme: string | null }) {
  const containerRef = useRef<Container | null>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    ;(async () => {
      await loadSlim(tsParticles)
      const container = await tsParticles.load({
        id: 'tsparticles',
        options: particlesConfig(theme),
      })
      if (container) containerRef.current = container
    })()
    return () => {
      if (containerRef.current) {
        containerRef.current.destroy()
        containerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.options.load(particlesConfig(theme))
      containerRef.current.refresh()
    }
  }, [theme])

  return null
}
