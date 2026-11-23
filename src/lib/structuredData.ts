import { getDictionary, localePath, type Locale } from '@/i18n'
import { ogImageUrl, siteUrl } from '@/lib/site'

/**
 * schema.org descriptions of the site's pages (JSON-LD), so search engines
 * can tell who the site is about and show a rich result for the name. Every
 * page points at the same Person by its @id.
 */
const personId = `${siteUrl}/#person`
const websiteId = `${siteUrl}/#website`

const sameAs = ['https://github.com/AhmadAymanA99', 'https://linkedin.com/in/ahmadaymana99']

const knowsAbout = [
  'React',
  'Next.js',
  'React Native',
  'TypeScript',
  'Expo',
  'Arabic/RTL internationalization',
]

const pageUrl = (lang: Locale, path: string) => `${siteUrl}${localePath(lang, path)}`

function person(lang: Locale) {
  const { common, home } = getDictionary(lang)
  return {
    '@type': 'Person',
    '@id': personId,
    name: common.name,
    // The name in the other language, so both spellings lead here
    alternateName: getDictionary(lang === 'ar' ? 'en' : 'ar').common.name,
    jobTitle: home.role,
    description: home.bio,
    url: siteUrl,
    image: `${siteUrl}/images/profile.png`,
    email: 'mailto:ahmadaymana99@gmail.com',
    address: { '@type': 'PostalAddress', addressLocality: 'Cairo', addressCountry: 'EG' },
    knowsLanguage: ['en', 'ar'],
    knowsAbout,
    sameAs,
  }
}

function website(lang: Locale) {
  const { meta } = getDictionary(lang)
  return {
    '@type': 'WebSite',
    '@id': websiteId,
    url: siteUrl,
    name: meta.siteName,
    inLanguage: ['en', 'ar'],
    publisher: { '@id': personId },
  }
}

/** The home page: a profile page about the Person. */
export function homeJsonLd(lang: Locale) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      website(lang),
      person(lang),
      {
        '@type': 'ProfilePage',
        '@id': `${pageUrl(lang, '/')}#page`,
        url: pageUrl(lang, '/'),
        name: getDictionary(lang).meta.title,
        inLanguage: lang,
        isPartOf: { '@id': websiteId },
        mainEntity: { '@id': personId },
      },
    ],
  }
}

/** A case study: a piece of work by the Person. */
export function projectJsonLd(
  lang: Locale,
  p: { id: string; title: string; summary: string; date: string; screenshots: string[] },
) {
  const url = pageUrl(lang, `/posts/${p.id}`)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      person(lang),
      {
        '@type': 'CreativeWork',
        '@id': `${url}#work`,
        url,
        name: p.title,
        headline: p.title,
        description: p.summary,
        dateCreated: p.date,
        inLanguage: lang,
        ...(p.screenshots[0] && { image: `${siteUrl}${p.screenshots[0]}` }),
        author: { '@id': personId },
        isPartOf: { '@id': websiteId },
      },
      breadcrumbs(lang, url, p.title),
    ],
  }
}

/** A technical article by the Person. */
export function articleJsonLd(
  lang: Locale,
  a: { id: string; title: string; summary: string; date: string },
) {
  const url = pageUrl(lang, `/articles/${a.id}`)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      person(lang),
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        url,
        mainEntityOfPage: url,
        headline: a.title,
        description: a.summary,
        datePublished: a.date,
        inLanguage: lang,
        image: ogImageUrl(lang, a.id),
        author: { '@id': personId },
        publisher: { '@id': personId },
        isPartOf: { '@id': websiteId },
      },
      breadcrumbs(lang, url, a.title),
    ],
  }
}

function breadcrumbs(lang: Locale, url: string, title: string) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: getDictionary(lang).common.name,
        item: pageUrl(lang, '/'),
      },
      { '@type': 'ListItem', position: 2, name: title, item: url },
    ],
  }
}
