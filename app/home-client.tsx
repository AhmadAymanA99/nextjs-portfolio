'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Skills from '../components/Skills'
import TagsFilter from '../components/TagsFilter'
import Section from '../components/Section'
import Footer from '../components/Footer'
import { HomeLayout } from '../components/PageLayout'

const ContactForm = dynamic(() => import('../components/ContactForm'), { ssr: false })

export default function HomeClient({
  allPostsData,
  allExperiencesData,
  allTags,
  cvUrl,
  skillCategories,
}: {
  allPostsData: any[]
  allExperiencesData: any[]
  allTags: string[]
  cvUrl: string
  skillCategories: any
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filteredPosts = activeTag
    ? allPostsData.filter((p: any) => p.tags?.includes(activeTag))
    : allPostsData

  const filteredExperiences = activeTag
    ? allExperiencesData.filter((e: any) => e.tags?.includes(activeTag))
    : allExperiencesData

  return (
    <>
      <HomeLayout>
        <section>
          <p className="para">Software Engineer</p>
          <span className="para-span">(React.js / Next.js)</span>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            <a href={cvUrl} className="btn-cv" download>
              Download CV
            </a>
          </p>
        </section>

        <Skills categories={skillCategories} />
        <TagsFilter tags={allTags} activeTag={activeTag} onSelect={setActiveTag} />
        <Section title="Experience" url="experiences" data={filteredExperiences} />
        <Section title="Projects" url="posts" data={filteredPosts} />
        <ContactForm />
      </HomeLayout>
      <Footer />
    </>
  )
}
