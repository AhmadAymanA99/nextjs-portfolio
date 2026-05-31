import styles from '../styles/Skills.module.css'

const skillIcons = {
  'React': '⚛️',
  'Next.js': '▲',
  'JavaScript': 'JS',
  'TypeScript': 'TS',
  'HTML/CSS': '#',
  'Tailwind CSS': '🌊',
  '.NET Core': '.NET',
  'Node.js': '🌿',
  'REST APIs': '🔗',
  'PostgreSQL': '🐘',
  'SQL Server': '🗄️',
  'Git': '🔀',
  'Docker': '🐳',
  'Azure': '☁️',
  'Vercel': '▲',
  'CI/CD': '🔄',
  'Agile/Scrum': '📋',
}

export default function Skills({ categories }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Skills & Technologies</h2>
      <div className={styles.grid}>
        {categories.map((cat) => (
          <div key={cat.title} className={styles.card}>
            <h3 className={styles.catTitle}>{cat.title}</h3>
            <div className={styles.skillsList}>
              {cat.skills.map((skill) => (
                <span key={skill} className={styles.skill}>
                  <span className={styles.skillIcon}>{skillIcons[skill] || '▹'}</span>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
