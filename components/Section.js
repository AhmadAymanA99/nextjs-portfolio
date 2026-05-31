import Link from "next/link";
import Date from "./date";
import utilStyles from "../styles/utils.module.css";

const tagStyle = {
  display: 'inline-block',
  fontSize: '0.7rem',
  padding: '0.15rem 0.45rem',
  margin: '0.1rem 0.25rem 0.1rem 0',
  borderRadius: '4px',
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-muted)',
  border: '1px solid var(--border-color)',
  lineHeight: 1.4,
}

const Section = ({ title, data, url }) => {
  if (!data || data.length === 0) return null
  return (
    <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>{title}</h2>
        <ul className={utilStyles.list}>
            {data.map(({ id, date, till, title, tags }) => (
                <li className={utilStyles.listItem} key={id}>
                    <Link href={`/${url}/${id}`} className={utilStyles.listItemLink}>
                        <div className={utilStyles.listItemContent}>
                            <h3 className={utilStyles.listItemTitle}>{title}</h3>
                            <div className={utilStyles.listItemMeta}>
                                <small className={utilStyles.lightText}>
                                    <Date dateString={date} />
                                    {till && (
                                        <>
                                            {till === "now" ? (
                                                <span className={utilStyles.badge}>Current</span>
                                            ) : (
                                                <>
                                                    {" to "}
                                                    <Date dateString={till} />
                                                </>
                                            )}
                                        </>
                                    )}
                                </small>
                            </div>
                            {tags && tags.length > 0 && (
                              <div style={{ marginTop: '0.35rem' }}>
                                {tags.map(t => (
                                  <span key={t} style={tagStyle}>{t}</span>
                                ))}
                              </div>
                            )}
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    </section>
  )
}

export default Section;
