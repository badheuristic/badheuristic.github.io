import { lazy, Suspense } from 'react'
import { MascotPlaceholder } from './MascotPlaceholder'

const Mascot = lazy(() => import('./Mascot'))

/** The 3D mascot, loaded after first paint; the flat placeholder shows until then. */
export function LazyMascot() {
  return (
    <Suspense fallback={<MascotPlaceholder />}>
      <Mascot />
    </Suspense>
  )
}
