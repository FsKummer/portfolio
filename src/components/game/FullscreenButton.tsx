import { useEffect, useState, type RefObject } from 'react'

type FullscreenTarget = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void
}

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
}

type FullscreenButtonProps = {
  targetRef: RefObject<HTMLElement | null>
}

function getFullscreenElement() {
  const fullscreenDocument = document as FullscreenDocument

  return document.fullscreenElement ?? fullscreenDocument.webkitFullscreenElement ?? null
}

function canRequestFullscreen(target: HTMLElement | null) {
  if (!target) {
    return false
  }

  const fullscreenTarget = target as FullscreenTarget

  return Boolean(fullscreenTarget.requestFullscreen ?? fullscreenTarget.webkitRequestFullscreen)
}

async function requestFullscreen(target: HTMLElement) {
  const fullscreenTarget = target as FullscreenTarget

  if (fullscreenTarget.requestFullscreen) {
    await fullscreenTarget.requestFullscreen({ navigationUI: 'hide' })
    return
  }

  await fullscreenTarget.webkitRequestFullscreen?.()
}

async function exitFullscreen() {
  const fullscreenDocument = document as FullscreenDocument

  if (document.exitFullscreen) {
    await document.exitFullscreen()
    return
  }

  await fullscreenDocument.webkitExitFullscreen?.()
}

export function FullscreenButton({ targetRef }: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const updateState = () => {
      setIsFullscreen(Boolean(getFullscreenElement()))
      setIsSupported(canRequestFullscreen(targetRef.current))
    }

    updateState()

    document.addEventListener('fullscreenchange', updateState)
    document.addEventListener('webkitfullscreenchange', updateState)
    document.addEventListener('fullscreenerror', updateState)
    document.addEventListener('webkitfullscreenerror', updateState)
    window.addEventListener('resize', updateState)

    return () => {
      document.removeEventListener('fullscreenchange', updateState)
      document.removeEventListener('webkitfullscreenchange', updateState)
      document.removeEventListener('fullscreenerror', updateState)
      document.removeEventListener('webkitfullscreenerror', updateState)
      window.removeEventListener('resize', updateState)
    }
  }, [targetRef])

  const toggleFullscreen = async () => {
    const target = targetRef.current

    if (!target) {
      return
    }

    try {
      if (getFullscreenElement()) {
        await exitFullscreen()
      } else {
        await requestFullscreen(target)
      }
    } catch (error) {
      console.warn('Unable to toggle fullscreen mode.', error)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <button
      type="button"
      className={['fullscreen-toggle', isFullscreen ? 'is-fullscreen' : ''].join(' ')}
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      aria-pressed={isFullscreen}
      title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={toggleFullscreen}
    >
      <span className="fullscreen-toggle__icon" aria-hidden="true">
        <span className="fullscreen-toggle__corner fullscreen-toggle__corner--top-left" />
        <span className="fullscreen-toggle__corner fullscreen-toggle__corner--top-right" />
        <span className="fullscreen-toggle__corner fullscreen-toggle__corner--bottom-left" />
        <span className="fullscreen-toggle__corner fullscreen-toggle__corner--bottom-right" />
      </span>
    </button>
  )
}
