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
  const heldPointersRef = useRef(new Map<number, HeldVirtualControlButton>())
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

  const releaseHeldPointer = (pointerId: number) => {
    const button = heldPointersRef.current.get(pointerId)

    if (!button) {
      return
    }

    heldPointersRef.current.delete(pointerId)

    const buttonStillHeld = Array.from(heldPointersRef.current.values()).includes(button)
    if (!buttonStillHeld) {
      releaseHeldVirtualControl(button)
    }
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
      heldPointersRef.current.set(event.pointerId, button)
      pressHeldVirtualControl(button)
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

      <div className="mobile-controller__cluster mobile-controller__cluster--dpad">
        <button
          type="button"
          aria-label="Move up"
          className={[
            'mobile-controller__button',
            'mobile-controller__button--dpad',
            'mobile-controller__button--up',
            snapshot.held.up ? 'is-active' : '',
          ].join(' ')}
          {...bindHeldButton('up')}
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
          {...bindHeldButton('left')}
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
          {...bindHeldButton('right')}
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
          {...bindHeldButton('down')}
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
