import styles from './Logo.module.css'

export function Logo() {
  return (
    <a href="#home" className={styles.logo} aria-label="Home">
      ch<span className={styles.brace}>{'{'}</span>
      {/* Drawn instead of typed: Iosevka Aile renders ✱ as a dot. */}
      <svg className={styles.star} viewBox="-10 -10 20 20" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="3.4">
          <line x1="0" y1="-9" x2="0" y2="9" />
          <line x1="0" y1="-9" x2="0" y2="9" transform="rotate(60)" />
          <line x1="0" y1="-9" x2="0" y2="9" transform="rotate(120)" />
        </g>
      </svg>
      <span className={styles.brace}>{'}'}</span>
    </a>
  )
}
