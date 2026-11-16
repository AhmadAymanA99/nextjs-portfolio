import { parseISO, format } from 'date-fns'
import { useI18n } from '@/i18n/I18nProvider'

// Arabic month names with Western digits ("1 أكتوبر 2026"), matching the
// figures used everywhere else on the site
const arabicDate = new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default function FormattedDate({ dateString }: { dateString: string }) {
  const { lang, dict } = useI18n()
  if (dateString === 'now') return <>{dict.common.now}</>

  const date = parseISO(dateString)
  const text = lang === 'ar' ? arabicDate.format(date) : format(date, 'MMM d, yyyy')
  return <time dateTime={dateString}>{text}</time>
}
