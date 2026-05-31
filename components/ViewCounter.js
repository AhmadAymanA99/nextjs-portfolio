import { useState, useEffect } from 'react'

export default function ViewCounter({ path }) {
  const [count, setCount] = useState(null)

  useEffect(() => {
    fetch(`/api/views?path=${encodeURIComponent(path)}`)
      .then(r => r.json())
      .then(d => setCount(d.count))
      .catch(() => setCount(0))
  }, [path])

  if (count === null) return null

  return (
    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
      {count} view{count !== 1 ? 's' : ''}
    </span>
  )
}
