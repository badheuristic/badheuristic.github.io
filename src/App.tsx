import { Logo } from './components/chrome/Logo'
import { Name } from './components/chrome/Name'
import { ThemeSwitch } from './components/chrome/ThemeSwitch'
import { site } from './content/site'
import styles from './App.module.css'

export function App() {
  return (
    <>
      <header className={styles.header}>
        <Logo />
        <div className={styles.headerEnd}>
          <a href={site.links.blog} className={styles.blog} target="_blank" rel="noreferrer">
            Blog
          </a>
          <ThemeSwitch />
        </div>
      </header>

      {/* Placeholder until the section skeleton (step 2). */}
      <main id="home" className={styles.main}>
        <p className={styles.intro}>{site.intro}</p>
        <h1 className={styles.title}>
          <span className={styles.greeting}>{site.greeting}</span>
          <span className={styles.name}>
            <Name />
          </span>
        </h1>
      </main>
    </>
  )
}
