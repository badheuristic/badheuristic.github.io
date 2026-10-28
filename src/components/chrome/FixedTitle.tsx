import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { site } from '../../content/site'
import type { SectionId } from '../../content/sections'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Name } from './Name'
import styles from './FixedTitle.module.css'

type Line = { text: ReactNode; faint?: boolean; small?: boolean }

const TITLES: Record<SectionId, Line[]> = {
  home: [{ text: site.greeting, faint: true, small: true }, { text: <Name /> }],
  projects: [{ text: 'projects', faint: true }],
  about: [{ text: 'about', faint: true }],
  contact: [{ text: 'contact', faint: true }],
}

/** Large title fixed at the bottom left. Its lines slide out and the next section's slide in. */
export function FixedTitle() {
  const active = useActiveSection()
  const reducedMotion = useReducedMotion()
  const [shown, setShown] = useState(active)
  const ref = useRef<HTMLDivElement>(null)
  const mounted = useRef(false)
  // With reduced motion the title swaps instantly instead of waiting for the slide.
  const current = reducedMotion ? active : shown

  // Slide the current lines out, then swap in the new title.
  useLayoutEffect(() => {
    const lines = ref.current!.querySelectorAll('[data-line]')
    if (active === shown) {
      // Settles lines that were partway out if the section flipped back.
      gsap.to(lines, { yPercent: 0, duration: 0.4, ease: 'power3.out' })
      return
    }
    if (reducedMotion) return
    const tween = gsap.to(lines, {
      yPercent: -110,
      duration: 0.3,
      ease: 'power2.in',
      stagger: 0.04,
      onComplete: () => setShown(active),
    })
    return () => {
      tween.kill()
    }
  }, [active, shown, reducedMotion])

  // Slide the new lines in from below.
  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    if (reducedMotion) return
    const lines = ref.current!.querySelectorAll('[data-line]')
    gsap.fromTo(
      lines,
      { yPercent: 110 },
      { yPercent: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06 },
    )
  }, [shown, reducedMotion])

  return (
    <div ref={ref} className={styles.title} aria-hidden="true">
      {TITLES[current].map((line, i) => (
        <span key={`${current}-${i}`} className={`${styles.mask} ${line.small ? styles.small : ''}`}>
          <span data-line className={`${styles.line} ${line.faint ? styles.faint : ''}`}>
            {line.text}
          </span>
        </span>
      ))}
    </div>
  )
}
