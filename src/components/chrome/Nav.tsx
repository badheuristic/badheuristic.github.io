import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { sections } from '../../content/sections'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import styles from './Nav.module.css'

type Rect = { x: number; y: number; width: number; height: number }

function rectOf(el: HTMLElement): Rect {
  return { x: el.offsetLeft, y: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight }
}

function union(a: Rect, b: Rect): Rect {
  const x = Math.min(a.x, b.x)
  const y = Math.min(a.y, b.y)
  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  }
}

/**
 * Section nav, fixed to the right edge. The active item's highlight stretches to
 * cover the next item, then lets go of the old one (a square take on the gooey
 * pill in the mockups).
 */
export function Nav() {
  const active = useActiveSection()
  const reducedMotion = useReducedMotion()

  const navRef = useRef<HTMLElement>(null)
  const highlightRef = useRef<HTMLSpanElement>(null)
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>())
  const shown = useRef<string | null>(null)
  // Where the highlight is heading, so a stretch can start from there if interrupted.
  const highlightRect = useRef<Rect | null>(null)

  useLayoutEffect(() => {
    const highlight = highlightRef.current!
    const to = rectOf(linkRefs.current.get(active)!)
    const previous = shown.current
    shown.current = active
    gsap.killTweensOf(highlight)

    if (!previous || reducedMotion) {
      highlightRect.current = to
      gsap.set(highlight, to)
      return
    }

    const from = highlightRect.current ?? rectOf(highlight)
    highlightRect.current = to
    gsap
      .timeline()
      .to(highlight, { ...union(from, to), duration: 0.22, ease: 'power2.in' })
      .to(highlight, { ...to, duration: 0.3, ease: 'power3.out' })
  }, [active, reducedMotion])

  // Keep the highlight on its item when sizes change (resize, fonts loading).
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => {
      const link = linkRefs.current.get(shown.current ?? 'home')
      if (!link) return
      gsap.killTweensOf(highlightRef.current)
      highlightRect.current = rectOf(link)
      gsap.set(highlightRef.current, highlightRect.current)
    })
    observer.observe(navRef.current!)
    return () => observer.disconnect()
  }, [])

  return (
    <nav ref={navRef} className={styles.nav} aria-label="Sections">
      <div className={styles.list}>
        <span ref={highlightRef} className={styles.highlight} aria-hidden="true" />
        <ul className={styles.items}>
          {sections.map(({ id, label }) => (
            <li key={id}>
              <a
                ref={(el) => {
                  if (el) linkRefs.current.set(id, el)
                  else linkRefs.current.delete(id)
                }}
                href={`#${id}`}
                className={styles.link}
                aria-current={id === active ? 'true' : undefined}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
