import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import type { ScrollTrigger } from 'gsap/ScrollTrigger'
import { site } from '../../content/site'
import { isNativeScroll, scrollTo } from '../../lib/scroll'
import styles from './ContactOverlay.module.css'

// How far through the contact spacer the card counts as open (interactive).
const OPEN_AT = 0.85
// With native scrolling, once scrolling has been still this long (and no finger is down),
// a half-raised card settles open or closed, whichever is nearer.
const SETTLE_AFTER_MS = 200

/**
 * Contact card that rises from below the viewport to its center as you scroll
 * through the spacer at the end of the page, dimming the page behind it.
 * Scrolling back up lowers it again.
 */
export function ContactOverlay() {
  const scrimRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<ScrollTrigger | null>(null)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const scrim = scrimRef.current!
    const card = cardRef.current!
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: '#contact',
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => setOpen(self.progress >= OPEN_AT),
      },
    })
    timeline
      .fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none', duration: 1 }, 0)
      // Arrives a little before the end of the page, so it rests at center.
      .fromTo(
        card,
        { y: () => window.innerHeight / 2 + card.offsetHeight / 2 },
        { y: 0, ease: 'power1.out', duration: 0.9 },
        0,
      )
    triggerRef.current = timeline.scrollTrigger ?? null

    // Section stepping does this on desktop; native scrolling (touch) needs it here.
    let settleTimer = 0
    let touching = false
    const settle = () => {
      const trigger = triggerRef.current
      if (!trigger || touching || !isNativeScroll()) return
      if (trigger.progress > 0.02 && trigger.progress < 0.98) {
        scrollTo(trigger.progress >= 0.5 ? trigger.end : trigger.start)
      }
    }
    const onScroll = () => {
      clearTimeout(settleTimer)
      settleTimer = window.setTimeout(settle, SETTLE_AFTER_MS)
    }
    const onTouchStart = () => {
      touching = true
    }
    const onTouchEnd = () => {
      touching = false
      onScroll()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      clearTimeout(settleTimer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      timeline.scrollTrigger?.kill()
      timeline.kill()
    }
  }, [])

  // Lower the card by scrolling back to where it starts rising (the end of About).
  const close = () => {
    if (triggerRef.current) scrollTo(triggerRef.current.start)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.contact.email)
      setCopied(true)
    } catch {
      window.location.href = `mailto:${site.contact.email}`
    }
  }

  return (
    <div className={styles.overlay} data-open={open}>
      <div ref={scrimRef} className={styles.scrim} onClick={close} />
      <div
        ref={cardRef}
        className={styles.card}
        role="dialog"
        aria-label="Contact"
        aria-hidden={!open}
        inert={!open}
      >
        <ul className={styles.links}>
          <li>
            <button type="button" className={styles.row} onClick={copyEmail}>
              <span className={styles.label}>Email</span>
              <span className={styles.detail} aria-live="polite">
                {copied ? 'copied' : site.contact.email}
              </span>
            </button>
          </li>
          {site.contact.links.map(({ label, href }) => (
            <li key={label}>
              <a className={styles.row} href={href} target="_blank" rel="noreferrer">
                <span className={styles.label}>{label}</span>
                <span className={styles.detail} aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
