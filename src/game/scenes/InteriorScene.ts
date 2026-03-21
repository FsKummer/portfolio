import Phaser from 'phaser'
import { INTERIORS, type InteriorDefinition, type InteriorObject } from '../data/interiors'

type Direction = 'left' | 'up' | 'right' | 'down'

type InteriorSceneData = {
  interiorId: InteriorDefinition['id']
  returnTo: { x: number; y: number }
  playerAnimPrefix: 'adam' | 'amelia'
}

const TILE_SIZE = 48
const PLAYER_SPEED = 150
const PLAYER_RUN_SPEED = 240
const PLAYER_SCALE = 3

export class InteriorScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private movementKeys?: {
    up: Phaser.Input.Keyboard.Key
    down: Phaser.Input.Keyboard.Key
    left: Phaser.Input.Keyboard.Key
    right: Phaser.Input.Keyboard.Key
    interact: Phaser.Input.Keyboard.Key
    sprint: Phaser.Input.Keyboard.Key
  }
  private player?: Phaser.Physics.Arcade.Sprite
  private blockers?: Phaser.Physics.Arcade.StaticGroup
  private interactives: Array<InteriorObject & { area: Phaser.Geom.Rectangle }> = []
  private activeInteractive?: (InteriorObject & { area: Phaser.Geom.Rectangle })
  private prompt?: Phaser.GameObjects.Text
  private dialogueBox?: Phaser.GameObjects.Container
  private dialogueBody?: Phaser.GameObjects.Text
  private dialogueOpen = false
  private direction: Direction = 'down'
  private returnTo = { x: 0, y: 0 }
  private playerAnimPrefix: 'adam' | 'amelia' = 'adam'
  private interior!: InteriorDefinition

  constructor() {
    super('interior')
  }

  init(data: InteriorSceneData) {
    this.interior = INTERIORS[data.interiorId]
    this.returnTo = data.returnTo
    this.playerAnimPrefix = data.playerAnimPrefix
    this.interactives = []
    this.activeInteractive = undefined
    this.dialogueOpen = false
    this.direction = 'down'
  }

  create() {
    this.cameras.main.setBackgroundColor('#050913')
    this.cursors = this.input.keyboard?.createCursorKeys()
    this.movementKeys = this.input.keyboard?.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D',
      interact: 'E',
      sprint: 'SHIFT',
    }) as InteriorScene['movementKeys']

    this.blockers = this.physics.add.staticGroup()
    this.buildRoom()
    this.createPlayer()
    this.physics.add.collider(this.player as Phaser.Physics.Arcade.Sprite, this.blockers)

    const width = 12 * TILE_SIZE
    const height = 9 * TILE_SIZE
    this.physics.world.setBounds(0, 0, width, height)
    this.cameras.main.setBounds(0, 0, width, height)
    this.cameras.main.startFollow(this.player as Phaser.Physics.Arcade.Sprite, true, 0.12, 0.12)
    this.cameras.main.setZoom(1.6)
    this.cameras.main.roundPixels = true

    this.createUi()
    this.bindInteractionInput()
  }

  update() {
    if (!this.player) {
      return
    }

    if (this.dialogueOpen) {
      this.player.setVelocity(0, 0)
      this.playIdleAnimation()
      return
    }

    const left = this.cursors?.left.isDown || this.movementKeys?.left.isDown
    const right = this.cursors?.right.isDown || this.movementKeys?.right.isDown
    const up = this.cursors?.up.isDown || this.movementKeys?.up.isDown
    const down = this.cursors?.down.isDown || this.movementKeys?.down.isDown
    const sprinting = Boolean(this.movementKeys?.sprint.isDown)
    const currentSpeed = sprinting ? PLAYER_RUN_SPEED : PLAYER_SPEED

    let velocityX = 0
    let velocityY = 0

    if (left) {
      velocityX = -currentSpeed
      this.direction = 'left'
    }
    if (right) {
      velocityX = currentSpeed
      this.direction = 'right'
    }
    if (up) {
      velocityY = -currentSpeed
      this.direction = 'up'
    }
    if (down) {
      velocityY = currentSpeed
      this.direction = 'down'
    }

    this.player.setVelocity(velocityX, velocityY)

    const body = this.player.body as Phaser.Physics.Arcade.Body
    if (velocityX !== 0 && velocityY !== 0) {
      body.velocity.normalize().scale(currentSpeed)
    }

    if (velocityX !== 0 || velocityY !== 0) {
      this.playWalkAnimation()
    } else {
      this.playIdleAnimation()
    }

    this.updateInteractive()
  }

  private buildRoom() {
    for (let y = 0; y < 9; y += 1) {
      for (let x = 0; x < 12; x += 1) {
        this.add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 'room-builder-tiles', this.interior.floorFrame)
          .setDisplaySize(TILE_SIZE, TILE_SIZE)
          .setDepth(0)
      }
    }

    this.interior.objects.forEach((object) => this.addInteriorObject(object))
  }

  private addInteriorObject(object: InteriorObject) {
    const worldX = object.x * TILE_SIZE + TILE_SIZE / 2
    const worldY = object.y * TILE_SIZE + TILE_SIZE / 2

    if (object.kind === 'npc' && object.sprite) {
      const npc = this.add.sprite(worldX, worldY + 8, object.sprite, 18)
      npc.setScale(2.4)
      npc.setDepth(worldY + 12)
    } else if (object.kind !== 'exit') {
      this.add.image(worldX, worldY, 'interiors-tiles', object.frame ?? 0)
        .setDisplaySize(TILE_SIZE, TILE_SIZE)
        .setDepth(worldY + 8)
    }

    if (object.solid) {
      const blocker = this.add.rectangle(worldX, worldY + 6, TILE_SIZE * 0.78, TILE_SIZE * 0.45, 0x000000, 0)
      this.physics.add.existing(blocker, true)
      this.blockers?.add(blocker)
    }

    if (object.kind === 'npc' || object.kind === 'sign' || object.kind === 'exit') {
      this.interactives.push({
        ...object,
        area: new Phaser.Geom.Rectangle(worldX - TILE_SIZE * 0.45, worldY - TILE_SIZE * 0.45, TILE_SIZE * 0.9, TILE_SIZE * 0.9),
      })
    }
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(
      this.interior.spawn.x * TILE_SIZE + TILE_SIZE / 2,
      this.interior.spawn.y * TILE_SIZE + TILE_SIZE / 2,
      `${this.playerAnimPrefix}-idle`,
      18,
    )
    this.player.setCollideWorldBounds(true)
    this.player.setScale(PLAYER_SCALE)
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setSize(8, 6)
    body.setOffset(4, 24)
    this.playIdleAnimation()
  }

  private createUi() {
    this.prompt = this.add.text(384, 408, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#d7ddf7',
      backgroundColor: '#08101d',
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2000).setVisible(false)

    const dialogueBackground = this.add
      .rectangle(384, 344, 700, 120, 0x050913, 0.94)
      .setStrokeStyle(2, 0x90a3ff, 0.35)
    const dialogueTitle = this.add.text(50, 294, this.interior.title, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#9bb1ff',
    })
    this.dialogueBody = this.add.text(50, 320, '', {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#edf2ff',
      wordWrap: { width: 620 },
      lineSpacing: 6,
    })
    const dialogueHint = this.add.text(712, 388, 'press enter to close', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#9bb1ff',
    }).setOrigin(1, 0.5)

    this.dialogueBox = this.add.container(0, 0, [dialogueBackground, dialogueTitle, this.dialogueBody, dialogueHint])
      .setScrollFactor(0)
      .setDepth(2001)
      .setVisible(false)
    this.dialogueBox.setData('title', dialogueTitle)
  }

  private bindInteractionInput() {
    this.input.keyboard?.on('keydown-E', () => this.handleInteraction())
    this.input.keyboard?.on('keydown-SPACE', () => this.handleInteraction())
    this.input.keyboard?.on('keydown-ENTER', () => {
      if (!this.dialogueOpen) {
        return
      }
      this.closeDialogue()
    })
  }

  private handleInteraction() {
    if (!this.activeInteractive) {
      return
    }

    if (this.activeInteractive.kind === 'exit') {
      this.scene.start('world', { spawn: this.returnTo })
      return
    }

    if (!this.dialogueBox || !this.dialogueBody) {
      return
    }

    const title = this.dialogueBox.getData('title') as Phaser.GameObjects.Text
    title.setText(this.activeInteractive.label || this.interior.title)
    this.dialogueBody.setText(this.activeInteractive.message || '')
    this.dialogueBox.setVisible(true)
    this.dialogueOpen = true
    this.prompt?.setVisible(false)
  }

  private closeDialogue() {
    this.dialogueOpen = false
    this.dialogueBox?.setVisible(false)
  }

  private updateInteractive() {
    if (!this.player || !this.prompt) {
      return
    }

    const bounds = this.player.getBounds()
    const centerX = bounds.centerX
    const centerY = bounds.centerY

    this.activeInteractive = this.interactives.find((interactive) => interactive.area.contains(centerX, centerY))

    if (!this.activeInteractive) {
      this.prompt.setVisible(false)
      return
    }

    const label = this.activeInteractive.kind === 'exit'
      ? 'leave house'
      : this.activeInteractive.label || 'inspect'

    this.prompt.setText('press e: ' + label).setVisible(true)
  }

  private getAnimationDirection() {
    if (this.direction === 'left') return 'right'
    if (this.direction === 'right') return 'left'
    return this.direction
  }

  private playIdleAnimation() {
    this.player?.anims.play(`${this.playerAnimPrefix}-idle-${this.getAnimationDirection()}`, true)
  }

  private playWalkAnimation() {
    this.player?.anims.play(`${this.playerAnimPrefix}-walk-${this.getAnimationDirection()}`, true)
  }
}
