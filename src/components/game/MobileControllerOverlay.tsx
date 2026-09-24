import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import {
  clearVirtualControlInputs,
  getVirtualControlsSnapshot,
  type HeldVirtualControlButton,
  pressHeldVirtualControl,
  queueVirtualControlAction,
  releaseHeldVirtualControl,
  subscribeVirtualControls,
  supportsVirtualController,
  type VirtualActionButton,
} from '../../game/store/virtualControls'

type ControllerLayoutState = {
  isPortrait: boolean
  isTouchDevice: boolean
}

const DEFAULT_ACTION_STATE: Record<VirtualActionButton, boolean> = {
  a: false,
  b: false,
  y: false,
}

function getDpadButtons(event: ReactPointerEvent<HTMLDivElement>): HeldVirtualControlButton[] {
  const bounds = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - (bounds.left + bounds.width / 2)
  const y = event.clientY - (bounds.top + bounds.height / 2)
  const deadZone = Math.min(bounds.width, bounds.height) * 0.12

  if (Math.hypot(x, y) <= deadZone) {
    return []
  }

  // Eight equal sectors let a single thumb hold both axes between the arrows.
  const diagonalThreshold = Math.tan(Math.PI / 8)
  const buttons: HeldVirtualControlButton[] = []

  if (Math.abs(x) > Math.abs(y) * diagonalThreshold) {
    buttons.push(x < 0 ? 'left' : 'right')
  }
  if (Math.abs(y) > Math.abs(x) * diagonalThreshold) {
    buttons.push(y < 0 ? 'up' : 'down')
  }

  return buttons
}

function getControllerLayoutState(): ControllerLayoutState {
  if (typeof window === 'undefined') {
    return {
      isPortrait: false,
      isTouchDevice: false,
    }
  }

  return {
    isPortrait:
      window.matchMedia('(orientation: portrait)').matches ||
      window.innerHeight > window.innerWidth,
    isTouchDevice: supportsVirtualController(),
  }
}

export function MobileControllerOverlay() {
  const snapshot = useSyncExternalStore(
    subscribeVirtualControls,
    getVirtualControlsSnapshot,
    getVirtualControlsSnapshot,
  )
  const [layoutState, setLayoutState] = useState(getControllerLayoutState)
  const [activeActions, setActiveActions] =
    useState<Record<VirtualActionButton, boolean>>(DEFAULT_ACTION_STATE)
  const heldPointersRef = useRef(new Map<number, HeldVirtualControlButton[]>())
  const actionPointersRef = useRef(new Map<number, VirtualActionButton>())

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const updateLayoutState = () => {
      setLayoutState(getControllerLayoutState())
    }

    const clearInputs = () => {
      clearVirtualControlInputs()
      setActiveActions({ ...DEFAULT_ACTION_STATE })
      heldPointersRef.current.clear()
      actionPointersRef.current.clear()
    }

    const coarsePointerQuery = window.matchMedia('(any-pointer: coarse)')
    const portraitQuery = window.matchMedia('(orientation: portrait)')

    window.addEventListener('resize', updateLayoutState)
    window.addEventListener('blur', clearInputs)
    document.addEventListener('visibilitychange', clearInputs)
    coarsePointerQuery.addEventListener('change', updateLayoutState)
    portraitQuery.addEventListener('change', updateLayoutState)

    return () => {
      clearInputs()
      window.removeEventListener('resize', updateLayoutState)
      window.removeEventListener('blur', clearInputs)
      document.removeEventListener('visibilitychange', clearInputs)
      coarsePointerQuery.removeEventListener('change', updateLayoutState)
      portraitQuery.removeEventListener('change', updateLayoutState)
    }
  }, [])

  const updateHeldPointer = (pointerId: number, buttons: HeldVirtualControlButton[]) => {
    const previousButtons = heldPointersRef.current.get(pointerId) ?? []
    heldPointersRef.current.set(pointerId, buttons)

    for (const button of previousButtons) {
      const buttonStillHeld = Array.from(heldPointersRef.current.values()).some((heldButtons) =>
        heldButtons.includes(button),
      )
      if (!buttonStillHeld) {
        releaseHeldVirtualControl(button)
      }
    }

    buttons.forEach(pressHeldVirtualControl)
  }

  const releaseHeldPointer = (pointerId: number) => {
    updateHeldPointer(pointerId, [])
    heldPointersRef.current.delete(pointerId)
  }

  const releaseActionPointer = (pointerId: number) => {
    const button = actionPointersRef.current.get(pointerId)

    if (!button) {
      return
    }

    actionPointersRef.current.delete(pointerId)

    const buttonStillActive = Array.from(actionPointersRef.current.values()).includes(button)
    if (buttonStillActive) {
      return
    }

    setActiveActions((currentState) => {
      if (!currentState[button]) {
        return currentState
      }

      return {
        ...currentState,
        [button]: false,
      }
    })
  }

  const bindHeldButton = (button: HeldVirtualControlButton) => ({
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()

      event.currentTarget.setPointerCapture(event.pointerId)
      updateHeldPointer(event.pointerId, [button])
    },
    onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()
      releaseHeldPointer(event.pointerId)
    },
    onPointerCancel: (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()
      releaseHeldPointer(event.pointerId)
    },
    onLostPointerCapture: (event: ReactPointerEvent<HTMLButtonElement>) => {
      releaseHeldPointer(event.pointerId)
    },
  })

  const startDpadPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    updateHeldPointer(event.pointerId, getDpadButtons(event))
  }

  const moveDpadPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!heldPointersRef.current.has(event.pointerId)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    updateHeldPointer(event.pointerId, getDpadButtons(event))
  }

  const endDpadPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    releaseHeldPointer(event.pointerId)
  }

  const bindActionButton = (button: VirtualActionButton) => ({
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()

      event.currentTarget.setPointerCapture(event.pointerId)
      actionPointersRef.current.set(event.pointerId, button)
      queueVirtualControlAction(button)
      setActiveActions((currentState) => ({
        ...currentState,
        [button]: true,
      }))
    },
    onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()
      releaseActionPointer(event.pointerId)
    },
    onPointerCancel: (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()
      releaseActionPointer(event.pointerId)
    },
    onLostPointerCapture: (event: ReactPointerEvent<HTMLButtonElement>) => {
      releaseActionPointer(event.pointerId)
    },
  })

  if (!layoutState.isTouchDevice || snapshot.context === null) {
    return null
  }

  return (
    <div
      className={[
        'mobile-controller',
        layoutState.isPortrait ? 'mobile-controller--portrait' : 'mobile-controller--landscape',
      ].join(' ')}
    >
      {layoutState.isPortrait ? (
        <div className="mobile-controller__rotate-hint">rotate for the full controller layout</div>
      ) : null}

      <div
        className="mobile-controller__cluster mobile-controller__cluster--dpad"
        role="group"
        aria-label="Movement pad: slide to change direction"
        onPointerDown={startDpadPointer}
        onPointerMove={moveDpadPointer}
        onPointerUp={endDpadPointer}
        onPointerCancel={endDpadPointer}
        onLostPointerCapture={endDpadPointer}
      >
        <button
          type="button"
          aria-label="Move up"
          className={[
            'mobile-controller__button',
            'mobile-controller__button--dpad',
            'mobile-controller__button--up',
            snapshot.held.up ? 'is-active' : '',
          ].join(' ')}
          aria-pressed={snapshot.held.up}
        >
          ↑
        </button>
        <button
          type="button"
          aria-label="Move left"
          className={[
            'mobile-controller__button',
            'mobile-controller__button--dpad',
            'mobile-controller__button--left',
            snapshot.held.left ? 'is-active' : '',
          ].join(' ')}
          aria-pressed={snapshot.held.left}
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Move right"
          className={[
            'mobile-controller__button',
            'mobile-controller__button--dpad',
            'mobile-controller__button--right',
            snapshot.held.right ? 'is-active' : '',
          ].join(' ')}
          aria-pressed={snapshot.held.right}
        >
          →
        </button>
        <button
          type="button"
          aria-label="Move down"
          className={[
            'mobile-controller__button',
            'mobile-controller__button--dpad',
            'mobile-controller__button--down',
            snapshot.held.down ? 'is-active' : '',
          ].join(' ')}
          aria-pressed={snapshot.held.down}
        >
          ↓
        </button>
      </div>

      <div className="mobile-controller__cluster mobile-controller__cluster--actions">
        <button
          type="button"
          aria-label="Sprint"
          className={[
            'mobile-controller__button',
            'mobile-controller__button--face',
            'mobile-controller__button--x',
            snapshot.held.x ? 'is-active' : '',
          ].join(' ')}
          {...bindHeldButton('x')}
        >
          X
        </button>
        <button
          type="button"
          aria-label="Toggle help"
          className={[
            'mobile-controller__button',
            'mobile-controller__button--face',
            'mobile-controller__button--y',
            activeActions.y ? 'is-active' : '',
          ].join(' ')}
          {...bindActionButton('y')}
        >
          Y
        </button>
        <button
          type="button"
          aria-label="Interact"
          className={[
            'mobile-controller__button',
            'mobile-controller__button--face',
            'mobile-controller__button--a',
            activeActions.a ? 'is-active' : '',
          ].join(' ')}
          {...bindActionButton('a')}
        >
          A
        </button>
        <button
          type="button"
          aria-label="Back"
          className={[
            'mobile-controller__button',
            'mobile-controller__button--face',
            'mobile-controller__button--b',
            activeActions.b ? 'is-active' : '',
          ].join(' ')}
          {...bindActionButton('b')}
        >
          B
        </button>
      </div>
    </div>
  )
}
