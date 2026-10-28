import { site } from '../../content/site'
import { INTRO_SLOT } from '../intro/slots'
import intro from '../intro/Intro.module.css'
import { HomeMascot } from '../mascot/HomeMascot'
import layout from './Section.module.css'
import styles from './Home.module.css'

export function Home() {
  return (
    <section id="home" className={`${layout.section} ${styles.home}`} aria-label="Home">
      <HomeMascot />
      <p id={INTRO_SLOT.home} className={`${layout.column} ${intro.text} ${intro.slot} ${styles.intro}`}>
        {site.intro}
      </p>
    </section>
  )
}
