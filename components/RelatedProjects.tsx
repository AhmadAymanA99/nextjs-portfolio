import Link from 'next/link'
import styles from '../styles/RelatedProjects.module.css'

export default function RelatedProjects({ currentId, tags, allPosts }) {
  const related = allPosts
    .filter((p) => p.id !== currentId && p.tags?.some((t) => tags?.includes(t)))
    .slice(0, 3)

  if (related.length === 0) return null

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Related Projects</h2>
      <div className={styles.grid}>
        {related.map((p) => (
          <Link key={p.id} href={`/posts/${p.id}`} className={styles.card}>
            <h3 className={styles.cardTitle}>{p.title}</h3>
            <div className={styles.tags}>
              {p.tags?.slice(0, 3).map((t) => (
                <span key={t} className={styles.tag}>
                  {t}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
