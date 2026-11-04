'use client'

import { useMemo, useState } from 'react'
import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa'
import { timeAgo, useAdminApi } from './useAdminApi'
import styles from './Admin.module.css'

export interface GuestbookEntry {
  id: number
  name: string
  message: string
  website: string
  approved: boolean
  flagged: boolean
  created_at: string
}

type Filter = 'pending' | 'flagged' | 'approved' | 'all'

const FILTERS: { key: Filter; label: string; match: (e: GuestbookEntry) => boolean }[] = [
  { key: 'pending', label: 'Pending', match: (e) => !e.approved && !e.flagged },
  { key: 'flagged', label: 'Likely spam', match: (e) => !e.approved && e.flagged },
  { key: 'approved', label: 'Approved', match: (e) => e.approved },
  { key: 'all', label: 'All', match: () => true },
]

function websiteHref(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export default function GuestbookPanel({
  entries,
  setEntries,
  reload,
}: {
  entries: GuestbookEntry[]
  setEntries: (update: (prev: GuestbookEntry[]) => GuestbookEntry[]) => void
  reload: () => void
}) {
  const api = useAdminApi()
  const [filter, setFilter] = useState<Filter>('pending')
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.key, entries.filter(f.match).length])),
    [entries],
  )
  const visible = entries.filter(FILTERS.find((f) => f.key === filter)!.match)

  const run = async (
    apply: (prev: GuestbookEntry[]) => GuestbookEntry[],
    request: () => Promise<unknown>,
  ) => {
    setError(null)
    setEntries(apply)
    setChecked(new Set())
    try {
      await request()
    } catch (err) {
      setError((err as Error).message)
      reload()
    }
  }

  const setApproved = (ids: number[], approved: boolean) =>
    run(
      (prev) =>
        prev.map((e) =>
          ids.includes(e.id) ? { ...e, approved, flagged: approved ? false : e.flagged } : e,
        ),
      () => api('/api/admin/guestbook', { method: 'PATCH', body: { ids, approved } }),
    )

  const remove = (ids: number[]) => {
    if (!confirm(`Delete ${ids.length === 1 ? 'this entry' : `${ids.length} entries`}?`)) return
    return run(
      (prev) => prev.filter((e) => !ids.includes(e.id)),
      () => api('/api/admin/guestbook', { method: 'DELETE', body: { ids } }),
    )
  }

  const toggleCheck = (id: number) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const checkedIds = [...checked]
  const allChecked = visible.length > 0 && visible.every((e) => checked.has(e.id))

  return (
    <section aria-label="Guestbook">
      <div className={styles.toolbar}>
        <div className={styles.segmented} role="group" aria-label="Filter entries">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              aria-pressed={filter === f.key}
              onClick={() => {
                setFilter(f.key)
                setChecked(new Set())
              }}
            >
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>
        <label
          className={styles.muted}
          style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}
        >
          <input
            type="checkbox"
            className={styles.checkbox}
            style={{ marginTop: 0 }}
            checked={allChecked}
            onChange={() => setChecked(allChecked ? new Set() : new Set(visible.map((e) => e.id)))}
          />
          Select all
        </label>
        <span className={styles.spacer} />
        {checkedIds.length > 0 && (
          <>
            <button className={styles.button} onClick={() => setApproved(checkedIds, true)}>
              <FaCheck aria-hidden /> Approve ({checkedIds.length})
            </button>
            <button className={styles.button} onClick={() => setApproved(checkedIds, false)}>
              <FaTimes aria-hidden /> Unapprove
            </button>
            <button
              className={`${styles.button} ${styles.buttonDanger}`}
              onClick={() => remove(checkedIds)}
            >
              <FaTrash aria-hidden /> Delete
            </button>
          </>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {visible.length === 0 ? (
        <div className={`${styles.card} ${styles.empty}`}>
          {filter === 'pending' ? 'Nothing waiting for review 🎉' : 'No entries here'}
        </div>
      ) : (
        <div className={styles.entryList}>
          {visible.map((e) => (
            <article key={e.id} className={styles.entry}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={checked.has(e.id)}
                onChange={() => toggleCheck(e.id)}
                aria-label={`Select entry from ${e.name}`}
              />
              <div className={styles.itemBody}>
                <div className={styles.itemTop}>
                  <strong className={styles.itemTitle}>{e.name}</strong>
                  <span className={styles.itemMeta} title={new Date(e.created_at).toLocaleString()}>
                    {timeAgo(e.created_at)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '0.35rem 0' }}>
                  {e.approved ? (
                    <span className={`${styles.chip} ${styles.chipOk}`}>Approved</span>
                  ) : (
                    <span className={`${styles.chip} ${styles.chipWarn}`}>Pending</span>
                  )}
                  {e.flagged && (
                    <span className={`${styles.chip} ${styles.chipDanger}`}>Likely spam</span>
                  )}
                  {e.website && (
                    <a
                      className={styles.link}
                      style={{ fontSize: '0.8rem' }}
                      href={websiteHref(e.website)}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      {e.website}
                    </a>
                  )}
                </div>
                <div className={styles.messageText} style={{ fontSize: '0.9rem' }}>
                  {e.message}
                </div>
                <div className={styles.entryActions}>
                  {e.approved ? (
                    <button className={styles.button} onClick={() => setApproved([e.id], false)}>
                      <FaTimes aria-hidden /> Unapprove
                    </button>
                  ) : (
                    <button
                      className={`${styles.button} ${styles.buttonPrimary}`}
                      onClick={() => setApproved([e.id], true)}
                    >
                      <FaCheck aria-hidden /> Approve
                    </button>
                  )}
                  <button
                    className={`${styles.button} ${styles.buttonDanger}`}
                    onClick={() => remove([e.id])}
                  >
                    <FaTrash aria-hidden /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
