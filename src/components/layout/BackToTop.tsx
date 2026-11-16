'use client'

import { useState, useEffect } from 'react'
import { FaArrowUp } from 'react-icons/fa6'
import styles from './BackToTop.module.css'
import { useI18n } from '@/i18n/I18nProvider'

export default function BackToTop() {
  const { dict } = useI18n()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      className={`${styles.button} ${visible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label={dict.common.backToTop}
    >
      <FaArrowUp />
    </button>
  )
}
