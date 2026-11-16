import type { CSSProperties, ReactNode } from 'react'

/**
 * Entrance animation, in CSS only (see "Entrance animations" in global.css).
 * - `on="load"`: rises in as the page paints, for content above the fold.
 *   Never starts invisible, so it does not delay Largest Contentful Paint.
 * - `on="scroll"`: fades in as it scrolls into view.
 */
export default function Reveal({
  children,
  on = 'scroll',
  delay = 0,
  className = '',
  style,
}: {
  children: ReactNode
  on?: 'load' | 'scroll'
  /** Seconds; load animations only */
  delay?: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      className={`${on === 'load' ? 'reveal-load' : 'reveal-scroll'} ${className}`}
      style={delay ? ({ ...style, '--reveal-delay': `${delay}s` } as CSSProperties) : style}
    >
      {children}
    </div>
  )
}
