import { site } from '../../content/site'
import { HomeMascot } from '../mascot/HomeMascot'
import layout from './Section.module.css'
import styles from './Home.module.css'

export function Home() {
  return (
    <section id="home" className={`${layout.section} ${styles.home}`} aria-label="Home">
      <HomeMascot />
      <p className={`${layout.column} ${styles.intro}`}>{site.intro}</p>
    </section>
  )
}
