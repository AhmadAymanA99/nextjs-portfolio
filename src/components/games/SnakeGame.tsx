'use client'

import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react'
import { FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowUp } from 'react-icons/fa6'
import { useI18n } from '@/i18n/I18nProvider'
import { format } from '@/i18n/config'
import { useTheme } from '@/lib/ThemeContext'
import { higher, useBestScore } from './useBestScore'
import styles from './Games.module.css'

const CELLS = 20
const PX = 20 // canvas pixels per cell
type Point = { x: number; y: number }
type Status = 'idle' | 'running' | 'paused' | 'over'

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
} as const
type Dir = keyof typeof DIRS

const KEYS: Record<string, Dir> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
}

const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y

const startSnake = (): Point[] => [
  { x: 6, y: 10 },
  { x: 5, y: 10 },
  { x: 4, y: 10 },
]

function placeFood(snake: Point[]): Point {
  for (;;) {
    const p = { x: Math.floor(Math.random() * CELLS), y: Math.floor(Math.random() * CELLS) }
    if (!snake.some((s) => same(s, p))) return p
  }
}

/** Classic snake on a canvas. The game state lives in refs; React only shows score and status. */
export default function SnakeGame() {
  const { dict } = useI18n()
  const { theme } = useTheme()
  const t = dict.games
  const canvas = useRef<HTMLCanvasElement>(null)
  const snake = useRef<Point[]>(startSnake())
  const food = useRef<Point>({ x: 14, y: 10 })
  const dir = useRef<Point>(DIRS.right)
  const queue = useRef<Point[]>([]) // turns pressed between ticks
  const touchStart = useRef<Point | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)
  const [best, submitBest] = useBestScore('snake', higher)

  const draw = useCallback(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx || !canvas.current) return
    const css = getComputedStyle(canvas.current)
    const color = (name: string) => css.getPropertyValue(name).trim()
    const size = CELLS * PX

    ctx.fillStyle = color('--bg-secondary')
    ctx.fillRect(0, 0, size, size)

    ctx.fillStyle = '#e5534b'
    ctx.beginPath()
    ctx.arc((food.current.x + 0.5) * PX, (food.current.y + 0.5) * PX, PX * 0.35, 0, Math.PI * 2)
    ctx.fill()

    snake.current.forEach((p, i) => {
      ctx.fillStyle = color('--primary-color')
      ctx.globalAlpha = i === 0 ? 1 : 0.75
      ctx.beginPath()
      ctx.roundRect(p.x * PX + 1, p.y * PX + 1, PX - 2, PX - 2, 4)
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }, [])

  // Redraw when the theme changes the colors
  useEffect(draw, [draw, theme])

  const start = () => {
    snake.current = startSnake()
    food.current = placeFood(snake.current)
    dir.current = DIRS.right
    queue.current = []
    scoreRef.current = 0
    setScore(0)
    setStatus('running')
    draw()
  }

  const turn = useCallback((d: Dir) => {
    const next = DIRS[d]
    const last = queue.current.at(-1) ?? dir.current
    // Ignore turning back into yourself or repeating the current direction
    if (next.x === -last.x && next.y === -last.y) return
    if (same(next, last)) return
    if (queue.current.length < 3) queue.current.push(next)
  }, [])

  // Game loop: a chain of timeouts that speeds up a little with every dot eaten
  useEffect(() => {
    if (status !== 'running') return
    const delay = () => Math.max(60, 130 - scoreRef.current * 3)
    const step = () => {
      dir.current = queue.current.shift() ?? dir.current
      const head = snake.current[0]
      const next = { x: head.x + dir.current.x, y: head.y + dir.current.y }
      const eats = same(next, food.current)
      // The tail moves away this tick unless the snake grows
      const body = eats ? snake.current : snake.current.slice(0, -1)
      const outside = next.x < 0 || next.y < 0 || next.x >= CELLS || next.y >= CELLS
      if (outside || body.some((p) => same(p, next))) {
        setStatus('over')
        submitBest(scoreRef.current)
        return
      }
      snake.current = [next, ...body]
      if (eats) {
        food.current = placeFood(snake.current)
        scoreRef.current += 1
        setScore(scoreRef.current)
      }
      draw()
      id = setTimeout(step, delay())
    }
    let id = setTimeout(step, delay())
    return () => clearTimeout(id)
  }, [status, draw, submitBest])

  // Keyboard: arrows/WASD steer while a game is on; Space pauses
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (status !== 'running' && status !== 'paused') return
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, [contenteditable]')) return
      if (e.key === ' ') {
        e.preventDefault()
        setStatus(status === 'running' ? 'paused' : 'running')
        return
      }
      const d = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key]
      if (!d || status !== 'running') return
      e.preventDefault()
      turn(d)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, turn])

  // Pause when the tab is hidden
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) setStatus((s) => (s === 'running' ? 'paused' : s))
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [])

  const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }
  const onTouchEnd = (e: TouchEvent) => {
    const from = touchStart.current
    touchStart.current = null
    if (!from || status !== 'running') return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - from.x
    const dy = touch.clientY - from.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return
    turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up')
  }

  const pad = (d: Dir, Icon: typeof FaArrowUp) => (
    <button
      className={`${styles.padBtn} ${styles[`pad_${d}`]}`}
      onClick={() => turn(d)}
      aria-label={t.snake[d]}
      disabled={status !== 'running'}
    >
      <Icon aria-hidden />
    </button>
  )

  return (
    <div className={styles.game}>
      <div className={styles.stats}>
        <span>{format(t.snake.score, { n: score })}</span>
        {best !== null && <span>{format(t.best, { value: best })}</span>}
      </div>

      {/* Directions are physical, so the board stays left-to-right in Arabic */}
      <div dir="ltr" className={styles.snakeBoard}>
        <canvas
          ref={canvas}
          width={CELLS * PX}
          height={CELLS * PX}
          className={styles.snakeCanvas}
          role="img"
          aria-label={t.snake.board}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        />
        {status !== 'running' && (
          <div className={styles.overlay}>
            {status === 'over' && (
              <p className={styles.overlayText}>{format(t.snake.over, { n: score })}</p>
            )}
            <button
              className={styles.action}
              onClick={status === 'paused' ? () => setStatus('running') : start}
            >
              {status === 'paused' ? t.snake.resume : status === 'over' ? t.playAgain : t.start}
            </button>
          </div>
        )}
      </div>

      <div dir="ltr" className={styles.controls}>
        <div className={styles.pad}>
          {pad('up', FaArrowUp)}
          {pad('left', FaArrowLeft)}
          {pad('right', FaArrowRight)}
          {pad('down', FaArrowDown)}
        </div>
        {status === 'running' && (
          <button className={styles.secondary} onClick={() => setStatus('paused')}>
            {t.snake.pause}
          </button>
        )}
      </div>

      <p className={styles.srOnly} aria-live="polite">
        {status === 'over' && format(t.snake.over, { n: score })}
      </p>
    </div>
  )
}
