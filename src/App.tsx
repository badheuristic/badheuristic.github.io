import { useEffect } from 'react'
import { Cursor } from './components/chrome/Cursor'
import { FixedTitle } from './components/chrome/FixedTitle'
import { Header } from './components/chrome/Header'
import { Nav } from './components/chrome/Nav'
import { ContactOverlay } from './components/contact/ContactOverlay'
import { Zones } from './components/dev/Zones'
import { CornerMascot } from './components/mascot/CornerMascot'
import { About } from './components/sections/About'
import { ContactSpacer } from './components/sections/ContactSpacer'
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
      <main className={styles.main}>
        <Home />
        <Projects />
        <About />
        <ContactSpacer />
      </main>

      <Header />
      <Nav />
      <FixedTitle />
      <ContactOverlay />
      <CornerMascot />

      {import.meta.env.DEV && <Zones />}
      <Cursor />
    </>
  )
}
