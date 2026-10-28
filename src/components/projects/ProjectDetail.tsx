import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import type { Project } from '../../content/projects'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import styles from './ProjectDetail.module.css'

/** Title, year, blurb and links of the current project. Fades over when it changes. */
export function ProjectDetail({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const first = useRef(true)

  useLayoutEffect(() => {
    if (first.current || reducedMotion) {
      first.current = false
      return
    }
    gsap.fromTo(
      ref.current!.children,
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.05, overwrite: true },
    )
  }, [project, reducedMotion])

  return (
    <div ref={ref} className={styles.detail} aria-live="polite">
      <h2 className={styles.title}>
        {project.title} <span className={styles.year}>{project.year}</span>
      </h2>
      <p>{project.blurb}</p>
      <ul className={styles.links}>
        {project.links.map(({ label, href }) => (
          <li key={label}>
            <a href={href} className={styles.link} target="_blank" rel="noreferrer">
              {label} ↗
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
