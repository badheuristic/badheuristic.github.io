import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createSectionSnap } from './sectionSnap'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

/**
 * Starts smooth, section-to-section scrolling for the page (see sectionSnap.ts),
 * driven by GSAP's ticker so ScrollTrigger stays in sync with it. Skipped when the
 * visitor prefers reduced motion; everything then falls back to native scrolling.
 * Returns a cleanup function.
 */
export function initScroll() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const snap = createSectionSnap(() => lenis)
  // `anchors` makes in-page links (#about etc.) glide instead of jumping. `syncTouch`
  // routes swipes through Lenis too, so they snap between sections like the wheel.
  const instance = new Lenis({ anchors: true, syncTouch: true, virtualScroll: snap.virtualScroll })
  lenis = instance

  const raf = (time: number) => instance.raf(time * 1000)
  instance.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(raf)
    snap.destroy()
    instance.destroy()
    if (lenis === instance) lenis = null
  }
}

export function scrollTo(target: number | string | HTMLElement) {
  if (lenis) {
    lenis.scrollTo(target)
    return
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: target })
  } else {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    el?.scrollIntoView()
  }
}
