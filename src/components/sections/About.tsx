import { about, experience, skills } from '../../content/about'
import layout from './Section.module.css'
import styles from './About.module.css'

// Placeholder layout. The skill rows become opposite-direction marquees in step 5.
export function About() {
  return (
    <section id="about" className={`${layout.section} ${styles.about}`} aria-label="About">
      <div className={styles.skills} aria-hidden="true">
        {skills.map((row, i) => (
          <div key={i} className={styles.row}>
            {row.map((skill) => (
              <span key={skill} className={styles.tile}>
                {skill}
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className={`${layout.column} ${styles.content}`}>
        <p className={styles.lead}>{about.lead}</p>
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
