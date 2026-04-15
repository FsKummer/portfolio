import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../core/config'
import { GAME_UI_FONT_FAMILY } from '../core/ui'
import {
  COLLISION_BLOCKER,
  type HouseZone,
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
  suppressHouseEntryZoneId?: HouseZone['id']
}

const PLAYER_SPEED = 180
const PLAYER_RUN_SPEED = 280
const PLAYER_SCALE = 3
const WORLD_DIALOGUE_PANEL_WIDTH = 920
const WORLD_DIALOGUE_PANEL_HEIGHT = 228
const WORLD_DIALOGUE_PANEL_BOTTOM_MARGIN = 76

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
  private suppressedHouseEntryZoneId?: HouseZone['id']

  constructor() {
    super('world')
  }

  init(data: WorldSceneData = {}) {
    this.spawnPoint = data.spawn ?? WORLD_SPAWN
    this.activeZone = undefined
    this.dialogueOpen = false
    this.direction = 'down'
    this.transitioning = false
    this.suppressedHouseEntryZoneId = data.suppressHouseEntryZoneId
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

    if (this.transitioning) {
      this.player.setVelocity(0, 0)
      this.playIdleAnimation()
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
    const dialoguePanelWidth = Math.min(WORLD_DIALOGUE_PANEL_WIDTH, GAME_WIDTH - 160)
    const dialoguePanelLeft = -dialoguePanelWidth / 2 + 44
    const dialoguePanelTop = -WORLD_DIALOGUE_PANEL_HEIGHT / 2 + 22

    this.helpPanel = this.add.container(0, 0).setScrollFactor(0).setDepth(2000)
    const panelBackground = this.add
      .rectangle(214, 82, 396, 116, 0x050913, 0.78)
      .setStrokeStyle(1, 0x90a3ff, 0.35)
    const welcomeText = this.add
      .text(40, 34, 'welcome, ' + visitorName, {
      fontFamily: GAME_UI_FONT_FAMILY,
      fontSize: '26px',
      fontStyle: '700',
      color: '#edf2ff',
    })
      .setLetterSpacing(0.8)
    const controlsText = this.add
      .text(40, 72, 'move: wasd/arrows   sprint: shift   interact: e   toggle hud: h', {
      fontFamily: GAME_UI_FONT_FAMILY,
      fontSize: '16px',
      fontStyle: '700',
      color: '#9bb1ff',
      wordWrap: { width: 332 },
    })
      .setLetterSpacing(0.5)

    this.helpPanel.add([panelBackground, welcomeText, controlsText])

    this.interactionPrompt = this.add
      .text(384, 332, '', {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '16px',
        fontStyle: '700',
        color: '#d7ddf7',
        backgroundColor: '#08101d',
        padding: { x: 14, y: 8 },
      })
      .setLetterSpacing(0.6)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2000)
      .setVisible(false)

    const dialogueBackground = this.add
      .rectangle(0, 0, dialoguePanelWidth, WORLD_DIALOGUE_PANEL_HEIGHT, 0x04070f, 0.8)
      .setStrokeStyle(3, 0xa4b6ff, 0.55)
    const dialogueTitle = this.add
      .text(dialoguePanelLeft, dialoguePanelTop, '', {
      fontFamily: GAME_UI_FONT_FAMILY,
      fontSize: '22px',
      fontStyle: '700',
      color: '#d7e0ff',
    })
      .setLetterSpacing(0.7)
      .setPadding(6, 4, 6, 4)
    dialogueTitle.setStroke('#04070f', 2)
    dialogueTitle.setShadow(0, 2, '#01040b', 1, false, true)

    this.dialogueBody = this.add
      .text(dialoguePanelLeft, dialoguePanelTop + 42, '', {
      fontFamily: GAME_UI_FONT_FAMILY,
      fontSize: '22px',
      fontStyle: '700',
      color: '#f6f8ff',
      wordWrap: { width: dialoguePanelWidth - 112 },
      lineSpacing: 12,
    })
      .setLetterSpacing(0.8)
      .setPadding(6, 4, 6, 4)
    this.dialogueBody.setStroke('#04070f', 2)
    this.dialogueBody.setShadow(0, 1, '#01040b', 1, false, true)

    const dialogueHint = this.add
      .text(dialoguePanelWidth / 2 - 28, WORLD_DIALOGUE_PANEL_HEIGHT / 2 - 18, 'enter closes', {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '16px',
        fontStyle: '700',
        color: '#d7e0ff',
      })
      .setLetterSpacing(0.5)
      .setOrigin(1, 1)
      .setPadding(4, 4, 4, 4)
    dialogueHint.setStroke('#04070f', 2)

    this.dialogueBox = this.add
      .container(
        GAME_WIDTH / 2,
        GAME_HEIGHT - WORLD_DIALOGUE_PANEL_HEIGHT / 2 - WORLD_DIALOGUE_PANEL_BOTTOM_MARGIN,
        [dialogueBackground, dialogueTitle, this.dialogueBody, dialogueHint],
      )
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
      return
    }

    if (!this.dialogueBox || !this.dialogueBody) {
      return
    }

    const title = this.dialogueBox.getData('title') as Phaser.GameObjects.Text
    title.setText(this.activeZone.label)
    this.dialogueBody.setText(this.activeZone.message || portfolioDialogues.contactSign)
    this.dialogueBox.setVisible(true)
    this.dialogueOpen = true
    this.interactionPrompt?.setVisible(false)
  }

  private closeDialogue() {
    this.dialogueOpen = false
    this.dialogueBox?.setVisible(false)
  }

  private isHouseZone(zone: InteractionZone): zone is HouseZone {
    return zone.trigger === 'touch'
  }

  private enterHouse(zone: HouseZone) {
    if (this.transitioning) {
      return
    }

    this.transitioning = true
    this.player?.setVelocity(0, 0)
    this.cameras.main.fadeOut(120, 0, 0, 0)
    this.time.delayedCall(130, () => {
      this.scene.start('interior', {
        interiorId: zone.interiorId,
        returnTo: zone.returnTo,
        returnZoneId: zone.id,
        playerAnimPrefix: this.playerAnimPrefix,
      })
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

    const interactionBounds = this.getInteractionBounds()
    if (!interactionBounds) {
      this.interactionPrompt.setVisible(false)
      return
    }

    this.activeZone = WORLD_INTERACTIONS.find((zone) => {
      const zoneRect = new Phaser.Geom.Rectangle(zone.x, zone.y, zone.width, zone.height)
      return Phaser.Geom.Intersects.RectangleToRectangle(interactionBounds, zoneRect)
    })

    if (!this.activeZone) {
      this.suppressedHouseEntryZoneId = undefined
      this.interactionPrompt.setVisible(false)
      return
    }

    if (this.isHouseZone(this.activeZone)) {
      this.interactionPrompt.setVisible(false)

      if (this.activeZone.id === this.suppressedHouseEntryZoneId) {
        return
      }

      if (!this.isPushingIntoHouseDoor()) {
        return
      }

      this.suppressedHouseEntryZoneId = undefined
      this.enterHouse(this.activeZone)
      return
    }

    this.suppressedHouseEntryZoneId = undefined
    this.interactionPrompt.setText('press e: ' + this.activeZone.label).setVisible(true)
  }

  private getInteractionBounds() {
    if (!this.player) {
      return
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body | null
    if (!body) {
      return
    }

    return new Phaser.Geom.Rectangle(body.x, body.y, body.width, body.height)
  }

  private isPushingIntoHouseDoor() {
    if (!this.player) {
      return false
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body | null
    if (!body) {
      return false
    }

    return this.direction === 'up' && body.velocity.y <= 0
  }
}
