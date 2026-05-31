import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import BackToTop from "./BackToTop";

import styles from "./layout.module.css";
import utilStyles from "../styles/utils.module.css";

const name = "Ahmad Ayman";
export const siteTitle = "Ahmad Ayman Portfolio";

export default function Layout({ children, home }) {
    return (
        <div className={styles.container}>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Software Engineer specializing in React, Next.js, and full-stack development" />
                <meta property="og:image" content={`https://og-image.vercel.app/${encodeURI(siteTitle)}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`} />
                <meta property="og:title" content={siteTitle} />
                <meta property="og:description" content="Software Engineer specializing in React, Next.js, and full-stack development" />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>
            <header className={styles.header}>
                {home ? (
                    <>
                        <Image priority src="/images/profile.png" className={utilStyles.borderCircle} height={200} width={200} alt={name} />
                        <h1 className={utilStyles.heading2Xl}>{name}</h1>
                    </>
                ) : (
                    <>
                        <Link href="/">
                            <Image priority src="/images/profile.png" className={utilStyles.borderCircle} height={100} width={100} alt={name} />
                        </Link>
                        <h2 className={utilStyles.headingLg}>
                            <Link href="/" className={utilStyles.colorInherit}>
                                {name}
                            </Link>
                        </h2>
                    </>
                )}
            </header>
            {!home && (
                <div className={styles.backToHome}>
                    <Link href="/">← Back to home</Link>
                </div>
            )}
            <main id="main-content">{children}</main>
            <BackToTop />
        </div>
    );
}
