import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../core/config'

export class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super('character-select')
  }

  create() {
    this.cameras.main.setBackgroundColor('#070b18')

    this.add
      .text(GAME_WIDTH / 2, 124, 'choose your traveler', {
        fontFamily: 'monospace',
        fontSize: '30px',
        color: '#f4f7ff',
      })
      .setOrigin(0.5)

    this.createCard(GAME_WIDTH / 2 - 180, GAME_HEIGHT / 2, 'boy', '#7bdff6')
    this.createCard(GAME_WIDTH / 2 + 180, GAME_HEIGHT / 2, 'girl', '#f7a1ff')

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 72, 'left or right, then enter', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#bcc8f7',
      })
      .setOrigin(0.5)

    this.input.keyboard?.once('keydown-ENTER', () => {
      this.scene.start('world')
    })
  }

  private createCard(x: number, y: number, label: string, accent: string) {
    const panel = this.add.rectangle(x, y, 220, 280, 0x0f1730, 0.95)
    panel.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(accent).color)

    this.add.image(x, y - 26, 'player').setTintFill(0xffffff).setScale(3)

    this.add
      .text(x, y + 95, label, {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: accent,
      })
      .setOrigin(0.5)
  }
}
