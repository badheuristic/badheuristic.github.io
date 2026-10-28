import { useSyncExternalStore } from 'react'

/**
 * The mascot's behaviour, shared by both slots (Home and the corner) so they always agree.
 * Each state names a face and a bubble; the renderer works out the pose from the state
 * and how long it has lasted, and eases toward it, so any two states blend smoothly.
 */

export type Face = 'smile' | 'happy' | 'curious' | 'angry' | 'wow' | 'cat' | 'meh' | 'squint' | 'sleepy'
export type MascotState = 'hello' | 'idle' | 'curious' | 'distracted' | 'attentive' | 'react'
export type Snapshot = { state: MascotState; face: Face; bubble: string; since: number }

const HELLO_MS = 2600
const CURIOUS_MS = 3600
const REACT_MS = 1300
const CLICK_MS = 2000
// On touch screens (no hover) the first tap asks for a second one, for this long.
const TAP_MS = 4000
const TAP_TEXT = 'tap to talk to me'
// Taps closer together than this count as one (the same tap can arrive more than once).
const TAP_DEDUPE_MS = 300
// Each distracted face lasts this long, in this order.
const PHONE_FACE_MS = 2200
const PHONE_FACES: [Face, string][] = [
  ['angry', '%$^&!'],
  ['wow', ''],
  ['cat', ''],
  ['meh', ''],
]
// Idle lasts a random time in this range before a variation (curious or distracted).
const IDLE_MS: [number, number] = [7000, 12000]
// Distracted only happens once nobody has interacted for this long.
const BORED_MS = 25000
// Coming back to the tab after this long says hello again.
const AWAY_MS = 60000
// Section changes get a small reaction at most this often, so scrolling around isn't noisy.
const SECTION_REACT_GAP_MS = 6000

let snapshot: Snapshot = { state: 'hello', face: 'happy', bubble: 'hello!', since: performance.now() }
const listeners = new Set<() => void>()
let timer = 0
let started = false
let hovering = false
let lastInteraction = performance.now()
let hiddenAt = 0
let lastSectionReact = 0
let lastTap = -Infinity

const random = ([min, max]: [number, number]) => min + Math.random() * (max - min)

function set(state: MascotState, face: Face, bubble = '') {
  snapshot = { state, face, bubble, since: performance.now() }
  listeners.forEach((listener) => listener())
}

function after(ms: number, next: () => void) {
  window.clearTimeout(timer)
  timer = window.setTimeout(next, ms)
}

function hello() {
  set('hello', 'happy', 'hello!')
  after(HELLO_MS, idle)
}

function idle() {
  if (hovering) return attentive()
  set('idle', 'smile', '...')
  after(random(IDLE_MS), () => {
    const bored = performance.now() - lastInteraction > BORED_MS
    if (bored && Math.random() < 0.5) distracted(0)
    else curious()
  })
}

function curious() {
  set('curious', 'curious', '?')
  after(CURIOUS_MS, idle)
}

function distracted(step: number) {
  const [face, bubble] = PHONE_FACES[step]
  set('distracted', face, bubble)
  after(PHONE_FACE_MS, () => (step + 1 < PHONE_FACES.length ? distracted(step + 1) : idle()))
}

function attentive() {
  window.clearTimeout(timer)
  set('attentive', 'smile', 'click to talk to me')
}

/** Pointer entering (true) or leaving (false) the mascot. Hovering cuts in over anything. */
export function setHover(value: boolean) {
  if (value === hovering) return
  hovering = value
  lastInteraction = performance.now()
  if (value) attentive()
  else idle()
}

/** The mascot was clicked. The chat it will open comes later (step 11). */
export function poke() {
  lastInteraction = performance.now()
  set('attentive', 'happy', 'coming soon!')
  after(CLICK_MS, idle)
}

/** A tap on a touch screen: the first one asks for another, the second acts like a click. */
export function tap() {
  const now = performance.now()
  if (now - lastTap < TAP_DEDUPE_MS) return
  lastTap = now
  lastInteraction = now
  if (snapshot.state === 'attentive' && snapshot.bubble === TAP_TEXT) return poke()
  set('attentive', 'smile', TAP_TEXT)
  after(TAP_MS, idle)
}

/** A short reaction (theme switch), then back to idle. Skipped while hovered. */
function react(face: Face) {
  if (hovering) return
  set('react', face)
  after(REACT_MS, idle)
}

/**
 * The visitor moved to another section: a happy hop, if the mascot is only idling or
 * looking around (never over hello, the phone or hover), and not too often.
 */
export function sectionChanged() {
  const now = performance.now()
  if (now - lastSectionReact < SECTION_REACT_GAP_MS) return
  if (snapshot.state !== 'idle' && snapshot.state !== 'curious') return
  lastSectionReact = now
  react('happy')
}

/** Starts the behaviour loop once, however many slots mount. */
export function start() {
  if (started) return
  started = true
  hello()

  // Squints going light, sleepy going dark.
  new MutationObserver(() => {
    react(document.documentElement.dataset.theme === 'dark' ? 'sleepy' : 'squint')
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hiddenAt = performance.now()
    else if (performance.now() - hiddenAt > AWAY_MS) hello()
  })
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot() {
  return snapshot
}

export function useMascot() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

// Dev only: jump straight to a state from the console, e.g. `__mascot.distracted()`.
if (import.meta.env.DEV) {
  Object.assign(window, { __mascot: { hello, idle, curious, distracted: () => distracted(0) } })
}
