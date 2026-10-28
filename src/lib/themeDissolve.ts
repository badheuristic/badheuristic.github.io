// Tile size, in px.
const CELL = 48
// How long one tile takes to shrink away, and how long the ripple takes to cross the
// screen from the click to the farthest corner, in seconds.
const FLIP = 0.28
const SPREAD = 0.5

const easeIn = (t: number) => t * t

/**
 * Runs `apply` (which switches the theme) as a square-tile dissolve. A view transition
 * snapshots the page in the old theme and lays it over the new one; the snapshot is then
 * masked away tile by tile, each square shrinking to its center in a ripple spreading
 * from (x, y). Reduced motion gets a plain crossfade; browsers without view transitions
 * switch instantly.
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
  // Old snapshot on top, held for the whole dissolve (a transition ends when its
  // animations do), with the default crossfade turned off.
  const base = `
    ::view-transition-old(root) { z-index: 1; mix-blend-mode: normal; animation: theme-dissolve-hold ${total}s linear both; }
    ::view-transition-new(root) { mix-blend-mode: normal; animation: none; }
    @keyframes theme-dissolve-hold { to { opacity: 1; } }`
  const style = document.createElement('style')
  style.textContent = base
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
      let rects = ''
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cx = col * CELL + CELL / 2
          const cy = row * CELL + CELL / 2
          const delay = (Math.hypot(cx - x, cy - y) / farthest) * SPREAD
          const progress = Math.min(Math.max((t - delay) / FLIP, 0), 1)
          if (progress >= 1) continue
          // Untouched tiles overlap by a pixel so no seams show between them.
          const size = progress === 0 ? CELL + 1 : CELL * (1 - easeIn(progress))
          rects += `<rect x="${cx - size / 2}" y="${cy - size / 2}" width="${size}" height="${size}"/>`
        }
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${rects}</svg>`
      style.textContent = `${base}
        ::view-transition-old(root) { mask: url("data:image/svg+xml,${encodeURIComponent(svg)}") 0 0 / ${width}px ${height}px no-repeat; }`
      if (t < total) frame = requestAnimationFrame(draw)
    }
    draw()
  })

  transition.finished.finally(() => {
    cancelAnimationFrame(frame)
    style.remove()
  })
}
