import { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../../content/projects'
import { useActiveSection } from '../../hooks/useActiveSection'
import { scrollTo } from '../../lib/scroll'
import { ProjectDetail } from '../projects/ProjectDetail'
import { ProjectStack } from '../projects/ProjectStack'
import layout from './Section.module.css'
import styles from './Projects.module.css'

/**
 * Pinned project stack. The section is one viewport tall plus a scroll step per extra
 * card; its stage sticks to the viewport while scrolling through that length moves the
 * stack one card per step. Section snapping (data-snap-steps) stops on each card.
 */
export function Projects() {
  const sectionRef = useRef<HTMLElement>(null)
  const position = useRef(0)
  const apply = useRef<() => void>(() => {})
  const [current, setCurrent] = useState(0)
  const isActive = useActiveSection() === 'projects'

  const register = useCallback((fn: () => void) => {
    apply.current = fn
  }, [])

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        position.current = self.progress * (projects.length - 1)
        apply.current()
        setCurrent(Math.round(position.current))
      },
    })
    return () => trigger.kill()
  }, [])

  // Scroll to the point in the pin where card `index` is in front.
  const select = useCallback((index: number) => {
    const section = sectionRef.current!
    const top = section.getBoundingClientRect().top + window.scrollY
    const step = (section.offsetHeight - window.innerHeight) / (projects.length - 1)
    scrollTo(top + step * index)
  }, [])

  useEffect(() => {
    if (!isActive) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      const next = current + (e.key === 'ArrowRight' ? 1 : -1)
      if (next < 0 || next >= projects.length) return
      e.preventDefault()
      select(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isActive, current, select])

  return (
    <section
      ref={sectionRef}
      id="projects"
      className={styles.projects}
      style={{ '--cards': projects.length } as React.CSSProperties}
      data-snap-steps={projects.length}
      aria-label="Projects"
    >
      <div className={`${layout.section} ${styles.stage}`}>
        <ProjectStack projects={projects} position={position} register={register} onSelect={select} />
        <div className={layout.column}>
          <ProjectDetail project={projects[current]} />
        </div>
      </div>
    </section>
  )
}
