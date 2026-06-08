'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Date from './date'
import BackToTop from './BackToTop'
import Footer from './Footer'
import Reveal from './Reveal'
import { StaggerContainer, StaggerItem } from './StaggerContainer'
import NowPlaying from './NowPlaying'
import GitHubActivity from './GitHubActivity'
import TiltCard from './TiltCard'
import styles from '../styles/BentoGrid.module.css'
import utilStyles from '../styles/utils.module.css'
import { FaEnvelope, FaGithub, FaLinkedin, FaWhatsapp, FaTelegramPlane } from 'react-icons/fa'

const ContactForm = dynamic(() => import('./ContactForm'), { ssr: false })

const name = 'Ahmad Ayman'

const skillIcons = {
  React: '⚛️',
  'Next.js': '▲',
  JavaScript: 'JS',
  TypeScript: 'TS',
  'HTML/CSS': '#',
  'Tailwind CSS': '🌊',
  '.NET Core': 'C#',
  'Node.js': '🌿',
  'REST APIs': '🔗',
  PostgreSQL: '🐘',
  'SQL Server': '🗄️',
  Git: '🔀',
  Docker: '🐳',
  Azure: '☁️',
  Vercel: '▲',
  'CI/CD': '🔄',
  'Agile/Scrum': '📋',
}

export default function BentoHome({
  allPostsData,
  allExperiencesData,
  allTags,
  cvUrl,
  skillCategories,
}) {
  const [activeTag, setActiveTag] = useState(null)

  const filteredPosts = activeTag
    ? allPostsData.filter((p) => p.tags?.includes(activeTag))
    : allPostsData

  const latestExp = allExperiencesData?.[0]

  const allSkills = skillCategories?.flatMap((cat) => cat.skills) ?? []

  return (
    <main id="main-content" className={styles.layout}>
      <div className={styles.grid}>
        {/* Hero */}
        <Reveal
          direction="up"
          distance={30}
          duration={0.6}
          style={{ gridColumn: '1 / -1' }}
          className={styles.gridItem}
        >
          <TiltCard className={`${styles.card} ${styles.heroRow}`} maxTilt={3}>
            <Image
              priority
              src="/images/profile.png"
              className={utilStyles.borderCircle}
              height={140}
              width={140}
              alt={name}
            />
            <div className={styles.heroContent}>
              <h1 className={styles.heroName}>{name}</h1>
              <p className={styles.heroTitle}>
                Software Engineer{' '}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  (React.js / Next.js)
                </span>
              </p>
              <p className={styles.heroBio}>
                Building scalable, performant web applications with modern JavaScript. Focused on
                creating exceptional user experiences through clean architecture and thoughtful
                design.
              </p>
              <a href={cvUrl} className={styles.cvButton} download>
                <span>↓</span> Download CV
              </a>
            </div>
          </TiltCard>
        </Reveal>

        {/* Latest Experience */}
        <Reveal direction="up" delay={0.1} className={styles.gridItem}>
          <TiltCard className={`${styles.card} ${styles.midCard}`} maxTilt={4} glare>
            <span className={styles.midCardLabel}>Latest Experience</span>
            {latestExp ? (
              <>
                <h3 className={styles.midCardTitle}>{latestExp.title}</h3>
                <p className={styles.midCardSub}>
                  <Date dateString={latestExp.date} />
                  {latestExp.till === 'now' ? (
                    <span className={utilStyles.badge}>Current</span>
                  ) : latestExp.till ? (
                    <>
                      {' '}
                      — <Date dateString={latestExp.till} />
                    </>
                  ) : null}
                </p>
                <Link href={`/experiences/${latestExp.id}`} className={styles.midCardLink}>
                  View details →
                </Link>
              </>
            ) : (
              <p className={styles.midCardSub}>No experience listed yet</p>
            )}
          </TiltCard>
        </Reveal>

        {/* Skills Mini Grid */}
        <Reveal direction="up" delay={0.15} className={styles.gridItem}>
          <TiltCard className={`${styles.card} ${styles.midCard}`} maxTilt={4} glare>
            <span className={styles.midCardLabel}>Skills</span>
            <div className={styles.skillsGrid}>
              {allSkills.slice(0, 12).map((skill) => (
                <span key={skill} className={styles.skillItem}>
                  <span className={styles.skillIcon}>{skillIcons[skill] || '▹'}</span>
                  {skill}
                </span>
              ))}
            </div>
          </TiltCard>
        </Reveal>

        {/* Contact Quick Card */}
        <Reveal direction="up" delay={0.2} className={styles.gridItem}>
          <TiltCard className={`${styles.card} ${styles.midCard}`} maxTilt={4} glare>
            <span className={styles.midCardLabel}>Connect</span>
            <div className={styles.contactLinks}>
              <a href="mailto:ahmadaymana99@gmail.com" className={styles.contactLink}>
                <FaEnvelope /> ahmadaymana99@gmail.com
              </a>
              <a
                href="https://github.com/AhmadAymanA99"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                <FaGithub /> GitHub
              </a>
              <a
                href="https://linkedin.com/in/ahmadaymana99"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                <FaLinkedin /> LinkedIn
              </a>
              <a
                href="https://wa.me/201023874473"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                <FaWhatsapp /> WhatsApp
              </a>
              <a
                href="https://t.me/Ahmad_Ayman99"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                <FaTelegramPlane /> Telegram
              </a>
            </div>
            <NowPlaying />
            <div
              style={{
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <GitHubActivity />
            </div>
          </TiltCard>
        </Reveal>

        {/* Projects */}
        <Reveal
          direction="up"
          delay={0.1}
          style={{ gridColumn: '1 / -1' }}
          className={styles.gridItem}
        >
          <div className={`${styles.card} ${styles.bottomSection}`}>
            <h2 className={styles.bottomSectionTitle}>Projects</h2>
            <div className={styles.filterRow}>
              <button
                className={`${styles.filterTag} ${activeTag === null ? styles.filterTagActive : ''}`}
                onClick={() => setActiveTag(null)}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  className={`${styles.filterTag} ${activeTag === tag ? styles.filterTagActive : ''}`}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <StaggerContainer className={styles.projectList}>
              {filteredPosts.length === 0 ? (
                <p className={styles.emptyState}>No projects match this filter.</p>
              ) : (
                filteredPosts.map((post) => (
                  <StaggerItem key={post.id}>
                    <Link href={`/posts/${post.id}`} className={styles.projectItem}>
                      <div className={styles.projectItemLeft}>
                        <span className={styles.projectName}>{post.title}</span>
                        <span className={styles.projectMeta}>
                          <Date dateString={post.date} />
                        </span>
                      </div>
                      <div className={styles.projectTags}>
                        {post.tags?.map((t) => (
                          <span key={t} className={styles.projectTag}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </Link>
                  </StaggerItem>
                ))
              )}
            </StaggerContainer>
          </div>
        </Reveal>

        {/* All Experiences */}
        <Reveal
          direction="up"
          delay={0.1}
          style={{ gridColumn: '1 / -1' }}
          className={styles.gridItem}
        >
          <div className={`${styles.card} ${styles.bottomSection}`}>
            <h2 className={styles.bottomSectionTitle}>Experience</h2>
            <div className={styles.projectList}>
              {allExperiencesData.length === 0 ? (
                <p className={styles.emptyState}>No experience listed yet.</p>
              ) : (
                allExperiencesData.map((exp) => (
                  <Link key={exp.id} href={`/experiences/${exp.id}`} className={styles.projectItem}>
                    <div className={styles.projectItemLeft}>
                      <span className={styles.projectName}>{exp.title}</span>
                      <span className={styles.projectMeta}>
                        <Date dateString={exp.date} />
                        {exp.till === 'now' ? (
                          <span className={utilStyles.badge}>Current</span>
                        ) : exp.till ? (
                          <>
                            {' '}
                            — <Date dateString={exp.till} />
                          </>
                        ) : null}
                      </span>
                    </div>
                    <div className={styles.projectTags}>
                      {exp.tags?.map((t) => (
                        <span key={t} className={styles.projectTag}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </Reveal>
      </div>

      <ContactForm />
      <BackToTop />
      <Footer />
    </main>
  )
}
