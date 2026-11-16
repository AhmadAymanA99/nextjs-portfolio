import ar from './dictionaries/ar'
import en, { type Dictionary } from './dictionaries/en'
import { localePath, type Locale } from './config'

export * from './config'
export type { Dictionary }

const dictionaries: Record<Locale, Dictionary> = { en, ar }

export const getDictionary = (lang: Locale) => dictionaries[lang]

/**
 * Metadata `alternates` for a page: its canonical URL and the same page in
 * every language, so search engines link the two versions (hreflang).
 */
export function alternates(lang: Locale, path: string) {
  return {
    canonical: localePath(lang, path),
    languages: {
      en: localePath('en', path),
      ar: localePath('ar', path),
      'x-default': localePath('en', path),
    },
  }
}
