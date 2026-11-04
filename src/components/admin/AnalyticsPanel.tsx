'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { FaDownload, FaSyncAlt } from 'react-icons/fa'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { timeAgo, useAdminApi } from './useAdminApi'
import styles from './Admin.module.css'

interface Analytics {
  days: number | null
  chartDays: number
  stats: {
    views: number
    visitors: number
    prevViews: number | null
    prevVisitors: number | null
    viewsPerVisitor: number
    topCountry: string | null
    excludedBots: number
    devices: { desktop: number; mobile: number; tablet: number }
  }
  dailyViews: { date: string; views: number; visitors: number }[]
  topPages: { path: string; views: number; visitors: number }[]
  referrers: { source: string; visitors: number }[]
  countries: { country: string; visitors: number }[]
  recentViews: {
    path: string
    country: string
    device_type: string
    referrer: string
    timestamp: string
    ip: string
    browser: string
    os: string
  }[]
}

const RANGES: { label: string; days: number | null }[] = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: 'All', days: null },
]

const VIEWS_COLOR = 'var(--text-link)'
const VISITORS_COLOR = '#1f9d55'

const regionNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null

function countryName(code: string) {
  if (!code || code === 'Unknown' || code.length !== 2) return code || 'Unknown'
  try {
    return regionNames?.of(code) ?? code
  } catch {
    return code
  }
}

function Delta({ now, before }: { now: number; before: number | null }) {
  if (before === null) return null
  if (before === 0)
    return now > 0 ? <span className={styles.muted}>new vs prev. period</span> : null
  const change = Math.round(((now - before) / before) * 100)
  const cls = change >= 0 ? styles.deltaUp : styles.deltaDown
  return (
    <span className={`${styles.delta} ${cls}`} title={`Previous period: ${before}`}>
      {change >= 0 ? '▲' : '▼'} {Math.abs(change)}%
    </span>
  )
}

function BarList({
  title,
  rows,
  mono,
}: {
  title: string
  rows: { label: string; value: number; title?: string }[]
  mono?: boolean
}) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <div className={styles.card}>
      <h3>{title}</h3>
      {rows.length ? (
        <ul className={styles.barList}>
          {rows.map((r) => (
            <li key={r.label} className={styles.barRow} title={r.title ?? r.label}>
              <span className={styles.barFill} style={{ width: `${(r.value / max) * 100}%` }} />
              <span className={`${styles.barLabel} ${mono ? styles.mono : ''}`}>{r.label}</span>
              <span className={styles.barValue}>{r.value.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No data for this period</p>
      )}
    </div>
  )
}

function shortDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

export default function AnalyticsPanel() {
  const api = useAdminApi()
  const [days, setDays] = useState<number | null>(30)
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api(`/api/admin/analytics${days ? `?days=${days}` : ''}`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [api, days])

  useEffect(load, [load])

  const exportCsv = async () => {
    setExporting(true)
    try {
      const res = await api(`/api/admin/analytics/export${days ? `?days=${days}` : ''}`)
      const blob = await res.blob()
      const name =
        res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] ?? 'page-views.csv'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setExporting(false)
    }
  }

  const s = data?.stats
  const periodLabel = days ? `last ${days} days` : 'all time'

  return (
    <section aria-label="Analytics">
      <div className={styles.toolbar}>
        <div className={styles.segmented} role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button key={r.label} aria-pressed={days === r.days} onClick={() => setDays(r.days)}>
              {r.label}
            </button>
          ))}
        </div>
        <span className={styles.spacer} />
        <button className={styles.button} onClick={load} disabled={loading}>
          <FaSyncAlt aria-hidden /> Refresh
        </button>
        <button className={styles.button} onClick={exportCsv} disabled={exporting || !s?.views}>
          <FaDownload aria-hidden /> {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading && !data ? (
        <DashboardSkeleton />
      ) : data && s ? (
        <div style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Visitors</div>
              <div className={styles.statValue}>{s.visitors.toLocaleString()}</div>
              <Delta now={s.visitors} before={s.prevVisitors} />
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Page views</div>
              <div className={styles.statValue}>{s.views.toLocaleString()}</div>
              <Delta now={s.views} before={s.prevViews} />
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Views / visitor</div>
              <div className={styles.statValue}>{s.viewsPerVisitor}</div>
              <span className={styles.muted}>{periodLabel}</span>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Top country</div>
              <div className={styles.statValue}>
                {s.topCountry ? countryName(s.topCountry) : '—'}
              </div>
              <span className={styles.muted}>
                Desktop {s.devices.desktop}% · Mobile {s.devices.mobile}%
                {s.devices.tablet ? ` · Tablet ${s.devices.tablet}%` : ''}
              </span>
            </div>
          </div>

          <p className={styles.muted} style={{ marginBottom: '1rem' }}>
            Counts only real visitors. {s.excludedBots.toLocaleString()} bot, crawler and admin hits
            were excluded ({periodLabel}). Visits from this browser are not tracked.
          </p>

          <div className={styles.chartCard}>
            <h3>Traffic · last {data.chartDays} days</h3>
            <div className={styles.chartLegend}>
              <span>
                <span className={styles.legendSwatch} style={{ background: VISITORS_COLOR }} />
                Visitors
              </span>
              <span>
                <span className={styles.legendSwatch} style={{ background: VIEWS_COLOR }} />
                Page views
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.dailyViews} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={VIEWS_COLOR} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={VIEWS_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border-color)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  minTickGap={24}
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip
                  labelFormatter={(d) => shortDate(String(d))}
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 6,
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  name="Page views"
                  stroke={VIEWS_COLOR}
                  fill="url(#fillViews)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  name="Visitors"
                  stroke={VISITORS_COLOR}
                  fill="none"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.listsGrid}>
            <BarList
              title="Top pages (views)"
              mono
              rows={data.topPages.map((p) => ({
                label: p.path,
                value: p.views,
                title: `${p.path} — ${p.views} views, ${p.visitors} visitors`,
              }))}
            />
            <BarList
              title="Traffic sources (visitors)"
              rows={data.referrers.map((r) => ({ label: r.source, value: r.visitors }))}
            />
            <BarList
              title="Countries (visitors)"
              rows={data.countries.map((c) => ({
                label: countryName(c.country),
                value: c.visitors,
              }))}
            />
            <BarList
              title="Devices (% of views)"
              rows={(['desktop', 'mobile', 'tablet'] as const)
                .map((d) => ({ label: d[0].toUpperCase() + d.slice(1), value: s.devices[d] }))
                .filter((r) => r.value > 0)}
            />
          </div>

          <div className={styles.card} style={{ padding: 0, border: 'none' }}>
            <h3 style={{ margin: '0 0 0.75rem' }}>Recent visits</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Source</th>
                    <th>Country</th>
                    <th>Device</th>
                    <th>Browser / OS</th>
                    <th>IP</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentViews.length ? (
                    data.recentViews.map((v, i) => (
                      <tr key={i}>
                        <td className={styles.mono} title={v.path}>
                          {v.path}
                        </td>
                        <td title={v.referrer}>
                          {v.referrer === 'internal'
                            ? '↳ internal'
                            : !v.referrer || v.referrer === 'direct'
                              ? 'Direct'
                              : v.referrer.replace(/^https?:\/\/(www\.)?/, '')}
                        </td>
                        <td>{countryName(v.country)}</td>
                        <td>
                          <span className={styles.chip}>{v.device_type || 'desktop'}</span>
                        </td>
                        <td>
                          {v.browser} / {v.os}
                        </td>
                        <td className={styles.mono}>{v.ip}</td>
                        <td title={new Date(v.timestamp).toLocaleString()}>
                          {timeAgo(v.timestamp)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className={styles.empty}>
                        No visits in this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
