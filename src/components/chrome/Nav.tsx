import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sections } from '../../content/sections'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import styles from './Nav.module.css'

gsap.registerPlugin(Flip)

type Layout = 'center' | 'rail'
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
 * True while the page is near the top of Home. The nav leaves the center early,
 * before Projects becomes the active section, so it never floats over the cards.
 */
function useAtTop() {
  const [atTop, setAtTop] = useState(true)
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: '#home',
      start: 'top bottom',
      end: 'bottom 75%',
      onToggle: (self) => setAtTop(self.isActive),
    })
    return () => trigger.kill()
  }, [])
  return atTop
}

/**
 * Section nav. Centered on Home, a rail on the right edge everywhere else.
 * The active item's highlight stretches to cover the next item, then lets go of
 * the old one (a square take on the gooey pill in the mockups).
 */
export function Nav() {
  const active = useActiveSection()
  const reducedMotion = useReducedMotion()
  const layout: Layout = useAtTop() ? 'center' : 'rail'

  const navRef = useRef<HTMLElement>(null)
  const highlightRef = useRef<HTMLSpanElement>(null)
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>())
  const shown = useRef<{ layout: Layout; active: string } | null>(null)
  // Where the highlight is heading, so a stretch can start from there if interrupted.
  const highlightRect = useRef<Rect | null>(null)

  useLayoutEffect(() => {
    const nav = navRef.current!
    const highlight = highlightRef.current!
    const target = () => rectOf(linkRefs.current.get(active)!)
    const snap = () => {
      gsap.killTweensOf(highlight)
      highlightRect.current = target()
      gsap.set(highlight, highlightRect.current)
    }
    const previous = shown.current
    shown.current = { layout, active }

    if (!previous || reducedMotion) {
      nav.dataset.layout = layout
      snap()
      return
    }

    if (previous.layout !== layout) {
      // Record where everything is, switch layouts, then animate from the old spots.
      const state = Flip.getState([...linkRefs.current.values(), highlight])
      nav.dataset.layout = layout
      snap()
      Flip.from(state, { duration: 0.7, ease: 'power3.inOut' })
      return
    }

    if (previous.active !== active) {
      const from = highlightRect.current ?? rectOf(highlight)
      const to = target()
      highlightRect.current = to
      gsap.killTweensOf(highlight)
      gsap
        .timeline()
        .to(highlight, { ...union(from, to), duration: 0.22, ease: 'power2.in' })
        .to(highlight, { ...to, duration: 0.3, ease: 'power3.out' })
    }
  }, [layout, active, reducedMotion])

  // Keep the highlight on its item when sizes change (resize, fonts loading).
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => {
      const link = linkRefs.current.get(shown.current?.active ?? 'home')
      if (!link || Flip.isFlipping(highlightRef.current!)) return
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
