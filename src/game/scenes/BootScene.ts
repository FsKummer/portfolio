import Phaser from 'phaser'

const DIRECTION_SEGMENTS = {
  left: { start: 0, end: 5 },
  up: { start: 6, end: 11 },
  right: { start: 12, end: 17 },
  down: { start: 18, end: 23 },
} as const

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot')
  }

  preload() {
    this.load.spritesheet('adam-idle', '/assets/sprites/adam_idle_anim_16x16.png', {
      frameWidth: 16,
      frameHeight: 32,
    })
    this.load.spritesheet('adam-run', '/assets/sprites/adam_run_16x16.png', {
      frameWidth: 16,
      frameHeight: 32,
    })
    this.load.spritesheet('amelia-idle', '/assets/sprites/amelia_idle_anim_16x16.png', {
      frameWidth: 16,
      frameHeight: 32,
    })
    this.load.spritesheet('amelia-run', '/assets/sprites/amelia_run_16x16.png', {
      frameWidth: 16,
      frameHeight: 32,
    })
    this.load.spritesheet('alex-idle', '/assets/sprites/alex_idle_anim_16x16.png', {
      frameWidth: 16,
      frameHeight: 32,
    })
    this.load.spritesheet('bob-idle', '/assets/sprites/bob_idle_anim_16x16.png', {
      frameWidth: 16,
      frameHeight: 32,
    })
    this.load.image('world-map', '/assets/maps/game_map.png')
    this.load.image('skills-interior-map', '/assets/maps/skills-interior.png')
    this.load.text('skills-interior-json', '/assets/maps/skills-interior.json')
    this.load.image('education-interior-map', '/assets/maps/education-interior.png')
    this.load.text('education-interior-json', '/assets/maps/education-interior.json')
    this.load.image('school-house-map', '/assets/maps/school-house.png')
    this.load.text('school-house-json', '/assets/maps/school-house.json')
    this.load.image('gym-map', '/assets/maps/gym.png')
    this.load.text('gym-json', '/assets/maps/gym.json')
    this.load.spritesheet('room-builder-tiles', '/assets/tilesets/room_builder_free_32x32.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('interiors-tiles', '/assets/tilesets/interiors_free_32x32.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
  }

  create() {
    this.createTextures()
    this.createCharacterAnimations('adam')
    this.createCharacterAnimations('amelia')
    this.scene.start('intro')
  }

  private createTextures() {
    const graphics = this.add.graphics()

    graphics.fillStyle(0xf4f7ff)
    graphics.fillCircle(4, 4, 4)
    graphics.generateTexture('star', 8, 8)

    graphics.destroy()
  }

  private createCharacterAnimations(characterKey: 'adam' | 'amelia') {
    const idleSheet = `${characterKey}-idle`
    const runSheet = `${characterKey}-run`

    Object.entries(DIRECTION_SEGMENTS).forEach(([direction, range]) => {
      this.anims.create({
        key: `${characterKey}-idle-${direction}`,
        frames: this.anims.generateFrameNumbers(idleSheet, {
          start: range.start,
          end: range.end,
        }),
        frameRate: 6,
        repeat: -1,
      })

      this.anims.create({
        key: `${characterKey}-walk-${direction}`,
        frames: this.anims.generateFrameNumbers(runSheet, {
          start: range.start,
          end: range.end,
        }),
        frameRate: 10,
        repeat: -1,
      })
    })
  }
}
