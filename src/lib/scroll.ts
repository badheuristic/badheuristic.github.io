import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

let lenis: Lenis | null = null

/**
 * Starts inertial smooth scrolling for the page. Skipped when the visitor
 * prefers reduced motion; everything then falls back to native scrolling.
 * Returns a cleanup function.
 */
export function initScroll() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  // `anchors` makes in-page links (#about etc.) glide instead of jumping.
  const instance = new Lenis({ autoRaf: true, anchors: true })
  lenis = instance

  return () => {
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
