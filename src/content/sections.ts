export type SectionId = 'home' | 'projects' | 'about' | 'contact'

export const sections: { id: SectionId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]
