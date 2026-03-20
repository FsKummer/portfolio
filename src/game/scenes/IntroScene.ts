import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../core/config'

export class IntroScene extends Phaser.Scene {
  constructor() {
    super('intro')
  }

  create() {
    this.cameras.main.setBackgroundColor('#02040d')
    this.createStarfield()

    this.add
      .text(GAME_WIDTH / 2, 188, 'hey there traveler', {
        fontFamily: 'monospace',
        fontSize: '34px',
        color: '#edf2ff',
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, 248, 'scene pipeline booted', {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#8aa2ff',
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 84, 'press space to continue', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#d7ddf7',
      })
      .setOrigin(0.5)

    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start('character-select')
    })
  }

  private createStarfield() {
    for (let index = 0; index < 120; index += 1) {
      const x = Phaser.Math.Between(0, GAME_WIDTH)
      const y = Phaser.Math.Between(0, GAME_HEIGHT)
      const star = this.add.image(x, y, 'star')
      const scale = Phaser.Math.FloatBetween(0.18, 0.8)

      star.setScale(scale)
      star.setAlpha(Phaser.Math.FloatBetween(0.3, 0.95))

      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.15, 1),
        duration: Phaser.Math.Between(900, 2400),
        yoyo: true,
        repeat: -1,
      })
    }
  }
}
