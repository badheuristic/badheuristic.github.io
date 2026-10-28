import { useEffect, useSyncExternalStore } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sections, type SectionId } from '../content/sections'

// Tiny external store so any component can read the active section without prop drilling.
let active: SectionId = 'home'
const listeners = new Set<() => void>()

function setActive(next: SectionId) {
  if (next === active) return
  active = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useActiveSection() {
  return useSyncExternalStore(subscribe, () => active)
}

/** Watches the sections and updates the active one. Mount once, in App. */
export function useTrackActiveSection() {
  useEffect(() => {
    // A section is active while it covers the middle of the viewport.
    const triggers = sections.map(({ id }) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (self.isActive) setActive(id)
        },
      }),
    )
    return () => triggers.forEach((trigger) => trigger.kill())
  }, [])
}
