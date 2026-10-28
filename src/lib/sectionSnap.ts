import type Lenis from 'lenis'
import { sections } from '../content/sections'
import { createWheelGestures } from './wheelGesture'

// A gesture that starts within this fraction of the viewport from a tall section's edge
// skips the stop at the edge and goes straight on to the next section.
const EDGE_SNAP = 0.15
// Sections taller than the viewport by more than this scroll freely inside.
const FREE_ZONE_MIN_PX = 40
const KEY_STEP_PX = 120

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)

/** How every section-to-section move glides: scroll gestures, nav links, closing contact. */
export const GLIDE = { duration: 0.4, easing: easeInOutCubic, lock: true }

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
 * that reaches their edge stops there, and the next one moves on (straight on, if it
 * starts close to the edge).
 *
 * Returns Lenis's `virtualScroll` handler and a cleanup for the keyboard listener.
 */
export function createSectionSnap(getLenis: () => Lenis | null) {
  let gesture = 0
  let spentGesture = -1
  const isNewWheelGesture = createWheelGestures()
  let snapping = false
  // Scroll position where the current gesture began.
  let originGesture = -1
  let origin = 0

  const snapTo = (lenis: Lenis, target: number) => {
    snapping = true
    lenis.scrollTo(target, {
      ...GLIDE,
      onComplete: () => {
        snapping = false
      },
    })
  }

  /** Handles one step of input. Returns true when Lenis should scroll freely. */
  const step = (lenis: Lenis, delta: number) => {
    // `isLocked` covers glides started elsewhere (nav links); input waits them out.
    if (snapping || lenis.isLocked || spentGesture === gesture) return false
    const dir = Math.sign(delta)
    const y = lenis.targetScroll
    if (originGesture !== gesture) {
      originGesture = gesture
      origin = y
    }
    const { stops, zones } = layout(lenis)

    // Where to look for the next stop from. Past a tall section's edge when close to it.
    let from = y
    const zone = zones.find((z) => y >= z.start - 1 && y <= z.end + 1)
    if (zone) {
      const edge = dir > 0 ? zone.end : zone.start
      const toEdge = Math.abs(edge - y)
      const startedNearEdge = Math.abs(edge - origin) <= window.innerHeight * EDGE_SNAP
      if (toEdge > 1 && !startedNearEdge) {
        if (Math.abs(delta) < toEdge) return true
        // This gesture would cross the zone's edge: stop at the edge instead.
        spentGesture = gesture
        lenis.scrollTo(edge)
        return false
      }
      // Close enough to the edge: carry on past it to the next section.
      from = edge
    }

    const target =
      dir > 0 ? stops.find((s) => s > from + 1) : stops.findLast((s) => s < from - 1)
    if (target !== undefined) {
      spentGesture = gesture
      snapTo(lenis, target)
    }
    return false
  }

  const virtualScroll = ({
    deltaX,
    deltaY,
    event,
  }: {
    deltaX: number
    deltaY: number
    event: WheelEvent | TouchEvent
  }) => {
    const lenis = getLenis()
    if (!lenis || event.ctrlKey) return true

    if (event.type === 'touchstart') {
      gesture++
      return true
    }
    // Speed spikes only count between glides: mid-glide they're the same flick's tail.
    if (event.type === 'wheel' && isNewWheelGesture(deltaY, !snapping)) gesture++
    if (deltaY === 0) return true
    // Mostly sideways swipes belong to horizontal controls (dragging the project stack).
    if (event.type.startsWith('touch') && Math.abs(deltaX) > Math.abs(deltaY)) return false

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
