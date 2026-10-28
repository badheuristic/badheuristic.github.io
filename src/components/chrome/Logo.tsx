import styles from './Logo.module.css'

export function Logo() {
  return (
    <a href="#home" className={styles.logo} aria-label="Home">
      ch<span className={styles.brace}>{'{'}</span>
      <span className={styles.star}>✱</span>
      <span className={styles.brace}>{'}'}</span>
    </a>
  )
}
