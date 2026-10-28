// Show the page anyway after this long, however slow the connection.
const MAX_WAIT_MS = 8000

/** The 3D mascot's code, fetched right away rather than when its slot first renders. */
export const mascotModule = import('../components/mascot/Mascot')

const fonts = Promise.all(['300', '400', '500'].map((weight) => document.fonts.load(`${weight} 1em "Iosevka Aile"`)))

/**
 * Resolves when the page is ready to be seen: fonts and the mascot loaded (or the time
 * limit reached). The loader in index.html stays up until then, and the entrance
 * moments (the mascot's hello) wait for it.
 */
export const appReady: Promise<void> = Promise.race([
  Promise.all([fonts, mascotModule]).catch(() => {}),
  new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS)),
]).then(() => {})

/** Fades out the loader from index.html once the page is ready and has painted. */
export function hideLoaderWhenReady() {
  appReady.then(() => {
    // Two frames, so the content under the loader has painted with its fonts.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const loader = document.getElementById('loader')
        if (!loader) return
        loader.dataset.done = 'true'
        loader.addEventListener('transitionend', () => loader.remove(), { once: true })
        // In case the transition never runs (reduced motion, hidden tab).
        setTimeout(() => loader.remove(), 1000)
      }),
    )
  })
}
