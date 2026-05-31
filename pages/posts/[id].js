import { useRef } from 'react'
import Head from 'next/head'

import Layout from '../../components/layout'
import Date from '../../components/date'
import { getAllPostIds, getPostData, getSortedPostsData } from '../../lib/posts'
import Footer from '../../components/Footer'
import ShareButtons from '../../components/ShareButtons'
import TableOfContents from '../../components/TableOfContents'
import ViewCounter from '../../components/ViewCounter'
import RelatedProjects from '../../components/RelatedProjects'
import Lightbox from '../../components/Lightbox'
import useScrollReveal from '../../lib/useScrollReveal'
import { postScreenshots } from '../../lib/screenshots'

import utilStyles from '../../styles/utils.module.css'

export default function Post({ postData, allPosts }) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ahmadayman.vercel.app'
    const url = `${origin}/posts/${postData.id}`
    const articleRef = useScrollReveal()
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": postData.title,
        "datePublished": postData.date,
        "author": {
            "@type": "Person",
            "name": "Ahmad Ayman",
        },
        "description": postData.contentHtml?.replace(/<[^>]*>/g, '').slice(0, 200),
    };

    return (
        <>
            <Layout>
                <Head>
                    <title>{postData.title} - Ahmad Ayman</title>
                    <meta name="description" content={postData.contentHtml?.replace(/<[^>]*>/g, '').slice(0, 160) || postData.title} />
                    <meta property="og:title" content={`${postData.title} - Ahmad Ayman`} />
                    <meta property="og:type" content="article" />
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                    />
                </Head>
                <article className="article" ref={articleRef}>
                    <h1 className={utilStyles.headingXl}>{postData.title}</h1>
                    <div className={utilStyles.lightText}>
                        <Date dateString={postData.date} />
                        {postData.readingTime && <span> · {postData.readingTime} min read</span>}
                        <span> · </span>
                        <ViewCounter path={`/posts/${postData.id}`} />
                    </div>
                    <div className="content-with-toc">
                        <div className="content" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
                        <TableOfContents headings={postData.headings || []} />
                    </div>
                    <Lightbox images={postScreenshots[postData.id]} postId={postData.id} />
                    <ShareButtons url={url} title={postData.title} />
                    <RelatedProjects
                        currentId={postData.id}
                        tags={postData.tags}
                        allPosts={allPosts}
                    />
                </article>
            </Layout>
            <Footer />
        </>
    )
}

export async function getStaticPaths() {
    const paths = getAllPostIds()
    return {
        paths, 
        fallback: false
    }
}

export async function getStaticProps({ params }) {
    const postData = await getPostData(params.id);
    const allPosts = await getSortedPostsData();
    return {
        props: {
            postData,
            allPosts,
        }
    }
}