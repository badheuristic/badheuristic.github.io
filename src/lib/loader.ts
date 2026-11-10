// Show the page anyway after this long, however slow the connection.
export const MAX_WAIT_MS = 8000

/** The three text weights, loaded. */
export const fontsReady = Promise.all(
  ['300', '400', '500'].map((weight) => document.fonts.load(`${weight} 1em "Iosevka Aile"`)),
).then(() => {})

/** Resolves when `ready` does, or after MAX_WAIT_MS, whichever is first. Never rejects. */
export const withTimeout = (ready: Promise<unknown>): Promise<void> =>
  Promise.race([ready.catch(() => {}), new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS))]).then(() => {})

/** Fades out the loader from index.html once `ready` resolves and the page has painted. */
export function hideLoader(ready: Promise<unknown>) {
  withTimeout(ready).then(() => {
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
