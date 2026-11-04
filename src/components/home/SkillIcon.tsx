import Image from 'next/image'
import type { IconType } from 'react-icons'
import {
  SiDotnet,
  SiExpo,
  SiFastapi,
  SiGithubactions,
  SiGraphql,
  SiJavascript,
  SiJest,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiRedux,
  SiStorybook,
  SiTailwindcss,
  SiTanstack,
  SiTypescript,
  SiVercel,
  SiVitest,
} from 'react-icons/si'
import styles from './BentoHome.module.css'

// Official brand colors (Simple Icons). Black logos use currentColor so they
// stay visible in dark mode.
const logos: Record<string, { Icon: IconType; color?: string }> = {
  React: { Icon: SiReact, color: '#61DAFB' },
  'React Native': { Icon: SiReact, color: '#61DAFB' },
  'Next.js': { Icon: SiNextdotjs },
  TypeScript: { Icon: SiTypescript, color: '#3178C6' },
  JavaScript: { Icon: SiJavascript, color: '#F7DF1E' },
  'Redux Toolkit': { Icon: SiRedux, color: '#764ABC' },
  'Tailwind CSS': { Icon: SiTailwindcss, color: '#06B6D4' },
  Expo: { Icon: SiExpo },
  'TanStack Query': { Icon: SiTanstack, color: '#FF4154' },
  'Node.js': { Icon: SiNodedotjs, color: '#5FA04E' },
  '.NET Core': { Icon: SiDotnet, color: '#512BD4' },
  FastAPI: { Icon: SiFastapi, color: '#009688' },
  GraphQL: { Icon: SiGraphql, color: '#E10098' },
  PostgreSQL: { Icon: SiPostgresql, color: '#4169E1' },
  Jest: { Icon: SiJest, color: '#C21325' },
  Vitest: { Icon: SiVitest, color: '#6E9F18' },
  Storybook: { Icon: SiStorybook, color: '#FF4785' },
  'GitHub Actions': { Icon: SiGithubactions, color: '#2088FF' },
  Vercel: { Icon: SiVercel },
}

// Logos not in Simple Icons, taken from each project's official assets
// (public/images/logos). `darkSrc` is used when the dark theme is active.
const imageLogos: Record<string, { src: string; darkSrc?: string }> = {
  Zustand: { src: '/images/logos/zustand.svg' },
  Reanimated: {
    src: '/images/logos/reanimated.svg',
    darkSrc: '/images/logos/reanimated-dark.svg',
  },
  HyperPay: { src: '/images/logos/hyperpay.svg' },
}

export default function SkillIcon({ skill }: { skill: string }) {
  const logo = logos[skill]
  const image = imageLogos[skill]
  if (image) {
    const img = (src: string, className: string) => (
      <Image src={src} alt="" width={16} height={16} className={className} unoptimized />
    )
    return image.darkSrc ? (
      <>
        {img(image.src, `${styles.skillLogo} ${styles.lightOnly}`)}
        {img(image.darkSrc, `${styles.skillLogo} ${styles.darkOnly}`)}
      </>
    ) : (
      img(image.src, styles.skillLogo)
    )
  }
  if (!logo) {
    // No official logo available: show the initials in a neutral badge
    return (
      <span className={styles.skillMonogram} aria-hidden>
        {skill.slice(0, 2)}
      </span>
    )
  }
  const { Icon, color } = logo
  return <Icon className={styles.skillIcon} style={color ? { color } : undefined} aria-hidden />
}
