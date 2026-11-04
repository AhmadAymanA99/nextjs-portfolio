import type { ISourceOptions } from '@tsparticles/engine'

export default function particlesConfig(theme: string | null): ISourceOptions {
  const isDark = theme === 'dark'

  return {
    // The app shell sits above this (z-index 1), so cards cover the particles
    fullScreen: { enable: true, zIndex: 0 },
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    interactivity: {
      // The canvas is behind the page, so listen for the pointer on the window
      detectsOn: 'window',
      events: {
        onClick: { enable: false, mode: 'push' },
        onHover: { enable: true, mode: 'repulse' },
        resize: true,
      },
    },
    particles: {
      color: { value: isDark ? '#58a6ff' : '#666' },
      links: {
        color: isDark ? '#58a6ff' : '#666',
        distance: 200,
        enable: true,
        opacity: 0.4,
        width: 1,
      },
      collisions: { enable: true, mode: 'bounce' },
      move: {
        direction: 'none' as const,
        enable: true,
        outModes: { default: 'bounce' as const },
        random: false,
        speed: 3.0,
        straight: false,
      },
      number: {
        density: { enable: true, width: 1000 },
        value: 80,
      },
      opacity: { value: 0.3 },
      shape: { type: 'circle' },
      size: { random: true, value: 3 },
    },
    detectRetina: true,
  }
}
