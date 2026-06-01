'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from '../../../components/Spinner'
import styles from '../../../styles/Login.module.css'
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

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setLoading(false)

    if (res.ok) {
      const { token } = await res.json()
      localStorage.setItem('admin_token', token)
      setPassword('')
      router.push('/admin/analytics')
    } else {
      setError('Invalid password')
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
            {loading ? <><Spinner size={16} /> Signing in...</> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
