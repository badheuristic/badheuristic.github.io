import { scrollTo } from '../../lib/scroll'
import styles from './BackToTop.module.css'

// Always visible for now; hiding it on Home comes in step 3.
export function BackToTop() {
  return (
    <button type="button" className={styles.button} onClick={() => scrollTo(0)}>
      Back to top
      <span className={styles.arrow} aria-hidden="true">
        ↑
      </span>
    </button>
  )
}
