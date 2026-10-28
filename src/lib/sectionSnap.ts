import type Lenis from 'lenis'
import { sections } from '../content/sections'

// A pause this long between wheel events starts a new gesture. Trackpad inertia keeps
// firing well within it, so one flick moves one section, not several.
const GESTURE_GAP_MS = 180
// Sections taller than the viewport by more than this scroll freely inside.
const FREE_ZONE_MIN_PX = 40
const SNAP_DURATION = 1.1
const KEY_STEP_PX = 120

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)

type Zone = { start: number; end: number }

function layout(lenis: Lenis) {
  const vh = window.innerHeight
  const stops: number[] = []
  const zones: Zone[] = []
  for (const { id } of sections) {
    const el = document.getElementById(id)
    if (!el) continue
    const start = el.getBoundingClientRect().top + lenis.animatedScroll
    const end = start + el.offsetHeight - vh
    stops.push(Math.min(start, lenis.limit))
    if (end - start > FREE_ZONE_MIN_PX) {
      // Tall section: stop at both its top and its bottom, scroll freely between.
      zones.push({ start, end })
      stops.push(Math.min(end, lenis.limit))
    }
  }
  return { stops: [...new Set(stops)].sort((a, b) => a - b), zones }
}

/**
 * Turns scrolling into section-to-section moves. One gesture (a wheel flick, a swipe,
 * a key press) glides to the next or previous section, the same as clicking it in the
 * nav. Sections taller than the viewport (About) scroll freely inside; the gesture
 * that reaches their edge stops there, and the next one moves on.
 *
 * Returns Lenis's `virtualScroll` handler and a cleanup for the keyboard listener.
 */
export function createSectionSnap(getLenis: () => Lenis | null) {
  let gesture = 0
  let spentGesture = -1
  let lastWheel = 0
  let snapping = false

  const snapTo = (lenis: Lenis, target: number) => {
    snapping = true
    lenis.scrollTo(target, {
      duration: SNAP_DURATION,
      easing: easeInOutCubic,
      lock: true,
      onComplete: () => {
        snapping = false
      },
    })
  }

  /** Handles one step of input. Returns true when Lenis should scroll freely. */
  const step = (lenis: Lenis, delta: number) => {
    if (snapping || spentGesture === gesture) return false
    const dir = Math.sign(delta)
    const y = lenis.targetScroll
    const { stops, zones } = layout(lenis)

    const zone = zones.find((z) => y >= z.start - 1 && y <= z.end + 1)
    if (zone) {
      const next = y + delta
      if (dir > 0 ? next <= zone.end : next >= zone.start) return true
      // This gesture would cross the zone's edge: stop at the edge instead.
      const edge = dir > 0 ? zone.end : zone.start
      if (Math.abs(y - edge) > 1) {
        spentGesture = gesture
        lenis.scrollTo(edge)
        return false
      }
    }

    const target = dir > 0 ? stops.find((s) => s > y + 1) : stops.findLast((s) => s < y - 1)
    if (target !== undefined) {
      spentGesture = gesture
      snapTo(lenis, target)
    }
    return false
  }

  const virtualScroll = ({ deltaY, event }: { deltaY: number; event: WheelEvent | TouchEvent }) => {
    const lenis = getLenis()
    if (!lenis || event.ctrlKey) return true

    if (event.type === 'touchstart') {
      gesture++
      return true
    }
    if (event.type === 'wheel') {
      const now = performance.now()
      if (now - lastWheel > GESTURE_GAP_MS) gesture++
      lastWheel = now
    }
    if (deltaY === 0) return true

    const free = step(lenis, deltaY)
    // Lenis leaves events we claim alone, so stop the browser scrolling them natively.
    if (!free && event.cancelable) event.preventDefault()
    return free
  }

  const onKey = (e: KeyboardEvent) => {
    const lenis = getLenis()
    const target = e.target as HTMLElement | null
    if (!lenis || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
    if (target?.closest('input, textarea, select, [contenteditable="true"]')) return

    const page = window.innerHeight * 0.9
    const deltas: Record<string, number> = {
      ArrowDown: KEY_STEP_PX,
      ArrowUp: -KEY_STEP_PX,
      PageDown: page,
      PageUp: -page,
      ' ': e.shiftKey ? -page : page,
    }
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      snapTo(lenis, e.key === 'Home' ? 0 : lenis.limit)
      return
    }
    const delta = deltas[e.key]
    if (delta === undefined) return
    e.preventDefault()
    gesture++
    if (step(lenis, delta)) lenis.scrollTo(lenis.targetScroll + delta)
  }

  window.addEventListener('keydown', onKey)
  return { virtualScroll, destroy: () => window.removeEventListener('keydown', onKey) }
}
