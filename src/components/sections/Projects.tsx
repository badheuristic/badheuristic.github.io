import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { projects } from '../../content/projects'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { GLIDE } from '../../lib/sectionSnap'
import { ProjectDetail } from '../projects/ProjectDetail'
import { ProjectStack } from '../projects/ProjectStack'
import layout from './Section.module.css'
import styles from './Projects.module.css'

const LAST = projects.length - 1
const clamp = (index: number) => Math.min(Math.max(index, 0), LAST)

/**
 * The project stack. It moves on its own, separate from the page scroll: scrolling or
 * dragging over it, clicking a card, or Left/Right while Projects is in view. Scrolling
 * past an end card moves on to the next section.
 */
export function Projects() {
  const position = useRef(0)
  const apply = useRef<() => void>(() => {})
  const tween = useRef<gsap.core.Tween | null>(null)
  const currentRef = useRef(0)
  const [current, setCurrent] = useState(0)
  const isActive = useActiveSection() === 'projects'
  const reducedMotion = useReducedMotion()

  const register = useCallback((fn: () => void) => {
    apply.current = fn
  }, [])

  // Glide the stack to card `index`, at the same speed as section glides.
  const go = useCallback(
    (index: number) => {
      const next = clamp(index)
      currentRef.current = next
      setCurrent(next)
      tween.current?.kill()
      tween.current = gsap.to(position, {
        current: next,
        duration: reducedMotion ? 0 : GLIDE.duration,
        ease: 'power3.inOut',
        onUpdate: () => apply.current(),
      })
    },
    [reducedMotion],
  )

  const onStep = useCallback(
    (dir: number) => {
      const next = currentRef.current + dir
      if (next < 0 || next > LAST) return false
      go(next)
      return true
    },
    [go],
  )

  // Dragging moves the stack live, then settles on a card.
  const dragFrom = useRef(0)
  const onDragStart = useCallback(() => {
    tween.current?.kill()
    dragFrom.current = position.current
  }, [])
  const onDrag = useCallback((cards: number) => {
    position.current = clamp(dragFrom.current + cards)
    apply.current()
    setCurrent(Math.round(position.current))
  }, [])
  const onDragEnd = useCallback(
    (cards: number) => {
      // Any deliberate drag moves at least one card in its direction.
      const by = Math.abs(cards) < 0.15 ? 0 : Math.sign(cards) * Math.max(1, Math.round(Math.abs(cards)))
      go(Math.round(dragFrom.current) + by)
    },
    [go],
  )

  useEffect(() => () => void tween.current?.kill(), [])

  useEffect(() => {
    if (!isActive) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      if (onStep(e.key === 'ArrowRight' ? 1 : -1)) e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isActive, onStep])

  return (
    <section id="projects" className={`${layout.section} ${styles.projects}`} aria-label="Projects">
      <ProjectStack
        projects={projects}
        position={position}
        register={register}
        onSelect={go}
        onStep={onStep}
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
      />
      <div className={styles.detail}>
        <ProjectDetail project={projects[current]} />
      </div>
    </section>
  )
}
