import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(listener: () => void) {
  const query = matchMedia(QUERY)
  query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, () => matchMedia(QUERY).matches)
}
