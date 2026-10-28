import type { Face } from './machine'

/**
 * Draws the mascot's face onto a square 2D canvas (the front of the head) in an emoticon
 * style. Each face is a combination of eyes, brows and mouth; `blink` closes open eyes.
 */

type Eyes = 'open' | 'happy' | 'closed' | 'line' | 'round' | 'squint'
type Brows = 'none' | 'raised' | 'angry'
type Mouth = 'smile' | 'open' | 'flat' | 'o' | 'cat' | 'zigzag' | 'side'

const FACES: Record<Face, { eyes: Eyes; brows: Brows; mouth: Mouth; blush: boolean }> = {
  smile: { eyes: 'open', brows: 'none', mouth: 'smile', blush: true },
  happy: { eyes: 'happy', brows: 'none', mouth: 'open', blush: true },
  curious: { eyes: 'open', brows: 'raised', mouth: 'side', blush: false },
  angry: { eyes: 'open', brows: 'angry', mouth: 'zigzag', blush: false },
  wow: { eyes: 'round', brows: 'none', mouth: 'o', blush: false },
  cat: { eyes: 'open', brows: 'none', mouth: 'cat', blush: true },
  meh: { eyes: 'line', brows: 'none', mouth: 'flat', blush: false },
  squint: { eyes: 'squint', brows: 'none', mouth: 'smile', blush: true },
  sleepy: { eyes: 'closed', brows: 'none', mouth: 'o', blush: false },
}

/** Whether this face has open eyes that can blink. */
export const canBlink = (face: Face) => FACES[face].eyes === 'open'

export const FACE_SIZE = 256
const EYE_Y = 112
const EYE_X = [84, 172]
const MOUTH_Y = 172

export function drawFace(ctx: CanvasRenderingContext2D, face: Face, blink: boolean, head: string, ink: string) {
  const { eyes, brows, mouth, blush } = FACES[face]
  const c = ctx
  c.fillStyle = head
  c.fillRect(0, 0, FACE_SIZE, FACE_SIZE)
  c.strokeStyle = ink
  c.fillStyle = ink
  c.lineWidth = 8
  c.lineCap = 'round'
  c.lineJoin = 'round'

  const line = (...points: number[]) => {
    c.beginPath()
    c.moveTo(points[0], points[1])
    for (let i = 2; i < points.length; i += 2) c.lineTo(points[i], points[i + 1])
    c.stroke()
  }

  EYE_X.forEach((x, i) => {
    // -1 for the left eye, 1 for the right: lashes and squints point outward.
    const side = i === 0 ? -1 : 1
    const kind = blink && eyes === 'open' ? 'closed' : eyes
    if (kind === 'open') {
      c.beginPath()
      c.ellipse(x, EYE_Y, 10, 15, 0, 0, Math.PI * 2)
      c.fill()
    } else if (kind === 'happy') {
      line(x - 17, EYE_Y + 7, x, EYE_Y - 9, x + 17, EYE_Y + 7)
    } else if (kind === 'closed') {
      c.beginPath()
      c.arc(x, EYE_Y - 6, 16, Math.PI * 0.15, Math.PI * 0.85)
      c.stroke()
    } else if (kind === 'line') {
      line(x - 17, EYE_Y, x + 17, EYE_Y)
    } else if (kind === 'round') {
      c.beginPath()
      c.arc(x, EYE_Y, 16, 0, Math.PI * 2)
      c.stroke()
    } else if (kind === 'squint') {
      line(x + side * 15, EYE_Y - 12, x - side * 13, EYE_Y, x + side * 15, EYE_Y + 12)
    }
    // Lashes on the outer corner, except on squints and plain lines.
    if (kind === 'open' || kind === 'happy' || kind === 'closed') {
      c.lineWidth = 5
      const ly = kind === 'open' ? EYE_Y - 10 : kind === 'closed' ? EYE_Y + 2 : EYE_Y + 2
      const lx = x + side * (kind === 'open' ? 9 : 16)
      line(lx, ly, lx + side * 10, ly - 7)
      line(lx - side * 4, ly - 6, lx + side * 4, ly - 15)
      c.lineWidth = 8
    }

    if (brows === 'raised' && side === 1) line(x - 18, EYE_Y - 34, x, EYE_Y - 42, x + 18, EYE_Y - 36)
    if (brows === 'angry') line(x - side * 20, EYE_Y - 36, x + side * 16, EYE_Y - 26)
  })

  if (blush) {
    c.save()
    c.globalAlpha = 0.35
    c.lineWidth = 5
    for (const x of EYE_X) {
      const cx = x + (x < FACE_SIZE / 2 ? -14 : 14)
      line(cx - 10, EYE_Y + 34, cx - 4, EYE_Y + 26)
      line(cx, EYE_Y + 34, cx + 6, EYE_Y + 26)
    }
    c.restore()
  }

  const mx = FACE_SIZE / 2
  if (mouth === 'smile') {
    c.beginPath()
    c.arc(mx, MOUTH_Y - 14, 20, Math.PI * 0.2, Math.PI * 0.8)
    c.stroke()
  } else if (mouth === 'open') {
    c.beginPath()
    c.moveTo(mx - 20, MOUTH_Y - 6)
    c.lineTo(mx + 20, MOUTH_Y - 6)
    c.arc(mx, MOUTH_Y - 6, 20, 0, Math.PI)
    c.fill()
  } else if (mouth === 'flat') {
    line(mx - 16, MOUTH_Y, mx + 16, MOUTH_Y)
  } else if (mouth === 'o') {
    c.beginPath()
    c.arc(mx, MOUTH_Y, 9, 0, Math.PI * 2)
    c.stroke()
  } else if (mouth === 'cat') {
    c.beginPath()
    c.arc(mx - 9, MOUTH_Y - 4, 9, 0, Math.PI)
    c.arc(mx + 9, MOUTH_Y - 4, 9, 0, Math.PI)
    c.stroke()
  } else if (mouth === 'zigzag') {
    line(mx - 22, MOUTH_Y + 4, mx - 11, MOUTH_Y - 4, mx, MOUTH_Y + 4, mx + 11, MOUTH_Y - 4, mx + 22, MOUTH_Y + 4)
  } else if (mouth === 'side') {
    line(mx - 4, MOUTH_Y + 2, mx + 18, MOUTH_Y - 4)
  }
}
