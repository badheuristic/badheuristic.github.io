import { site } from '../../content/site'
import { Name } from './Name'
import styles from './FixedTitle.module.css'

// Shows the Home greeting only; switching text per section comes in step 3.
export function FixedTitle() {
  return (
    <div className={styles.title} aria-hidden="true">
      <span className={styles.greeting}>{site.greeting}</span>
      <span className={styles.name}>
        <Name />
      </span>
    </div>
  )
}
