# Site architecture

A one-page personal site: minimal, monotone, smooth. Three scrolling sections (Home,
Projects, About) and a Contact overlay that rises over the end of the page. Fixed chrome
(logo, nav, theme switch, large section title, back to top) sits on top of the scrolling
content, with a particle field behind it and a small interactive 3D mascot in the
bottom-right corner.

Designs: `designs/website/*.png` (low fidelity, light and dark). `stack.png` is the
reference for the projects stack. Mascot details: `MODELSPEC.md`.

## Design rules (overrides to the mockups)

- **No borders, no rounded corners.** The mockups use pill shapes (active nav item,
  Back to Top). We use flat filled rectangles with `border-radius: 0` everywhere, which
  matches the square particles and skill tiles.
- **Nav is always a small rail on the right edge**, Home included. The large centered
  nav in the Home mockup is out; the mascot takes the center of Home instead.
- **No "welcome."** Home drops the top-right headline. The FixedTitle greeting does that
  job.
- **Name is "stephen"** (the mockups say "chaka").
- **Monotone.** Grayscale only, light and dark themes. Starting values from the mockups:

  | token          | light     | dark      | use                                  |
  |----------------|-----------|-----------|--------------------------------------|
  | `--bg`         | `#ffffff` | `#222222` | page background                      |
  | `--fg`         | `#000000` | `#ffffff` | primary text, logo, "stephen"        |
  | `--fg-muted`   | `#7a7a7a` | `#bdbdbd` | nav items, dates                     |
  | `--fg-faint`   | `#dcdcdc` | `#3a3a3a` | fixed section title, "hello, i am"   |
  | `--surface`    | `#d9d9d9` | `#dcdcdc` | active nav fill, placeholders, tiles |
  | `--surface-alt`| `#636363` | `#111111` | contact overlay card                 |
  | `--scrim`      | `bg` @ ~60% alpha         | behind the contact card              |
  | `--particle`   | `fg` @ low alpha          | squares in the background            |

- **Type.** Iosevka Aile for all text, mostly the Light weight (300), with Regular and
  Medium for small UI text. Display sizes (`stephen`, section titles) use slightly tight
  tracking. Standard (monospace) Iosevka is reserved for code, such as on the blog
  (`--font-code`).
- **Logo** is the text mark `ch{✱}` in place of the mockups' `c3k`.

## Layout and layers

From back to front (z-order):

```
0  page background         --bg, switches with theme
1  <Particles>             fixed full-viewport canvas, pointer-events: none
2  <FixedTitle>            fixed bottom left, behind the content
3  <main> sections         Home (with the mascot at its center) / Projects (pinned) /
                           About, normal document flow
4  fixed chrome            Logo (top left), Blog link + ThemeSwitch (top right),
                           Nav (right edge), BackToTop (bottom center)
5  <ContactOverlay>        scrim + centered square card, rises from the bottom
6  <CornerMascot>          fixed bottom right once Home is scrolled past (above the overlay)
7  <ChatOverlay>           later: opened by clicking the mascot
```

**Reserved zones.** Fixed elements take up corners, so section content is kept out of them:

- bottom left: FixedTitle (about 30% of the viewport width, about 20% of its height)
- bottom right: Mascot (`--mascot-size`, roughly 280px square on desktop, plus room
  above it for the speech bubble)
- right edge: Nav rail
- Content lives in a center-right column (the mockups put it at about 44% to 81% of the
  width). The About and Projects visuals use the left and center areas, above the
  FixedTitle zone.

## Global behavior

| Feature | Behavior | Implementation |
|---|---|---|
| Smooth scroll | Inertial page scroll. Anchor links glide. | Lenis, one shared instance in `lib/scroll.ts`, driving GSAP ScrollTrigger |
| Cursor | A dot at the pointer with a larger, fainter circle easing behind it. Mouse devices only. | `Cursor.tsx`, one `requestAnimationFrame` loop |
| Active section | Each section reports when it is the main one in view. Drives everything below. | ScrollTrigger callbacks feeding a tiny store (`useActiveSection`) |
| Nav | Small text list (Home, Projects, About, Contact), fixed to the right edge on every section. The active item has a filled square highlight. To move, it stretches to cover the next item, then lets go of the old one: a square take on the mockup's gooey pill, since a goo filter would round the corners. | GSAP timeline for the stretch |
| FixedTitle | Fixed bottom left, **behind** the content, so sections scroll over it. Shows "hello, i am / stephen" on Home, then "projects", "about", "contact". On a section change the old lines drop out of the bottom edge of the viewport and the new ones rise in from there. | `position: fixed` at `--z-backdrop`, text keyed on active section, GSAP |
| BackToTop | Hidden on Home, visible elsewhere. Scrolls to top through Lenis. | |
| ThemeSwitch | A text toggle in the top right next to Blog: `light / dark`, with the current theme at full contrast and the other muted. Easy to read, and it fits the type-led look. Switching runs a **square-tile dissolve**: a grid of squares flips from the clicked point outward, revealing the new theme (the same square motif as the particles). The mascot reacts briefly (squints going light, sleepy face going dark). Starts from `prefers-color-scheme` and is saved in localStorage. | `data-theme` on `<html>` swaps the tokens. The dissolve is a short-lived canvas over everything, or the View Transitions API with a mask. Particles and mascot read the tokens too. |
| Particles | Small squares that drift slowly. Each has a depth value: deeper squares are smaller and fainter and move less on scroll (parallax). | A single 2D canvas with a `requestAnimationFrame` loop and scroll offset from Lenis. Pauses when the tab is hidden. |
| Mascot | Lives at the **center of Home** and scrolls with it. Once it has scrolled out of view, a copy in the **bottom-right corner** peeks in (just the top of its head, leaning in), then comes all the way out and stays fixed there. Scrolling back to Home makes the corner one **pop and vanish**; the Home one was there all along. See the Mascot section for the model itself. | Two slots (`HomeMascot`, `CornerMascot`). A ScrollTrigger on the Home slot toggles the corner timeline. Later both slots render one 3D scene (drei `<View>`). |
| Reduced motion | `prefers-reduced-motion` turns off marquees, particle drift, parallax, inertial scroll, the theme dissolve (becomes a plain crossfade) and mascot idle motion. The project stack still works with plain stepping. | `useReducedMotion` |

## Sections

### Home (`#home`)
- The mascot, centered (see Mascot above).
- Intro paragraph, bottom center.
- FixedTitle shows "hello, i am" (faint) over "stephen" (full contrast).
- Otherwise empty on purpose: particles and the mascot carry the space.

### Projects (`#projects`), pinned
- **Project stack** in place of the carousel in the mockup (see `stack.png`). The active
  card is large in front. The other cards recede into depth to the right, smaller and
  overlapping.
- **Scroll-driven.** The section pins while scrolling moves through the stack. The pin
  lasts roughly `cards × 60vh`. Scroll progress maps to a fractional `activeIndex`, so
  cards move continuously between positions instead of jumping. A light snap settles on
  whole cards when scrolling stops.
  - Each card's transform (`translate3d`, `rotateY`, scale, opacity) is worked out from
    `index - activeIndex`, using CSS 3D with `perspective`.
  - Clicking a card or pressing the arrow keys scrolls the page to that card's point in
    the pin, so the scroll position and the stack never disagree.
  - Soft ellipse shadow under the stack (it's in the mockup and is not a border, so it
    stays).
- Detail text for the active project (title, year, blurb, links), where the mockup's
  paragraph sits. It crossfades when the active card changes.
- Data lives in `content/projects.ts`.

### About (`#about`)
- Left: **two rows of skill tiles** (squares holding icons). The top row scrolls left
  without end and the bottom row scrolls right. The track is duplicated so the loop has
  no seam. Hovering pauses a row.
  - CSS keyframes on `translateX(-50%)` with the content doubled. The second row uses
    `animation-direction: reverse`.
  - Icons come from Simple Icons, with data in `content/skills.ts`.
- Right column: lead paragraph, body paragraph, two images, then an experience list
  (role, date range, description). Data lives in `content/experience.ts`.

### Contact (`#contact`), overlay
- Not a full section. It's a **square card** (about `min(560px, 80vw)` wide) that
  **rises from the bottom of the screen and stops at the center**, over a scrim that
  dims the page behind it.
- **Scroll-driven at the end of the page.** A short spacer after About (about 100vh)
  gives it room. Scroll progress through the spacer moves the card from below the
  viewport to the center and fades the scrim in. Scrolling back up lowers it again.
- The Contact nav item and any "contact" links scroll to the end of that spacer, so the
  card arrives the same way.
- Contents are kept short: one line of lead text, email (copy on click), GitHub,
  LinkedIn, resume.
- `Esc` or clicking the scrim scrolls back to About.

## Mascot (`MODELSPEC.md`)

**Placement** is covered under Global behavior. It renders in two slots, the center of
Home and the bottom-right corner. Until step 9 both show a placeholder (a square head
with a `^_^` face).

**Built in code, not as a model file.** A cube head and two small sphere hands made
from three.js primitives. This keeps the model tiny, makes it easy to change, and means
it can never fall out of sync with the monotone theme (materials read the theme tokens).

- **Face** is a texture on the front of the cube, drawn on a 2D canvas: eyes, eyelashes,
  brows, mouth, in an emoticon style. Each expression is a short draw description, so
  swapping or blending faces just means redrawing the canvas. Expressions: smile,
  hello, curious (one eyebrow raised), angry, wow, cat face (`:3`), `-_-`, plus squint
  and sleepy for theme changes.
- **Hands** stay hidden (scaled down, tucked behind the head) unless an animation needs
  them: waving, holding the phone.
- **Phone** is a small box with a light-emitting face, a point light and some glow, used
  only in the distracted state.
- **Speech bubble** is an HTML element tied to the head's position (drei `<Html>`), so
  it uses the site font and theme. It shows the state's text: `hello!`, `...`, `?`,
  `%$^&!`, or nothing.
- **State machine** (`mascot/machine.ts`). Every state supplies a target pose (head
  rotation and offset, hand positions, face, bubble). The renderer always eases toward
  the current target, so any two states blend smoothly.

  | state | when | pose | face | bubble |
  |---|---|---|---|---|
  | `hello` | first load, coming back to the tab after a while | one hand waves | hello | `hello!` |
  | `idle` | default | gentle bob, faces the user | smile | `...` |
  | `curious` | random idle variation, cursor moving fast nearby | looks left, then right | brow raised | `?` |
  | `distracted` | random idle variation after a long idle | looks down at phone held in both hands, phone glows | cycles angry, wow, `:3`, `-_-` | `%$^&!` on angry, otherwise none |
  | `attentive` | pointer hovers the mascot (cuts in over any state) | still, faces the user | smile | `click to talk to me` |
  | `react` | theme switch, section change (short, then back) | small hop or squint | squint or sleepy | none |

- The head turns slightly toward the cursor in `idle` and `attentive`.
- **Click** opens the ChatOverlay. For now that overlay is a placeholder ("coming soon").
  The RAG chat about you, with easter eggs, comes later.
- The scene loads lazily after first paint. While the mascot is off-screen or the tab is
  hidden, `frameloop="demand"` keeps it from using any CPU.

## Mobile (no mockups, adapted from desktop)

Below about 768px:

- **Nav:** the rail becomes a compact horizontal row at the top under the logo, with the
  same sliding highlight.
- **ThemeSwitch:** stays in the top right as `light / dark`.
- **FixedTitle:** stays fixed bottom left, scaled with `clamp()` so it takes up no more
  than about 15% of the screen height. Content gets bottom padding to match.
- **Mascot:** centered on Home as on desktop. The corner copy shrinks to about 110px. The bubble moves to its
  left. Hover becomes tap: the first tap shows `tap to talk to me`, a second tap opens
  chat.
- **Projects:** still pinned and scroll-driven. Cards recede upward/backward instead of
  to the right, so they fit a narrow screen. Detail text goes below the stack.
- **About:** marquees go full width above the text column, and the two images stack.
- **Contact card:** full width minus the page margin, still rises to center.
- **Particles:** fewer of them (density scales with screen area).

## Blog

External link in the top right. A blog site of its own, following the same design rules,
comes later (designed separately or improvised).

## Stack

- **Vite + React + TypeScript.** Builds a static site, so it can be hosted anywhere.
- **Lenis** for smooth scroll and **GSAP + ScrollTrigger + Flip** for pinning,
  scroll-linked and layout animation.
- **three, @react-three/fiber, @react-three/drei** for the mascot, in a lazy-loaded chunk.
- Plain CSS with custom properties (CSS modules for each component). No UI kit.

## File layout

```
src/
  main.tsx
  App.tsx                  section order + fixed layers
  styles/
    tokens.css             theme tokens (light/dark), type scale, z-index, zones
    global.css             reset, base typography
  content/
    site.ts                name, intro, links (incl. blog URL)
    projects.ts
    skills.ts
    experience.ts
  lib/
    scroll.ts              Lenis instance + ScrollTrigger wiring + scrollTo helper
  hooks/
    useActiveSection.ts
    useTheme.ts
    useReducedMotion.ts
  components/
    chrome/                Logo, ThemeSwitch, ThemeDissolve, Nav, FixedTitle, BackToTop
    sections/              Home, Projects, About
    contact/               ContactOverlay
    projects/              ProjectStack, ProjectCard, ProjectDetail
    about/                 SkillMarquee, ExperienceList
    background/            Particles
    mascot/                Mascot (lazy), Head, Hands, Phone, Face (canvas texture),
                           Bubble, machine.ts
    chat/                  ChatOverlay (placeholder for now)
public/
  images/                  project + about images
```

## Build order

Each step leaves a working site.

1. ✅ **Scaffold.** Vite/React/TS, tokens, fonts, global styles, ThemeSwitch (plain swap
   for now).
2. ✅ **Skeleton.** Home, Projects and About with placeholder content, the contact spacer,
   fixed chrome in place, reserved zones visible while developing, Lenis scrolling.
3. ✅ **Navigation.** Active-section tracking, nav rail with sliding highlight,
   FixedTitle changes, BackToTop, mascot placement (Home center, corner peek and pop)
   with a placeholder.
4. **Home + Contact.** Real copy, display typography, contact card rising to center.
5. **About.** Skill marquees, experience list, images.
6. **Projects.** Pinned, scroll-driven stack and detail panel.
7. **Particles.** Background field with parallax.
8. **Theme dissolve.** Square-tile transition between themes.
9. **Mascot.** Head, face canvas, states and blending, bubble, hover and click.
10. **Mobile + polish.** Responsive layout, accessibility, reduced motion, performance,
    deploy.
11. **Later.** Chat overlay backed by RAG; blog.

## Current focus

Mechanics first. Content is placeholder until the site's behavior is done:

- **Name is redacted.** `site.name` in `src/content/site.ts` is empty, so `<Name>` shows a
  solid bar instead. Fill it in to reveal the name.
- **Projects are empty placeholder cards** until the stack mechanics work.

## Open questions (answer later)

- **Project content.** What projects go in the stack, and do they have images or
  screenshots?
- **Hosting.** Where will it be deployed (Vercel, Netlify, GitHub Pages, ...)? Only
  matters at step 10.
