import { site } from '../../content/site'
import styles from './Name.module.css'

/** The site owner's name, or a redaction bar while `site.name` is empty. */
export function Name() {
  if (site.name) return <>{site.name}</>

  return (
    <span
      className={styles.redacted}
      // Iosevka glyphs are 0.5em wide, so the bar matches the name's real width.
      style={{ width: `${site.redactedLength * 0.5}em` }}
      role="img"
      aria-label="name redacted"
    />
  )
}
