import { parseISO, format } from 'date-fns'
import { getDictionary, type Locale } from '@/i18n'

// Arabic month names with Western digits ("1 أكتوبر 2026"), matching the
// figures used everywhere else on the site
const arabicDate = new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** A date ("Oct 1, 2026" / "1 أكتوبر 2026"), or "now". Usable on the server. */
export default function FormattedDate({ dateString, lang }: { dateString: string; lang: Locale }) {
  if (dateString === 'now') return <>{getDictionary(lang).common.now}</>

  const date = parseISO(dateString)
  const text = lang === 'ar' ? arabicDate.format(date) : format(date, 'MMM d, yyyy')
  return <time dateTime={dateString}>{text}</time>
}
