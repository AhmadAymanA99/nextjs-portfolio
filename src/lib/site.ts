export const siteUrl = 'https://ahmad-ayman.vercel.app'

export const siteName = 'Ahmad Ayman'

/** Link preview image (see app/api/og): the home card, or an article's card */
export function ogImageUrl(lang: string, article?: string) {
  const params = new URLSearchParams({ lang, ...(article && { article }) })
  return `${siteUrl}/api/og?${params}`
}

export const siteDescription =
  'Frontend and mobile engineer with 6 years of experience building React, Next.js, React Native, and TypeScript apps for travel, healthcare, e-commerce, and government platforms across the MENA region.'

const cvUrl = '/Ahmad_Ayman_CV.pdf'

export function getCvUrl() {
  return cvUrl
}
