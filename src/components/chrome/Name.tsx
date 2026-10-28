import { site } from '../../content/site'
import styles from './Name.module.css'

/** The site owner's name, or a redaction bar while `site.name` is empty. */
export function Name() {
  if (site.name) return <>{site.name}</>

  return (
    <span
      className={styles.redacted}
      style={{ width: `${site.redactedLength * 0.55}em` }}
      role="img"
      aria-label="name redacted"
    />
  )
}
