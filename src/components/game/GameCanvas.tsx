import { useEffect, useRef } from 'react'
import type Phaser from 'phaser'
import { destroyGame, mountGame } from '../../game/core/bootGame'
import { MobileControllerOverlay } from './MobileControllerOverlay'

export function GameCanvas() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (!mountRef.current || gameRef.current) {
      return
    }

    gameRef.current = mountGame(mountRef.current)

    return () => {
      destroyGame(gameRef.current)
      gameRef.current = null
    }
  }, [])

  return (
    <div className="game-canvas">
      <div ref={mountRef} className="game-canvas__mount" />
      <MobileControllerOverlay />
    </div>
  )
}
