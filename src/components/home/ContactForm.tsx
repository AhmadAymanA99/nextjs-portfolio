'use client'

import { useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import Spinner from '@/components/ui/Spinner'
import { useTheme } from '@/lib/ThemeContext'
import styles from './ContactForm.module.css'
import { useI18n } from '@/i18n/I18nProvider'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

export default function ContactForm() {
  const { theme } = useTheme()
  const { dict, lang } = useI18n()
  const t = dict.contact
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [token, setToken] = useState('')
  // Load the Cloudflare check only once someone starts filling in the form
  const [armed, setArmed] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (SITE_KEY && !token) {
      setStatus(`error: ${t.completeCheck}`)
      return
    }
    setStatus('sending')

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      turnstileToken: token,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', subject: '', message: '' })
        setToken('')
      } else {
        const data = await res.json()
        setStatus(`error: ${data.error || t.genericError}`)
      }
    } catch {
      setStatus(`error: ${t.networkError}`)
    }
  }

  return (
    <section id="contact" className={styles.section}>
      <h2 className={styles.title}>{t.title}</h2>
      {status === 'success' ? (
        <div className={styles.success}>
          <div className={styles.successIcon}>✓</div>
          <p>{t.thanks}</p>
          <button onClick={() => setStatus('idle')} className={styles.sendAnother}>
            {t.sendAnother}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} onFocus={() => setArmed(true)} className={styles.form}>
          {status.startsWith('error') && (
            <div className={styles.error}>{status.replace('error: ', '')}</div>
          )}
          <div className={styles.row}>
            <input
              name="name"
              placeholder={t.name}
              value={form.name}
              onChange={handleChange}
              required
              className={styles.input}
              autoComplete="off"
              aria-label={t.name}
            />
            <input
              name="email"
              type="email"
              placeholder={t.email}
              value={form.email}
              onChange={handleChange}
              required
              className={styles.input}
              autoComplete="off"
              aria-label={t.email}
            />
          </div>
          <input
            name="subject"
            placeholder={t.subject}
            value={form.subject}
            onChange={handleChange}
            className={styles.input}
            autoComplete="off"
            aria-label={t.subjectLabel}
          />
          <textarea
            name="message"
            placeholder={t.message}
            value={form.message}
            onChange={handleChange}
            required
            rows={5}
            className={styles.textarea}
            aria-label={t.message}
          />
          {SITE_KEY && armed && (
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
            type="submit"
            disabled={status === 'sending' || (!!SITE_KEY && !token)}
            className={styles.button}
          >
            {status === 'sending' ? (
              <>
                <Spinner size={16} /> {dict.common.sending}
              </>
            ) : (
              t.send
            )}
          </button>
        </form>
      )}
    </section>
  )
}
