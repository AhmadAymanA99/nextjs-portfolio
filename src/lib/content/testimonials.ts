import type { Locale } from '@/i18n/config'

/**
 * Quotes from managers and clients, shown on the home page. The section stays
 * hidden while this list is empty. Only add real quotes, with the person's
 * permission, in their own words. `ar` is an optional Arabic translation;
 * without it the English quote is shown on Arabic pages too.
 *
 * Example:
 * {
 *   name: 'Jane Doe',
 *   role: 'Engineering Manager',
 *   company: 'Softera',
 *   quote: 'Ahmad shipped …',
 *   ar: { quote: '…', role: 'مديرة الهندسة' },
 *   link: 'https://www.linkedin.com/in/…', // optional: where the quote can be checked
 * }
 */
export type Testimonial = {
  name: string
  role: string
  company: string
  quote: string
  ar?: { quote?: string; role?: string; name?: string }
  link?: string
}

export const testimonials: Testimonial[] = []

export function getTestimonials(lang: Locale) {
  return testimonials.map((t) => ({
    name: (lang === 'ar' && t.ar?.name) || t.name,
    role: (lang === 'ar' && t.ar?.role) || t.role,
    company: t.company,
    quote: (lang === 'ar' && t.ar?.quote) || t.quote,
    link: t.link,
  }))
}
