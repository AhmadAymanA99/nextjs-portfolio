'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useI18n } from '@/i18n/I18nProvider'
import MemoryGame from './MemoryGame'
import ReactionGame from './ReactionGame'
import SnakeGame from './SnakeGame'
import styles from './Games.module.css'

const GAMES = ['memory', 'snake', 'reaction'] as const
type Game = (typeof GAMES)[number]

const isGame = (value: string): value is Game => (GAMES as readonly string[]).includes(value)

/** The games page: a tab per game. The open game is kept in the URL hash (#snake). */
export default function GamesHub() {
  const { dict } = useI18n()
  const t = dict.games
  const [active, setActive] = useState<Game>('memory')
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const fromHash = window.location.hash.slice(1)
    // Read after hydration so the server and first client render match
    if (isGame(fromHash)) setActive(fromHash)
  }, [])

  const select = (game: Game) => {
    setActive(game)
    history.replaceState(null, '', `#${game}`)
  }

  // Arrow keys move between tabs (WAI-ARIA tabs pattern); the row follows the
  // reading direction, so in Arabic the right arrow goes back
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl'
    const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key]
    let next: number | undefined
    if (step) next = (GAMES.indexOf(active) + step + GAMES.length) % GAMES.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = GAMES.length - 1
    if (next === undefined) return
    e.preventDefault()
    select(GAMES[next])
    tabs.current[next]?.focus()
  }

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>{t.title}</h1>
      <p className={styles.subtitle}>{t.subtitle}</p>

      <div role="tablist" aria-label={t.tabsLabel} className={styles.tabs} onKeyDown={onKeyDown}>
        {GAMES.map((game, i) => (
          <button
            key={game}
            ref={(el) => {
              tabs.current[i] = el
            }}
            role="tab"
            id={`tab-${game}`}
            aria-selected={active === game}
            aria-controls={`panel-${game}`}
            tabIndex={active === game ? 0 : -1}
            className={`${styles.tab} ${active === game ? styles.tabActive : ''}`}
            onClick={() => select(game)}
          >
            {t[game].name}
          </button>
        ))}
      </div>

      {/* Only the open game is mounted, so the others stop their timers */}
      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        className={styles.panel}
      >
        <p className={styles.intro}>{t[active].intro}</p>
        {active === 'memory' && <MemoryGame />}
        {active === 'snake' && <SnakeGame />}
        {active === 'reaction' && <ReactionGame />}
      </div>
    </section>
  )
}
