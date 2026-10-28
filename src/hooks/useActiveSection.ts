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
    // The active section is the one covering the middle of the viewport. Checked on
    // every scroll update rather than with enter/leave toggles, so jumps that skip
    // sections (or land exactly on a boundary) still resolve to the right one.
    const update = () => {
      const middle = window.innerHeight / 2
      for (const { id } of sections) {
        const rect = document.getElementById(id)?.getBoundingClientRect()
        if (rect && rect.top <= middle && rect.bottom > middle) {
          setActive(id)
          return
        }
      }
    }
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: update,
      onRefresh: update,
    })
    update()
    return () => trigger.kill()
  }, [])
}
