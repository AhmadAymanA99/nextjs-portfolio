'use client'

import { useMemo, useState } from 'react'
import { FaArrowLeft, FaEnvelopeOpen, FaEnvelope, FaReply, FaTrash } from 'react-icons/fa'
import { timeAgo, useAdminApi } from './useAdminApi'
import styles from './Admin.module.css'

export interface ContactMessage {
  id: number
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

type Filter = 'all' | 'unread'

export default function MessagesPanel({
  messages,
  setMessages,
  reload,
}: {
  messages: ContactMessage[]
  setMessages: (update: (prev: ContactMessage[]) => ContactMessage[]) => void
  reload: () => void
}) {
  const api = useAdminApi()
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const visible = useMemo(
    () => (filter === 'unread' ? messages.filter((m) => !m.is_read) : messages),
    [messages, filter],
  )
  const selected = messages.find((m) => m.id === selectedId) ?? null
  const unreadCount = messages.filter((m) => !m.is_read).length

  // Optimistic update, rolled back by reloading if the request fails
  const run = async (
    apply: (prev: ContactMessage[]) => ContactMessage[],
    request: () => Promise<unknown>,
  ) => {
    setError(null)
    setMessages(apply)
    try {
      await request()
    } catch (err) {
      setError((err as Error).message)
      reload()
    }
  }

  const setRead = (ids: number[], read: boolean) =>
    run(
      (prev) => prev.map((m) => (ids.includes(m.id) ? { ...m, is_read: read } : m)),
      () => api('/api/admin/messages', { method: 'PATCH', body: { ids, read } }),
    )

  const remove = (ids: number[]) => {
    if (!confirm(`Delete ${ids.length === 1 ? 'this message' : `${ids.length} messages`}?`)) return
    if (selectedId && ids.includes(selectedId)) setSelectedId(null)
    setChecked(new Set())
    return run(
      (prev) => prev.filter((m) => !ids.includes(m.id)),
      () => api('/api/admin/messages', { method: 'DELETE', body: { ids } }),
    )
  }

  const open = (m: ContactMessage) => {
    setSelectedId(m.id)
    if (!m.is_read) setRead([m.id], true)
  }

  const toggleCheck = (id: number) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const checkedIds = [...checked]
  const allChecked = visible.length > 0 && visible.every((m) => checked.has(m.id))

  const replyHref = (m: ContactMessage) => {
    const subject = `Re: ${m.subject || 'Your message on my portfolio'}`
    const quoted = m.message
      .split('\n')
      .map((l) => `> ${l}`)
      .join('\n')
    const body = `Hi ${m.name},\n\n\n\n---\nOn ${new Date(m.created_at).toLocaleString()} you wrote:\n${quoted}`
    return `mailto:${m.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <section aria-label="Messages">
      <div className={styles.toolbar}>
        <div className={styles.segmented} role="group" aria-label="Filter messages">
          <button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
            All ({messages.length})
          </button>
          <button aria-pressed={filter === 'unread'} onClick={() => setFilter('unread')}>
            Unread ({unreadCount})
          </button>
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
            onChange={() => setChecked(allChecked ? new Set() : new Set(visible.map((m) => m.id)))}
          />
          Select all
        </label>
        <span className={styles.spacer} />
        {checkedIds.length > 0 && (
          <>
            <button className={styles.button} onClick={() => setRead(checkedIds, true)}>
              <FaEnvelopeOpen aria-hidden /> Mark read
            </button>
            <button className={styles.button} onClick={() => setRead(checkedIds, false)}>
              <FaEnvelope aria-hidden /> Mark unread
            </button>
            <button
              className={`${styles.button} ${styles.buttonDanger}`}
              onClick={() => remove(checkedIds)}
            >
              <FaTrash aria-hidden /> Delete ({checkedIds.length})
            </button>
          </>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {visible.length === 0 ? (
        <div className={`${styles.card} ${styles.empty}`}>
          {filter === 'unread' ? 'No unread messages 🎉' : 'No messages yet'}
        </div>
      ) : (
        <div className={`${styles.inbox} ${selected ? styles.inboxHasSelection : ''}`}>
          <ul className={styles.itemList}>
            {visible.map((m) => (
              <li
                key={m.id}
                className={`${styles.item} ${m.id === selectedId ? styles.itemActive : ''} ${
                  m.is_read ? '' : styles.itemUnread
                }`}
                onClick={() => open(m)}
              >
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={checked.has(m.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleCheck(m.id)}
                  aria-label={`Select message from ${m.name}`}
                />
                <div className={styles.itemBody}>
                  <div className={styles.itemTop}>
                    <span className={styles.itemTitle}>{m.name}</span>
                    <span className={styles.itemMeta}>{timeAgo(m.created_at)}</span>
                  </div>
                  <div className={styles.itemPreview}>{m.subject || m.message}</div>
                </div>
              </li>
            ))}
          </ul>

          <div className={styles.detail}>
            {selected ? (
              <>
                <button
                  className={`${styles.button} ${styles.backLink}`}
                  onClick={() => setSelectedId(null)}
                  style={{ marginBottom: '1rem' }}
                >
                  <FaArrowLeft aria-hidden /> Back
                </button>
                <div className={styles.detailHeader}>
                  <div style={{ minWidth: 0 }}>
                    <h2>{selected.subject || '(no subject)'}</h2>
                    <div className={styles.muted}>
                      {selected.name} ·{' '}
                      <a className={styles.link} href={`mailto:${selected.email}`}>
                        {selected.email}
                      </a>{' '}
                      · {new Date(selected.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className={styles.detailActions}>
                    <a
                      className={`${styles.button} ${styles.buttonPrimary}`}
                      href={replyHref(selected)}
                    >
                      <FaReply aria-hidden /> Reply
                    </a>
                    <button
                      className={styles.button}
                      onClick={() => setRead([selected.id], !selected.is_read)}
                    >
                      {selected.is_read ? 'Mark unread' : 'Mark read'}
                    </button>
                    <button
                      className={`${styles.button} ${styles.buttonDanger}`}
                      onClick={() => remove([selected.id])}
                      aria-label="Delete message"
                    >
                      <FaTrash aria-hidden />
                    </button>
                  </div>
                </div>
                <div className={styles.messageText}>{selected.message}</div>
              </>
            ) : (
              <p className={styles.empty}>Select a message to read it</p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
