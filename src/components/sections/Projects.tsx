import { projects } from '../../content/projects'
import layout from './Section.module.css'
import styles from './Projects.module.css'

// Placeholder layout. The pinned, scroll-driven stack replaces the row of cards in step 6.
export function Projects() {
  const active = projects[0]

  return (
    <section id="projects" className={`${layout.section} ${styles.projects}`} aria-label="Projects">
      <div className={styles.stage}>
        <ol className={styles.stack}>
          {projects.map((project) => (
            <li key={project.title} className={styles.card}>
              <span className={styles.cardLabel}>{project.title}</span>
            </li>
          ))}
        </ol>
        <div className={styles.shadow} aria-hidden="true" />
      </div>

      <div className={`${layout.column} ${styles.detail}`}>
        <h2 className={styles.title}>
          {active.title} <span className={styles.year}>{active.year}</span>
        </h2>
        <p>{active.blurb}</p>
      </div>
    </section>
  )
}
