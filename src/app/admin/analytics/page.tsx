'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaExternalLinkAlt, FaSignOutAlt } from 'react-icons/fa'
import AnalyticsPanel from '@/components/admin/AnalyticsPanel'
import MessagesPanel, { type ContactMessage } from '@/components/admin/MessagesPanel'
import GuestbookPanel, { type GuestbookEntry } from '@/components/admin/GuestbookPanel'
import { TOKEN_KEY, useAdminApi } from '@/components/admin/useAdminApi'
import styles from '@/components/admin/Admin.module.css'

const TABS = ['analytics', 'messages', 'guestbook'] as const
type Tab = (typeof TABS)[number]

export default function AdminDashboard() {
  const router = useRouter()
  const api = useAdminApi()
  const [tab, setTab] = useState<Tab>('analytics')
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  // Keep the open tab in the URL hash so refresh/back keep you in place
  useEffect(() => {
    const fromHash = window.location.hash.slice(1) as Tab
    if (TABS.includes(fromHash)) setTab(fromHash)
  }, [])

  const selectTab = (t: Tab) => {
    setTab(t)
    history.replaceState(null, '', `#${t}`)
  }

  const loadMessages = useCallback(() => {
    api('/api/admin/messages')
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []))
      .catch((err) => setLoadError(err.message))
  }, [api])

  const loadGuestbook = useCallback(() => {
    api('/api/admin/guestbook')
      .then((r) => r.json())
      .then((d) => setEntries(d.entries || []))
      .catch((err) => setLoadError(err.message))
  }, [api])

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      router.replace('/admin/login')
      return
    }
    loadMessages()
    loadGuestbook()
  }, [router, loadMessages, loadGuestbook])

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    router.replace('/admin/login')
  }

  const unread = messages.filter((m) => !m.is_read).length
  const pending = entries.filter((e) => !e.approved).length
  const badges: Record<Tab, number> = { analytics: 0, messages: unread, guestbook: pending }

  return (
    <main id="main-content" className={styles.container}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <Link href="/" className={styles.button} aria-label="View site">
          <FaExternalLinkAlt aria-hidden /> <span className={styles.buttonText}>View site</span>
        </Link>
        <button
          className={`${styles.button} ${styles.buttonDanger}`}
          onClick={logout}
          aria-label="Log out"
        >
          <FaSignOutAlt aria-hidden /> <span className={styles.buttonText}>Log out</span>
        </button>
      </header>

      <nav className={styles.tabBar} role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => selectTab(t)}
          >
            {t[0].toUpperCase() + t.slice(1)}
            {badges[t] > 0 && <span className={styles.count}>{badges[t]}</span>}
          </button>
        ))}
      </nav>

      {loadError && <div className={styles.error}>{loadError}</div>}

      {tab === 'analytics' && <AnalyticsPanel />}
      {tab === 'messages' && (
        <MessagesPanel messages={messages} setMessages={setMessages} reload={loadMessages} />
      )}
      {tab === 'guestbook' && (
        <GuestbookPanel entries={entries} setEntries={setEntries} reload={loadGuestbook} />
      )}
    </main>
  )
}
