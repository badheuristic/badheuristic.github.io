import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

// Must match the inline script in index.html.
const STORAGE_KEY = 'theme'

function readSaved(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

function systemTheme(): Theme {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(
    () => (document.documentElement.dataset.theme as Theme | undefined) ?? systemTheme(),
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Follow the OS setting until the visitor picks a theme themselves.
  useEffect(() => {
    const query = matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (!readSaved()) setThemeState(systemTheme())
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage unavailable (private mode etc.); the choice lasts for this visit only.
    }
  }, [])

  return { theme, setTheme }
}
