'use client'

import { usePathname } from 'next/navigation'
import { FaLanguage } from 'react-icons/fa6'
import { useI18n } from '@/i18n/I18nProvider'
import { switchLocalePath } from '@/i18n/config'
import styles from './LanguageSwitch.module.css'

/**
 * Links to the same page in the other language. A plain <a> (full page load)
 * so the document's lang, dir and font switch cleanly.
 */
export default function LanguageSwitch() {
  const pathname = usePathname()
  const { lang, dict } = useI18n()
  const target = lang === 'ar' ? 'en' : 'ar'

  return (
    <a
      href={switchLocalePath(pathname)}
      hrefLang={target}
      lang={target}
      className={styles.switch}
      aria-label={dict.common.switchLanguageLabel}
      title={dict.common.switchLanguageLabel}
    >
      <FaLanguage aria-hidden="true" />
      <span>{dict.common.switchLanguage}</span>
    </a>
  )
}
