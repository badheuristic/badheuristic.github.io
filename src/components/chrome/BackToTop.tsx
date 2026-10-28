import { useActiveSection } from '../../hooks/useActiveSection'
import { scrollTo } from '../../lib/scroll'
import styles from './BackToTop.module.css'

export function BackToTop() {
  const hidden = useActiveSection() === 'home'

  return (
    <button
      type="button"
      className={styles.button}
      data-hidden={hidden}
      inert={hidden}
      onClick={() => scrollTo(0)}
    >
      Back to top
      <span className={styles.arrow} aria-hidden="true">
        ↑
      </span>
    </button>
  )
}
