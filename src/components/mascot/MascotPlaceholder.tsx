import styles from './MascotPlaceholder.module.css'

// Stand-in for the 3D mascot (step 9): a square head with an emoticon face.
export function MascotPlaceholder() {
  return (
    <div className={styles.head} aria-hidden="true">
      <span className={styles.face}>^_^</span>
    </div>
  )
}
