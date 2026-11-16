import { notFound } from 'next/navigation'
import { getAllExperienceIds, getExperienceData } from '@/lib/content/experience'
import { alternates, getDictionary, isLocale, ogLocale } from '@/i18n'
import ExperienceClient from './experience-client'

export const revalidate = 3600
export const dynamicParams = false

export async function generateStaticParams() {
  return getAllExperienceIds().map((p) => ({ id: p.params.id }))
}

type Props = { params: Promise<{ lang: string; id: string }> }

export async function generateMetadata({ params }: Props) {
  const { lang, id } = await params
  if (!isLocale(lang)) return {}
  const data = await getExperienceData(id, lang)
  const { common, meta } = getDictionary(lang)
  const title = `${data.title}${meta.titleSuffix}`
  const end = data.till === 'now' ? common.present : data.till
  const description = `${data.title} - ${data.date} – ${end}`

  return {
    title,
    description,
    openGraph: { title, description, type: 'article', locale: ogLocale[lang] },
    alternates: alternates(lang, `/experiences/${id}`),
  }
}

export default async function ExperiencePage({ params }: Props) {
  const { lang, id } = await params
  if (!isLocale(lang)) notFound()
  const data = await getExperienceData(id, lang)
  return <ExperienceClient data={data} />
}
