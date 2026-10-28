import { useLayoutEffect, useRef } from 'react'
import type { Project } from '../../content/projects'
import styles from './ProjectStack.module.css'

// Cards further back than this fade out.
const VISIBLE_BEHIND = 5

type Pose = { x: number; z: number; rotateY: number; opacity: number; fog: number }

/**
 * Where a card sits for a given offset from the current card (`d`, fractional while
 * scrolling). Upcoming cards recede into depth to the right; passed cards slide off
 * to the left, toward the viewer, fading out.
 */
function pose(d: number, size: number): Pose {
  if (d >= 0) {
    return {
      x: d * size * 0.34,
      z: -d * size * 0.3,
      rotateY: -10 - Math.min(d, 1) * 24,
      opacity: Math.max(0, Math.min(1, VISIBLE_BEHIND + 1 - d)),
      fog: Math.min(d * 0.1, 0.6),
    }
  }
  const p = -d
  return {
    x: -p * size * 0.9,
    z: p * size * 0.3,
    rotateY: -10 + p * 25,
    opacity: Math.max(0, 1 - p * 1.2),
    fog: 0,
  }
}

type Props = {
  projects: Project[]
  /** Fractional index of the current card. Read every frame; not React state. */
  position: React.RefObject<number>
  /** Lets the parent re-pose the cards after updating `position`. */
  register: (apply: () => void) => void
  onSelect: (index: number) => void
}

/** The 3D stack of project cards (reference: designs/website/stack.png). */
export function ProjectStack({ projects, position, register, onSelect }: Props) {
  const stackRef = useRef<HTMLOListElement>(null)
  const cardRefs = useRef<(HTMLLIElement | null)[]>([])

  useLayoutEffect(() => {
    const apply = () => {
      const size = stackRef.current?.querySelector('li')?.offsetWidth ?? 0
      cardRefs.current.forEach((card, i) => {
        if (!card) return
        const { x, z, rotateY, opacity, fog } = pose(i - position.current, size)
        card.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${rotateY}deg)`
        card.style.opacity = String(opacity)
        card.style.visibility = opacity < 0.01 ? 'hidden' : 'visible'
        // Front card on top, deeper cards below; passed cards (moving toward the viewer) above all.
        card.style.zIndex = String(Math.round(1000 - (i - position.current) * 10))
        card.style.setProperty('--fog', String(fog))
      })
    }
    register(apply)
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(stackRef.current!)
    return () => observer.disconnect()
  }, [position, register])

  return (
    <div className={styles.scene}>
      <ol ref={stackRef} className={styles.stack}>
        {projects.map((project, i) => (
          <li
            key={project.title}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            className={styles.card}
          >
            <button
              type="button"
              className={styles.face}
              onClick={() => onSelect(i)}
              aria-label={`Show ${project.title}`}
            >
              <span className={styles.number}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.label}>{project.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className={styles.shadow} aria-hidden="true" />
    </div>
  )
}
