import Phaser from 'phaser'
import { createGameConfig } from './config'

const GAME_PARENT_ID = 'game-root'

export function mountGame(container: HTMLDivElement): Phaser.Game {
  container.id = GAME_PARENT_ID
  return new Phaser.Game(createGameConfig(GAME_PARENT_ID))
}

export function destroyGame(game: Phaser.Game | null) {
  if (!game) {
    return
  }

  game.destroy(true)
}
