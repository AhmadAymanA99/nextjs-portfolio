import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getDictionary, isLocale, type Locale } from '@/i18n'
import { getArticleIds, getSortedArticles } from '@/lib/content/articles'
import { visualArabicWord } from '@/lib/arabicShape'

/**
 * Link preview images (Open Graph, 1200×630) for the home page and articles:
 *   /api/og?lang=en                 name, role and stack
 *   /api/og?lang=ar&article=<id>    the article's title, by the author
 * Unknown values fall back to the home card, so the URL can't be used to
 * render arbitrary text.
 */

const size = { width: 1200, height: 630 }

// Read once per server instance; the files are traced into the deployment
const font = (file: string) => readFile(join(process.cwd(), 'assets/fonts', file))
const assets = Promise.all([
  font('Geist-Regular.ttf'),
  font('Geist-ExtraBold.ttf'),
  font('IBMPlexSansArabic-Regular.ttf'),
  font('IBMPlexSansArabic-Bold.ttf'),
  readFile(join(process.cwd(), 'public/images/profile.png'), 'base64'),
])

const colors = {
  bg: '#0d1117',
  card: '#161b22',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#58a6ff',
}

type Style = Record<string, string | number>

const arabicRe = /[\u0600-\u06FF]/

/**
 * A line of text. The image renderer has no right-to-left layout, so Arabic
 * text is set word by word from the right (which also wraps correctly), each
 * word pre-joined and reversed (see arabicShape.ts).
 */
function Text({ children, style }: { children: string; style: Style }) {
  if (!arabicRe.test(children)) return <div style={{ display: 'flex', ...style }}>{children}</div>
  const fontSize = Number(style.fontSize ?? 32)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        columnGap: Math.round(fontSize * 0.28),
        ...style,
      }}
    >
      {children.split(/\s+/).map((word, i) => (
        <span key={i}>{visualArabicWord(word)}</span>
      ))}
    </div>
  )
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams
  const langParam = params.get('lang') ?? 'en'
  const lang: Locale = isLocale(langParam) ? langParam : 'en'
  const articleId = params.get('article')
  const article =
    articleId && getArticleIds().includes(articleId)
      ? getSortedArticles(lang).find((a) => a.id === articleId)
      : undefined

  const dict = getDictionary(lang)
  const [geist, geistBold, arabic, arabicBold, photo] = await assets
  const rtl = lang === 'ar'
  // Arabic text in IBM Plex Sans Arabic, Latin in Geist (as on the site)
  const fontFamily = rtl ? 'Plex Arabic, Geist' : 'Geist, Plex Arabic'
  // Mirrored for Arabic: photo on the right, text aligned to the right
  const row = rtl ? 'row-reverse' : 'row'
  const start = rtl ? 'flex-end' : 'flex-start'

  const avatar = (px: number) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`data:image/jpeg;base64,${photo}`}
      width={px}
      height={px}
      alt=""
      style={{ borderRadius: px, border: `4px solid ${colors.border}` }}
    />
  )

  const body = article ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: start, flex: 1 }}>
      <Text style={{ fontSize: 30, color: colors.accent, fontWeight: 700 }}>
        {dict.home.writing}
      </Text>
      <Text
        style={{
          marginTop: 24,
          fontSize: article.title.length > 60 ? 56 : 68,
          fontWeight: 700,
          lineHeight: 1.2,
          color: colors.text,
        }}
      >
        {article.title}
      </Text>
      <div style={{ display: 'flex', flex: 1 }} />
      <div style={{ display: 'flex', flexDirection: row, alignItems: 'center', gap: 24 }}>
        {avatar(88)}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: start }}>
          <Text style={{ fontSize: 34, fontWeight: 700, color: colors.text }}>
            {dict.common.name}
          </Text>
          <Text style={{ fontSize: 26, color: colors.muted }}>{dict.home.role}</Text>
        </div>
      </div>
    </div>
  ) : (
    <div style={{ display: 'flex', flexDirection: row, alignItems: 'center', gap: 64, flex: 1 }}>
      {avatar(260)}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: start, flex: 1 }}>
        <Text style={{ fontSize: 84, fontWeight: 700, color: colors.text }}>
          {dict.common.name}
        </Text>
        <Text style={{ marginTop: 8, fontSize: 40, color: colors.accent }}>{dict.home.role}</Text>
        <Text style={{ marginTop: 20, fontSize: 30, color: colors.muted }}>
          React · Next.js · React Native · TypeScript
        </Text>
        <Text style={{ marginTop: 40, fontSize: 26, color: colors.muted }}>
          {dict.home.availability}
        </Text>
      </div>
    </div>
  )

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        padding: 40,
        background: colors.bg,
        fontFamily,
      }}
    >
      <div
        style={{
          display: 'flex',
          flex: 1,
          padding: 64,
          borderRadius: 32,
          background: colors.card,
          border: `2px solid ${colors.border}`,
        }}
      >
        {body}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Geist', data: geist, weight: 400, style: 'normal' },
        { name: 'Geist', data: geistBold, weight: 700, style: 'normal' },
        { name: 'Plex Arabic', data: arabic, weight: 400, style: 'normal' },
        { name: 'Plex Arabic', data: arabicBold, weight: 700, style: 'normal' },
      ],
      headers: {
        // Content changes only on deploy; let the CDN keep it for a day
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  )
}
