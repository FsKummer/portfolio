import Phaser from 'phaser'
import {
  WORLD_INTERACTIONS,
  WORLD_LAYOUT,
  WORLD_SPAWN,
  WORLD_TILE_SIZE,
  type InteractionZone,
} from '../data/worldMap'
import { loadVisitorProfile } from '../store/sessionStore'

const PLAYER_SPEED = 240
const WALK_FRAME_DURATION = 180

export class WorldScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys

  private player?: Phaser.Physics.Arcade.Image

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

  private walkStep = false

  private walkElapsed = 0

  private avatarBaseTexture = 'avatar-boy'

  private avatarStepTexture = 'avatar-boy-step'

  constructor() {
    super('world')
  }

  create() {
    const profile = loadVisitorProfile()

    this.avatarBaseTexture = profile.avatar === 'girl' ? 'avatar-girl' : 'avatar-boy'
    this.avatarStepTexture = profile.avatar === 'girl' ? 'avatar-girl-step' : 'avatar-boy-step'

    this.cameras.main.setBackgroundColor('#08101d')
    this.cursors = this.input.keyboard?.createCursorKeys()
    this.movementKeys = this.input.keyboard?.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D',
      interact: 'E',
    }) as WorldScene['movementKeys']

    this.player = this.physics.add.image(
      WORLD_SPAWN.x,
      WORLD_SPAWN.y,
      this.avatarBaseTexture,
    )
    this.player.setCollideWorldBounds(true)
    this.player.setScale(1.15)
    this.player.setDepth(4)

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setSize(28, 44)
    playerBody.setOffset(8, 10)

    const blockers = this.createWorld()
    this.physics.add.collider(this.player, blockers)

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
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12)
    this.cameras.main.setZoom(1.15)
    this.cameras.main.roundPixels = true

    this.createHud(profile.visitorName || 'traveler')
    this.bindInteractionInput()
  }

  update(_: number, delta: number) {
    if (!this.player) {
      return
    }

    if (this.dialogueOpen) {
      this.player.setVelocity(0, 0)
      this.player.setTexture(this.avatarBaseTexture)
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

    if (velocityX !== 0 && velocityY !== 0) {
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body
      playerBody.velocity.normalize().scale(PLAYER_SPEED)
    }

    this.updateWalkVisuals(delta, velocityX !== 0 || velocityY !== 0)
    this.updateActiveZone()
  }

  private createWorld() {
    const blockers = this.physics.add.staticGroup()

    WORLD_LAYOUT.forEach((row, rowIndex) => {
      row.split('').forEach((token, columnIndex) => {
        const x = columnIndex * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2
        const y = rowIndex * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2

        this.add
          .image(x, y, this.getGroundTexture(token))
          .setDisplaySize(WORLD_TILE_SIZE, WORLD_TILE_SIZE)
          .setDepth(0)

        const blockerTexture = this.getBlockerTexture(token)

        if (!blockerTexture) {
          return
        }

        const blocker = blockers
          .create(x, y, blockerTexture)
          .setDisplaySize(WORLD_TILE_SIZE, WORLD_TILE_SIZE)
          .setDepth(token === 't' ? 3 : 2)

        const blockerBody = blocker.body as Phaser.Physics.Arcade.StaticBody

        if (token === 't') {
          blockerBody.setSize(WORLD_TILE_SIZE * 0.58, WORLD_TILE_SIZE * 0.4)
          blockerBody.setOffset(WORLD_TILE_SIZE * 0.21, WORLD_TILE_SIZE * 0.52)
        } else if (token === 'b') {
          blockerBody.setSize(WORLD_TILE_SIZE * 0.45, WORLD_TILE_SIZE * 0.28)
          blockerBody.setOffset(WORLD_TILE_SIZE * 0.28, WORLD_TILE_SIZE * 0.56)
        } else {
          blockerBody.setSize(WORLD_TILE_SIZE * 0.76, WORLD_TILE_SIZE * 0.48)
          blockerBody.setOffset(WORLD_TILE_SIZE * 0.12, WORLD_TILE_SIZE * 0.42)
        }
      })
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
      .text(640, 674, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#d7ddf7',
        backgroundColor: '#08101d',
        padding: { x: 12, y: 8 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(20)
      .setVisible(false)

    const dialogueBackground = this.add
      .rectangle(640, 604, 1080, 152, 0x050913, 0.92)
      .setStrokeStyle(2, 0x90a3ff, 0.35)
    const dialogueTitle = this.add.text(122, 548, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#9bb1ff',
    })
    this.dialogueBody = this.add.text(122, 578, '', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#edf2ff',
      wordWrap: { width: 960 },
      lineSpacing: 8,
    })
    const dialogueHint = this.add
      .text(1080, 648, 'press enter to close', {
        fontFamily: 'monospace',
        fontSize: '16px',
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

  private updateWalkVisuals(delta: number, moving: boolean) {
    if (!this.player) {
      return
    }

    if (!moving) {
      this.walkElapsed = 0
      this.walkStep = false
      this.player.setTexture(this.avatarBaseTexture)
      this.player.setScale(1.15)
      return
    }

    this.walkElapsed += delta

    if (this.walkElapsed >= WALK_FRAME_DURATION) {
      this.walkElapsed = 0
      this.walkStep = !this.walkStep
    }

    this.player.setTexture(this.walkStep ? this.avatarStepTexture : this.avatarBaseTexture)
    this.player.setScale(this.walkStep ? 1.18 : 1.14)
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

  private getGroundTexture(token: string) {
    if (token === 'p') return 'path-tile'
    if (token === 'w') return 'water-tile'
    if (token === 'c') return 'cliff-tile'
    return 'grass-tile'
  }

  private getBlockerTexture(token: string) {
    if (token === 'c') return 'cliff-tile'
    if (token === 't') return 'tree-tile'
    if (token === 'h') return 'house-tile'
    if (token === 'l') return 'library-tile'
    if (token === 'a') return 'tavern-tile'
    if (token === 's') return 'shrine-tile'
    if (token === 'b') return 'board-tile'
    if (token === 'f') return 'gate-tile'
    if (token === 'w') return 'water-tile'
    return null
  }
}
