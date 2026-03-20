import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot')
  }

  create() {
    this.createTextures()
    this.scene.start('intro')
  }

  private createTextures() {
    const graphics = this.add.graphics()

    graphics.fillStyle(0xf4f7ff)
    graphics.fillCircle(4, 4, 4)
    graphics.generateTexture('star', 8, 8)

    graphics.clear()
    graphics.fillStyle(0x7bdff6)
    graphics.fillRoundedRect(0, 0, 28, 36, 8)
    graphics.fillStyle(0x102030)
    graphics.fillRect(8, 8, 12, 12)
    graphics.fillStyle(0xeef2ff)
    graphics.fillRect(11, 23, 6, 9)
    graphics.generateTexture('player', 28, 36)

    graphics.clear()
    graphics.fillStyle(0x0d1325)
    graphics.fillRect(0, 0, 96, 96)
    graphics.lineStyle(2, 0x1d2d54, 1)
    graphics.strokeRect(0, 0, 96, 96)
    graphics.generateTexture('tile', 96, 96)

    graphics.destroy()
  }
}
