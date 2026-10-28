import { site } from '../../content/site'
import styles from './Name.module.css'

/** The site owner's name, or a redaction bar while `site.name` is empty. */
export function Name() {
  if (site.name) return <>{site.name}</>

  return (
    <span
      className={styles.redacted}
      // Roughly the average lowercase width in Iosevka Aile, so the bar is about name-sized.
      style={{ width: `${site.redactedLength * 0.5}em` }}
      role="img"
      aria-label="name redacted"
    />
  )
}
