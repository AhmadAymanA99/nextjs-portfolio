'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from '@/components/ui/Spinner'
import { TOKEN_KEY } from '@/components/admin/useAdminApi'
import { setTrackingDisabled } from '@/lib/tracking'
import styles from './page.module.css'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [shaking, setShaking] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    let res: Response
    try {
      res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
    } catch {
      setLoading(false)
      setError('Network error. Please try again.')
      return
    }

    setLoading(false)

    if (res.ok) {
      const { token } = await res.json()
      localStorage.setItem(TOKEN_KEY, token)
      // Don't count the owner's own visits from this browser
      setTrackingDisabled(true)
      setPassword('')
      router.push('/admin/analytics')
    } else {
      setError(
        res.status === 429
          ? 'Too many attempts. Wait a minute and try again.'
          : res.status === 401
            ? 'Invalid password'
            : 'Sign-in failed. Check the server configuration.',
      )
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
    }
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${shaking ? styles.shake : ''}`}>
        <h1 className={styles.title}>Admin Login</h1>
        <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner size={16} /> Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
