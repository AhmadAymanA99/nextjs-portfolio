import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import Date from "../components/date";
import { getSortedPostsData } from "../lib/posts";
import { getSortedExperiencesData } from "../lib/experience";
import utilStyles from "../styles/utils.module.css";
import Footer from "../components/Footer";
import Section from "../components/Section";

export default function Home({ allPostsData, allExperiencesData }) {
    return (
        <>
            <Layout home>
                <Head>
                    <title>{siteTitle}</title>
                    <meta name="description" content="Software Engineer specializing in React, Next.js, and full-stack development with experience in healthcare, education, and enterprise applications." />
                    <meta property="og:title" content={siteTitle} />
                    <meta property="og:description" content="Explore my experience and projects." />
                    <meta property="og:type" content="website" />
                </Head>

                <section className={utilStyles.headingMd}>
                    <p className="para">Software Engineer</p>
                    <span className="para-span">(React.js / Next.js)</span>
                </section>

                {/* Reusable sections for Experience and Projects */}
                <Section title="Experience" url={"experiences"} data={allExperiencesData} />
                <Section title="Projects" url={"posts"} data={allPostsData} />
            </Layout>
            <Footer />
        </>
    );
}

export async function getStaticProps() {
    const allPostsData = await getSortedPostsData();
    const allExperiencesData = await getSortedExperiencesData();

    return {
        props: {
            allPostsData,
            allExperiencesData,
        },
    };
}
