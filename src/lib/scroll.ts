import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { appReady } from './ready'
import { createSectionSnap, GLIDE } from './sectionSnap'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

// Touch-first devices (phones, tablets) keep native scrolling: momentum and rubber-banding
// as people expect, with gentle CSS snapping (global.css) instead of section stepping.
const TOUCH = '(hover: none) and (pointer: coarse)'
const smooth = () => !matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Starts smooth, section-to-section scrolling for the page (see sectionSnap.ts),
 * driven by GSAP's ticker so ScrollTrigger stays in sync with it. Skipped on touch
 * devices and when the visitor prefers reduced motion; those keep native scrolling.
 * Returns a cleanup function.
 */
export function initScroll() {
  if (!smooth() || matchMedia(TOUCH).matches) return () => {}

  const snap = createSectionSnap(() => lenis)
  // `syncTouch` routes swipes through Lenis too, so they snap like the wheel.
  // `wheelMultiplier` speeds up free scrolling inside tall sections (About).
  const instance = new Lenis({
    syncTouch: true,
    wheelMultiplier: 1.4,
    virtualScroll: snap.virtualScroll,
  })
  lenis = instance
  // No scrolling behind the loader.
  instance.stop()
  appReady.then(() => instance.start())

  const raf = (time: number) => instance.raf(time * 1000)
  instance.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  // In-page links (#about etc.) glide the same way scrolling does. Handled here rather
  // than with Lenis's `anchors` option, which let the browser jump to the target for a
  // moment first; the section tracker saw the jump and the nav highlight bounced.
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
    const target = link && document.querySelector(link.hash || 'body')
    if (!target) return
    e.preventDefault()
    instance.scrollTo(target as HTMLElement, GLIDE)
  }
  document.addEventListener('click', onClick)

  // Re-measure every ScrollTrigger when the page's size changes (fonts loading, content
  // changing). Otherwise their start/end offsets go stale until the window is resized.
  let refreshFrame = 0
  const sizeObserver = new ResizeObserver(() => {
    cancelAnimationFrame(refreshFrame)
    refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh())
  })
  sizeObserver.observe(document.body)

  return () => {
    sizeObserver.disconnect()
    cancelAnimationFrame(refreshFrame)
    document.removeEventListener('click', onClick)
    gsap.ticker.remove(raf)
    snap.destroy()
    instance.destroy()
    if (lenis === instance) lenis = null
  }
}

export function scrollTo(target: number | string | HTMLElement) {
  if (lenis) {
    lenis.scrollTo(target, GLIDE)
    return
  }
  const behavior = smooth() ? 'smooth' : 'auto'
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior })
  } else {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    el?.scrollIntoView({ behavior })
  }
}
