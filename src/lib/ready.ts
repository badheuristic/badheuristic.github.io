import { fontsReady, withTimeout } from './loader'

/** The 3D mascot's code, fetched right away rather than when its slot first renders. */
export const mascotModule = import('../components/mascot/Mascot')

/**
 * Resolves when the page is ready to be seen: fonts and the mascot loaded (or the time
 * limit reached). The loader in index.html stays up until then, and the entrance
 * moments (the mascot's hello) wait for it.
 */
export const appReady: Promise<void> = withTimeout(Promise.all([fontsReady, mascotModule]))
