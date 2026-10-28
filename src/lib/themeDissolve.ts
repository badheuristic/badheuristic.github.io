// Tile size, in px.
const CELL = 48
// How long one tile takes to grow in, and how long the ripple takes to cross the screen
// from the click to the farthest corner, in seconds.
const FLIP = 0.28
const SPREAD = 0.5

const easeOut = (t: number) => 1 - (1 - t) ** 2

/**
 * Runs `apply` (which switches the theme) as a square-tile dissolve. A view transition
 * snapshots the page before and after; the new snapshot, which the browser layers on top,
 * shows only through a grid of squares that grow from their centers in a ripple spreading
 * from (x, y). The clip is a `path()` rebuilt each frame: plain geometry, applied the
 * frame it's set (a mask image would load asynchronously).
 *
 * Reduced motion gets a plain crossfade; browsers without view transitions switch instantly.
 */
export function dissolveTheme(apply: () => void, x: number, y: number) {
  if (!document.startViewTransition) {
    apply()
    return
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.startViewTransition(apply)
    return
  }

  const total = SPREAD + FLIP
  // No crossfade; the new snapshot is held for the whole dissolve (a transition ends when
  // its animations do).
  const base = `
    ::view-transition-old(root) { mix-blend-mode: normal; animation: none; }
    ::view-transition-new(root) { mix-blend-mode: normal; animation: theme-dissolve-hold ${total}s linear both; }
    @keyframes theme-dissolve-hold { to { opacity: 1; } }`
  const hidden = '::view-transition-new(root) { visibility: hidden; }'
  const style = document.createElement('style')
  // Hidden until the first tiles appear, so the new theme doesn't flash in whole first.
  style.textContent = base + hidden
  document.head.append(style)

  const transition = document.startViewTransition(apply)
  let frame = 0

  transition.ready.then(() => {
    const width = window.innerWidth
    const height = window.innerHeight
    const cols = Math.ceil(width / CELL)
    const rows = Math.ceil(height / CELL)
    const farthest = Math.max(
      Math.hypot(x, y),
      Math.hypot(width - x, y),
      Math.hypot(x, height - y),
      Math.hypot(width - x, height - y),
    )
    const start = performance.now()

    const draw = () => {
      const t = (performance.now() - start) / 1000
      let path = ''
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cx = col * CELL + CELL / 2
          const cy = row * CELL + CELL / 2
          const delay = (Math.hypot(cx - x, cy - y) / farthest) * SPREAD
          const progress = Math.min(Math.max((t - delay) / FLIP, 0), 1)
          if (progress <= 0) continue
          // Tiles grow slightly past their cell, so neighbours close up without hairline
          // seams instead of lingering a pixel apart through the end of the easing.
          const size = Math.min(CELL + 1, (CELL + 4) * easeOut(progress))
          path += `M${cx - size / 2} ${cy - size / 2}h${size}v${size}h${-size}Z`
        }
      }
      style.textContent = base + (path ? `::view-transition-new(root) { clip-path: path("${path}"); }` : hidden)
      if (t < total) frame = requestAnimationFrame(draw)
    }
    draw()
  })

  transition.finished.finally(() => {
    cancelAnimationFrame(frame)
    style.remove()
  })
}
