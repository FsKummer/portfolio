import Phaser from 'phaser'
import { BootScene } from '../scenes/BootScene'
import { CharacterSelectScene } from '../scenes/CharacterSelectScene'
import { IntroScene } from '../scenes/IntroScene'
import { WorldScene } from '../scenes/WorldScene'

export const GAME_WIDTH = 1280
export const GAME_HEIGHT = 720

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#030510',
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    dom: {
      createContainer: true,
    },
    scene: [BootScene, IntroScene, CharacterSelectScene, WorldScene],
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
  }
}
