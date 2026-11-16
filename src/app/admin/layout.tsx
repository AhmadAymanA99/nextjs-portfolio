import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import RootDocument from '../root-document'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
  icons: { icon: '/favicon.svg?v=2' },
}

// The admin area is a separate root layout, in English only
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>
}
