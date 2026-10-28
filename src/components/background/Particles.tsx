import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import styles from './Particles.module.css'

// One square per this many px² of screen, so small screens get fewer.
const AREA_PER_PARTICLE = 14000
// How far the nearest squares move per px scrolled; deeper ones move proportionally less.
const PARALLAX = 0.35
// Drift speed of the nearest squares, in px per second.
const DRIFT = 10
// Squares wrap around this far outside the screen, so they never pop in at an edge.
const MARGIN = 20

type Particle = { x: number; y: number; vx: number; vy: number; depth: number; size: number }

function createParticles(width: number, height: number): Particle[] {
  return Array.from({ length: Math.round((width * height) / AREA_PER_PARTICLE) }, () => {
    // Skewed toward deep, so most squares are small and faint and a few stand out.
    const depth = 0.15 + 0.85 * Math.random() ** 2
    const angle = Math.random() * Math.PI * 2
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * DRIFT * depth,
      vy: Math.sin(angle) * DRIFT * depth,
      depth,
      size: 2 + depth * 5,
    }
  })
}

const wrap = (value: number, size: number) => ((((value + MARGIN) % size) + size) % size) - MARGIN

/**
 * Small squares drifting behind everything. Nearer squares (higher depth) are larger,
 * stronger, drift faster and move more with the scroll. Still under reduced motion.
 */
export function Particles() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let width = 0
    let height = 0
    let particles: Particle[] = []
    let color = ''
    let last = performance.now()

    const readColor = () => {
      color = getComputedStyle(document.documentElement).getPropertyValue('--particle').trim()
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = createParticles(width, height)
    }

    const draw = () => {
      const scroll = reducedMotion ? 0 : window.scrollY
      const fieldW = width + MARGIN * 2
      const fieldH = height + MARGIN * 2
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = color
      for (const p of particles) {
        ctx.globalAlpha = 0.3 + 0.7 * p.depth
        const x = wrap(p.x, fieldW)
        const y = wrap(p.y - scroll * PARALLAX * p.depth, fieldH)
        ctx.fillRect(x, y, p.size, p.size)
      }
    }

    const tick = () => {
      const now = performance.now()
      // Capped, so returning to a background tab doesn't jump the squares.
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      for (const p of particles) {
        p.x += p.vx * dt
        p.y += p.vy * dt
      }
      draw()
    }

    const redraw = () => {
      readColor()
      draw()
    }
    const onResize = () => {
      resize()
      draw()
    }

    readColor()
    resize()
    draw()
    // Repaint in the new color when the theme changes.
    const themeObserver = new MutationObserver(redraw)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    window.addEventListener('resize', onResize)
    // On GSAP's ticker, like Lenis, so parallax lands in the same frame as the scroll.
    if (!reducedMotion) gsap.ticker.add(tick)

    return () => {
      themeObserver.disconnect()
      window.removeEventListener('resize', onResize)
      gsap.ticker.remove(tick)
    }
  }, [reducedMotion])

  return <canvas ref={ref} className={styles.particles} aria-hidden="true" />
}
