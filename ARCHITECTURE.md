# Site architecture

A one-page personal site: minimal, monotone, smooth. Three scrolling sections (Home,
Projects, About) and a Contact overlay that rises over the end of the page. Fixed chrome
(logo, nav, theme switch, large section title, back to top) sits on top of the scrolling
content, with a particle field behind it and a small interactive 3D mascot in the
bottom-right corner.

Designs: `designs/website/*.png` (low fidelity, light and dark). `stack.png` is the
reference for the projects stack. Mascot details: `MODELSPEC.md`.

## Design rules (overrides to the mockups)

- **No borders, no rounded corners.** The mockups use pill shapes (the active nav
  item). We use flat filled rectangles with `border-radius: 0` everywhere, which matches
  the square particles and skill tiles.
- **No Back to Top button.** It's redundant with the nav.
- **Nav is always a small rail on the right edge**, Home included. The large centered
  nav in the Home mockup is out; the mascot takes the center of Home instead.
- **No "welcome."** Home drops the top-right headline. The FixedTitle greeting does that
  job.
- **Name is "stephen"** (the mockups say "chaka").
- **No visible scrollbar.** The page scrolls normally; the bar is hidden.
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
                           Nav (right edge)
5  <ContactOverlay>        scrim + centered square card, rises from the bottom
                           (under the fixed chrome, so the nav stays usable)
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
| Intro hand-off | Home's intro stays fixed as you scroll on, dimmed outside Home. About's lead is the same text: when it scrolls up to the intro, the intro lights up and rides along with About, as if the paragraph moved into About. | One fixed copy (`intro/FixedIntro.tsx`) positioned each frame from two invisible slots (Home's intro, About's lead), which keep the layout and the text for screen readers. It publishes `--intro-band` so Projects keeps clear of it. |
| Section scrolling | One gesture (wheel flick, swipe, arrow/page key) glides to the next or previous section, like clicking it in the nav, so you never stop halfway (e.g. with the contact card half up). Sections taller than the viewport (About) scroll freely inside; the gesture that reaches their edge stops there and the next one moves on; a gesture that starts within 15% of a screen of the edge goes straight on. Free scrolling inside runs at 1.4× wheel speed. Home/End jump to the ends. Nav links and closing the contact card use the same glide (0.5s, ease in-out). | Lenis's `virtualScroll` hook (`lib/sectionSnap.ts`) claims gestures and snaps with `scrollTo`; a 180ms pause between wheel events, a change of direction, or a jump in wheel speed (a fresh flick over a fading inertia tail) starts a new gesture, so trackpad inertia can't skip sections but a new flick isn't swallowed. Lenis runs on GSAP's ticker. |
| Cursor | A dot at the pointer with a larger, fainter circle easing behind it. Mouse devices only. | `Cursor.tsx`, one `requestAnimationFrame` loop |
| Active section | Switches as soon as the next section peeks in: the section covering a line 15% in from the edge you're scrolling toward (near the bottom scrolling down, near the top scrolling up). Drives everything below. | Checked on every ScrollTrigger update, feeding a tiny store (`useActiveSection`) |
| Nav | Small text list (Home, Projects, About, Contact), fixed to the right edge on every section. The active item has a filled square highlight. To move, it stretches to cover the next item, then lets go of the old one: a square take on the mockup's gooey pill, since a goo filter would round the corners. | GSAP timeline for the stretch |
| FixedTitle | Fixed bottom left, **behind** the content, so sections scroll over it. Shows "hello, i am / stephen" on Home, then "projects" and "about". Contact has no title. On a section change the old lines drop out of the bottom edge of the viewport and the new ones rise in from there. | `position: fixed` at `--z-backdrop`, text keyed on active section, GSAP |
| ThemeSwitch | A text toggle in the top right next to Blog: `light / dark`, with the current theme at full contrast and the other muted. Easy to read, and it fits the type-led look. Switching runs a **square-tile dissolve**: a grid of squares flips from the clicked point outward, revealing the new theme (the same square motif as the particles). The mascot reacts briefly (squints going light, sleepy face going dark). Starts from `prefers-color-scheme` and is saved in localStorage. | `data-theme` on `<html>` swaps the tokens. The dissolve (`lib/themeDissolve.ts`) is a view transition: the new-theme snapshot (on top by default) shows only through a `clip-path: path()` of 72px tiles rebuilt each frame, each growing from its center on a delay set by its distance from the click (0.28s per tile, 0.5s ripple). Reduced motion gets the default crossfade; browsers without view transitions switch instantly. Particles and mascot read the tokens too. |
| Particles | Small squares that drift slowly. Each has a depth value: deeper squares are smaller and fainter and move less on scroll (parallax). About one per 14,000px² of screen, mostly deep. Still under reduced motion. | One fixed 2D canvas (`background/Particles.tsx`) on GSAP's ticker, the same frame loop as Lenis, using `window.scrollY` for parallax. The `--particle` token sets the color, re-read when `data-theme` changes. The ticker stops with the tab hidden. |
| Mascot | Lives at the **center of Home** and scrolls with it. Once it has scrolled out of view, a copy in the **bottom-right corner** peeks in (just the top of its head, leaning in), then comes all the way out and stays fixed there. Scrolling back to Home makes the corner one **pop and vanish**; the Home one was there all along. See the Mascot section for the model itself. | Two slots (`HomeMascot`, `CornerMascot`). An IntersectionObserver on the Home slot toggles the corner timeline. Each slot has its own small canvas (`Mascot.tsx`, lazy-loaded, rendering only while on screen); both follow one shared state machine, so they always agree. |
| Loader | From the first byte, a blank page in the current theme with the logo's asterisk turning. It fades out once the fonts and the mascot have loaded (8s at most), so nothing shows in a fallback font or as the placeholder. Scrolling is locked and the mascot's hello waits until then. | Inline markup and CSS in `index.html`; `lib/ready.ts` exports `appReady` and fades the loader. The mascot chunk is fetched as the app starts. Fonts are self-hosted subsets of Iosevka Aile (about 86KB per weight instead of 1.2MB), regenerated with `scripts/subset-fonts.sh`. |
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
- **Its own control, not the page scroll.** Projects is one screen; the stack keeps its
  own current card. A wheel gesture over the stack (vertical or sideways) moves one card;
  past the first or last card it scrolls the page on as usual. Dragging sideways moves it
  live and settles on a card; clicking a card or Left/Right also moves it. Glides take the
  same 0.5s as section glides. Navigating to another section never steps through cards.
  - Each card's pose (x offset, depth, `rotateY`, opacity, depth fog) is worked out from
    `index - current`. Cards share one `perspective` and are layered by z-index rather
    than `preserve-3d` depth sorting, which browsers don't apply consistently. Passed
    cards slide off to the left toward the viewer and fade.
  - Stack and details sit side by side above `--intro-band`, the strip where the dimmed
    intro rests (see Intro below).
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
- No title. The card holds only the links, as a moderate-size list centered in the
  near-black square: Email (copies on click), GitHub, LinkedIn, Resume, X.
- `Esc` or clicking the scrim scrolls back to About.

## Mascot (`MODELSPEC.md`)

**Placement** is covered under Global behavior. It renders in two slots, the center of
Home and the bottom-right corner. The flat placeholder (a square head with a `^_^` face)
shows only until the 3D chunk has loaded.

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
- **Speech bubble** is an HTML element over the top of the canvas (no drei), so it uses
  the site font and theme. It shows the state's text: `hello!`, `...`, `?`,
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
- **Click** will open the ChatOverlay (step 11). For now it says `coming soon!`.
  The RAG chat about you, with easter eggs, comes later.
- The scene loads lazily after first paint. While the mascot is off-screen or the tab is
  hidden, `frameloop="never"` keeps it from using any CPU.
- **Built:** `machine.ts` (states, timers, theme reaction; `__mascot.<state>()` in dev to
  jump to a state), `face.ts` (the 2D face drawing), `MascotModel.tsx` (poses and easing,
  blinking), `Mascot.tsx` (canvas, bubble, cursor tracking). Colors come from the
  `--mascot` and `--mascot-ink` tokens; the face is unlit so it keeps its exact colors.

## Mobile (no mockups, adapted from desktop)

Below 1024px wide (phones, tablets in portrait) or 500px tall (phones in landscape):

- **Nav:** a compact row under the logo, with the same sliding highlight. The header and
  nav sit on a page-colored strip that fades out at the bottom, so content scrolling up
  slides under them.
- **ThemeSwitch:** stays in the top right as `light / dark`.
- **FixedTitle:** stays fixed bottom left, scaled with `clamp()`. Content gets bottom
  padding to match. Hidden on screens under 500px tall, where there's no room for it.
- **Intro:** fixed on Home as on desktop, but outside Home it hides instead of dimming
  (six faint lines would cover half the screen). It still rides into About.
- **Mascot:** in the flow above the intro on Home, so short screens can't overlap them.
  The corner copy shrinks to 110px. Touch has no hover: the first tap shows
  `tap to talk to me`, a second tap acts as a click.
- **Projects:** stack on top (smaller card, three cards behind instead of five), details
  below. The section grows past one screen when it needs to, and scrolls inside.
- **About:** marquees go full width above the text column.
- **Contact card:** full width minus the page margin, still rises to center.
- **Particles:** fewer of them (density scales with screen area).
- Checked at 390×844 (phone), 820×1180 (tablet portrait) and 844×390 (phone landscape),
  including swipes (one swipe, one section), free scrolling in About, sideways drags on
  the stack and taps on the mascot.

## Blog

External link in the top right. A blog site of its own, following the same design rules,
comes later (designed separately or improvised).

## Stack

- **Vite + React + TypeScript.** Builds a static site, so it can be hosted anywhere.
- **Lenis** for smooth scroll and **GSAP + ScrollTrigger + Flip** for pinning,
  scroll-linked and layout animation.
- **three, @react-three/fiber** for the mascot, in a lazy-loaded chunk (no drei).
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
    chrome/                Logo, ThemeSwitch, ThemeDissolve, Nav, FixedTitle, Cursor
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
   FixedTitle changes, mascot placement (Home center, corner peek and pop)
   with a placeholder.
4. ✅ **Home + Contact.** Real copy, display typography, contact card rising to center.
5. ✅ **About.** Skill marquees, experience list, images.
6. ✅ **Projects.** Pinned, scroll-driven stack and detail panel.
7. ✅ **Particles.** Background field with parallax.
8. ✅ **Theme dissolve.** Square-tile transition between themes.
9. ✅ **Mascot.** Head, face canvas, states and blending, bubble, hover and click.
10. **Mobile + polish.** (Mobile done; the polish pass is still to do.) Responsive layout, accessibility, reduced motion, performance,
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
