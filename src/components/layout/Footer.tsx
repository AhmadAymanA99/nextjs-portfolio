'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import styles from './Footer.module.css'
import { FaLinkedin, FaFacebook, FaGithub, FaEnvelope } from 'react-icons/fa'
import { FaXTwitter, FaTelegram, FaWhatsapp, FaSun, FaMoon } from 'react-icons/fa6'
import { useTheme } from '@/lib/ThemeContext'
import { useI18n } from '@/i18n/I18nProvider'
import { format } from '@/i18n/config'

const Footer = () => {
  const { theme, toggleTheme } = useTheme()
  const { dict, href } = useI18n()
  const t = dict.footer
  const [clicks, setClicks] = useState(0)
  const [showAdmin, setShowAdmin] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const handleNameClick = () => {
    const next = clicks + 1
    setClicks(next)

    if (timer.current) clearTimeout(timer.current)

    if (next >= 5) {
      setShowAdmin(true)
      setClicks(0)
    } else {
      timer.current = setTimeout(() => {
        setClicks(0)
      }, 3000)
    }
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.contact}>
        <h3 onClick={handleNameClick}>{t.fullName}</h3>
        <p>{t.location}</p>
        <div className={styles.footerLinks}>
          <Link href={href('/guestbook')} className={styles.guestBtn}>
            {t.guestbook}
          </Link>
          <Link href={href('/faq')} className={styles.guestBtn}>
            {t.faq}
          </Link>
          <Link href={href('/games')} className={styles.guestBtn}>
            {t.games}
          </Link>
          {showAdmin && (
            <Link href="/admin/login" className={styles.adminLink}>
              Admin
            </Link>
          )}
        </div>
      </div>
      <div className={styles.links}>
        <a
          href="https://linkedin.com/in/ahmadaymana99"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <FaLinkedin />
        </a>
        <a
          href="https://github.com/AhmadAymanA99"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <FaGithub />
        </a>
        <a
          href="mailto:ahmadaymana99@gmail.com"
          aria-label="Email"
          data-track="message_link"
          data-track-target="email"
        >
          <FaEnvelope />
        </a>
        <a
          href="https://www.facebook.com/AhmadAyman.A99/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <FaFacebook />
        </a>
        <a
          href="https://wa.me/201023874473"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          data-track="message_link"
          data-track-target="whatsapp"
        >
          <FaWhatsapp />
        </a>
        <a
          href="https://t.me/A7medAyman99"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Telegram"
          data-track="message_link"
          data-track-target="telegram"
        >
          <FaTelegram />
        </a>
        <a
          href="https://x.com/A7medAyman99"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X Twitter"
        >
          <FaXTwitter />
        </a>
      </div>
      <div className={styles.objective}>
        <p>{t.objective}</p>
      </div>
      <button className={styles.themeToggle} onClick={toggleTheme}>
        {theme === 'dark' ? <FaSun /> : <FaMoon />}
        {theme === 'dark' ? t.lightMode : t.darkMode}
      </button>
      <p className={styles.copyright}>{format(t.rights, { year: new Date().getFullYear() })}</p>
    </footer>
  )
}

export default Footer
