/**
 * Languages the site is published in. English is the default and lives at the
 * unprefixed URLs (/posts/rehlte); Arabic lives under /ar (/ar/posts/rehlte).
 * `src/proxy.ts` rewrites unprefixed URLs to the internal /en routes.
 */
export const locales = ['en', 'ar'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value)

export const dirOf = (lang: Locale) => (lang === 'ar' ? 'rtl' : 'ltr')

/** Open Graph locale tags */
export const ogLocale: Record<Locale, string> = { en: 'en_US', ar: 'ar_AR' }

/** Public URL path of `path` (an unprefixed path such as "/faq") in `lang`. */
export function localePath(lang: Locale, path: string) {
  if (lang === defaultLocale) return path
  return path === '/' ? `/${lang}` : `/${lang}${path}`
}

/**
 * Splits a path into its language and the unprefixed path. Accepts the
 * internal /en/… form too: pre-rendered English pages see it in usePathname().
 */
export function splitLocale(pathname: string): { lang: Locale; path: string } {
  for (const lang of locales) {
    if (pathname === `/${lang}`) return { lang, path: '/' }
    if (pathname.startsWith(`/${lang}/`)) return { lang, path: pathname.slice(lang.length + 1) }
  }
  return { lang: defaultLocale, path: pathname }
}

/** The address visitors see for a path (/en/faq → /faq; /ar/faq unchanged). */
export function publicPath(pathname: string) {
  const { lang, path } = splitLocale(pathname)
  return localePath(lang, path)
}

/** The same page in the other language, for the language switch. */
export function switchLocalePath(pathname: string) {
  const { lang, path } = splitLocale(pathname)
  return localePath(lang === 'ar' ? 'en' : 'ar', path)
}

/** Fills `{name}` placeholders in a dictionary string. */
export function format(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  )
}

export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }

/** Picks the plural form for `n` (Arabic has six) and fills in `{n}`. */
export function plural(lang: Locale, forms: PluralForms, n: number) {
  const rule = new Intl.PluralRules(lang).select(n)
  return format(forms[rule] ?? forms.other, { n })
}
