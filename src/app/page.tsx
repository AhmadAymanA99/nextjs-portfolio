import { getSortedPostsData } from '@/lib/content/posts'
import { getSortedExperiencesData } from '@/lib/content/experience'
import { getAllTags } from '@/lib/content/tags'
import { skillCategories } from '@/lib/content/skills'
import { getCvUrl } from '@/lib/site'
import HomeClient from './home-client'

export const revalidate = 3600

export default async function HomePage() {
  const allPostsData = await getSortedPostsData()
  const allExperiencesData = await getSortedExperiencesData()
  const allTags = getAllTags()

  return (
    <HomeClient
      allPostsData={allPostsData}
      allExperiencesData={allExperiencesData}
      allTags={allTags}
      cvUrl={getCvUrl()}
      skillCategories={skillCategories}
    />
  )
}
