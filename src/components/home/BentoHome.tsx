import Image from 'next/image'
import Link from 'next/link'
import FormattedDate from '@/components/ui/FormattedDate'
import BackToTop from '@/components/layout/BackToTop'
import Footer from '@/components/layout/Footer'
import Reveal from '@/components/ui/Reveal'
import TiltCard from '@/components/ui/TiltCard'
import NowPlaying from './NowPlaying'
import GitHubActivity from './GitHubActivity'
import SkillIcon from './SkillIcon'
import CairoOffset from './CairoOffset'
import ProjectFilter from './ProjectFilter'
import LazyContactForm from './LazyContactForm'
import styles from './BentoHome.module.css'
import utilStyles from '@/styles/utils.module.css'
import { FaEnvelope, FaGithub, FaLinkedin } from 'react-icons/fa'
import { getDictionary, localePath, type Locale } from '@/i18n'
import type { getSortedPostsData } from '@/lib/content/posts'
import type { getSortedExperiencesData } from '@/lib/content/experience'
import type { skillCategories as SkillCategories } from '@/lib/content/skills'

/**
 * The home page. Rendered on the server; only the interactive parts (tilt,
 * Cairo offset, project filter, widgets, contact form, footer) run in the
 * browser, which keeps hydration small.
 */
export default function BentoHome({
  lang,
  allPostsData,
  allExperiencesData,
  allTags,
  cvUrl,
  skillCategories,
}: {
  lang: Locale
  allPostsData: ReturnType<typeof getSortedPostsData>
  allExperiencesData: ReturnType<typeof getSortedExperiencesData>
  allTags: string[]
  cvUrl: string
  skillCategories: typeof SkillCategories
}) {
  const dict = getDictionary(lang)
  const href = (path: string) => localePath(lang, path)
  const t = dict.home
  const name = dict.common.name
  const tagLabel = (tag: string) => dict.tags[tag] ?? tag

  const latestExp = allExperiencesData?.[0]

  const allSkills = skillCategories?.flatMap((cat) => cat.skills) ?? []

  return (
    <main id="main-content" className={styles.layout}>
      <div className={styles.grid}>
        {/* Hero */}
        <Reveal on="load" style={{ gridColumn: '1 / -1' }} className={styles.gridItem}>
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
                  {t.availability} (<CairoOffset />)
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
        <Reveal on="load" delay={0.08} className={styles.gridItem}>
          <TiltCard className={`${styles.card} ${styles.midCard}`} maxTilt={4} glare>
            <span className={styles.midCardLabel}>{t.latestExperience}</span>
            {latestExp ? (
              <>
                <h3 className={styles.midCardTitle}>{latestExp.title}</h3>
                <p className={styles.midCardSub}>
                  <FormattedDate lang={lang} dateString={latestExp.date} />
                  {latestExp.till === 'now' ? (
                    <span className={utilStyles.badge}>{t.current}</span>
                  ) : latestExp.till ? (
                    <>
                      {' '}
                      — <FormattedDate lang={lang} dateString={latestExp.till} />
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
        <Reveal on="load" delay={0.16} className={styles.gridItem}>
          <TiltCard className={`${styles.card} ${styles.midCard}`} maxTilt={4} glare>
            <span className={styles.midCardLabel}>{t.skills}</span>
            <div className={styles.skillsGrid}>
              {allSkills.slice(0, 12).map((skill) => (
                <span key={skill} className={styles.skillItem}>
                  <SkillIcon skill={skill} />
                  <span className={styles.skillName}>{skill}</span>
                </span>
              ))}
            </div>
          </TiltCard>
        </Reveal>

        {/* Contact Quick Card */}
        <Reveal on="load" delay={0.24} className={styles.gridItem}>
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
        <Reveal style={{ gridColumn: '1 / -1' }} className={styles.gridItem}>
          <div className={`${styles.card} ${styles.bottomSection}`}>
            <h2 className={styles.bottomSectionTitle}>{t.projects}</h2>
            <ProjectFilter
              allLabel={t.allTags}
              emptyLabel={t.noProjectsMatch}
              tags={allTags.map((tag) => ({ value: tag, label: tagLabel(tag) }))}
              items={allPostsData.map((post) => ({
                id: post.id,
                tags: post.tags ?? [],
                content: (
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
                        <FormattedDate lang={lang} dateString={post.date} />
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
                ),
              }))}
            />
          </div>
        </Reveal>

        {/* All Experiences */}
        <Reveal style={{ gridColumn: '1 / -1' }} className={styles.gridItem}>
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
                        <FormattedDate lang={lang} dateString={exp.date} />
                        {exp.till === 'now' ? (
                          <span className={utilStyles.badge}>{t.current}</span>
                        ) : exp.till ? (
                          <>
                            {' '}
                            — <FormattedDate lang={lang} dateString={exp.till} />
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

      <LazyContactForm />
      <BackToTop />
      <Footer />
    </main>
  )
}
