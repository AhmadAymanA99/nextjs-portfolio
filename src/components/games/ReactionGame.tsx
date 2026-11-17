'use client'

import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/i18n/I18nProvider'
import { format } from '@/i18n/config'
import { lower, useBestScore } from './useBestScore'
import styles from './Games.module.css'

type Phase = 'idle' | 'wait' | 'go' | 'early' | 'result'

/** Press as soon as the panel turns green. Lowest time is the best. */
export default function ReactionGame() {
  const { dict } = useI18n()
  const t = dict.games.reaction
  const [phase, setPhase] = useState<Phase>('idle')
  const [ms, setMs] = useState(0)
  const [best, submitBest] = useBestScore('reaction', lower)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const goAt = useRef(0)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const press = () => {
    if (phase === 'wait') {
      if (timer.current) clearTimeout(timer.current)
      setPhase('early')
    } else if (phase === 'go') {
      const time = Math.round(performance.now() - goAt.current)
      setMs(time)
      setPhase('result')
      submitBest(time)
    } else {
      setPhase('wait')
      // Random delay so the moment can't be guessed
      timer.current = setTimeout(
        () => {
          goAt.current = performance.now()
          setPhase('go')
        },
        1500 + Math.random() * 2500,
      )
    }
  }

  const label = {
    idle: t.idle,
    wait: t.wait,
    go: t.go,
    early: t.early,
    result: format(t.result, { ms }),
  }[phase]

  return (
    <div className={styles.game}>
      <div className={styles.stats}>
        {best !== null && (
          <span>{format(dict.games.best, { value: format(t.bestValue, { n: best }) })}</span>
        )}
      </div>
      {/* pointerdown fires before click, so touch and mouse times are fair */}
      <button
        className={`${styles.reaction} ${styles[`reaction_${phase}`]}`}
        onPointerDown={(e) => {
          if (e.button === 0) press()
        }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            if (!e.repeat) press()
          }
        }}
      >
        <span className={styles.reactionMain} aria-live="assertive">
          {label}
        </span>
        {phase === 'result' && <span className={styles.reactionSub}>{t.again}</span>}
      </button>
    </div>
  )
}
