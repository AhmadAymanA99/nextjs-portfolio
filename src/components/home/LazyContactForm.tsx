'use client'

import dynamic from 'next/dynamic'

// Loaded in the browser after the page, as it's at the bottom
const ContactForm = dynamic(() => import('./ContactForm'), { ssr: false })

export default function LazyContactForm() {
  return <ContactForm />
}
