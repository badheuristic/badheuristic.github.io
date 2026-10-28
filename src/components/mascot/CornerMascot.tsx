import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { HOME_MASCOT_ID } from './HomeMascot'
import { LazyMascot } from './LazyMascot'
import styles from './CornerMascot.module.css'

const HIDDEN = { x: '25%', y: '110%', rotation: 0, scale: 1, autoAlpha: 0 }

/**
 * The mascot's fixed spot in the bottom-right corner. Once the Home mascot has
 * scrolled out of view, this one peeks in from the corner, then comes all the way
 * out. Scrolling back to Home makes it pop and vanish, leaving the Home one.
 */
export function CornerMascot() {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const el = ref.current!
    gsap.set(el, HIDDEN)
    let timeline: gsap.core.Timeline | null = null

    const appear = () => {
      timeline?.kill()
      if (reducedMotion) {
        gsap.set(el, { x: 0, y: 0, autoAlpha: 1 })
        return
      }
      timeline = gsap
        .timeline()
        .set(el, { ...HIDDEN, autoAlpha: 1 })
        // Peek: just the top of the head, leaning in from the corner.
        .to(el, { x: '18%', y: '58%', rotation: -14, duration: 0.5, ease: 'power2.out' })
        .to(el, { x: 0, y: 0, rotation: 0, duration: 0.6, ease: 'back.out(1.6)' }, '+=0.4')
    }

    const pop = () => {
      timeline?.kill()
      if (reducedMotion) {
        gsap.set(el, HIDDEN)
        return
      }
      timeline = gsap
        .timeline()
        .to(el, { scale: 1.15, duration: 0.1, ease: 'power1.out' })
        .to(el, { scale: 0, autoAlpha: 0, duration: 0.18, ease: 'power2.in' })
        .set(el, HIDDEN)
    }

    // Shown once the Home mascot has scrolled out of view above the viewport. An
    // IntersectionObserver tracks the slot's real position, so it can't go stale when
    // the layout shifts (fonts loading, sections resizing) the way measured scroll
    // offsets can.
    let shown = false
    const observer = new IntersectionObserver(([entry]) => {
      const passed = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0
      if (passed === shown) return
      shown = passed
      if (passed) appear()
      else pop()
    })
    observer.observe(document.getElementById(HOME_MASCOT_ID)!)

    return () => {
      observer.disconnect()
      timeline?.kill()
    }
  }, [reducedMotion])

  return (
    <div className={styles.corner}>
      <div ref={ref} className={styles.mascot}>
        <LazyMascot />
      </div>
    </div>
  )
}
