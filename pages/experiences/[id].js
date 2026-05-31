import Head from "next/head";

import Layout from "../../components/layout";
import Date from "../../components/date";
import { getAllExperienceIds, getExperienceData } from "../../lib/experience";
import Footer from "../../components/Footer";
import ShareButtons from "../../components/ShareButtons";
import TableOfContents from "../../components/TableOfContents";
import ViewCounter from "../../components/ViewCounter";

import utilStyles from "../../styles/utils.module.css";

export default function Experience({ data }) {
    const url = `https://ahmadayman.vercel.app/experiences/${data.id}`
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "OrganizationRole",
        "roleName": data.title,
        "startDate": data.date,
        "endDate": data.till === "now" ? undefined : data.till,
        "description": data.contentHtml?.replace(/<[^>]*>/g, '').slice(0, 200),
    };

    return (
        <>
            <Layout>
                <Head>
                    <title>{data.title} - Ahmad Ayman</title>
                    <meta name="description" content={`${data.title} - ${data.date}${data.till === 'now' ? ' to Present' : ` to ${data.till}`}`} />
                    <meta property="og:title" content={`${data.title} - Ahmad Ayman`} />
                    <meta property="og:type" content="article" />
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                    />
                </Head>
                <article className="article">
                    <h1 className={utilStyles.headingXl}>{data.title}</h1>
                    <div className={utilStyles.lightText}>
                        <Date dateString={data.date} /> {`to `}
                        {data.till === "now" ? <span>now</span> : <Date dateString={data.till} />}
                        {data.readingTime && <span> · {data.readingTime} min read</span>}
                        <span> · </span>
                        <ViewCounter path={`/experiences/${data.id}`} />
                    </div>
                    <div className="content-with-toc">
                        <div className="content" dangerouslySetInnerHTML={{ __html: data.contentHtml }} />
                        <TableOfContents headings={data.headings || []} />
                    </div>
                    <ShareButtons url={url} title={data.title} />
                </article>
            </Layout>
            <Footer />
        </>
    );
}

export async function getStaticPaths() {
    const paths = getAllExperienceIds();
    return {
        paths,
        fallback: false,
    };
}

export async function getStaticProps({ params }) {
    const data = await getExperienceData(params.id);
    return {
        props: {
            data,
        },
    };
}
