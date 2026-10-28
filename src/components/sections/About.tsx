import { about, experience, skills } from '../../content/about'
import { SkillMarquee } from '../about/SkillMarquee'
import { INTRO_SLOT } from '../intro/slots'
import intro from '../intro/Intro.module.css'
import layout from './Section.module.css'
import styles from './About.module.css'

export function About() {
  return (
    <section id="about" className={`${layout.section} ${styles.about}`} aria-label="About">
      <div className={styles.skills}>
        <div className={styles.rows} aria-hidden="true">
          {skills.map((row, i) => (
            <SkillMarquee key={i} skills={row} direction={i % 2 === 0 ? 'left' : 'right'} />
          ))}
        </div>
        <ul className={styles.srOnly} aria-label="Skills">
          {skills.flat().map(({ name }) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>

      <div className={`${layout.column} ${styles.content}`}>
        <p id={INTRO_SLOT.about} className={`${intro.text} ${intro.slot}`}>
          {about.lead}
        </p>
        <p className={styles.body}>{about.body}</p>

        <div className={styles.images}>
          <div className={styles.image} />
          <div className={styles.image} />
        </div>

        <h2 className={styles.heading}>{about.experienceHeading}</h2>
        <ul className={styles.experience}>
          {experience.map((item, i) => (
            <li key={i}>
              <h3 className={styles.role}>{item.role}</h3>
              <p className={styles.dates}>{item.dates}</p>
              <p>{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
