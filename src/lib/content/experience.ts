import type { Locale } from '@/i18n/config'
import { listIds, readEntry, renderBody } from './markdown'
import { experienceTags } from './tags'

function readExperience(id: string, lang: Locale) {
  const entry = readEntry('experience', id, lang)
  if (!entry) throw new Error(`Experience not found: ${id}`)
  return entry
}

export function getSortedExperiencesData(lang: Locale = 'en') {
  return listIds('experience')
    .map((id) => {
      const data = readExperience(id, lang).data
      return {
        id,
        tags: experienceTags[id] || [],
        ...data,
        title: data.title as string,
        date: data.date as string,
        till: data.till as string | undefined,
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getAllExperienceIds() {
  return listIds('experience').map((id) => ({ params: { id } }))
}

export async function getExperienceData(id: string, lang: Locale = 'en') {
  const { data, content } = readExperience(id, lang)

  return {
    id,
    ...(await renderBody(content)),
    title: data.title as string,
    date: data.date as string,
    till: data.till as string,
  }
}
