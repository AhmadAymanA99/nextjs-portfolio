import styles from '../styles/TagsFilter.module.css'

export default function TagsFilter({ tags, activeTag, onSelect }) {
  return (
    <div className={styles.filter}>
      <button
        className={`${styles.tag} ${activeTag === null ? styles.active : ''}`}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          className={`${styles.tag} ${activeTag === tag ? styles.active : ''}`}
          onClick={() => onSelect(activeTag === tag ? null : tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
