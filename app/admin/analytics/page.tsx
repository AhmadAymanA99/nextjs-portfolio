'use client'

import { useState, useEffect } from 'react'
import type React from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { DashboardSkeleton } from '../../../components/Skeleton'
import styles from '../../../styles/Admin.module.css'

interface PageView {
  path?: string
  country?: string
  device_type?: string
  browser?: string
  os?: string
  ip?: string
  referrer?: string
  timestamp?: string
}

interface ContactMessage {
  id?: number
  name?: string
  email?: string
  subject?: string
  message?: string
  created_at?: string
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [pageViews, setPageViews] = useState<PageView[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [tab, setTab] = useState('analytics')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState<number | null>(null)
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null)
  const router = useRouter()

  const fetchAnalytics = (filterDays: number | null) => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.replace('/admin/login')
      return
    }

    setIsLoading(true)
    setError(null)

    let url = '/api/admin/analytics'
    if (filterDays) url += `?days=${filterDays}`

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem('admin_token')
          router.replace('/admin/login')
          throw new Error('Session expired')
        }
        if (!res.ok) throw new Error('Failed to fetch analytics')
        return res.json()
      })
      .then((data) => {
        setStats(data.stats)
        setPageViews(data.recentViews)
        setRefreshedAt(new Date().toLocaleTimeString())
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setIsLoading(false)
      })
  }

  const fetchMessages = () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.replace('/admin/login')
      return
    }

    fetch('/api/admin/messages', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem('admin_token')
          router.replace('/admin/login')
          throw new Error('Session expired')
        }
        if (!res.ok) throw new Error('Failed to fetch messages')
        return res.json()
      })
      .then((data) => {
        setMessages(data.messages || [])
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchAnalytics(days)
    fetchMessages()
  }, [])

  useEffect(() => {
    fetchAnalytics(days)
  }, [days])

  const handleFilter = (d: number | null) => {
    setDays(d)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.replace('/admin/login')
  }

  if (isLoading) {
    return (
      <div className={styles.adminContainer}>
        <DashboardSkeleton />
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.error}>{error}</div>
      </div>
    )
  }

  const timeAgo = (ts: string) => {
    try {
      return formatDistanceToNow(new Date(ts), { addSuffix: true })
    } catch {
      return '\u2014'
    }
  }

  const deviceClass = (type: string) => {
    if (type === 'mobile') return styles.badgeMobile
    if (type === 'tablet') return styles.badgeTablet
    return styles.badgeDesktop
  }

  const truncate = (str: string, len: number) => {
    if (!str || str.length <= len) return str || '\u2014'
    return str.slice(0, len) + '\u2026'
  }

  const deviceDist = (stats?.deviceDistribution as Record<string, number>) || {}
  const mobile = deviceDist.mobile ?? 0
  const desktop = deviceDist.desktop ?? 0

  return (
    <div className={styles.adminContainer}>
      <nav className={styles.nav}>
        <span className={`${styles.navLink} ${styles.navLinkActive}`}>Dashboard</span>
        <a href="/" className={styles.navLink}>
          View Site
        </a>
        <div className={styles.navRight}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1>Website Analytics</h1>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Views</h3>
          <p>{stats?.totalViews as React.ReactNode}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Unique Visitors</h3>
          <p>{stats?.uniqueVisitors as React.ReactNode}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Top Country</h3>
          <p>{(stats?.topCountry as string) || 'N/A'}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Device Distribution</h3>
          <div className={styles.chartSection}>
            <div className={styles.chartRow}>
              <span className={styles.chartLabel}>Desktop</span>
              <div className={styles.chartBar}>
                <div className={styles.chartBarFill} style={{ width: `${desktop}%` }} />
              </div>
              <span className={styles.chartValue}>{desktop}%</span>
            </div>
            <div className={styles.chartRow}>
              <span className={styles.chartLabel}>Mobile</span>
              <div className={styles.chartBar}>
                <div className={styles.chartBarFill} style={{ width: `${mobile}%` }} />
              </div>
              <span className={styles.chartValue}>{mobile}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.filterBar}>
        <button
          className={`${styles.filterBtn} ${days === null ? styles.filterBtnActive : ''}`}
          onClick={() => handleFilter(null)}
        >
          All time
        </button>
        <button
          className={`${styles.filterBtn} ${days === 7 ? styles.filterBtnActive : ''}`}
          onClick={() => handleFilter(7)}
        >
          Last 7 days
        </button>
        <button
          className={`${styles.filterBtn} ${days === 30 ? styles.filterBtnActive : ''}`}
          onClick={() => handleFilter(30)}
        >
          Last 30 days
        </button>
      </div>

      {refreshedAt && <span className={styles.refreshedAt}>Refreshed: {refreshedAt}</span>}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'analytics' ? styles.tabActive : ''}`}
          onClick={() => setTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={`${styles.tab} ${tab === 'messages' ? styles.tabActive : ''}`}
          onClick={() => setTab('messages')}
        >
          Messages ({messages.length})
        </button>
      </div>

      {tab === 'analytics' && (
        <>
          <h2>Recent Page Views</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.viewsTable}>
              <thead>
                <tr>
                  <th className={styles.colPath}>Path</th>
                  <th className={styles.colCountry}>Country</th>
                  <th className={styles.colDevice}>Device</th>
                  <th className={styles.colBrowser}>Browser</th>
                  <th className={styles.colOS}>OS</th>
                  <th className={styles.colIP}>IP</th>
                  <th className={styles.colReferrer}>Referrer</th>
                  <th className={styles.colTime}>Time</th>
                </tr>
              </thead>
              <tbody>
                {pageViews?.length > 0 ? (
                  pageViews.map((view, index) => (
                    <tr key={index} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                      <td className={styles.cellPath} title={view.path}>
                        {truncate(view.path ?? '', 40)}
                      </td>
                      <td>
                        <span className={styles.countryChip}>{view.country || '\u2014'}</span>
                      </td>
                      <td>
                        <span
                          className={`${styles.deviceBadge} ${deviceClass(view.device_type ?? '')}`}
                        >
                          {view.device_type || 'desktop'}
                        </span>
                      </td>
                      <td className={styles.cellBrowser}>{view.browser || '\u2014'}</td>
                      <td className={styles.cellOS}>{view.os || '\u2014'}</td>
                      <td className={styles.cellIP} title={view.ip}>
                        {view.ip || '\u2014'}
                      </td>
                      <td className={styles.cellReferrer} title={view.referrer}>
                        {view.referrer && !view.referrer.startsWith('direct')
                          ? truncate(view.referrer, 30)
                          : '\u2014'}
                      </td>
                      <td
                        className={styles.cellTime}
                        title={new Date(view.timestamp ?? '').toLocaleString()}
                      >
                        {timeAgo(view.timestamp ?? '')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className={styles.emptyRow}>
                      No page views yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'messages' && (
        <>
          <h2>Contact Messages</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.viewsTable}>
              <thead>
                <tr>
                  <th className={styles.colName}>Name</th>
                  <th className={styles.colEmail}>Email</th>
                  <th className={styles.colSubject}>Subject</th>
                  <th className={styles.colMessage}>Message</th>
                  <th className={styles.colTime}>Date</th>
                </tr>
              </thead>
              <tbody>
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <tr
                      key={msg.id ?? index}
                      className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}
                    >
                      <td className={styles.cellName}>{msg.name}</td>
                      <td className={styles.cellEmail}>
                        <a href={`mailto:${msg.email}`} className={styles.emailLink}>
                          {msg.email}
                        </a>
                      </td>
                      <td className={styles.cellSubject}>{msg.subject || '\u2014'}</td>
                      <td className={styles.cellMessage} title={msg.message}>
                        {truncate(msg.message ?? '', 80)}
                      </td>
                      <td
                        className={styles.cellTime}
                        title={new Date(msg.created_at ?? '').toLocaleString()}
                      >
                        {timeAgo(msg.created_at ?? '')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className={styles.emptyRow}>
                      No messages yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
