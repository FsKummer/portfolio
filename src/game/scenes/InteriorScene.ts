import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../core/config'
import { GAME_UI_FONT_FAMILY } from '../core/ui'
import type { HouseZone } from '../data/worldMap'
import { INTERIORS, type InteriorDefinition, type InteriorObject } from '../data/interiors'
import {
  clearVirtualControlInputs,
  consumeQueuedVirtualControlAction,
  isHeldVirtualControlPressed,
  setGameplayControlContext,
  supportsVirtualController,
} from '../store/virtualControls'

type Direction = 'left' | 'up' | 'right' | 'down'

type InteriorSceneData = {
  interiorId: InteriorDefinition['id']
  returnTo: { x: number; y: number }
  returnZoneId: HouseZone['id']
  playerAnimPrefix: 'adam' | 'amelia'
}

type TileBlockerConfig =
  | {
      width: number
      height: number
      offsetX: number
      offsetY: number
    }
  | null

const TILE_SIZE = 48
const PLAYER_SPEED = 150
const PLAYER_RUN_SPEED = 240
const DEFAULT_INTERIOR_CAMERA_ZOOM = 1.6
const DEFAULT_INTERIOR_CHARACTER_SCALE = 2.4
const INTERACTION_PADDING = 8
const INTERACTION_REACH = 30
const DIALOGUE_PANEL_WIDTH = 920
const DIALOGUE_PANEL_HEIGHT = 272
const DIALOGUE_PANEL_BOTTOM_MARGIN = 80
const NPC_BODY_BLOCKER_WIDTH = 0.58
const NPC_BODY_BLOCKER_HEIGHT = 22 / 32
const NPC_BODY_BLOCKER_Y_OFFSET = 5 / 32

type NpcBodyBounds = {
  height: number
  left: number
  top: number
  width: number
  x: number
  y: number
}

export class InteriorScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private uiCamera?: Phaser.Cameras.Scene2D.Camera
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
  private helpPanel?: Phaser.GameObjects.Container
  private prompt?: Phaser.GameObjects.Text
  private dialogueBox?: Phaser.GameObjects.Container
  private dialogueBody?: Phaser.GameObjects.Text
  private dialogueOpen = false
  private direction: Direction = 'down'
  private returnTo = { x: 0, y: 0 }
  private returnZoneId!: HouseZone['id']
  private playerAnimPrefix: 'adam' | 'amelia' = 'adam'
  private interior!: InteriorDefinition
  private transitioning = false
  private mobileControlsEnabled = false

  constructor() {
    super('interior')
  }

  init(data: InteriorSceneData) {
    this.interior = INTERIORS[data.interiorId]
    this.returnTo = data.returnTo
    this.returnZoneId = data.returnZoneId
    this.playerAnimPrefix = data.playerAnimPrefix
    this.interactives = []
    this.activeInteractive = undefined
    this.dialogueOpen = false
    this.direction = 'down'
    this.transitioning = false
  }

  create() {
    this.cameras.main.setBackgroundColor('#050913')
    this.mobileControlsEnabled = supportsVirtualController()
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

    const width = this.interior.width * TILE_SIZE
    const height = this.interior.height * TILE_SIZE
    this.physics.world.setBounds(0, 0, width, height)
    this.cameras.main.setBounds(0, 0, width, height)
    this.cameras.main.startFollow(this.player as Phaser.Physics.Arcade.Sprite, true, 0.12, 0.12)
    this.cameras.main.setZoom(this.getCameraZoom())
    this.cameras.main.roundPixels = true
    this.createUiCamera()

    this.createUi()
    this.bindInteractionInput()
    setGameplayControlContext('interior')
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanupSceneControls, this)
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanupSceneControls, this)
  }

  update() {
    if (!this.player) {
      return
    }

    this.processVirtualActions()

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

    const leftPressed = Boolean(
      this.cursors?.left.isDown ||
        this.movementKeys?.left.isDown ||
        isHeldVirtualControlPressed('left'),
    )
    const rightPressed = Boolean(
      this.cursors?.right.isDown ||
        this.movementKeys?.right.isDown ||
        isHeldVirtualControlPressed('right'),
    )
    const upPressed = Boolean(
      this.cursors?.up.isDown || this.movementKeys?.up.isDown || isHeldVirtualControlPressed('up'),
    )
    const downPressed = Boolean(
      this.cursors?.down.isDown ||
        this.movementKeys?.down.isDown ||
        isHeldVirtualControlPressed('down'),
    )
    const horizontal = Number(rightPressed) - Number(leftPressed)
    const vertical = Number(downPressed) - Number(upPressed)
    const sprinting = Boolean(this.movementKeys?.sprint.isDown || isHeldVirtualControlPressed('x'))
    const currentSpeed = sprinting ? this.getRunSpeed() : this.getWalkSpeed()

    let velocityX = 0
    let velocityY = 0

    if (horizontal < 0) {
      velocityX = -currentSpeed
      this.direction = 'left'
    }
    if (horizontal > 0) {
      velocityX = currentSpeed
      this.direction = 'right'
    }
    if (vertical < 0) {
      velocityY = -currentSpeed
      this.direction = 'up'
    }
    if (vertical > 0) {
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

    this.syncPlayerDepth()
    this.updateInteractive()

    if (this.activeInteractive?.kind === 'exit' && this.isPushingIntoExitDoor()) {
      this.leaveInterior()
    }
  }

  private buildRoom() {
    this.add.image(0, 0, this.interior.imageKey).setOrigin(0).setScale(TILE_SIZE / 16).setDepth(0)
    this.createBlockersFromJson()
    this.interior.objects.forEach((object) => this.addInteriorObject(object))
  }

  private createBlockersFromJson() {
    const rawJson = this.cache.text.get(this.interior.jsonKey)
    if (!rawJson) {
      return
    }

    const mapData = JSON.parse(rawJson) as {
      layers?: Array<{ data?: number[]; name?: string; type?: string; visible?: boolean }>
      width?: number
    }
    const mapWidth = mapData.width ?? this.interior.width
    const blockedCells = new Set<string>()
    const exitCells = new Set(this.interior.objects.filter((object) => object.kind === 'exit').map((object) => `${object.x},${object.y}`))

    mapData.layers?.forEach((layer) => {
      if (layer.type !== 'tilelayer' || !layer.name || !this.interior.blockingLayers.includes(layer.name)) {
        return
      }

      const layerName = layer.name

      layer.data?.forEach((gid, index) => {
        const tileId = gid & 0x1fffffff
        if (!this.shouldCreateBlockerForTile(layerName, tileId)) {
          return
        }

        const x = index % mapWidth
        const y = Math.floor(index / mapWidth)
        const cellKey = `${x},${y}`

        if (exitCells.has(cellKey) || blockedCells.has(cellKey)) {
          return
        }

        blockedCells.add(cellKey)
        const blockerConfig = this.getTileBlockerConfig()

        if (!blockerConfig) {
          return
        }

        const blocker = this.add.rectangle(
          x * TILE_SIZE + TILE_SIZE * blockerConfig.offsetX,
          y * TILE_SIZE + TILE_SIZE * blockerConfig.offsetY,
          TILE_SIZE * blockerConfig.width,
          TILE_SIZE * blockerConfig.height,
          0x000000,
          0,
        )
        this.physics.add.existing(blocker, true)
        this.blockers?.add(blocker)
      })
    })
  }

  private addInteriorObject(object: InteriorObject) {
    const worldX = object.x * TILE_SIZE + TILE_SIZE / 2
    const worldY = object.y * TILE_SIZE + TILE_SIZE / 2
    let npcSprite: Phaser.GameObjects.Sprite | undefined
    let npcBodyBounds: NpcBodyBounds | undefined

    if (object.kind === 'npc' && object.sprite) {
      npcSprite = this.add.sprite(worldX, worldY + 8, object.sprite, 18)
      npcSprite.setScale(this.getCharacterScale())
      npcSprite.setDepth(worldY + 12)
      npcBodyBounds = this.getNpcBodyBounds(npcSprite)
    }

    if (object.solid) {
      const blocker =
        npcBodyBounds
          ? this.add.rectangle(
              npcBodyBounds.x,
              npcBodyBounds.y,
              npcBodyBounds.width,
              npcBodyBounds.height,
              0x000000,
              0,
            )
          : this.add.rectangle(
              worldX,
              worldY + 6,
              TILE_SIZE * 0.7,
              TILE_SIZE * 0.4,
              0x000000,
              0,
            )
      this.physics.add.existing(blocker, true)
      this.blockers?.add(blocker)
    }

    if (object.kind === 'npc' || object.kind === 'sign' || object.kind === 'exit') {
      const area =
        object.kind === 'exit'
          ? new Phaser.Geom.Rectangle(
              worldX - TILE_SIZE * 0.4,
              worldY + TILE_SIZE * 0.1,
              TILE_SIZE * 0.8,
              TILE_SIZE * 0.32,
            )
          : npcBodyBounds
            ? new Phaser.Geom.Rectangle(
                npcBodyBounds.left,
                npcBodyBounds.top,
                npcBodyBounds.width,
                npcBodyBounds.height,
              )
          : new Phaser.Geom.Rectangle(
              worldX - TILE_SIZE * 0.45,
              worldY - TILE_SIZE * 0.45,
              TILE_SIZE * 0.9,
              TILE_SIZE * 0.9,
            )

      this.interactives.push({
        ...object,
        area,
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
    this.player.setScale(this.getCharacterScale())
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setSize(8, 6)
    body.setOffset(4, 24)
    this.syncPlayerDepth()
    this.playIdleAnimation()
  }

  private createUi() {
    const dialoguePanelWidth = Math.min(DIALOGUE_PANEL_WIDTH, GAME_WIDTH - 160)
    const controlsCopy = this.mobileControlsEnabled
      ? 'move: d-pad   sprint: x   interact: a\nclose: b   help: y'
      : 'move: wasd/arrows   sprint: shift\ninteract: e / enter   help: h'
    const dialogueHintText = this.mobileControlsEnabled ? 'A or B closes' : 'enter / space closes'

    this.helpPanel = this.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(2000)
      .setVisible(!this.mobileControlsEnabled)
    const panelBackground = this.add
      .rectangle(214, 82, 396, 116, 0x050913, 0.78)
      .setStrokeStyle(1, 0x90a3ff, 0.35)
    const titleText = this.add
      .text(40, 34, this.interior.title.toLowerCase(), {
      fontFamily: GAME_UI_FONT_FAMILY,
      fontSize: '26px',
      fontStyle: '700',
      color: '#edf2ff',
    })
      .setLetterSpacing(0.8)
    const controlsText = this.add
      .text(40, 72, controlsCopy, {
      fontFamily: GAME_UI_FONT_FAMILY,
      fontSize: '16px',
      fontStyle: '700',
      color: '#9bb1ff',
      wordWrap: { width: 332 },
    })
      .setLetterSpacing(0.5)
    this.helpPanel.add([panelBackground, titleText, controlsText])

    this.prompt = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 100, '', {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '18px',
        fontStyle: '700',
        color: '#f4f7ff',
        backgroundColor: '#04070f',
        padding: { x: 16, y: 10 },
      })
      .setLetterSpacing(0.6)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2000)
      .setVisible(false)
    this.prompt.setStroke('#10192d', 2)
    this.prompt.setShadow(0, 2, '#01040b', 1, false, true)

    const panelLeft = -dialoguePanelWidth / 2 + 44
    const panelTop = -DIALOGUE_PANEL_HEIGHT / 2 + 24
    const dialogueBackground = this.add
      .rectangle(0, 0, dialoguePanelWidth, DIALOGUE_PANEL_HEIGHT, 0x04070f, 0.78)
      .setStrokeStyle(3, 0xa4b6ff, 0.55)
    const dialogueTitle = this.add
      .text(panelLeft, panelTop, this.interior.title, {
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
      .text(panelLeft, panelTop + 48, '', {
      fontFamily: GAME_UI_FONT_FAMILY,
      fontSize: '24px',
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
      .text(dialoguePanelWidth / 2 - 28, DIALOGUE_PANEL_HEIGHT / 2 - 18, dialogueHintText, {
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
        GAME_HEIGHT - DIALOGUE_PANEL_HEIGHT / 2 - DIALOGUE_PANEL_BOTTOM_MARGIN,
        [dialogueBackground, dialogueTitle, this.dialogueBody, dialogueHint],
      )
      .setScrollFactor(0)
      .setDepth(2001)
      .setVisible(false)
    this.dialogueBox.setData('title', dialogueTitle)
    this.cameras.main.ignore([this.helpPanel, this.prompt, this.dialogueBox])
  }

  private bindInteractionInput() {
    this.input.keyboard?.on('keydown-E', () => this.handlePrimaryAction())
    this.input.keyboard?.on('keydown-SPACE', () => this.handlePrimaryAction())
    this.input.keyboard?.on('keydown-ENTER', () => this.handlePrimaryAction())
    this.input.keyboard?.on('keydown-H', () => this.toggleHelpPanel())
  }

  private handlePrimaryAction() {
    if (this.transitioning) {
      return
    }

    if (this.dialogueOpen) {
      this.closeDialogue()
      return
    }

    if (!this.activeInteractive) {
      return
    }

    if (this.activeInteractive.kind === 'exit') {
      return
    }

    if (!this.dialogueBox || !this.dialogueBody) {
      return
    }

    const title = this.dialogueBox.getData('title') as Phaser.GameObjects.Text
    title.setText(this.activeInteractive.label || this.interior.title)
    this.dialogueBody.setText(this.formatDialogue(this.activeInteractive.message || ''))
    this.dialogueBox.setVisible(true)
    this.dialogueOpen = true
    this.prompt?.setVisible(false)
  }

  private handleBackAction() {
    if (this.transitioning) {
      return
    }

    if (this.dialogueOpen) {
      this.closeDialogue()
      return
    }

    if (this.helpPanel?.visible) {
      this.helpPanel.setVisible(false)
    }
  }

  private closeDialogue() {
    this.dialogueOpen = false
    this.dialogueBox?.setVisible(false)
  }

  private toggleHelpPanel() {
    if (this.transitioning || !this.helpPanel) {
      return
    }

    this.helpPanel.setVisible(!this.helpPanel.visible)
  }

  private processVirtualActions() {
    if (consumeQueuedVirtualControlAction('y')) {
      this.toggleHelpPanel()
    }

    if (consumeQueuedVirtualControlAction('b')) {
      this.handleBackAction()
    }

    if (consumeQueuedVirtualControlAction('a')) {
      this.handlePrimaryAction()
    }
  }

  private leaveInterior() {
    if (this.transitioning) {
      return
    }

    this.transitioning = true
    this.player?.setVelocity(0, 0)
    this.cameras.main.fadeOut(120, 0, 0, 0)
    this.time.delayedCall(130, () => {
      this.scene.start('world', { spawn: this.returnTo, suppressHouseEntryZoneId: this.returnZoneId })
    })
  }

  private updateInteractive() {
    if (!this.player || !this.prompt) {
      return
    }

    const bodyBounds = this.getBodyBounds()
    const interactionBounds = this.getInteractionBounds()
    if (!bodyBounds || !interactionBounds) {
      this.prompt.setVisible(false)
      return
    }

    this.activeInteractive = this.interactives.find((interactive) => {
      const probeBounds = interactive.kind === 'exit' ? bodyBounds : interactionBounds
      return Phaser.Geom.Intersects.RectangleToRectangle(probeBounds, interactive.area)
    })

    if (!this.activeInteractive) {
      this.prompt.setVisible(false)
      return
    }

    if (this.activeInteractive.kind === 'exit') {
      this.prompt.setVisible(false)
      return
    }

    this.prompt
      .setText(
        (this.mobileControlsEnabled ? 'press A: ' : 'press e: ') +
          (this.activeInteractive.label || 'inspect'),
      )
      .setVisible(true)
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

  private getBodyBounds() {
    if (!this.player) {
      return
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body | null
    if (!body) {
      return
    }

    return new Phaser.Geom.Rectangle(body.x, body.y, body.width, body.height)
  }

  private getInteractionBounds() {
    const bodyBounds = this.getBodyBounds()
    if (!bodyBounds) {
      return
    }

    const bounds = new Phaser.Geom.Rectangle(
      bodyBounds.x - INTERACTION_PADDING,
      bodyBounds.y - INTERACTION_PADDING,
      bodyBounds.width + INTERACTION_PADDING * 2,
      bodyBounds.height + INTERACTION_PADDING * 2,
    )

    if (this.direction === 'up') {
      bounds.y -= INTERACTION_REACH
      bounds.height += INTERACTION_REACH
    }

    if (this.direction === 'down') {
      bounds.height += INTERACTION_REACH
    }

    if (this.direction === 'left') {
      bounds.x -= INTERACTION_REACH
      bounds.width += INTERACTION_REACH
    }

    if (this.direction === 'right') {
      bounds.width += INTERACTION_REACH
    }

    return bounds
  }

  private getNpcBodyBounds(npcSprite: Phaser.GameObjects.Sprite): NpcBodyBounds {
    const width = npcSprite.displayWidth * NPC_BODY_BLOCKER_WIDTH
    const height = npcSprite.displayHeight * NPC_BODY_BLOCKER_HEIGHT
    const x = npcSprite.x
    const y = npcSprite.y + npcSprite.displayHeight * NPC_BODY_BLOCKER_Y_OFFSET

    return {
      x,
      y,
      width,
      height,
      left: x - width / 2,
      top: y - height / 2,
    }
  }

  private isPushingIntoExitDoor() {
    if (!this.player) {
      return false
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body | null
    if (!body) {
      return false
    }

    return this.direction === 'down' && body.velocity.y > 0
  }

  private getTileBlockerConfig(): TileBlockerConfig {
    const defaultConfig = {
      width: 0.9,
      height: 0.9,
      offsetX: 0.5,
      offsetY: 0.5,
    }

    return defaultConfig
  }

  private shouldCreateBlockerForTile(layerName: string, tileId: number) {
    if (tileId === 0) {
      return false
    }

    const collisionLayer = this.interior.collisionLayer
    if (!collisionLayer || collisionLayer.name !== layerName) {
      return true
    }

    if (collisionLayer.emptyTileIds?.includes(tileId)) {
      return false
    }

    if (collisionLayer.blockedTileIds && !collisionLayer.blockedTileIds.includes(tileId)) {
      return false
    }

    return true
  }

  private formatDialogue(message: string) {
    return message
      .split('\n')
      .map((line) => line.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join('\n')
  }

  private syncPlayerDepth() {
    this.player?.setDepth((this.player?.y ?? 0) + 12)
  }

  private createUiCamera() {
    this.uiCamera = this.cameras.add(0, 0, GAME_WIDTH, GAME_HEIGHT)
    this.uiCamera.setBackgroundColor('rgba(0,0,0,0)')
    this.uiCamera.setRoundPixels(true)
    this.uiCamera.ignore([...this.children.list])
  }

  private cleanupSceneControls() {
    clearVirtualControlInputs()
    setGameplayControlContext(null)
  }

  private getCharacterScale() {
    return this.interior.characterScale ?? DEFAULT_INTERIOR_CHARACTER_SCALE
  }

  private getCameraZoom() {
    return this.interior.cameraZoom ?? DEFAULT_INTERIOR_CAMERA_ZOOM
  }

  private getWalkSpeed() {
    return this.interior.walkSpeed ?? PLAYER_SPEED
  }

  private getRunSpeed() {
    return this.interior.runSpeed ?? PLAYER_RUN_SPEED
  }
}
