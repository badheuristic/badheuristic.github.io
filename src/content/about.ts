// Placeholder copy until the mechanics are done.
export const about = {
  lead: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  body: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
  experienceHeading: 'Lorem ipsum',
}

export type Experience = { role: string; dates: string; description: string }

export const experience: Experience[] = Array.from({ length: 2 }, () => ({
  role: 'Sed ut perspiciatis unde omnis',
  dates: 'January 1900 – Present',
  description:
    'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
}))

// Icons come in step 5; for now each skill is just a name.
export const skills: string[][] = [
  ['ts', 'react', 'node', 'rust', 'go', 'py', 'pg', 'docker'],
  ['three', 'gsap', 'figma', 'git', 'linux', 'aws', 'redis', 'bun'],
]
