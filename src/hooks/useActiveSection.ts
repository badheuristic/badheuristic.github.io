import { useEffect, useSyncExternalStore } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sections, type SectionId } from '../content/sections'

// Tiny external store so any component can read the active section without prop drilling.
type Store = { active: SectionId; listeners: Set<() => void> }

// Kept in Vite's hot data in dev: otherwise a hot reload of this file leaves components
// subscribed to a fresh store while the running scroll tracker updates the old one.
const store: Store = import.meta.hot?.data.store ?? { active: 'home', listeners: new Set() }
if (import.meta.hot) import.meta.hot.data.store = store

function setActive(next: SectionId) {
  if (next === store.active) return
  store.active = next
  store.listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  store.listeners.add(listener)
  return () => store.listeners.delete(listener)
}

export function useActiveSection() {
  return useSyncExternalStore(subscribe, () => store.active)
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
