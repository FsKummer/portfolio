import Phaser from 'phaser'
import { WORLD_TILE_SIZE } from '../data/worldMap'

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

    this.generateAvatarTexture(graphics, 'avatar-boy', 0x7bdff6, 0x102030, false)
    this.generateAvatarTexture(graphics, 'avatar-boy-step', 0x7bdff6, 0x102030, true)
    this.generateAvatarTexture(graphics, 'avatar-girl', 0xf7a1ff, 0x261335, false)
    this.generateAvatarTexture(graphics, 'avatar-girl-step', 0xf7a1ff, 0x261335, true)

    this.generateGroundTexture(graphics, 'grass-tile', 0x15261a, 0x25452c)
    this.generateGroundTexture(graphics, 'path-tile', 0x5a4931, 0x7b6647)
    this.generateGroundTexture(graphics, 'water-tile', 0x143656, 0x245786)
    this.generateCliffTexture(graphics)
    this.generateTreeTexture(graphics)
    this.generateHouseTexture(graphics, 'house-tile', 0x5f3141, 0xd3b88b)
    this.generateHouseTexture(graphics, 'library-tile', 0x31445f, 0xcfd8ea)
    this.generateHouseTexture(graphics, 'tavern-tile', 0x5f4b31, 0xe0c095)
    this.generateHouseTexture(graphics, 'shrine-tile', 0x3d365f, 0xe5d7ff)
    this.generateBoardTexture(graphics)
    this.generateGateTexture(graphics)

    graphics.destroy()
  }

  private generateAvatarTexture(
    graphics: Phaser.GameObjects.Graphics,
    textureKey: string,
    bodyColor: number,
    accentColor: number,
    stepping: boolean,
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

    if (stepping) {
      graphics.fillStyle(0x09111f)
      graphics.fillRect(8, 48, 8, 6)
      graphics.fillRect(28, 42, 8, 6)
    } else {
      graphics.fillStyle(0x09111f)
      graphics.fillRect(10, 44, 8, 8)
      graphics.fillRect(26, 44, 8, 8)
    }

    graphics.generateTexture(textureKey, 44, 56)
  }

  private generateGroundTexture(
    graphics: Phaser.GameObjects.Graphics,
    textureKey: string,
    baseColor: number,
    detailColor: number,
  ) {
    graphics.clear()
    graphics.fillStyle(baseColor)
    graphics.fillRect(0, 0, WORLD_TILE_SIZE, WORLD_TILE_SIZE)
    graphics.fillStyle(detailColor, 0.42)

    for (let index = 0; index < 12; index += 1) {
      graphics.fillCircle(
        Phaser.Math.Between(6, WORLD_TILE_SIZE - 6),
        Phaser.Math.Between(6, WORLD_TILE_SIZE - 6),
        Phaser.Math.Between(2, 6),
      )
    }

    graphics.generateTexture(textureKey, WORLD_TILE_SIZE, WORLD_TILE_SIZE)
  }

  private generateCliffTexture(graphics: Phaser.GameObjects.Graphics) {
    graphics.clear()
    graphics.fillStyle(0x1b2033)
    graphics.fillRect(0, 0, WORLD_TILE_SIZE, WORLD_TILE_SIZE)
    graphics.fillStyle(0x3c4966)
    graphics.fillRect(0, 0, WORLD_TILE_SIZE, 14)
    graphics.fillStyle(0x2a3248)

    for (let y = 18; y < WORLD_TILE_SIZE; y += 14) {
      graphics.fillRect(6, y, WORLD_TILE_SIZE - 12, 8)
    }

    graphics.generateTexture('cliff-tile', WORLD_TILE_SIZE, WORLD_TILE_SIZE)
  }

  private generateTreeTexture(graphics: Phaser.GameObjects.Graphics) {
    graphics.clear()
    graphics.fillStyle(0x17361f)
    graphics.fillRoundedRect(6, 4, 52, 38, 18)
    graphics.fillStyle(0x24522f)
    graphics.fillRoundedRect(12, 10, 40, 26, 12)
    graphics.fillStyle(0x53381f)
    graphics.fillRect(26, 40, 12, 18)
    graphics.generateTexture('tree-tile', WORLD_TILE_SIZE, WORLD_TILE_SIZE)
  }

  private generateHouseTexture(
    graphics: Phaser.GameObjects.Graphics,
    textureKey: string,
    roofColor: number,
    wallColor: number,
  ) {
    graphics.clear()
    graphics.fillStyle(roofColor)
    graphics.fillRoundedRect(6, 6, 52, 24, 6)
    graphics.fillStyle(wallColor)
    graphics.fillRect(12, 30, 40, 26)
    graphics.fillStyle(0x2b1c12)
    graphics.fillRect(26, 38, 12, 18)
    graphics.fillStyle(0xf0f4ff)
    graphics.fillRect(16, 36, 8, 8)
    graphics.fillRect(40, 36, 8, 8)
    graphics.generateTexture(textureKey, WORLD_TILE_SIZE, WORLD_TILE_SIZE)
  }

  private generateBoardTexture(graphics: Phaser.GameObjects.Graphics) {
    graphics.clear()
    graphics.fillStyle(0x5f4b31)
    graphics.fillRect(26, 42, 12, 18)
    graphics.fillStyle(0xbf9963)
    graphics.fillRoundedRect(10, 10, 44, 28, 4)
    graphics.fillStyle(0x2f2113)
    graphics.fillRect(16, 16, 32, 4)
    graphics.fillRect(16, 24, 24, 4)
    graphics.generateTexture('board-tile', WORLD_TILE_SIZE, WORLD_TILE_SIZE)
  }

  private generateGateTexture(graphics: Phaser.GameObjects.Graphics) {
    graphics.clear()
    graphics.fillStyle(0x24314a)
    graphics.fillRoundedRect(4, 8, 56, 48, 8)
    graphics.fillStyle(0x90a3ff)
    graphics.fillRect(28, 12, 8, 40)
    graphics.fillStyle(0x111827)
    graphics.fillRect(10, 20, 16, 28)
    graphics.fillRect(38, 20, 16, 28)
    graphics.generateTexture('gate-tile', WORLD_TILE_SIZE, WORLD_TILE_SIZE)
  }
}
