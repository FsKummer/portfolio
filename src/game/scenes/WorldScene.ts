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
import {
  BATTLE_ENCOUNTERS,
  CRYSTAL_BATTLE_ENCOUNTER_IDS,
  FINAL_GUIDE_ENCOUNTER_ID,
  type CrystalBattleEncounterId,
} from '../data/battles'
import { portfolioDialogues } from '../data/portfolioContent'
import { hasDefeatedBattle, loadVisitorProfile, markQuestGuideIntroSeen } from '../store/sessionStore'
import {
  clearVirtualControlInputs,
  consumeQueuedVirtualControlAction,
  isHeldVirtualControlPressed,
  setGameplayControlContext,
  supportsVirtualController,
} from '../store/virtualControls'
import { MUSIC_KEYS, SFX_KEYS, playMusic, playSfx } from '../systems/audio'
import { paginateDialogueText, typewriteText } from '../systems/dialogue'
import { playSquareCloseTransition } from '../systems/squareTransition'

type Direction = 'left' | 'up' | 'right' | 'down'

export type WorldSceneDialogue = {
  message: string
  title: string
}

type WorldSceneData = {
  initialDialogue?: WorldSceneDialogue
  spawn?: {
    x: number
    y: number
  }
  suppressHouseEntryZoneId?: HouseZone['id']
}

type QuestMapCrystalLocation = {
  encounterId: CrystalBattleEncounterId
  mapPoint?: {
    x: number
    y: number
  }
  zoneId: HouseZone['id']
}

const PLAYER_SPEED = 180
const PLAYER_RUN_SPEED = 280
const PLAYER_SCALE = 3
const WORLD_DIALOGUE_PANEL_WIDTH = 920
const WORLD_DIALOGUE_PANEL_HEIGHT = 228
const WORLD_DIALOGUE_PANEL_BOTTOM_MARGIN = 76
const WORLD_DIALOGUE_PAGE_MAX_CHARS = 190
const QUEST_GUIDE_SCALE = 3
const QUEST_GUIDE_SPAWN_OFFSET = { x: 76, y: -12 } as const
const QUEST_GUIDE_SPARKLE_COUNT = 22
const QUEST_MAP_WIDTH = 980
const QUEST_MAP_HEIGHT = 420
const QUEST_MAP_TOP = 154
const QUEST_MAP_CRYSTALS: QuestMapCrystalLocation[] = [
  { encounterId: 'project-curator-trial', zoneId: 'projects-house' },
  {
    encounterId: 'school-guide-trial',
    mapPoint: { x: 350 * WORLD_SCALE, y: 58 * WORLD_SCALE },
    zoneId: 'about-house',
  },
  { encounterId: 'workout-buddy-trial', zoneId: 'skills-house' },
]
const FINAL_GUIDE_SPARK_POINT = { x: 304, y: 240 } as const
const FINAL_GUIDE_RETURN_POINT = { x: 348, y: 384 } as const
const FINAL_GUIDE_SPARK_AREA = {
  x: 232,
  y: 176,
  width: 340,
  height: 300,
} as const

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
  private dialogueHint?: Phaser.GameObjects.Text
  private questGuide?: Phaser.GameObjects.Image
  private questGuideAura?: Phaser.GameObjects.Ellipse
  private questGuideShadow?: Phaser.GameObjects.Ellipse
  private questGuideDialogueLines: string[] = []
  private questGuideLineIndex = 0
  private questGuideIntroActive = false
  private questGuideDialogueReady = false
  private questGuideVanishActive = false
  private questMapGranted = false
  private questMapOpen = false
  private questMapOverlay?: Phaser.GameObjects.Container
  private questMapPlayerMarker?: Phaser.GameObjects.Container
  private questMapCrystalMarkers: Array<{
    crystalId: string
    marker: Phaser.GameObjects.Container
    statusText: Phaser.GameObjects.Text
  }> = []
  private finalSpark?: Phaser.GameObjects.Container
  private finalSparkMapMarker?: Phaser.GameObjects.Container
  private finalSparkVisible = false
  private activeFinalSpark = false
  private finalGuideDialogueLines: string[] = []
  private finalGuideLineIndex = 0
  private finalGuideIntroActive = false
  private finalGuideDialogueReady = false
  private activeZone?: InteractionZone
  private dialogueOpen = false
  private dialogueTyping = false
  private dialogueTypewriteRun = 0
  private dialoguePages: string[] = []
  private dialoguePageIndex = 0
  private direction: Direction = 'down'
  private playerAnimPrefix: 'adam' | 'amelia' = 'adam'
  private spawnPoint = WORLD_SPAWN
  private initialDialogue?: WorldSceneDialogue
  private transitioning = false
  private suppressedHouseEntryZoneId?: HouseZone['id']
  private mobileControlsEnabled = false
  private lastStepSoundAt = 0
  private stepSoundIndex = 0

  constructor() {
    super('world')
  }

  init(data: WorldSceneData = {}) {
    this.spawnPoint = data.spawn ?? WORLD_SPAWN
    this.initialDialogue = data.initialDialogue
    this.activeZone = undefined
    this.dialogueOpen = false
    this.dialogueTyping = false
    this.dialogueTypewriteRun += 1
    this.dialoguePages = []
    this.dialoguePageIndex = 0
    this.questGuideDialogueLines = []
    this.questGuideLineIndex = 0
    this.questGuideIntroActive = false
    this.questGuideDialogueReady = false
    this.questGuideVanishActive = false
    this.questMapGranted = false
    this.questMapOpen = false
    this.questMapCrystalMarkers = []
    this.finalSpark = undefined
    this.finalSparkMapMarker = undefined
    this.finalSparkVisible = false
    this.activeFinalSpark = false
    this.finalGuideDialogueLines = []
    this.finalGuideLineIndex = 0
    this.finalGuideIntroActive = false
    this.finalGuideDialogueReady = false
    this.direction = 'down'
    this.transitioning = false
    this.suppressedHouseEntryZoneId = data.suppressHouseEntryZoneId
    this.lastStepSoundAt = 0
    this.stepSoundIndex = 0
  }

  create() {
    const profile = loadVisitorProfile()
    this.playerAnimPrefix = profile.avatar === 'girl' ? 'amelia' : 'adam'
    this.questMapGranted = profile.progress.questMapGranted
    this.mobileControlsEnabled = supportsVirtualController()

    this.cameras.main.setBackgroundColor('#77d8e7')
    playMusic(this, MUSIC_KEYS.overworld)
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
    this.createFinalSparkIfUnlocked(profile)
    this.createPlayer()
    this.physics.add.collider(this.player as Phaser.Physics.Arcade.Sprite, blockers)

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    this.cameras.main.startFollow(this.player as Phaser.Physics.Arcade.Sprite, true, 0.12, 0.12)
    this.cameras.main.setZoom(1)
    this.cameras.main.roundPixels = true

    this.createHud(profile.visitorName || 'traveler')
    this.createQuestMap()
    this.bindInteractionInput()
    this.startQuestGuideIntroIfNeeded(profile.visitorName || 'traveler', profile.progress.guideIntroSeen)
    this.openInitialDialogueIfNeeded()
    setGameplayControlContext('world')
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanupSceneControls, this)
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanupSceneControls, this)
  }

  update() {
    if (!this.player) {
      return
    }

    this.processVirtualActions()

    if (this.transitioning || this.questGuideVanishActive) {
      this.player.setVelocity(0, 0)
      this.playIdleAnimation()
      return
    }

    if (this.questMapOpen) {
      this.player.setVelocity(0, 0)
      this.playIdleAnimation()
      this.updateQuestMapPlayerMarker()
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
    const currentSpeed = sprinting ? PLAYER_RUN_SPEED : PLAYER_SPEED

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

  private startQuestGuideIntroIfNeeded(visitorName: string, guideIntroSeen: boolean) {
    if (guideIntroSeen || !this.dialogueBox || !this.dialogueBody) {
      return
    }

    const { aura, guide, shadow } = this.createQuestGuide()

    this.questGuideDialogueLines = portfolioDialogues.questGuide(visitorName)
    this.questGuideLineIndex = 0
    this.questGuideIntroActive = true
    this.questGuideDialogueReady = false
    this.dialogueOpen = true
    this.interactionPrompt?.setVisible(false)

    guide.setAlpha(0).setScale(0.2)
    aura.setAlpha(0).setScale(0.35)
    shadow.setAlpha(0).setScale(0.35, 1)

    this.tweens.add({
      targets: guide,
      alpha: 1,
      scale: QUEST_GUIDE_SCALE,
      duration: 420,
      ease: 'Back.Out',
    })
    this.tweens.add({
      targets: aura,
      alpha: 0.2,
      scaleX: 1,
      scaleY: 1,
      duration: 360,
      ease: 'Sine.Out',
    })
    this.tweens.add({
      targets: shadow,
      alpha: 0.46,
      scaleX: 1,
      duration: 360,
      ease: 'Sine.Out',
    })
    this.tweens.add({
      targets: guide,
      y: guide.y - 8,
      duration: 1080,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 450,
    })

    this.time.delayedCall(480, () => this.showQuestGuideDialogueLine())
  }

  private createQuestGuide() {
    const guideX = this.spawnPoint.x + QUEST_GUIDE_SPAWN_OFFSET.x
    const guideY = this.spawnPoint.y + QUEST_GUIDE_SPAWN_OFFSET.y

    return this.createQuestGuideAt(guideX, guideY)
  }

  private createQuestGuideAt(guideX: number, guideY: number) {
    const shadow = this.add
      .ellipse(guideX, guideY + 46, 44, 12, 0x01040b, 0.46)
      .setDepth(98)
    const aura = this.add
      .ellipse(guideX, guideY + 10, 64, 116, 0x9bb1ff, 0.2)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(99)
    const guide = this.add
      .image(guideX, guideY, 'mystic-guide')
      .setScale(QUEST_GUIDE_SCALE)
      .setDepth(101)

    this.questGuide = guide
    this.questGuideAura = aura
    this.questGuideShadow = shadow

    return { aura, guide, shadow }
  }

  private createFinalSparkIfUnlocked(profile: ReturnType<typeof loadVisitorProfile>) {
    this.finalSparkVisible = this.shouldShowFinalSpark(profile)

    if (!this.finalSparkVisible) {
      return
    }

    const glow = this.add
      .ellipse(0, 0, 64, 38, 0xcdd8ff, 0.22)
      .setBlendMode(Phaser.BlendModes.ADD)
    const outerGlow = this.add
      .ellipse(0, 0, 108, 74, 0x9bb1ff, 0.1)
      .setBlendMode(Phaser.BlendModes.ADD)
    const star = this.add
      .star(0, -8, 8, 7, 22, 0xf6f8ff, 0.96)
      .setStrokeStyle(2, 0x9bb1ff, 0.9)
      .setBlendMode(Phaser.BlendModes.ADD)
    const core = this.add.circle(0, -8, 8, 0xfff1a8, 0.96).setBlendMode(Phaser.BlendModes.ADD)

    this.finalSpark = this.add
      .container(FINAL_GUIDE_SPARK_POINT.x, FINAL_GUIDE_SPARK_POINT.y, [
        outerGlow,
        glow,
        star,
        core,
      ])
      .setDepth(92)

    this.tweens.add({
      targets: this.finalSpark,
      y: FINAL_GUIDE_SPARK_POINT.y - 10,
      duration: 820,
      ease: 'Sine.easeInOut',
      repeat: -1,
      yoyo: true,
    })
    this.tweens.add({
      targets: [outerGlow, glow, star, core],
      alpha: '-=0.46',
      duration: 520,
      ease: 'Sine.easeInOut',
      repeat: -1,
      yoyo: true,
    })
    this.tweens.add({
      targets: star,
      angle: 360,
      duration: 2400,
      repeat: -1,
      ease: 'Linear',
    })
  }

  private shouldShowFinalSpark(profile = loadVisitorProfile()) {
    const collectedCrystalIds = new Set(profile.progress.crystalIds)
    const hasEveryCrystal = CRYSTAL_BATTLE_ENCOUNTER_IDS.every((encounterId) => {
      const reward = BATTLE_ENCOUNTERS[encounterId].reward

      return reward.kind === 'crystal' && collectedCrystalIds.has(reward.crystal.id)
    })

    return hasEveryCrystal && !hasDefeatedBattle(FINAL_GUIDE_ENCOUNTER_ID)
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
    const controlsCopy = this.mobileControlsEnabled
      ? 'move: d-pad   sprint: x   interact: a\nclose: b   help: y'
      : 'move: wasd/arrows   sprint: shift\ninteract: e / enter   map: m\nhelp: h'
    const dialogueHintText = this.mobileControlsEnabled ? 'A or B closes' : 'enter / space closes'

    this.helpPanel = this.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(2000)
      .setVisible(!this.mobileControlsEnabled)
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
      .text(40, 72, controlsCopy, {
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
      .text(dialoguePanelWidth / 2 - 28, WORLD_DIALOGUE_PANEL_HEIGHT / 2 - 18, dialogueHintText, {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '16px',
        fontStyle: '700',
        color: '#d7e0ff',
      })
      .setLetterSpacing(0.5)
      .setOrigin(1, 1)
      .setPadding(4, 4, 4, 4)
    dialogueHint.setStroke('#04070f', 2)
    this.dialogueHint = dialogueHint

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

  private createQuestMap() {
    const questMapLeft = this.getQuestMapLeft()
    const overlay = this.add.container(0, 0).setScrollFactor(0).setDepth(2600).setVisible(false)
    const backdrop = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x01040b,
      0.7,
    )
    const panel = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 1112, 576, 0x050913, 0.94)
      .setStrokeStyle(3, 0xa4b6ff, 0.62)
    const title = this.add.text(112, 94, 'field map', {
      fontFamily: GAME_UI_FONT_FAMILY,
      fontSize: '30px',
      fontStyle: '700',
      color: '#f6f8ff',
    })
    title.setStroke('#01040b', 3)
    const hint = this.add
      .text(GAME_WIDTH - 112, 108, 'press m to close', {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '18px',
        fontStyle: '700',
        color: '#b7c4ff',
      })
      .setOrigin(1, 0.5)
    hint.setStroke('#01040b', 2)

    const mapShadow = this.add.rectangle(
      GAME_WIDTH / 2 + 8,
      QUEST_MAP_TOP + QUEST_MAP_HEIGHT / 2 + 8,
      QUEST_MAP_WIDTH,
      QUEST_MAP_HEIGHT,
      0x01040b,
      0.42,
    )
    const mapImage = this.add
      .image(questMapLeft, QUEST_MAP_TOP, 'world-map')
      .setOrigin(0)
      .setDisplaySize(QUEST_MAP_WIDTH, QUEST_MAP_HEIGHT)
    const mapShade = this.add.rectangle(
      GAME_WIDTH / 2,
      QUEST_MAP_TOP + QUEST_MAP_HEIGHT / 2,
      QUEST_MAP_WIDTH,
      QUEST_MAP_HEIGHT,
      0x061125,
      0.1,
    )
    const mapBorder = this.add
      .rectangle(
        GAME_WIDTH / 2,
        QUEST_MAP_TOP + QUEST_MAP_HEIGHT / 2,
        QUEST_MAP_WIDTH,
        QUEST_MAP_HEIGHT,
      )
      .setStrokeStyle(3, 0xd7e0ff, 0.5)

    overlay.add([backdrop, panel, title, hint, mapShadow, mapImage, mapShade, mapBorder])
    this.addQuestMapCrystalMarkers(overlay)
    this.addQuestMapFinalMarker(overlay)
    this.questMapPlayerMarker = this.createQuestMapPlayerMarker()
    overlay.add(this.questMapPlayerMarker)
    this.questMapOverlay = overlay
    this.refreshQuestMap()
  }

  private addQuestMapCrystalMarkers(overlay: Phaser.GameObjects.Container) {
    QUEST_MAP_CRYSTALS.forEach(({ encounterId, mapPoint, zoneId }) => {
      const zone = WORLD_INTERACTIONS.find(
        (interaction): interaction is HouseZone =>
          interaction.id === zoneId && interaction.trigger === 'touch',
      )
      if (!zone) {
        return
      }

      const encounter = BATTLE_ENCOUNTERS[encounterId]
      if (encounter.reward.kind !== 'crystal') {
        return
      }

      const crystal = encounter.reward.crystal
      const point = this.getQuestMapPoint(
        mapPoint?.x ?? zone.x + zone.width / 2,
        mapPoint?.y ?? zone.y + zone.height / 2,
      )
      const glow = this.add
        .ellipse(0, 0, 38, 28, crystal.colors.glow, 0.22)
        .setBlendMode(Phaser.BlendModes.ADD)
      const diamond = this.add
        .rectangle(0, 0, 18, 18, crystal.colors.body, 0.98)
        .setRotation(Math.PI / 4)
        .setStrokeStyle(2, crystal.colors.edge, 0.9)
      const label = this.add.text(22, -24, crystal.name.replace(' Crystal', ''), {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '15px',
        fontStyle: '700',
        color: '#f6f8ff',
      })
      label.setStroke('#01040b', 3)
      const statusText = this.add.text(22, -4, '', {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '12px',
        fontStyle: '700',
        color: '#b7c4ff',
      })
      statusText.setStroke('#01040b', 2)

      const marker = this.add.container(point.x, point.y, [glow, diamond, label, statusText])
      overlay.add(marker)
      this.questMapCrystalMarkers.push({
        crystalId: crystal.id,
        marker,
        statusText,
      })
    })
  }

  private addQuestMapFinalMarker(overlay: Phaser.GameObjects.Container) {
    const point = this.getQuestMapPoint(FINAL_GUIDE_SPARK_POINT.x, FINAL_GUIDE_SPARK_POINT.y)
    const glow = this.add
      .ellipse(0, 0, 46, 34, 0xcdd8ff, 0.24)
      .setBlendMode(Phaser.BlendModes.ADD)
    const star = this.add
      .star(0, 0, 8, 7, 18, 0xf6f8ff, 0.96)
      .setStrokeStyle(2, 0x9bb1ff, 0.9)
      .setBlendMode(Phaser.BlendModes.ADD)
    const label = this.add.text(24, -22, 'Final Guide', {
      fontFamily: GAME_UI_FONT_FAMILY,
      fontSize: '15px',
      fontStyle: '700',
      color: '#fff1a8',
    })
    label.setStroke('#01040b', 3)
    const status = this.add.text(24, -2, 'light calls', {
      fontFamily: GAME_UI_FONT_FAMILY,
      fontSize: '12px',
      fontStyle: '700',
      color: '#d7e0ff',
    })
    status.setStroke('#01040b', 2)

    this.finalSparkMapMarker = this.add
      .container(point.x, point.y, [glow, star, label, status])
      .setVisible(false)
    overlay.add(this.finalSparkMapMarker)

    this.tweens.add({
      targets: [glow, star],
      alpha: '-=0.44',
      duration: 520,
      ease: 'Sine.easeInOut',
      repeat: -1,
      yoyo: true,
    })
    this.tweens.add({
      targets: star,
      angle: 360,
      duration: 2400,
      repeat: -1,
      ease: 'Linear',
    })
  }

  private createQuestMapPlayerMarker() {
    const pulse = this.add
      .ellipse(0, 0, 38, 38)
      .setStrokeStyle(3, 0xf6f8ff, 0.92)
      .setBlendMode(Phaser.BlendModes.ADD)
    const dot = this.add.circle(0, 0, 9, 0xf6f8ff, 1).setStrokeStyle(3, 0x10192d, 0.85)
    const label = this.add
      .text(0, 24, 'you', {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '14px',
        fontStyle: '700',
        color: '#f6f8ff',
      })
      .setOrigin(0.5, 0)
    label.setStroke('#01040b', 3)

    this.tweens.add({
      targets: pulse,
      alpha: 0.22,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 760,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    return this.add.container(0, 0, [pulse, dot, label]).setDepth(4)
  }

  private toggleQuestMap() {
    if (this.questMapOpen) {
      this.closeQuestMap()
      return
    }

    this.openQuestMap()
  }

  private openQuestMap() {
    if (
      !this.questMapGranted ||
      this.transitioning ||
      this.dialogueOpen ||
      this.questGuideVanishActive ||
      !this.questMapOverlay
    ) {
      return
    }

    this.questMapOpen = true
    this.questMapOverlay.setVisible(true)
    this.interactionPrompt?.setVisible(false)
    this.helpPanel?.setVisible(false)
    this.refreshQuestMap()
    playSfx(this, SFX_KEYS.uiConfirm)
  }

  private closeQuestMap() {
    this.questMapOpen = false
    this.questMapOverlay?.setVisible(false)
    playSfx(this, SFX_KEYS.uiCancel, { volume: 0.32 })
  }

  private refreshQuestMap() {
    const profile = loadVisitorProfile()
    const collectedCrystalIds = new Set(profile.progress.crystalIds)

    this.questMapCrystalMarkers.forEach(({ crystalId, marker, statusText }) => {
      const collected = collectedCrystalIds.has(crystalId)

      marker.setAlpha(collected ? 0.58 : 1)
      statusText.setText(collected ? 'collected' : 'trial waits')
      statusText.setColor(collected ? '#d7e0ff' : '#b7c4ff')
    })
    this.finalSparkVisible = this.shouldShowFinalSpark(profile)
    this.finalSparkMapMarker?.setVisible(this.finalSparkVisible)
    this.updateQuestMapPlayerMarker()
  }

  private updateQuestMapPlayerMarker() {
    if (!this.player || !this.questMapPlayerMarker) {
      return
    }

    const point = this.getQuestMapPoint(this.player.x, this.player.y)
    this.questMapPlayerMarker.setPosition(point.x, point.y)
  }

  private getQuestMapPoint(worldX: number, worldY: number) {
    return {
      x: this.getQuestMapLeft() + (worldX / WORLD_WIDTH) * QUEST_MAP_WIDTH,
      y: QUEST_MAP_TOP + (worldY / WORLD_HEIGHT) * QUEST_MAP_HEIGHT,
    }
  }

  private getQuestMapLeft() {
    return (GAME_WIDTH - QUEST_MAP_WIDTH) / 2
  }

  private bindInteractionInput() {
    this.input.keyboard?.on('keydown-E', () => this.handlePrimaryAction())
    this.input.keyboard?.on('keydown-SPACE', () => this.handlePrimaryAction())
    this.input.keyboard?.on('keydown-ENTER', () => this.handlePrimaryAction())
    this.input.keyboard?.on('keydown-ESC', () => this.handleBackAction())
    this.input.keyboard?.on('keydown-H', () => this.toggleHelpPanel())
    this.input.keyboard?.on('keydown-M', () => this.toggleQuestMap())
  }

  private handlePrimaryAction() {
    if (this.questMapOpen) {
      this.closeQuestMap()
      return
    }

    if (this.transitioning || this.questGuideVanishActive) {
      return
    }

    if (this.dialogueOpen) {
      if (this.questGuideIntroActive) {
        if (!this.questGuideDialogueReady) {
          return
        }

        playSfx(this, SFX_KEYS.textAdvance, { volume: 0.28 })
        this.advanceQuestGuideDialogue()
        return
      }

      if (this.finalGuideIntroActive) {
        if (!this.finalGuideDialogueReady) {
          return
        }

        playSfx(this, SFX_KEYS.textAdvance, { volume: 0.28 })
        this.advanceFinalGuideDialogue()
        return
      }

      if (this.dialogueTyping) {
        return
      }

      if (this.advanceDialoguePage(1)) {
        playSfx(this, SFX_KEYS.textAdvance, { volume: 0.28 })
        return
      }

      playSfx(this, SFX_KEYS.textAdvance, { volume: 0.28 })
      this.closeDialogue()
      return
    }

    if (this.activeFinalSpark) {
      playSfx(this, SFX_KEYS.uiConfirm)
      this.startFinalGuideIntro()
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

    this.openDialogue(this.activeZone.label, this.activeZone.message || portfolioDialogues.contactSign)
    playSfx(this, SFX_KEYS.uiConfirm)
  }

  private handleBackAction() {
    if (this.questMapOpen) {
      this.closeQuestMap()
      return
    }

    if (this.transitioning || this.questGuideVanishActive) {
      return
    }

    if (this.dialogueOpen) {
      if (this.questGuideIntroActive) {
        if (!this.questGuideDialogueReady) {
          return
        }

        playSfx(this, SFX_KEYS.textAdvance, { volume: 0.28 })
        this.advanceQuestGuideDialogue()
        return
      }

      if (this.finalGuideIntroActive) {
        if (!this.finalGuideDialogueReady) {
          return
        }

        playSfx(this, SFX_KEYS.textAdvance, { volume: 0.28 })
        this.advanceFinalGuideDialogue()
        return
      }

      if (this.dialogueTyping) {
        return
      }

      if (this.advanceDialoguePage(-1)) {
        playSfx(this, SFX_KEYS.textAdvance, { volume: 0.28 })
        return
      }

      playSfx(this, SFX_KEYS.uiCancel, { volume: 0.32 })
      this.closeDialogue()
      return
    }

    if (this.helpPanel?.visible) {
      this.helpPanel.setVisible(false)
      playSfx(this, SFX_KEYS.uiCancel, { volume: 0.32 })
    }
  }

  private closeDialogue() {
    this.dialogueTypewriteRun += 1
    this.dialogueTyping = false
    this.dialogueOpen = false
    this.dialoguePages = []
    this.dialoguePageIndex = 0
    this.dialogueBox?.setVisible(false)
  }

  private toggleHelpPanel() {
    if (
      this.transitioning ||
      this.dialogueOpen ||
      this.questGuideVanishActive ||
      this.questMapOpen ||
      !this.helpPanel
    ) {
      return
    }

    this.helpPanel.setVisible(!this.helpPanel.visible)
  }

  private openInitialDialogueIfNeeded() {
    if (this.dialogueOpen || !this.initialDialogue || !this.dialogueBox || !this.dialogueBody) {
      return
    }

    this.openDialogue(this.initialDialogue.title, this.initialDialogue.message)
  }

  private openDialogue(titleText: string, message: string, hintText?: string, onComplete?: () => void) {
    if (!this.dialogueBox || !this.dialogueBody) {
      return
    }

    const title = this.dialogueBox.getData('title') as Phaser.GameObjects.Text
    title.setText(titleText)
    this.dialoguePages = paginateDialogueText(message, WORLD_DIALOGUE_PAGE_MAX_CHARS)
    this.dialoguePageIndex = 0
    this.dialogueBox.setVisible(true)
    this.dialogueOpen = true
    this.interactionPrompt?.setVisible(false)
    this.showDialoguePage(hintText, onComplete)
  }

  private showDialoguePage(hintText?: string, onComplete?: () => void) {
    this.dialogueHint?.setText(hintText ?? this.getDialogueHint())
    this.typeDialogueText(this.dialoguePages[this.dialoguePageIndex] ?? '', () => {
      this.dialogueHint?.setText(hintText ?? this.getDialogueHint())
      onComplete?.()
    })
  }

  private advanceDialoguePage(direction: -1 | 1) {
    const nextIndex = this.dialoguePageIndex + direction

    if (nextIndex < 0 || nextIndex >= this.dialoguePages.length) {
      return false
    }

    this.dialoguePageIndex = nextIndex
    this.showDialoguePage()
    return true
  }

  private getDialogueHint() {
    const hasPreviousPage = this.dialoguePageIndex > 0
    const hasNextPage = this.dialoguePageIndex < this.dialoguePages.length - 1
    const pageText =
      this.dialoguePages.length > 1
        ? `${this.dialoguePageIndex + 1}/${this.dialoguePages.length}   `
        : ''

    if (hasNextPage) {
      return this.mobileControlsEnabled
        ? `${pageText}A next   B ${hasPreviousPage ? 'previous' : 'closes'}`
        : `${pageText}enter next   esc ${hasPreviousPage ? 'previous' : 'closes'}`
    }

    return this.mobileControlsEnabled
      ? `${pageText}A closes   B ${hasPreviousPage ? 'previous' : 'closes'}`
      : `${pageText}enter closes   esc ${hasPreviousPage ? 'previous' : 'closes'}`
  }

  private typeDialogueText(message: string, onComplete?: () => void) {
    if (!this.dialogueBody) {
      return
    }

    const run = this.dialogueTypewriteRun + 1
    this.dialogueTypewriteRun = run
    this.dialogueTyping = true

    void typewriteText(this, this.dialogueBody, message, 28, {
      shouldContinue: () => this.dialogueTypewriteRun === run && this.dialogueOpen,
    }).then(() => {
      if (this.dialogueTypewriteRun !== run) {
        return
      }

      this.dialogueTyping = false
      onComplete?.()
    })
  }

  private startFinalGuideIntro() {
    if (!this.finalSparkVisible || !this.dialogueBox || !this.dialogueBody) {
      return
    }

    const profile = loadVisitorProfile()
    const guideY = FINAL_GUIDE_SPARK_POINT.y - 46
    const { aura, guide, shadow } = this.createQuestGuideAt(FINAL_GUIDE_SPARK_POINT.x, guideY)

    this.finalSpark?.setVisible(false)
    this.activeFinalSpark = false
    this.finalGuideDialogueLines = portfolioDialogues.finalGuideChallenge(
      profile.visitorName || 'traveler',
    )
    this.finalGuideLineIndex = 0
    this.finalGuideIntroActive = true
    this.finalGuideDialogueReady = false
    this.dialogueOpen = true
    this.interactionPrompt?.setVisible(false)
    this.helpPanel?.setVisible(false)

    guide.setAlpha(0).setScale(0.2).setTint(0xf6f8ff)
    aura.setAlpha(0).setScale(0.25)
    shadow.setAlpha(0).setScale(0.35, 1)
    this.createGuideLightBurst(FINAL_GUIDE_SPARK_POINT.x, FINAL_GUIDE_SPARK_POINT.y)
    playSfx(this, SFX_KEYS.finalUnlock, { volume: 0.5 })

    this.tweens.add({
      targets: guide,
      alpha: 1,
      scale: QUEST_GUIDE_SCALE,
      duration: 460,
      ease: 'Back.Out',
      onComplete: () => guide.clearTint(),
    })
    this.tweens.add({
      targets: aura,
      alpha: 0.28,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 420,
      ease: 'Sine.Out',
    })
    this.tweens.add({
      targets: shadow,
      alpha: 0.48,
      scaleX: 1,
      duration: 360,
      ease: 'Sine.Out',
    })
    this.tweens.add({
      targets: guide,
      y: guide.y - 8,
      duration: 1080,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 460,
    })

    this.time.delayedCall(520, () => this.showFinalGuideDialogueLine())
  }

  private showFinalGuideDialogueLine() {
    if (!this.dialogueBox || !this.dialogueBody) {
      return
    }

    const line = this.finalGuideDialogueLines[this.finalGuideLineIndex]
    if (!line) {
      return
    }

    const title = this.dialogueBox.getData('title') as Phaser.GameObjects.Text
    const finalLine = this.finalGuideLineIndex === this.finalGuideDialogueLines.length - 1
    title.setText('Mysterious Guide')
    this.dialogueHint?.setText(
      finalLine
        ? this.mobileControlsEnabled
          ? 'A accepts'
          : 'enter / space accepts'
        : this.mobileControlsEnabled
          ? 'A continues'
          : 'enter / space continues',
    )
    this.dialogueBox.setVisible(true)
    this.finalGuideDialogueReady = false
    this.typeDialogueText(line, () => {
      this.finalGuideDialogueReady = true
    })
  }

  private advanceFinalGuideDialogue() {
    if (!this.finalGuideDialogueReady) {
      return
    }

    if (this.finalGuideLineIndex < this.finalGuideDialogueLines.length - 1) {
      this.finalGuideLineIndex += 1
      this.showFinalGuideDialogueLine()
      return
    }

    playSfx(this, SFX_KEYS.uiConfirm)
    this.startFinalGuideBattle()
  }

  private startFinalGuideBattle() {
    if (!this.player) {
      return
    }

    this.dialogueOpen = false
    this.dialogueTypewriteRun += 1
    this.dialogueTyping = false
    this.finalGuideIntroActive = false
    this.finalGuideDialogueReady = false
    this.transitioning = true
    this.dialogueBox?.setVisible(false)
    this.interactionPrompt?.setVisible(false)
    this.player.setVelocity(0, 0)
    this.direction = 'up'
    this.playIdleAnimation()

    void playSquareCloseTransition(this).then(() => {
      this.scene.start('battle', {
        encounterId: FINAL_GUIDE_ENCOUNTER_ID,
        playerAnimPrefix: this.playerAnimPrefix,
        returnData: {
          returnScene: 'world',
          spawn: FINAL_GUIDE_RETURN_POINT,
        },
      })
    })
  }

  private createGuideLightBurst(x: number, y: number) {
    const ring = this.add
      .ellipse(x, y - 6, 34, 18)
      .setStrokeStyle(3, 0xf6f8ff, 0.95)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(104)
    const flash = this.add
      .circle(x, y - 36, 20, 0xf6f8ff, 0.86)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(105)

    this.tweens.add({
      targets: ring,
      alpha: 0,
      scaleX: 4.8,
      scaleY: 3,
      duration: 680,
      ease: 'Sine.Out',
      onComplete: () => ring.destroy(),
    })
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 6,
      duration: 420,
      ease: 'Quad.Out',
      onComplete: () => flash.destroy(),
    })

    for (let index = 0; index < QUEST_GUIDE_SPARKLE_COUNT + 10; index += 1) {
      const sparkle = this.add
        .image(
          x + Phaser.Math.Between(-26, 26),
          y + Phaser.Math.Between(-72, 22),
          'star',
        )
        .setTint(index % 3 === 0 ? 0xfff1a8 : 0xcdd8ff)
        .setScale(Phaser.Math.FloatBetween(0.22, 0.58))
        .setAlpha(Phaser.Math.FloatBetween(0.62, 1))
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(106)

      this.tweens.add({
        targets: sparkle,
        x: sparkle.x + Phaser.Math.Between(-96, 96),
        y: sparkle.y + Phaser.Math.Between(-118, 36),
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(420, 840),
        ease: 'Sine.Out',
        onComplete: () => sparkle.destroy(),
      })
    }
  }

  private showQuestGuideDialogueLine() {
    if (!this.dialogueBox || !this.dialogueBody) {
      return
    }

    const line = this.questGuideDialogueLines[this.questGuideLineIndex]
    if (!line) {
      return
    }

    const title = this.dialogueBox.getData('title') as Phaser.GameObjects.Text
    const finalLine = this.questGuideLineIndex === this.questGuideDialogueLines.length - 1
    title.setText('Mysterious Guide')
    this.dialogueHint?.setText(
      finalLine
        ? this.mobileControlsEnabled
          ? 'A begins'
          : 'enter / space begins'
        : this.mobileControlsEnabled
          ? 'A continues'
          : 'enter / space continues',
    )
    this.dialogueBox.setVisible(true)
    this.questGuideDialogueReady = false
    this.typeDialogueText(line, () => {
      this.questGuideDialogueReady = true
    })
  }

  private advanceQuestGuideDialogue() {
    if (!this.questGuideDialogueReady) {
      return
    }

    if (this.questGuideLineIndex < this.questGuideDialogueLines.length - 1) {
      this.questGuideLineIndex += 1
      this.showQuestGuideDialogueLine()
      return
    }

    this.dialogueOpen = false
    this.dialogueTypewriteRun += 1
    this.dialogueTyping = false
    this.questGuideIntroActive = false
    this.questGuideDialogueReady = false
    this.dialogueBox?.setVisible(false)
    this.questMapGranted = markQuestGuideIntroSeen().progress.questMapGranted
    playSfx(this, SFX_KEYS.crystalReward, { volume: 0.46 })
    this.vanishQuestGuide()
  }

  private vanishQuestGuide() {
    const guide = this.questGuide
    if (!guide) {
      this.questGuideVanishActive = false
      return
    }

    const aura = this.questGuideAura
    const shadow = this.questGuideShadow
    const tweenTargets = [guide, aura, shadow].filter(
      (target): target is Phaser.GameObjects.Image | Phaser.GameObjects.Ellipse => Boolean(target),
    )

    this.questGuideVanishActive = true
    this.tweens.killTweensOf(tweenTargets)
    this.createGuideVanishSparkles(guide.x, guide.y)
    playSfx(this, SFX_KEYS.magicImpact, { volume: 0.34 })

    guide.setTint(0xcdd8ff)
    this.tweens.add({
      targets: guide,
      y: guide.y - 42,
      alpha: 0,
      scale: 0.2,
      duration: 680,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        guide.destroy()
        aura?.destroy()
        shadow?.destroy()
        this.questGuide = undefined
        this.questGuideAura = undefined
        this.questGuideShadow = undefined
        this.questGuideVanishActive = false
      },
    })

    if (aura) {
      this.tweens.add({
        targets: aura,
        alpha: 0,
        scaleX: 0.25,
        scaleY: 0.25,
        duration: 520,
        ease: 'Sine.easeIn',
      })
    }

    if (shadow) {
      this.tweens.add({
        targets: shadow,
        alpha: 0,
        scaleX: 0.2,
        duration: 360,
        ease: 'Sine.easeIn',
      })
    }
  }

  private createGuideVanishSparkles(x: number, y: number) {
    const ring = this.add
      .ellipse(x, y + 18, 28, 12)
      .setStrokeStyle(2, 0xcdd8ff, 0.9)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(103)

    this.tweens.add({
      targets: ring,
      alpha: 0,
      scaleX: 4,
      scaleY: 2.8,
      duration: 650,
      ease: 'Sine.Out',
      onComplete: () => ring.destroy(),
    })

    for (let index = 0; index < QUEST_GUIDE_SPARKLE_COUNT; index += 1) {
      const sparkle = this.add
        .image(
          x + Phaser.Math.Between(-18, 18),
          y + Phaser.Math.Between(-42, 34),
          'star',
        )
        .setTint(0xcdd8ff)
        .setScale(Phaser.Math.FloatBetween(0.18, 0.46))
        .setAlpha(Phaser.Math.FloatBetween(0.55, 0.95))
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(104)

      this.tweens.add({
        targets: sparkle,
        x: sparkle.x + Phaser.Math.Between(-76, 76),
        y: sparkle.y + Phaser.Math.Between(-92, 32),
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(380, 760),
        ease: 'Sine.Out',
        onComplete: () => sparkle.destroy(),
      })
    }
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

  private isHouseZone(zone: InteractionZone): zone is HouseZone {
    return zone.trigger === 'touch'
  }

  private enterHouse(zone: HouseZone) {
    if (this.transitioning) {
      return
    }

    this.transitioning = true
    this.player?.setVelocity(0, 0)
    playSfx(this, SFX_KEYS.transitionDoor, { volume: 0.34 })
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
    this.playStepSound()
  }

  private playStepSound() {
    if (this.time.now - this.lastStepSoundAt < 260) {
      return
    }

    const key = this.stepSoundIndex % 2 === 0 ? SFX_KEYS.walkGrassA : SFX_KEYS.walkGrassB
    this.stepSoundIndex += 1
    this.lastStepSoundAt = this.time.now
    playSfx(this, key, { volume: 0.16 })
  }

  private updateActiveZone() {
    if (!this.player || !this.interactionPrompt) {
      return
    }

    const interactionBounds = this.getInteractionBounds()
    if (!interactionBounds) {
      this.activeFinalSpark = false
      this.interactionPrompt.setVisible(false)
      return
    }

    this.activeFinalSpark = false

    if (this.finalSparkVisible) {
      const sparkRect = new Phaser.Geom.Rectangle(
        FINAL_GUIDE_SPARK_AREA.x,
        FINAL_GUIDE_SPARK_AREA.y,
        FINAL_GUIDE_SPARK_AREA.width,
        FINAL_GUIDE_SPARK_AREA.height,
      )

      if (Phaser.Geom.Intersects.RectangleToRectangle(interactionBounds, sparkRect)) {
        this.activeZone = undefined
        this.suppressedHouseEntryZoneId = undefined
        this.activeFinalSpark = true
        this.interactionPrompt
          .setText(this.mobileControlsEnabled ? 'press A: Guide Light' : 'press e: Guide Light')
          .setVisible(true)
        return
      }
    }

    this.activeZone = WORLD_INTERACTIONS.find((zone) => {
      const zoneRect = new Phaser.Geom.Rectangle(zone.x, zone.y, zone.width, zone.height)
      return Phaser.Geom.Intersects.RectangleToRectangle(interactionBounds, zoneRect)
    })

    if (!this.activeZone) {
      this.suppressedHouseEntryZoneId = undefined
      this.activeFinalSpark = false
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
    this.interactionPrompt
      .setText((this.mobileControlsEnabled ? 'press A: ' : 'press e: ') + this.activeZone.label)
      .setVisible(true)
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

  private cleanupSceneControls() {
    clearVirtualControlInputs()
    setGameplayControlContext(null)
  }
}
