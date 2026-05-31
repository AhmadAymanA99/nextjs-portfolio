import { FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { FaLink } from 'react-icons/fa'

export default function ShareButtons({ url, title }) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const copyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(url)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginTop: '2.5rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid var(--border-color)',
    }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Share</span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', transition: 'color 0.2s' }}
        onMouseOver={e => e.currentTarget.style.color = '#0a66c2'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        aria-label="Share on LinkedIn"
      >
        <FaLinkedin />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', transition: 'color 0.2s' }}
        onMouseOver={e => e.currentTarget.style.color = '#000'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        aria-label="Share on X"
      >
        <FaXTwitter />
      </a>
      <button
        onClick={copyLink}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-secondary)', fontSize: '1.2rem',
          padding: 0, display: 'inline-flex', transition: 'color 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.color = 'var(--text-link)'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        aria-label="Copy link"
      >
        <FaLink />
      </button>
    </div>
  )
}
