'use client'

import { useEffect, useState } from 'react'
import Spinner from '@/components/ui/Spinner'
import { useAdminApi } from './useAdminApi'
import styles from './Admin.module.css'

type Details = {
  ip: string
  time: string
  path: string
  referrer: string | null
  network: { asn: string | null; holder: string | null; prefix: string | null } | null
  hosting: boolean
  location: { country: string | null; city: string | null; region: string | null }
  device: { type: string; vendor: string | null; model: string | null }
  os: string | null
  browser: string | null
  inApp: string | null
  engine: string | null
  userAgent: string | null
  history: { views: number; days: number; first: string; last: string }
  visits: { timestamp: string; path: string; referrer: string | null }[]
  notes: string[]
}

const countryName = (code: string | null) => {
  if (!code || code === 'Unknown') return 'Unknown'
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}

const cairoTime = (ts: string) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts)) + ' (Cairo)'

const source = (ref: string | null) =>
  ref === 'internal'
    ? 'Another page of the site'
    : !ref || ref === 'direct'
      ? 'Direct'
      : ref.replace(/^https?:\/\/(www\.)?/, '')

/** Everything known about one visit: who it probably is, network, device, history. */
export default function VisitDetails({ id }: { id: number }) {
  const api = useAdminApi()
  const [data, setData] = useState<Details | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api(`/api/admin/visit?id=${id}`)
      .then((r) => r.json())
      .then(setData)
      .catch((err) => setError(err.message))
  }, [api, id])

  if (error) return <div className={styles.error}>{error}</div>
  if (!data)
    return (
      <div className={styles.visitLoading}>
        <Spinner size={16} /> Looking up this visit…
      </div>
    )

  const model = [data.device.vendor, data.device.model].filter(Boolean).join(' ')
  const rows: [string, React.ReactNode][] = [
    ['IP address', <span className={styles.mono}>{data.ip}</span>],
    [
      'Network',
      data.network?.holder ? (
        <>
          {data.network.holder}
          <span className={styles.visitMuted}>
            {' '}
            · AS{data.network.asn}
            {data.network.prefix && <> · {data.network.prefix}</>}
          </span>
        </>
      ) : (
        <span className={styles.visitMuted}>Couldn&apos;t look it up</span>
      ),
    ],
    [
      'Location',
      [data.location.city, countryName(data.location.country)].filter(Boolean).join(', '),
    ],
    [
      'Device',
      <>
        <span style={{ textTransform: 'capitalize' }}>{data.device.type}</span>
        {model && (
          <>
            {' · '}
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(model)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {model}
            </a>
          </>
        )}
      </>,
    ],
    ['System', data.os || 'Unknown'],
    [
      'Browser',
      <>
        {data.browser || 'Unknown'}
        {data.inApp && <span className={styles.visitMuted}> · in-app browser</span>}
      </>,
    ],
    ['Time', cairoTime(data.time)],
    ['Page', <span className={styles.mono}>{data.path}</span>],
    ['Came from', source(data.referrer)],
  ]

  return (
    <div className={styles.visit}>
      {data.notes.length > 0 && (
        <ul className={styles.visitNotes}>
          {data.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}

      <dl className={styles.visitGrid}>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <h4 className={styles.visitHeading}>
        All visits from this address ({data.history.views} view
        {data.history.views === 1 ? '' : 's'} on {data.history.days} day
        {data.history.days === 1 ? '' : 's'})
      </h4>
      <ul className={styles.visitList}>
        {data.visits.map((v) => (
          <li key={v.timestamp + v.path}>
            <span>{cairoTime(v.timestamp)}</span>
            <span className={styles.mono}>{v.path}</span>
            <span className={styles.visitMuted}>{source(v.referrer)}</span>
          </li>
        ))}
      </ul>

      {data.userAgent && (
        <details className={styles.visitRaw}>
          <summary>Raw browser identity (user agent)</summary>
          <code>{data.userAgent}</code>
        </details>
      )}
    </div>
  )
}
