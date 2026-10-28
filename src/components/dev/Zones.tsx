import { useEffect, useState } from 'react'
import styles from './Zones.module.css'

/** Dev-only overlay of the reserved zones and content column. Press Z to toggle. */
export function Zones() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'z' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setVisible((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!visible) return null

  return (
    <div className={styles.zones} aria-hidden="true">
      <div className={`${styles.zone} ${styles.column}`}>content column</div>
      <div className={`${styles.zone} ${styles.title}`}>fixed title</div>
      <div className={`${styles.zone} ${styles.rail}`}>nav rail</div>
      <div className={`${styles.zone} ${styles.mascot}`}>mascot</div>
    </div>
  )
}
