import { site } from '../../content/site'
import { Logo } from './Logo'
import { ThemeSwitch } from './ThemeSwitch'
import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <Logo />
      <div className={styles.end}>
        <a href={site.links.blog} className={styles.blog} target="_blank" rel="noreferrer">
          Blog
        </a>
        <ThemeSwitch />
      </div>
    </header>
  )
}
