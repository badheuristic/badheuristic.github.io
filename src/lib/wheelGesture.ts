// A pause this long between wheel events starts a new gesture. Trackpad inertia keeps
// firing well within it, so one flick counts once, not several times.
const GESTURE_GAP_MS = 180
// A fresh flick during a fading inertia tail shows up as a jump in speed. A delta this
// many times the previous one (and at least SPIKE_MIN_PX) counts as a new gesture.
const SPIKE_RATIO = 1.6
const SPIKE_MIN_PX = 10

/**
 * Groups wheel events into gestures. Returns a function to call with each event's delta;
 * it returns true when that event starts a new gesture (a pause, a change of direction,
 * or, when `spikes` is on, a jump in speed).
 */
export function createWheelGestures() {
  let last = 0
  let lastSize = 0
  let lastDir = 0
  return (delta: number, spikes = true) => {
    const now = performance.now()
    const size = Math.abs(delta)
    const dir = Math.sign(delta)
    const isNew =
      now - last > GESTURE_GAP_MS ||
      dir !== lastDir ||
      (spikes && size > lastSize * SPIKE_RATIO && size > SPIKE_MIN_PX)
    last = now
    lastSize = size
    lastDir = dir
    return isNew
  }
}
