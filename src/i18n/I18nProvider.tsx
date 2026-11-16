'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import en, { type Dictionary } from './dictionaries/en'
import ar from './dictionaries/ar'
import { dirOf, localePath, type Locale } from './config'

type I18n = {
  lang: Locale
  dir: 'ltr' | 'rtl'
  dict: Dictionary
  /** Public URL of an unprefixed path ("/posts/rehlte") in the current language */
  href: (path: string) => string
}

const make = (lang: Locale, dict: Dictionary): I18n => ({
  lang,
  dir: dirOf(lang),
  dict,
  href: (path) => localePath(lang, path),
})

// English outside a provider (admin pages, unit tests)
const I18nContext = createContext<I18n>(make('en', en))

export function I18nProvider({ lang, children }: { lang: Locale; children: ReactNode }) {
  const value = useMemo(() => make(lang, lang === 'ar' ? ar : en), [lang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
