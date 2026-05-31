import { useState } from "react";
import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import Date from "../components/date";
import { getSortedPostsData } from "../lib/posts";
import { getSortedExperiencesData } from "../lib/experience";
import utilStyles from "../styles/utils.module.css";
import Footer from "../components/Footer";
import Section from "../components/Section";
import Skills from "../components/Skills";
import TagsFilter from "../components/TagsFilter";
import ContactForm from "../components/ContactForm";
import { skillCategories } from "../lib/skills";
import { getAllTags } from "../lib/tags";
import { getCvUrl } from "../lib/siteConfig";

export default function Home({ allPostsData, allExperiencesData, allTags }) {
    const [activeTag, setActiveTag] = useState(null);

    const filteredPosts = activeTag
        ? allPostsData.filter(p => p.tags?.includes(activeTag))
        : allPostsData;

    const filteredExperiences = activeTag
        ? allExperiencesData.filter(e => e.tags?.includes(activeTag))
        : allExperiencesData;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Ahmad Ayman",
        "jobTitle": "Software Engineer",
        "url": "https://ahmadayman.vercel.app",
        "sameAs": [
            "https://linkedin.com/in/ahmadaymana99",
            "https://github.com/AhmadAymanA99",
            "https://www.facebook.com/AhmadAyman.A99",
            "https://x.com/A7medAyman99",
        ],
        "knowsAbout": ["React", "Next.js", "JavaScript", "Full-Stack Development"],
    };

    return (
        <>
            <Layout home>
                <Head>
                    <title>{siteTitle}</title>
                    <meta name="description" content="Software Engineer specializing in React, Next.js, and full-stack development with experience in healthcare, education, and enterprise applications." />
                    <meta property="og:title" content={siteTitle} />
                    <meta property="og:description" content="Explore my experience and projects." />
                    <meta property="og:type" content="website" />
                    <meta property="og:url" content="https://ahmadayman.vercel.app" />
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                    />
                </Head>

                <section className={utilStyles.headingMd}>
                    <p className="para">Software Engineer</p>
                    <span className="para-span">(React.js / Next.js)</span>
                    <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <a
                            href={getCvUrl()}
                            className="btn-cv"
                            download
                        >
                            Download CV
                        </a>
                    </p>
                </section>

                <Skills categories={skillCategories} />
                <TagsFilter tags={allTags} activeTag={activeTag} onSelect={setActiveTag} />
                <Section title="Experience" url={"experiences"} data={filteredExperiences} />
                <Section title="Projects" url={"posts"} data={filteredPosts} />
                <ContactForm />
            </Layout>
            <Footer />
        </>
    );
}

export async function getStaticProps() {
    const allPostsData = await getSortedPostsData();
    const allExperiencesData = await getSortedExperiencesData();
    const allTags = getAllTags();

    return {
        props: {
            allPostsData,
            allExperiencesData,
            allTags,
        },
    };
}
