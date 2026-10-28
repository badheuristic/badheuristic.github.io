import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { site } from '../../content/site'
import { useActiveSection } from '../../hooks/useActiveSection'
import styles from './Intro.module.css'
import { INTRO_SLOT } from './slots'

/**
 * The Home intro, held in place while the page scrolls on, dimmed outside Home. When
 * About's lead (the same text) scrolls up to it, it lights up again and rides along
 * with About from then on, so it reads as the one paragraph moving into About.
 *
 * Publishes `--intro-band` on <html>: the height of the screen's bottom band the text
 * rests in, so sections in between (Projects) can keep their content above it.
 */
export function FixedIntro() {
  const ref = useRef<HTMLParagraphElement>(null)
  const onHome = useActiveSection() === 'home'
  const onHomeRef = useRef(onHome)

  useEffect(() => {
    onHomeRef.current = onHome
  }, [onHome])

  useEffect(() => {
    const el = ref.current!
    const home = document.getElementById(INTRO_SLOT.home)!
    const about = document.getElementById(INTRO_SLOT.about)!
    let last = ''
    const update = () => {
      const homeRect = home.getBoundingClientRect()
      const aboutTop = about.getBoundingClientRect().top
      // Where the text rests: its spot in Home with the page scrolled to the top.
      const rest = homeRect.top + window.scrollY
      const attached = aboutTop <= rest
      const band = window.innerHeight - rest
      const state = `${homeRect.left}|${homeRect.width}|${Math.min(rest, aboutTop)}|${attached || onHomeRef.current}|${band}`
      if (state === last) return
      last = state
      document.documentElement.style.setProperty('--intro-band', `${band}px`)
      el.style.width = `${homeRect.width}px`
      el.style.transform = `translate3d(${homeRect.left}px, ${Math.min(rest, aboutTop)}px, 0)`
      el.dataset.lit = String(attached || onHomeRef.current)
    }
    update()
    gsap.ticker.add(update)
    return () => gsap.ticker.remove(update)
  }, [])

  return (
    <p ref={ref} className={`${styles.text} ${styles.fixed}`} aria-hidden="true">
      {site.intro}
    </p>
  )
}
