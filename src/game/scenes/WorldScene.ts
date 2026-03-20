import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../core/config'

const PLAYER_SPEED = 240

export class WorldScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys

  private player?: Phaser.Physics.Arcade.Image

  private movementKeys?: {
    up: Phaser.Input.Keyboard.Key
    down: Phaser.Input.Keyboard.Key
    left: Phaser.Input.Keyboard.Key
    right: Phaser.Input.Keyboard.Key
  }

  constructor() {
    super('world')
  }

  create() {
    this.cameras.main.setBackgroundColor('#08101d')
    this.cursors = this.input.keyboard?.createCursorKeys()
    this.movementKeys = this.input.keyboard?.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D',
    }) as WorldScene['movementKeys']

    this.createGrid()

    this.player = this.physics.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'player')
    this.player.setCollideWorldBounds(true)
    this.player.setSize(20, 28)

    this.physics.world.setBounds(48, 48, GAME_WIDTH - 96, GAME_HEIGHT - 96)

    this.add
      .text(48, 40, 'world scene placeholder', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#dce4ff',
      })
      .setDepth(10)

    this.add
      .text(48, 66, 'move with arrows or WASD', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#8ea5ff',
      })
      .setDepth(10)
  }

  update() {
    if (!this.player) {
      return
    }

    const left = this.cursors?.left.isDown || this.movementKeys?.left.isDown
    const right = this.cursors?.right.isDown || this.movementKeys?.right.isDown
    const up = this.cursors?.up.isDown || this.movementKeys?.up.isDown
    const down = this.cursors?.down.isDown || this.movementKeys?.down.isDown

    let velocityX = 0
    let velocityY = 0

    if (left) velocityX = -PLAYER_SPEED
    if (right) velocityX = PLAYER_SPEED
    if (up) velocityY = -PLAYER_SPEED
    if (down) velocityY = PLAYER_SPEED

    this.player.setVelocity(velocityX, velocityY)
    this.player.setAlpha(velocityX === 0 && velocityY === 0 ? 0.92 : 1)
  }

  private createGrid() {
    for (let x = 48; x <= GAME_WIDTH - 48; x += 96) {
      for (let y = 48; y <= GAME_HEIGHT - 48; y += 96) {
        this.add.image(x, y, 'tile').setOrigin(0.5).setAlpha(0.36)
      }
    }
  }
}
