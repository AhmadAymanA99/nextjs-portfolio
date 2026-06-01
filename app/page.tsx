import { getSortedPostsData } from '../lib/posts'
import { getSortedExperiencesData } from '../lib/experience'
import { getAllTags } from '../lib/tags'
import { skillCategories } from '../lib/skills'
import { getCvUrl } from '../lib/siteConfig'
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
