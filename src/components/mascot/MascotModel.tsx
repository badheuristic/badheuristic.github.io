import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { canBlink, drawFace, FACE_SIZE } from './face'
import { getSnapshot, poke, setHover, useMascot } from './machine'

const HEAD = 1.5
const HAND = 0.22
// How quickly the pose catches up with its target (higher is snappier).
const EASE = 6
// Blinks happen every this many seconds (random in range) and last BLINK_S.
const BLINK_EVERY: [number, number] = [2.5, 6]
const BLINK_S = 0.13
// The phone body stays near-black in both themes, so its lit screen always stands out.
const PHONE_BODY = '#141414'
// How strongly the phone's glow lights the bottom of the face.
const FACE_GLOW = 0.45

/** A vertical gradient, clear at the top and white at the bottom: the phone's light on the face. */
function glowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createLinearGradient(0, 0, 0, 64)
  gradient.addColorStop(0.35, 'rgba(255,255,255,0)')
  gradient.addColorStop(1, 'rgba(255,255,255,1)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1, 64)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export type Colors = { head: string; ink: string }
/** Where the pointer is relative to the mascot: -1..1 on each axis, roughly. */
export type Pointer = { x: number; y: number }

type Vec = [number, number, number]
type Pose = {
  y: number
  yaw: number
  pitch: number
  roll: number
  right: Vec
  left: Vec
  hands: number
  phone: number
}

// Hidden hands tuck in behind the head.
const TUCKED_RIGHT: Vec = [0.55, -0.35, -0.5]
const TUCKED_LEFT: Vec = [-0.55, -0.35, -0.5]

/** The pose a state asks for, `s` seconds into it at clock time `t`. */
function targetPose(state: string, s: number, t: number, look: Pointer, still: boolean): Pose {
  const bob = still ? 0 : Math.sin(t * 1.6) * 0.06
  const pose: Pose = {
    y: bob,
    yaw: look.x * 0.35,
    pitch: -look.y * 0.2,
    roll: 0,
    right: TUCKED_RIGHT,
    left: TUCKED_LEFT,
    hands: 0,
    phone: 0,
  }
  switch (state) {
    case 'hello': {
      const wave = still ? 0 : Math.sin(s * 10)
      pose.roll = 0.08
      pose.right = [1.15 + wave * 0.08, 0.2 + Math.abs(wave) * 0.06, 0.25]
      pose.hands = 1
      break
    }
    case 'curious':
      // Looks one way, then the other.
      pose.yaw = s < CURIOUS_TURN_S ? -0.6 : 0.6
      pose.roll = s < CURIOUS_TURN_S ? 0.1 : -0.1
      pose.pitch = -0.05
      break
    case 'distracted':
      // Looking down at the phone held in both hands.
      pose.yaw = 0
      pose.pitch = 0.5
      pose.right = [0.38, -0.82, 0.9]
      pose.left = [-0.38, -0.82, 0.9]
      pose.hands = 1
      pose.phone = 1
      break
    case 'attentive':
      pose.y = 0
      break
    case 'react':
      // A small hop.
      pose.y = still ? 0 : Math.sin(Math.min(s / 0.4, 1) * Math.PI) * 0.25
      pose.yaw = 0
      pose.pitch = 0
      break
  }
  return pose
}
const CURIOUS_TURN_S = 1.6

export function MascotModel({ colors, pointer, still }: { colors: Colors; pointer: React.RefObject<Pointer>; still: boolean }) {
  const { face } = useMascot()
  const root = useRef<THREE.Group>(null)
  const head = useRef<THREE.Mesh>(null)
  const right = useRef<THREE.Mesh>(null)
  const left = useRef<THREE.Mesh>(null)
  const phone = useRef<THREE.Group>(null)
  const glow = useRef<THREE.PointLight>(null)
  const faceGlow = useRef<THREE.MeshBasicMaterial>(null)
  const faceGlowMap = useMemo(() => glowTexture(), [])
  useEffect(() => () => faceGlowMap.dispose(), [faceGlowMap])
  const blink = useRef({ on: false, next: 2 })

  const canvas = useMemo(() => {
    const el = document.createElement('canvas')
    el.width = el.height = FACE_SIZE
    return el
  }, [])
  const texture = useMemo(() => {
    const map = new THREE.CanvasTexture(canvas)
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 4
    return map
  }, [canvas])
  useEffect(() => () => texture.dispose(), [texture])

  const redraw = (blinking: boolean) => {
    drawFace(canvas.getContext('2d')!, face, blinking, colors.head, colors.ink)
    // Flagging a three.js texture for re-upload is how it's meant to be refreshed.
    // oxlint-disable-next-line react/immutability
    texture.needsUpdate = true
  }
  // Redraw on a new face or theme. Reads only current values, so it's safe to run each time.
  useEffect(() => redraw(blink.current.on))

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const snap = getSnapshot()
    const s = (performance.now() - snap.since) / 1000
    const lookAt = snap.state === 'idle' || snap.state === 'attentive' || snap.state === 'hello'
    const pose = targetPose(snap.state, s, t, lookAt ? pointer.current : { x: 0, y: 0 }, still)
    const k = still ? 30 : EASE
    const damp = (from: number, to: number) => THREE.MathUtils.damp(from, to, k, delta)

    const r = root.current!
    r.position.y = damp(r.position.y, pose.y)
    const h = head.current!
    h.rotation.y = damp(h.rotation.y, pose.yaw)
    h.rotation.x = damp(h.rotation.x, pose.pitch)
    h.rotation.z = damp(h.rotation.z, pose.roll)
    for (const [mesh, target] of [
      [right.current!, pose.right],
      [left.current!, pose.left],
    ] as const) {
      mesh.position.set(damp(mesh.position.x, target[0]), damp(mesh.position.y, target[1]), damp(mesh.position.z, target[2]))
    }
    // Only the waving hand shows in hello.
    const leftShown = snap.state === 'distracted' ? 1 : 0
    right.current!.scale.setScalar(damp(right.current!.scale.x, pose.hands))
    left.current!.scale.setScalar(damp(left.current!.scale.x, leftShown))
    phone.current!.scale.setScalar(damp(phone.current!.scale.x, pose.phone))
    glow.current!.intensity = phone.current!.scale.x * 6
    faceGlow.current!.opacity = phone.current!.scale.x * FACE_GLOW

    // Blinking, for faces with open eyes.
    const b = blink.current
    if (b.on && t > b.next) {
      b.on = false
      b.next = t + BLINK_EVERY[0] + Math.random() * (BLINK_EVERY[1] - BLINK_EVERY[0])
      redraw(false)
    } else if (!b.on && t > b.next && canBlink(snap.face) && !still) {
      b.on = true
      b.next = t + BLINK_S
      redraw(true)
    }
  })

  return (
    <group ref={root}>
      <mesh
        ref={head}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        onClick={poke}
      >
        <boxGeometry args={[HEAD, HEAD, HEAD]} />
        {/* Box faces in order +x, -x, +y, -y, +z (front), -z. The face is unlit so it keeps
            its exact colors; the other sides take the light, which shows the cube's shape. */}
        {[0, 1, 2, 3, 4, 5].map((i) =>
          i === 4 ? (
            <meshBasicMaterial key={i} attach={`material-${i}`} map={texture} />
          ) : (
            <meshLambertMaterial key={i} attach={`material-${i}`} color={colors.head} />
          ),
        )}
        {/* The phone's light on the face. The face itself is unlit, so this adds it on top. */}
        <mesh position={[0, 0, HEAD / 2 + 0.002]}>
          <planeGeometry args={[HEAD, HEAD]} />
          <meshBasicMaterial
            ref={faceGlow}
            map={faceGlowMap}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </mesh>
      <mesh ref={right} position={TUCKED_RIGHT} scale={0}>
        <sphereGeometry args={[HAND, 24, 16]} />
        <meshLambertMaterial color={colors.head} />
      </mesh>
      <mesh ref={left} position={TUCKED_LEFT} scale={0}>
        <sphereGeometry args={[HAND, 24, 16]} />
        <meshLambertMaterial color={colors.head} />
      </mesh>
      {/* The phone: a slab with a glowing screen facing the head, lighting the face. */}
      <group ref={phone} position={[0, -0.78, 0.95]} rotation={[-1.0, 0, 0]} scale={0}>
        <mesh>
          <boxGeometry args={[0.5, 0.85, 0.06]} />
          <meshLambertMaterial color={PHONE_BODY} />
        </mesh>
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[0.42, 0.74]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <pointLight ref={glow} position={[0, 0, 0.4]} intensity={0} distance={2.5} decay={1} />
      </group>
    </group>
  )
}
