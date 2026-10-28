import { flushSync } from 'react-dom'
import { useTheme, type Theme } from '../../hooks/useTheme'
import { dissolveTheme } from '../../lib/themeDissolve'
import styles from './ThemeSwitch.module.css'

const OPTIONS: Theme[] = ['light', 'dark']

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()

  // Dissolves into the new theme from the click (or the button's center, from the keyboard).
  const choose = (option: Theme, e: React.MouseEvent<HTMLButtonElement>) => {
    if (option === theme) return
    const rect = e.currentTarget.getBoundingClientRect()
    const fromPointer = e.detail > 0
    dissolveTheme(
      () => {
        // Applied synchronously, so the view transition captures the new theme.
        document.documentElement.dataset.theme = option
        flushSync(() => setTheme(option))
      },
      fromPointer ? e.clientX : rect.left + rect.width / 2,
      fromPointer ? e.clientY : rect.top + rect.height / 2,
    )
  }

  return (
    <div className={styles.switch} role="group" aria-label="Color theme">
      {OPTIONS.map((option, i) => (
        <span key={option} className={styles.item}>
          {i > 0 && (
            <span className={styles.divider} aria-hidden="true">
              /
            </span>
          )}
          <button
            type="button"
            className={styles.option}
            aria-pressed={theme === option}
            onClick={(e) => choose(option, e)}
          >
            {option}
          </button>
        </span>
      ))}
    </div>
  )
}
