import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { FaPlus, FaMinus, FaExpand, FaCompress } from 'react-icons/fa6'
import styles from '../styles/Lightbox.module.css'

const MIN_SCALE = 0.5
const MAX_SCALE = 5
const ZOOM_STEP = 1.5

export default function Lightbox({ images, postId }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [fullscreen, setFullscreen] = useState(false)
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const posRef = useRef({ x: 0, y: 0 })
  const overlayRef = useRef(null)

  const close = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen()
    setOpen(false)
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setFullscreen(false)
  }, [])

  const resetZoom = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') { close(); return }
      if (e.key === 'ArrowRight') changeImage(1)
      if (e.key === 'ArrowLeft') changeImage(-1)
    }
    const fsHandler = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('keydown', handler)
    document.addEventListener('fullscreenchange', fsHandler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.removeEventListener('fullscreenchange', fsHandler)
      document.body.style.overflow = ''
    }
  }, [open])

  const toggleFullscreen = useCallback((e) => {
    e.stopPropagation()
    if (!document.fullscreenElement) {
      overlayRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen()
    }
  }, [])

  const changeImage = useCallback((dir) => {
    setIndex(i => {
      const next = i + dir
      return next < 0 ? 0 : next >= images.length ? images.length - 1 : next
    })
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [images?.length])

  const prev = useCallback((e) => {
    e.stopPropagation()
    changeImage(-1)
  }, [changeImage])

  const next = useCallback((e) => {
    e.stopPropagation()
    changeImage(1)
  }, [changeImage])

  const zoomIn = useCallback((e) => {
    e?.stopPropagation()
    setScale(s => Math.min(s * ZOOM_STEP, MAX_SCALE))
  }, [])

  const zoomOut = useCallback((e) => {
    e?.stopPropagation()
    setScale(s => {
      const next = s / ZOOM_STEP
      if (next < MIN_SCALE) {
        setPosition({ x: 0, y: 0 })
        return MIN_SCALE
      }
      return next
    })
  }, [])

  const handleWheel = useCallback((e) => {
    if (e.deltaY < 0) setScale(s => Math.min(s * ZOOM_STEP, MAX_SCALE))
    else setScale(s => {
      const next = s / ZOOM_STEP
      if (next < MIN_SCALE) {
        setPosition({ x: 0, y: 0 })
        return MIN_SCALE
      }
      return next
    })
  }, [])

  const handleMouseDown = useCallback((e) => {
    if (scale <= 1) return
    dragging.current = true
    posRef.current = { ...position }
    dragStart.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.style.cursor = 'grabbing'
  }, [scale, position])

  const handleMouseMove = useCallback((e) => {
    if (!dragging.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setPosition({ x: posRef.current.x + dx, y: posRef.current.y + dy })
  }, [])

  const handleMouseUp = useCallback((e) => {
    if (!dragging.current) return
    dragging.current = false
    e.currentTarget.style.cursor = scale > 1 ? 'grab' : 'default'
  }, [scale])

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation()
    if (scale > 1) resetZoom()
    else setScale(3)
  }, [scale, resetZoom])

  const handleThumbClick = useCallback((i) => {
    setIndex(i)
    setOpen(true)
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  if (!images || images.length === 0) return null

  return (
    <div className={styles.gallery}>
      <h3 className={styles.title}>Screenshots</h3>
      <div className={styles.thumbs}>
        {images.map((src, i) => (
          <button
            key={i}
            className={styles.thumb}
            onClick={() => handleThumbClick(i)}
            aria-label={`View screenshot ${i + 1}`}
          >
            <Image src={src} alt={`Screenshot ${i + 1} of ${postId}`} width={120} height={80} />
          </button>
        ))}
      </div>

      {open && typeof document === 'object' && createPortal(
        <div className={styles.overlay} ref={overlayRef} onClick={close} role="dialog" aria-modal="true" aria-label="Image viewer">
          <button className={styles.close} onClick={close} aria-label="Close">&times;</button>

          {images.length > 1 && (
            <>
              <button className={`${styles.nav} ${styles.prev}`} onClick={prev} disabled={index === 0} aria-label="Previous image">‹</button>
              <button className={`${styles.nav} ${styles.next}`} onClick={next} disabled={index === images.length - 1} aria-label="Next image">›</button>
            </>
          )}

          <div
            className={styles.imageWrapper}
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            style={{
              cursor: scale > 1 ? 'grab' : 'default',
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
          >
            <Image
              className={styles.full}
              src={images[index]}
              alt={`Screenshot ${index + 1} of ${postId}`}
              width={0}
              height={0}
              sizes="90vw"
              unoptimized
              priority
              draggable={false}
            />
          </div>

          <div className={styles.bottomBar}>
            <div className={styles.barGroup}>
              <button onClick={zoomIn} aria-label="Zoom in"><FaPlus /></button>
              <button onClick={toggleFullscreen} aria-label="Toggle fullscreen">
                {fullscreen ? <FaCompress /> : <FaExpand />}
              </button>
              <button onClick={zoomOut} aria-label="Zoom out"><FaMinus /></button>
              <span className={styles.barDivider} />
              <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>
            </div>
            {images.length > 1 && (
              <span className={styles.pagination}>{index + 1} / {images.length}</span>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}