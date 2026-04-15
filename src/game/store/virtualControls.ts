export type VirtualControlButton =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'a'
  | 'b'
  | 'x'
  | 'y'

export type GameplayControlContext = 'world' | 'interior' | null

export type HeldVirtualControlButton = Extract<
  VirtualControlButton,
  'up' | 'down' | 'left' | 'right' | 'x'
>

export type VirtualActionButton = Extract<VirtualControlButton, 'a' | 'b' | 'y'>

type VirtualControlsSnapshot = {
  context: GameplayControlContext
  held: Record<HeldVirtualControlButton, boolean>
}

const DEFAULT_HELD_STATE: Record<HeldVirtualControlButton, boolean> = {
  up: false,
  down: false,
  left: false,
  right: false,
  x: false,
}

let snapshot: VirtualControlsSnapshot = {
  context: null,
  held: DEFAULT_HELD_STATE,
}

const queuedActions: VirtualActionButton[] = []
const listeners = new Set<() => void>()

function emitSnapshot() {
  listeners.forEach((listener) => listener())
}

function updateHeldButton(button: HeldVirtualControlButton, isPressed: boolean) {
  if (snapshot.held[button] === isPressed) {
    return
  }

  snapshot = {
    ...snapshot,
    held: {
      ...snapshot.held,
      [button]: isPressed,
    },
  }

  emitSnapshot()
}

export function supportsVirtualController() {
  if (typeof window === 'undefined') {
    return false
  }

  const supportsCoarsePointer = window.matchMedia('(any-pointer: coarse)').matches
  const supportsTouchEvents = 'ontouchstart' in window
  const hasTouchPoints = navigator.maxTouchPoints > 0

  return supportsCoarsePointer || supportsTouchEvents || hasTouchPoints
}

export function subscribeVirtualControls(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function getVirtualControlsSnapshot() {
  return snapshot
}

export function setGameplayControlContext(context: GameplayControlContext) {
  if (snapshot.context === context) {
    return
  }

  snapshot = {
    ...snapshot,
    context,
  }

  emitSnapshot()
}

export function pressHeldVirtualControl(button: HeldVirtualControlButton) {
  updateHeldButton(button, true)
}

export function releaseHeldVirtualControl(button: HeldVirtualControlButton) {
  updateHeldButton(button, false)
}

export function isHeldVirtualControlPressed(button: HeldVirtualControlButton) {
  return snapshot.held[button]
}

export function queueVirtualControlAction(button: VirtualActionButton) {
  queuedActions.push(button)
}

export function consumeQueuedVirtualControlAction(button: VirtualActionButton) {
  const actionIndex = queuedActions.indexOf(button)

  if (actionIndex === -1) {
    return false
  }

  queuedActions.splice(actionIndex, 1)
  return true
}

export function clearVirtualControlInputs() {
  const hasQueuedActions = queuedActions.length > 0
  const hasHeldInputs = Object.values(snapshot.held).some(Boolean)

  if (hasQueuedActions) {
    queuedActions.length = 0
  }

  if (!hasHeldInputs) {
    return
  }

  snapshot = {
    ...snapshot,
    held: DEFAULT_HELD_STATE,
  }

  emitSnapshot()
}
