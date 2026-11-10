import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/global.css'
import { site } from './content/site'
import { fontsReady, hideLoader } from './lib/loader'

const root = createRoot(document.getElementById('root')!)
const render = (node: ReactNode) => root.render(<StrictMode>{node}</StrictMode>)

// While the site is being built, the public build shows only the construction page.
// `bun dev` shows the real site; add ?construction to the URL to see the page there.
// Each is loaded on its own, so the construction page doesn't fetch the site (or its
// 3D mascot).
const construction =
  site.underConstruction && (!import.meta.env.DEV || new URLSearchParams(location.search).has('construction'))

if (construction) {
  import('./components/construction/UnderConstruction').then(({ UnderConstruction }) => {
    render(<UnderConstruction />)
    hideLoader(fontsReady)
  })
} else {
  Promise.all([import('./App'), import('./lib/ready')]).then(([{ App }, { appReady }]) => {
    render(<App />)
    hideLoader(appReady)
  })
}
