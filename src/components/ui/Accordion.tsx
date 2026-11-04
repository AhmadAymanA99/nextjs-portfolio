'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

interface AccordionItem {
  title: string
  content: ReactNode
}

export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <div
            key={i}
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              overflow: 'hidden',
              background: 'var(--bg-card)',
            }}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                border: 'none',
                background: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'left',
                gap: '0.5rem',
              }}
            >
              {item.title}
              <span
                style={{
                  transform: `rotate(${isOpen ? 180 : 0}deg)`,
                  transition: 'transform 0.2s',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  flexShrink: 0,
                }}
              >
                ▼
              </span>
            </button>
            <div
              style={{
                maxHeight: isOpen ? 500 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
              }}
            >
              <div
                style={{
                  padding: '0 1rem 0.85rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                }}
              >
                {item.content}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
