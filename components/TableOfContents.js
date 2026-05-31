import { useState, useEffect } from 'react'
import styles from '../styles/TableOfContents.module.css'

export default function TableOfContents({ headings }) {
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-80px 0px -80% 0px' }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  return (
    <nav className={styles.toc}>
      <h3 className={styles.title}>On this page</h3>
      <ul className={styles.list}>
        {headings.map((h) => (
          <li
            key={h.id}
            className={`${styles.item} ${h.depth === 3 ? styles.sub : ''} ${activeId === h.id ? styles.active : ''}`}
          >
            <a href={`#${h.id}`} className={styles.link}>{h.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
