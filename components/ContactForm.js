import { useState } from 'react'
import styles from '../styles/ContactForm.module.css'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', subject: '', message: '' })
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
            />
          </div>
          <input
            name="subject"
            placeholder="Subject (optional)"
            value={form.subject}
            onChange={handleChange}
            className={styles.input}
            autoComplete="off"
          />
          <textarea
            name="message"
            placeholder="Your message"
            value={form.message}
            onChange={handleChange}
            required
            rows={5}
            className={styles.textarea}
          />
          <button type="submit" disabled={status === 'sending'} className={styles.button}>
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      )}
    </section>
  )
}
