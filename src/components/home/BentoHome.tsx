'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import FormattedDate from '@/components/ui/FormattedDate'
import BackToTop from '@/components/layout/BackToTop'
import Footer from '@/components/layout/Footer'
import Reveal from '@/components/ui/Reveal'
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer'
import NowPlaying from './NowPlaying'
import GitHubActivity from './GitHubActivity'
import TiltCard from '@/components/ui/TiltCard'
import SkillIcon from './SkillIcon'
import styles from './BentoHome.module.css'
import utilStyles from '@/styles/utils.module.css'
import { FaEnvelope, FaGithub, FaLinkedin } from 'react-icons/fa'
import { useI18n } from '@/i18n/I18nProvider'

const ContactForm = dynamic(() => import('./ContactForm'), { ssr: false })

/** Cairo's current UTC offset: GMT+2, or GMT+3 during Egyptian summer time. */
function getCairoOffset() {
  try {
    return (
      new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Cairo', timeZoneName: 'shortOffset' })
        .formatToParts(new Date())
        .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+2'
    )
  } catch {
    return 'GMT+2'
  }
}

export default function BentoHome({
  allPostsData,
  allExperiencesData,
  allTags,
  cvUrl,
  skillCategories,
}) {
  const { dict, href } = useI18n()
  const t = dict.home
  const name = dict.common.name
  const tagLabel = (tag: string) => dict.tags[tag] ?? tag
  const [activeTag, setActiveTag] = useState(null)
  // The page is statically rendered, so refresh the offset in the browser
  const [cairoOffset, setCairoOffset] = useState(getCairoOffset)
  useEffect(() => setCairoOffset(getCairoOffset()), [])

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
              sizes="140px"
              alt={name}
            />
            <div className={styles.heroContent}>
              <h1 className={styles.heroName}>{name}</h1>
              <p className={styles.heroTitle}>
                {t.role}{' '}
                <span dir="ltr" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  {t.roleStack}
                </span>
              </p>
              <p className={styles.heroBio}>{t.bio}</p>
              <p className={styles.availability}>
                <span className={styles.availabilityDot} aria-hidden />
                <span>
                  {t.availability} (<bdi dir="ltr">{cairoOffset}</bdi>)
                </span>
              </p>
              <div className={styles.heroActions}>
                <a href="#contact" className={`${styles.cvButton} ${styles.ctaPrimary}`}>
                  {t.contactMe}
                </a>
                <a href={cvUrl} className={styles.cvButton} download>
                  <span aria-hidden="true">↓</span> {t.downloadCv}
                </a>
              </div>
            </div>
          </TiltCard>
        </Reveal>

        {/* Latest Experience */}
        <Reveal direction="up" delay={0.1} className={styles.gridItem}>
          <TiltCard className={`${styles.card} ${styles.midCard}`} maxTilt={4} glare>
            <span className={styles.midCardLabel}>{t.latestExperience}</span>
            {latestExp ? (
              <>
                <h3 className={styles.midCardTitle}>{latestExp.title}</h3>
                <p className={styles.midCardSub}>
                  <FormattedDate dateString={latestExp.date} />
                  {latestExp.till === 'now' ? (
                    <span className={utilStyles.badge}>{t.current}</span>
                  ) : latestExp.till ? (
                    <>
                      {' '}
                      — <FormattedDate dateString={latestExp.till} />
                    </>
                  ) : null}
                </p>
                <Link href={href(`/experiences/${latestExp.id}`)} className={styles.midCardLink}>
                  {t.viewDetails} <span className="rtl-flip">→</span>
                </Link>
              </>
            ) : (
              <p className={styles.midCardSub}>{t.noExperience}</p>
            )}
          </TiltCard>
        </Reveal>

        {/* Skills Mini Grid */}
        <Reveal direction="up" delay={0.15} className={styles.gridItem}>
          <TiltCard className={`${styles.card} ${styles.midCard}`} maxTilt={4} glare>
            <span className={styles.midCardLabel}>{t.skills}</span>
            <div className={styles.skillsGrid}>
              {allSkills.slice(0, 12).map((skill) => (
                <span key={skill} className={styles.skillItem}>
                  <SkillIcon skill={skill} />
                  {skill}
                </span>
              ))}
            </div>
          </TiltCard>
        </Reveal>

        {/* Contact Quick Card */}
        <Reveal direction="up" delay={0.2} className={styles.gridItem}>
          <TiltCard className={`${styles.card} ${styles.midCard}`} maxTilt={4} glare>
            <span className={styles.midCardLabel}>{t.connect}</span>
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
                <FaGithub /> GitHub{' '}
                <span className={styles.contactHandle} dir="ltr">
                  @AhmadAymanA99
                </span>
              </a>
              <a
                href="https://linkedin.com/in/ahmadaymana99"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                <FaLinkedin /> LinkedIn{' '}
                <span className={styles.contactHandle} dir="ltr">
                  @ahmadaymana99
                </span>
              </a>
            </div>
            <NowPlaying />
            <GitHubActivity />
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
            <h2 className={styles.bottomSectionTitle}>{t.projects}</h2>
            <div className={styles.filterRow}>
              <button
                className={`${styles.filterTag} ${activeTag === null ? styles.filterTagActive : ''}`}
                onClick={() => setActiveTag(null)}
              >
                {t.allTags}
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  className={`${styles.filterTag} ${activeTag === tag ? styles.filterTagActive : ''}`}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                >
                  {tagLabel(tag)}
                </button>
              ))}
            </div>
            <StaggerContainer key={activeTag ?? 'all'} className={styles.projectList}>
              {filteredPosts.length === 0 ? (
                <p className={styles.emptyState}>{t.noProjectsMatch}</p>
              ) : (
                filteredPosts.map((post, i) => (
                  <StaggerItem key={post.id} index={i}>
                    <Link
                      href={href(`/posts/${post.id}`)}
                      className={`${styles.projectItem} ${styles.projectCase}`}
                    >
                      <div className={styles.projectThumb}>
                        {post.screenshots?.[0] ? (
                          <Image
                            src={post.screenshots[0]}
                            alt=""
                            fill
                            sizes="96px"
                            className={styles.projectThumbImg}
                          />
                        ) : (
                          <span className={styles.projectThumbInitial} aria-hidden="true">
                            {post.title.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className={styles.projectItemLeft}>
                        <span className={styles.projectName}>{post.title}</span>
                        {post.summary && (
                          <span className={styles.projectSummary}>{post.summary}</span>
                        )}
                        <span className={styles.projectMeta}>
                          {post.company && <>{post.company} · </>}
                          <FormattedDate dateString={post.date} />
                        </span>
                      </div>
                      <div className={styles.projectTags}>
                        {post.tags?.map((t) => (
                          <span key={t} className={styles.projectTag}>
                            {tagLabel(t)}
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
            <h2 className={styles.bottomSectionTitle}>{t.experience}</h2>
            <div className={styles.projectList}>
              {allExperiencesData.length === 0 ? (
                <p className={styles.emptyState}>{t.noExperience}</p>
              ) : (
                allExperiencesData.map((exp) => (
                  <Link
                    key={exp.id}
                    href={href(`/experiences/${exp.id}`)}
                    className={styles.projectItem}
                  >
                    <div className={styles.projectItemLeft}>
                      <span className={styles.projectName}>{exp.title}</span>
                      <span className={styles.projectMeta}>
                        <FormattedDate dateString={exp.date} />
                        {exp.till === 'now' ? (
                          <span className={utilStyles.badge}>{t.current}</span>
                        ) : exp.till ? (
                          <>
                            {' '}
                            — <FormattedDate dateString={exp.till} />
                          </>
                        ) : null}
                      </span>
                    </div>
                    <div className={styles.projectTags}>
                      {exp.tags?.map((t) => (
                        <span key={t} className={styles.projectTag}>
                          {tagLabel(t)}
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
