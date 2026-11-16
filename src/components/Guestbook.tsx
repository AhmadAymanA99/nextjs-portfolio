'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Turnstile } from '@marsidev/react-turnstile'
import Spinner from '@/components/ui/Spinner'
import { useTheme } from '@/lib/ThemeContext'
import styles from './Guestbook.module.css'
import { useI18n } from '@/i18n/I18nProvider'

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
  const { dict, lang } = useI18n()
  const t = dict.guestbook
  const [entries, setEntries] = useState<Entry[]>(initialEntries)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState('')
  const [company, setCompany] = useState('')

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (SITE_KEY && !token) {
      setError(dict.contact.completeCheck)
      return
    }

    const trimmedName = name.trim()
    const trimmedMessage = message.trim()

    if (!trimmedName || !trimmedMessage) {
      setError(t.required)
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
          company,
          turnstileToken: token,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t.failed)
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
      setError(t.networkError)
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t.title}</h1>
      <p className={styles.subtitle}>{t.subtitle}</p>

      {success && <div className={styles.success}>{t.success}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          placeholder={t.name}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
          disabled={loading}
          aria-label={t.nameLabel}
        />
        <input
          className={styles.input}
          placeholder={t.website}
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          maxLength={500}
          disabled={loading}
          aria-label={t.websiteLabel}
        />
        {/* Honeypot: hidden from people, filled in by bots */}
        <input
          type="text"
          name="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{
            position: 'absolute',
            insetInlineStart: '-9999px',
            width: 1,
            height: 1,
            opacity: 0,
          }}
        />
        <textarea
          className={styles.textarea}
          placeholder={t.message}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          required
          disabled={loading}
          aria-label={t.messageLabel}
        />
        {error && <p className={styles.error}>{error}</p>}
        {SITE_KEY && (
          <Turnstile
            siteKey={SITE_KEY}
            onSuccess={setToken}
            onError={() => setToken('')}
            options={{
              size: 'flexible',
              theme: theme === 'dark' ? 'dark' : 'light',
              language: lang,
            }}
          />
        )}
        <button
          className={styles.submitBtn}
          type="submit"
          disabled={loading || (!!SITE_KEY && !token)}
        >
          {loading ? (
            <>
              <Spinner size={16} /> {t.submitting}
            </>
          ) : (
            t.submit
          )}
        </button>
      </form>

      <div>
        {entries.length > 0 ? (
          entries.map((entry) => (
            <div key={entry.id} className={styles.entry}>
              <div className={styles.entryHeader}>
                <span className={styles.entryName} dir="auto">
                  {entry.name}
                </span>
                <span className={styles.entryDate}>
                  {formatDistanceToNow(new Date(entry.created_at), {
                    addSuffix: true,
                    locale: lang === 'ar' ? ar : undefined,
                  })}
                </span>
              </div>
              <div className={styles.entryMessage} dir="auto">
                {entry.message}
              </div>
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
          <div className={styles.emptyState}>{t.empty}</div>
        )}
      </div>
    </div>
  )
}
