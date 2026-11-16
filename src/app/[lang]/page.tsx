import { getSortedPostsData } from '@/lib/content/posts'
import { getSortedExperiencesData } from '@/lib/content/experience'
import { getAllTags } from '@/lib/content/tags'
import { skillCategories } from '@/lib/content/skills'
import { getCvUrl } from '@/lib/site'
import { alternates, isLocale } from '@/i18n'
import BentoHome from '@/components/home/BentoHome'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  return {
    alternates: { ...alternates(lang, '/'), types: { 'application/rss+xml': '/rss.xml' } },
  }
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) return null

  return (
    <BentoHome
      allPostsData={getSortedPostsData(lang)}
      allExperiencesData={getSortedExperiencesData(lang)}
      allTags={getAllTags()}
      cvUrl={getCvUrl()}
      skillCategories={skillCategories}
    />
  )
}
