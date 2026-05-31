import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import styles from '../styles/Lightbox.module.css'

export default function Lightbox({ images, postId }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open || !images) return
    const handler = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') setIndex(i => Math.min(i + 1, images.length - 1))
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(i - 1, 0))
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, images?.length, close])

  if (!images || images.length === 0) return null

  return (
    <div className={styles.gallery}>
      <h3 className={styles.title}>Screenshots</h3>
      <div className={styles.thumbs}>
        {images.map((src, i) => (
          <button
            key={i}
            className={styles.thumb}
            onClick={() => { setIndex(i); setOpen(true) }}
            aria-label={`View screenshot ${i + 1}`}
          >
            <Image src={src} alt={`Screenshot ${i + 1} of ${postId}`} width={120} height={80} />
          </button>
        ))}
      </div>

      {open && (
        <div className={styles.overlay} onClick={close} role="dialog" aria-modal="true" aria-label="Image viewer">
          <button className={styles.close} onClick={close} aria-label="Close">&times;</button>
          {images.length > 1 && (
            <>
              <button
                className={`${styles.nav} ${styles.prev}`}
                onClick={(e) => { e.stopPropagation(); setIndex(i => Math.max(i - 1, 0)) }}
                disabled={index === 0}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                className={`${styles.nav} ${styles.next}`}
                onClick={(e) => { e.stopPropagation(); setIndex(i => Math.min(i + 1, images.length - 1)) }}
                disabled={index === images.length - 1}
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}
          <div className={styles.imageWrapper}>
            <Image
              className={styles.full}
              src={images[index]}
              alt={`Screenshot ${index + 1} of ${postId}`}
              fill
              sizes="90vw"
              priority
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className={styles.counter}>{index + 1} / {images.length}</div>
        </div>
      )}
    </div>
  )
}
