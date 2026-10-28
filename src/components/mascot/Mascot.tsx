import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { appReady } from '../../lib/ready'
import { sectionChanged, start, useMascot } from './machine'
import { MascotModel, type Colors, type Pointer } from './MascotModel'
import styles from './Mascot.module.css'

// Typing speed of the bubble text, and how often "..." cycles its dots, in ms.
const TYPE_MS = 35
const DOTS_MS = 450

/** The bubble's text, typed out a character at a time; "..." keeps cycling its dots. */
function Bubble({ text, still }: { text: string; still: boolean }) {
  const [shown, setShown] = useState(still ? text.length : 0)
  const [dots, setDots] = useState(3)

  useEffect(() => {
    if (still) return
    if (text === '...') {
      const id = setInterval(() => setDots((n) => (n % 3) + 1), DOTS_MS)
      return () => clearInterval(id)
    }
    const id = setInterval(() => setShown((n) => Math.min(n + 1, text.length)), TYPE_MS)
    return () => clearInterval(id)
  }, [text, still])

  const visible = text === '...' ? '.'.repeat(still ? 3 : dots) : text.slice(0, shown)
  return (
    <p className={styles.bubble} aria-label={text}>
      {/* Full text laid out invisibly, so the box doesn't grow as it types. */}
      <span className={styles.sizer} aria-hidden="true">
        {text}
      </span>
      <span className={styles.typed} aria-hidden="true">
        {visible}
      </span>
    </p>
  )
}

function readColors(): Colors {
  const css = getComputedStyle(document.documentElement)
  return { head: css.getPropertyValue('--mascot').trim(), ink: css.getPropertyValue('--mascot-ink').trim() }
}

/**
 * The 3D mascot with its speech bubble, filling its slot. Loaded lazily (three.js is
 * large). Renders only while on screen; both slots share one state machine.
 */
export default function Mascot() {
  const ref = useRef<HTMLDivElement>(null)
  const pointer = useRef<Pointer>({ x: 0, y: 0 })
  const bubbleAnchor = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [colors, setColors] = useState(readColors)
  const still = useReducedMotion()
  const { bubble, since } = useMascot()

  // Says hello once the loader is gone, not behind it.
  useEffect(() => void appReady.then(start), [])

  // React to section changes (not to the first section on load).
  const section = useActiveSection()
  const firstSection = useRef(section)
  useEffect(() => {
    if (section !== firstSection.current) sectionChanged()
  }, [section])

  useEffect(() => {
    const el = ref.current!
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(el)
    const themeObserver = new MutationObserver(() => setColors(readColors()))
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    // The head turns toward the cursor: its offset from the slot's center, in slot sizes.
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const clamp = (v: number) => Math.max(-1, Math.min(1, v))
      pointer.current = {
        x: clamp((e.clientX - (rect.left + rect.width / 2)) / rect.width),
        y: clamp((e.clientY - (rect.top + rect.height / 2)) / rect.height),
      }
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      observer.disconnect()
      themeObserver.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <div ref={ref} className={styles.mascot}>
      {/* Moved by the model each frame to sit over the head. */}
      <div ref={bubbleAnchor} className={styles.anchor} aria-live="polite">
        {/* Keyed by state start, so each new line pops in and types out again. */}
        {bubble && <Bubble key={since} text={bubble} still={still} />}
      </div>
      <Canvas
        className={styles.canvas}
        // Measure layout size, not the on-screen box: the corner slot is rotated and
        // scaled while it peeks in, which would otherwise stick as the canvas size.
        resize={{ offsetSize: true }}
        frameloop={visible ? 'always' : 'never'}
        flat
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 28 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.6} />
        <directionalLight position={[3, 4, 5]} intensity={2} />
        <MascotModel colors={colors} pointer={pointer} bubble={bubbleAnchor} still={still} />
      </Canvas>
    </div>
  )
}
