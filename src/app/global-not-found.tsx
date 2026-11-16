import type { Metadata } from 'next'
import RootDocument from './root-document'
import NotFound from './[lang]/not-found'

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  robots: { index: false },
}

// URLs outside the language routes (e.g. a mistyped /admin/… path or file)
export default function GlobalNotFound() {
  return (
    <RootDocument lang="en">
      <NotFound />
    </RootDocument>
  )
}
