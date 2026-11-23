'use client'

import { FaMoon, FaSun } from 'react-icons/fa'
import { useTheme } from '@/lib/ThemeContext'
import { useI18n } from '@/i18n/I18nProvider'
import styles from './LanguageSwitch.module.css'

/**
 * Toggles light and dark. Both icons are rendered and CSS shows the right one
 * from <html data-theme>, which is set before first paint, so the icon is
 * correct immediately and there is no hydration mismatch.
 */
export default function ThemeSwitch() {
  const { toggleTheme } = useTheme()
  const { dict } = useI18n()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`${styles.switch} ${styles.iconOnly}`}
      aria-label={dict.common.switchThemeLabel}
      title={dict.common.switchThemeLabel}
    >
      <FaSun aria-hidden="true" className={styles.sun} />
      <FaMoon aria-hidden="true" className={styles.moon} />
    </button>
  )
}
