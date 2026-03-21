import Phaser from 'phaser'
import {
  COLLISION_BLOCKER,
  WORLD_COLLISIONS,
  WORLD_HEIGHT,
  WORLD_INTERACTIONS,
  WORLD_SCALE,
  WORLD_SPAWN,
  WORLD_TILE_SIZE,
  WORLD_WIDTH,
  type InteractionZone,
} from '../data/worldMap'
import { portfolioDialogues } from '../data/portfolioContent'
import { loadVisitorProfile } from '../store/sessionStore'

type Direction = 'left' | 'up' | 'right' | 'down'

type WorldSceneData = {
  spawn?: {
    x: number
    y: number
  }
  suppressHouseEntryMs?: number
}

const PLAYER_SPEED = 180
const PLAYER_RUN_SPEED = 280
const PLAYER_SCALE = 3

export class WorldScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private player?: Phaser.Physics.Arcade.Sprite
  private movementKeys?: {
    up: Phaser.Input.Keyboard.Key
    down: Phaser.Input.Keyboard.Key
    left: Phaser.Input.Keyboard.Key
    right: Phaser.Input.Keyboard.Key
    interact: Phaser.Input.Keyboard.Key
    sprint: Phaser.Input.Keyboard.Key
    toggleHud: Phaser.Input.Keyboard.Key
  }
  private helpPanel?: Phaser.GameObjects.Container
  private interactionPrompt?: Phaser.GameObjects.Text
  private dialogueBox?: Phaser.GameObjects.Container
  private dialogueBody?: Phaser.GameObjects.Text
  private activeZone?: InteractionZone
  private dialogueOpen = false
  private direction: Direction = 'down'
  private playerAnimPrefix: 'adam' | 'amelia' = 'adam'
  private spawnPoint = WORLD_SPAWN
  private transitioning = false
  private houseEntrySuppressedUntil = 0

  constructor() {
    super('world')
  }

  init(data: WorldSceneData = {}) {
    this.spawnPoint = data.spawn ?? WORLD_SPAWN
    this.activeZone = undefined
    this.dialogueOpen = false
    this.direction = 'down'
    this.transitioning = false
    this.houseEntrySuppressedUntil = this.time.now + (data.suppressHouseEntryMs ?? 0)
  }

  create() {
    const profile = loadVisitorProfile()
    this.playerAnimPrefix = profile.avatar === 'girl' ? 'amelia' : 'adam'

    this.cameras.main.setBackgroundColor('#77d8e7')
    this.cursors = this.input.keyboard?.createCursorKeys()
    this.movementKeys = this.input.keyboard?.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D',
      interact: 'E',
      sprint: 'SHIFT',
      toggleHud: 'H',
    }) as WorldScene['movementKeys']

    const blockers = this.createWorld()
    this.createPlayer()
    this.physics.add.collider(this.player as Phaser.Physics.Arcade.Sprite, blockers)

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    this.cameras.main.startFollow(this.player as Phaser.Physics.Arcade.Sprite, true, 0.12, 0.12)
    this.cameras.main.setZoom(1)
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

    this.updateActiveZone()
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(
      this.spawnPoint.x,
      this.spawnPoint.y,
      `${this.playerAnimPrefix}-idle`,
      18,
    )
    this.player.setCollideWorldBounds(true)
    this.player.setScale(PLAYER_SCALE)
    this.player.setDepth(100)

    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setSize(8, 6)
    body.setOffset(4, 24)

    this.playIdleAnimation()
  }

  private createWorld() {
    const blockers = this.physics.add.staticGroup()

    this.add
      .image(0, 0, 'world-map')
      .setOrigin(0)
      .setScale(WORLD_SCALE)
      .setDepth(0)

    WORLD_COLLISIONS.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        if (value !== COLLISION_BLOCKER) {
          return
        }

        const blocker = this.add.rectangle(
          columnIndex * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2,
          rowIndex * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2,
          WORLD_TILE_SIZE,
          WORLD_TILE_SIZE,
          0x000000,
          0,
        )
        this.physics.add.existing(blocker, true)
        blockers.add(blocker)
      })
    })

    return blockers
  }

  private createHud(visitorName: string) {
    this.helpPanel = this.add.container(0, 0).setScrollFactor(0).setDepth(2000)
    const panelBackground = this.add
      .rectangle(196, 74, 360, 96, 0x050913, 0.78)
      .setStrokeStyle(1, 0x90a3ff, 0.35)
    const welcomeText = this.add.text(40, 34, 'welcome, ' + visitorName, {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#edf2ff',
    })
    const controlsText = this.add.text(40, 62, 'move: wasd/arrows   sprint: shift   interact: e   toggle hud: h', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#9bb1ff',
      wordWrap: { width: 300 },
    })

    this.helpPanel.add([panelBackground, welcomeText, controlsText])

    this.interactionPrompt = this.add
      .text(384, 332, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#d7ddf7',
        backgroundColor: '#08101d',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2000)
      .setVisible(false)

    const dialogueBackground = this.add
      .rectangle(384, 308, 700, 104, 0x050913, 0.92)
      .setStrokeStyle(2, 0x90a3ff, 0.35)
    const dialogueTitle = this.add.text(50, 268, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#9bb1ff',
    })
    this.dialogueBody = this.add.text(50, 292, '', {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#edf2ff',
      wordWrap: { width: 620 },
      lineSpacing: 6,
    })
    const dialogueHint = this.add
      .text(712, 348, 'press enter to close', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#9bb1ff',
      })
      .setOrigin(1, 0.5)

    this.dialogueBox = this.add
      .container(0, 0, [dialogueBackground, dialogueTitle, this.dialogueBody, dialogueHint])
      .setScrollFactor(0)
      .setDepth(2001)
      .setVisible(false)
    this.dialogueBox.setData('title', dialogueTitle)
  }

  private bindInteractionInput() {
    this.input.keyboard?.on('keydown-E', () => this.handleInteraction())
    this.input.keyboard?.on('keydown-SPACE', () => this.handleInteraction())
    this.input.keyboard?.on('keydown-H', () => {
      this.helpPanel?.setVisible(!this.helpPanel.visible)
    })
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

    if (!this.activeZone) {
      return
    }

    if (this.isHouseZone(this.activeZone)) {
      if (this.time.now >= this.houseEntrySuppressedUntil) {
        this.enterHouse(this.activeZone)
      }
      return
    }

    if (!this.dialogueBox || !this.dialogueBody) {
      return
    }

    const title = this.dialogueBox.getData('title') as Phaser.GameObjects.Text
    title.setText(this.activeZone.label)
    this.dialogueBody.setText(
      this.activeZone.id === 'contact-dock' ? portfolioDialogues.contactSign : this.activeZone.message,
    )
    this.dialogueBox.setVisible(true)
    this.dialogueOpen = true
    this.interactionPrompt?.setVisible(false)
  }

  private closeDialogue() {
    this.dialogueOpen = false
    this.dialogueBox?.setVisible(false)
  }

  private isHouseZone(zone: InteractionZone) {
    return zone.id === 'projects-house' || zone.id === 'about-house' || zone.id === 'skills-house'
  }

  private enterHouse(zone: InteractionZone) {
    if (this.transitioning) {
      return
    }

    let sceneData:
      | { interiorId: 'projects' | 'about' | 'skills'; returnTo: { x: number; y: number }; playerAnimPrefix: 'adam' | 'amelia' }
      | undefined

    if (zone.id === 'projects-house') {
      sceneData = {
        interiorId: 'projects',
        returnTo: { x: 420, y: 860 },
        playerAnimPrefix: this.playerAnimPrefix,
      }
    } else if (zone.id === 'about-house') {
      sceneData = {
        interiorId: 'about',
        returnTo: { x: 1464, y: 420 },
        playerAnimPrefix: this.playerAnimPrefix,
      }
    } else if (zone.id === 'skills-house') {
      sceneData = {
        interiorId: 'skills',
        returnTo: { x: 2228, y: 860 },
        playerAnimPrefix: this.playerAnimPrefix,
      }
    }

    if (!sceneData) {
      return
    }

    this.transitioning = true
    this.player?.setVelocity(0, 0)
    this.cameras.main.fadeOut(120, 0, 0, 0)
    this.time.delayedCall(130, () => {
      this.scene.start('interior', sceneData)
    })
  }

  private getAnimationDirection() {
    if (this.direction === 'left') {
      return 'right'
    }

    if (this.direction === 'right') {
      return 'left'
    }

    return this.direction
  }

  private playIdleAnimation() {
    const animationDirection = this.getAnimationDirection()
    this.player?.anims.play(`${this.playerAnimPrefix}-idle-${animationDirection}`, true)
  }

  private playWalkAnimation() {
    const animationDirection = this.getAnimationDirection()
    this.player?.anims.play(`${this.playerAnimPrefix}-walk-${animationDirection}`, true)
  }

  private updateActiveZone() {
    if (!this.player || !this.interactionPrompt) {
      return
    }

    const playerBounds = this.player.getBounds()

    this.activeZone = WORLD_INTERACTIONS.find((zone) => {
      const zoneRect = new Phaser.Geom.Rectangle(zone.x, zone.y, zone.width, zone.height)
      return Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, zoneRect)
    })

    if (!this.activeZone) {
      this.interactionPrompt.setVisible(false)
      return
    }

    if (this.isHouseZone(this.activeZone)) {
      const label = 'enter ' + this.activeZone.label.toLowerCase()
      this.interactionPrompt.setText('press e: ' + label).setVisible(true)
      return
    }

    this.interactionPrompt.setText('press e: ' + this.activeZone.label).setVisible(true)
  }
}
