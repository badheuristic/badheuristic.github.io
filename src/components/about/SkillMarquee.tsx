import type { Skill } from '../../content/about'
import styles from './SkillMarquee.module.css'

// Copies of the row in each half of the track. Two keeps the strip wider than its
// container on very wide screens, so the loop never shows a gap.
const COPIES_PER_HALF = 2

type Props = {
  skills: Skill[]
  direction: 'left' | 'right'
}

/**
 * A row of skill tiles that scrolls endlessly in one direction. The track holds the
 * row twice over and slides by exactly half its width, so the loop has no seam.
 * Hovering pauses it.
 */
export function SkillMarquee({ skills, direction }: Props) {
  const track = Array.from({ length: COPIES_PER_HALF * 2 }, () => skills).flat()

  return (
    <div className={styles.marquee} data-direction={direction}>
      <div className={styles.track}>
        {track.map(({ name, icon }, i) => (
          <span key={i} className={styles.tile} title={name}>
            <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
              <path d={icon.path} />
            </svg>
          </span>
        ))}
      </div>
    </div>
  )
}
