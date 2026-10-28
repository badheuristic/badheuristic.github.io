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
  // The contact card speaks for itself.
  contact: [],
}

// Distance that puts the whole title, top line included, below the viewport. Every
// line moves by this same amount so they keep their order; per-line distances made
// the top line travel faster and pass through the one below it.
const belowViewport = (title: HTMLElement) => window.innerHeight - title.getBoundingClientRect().top

/**
 * Large title fixed at the bottom left, behind the content. Its lines drop out of
 * the bottom of the viewport and the next section's rise back in from there.
 */
export function FixedTitle() {
  const active = useActiveSection()
  const reducedMotion = useReducedMotion()
  const [shown, setShown] = useState(active)
  const ref = useRef<HTMLDivElement>(null)
  const mounted = useRef(false)
  // With reduced motion the title swaps instantly instead of waiting for the slide.
  const current = reducedMotion ? active : shown

  // Drop the current lines out, then swap in the new title.
  useLayoutEffect(() => {
    const lines = ref.current!.querySelectorAll('[data-line]')
    if (active === shown) {
      // Settles lines left partway out when the section flipped back mid-drop. Lines that
      // were just mounted sit at 0 and are left to the rise-in below; tweening them here
      // too made the two animations fight over the lines.
      const displaced = [...lines].some((line) => Number(gsap.getProperty(line, 'y')) !== 0)
      if (displaced) gsap.to(lines, { y: 0, duration: 0.4, ease: 'power3.out', overwrite: true })
      return
    }
    if (reducedMotion) return
    // Nothing to drop out (Contact has no title): swap straight away.
    if (lines.length === 0) {
      const call = gsap.delayedCall(0, () => setShown(active))
      return () => {
        call.kill()
      }
    }
    const tween = gsap.to(lines, {
      y: belowViewport(ref.current!),
      duration: 0.35,
      ease: 'power2.in',
      stagger: { each: 0.04, from: 'end' },
      overwrite: true,
      onComplete: () => setShown(active),
    })
    return () => {
      tween.kill()
    }
  }, [active, shown, reducedMotion])

  // Raise the new lines in from below the viewport.
  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    const lines = ref.current!.querySelectorAll('[data-line]')
    if (reducedMotion || lines.length === 0) return
    gsap.fromTo(
      lines,
      { y: belowViewport(ref.current!) },
      { y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06, overwrite: true },
    )
  }, [shown, reducedMotion])

  return (
    <div ref={ref} className={styles.title} data-section={current} aria-hidden="true">
      {TITLES[current].map((line, i) => (
        <span
          key={`${current}-${i}`}
          data-line
          className={`${styles.line} ${line.small ? styles.small : ''} ${line.faint ? styles.faint : ''}`}
        >
          {line.text}
        </span>
      ))}
    </div>
  )
}
