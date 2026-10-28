import { useEffect, useState } from 'react'
import { site } from '../../content/site'
import styles from './Contact.module.css'

/** The contact card: email (copies on click) and links, centered in the last section. */
export function Contact() {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.contact.email)
      setCopied(true)
    } catch {
      window.location.href = `mailto:${site.contact.email}`
    }
  }

  return (
    <section id="contact" className={styles.contact} aria-label="Contact">
      <div className={styles.card}>
        <ul className={styles.links}>
          <li>
            <button type="button" className={styles.row} onClick={copyEmail}>
              <span className={styles.label}>Email</span>
              <span className={styles.detail} aria-live="polite">
                {copied ? 'copied' : site.contact.email}
              </span>
            </button>
          </li>
          {site.contact.links.map(({ label, href }) => (
            <li key={label}>
              <a className={styles.row} href={href} target="_blank" rel="noreferrer">
                <span className={styles.label}>{label}</span>
                <span className={styles.detail} aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
