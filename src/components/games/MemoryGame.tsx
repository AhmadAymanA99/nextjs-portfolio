'use client'

import { useEffect, useRef, useState } from 'react'
import type { IconType } from 'react-icons'
import {
  SiExpo,
  SiGraphql,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from 'react-icons/si'
import { useI18n } from '@/i18n/I18nProvider'
import { format } from '@/i18n/config'
import { lower, useBestScore } from './useBestScore'
import styles from './Games.module.css'

const FACES: { name: string; Icon: IconType; color?: string }[] = [
  { name: 'React', Icon: SiReact, color: '#61DAFB' },
  { name: 'Next.js', Icon: SiNextdotjs },
  { name: 'TypeScript', Icon: SiTypescript, color: '#3178C6' },
  { name: 'Tailwind CSS', Icon: SiTailwindcss, color: '#06B6D4' },
  { name: 'Expo', Icon: SiExpo },
  { name: 'Node.js', Icon: SiNodedotjs, color: '#5FA04E' },
  { name: 'GraphQL', Icon: SiGraphql, color: '#E10098' },
  { name: 'PostgreSQL', Icon: SiPostgresql, color: '#4169E1' },
]

/** Each face twice, in a random order (Fisher–Yates). */
function newDeck() {
  const deck = [...FACES.keys(), ...FACES.keys()]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

/** Flip two cards at a time and match every pair. Fewest moves is the best. */
export default function MemoryGame() {
  const { dict } = useI18n()
  const t = dict.games
  // Unshuffled on the server; shuffled after hydration (all cards start face down)
  const [deck, setDeck] = useState<number[]>(() => [...FACES.keys(), ...FACES.keys()])
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [moves, setMoves] = useState(0)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [best, submitBest] = useBestScore('memory', lower)
  const flipBack = useRef<ReturnType<typeof setTimeout> | null>(null)

  const won = matched.size === deck.length

  const reset = () => {
    if (flipBack.current) clearTimeout(flipBack.current)
    setDeck(newDeck())
    setOpen([])
    setMatched(new Set())
    setMoves(0)
    setStartedAt(null)
    setSeconds(0)
  }

  useEffect(() => {
    setDeck(newDeck())
    return () => {
      if (flipBack.current) clearTimeout(flipBack.current)
    }
  }, [])

  // Clock runs from the first flip until the last pair is found
  useEffect(() => {
    if (startedAt === null || won) return
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - startedAt) / 1000)), 250)
    return () => clearInterval(id)
  }, [startedAt, won])

  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || matched.has(i)) return
    if (startedAt === null) setStartedAt(Date.now())
    const next = [...open, i]
    setOpen(next)
    if (next.length < 2) return

    const total = moves + 1
    setMoves(total)
    const [a, b] = next
    if (deck[a] === deck[b]) {
      const found = new Set(matched).add(a).add(b)
      setMatched(found)
      setOpen([])
      if (found.size === deck.length) {
        setSeconds(Math.floor((Date.now() - (startedAt ?? Date.now())) / 1000))
        submitBest(total)
      }
    } else {
      flipBack.current = setTimeout(() => setOpen([]), 800)
    }
  }

  return (
    <div className={styles.game}>
      <div className={styles.stats}>
        <span>{format(t.memory.moves, { n: moves })}</span>
        <span>{format(t.memory.time, { n: seconds })}</span>
        {best !== null && (
          <span>{format(t.best, { value: format(t.memory.bestValue, { n: best }) })}</span>
        )}
      </div>

      <div className={styles.memoryGrid}>
        {deck.map((face, i) => {
          const shown = open.includes(i) || matched.has(i)
          const { name, Icon, color } = FACES[face]
          return (
            <button
              key={i}
              className={`${styles.memoryCard} ${shown ? styles.memoryCardShown : ''} ${
                matched.has(i) ? styles.memoryCardMatched : ''
              }`}
              onClick={() => flip(i)}
              aria-label={shown ? name : format(t.memory.card, { n: i + 1 })}
              aria-disabled={matched.has(i)}
            >
              {shown && <Icon aria-hidden style={color ? { color } : undefined} />}
            </button>
          )
        })}
      </div>

      <p className={styles.status} aria-live="polite">
        {won && format(t.memory.won, { moves, seconds })}
      </p>
      {(won || moves > 0) && (
        <button className={styles.action} onClick={reset}>
          {t.playAgain}
        </button>
      )}
    </div>
  )
}
