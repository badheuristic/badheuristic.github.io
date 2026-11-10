import { useEffect, useState } from 'react'
import { site } from '../../content/site'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Particles } from '../background/Particles'
import { Cursor } from '../chrome/Cursor'
import { Header } from '../chrome/Header'
import styles from './UnderConstruction.module.css'

// The wall: squares laid one at a time, bottom row first, left to right. When it's
// done it holds, clears, and starts again.
const COLS = 12
const ROWS = 3
const TILES = COLS * ROWS
const LAY_MS = 180
const HOLD_STEPS = 8
/** Under reduced motion the wall stands still, part built. */
const STILL = 22

/** Shown instead of the site while it's being built (`site.underConstruction`). */
export function UnderConstruction() {
  const reduced = useReducedMotion()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setStep((s) => (s + 1) % (TILES + HOLD_STEPS)), LAY_MS)
    return () => clearInterval(id)
  }, [reduced])

  const laid = reduced ? STILL : Math.min(step, TILES)

  return (
    <>
      <Particles />
      <Header />
      <main className={styles.page}>
        <div className={styles.note}>
          <div className={styles.wall} aria-hidden="true">
            {Array.from({ length: TILES }, (_, i) => {
              // Rendered top row first; laid bottom row first.
              const row = ROWS - 1 - Math.floor(i / COLS)
              const order = row * COLS + (i % COLS)
              return <span key={i} className={styles.tile} data-laid={order < laid} />
            })}
          </div>
          <p className={styles.text}>
            This site is being built.
            <br />
            The blog is open in the meantime.
          </p>
          <a href={site.links.blog} className={styles.link}>
            read the blog <span aria-hidden="true">→</span>
          </a>
        </div>

        <h1 className={styles.title}>
          <span className={styles.line}>under</span>{' '}
          <span className={styles.line}>construction</span>
        </h1>
      </main>
      <Cursor />
    </>
  )
}
