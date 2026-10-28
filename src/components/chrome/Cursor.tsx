import { useEffect, useRef, useState } from 'react'
import styles from './Cursor.module.css'

// Fraction of the remaining distance the trail covers per 60fps frame.
const TRAIL_FOLLOW = 0.15

const FINE_POINTER = '(hover: hover) and (pointer: fine)'

/**
 * Circle cursor with a fainter circle trailing behind it.
 * Only on devices with a mouse; touch keeps the platform behavior.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(() => matchMedia(FINE_POINTER).matches)
  const dotRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const query = matchMedia(FINE_POINTER)
    const onChange = () => setEnabled(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const dot = dotRef.current!
    const trail = trailRef.current!

    const target = { x: 0, y: 0 }
    const trailPos = { x: 0, y: 0 }
    let visible = false
    let frame = 0
    let last = performance.now()

    const setVisible = (value: boolean) => {
      visible = value
      dot.dataset.visible = trail.dataset.visible = String(value)
    }

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      if (!visible) {
        // Appear in place instead of sliding in from the last known spot.
        trailPos.x = target.x
        trailPos.y = target.y
        setVisible(true)
      }
    }
    const onLeave = () => setVisible(false)

    const tick = (now: number) => {
      const dt = Math.min((now - last) / (1000 / 60), 4)
      last = now
      const follow = 1 - Math.pow(1 - TRAIL_FOLLOW, dt)
      trailPos.x += (target.x - trailPos.x) * follow
      trailPos.y += (target.y - trailPos.y) * follow
      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`
      trail.style.transform = `translate3d(${trailPos.x}px, ${trailPos.y}px, 0)`
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', onLeave)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div ref={trailRef} className={styles.trail} aria-hidden="true" />
      <div ref={dotRef} className={styles.dot} aria-hidden="true" />
    </>
  )
}
