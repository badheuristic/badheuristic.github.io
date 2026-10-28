import { useEffect } from 'react'
import { Particles } from './components/background/Particles'
import { Cursor } from './components/chrome/Cursor'
import { FixedTitle } from './components/chrome/FixedTitle'
import { FixedIntro } from './components/intro/FixedIntro'
import { Header } from './components/chrome/Header'
import { Nav } from './components/chrome/Nav'
import { Zones } from './components/dev/Zones'
import { CornerMascot } from './components/mascot/CornerMascot'
import { About } from './components/sections/About'
import { Contact } from './components/sections/Contact'
import { Home } from './components/sections/Home'
import { Projects } from './components/sections/Projects'
import { useTrackActiveSection } from './hooks/useActiveSection'
import { initScroll } from './lib/scroll'
import styles from './App.module.css'

export function App() {
  useEffect(() => initScroll(), [])
  useTrackActiveSection()

  return (
    <>
      <Particles />
      <main className={styles.main}>
        <Home />
        <Projects />
        <About />
        <Contact />
      </main>

      <Header />
      <Nav />
      <FixedTitle />
      <FixedIntro />
      <CornerMascot />

      {import.meta.env.DEV && <Zones />}
      <Cursor />
    </>
  )
}
