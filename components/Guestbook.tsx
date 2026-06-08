'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Turnstile } from '@marsidev/react-turnstile'
import Spinner from './Spinner'
import { useTheme } from '../lib/ThemeContext'
import styles from '../styles/Guestbook.module.css'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

interface Entry {
  id: number
  name: string
  message: string
  website: string
  created_at: string
}

export default function Guestbook({ initialEntries }: { initialEntries: Entry[] }) {
  const { theme } = useTheme()
  const [entries, setEntries] = useState<Entry[]>(initialEntries)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState('')

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Please complete the security check')
      return
    }

    const trimmedName = name.trim()
    const trimmedMessage = message.trim()

    if (!trimmedName || !trimmedMessage) {
      setError('Name and message are required')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          message: trimmedMessage,
          website: website.trim(),
          turnstileToken: token,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit')
        setLoading(false)
        return
      }

      setName('')
      setMessage('')
      setWebsite('')
      setToken('')
      setSuccess(true)
      setLoading(false)
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Guestbook</h1>
      <p className={styles.subtitle}>Leave a message. Say hello. Share your thoughts.</p>

      {success && (
        <div className={styles.success}>Thanks! Your message will appear after approval.</div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          placeholder="Your name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
          disabled={loading}
        />
        <input
          className={styles.input}
          placeholder="Website (optional)"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          maxLength={500}
          disabled={loading}
        />
        <textarea
          className={styles.textarea}
          placeholder="Your message *"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          required
          disabled={loading}
        />
        {error && <p className={styles.error}>{error}</p>}
        {SITE_KEY && (
          <Turnstile
            siteKey={SITE_KEY}
            onSuccess={setToken}
            onError={() => setToken('')}
            options={{ size: 'normal', theme: theme === 'dark' ? 'dark' : 'light' }}
          />
        )}
        <button className={styles.submitBtn} type="submit" disabled={loading || !token}>
          {loading ? (
            <>
              <Spinner size={16} /> Submitting...
            </>
          ) : (
            'Sign the Guestbook'
          )}
        </button>
      </form>

      <div>
        {entries.length > 0 ? (
          entries.map((entry) => (
            <div key={entry.id} className={styles.entry}>
              <div className={styles.entryHeader}>
                <span className={styles.entryName}>{entry.name}</span>
                <span className={styles.entryDate}>
                  {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className={styles.entryMessage}>{entry.message}</div>
              {entry.website && (
                <a
                  href={entry.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.entryWebsite}
                >
                  {entry.website}
                </a>
              )}
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>No messages yet. Be the first!</div>
        )}
      </div>
    </div>
  )
}
