'use client'

import { useEffect, useState } from 'react'

/** Cairo's current UTC offset: GMT+2, or GMT+3 during Egyptian summer time. */
function getCairoOffset() {
  try {
    return (
      new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Cairo', timeZoneName: 'shortOffset' })
        .formatToParts(new Date())
        .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+2'
    )
  } catch {
    return 'GMT+2'
  }
}

/** The page is statically rendered, so the offset is refreshed in the browser. */
export default function CairoOffset() {
  const [offset, setOffset] = useState(getCairoOffset)
  useEffect(() => setOffset(getCairoOffset()), [])
  return <bdi dir="ltr">{offset}</bdi>
}
