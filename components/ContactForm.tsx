import { useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import Spinner from './Spinner'
import { useTheme } from '../lib/ThemeContext'
import styles from '../styles/ContactForm.module.css'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

export default function ContactForm() {
  const { theme } = useTheme()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [token, setToken] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      setStatus('error: Please complete the security check')
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
        setStatus(`error: ${data.error || 'Something went wrong'}`)
      }
    } catch {
      setStatus('error: Network error')
    }
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Get in Touch</h2>
      {status === 'success' ? (
        <div className={styles.success}>
          <div className={styles.successIcon}>✓</div>
          <p>Thanks for reaching out! I&apos;ll get back to you soon.</p>
          <button onClick={() => setStatus('idle')} className={styles.sendAnother}>
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          {status.startsWith('error') && (
            <div className={styles.error}>{status.replace('error: ', '')}</div>
          )}
          <div className={styles.row}>
            <input
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
              className={styles.input}
              autoComplete="off"
              aria-label="Your name"
            />
            <input
              name="email"
              type="email"
              placeholder="Your email"
              value={form.email}
              onChange={handleChange}
              required
              className={styles.input}
              autoComplete="off"
              aria-label="Your email"
            />
          </div>
          <input
            name="subject"
            placeholder="Subject (optional)"
            value={form.subject}
            onChange={handleChange}
            className={styles.input}
            autoComplete="off"
            aria-label="Subject"
          />
          <textarea
            name="message"
            placeholder="Your message"
            value={form.message}
            onChange={handleChange}
            required
            rows={5}
            className={styles.textarea}
            aria-label="Your message"
          />
          {SITE_KEY && (
            <Turnstile
              siteKey={SITE_KEY}
              onSuccess={setToken}
              onError={() => setToken('')}
              options={{ size: 'normal', theme: theme === 'dark' ? 'dark' : 'light' }}
            />
          )}
          <button type="submit" disabled={status === 'sending' || !token} className={styles.button}>
            {status === 'sending' ? (
              <>
                <Spinner size={16} /> Sending...
              </>
            ) : (
              'Send Message'
            )}
          </button>
        </form>
      )}
    </section>
  )
}
