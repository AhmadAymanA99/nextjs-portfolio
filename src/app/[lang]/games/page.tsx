import GamesHub from '@/components/games/GamesHub'
import { DetailLayout } from '@/components/layout/PageLayout'
import { alternates, getDictionary, isLocale } from '@/i18n'

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const { games, meta } = getDictionary(lang)
  const title = `${games.metaTitle}${meta.titleSuffix}`
  return {
    title,
    description: games.metaDescription,
    openGraph: { title, description: games.metaDescription },
    alternates: alternates(lang, '/games'),
  }
}

export default function GamesPage() {
  return (
    <DetailLayout>
      <GamesHub />
    </DetailLayout>
  )
}
