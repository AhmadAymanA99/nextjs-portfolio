'use client'

import { useEffect, useState } from 'react'
import { FaGithub } from 'react-icons/fa'
import { VscRepoForked, VscStarEmpty, VscGitCommit, VscIssueReopened } from 'react-icons/vsc'

const iconMap = {
  PushEvent: VscGitCommit,
  CreateEvent: VscRepoForked,
  WatchEvent: VscStarEmpty,
  IssuesEvent: VscIssueReopened,
  ForkEvent: VscRepoForked,
}

interface Activity {
  type: string
  repo: string
  action: string
  createdAt: string
}

export default function GitHubActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/github')
      .then((r) => r.json())
      .then((d) => {
        setActivities(d.activities || [])
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          fontWeight: 600,
        }}
      >
        <FaGithub size={12} /> Recent Activity
      </div>
      {!loaded ? (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Loading...</span>
      ) : activities.length === 0 ? (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          No recent public activity
        </span>
      ) : (
        activities.map((a, i) => {
          const Icon = iconMap[a.type] || VscGitCommit
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
              }}
            >
              <Icon size={12} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  gap: '0.25rem',
                  overflow: 'hidden',
                }}
              >
                <span
                  style={{
                    color: 'var(--text-link)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {a.repo?.split('/')[1]}
                </span>
                <span
                  style={{
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  — {a.action}
                </span>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
