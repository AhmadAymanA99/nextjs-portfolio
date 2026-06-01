import { getAllExperienceIds, getExperienceData } from '../../../lib/experience'
import ExperienceClient from './experience-client'

export const revalidate = 3600

export async function generateStaticParams() {
  return getAllExperienceIds().map((p: { params: { id: string } }) => ({ id: p.params.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getExperienceData(id)
  return {
    title: `${data.title} - Ahmad Ayman`,
    description: `${data.title} - ${data.date}${data.till === 'now' ? ' to Present' : ` to ${data.till}`}`,
  }
}

export default async function ExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getExperienceData(id)
  return <ExperienceClient data={data} />
}
