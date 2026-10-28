import { LazyMascot } from './LazyMascot'
import styles from './HomeMascot.module.css'

export const HOME_MASCOT_ID = 'home-mascot'

/** The mascot's spot at the center of Home. It scrolls with the page. */
export function HomeMascot() {
  return (
    <div id={HOME_MASCOT_ID} className={styles.slot}>
      <LazyMascot />
    </div>
  )
}
