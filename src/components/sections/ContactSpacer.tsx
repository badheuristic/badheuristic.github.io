import styles from './ContactSpacer.module.css'

// Scroll room at the end of the page. In step 4, scrolling through it raises the contact card.
export function ContactSpacer() {
  return <section id="contact" className={styles.spacer} aria-label="Contact" />
}
