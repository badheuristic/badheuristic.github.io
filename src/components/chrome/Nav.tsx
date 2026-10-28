import { sections } from '../../content/sections'
import styles from './Nav.module.css'

// Static right rail for now; active state and the move from center to rail come in step 3.
export function Nav() {
  return (
    <nav className={styles.nav} aria-label="Sections">
      <ul className={styles.list}>
        {sections.map(({ id, label }) => (
          <li key={id}>
            <a href={`#${id}`} className={styles.link}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
