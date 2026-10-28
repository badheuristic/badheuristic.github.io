import { useTheme, type Theme } from '../../hooks/useTheme'
import styles from './ThemeSwitch.module.css'

const OPTIONS: Theme[] = ['light', 'dark']

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()

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
            onClick={() => setTheme(option)}
          >
            {option}
          </button>
        </span>
      ))}
    </div>
  )
}
