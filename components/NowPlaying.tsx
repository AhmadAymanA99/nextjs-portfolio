'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { FaSpotify } from 'react-icons/fa'
import utilStyles from '../styles/utils.module.css'

interface TrackData {
  isPlaying: boolean
  title?: string
  artist?: string
  album?: string
  albumImage?: string | null
  songUrl?: string | null
}

const dividerStyle = {
  marginTop: '0.75rem',
  paddingTop: '0.75rem',
  borderTop: '1px solid var(--border-color)',
}

export default function NowPlaying() {
  const [data, setData] = useState<TrackData | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchTrack() {
      try {
        const res = await fetch('/api/spotify')
        const json = await res.json()
        if (mounted) setData(json)
      } catch {
        if (mounted) setData({ isPlaying: false })
      }
    }

    fetchTrack()
    const interval = setInterval(fetchTrack, 30000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  if (!data) {
    return (
      <div style={dividerStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <FaSpotify size={14} />
          <span className={utilStyles.skeleton} style={{ width: 120, height: 14 }} />
        </div>
      </div>
    )
  }

  if (!data.isPlaying) {
    return null
  }

  return (
    <div style={dividerStyle}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          fontWeight: 600,
          marginBottom: '0.4rem',
        }}
      >
        <FaSpotify size={12} /> Last Played
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.8rem',
          color: 'var(--text-primary)',
        }}
      >
        {data.albumImage && (
          <Image
            src={data.albumImage}
            alt={data.album || ''}
            width={28}
            height={28}
            style={{ borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
          />
        )}
        <div style={{ overflow: 'hidden', minWidth: 0 }}>
          <a
            href={data.songUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--text-link)',
              textDecoration: 'none',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
            }}
          >
            {data.title}
          </a>
          <span
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.72rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
            }}
          >
            {data.artist}
          </span>
        </div>
      </div>
    </div>
  )
}
