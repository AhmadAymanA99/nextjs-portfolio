'use client'

import { useEffect, useState } from 'react'
import { FaSpotify } from 'react-icons/fa'

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
      } catch {}
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
          <span>Loading...</span>
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
          gap: '0.6rem',
          fontSize: '0.8rem',
          color: '#1DB954',
          textDecoration: 'none',
        }}
      >
        <FaSpotify size={14} />
        {data.albumImage && (
          <img
            src={data.albumImage}
            alt={data.album || ''}
            style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }}
          />
        )}
        <div style={{ overflow: 'hidden' }}>
          <a
            href={data.songUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'inherit',
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
