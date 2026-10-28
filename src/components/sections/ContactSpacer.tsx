import styles from './ContactSpacer.module.css'

// Scroll room at the end of the page. Scrolling through it raises the contact card
// (ContactOverlay). It's one viewport tall and last, so #contact links land at the very end.
export function ContactSpacer() {
  return <section id="contact" className={styles.spacer} aria-label="Contact" />
}
