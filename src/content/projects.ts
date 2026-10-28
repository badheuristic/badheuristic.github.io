// Placeholder projects until the stack mechanics are done.
export type Project = {
  title: string
  year: number
  blurb: string
  links: { label: string; href: string }[]
}

export const projects: Project[] = Array.from({ length: 6 }, (_, i) => ({
  title: `Project ${String(i + 1).padStart(2, '0')}`,
  year: 2026,
  blurb:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  links: [{ label: 'Read more', href: '#' }],
}))
