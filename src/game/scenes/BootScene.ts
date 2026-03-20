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

    this.generateAvatarTexture(graphics, 'avatar-boy', 0x7bdff6, 0x102030)
    this.generateAvatarTexture(graphics, 'avatar-girl', 0xf7a1ff, 0x261335)

    graphics.clear()
    graphics.fillStyle(0x0d1325)
    graphics.fillRect(0, 0, 96, 96)
    graphics.lineStyle(2, 0x1d2d54, 1)
    graphics.strokeRect(0, 0, 96, 96)
    graphics.generateTexture('tile', 96, 96)

    graphics.destroy()
  }

  private generateAvatarTexture(
    graphics: Phaser.GameObjects.Graphics,
    textureKey: string,
    bodyColor: number,
    accentColor: number,
  ) {
    graphics.clear()
    graphics.fillStyle(bodyColor)
    graphics.fillRoundedRect(2, 2, 40, 52, 12)
    graphics.fillStyle(accentColor)
    graphics.fillCircle(14, 20, 3)
    graphics.fillCircle(30, 20, 3)
    graphics.fillRoundedRect(14, 30, 16, 6, 3)
    graphics.fillStyle(0xeef2ff)
    graphics.fillRect(16, 40, 12, 10)
    graphics.generateTexture(textureKey, 44, 56)
  }
}
