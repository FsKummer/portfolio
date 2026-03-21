import Phaser from 'phaser'
import {
  FLOOR_FRAMES,
  WORLD_DECORATIONS,
  WORLD_INTERACTIONS,
  WORLD_LAYOUT,
  WORLD_SPAWN,
  WORLD_TILE_SIZE,
  type InteractionZone,
} from '../data/worldMap'
import { loadVisitorProfile } from '../store/sessionStore'

type Direction = 'left' | 'up' | 'right' | 'down'

const PLAYER_SPEED = 140
const PLAYER_SCALE = 2.2

export class WorldScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys

  private player?: Phaser.Physics.Arcade.Sprite

  private movementKeys?: {
    up: Phaser.Input.Keyboard.Key
    down: Phaser.Input.Keyboard.Key
    left: Phaser.Input.Keyboard.Key
    right: Phaser.Input.Keyboard.Key
    interact: Phaser.Input.Keyboard.Key
  }

  private interactionPrompt?: Phaser.GameObjects.Text

  private dialogueBox?: Phaser.GameObjects.Container

  private dialogueBody?: Phaser.GameObjects.Text

  private activeZone?: InteractionZone

  private dialogueOpen = false

  private direction: Direction = 'down'

  private playerAnimPrefix: 'adam' | 'amelia' = 'adam'

  constructor() {
    super('world')
  }

  create() {
    const profile = loadVisitorProfile()

    this.playerAnimPrefix = profile.avatar === 'girl' ? 'amelia' : 'adam'

    this.cameras.main.setBackgroundColor('#0d1120')
    this.cursors = this.input.keyboard?.createCursorKeys()
    this.movementKeys = this.input.keyboard?.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D',
      interact: 'E',
    }) as WorldScene['movementKeys']

    const blockers = this.createWorld()
    this.createPlayer()
    this.physics.add.collider(this.player as Phaser.Physics.Arcade.Sprite, blockers)

    this.physics.world.setBounds(
      0,
      0,
      WORLD_LAYOUT[0].length * WORLD_TILE_SIZE,
      WORLD_LAYOUT.length * WORLD_TILE_SIZE,
    )

    this.cameras.main.setBounds(
      0,
      0,
      WORLD_LAYOUT[0].length * WORLD_TILE_SIZE,
      WORLD_LAYOUT.length * WORLD_TILE_SIZE,
    )
    this.cameras.main.startFollow(this.player as Phaser.Physics.Arcade.Sprite, true, 0.12, 0.12)
    this.cameras.main.setZoom(1.8)
    this.cameras.main.roundPixels = true

    this.createHud(profile.visitorName || 'traveler')
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

    let velocityX = 0
    let velocityY = 0

    if (left) {
      velocityX = -PLAYER_SPEED
      this.direction = 'left'
    }
    if (right) {
      velocityX = PLAYER_SPEED
      this.direction = 'right'
    }
    if (up) {
      velocityY = -PLAYER_SPEED
      this.direction = 'up'
    }
    if (down) {
      velocityY = PLAYER_SPEED
      this.direction = 'down'
    }

    this.player.setVelocity(velocityX, velocityY)

    const body = this.player.body as Phaser.Physics.Arcade.Body
    if (velocityX !== 0 && velocityY !== 0) {
      body.velocity.normalize().scale(PLAYER_SPEED)
    }

    if (velocityX !== 0 || velocityY !== 0) {
      this.playWalkAnimation()
    } else {
      this.playIdleAnimation()
    }

    this.updateActiveZone()
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(
      WORLD_SPAWN.x,
      WORLD_SPAWN.y,
      `${this.playerAnimPrefix}-idle`,
      18,
    )
    this.player.setCollideWorldBounds(true)
    this.player.setScale(PLAYER_SCALE)
    this.player.setDepth(10)

    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setSize(8, 6)
    body.setOffset(4, 24)

    this.playIdleAnimation()
  }

  private createWorld() {
    const blockers = this.physics.add.staticGroup()

    WORLD_LAYOUT.forEach((row, rowIndex) => {
      row.split('').forEach((token, columnIndex) => {
        const x = columnIndex * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2
        const y = rowIndex * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2
        const floorFrame = FLOOR_FRAMES[token as keyof typeof FLOOR_FRAMES] ?? FLOOR_FRAMES['.']

        this.add
          .image(x, y, 'room-builder-tiles', floorFrame)
          .setDisplaySize(WORLD_TILE_SIZE, WORLD_TILE_SIZE)
          .setDepth(0)

        if (token !== '#') {
          return
        }

        const blocker = this.add.rectangle(x, y, WORLD_TILE_SIZE, WORLD_TILE_SIZE, 0x000000, 0)
        this.physics.add.existing(blocker, true)
        blockers.add(blocker)
      })
    })

    WORLD_DECORATIONS.forEach((decoration) => {
      const x = decoration.x * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2
      const y = decoration.y * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2
      const texture = decoration.tileset === 'interiors' ? 'interiors-tiles' : 'room-builder-tiles'

      this.add
        .image(x, y, texture, decoration.frame)
        .setDisplaySize(WORLD_TILE_SIZE, WORLD_TILE_SIZE)
        .setDepth(4)

      if (!decoration.solid) {
        return
      }

      const blocker = this.add.rectangle(x, y, WORLD_TILE_SIZE * 0.8, WORLD_TILE_SIZE * 0.5, 0x000000, 0)
      this.physics.add.existing(blocker, true)
      blockers.add(blocker)
    })

    return blockers
  }

  private createHud(visitorName: string) {
    const helpPanel = this.add.container(0, 0).setScrollFactor(0).setDepth(20)
    const panelBackground = this.add
      .rectangle(164, 64, 288, 72, 0x050913, 0.74)
      .setStrokeStyle(1, 0x90a3ff, 0.35)
    const welcomeText = this.add.text(44, 38, 'welcome, ' + visitorName, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#edf2ff',
    })
    const controlsText = this.add.text(44, 60, 'move: wasd/arrows   interact: e', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#9bb1ff',
    })

    helpPanel.add([panelBackground, welcomeText, controlsText])

    this.interactionPrompt = this.add
      .text(384, 416, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#d7ddf7',
        backgroundColor: '#08101d',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(20)
      .setVisible(false)

    const dialogueBackground = this.add
      .rectangle(384, 364, 700, 104, 0x050913, 0.92)
      .setStrokeStyle(2, 0x90a3ff, 0.35)
    const dialogueTitle = this.add.text(50, 324, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#9bb1ff',
    })
    this.dialogueBody = this.add.text(50, 348, '', {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#edf2ff',
      wordWrap: { width: 620 },
      lineSpacing: 6,
    })
    const dialogueHint = this.add
      .text(712, 404, 'press enter to close', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#9bb1ff',
      })
      .setOrigin(1, 0.5)

    this.dialogueBox = this.add
      .container(0, 0, [dialogueBackground, dialogueTitle, this.dialogueBody, dialogueHint])
      .setScrollFactor(0)
      .setDepth(25)
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
    if (this.dialogueOpen) {
      this.closeDialogue()
      return
    }

    if (!this.activeZone || !this.dialogueBox || !this.dialogueBody) {
      return
    }

    const title = this.dialogueBox.getData('title') as Phaser.GameObjects.Text

    title.setText(this.activeZone.label)
    this.dialogueBody.setText(this.activeZone.message)
    this.dialogueBox.setVisible(true)
    this.dialogueOpen = true
    this.interactionPrompt?.setVisible(false)
  }

  private closeDialogue() {
    this.dialogueOpen = false
    this.dialogueBox?.setVisible(false)
  }

  private playIdleAnimation() {
    this.player?.anims.play(`${this.playerAnimPrefix}-idle-${this.direction}`, true)
  }

  private playWalkAnimation() {
    this.player?.anims.play(`${this.playerAnimPrefix}-walk-${this.direction}`, true)
  }

  private updateActiveZone() {
    if (!this.player || !this.interactionPrompt) {
      return
    }

    const playerBounds = this.player.getBounds()
    const playerCenterX = playerBounds.centerX
    const playerCenterY = playerBounds.centerY

    this.activeZone = WORLD_INTERACTIONS.find((zone) => {
      const zoneRect = new Phaser.Geom.Rectangle(zone.x, zone.y, zone.width, zone.height)
      return zoneRect.contains(playerCenterX, playerCenterY)
    })

    if (!this.activeZone) {
      this.interactionPrompt.setVisible(false)
      return
    }

    this.interactionPrompt
      .setText('press e: ' + this.activeZone.label)
      .setVisible(true)
  }
}
