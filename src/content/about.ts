import {
  siBun,
  siDocker,
  siFigma,
  siGit,
  siGo,
  siGreensock,
  siLinux,
  siNeovim,
  siNodedotjs,
  siPostgresql,
  siPython,
  siReact,
  siRedis,
  siRust,
  siThreedotjs,
  siTypescript,
  type SimpleIcon,
} from 'simple-icons'

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

export type Skill = { name: string; icon: SimpleIcon }

// Placeholder picks; the rows scroll in opposite directions.
export const skills: Skill[][] = [
  [siTypescript, siReact, siNodedotjs, siRust, siGo, siPython, siPostgresql, siDocker],
  [siThreedotjs, siGreensock, siFigma, siGit, siLinux, siNeovim, siRedis, siBun],
].map((row) => row.map((icon) => ({ name: icon.title, icon })))
