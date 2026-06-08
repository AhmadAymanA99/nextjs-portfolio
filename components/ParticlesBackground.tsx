import { useEffect, useRef, useState } from 'react'
import { tsParticles, type Container } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'
import particlesConfig from '../lib/particlesConfig'

export default function ParticlesBackground({ theme }: { theme: string | null }) {
  const containerRef = useRef<Container | null>(null)
  const loadedRef = useRef(false)
  const [disabled, setDisabled] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setDisabled(mq.matches)
    const handler = (e: MediaQueryListEvent) => setDisabled(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (disabled || loadedRef.current) return
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
  }, [disabled])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.options.load(particlesConfig(theme))
      containerRef.current.refresh()
    }
  }, [theme])

  return null
}
