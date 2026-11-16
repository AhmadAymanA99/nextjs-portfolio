import { notFound } from 'next/navigation'

// Unknown /admin URLs: render admin/not-found.tsx inside the admin layout
export default function CatchAll() {
  notFound()
}
