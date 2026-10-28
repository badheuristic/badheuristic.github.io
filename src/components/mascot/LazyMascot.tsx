import { lazy, Suspense } from 'react'
import { mascotModule } from '../../lib/ready'
import { MascotPlaceholder } from './MascotPlaceholder'

// Fetched as the app starts (lib/ready.ts), so it's usually here by the time this renders.
const Mascot = lazy(() => mascotModule)

/** The 3D mascot; the flat placeholder shows only if its code is still loading. */
export function LazyMascot() {
  return (
    <Suspense fallback={<MascotPlaceholder />}>
      <Mascot />
    </Suspense>
  )
}
