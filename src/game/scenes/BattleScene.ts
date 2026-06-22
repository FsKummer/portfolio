import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../core/config'
import { GAME_UI_FONT_FAMILY } from '../core/ui'
import {
  type BattleActionId,
  type BattleEncounter,
  type BattleEncounterId,
  type CrystalBattleEncounterId,
  getBattleAction,
  getBattleEncounter,
} from '../data/battles'
import { INTERIORS } from '../data/interiors'
import { getBattleSceneText } from '../data/localizedText'
import {
  type LanguageCode,
  loadVisitorProfile,
  markBattleDefeated,
} from '../store/sessionStore'
import {
  clearVirtualControlInputs,
  consumeQueuedVirtualControlAction,
  isHeldVirtualControlPressed,
  setGameplayControlContext,
} from '../store/virtualControls'
import { MUSIC_KEYS, SFX_KEYS, playMusic, playSfx } from '../systems/audio'
import { playSquareRevealTransition } from '../systems/squareTransition'
import type { InteriorSceneData, InteriorSceneDialogue } from './InteriorScene'

type BattleSceneData = {
  encounterId: BattleEncounterId
  playerAnimPrefix: 'adam' | 'amelia'
  returnData: BattleReturnData
}

export type WorldBattleReturnData = {
  initialDialogue?: {
    message: string
    title: string
  }
  returnScene: 'world'
  spawn: {
    x: number
    y: number
  }
}

type BattleReturnData = InteriorSceneData | WorldBattleReturnData

type FighterState = {
  attackDamage: number
  hp: number
  maxHp: number
  maxMp: number
  mp: number
  name: string
}

const PLAYER_STATS: FighterState = {
  attackDamage: 0,
  hp: 55,
  maxHp: 55,
  maxMp: 24,
  mp: 24,
  name: 'Traveler',
}

const BATTLE_PANEL_COLOR = 0x04070f
const BATTLE_PANEL_STROKE = 0xa4b6ff
const BAR_WIDTH = 170
const BAR_HEIGHT = 14
const BATTLE_MAP_SCALE = 3
const BATTLE_TILE_SIZE = 48
const DEFAULT_BATTLE_CHARACTER_SCALE = 5.6

export class BattleScene extends Phaser.Scene {
  private commandTexts: Phaser.GameObjects.Text[] = []
  private combatLog: string[] = []
  private encounter!: BattleEncounter
  private enemy!: FighterState
  private enemyHpFill?: Phaser.GameObjects.Rectangle
  private enemyHpText?: Phaser.GameObjects.Text
  private enemyMpFill?: Phaser.GameObjects.Rectangle
  private enemyMpText?: Phaser.GameObjects.Text
  private enemySprite?: Phaser.GameObjects.Sprite
  private itemUsed = false
  private language: LanguageCode = 'en'
  private lastVirtualDownPressed = false
  private lastVirtualUpPressed = false
  private logText?: Phaser.GameObjects.Text
  private player!: FighterState
  private battleText!: ReturnType<typeof getBattleSceneText>
  private playerAnimPrefix: 'adam' | 'amelia' = 'adam'
  private playerHpFill?: Phaser.GameObjects.Rectangle
  private playerHpText?: Phaser.GameObjects.Text
  private playerMpFill?: Phaser.GameObjects.Rectangle
  private playerMpText?: Phaser.GameObjects.Text
  private playerSprite?: Phaser.GameObjects.Sprite
  private returnData!: BattleReturnData
  private selectedActionIndex = 0
  private turnLocked = false
  private battleEnded = false

  constructor() {
    super('battle')
  }

  init(data: BattleSceneData) {
    const profile = loadVisitorProfile()

    this.language = profile.language
    this.battleText = getBattleSceneText(this.language)
    this.encounter = getBattleEncounter(data.encounterId, this.language)
    this.returnData = data.returnData
    this.playerAnimPrefix = data.playerAnimPrefix
    this.player = { ...PLAYER_STATS, name: this.battleText.playerName }
    this.enemy = {
      attackDamage: this.encounter.enemy.attackDamage,
      hp: this.encounter.enemy.maxHp,
      maxHp: this.encounter.enemy.maxHp,
      maxMp: this.encounter.enemy.maxMp,
      mp: this.encounter.enemy.maxMp,
      name: this.encounter.enemy.name,
    }
    this.itemUsed = false
    this.commandTexts = []
    this.combatLog = []
    this.selectedActionIndex = 0
    this.turnLocked = false
    this.battleEnded = false
    this.lastVirtualDownPressed = false
    this.lastVirtualUpPressed = false
  }

  create() {
    this.cameras.main.setBackgroundColor('#050913')
    this.turnLocked = true
    playMusic(
      this,
      this.encounter.reward.kind === 'final' ? MUSIC_KEYS.finalBoss : MUSIC_KEYS.battle,
    )
    playSfx(this, SFX_KEYS.battleStart, { volume: 0.48 })
    this.createBattlefield()
    this.createStatusPanels()
    this.createCommandMenu()
    this.createCombatLog()
    this.bindBattleInput()
    this.refreshUi()
    this.pushLog(this.encounter.introLog)
    setGameplayControlContext('battle')
    void playSquareRevealTransition(this).then(() => {
      if (this.battleEnded) {
        return
      }

      this.turnLocked = false
      this.refreshCommandMenu()
      playSfx(this, SFX_KEYS.battleTurn, { volume: 0.34 })
    })
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanupSceneControls, this)
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanupSceneControls, this)
  }

  update() {
    this.processVirtualActions()
  }

  private createBattlefield() {
    const battlefield = this.encounter.battlefield
    const imageKey =
      battlefield.imageKey ??
      (battlefield.interiorId ? INTERIORS[battlefield.interiorId].imageKey : undefined)

    if (!imageKey) {
      throw new Error(`Battle encounter ${this.encounter.id} is missing a battlefield image.`)
    }

    this.add
      .image(battlefield.backgroundOffset.x, battlefield.backgroundOffset.y, imageKey)
      .setOrigin(0)
      .setScale(battlefield.backgroundScale ?? BATTLE_MAP_SCALE)
      .setDepth(0)
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x050913, 0.32)
    this.add.rectangle(GAME_WIDTH / 2, 384, GAME_WIDTH, 160, 0x050913, 0.2)

    const playerPosition = this.getBattleScreenPosition(battlefield.playerTile)
    const enemyPosition = this.getBattleScreenPosition(battlefield.enemyTile)
    const characterScale = battlefield.characterScale ?? DEFAULT_BATTLE_CHARACTER_SCALE
    const shadowOffsetY = characterScale * 16
    const shadowWidth = characterScale * 28
    const shadowHeight = characterScale * 4.3

    this.playerSprite = this.add
      .sprite(playerPosition.x, playerPosition.y, `${this.playerAnimPrefix}-idle`, 6)
      .setScale(characterScale)
      .setDepth(20)
    this.playerSprite.play(`${this.playerAnimPrefix}-idle-up`)
    const enemyFrame = this.encounter.enemy.spriteKey === 'mystic-guide' ? undefined : 18

    this.enemySprite = this.add
      .sprite(enemyPosition.x, enemyPosition.y, this.encounter.enemy.spriteKey, enemyFrame)
      .setScale(characterScale)
      .setDepth(20)

    this.add
      .ellipse(
        this.playerSprite.x,
        this.playerSprite.y + shadowOffsetY,
        shadowWidth,
        shadowHeight,
        0x01040b,
        0.5,
      )
      .setDepth(10)
    this.add
      .ellipse(
        this.enemySprite.x,
        this.enemySprite.y + shadowOffsetY,
        shadowWidth,
        shadowHeight,
        0x01040b,
        0.5,
      )
      .setDepth(10)

    this.add
      .text(GAME_WIDTH / 2, 44, this.encounter.title, {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '34px',
        fontStyle: '700',
        color: '#f6f8ff',
      })
      .setOrigin(0.5)
      .setStroke('#01040b', 4)
  }

  private getBattleScreenPosition(tile: { x: number; y: number }) {
    return {
      x:
        this.encounter.battlefield.backgroundOffset.x +
        tile.x * BATTLE_TILE_SIZE +
        BATTLE_TILE_SIZE / 2,
      y:
        this.encounter.battlefield.backgroundOffset.y +
        tile.y * BATTLE_TILE_SIZE +
        BATTLE_TILE_SIZE / 2,
    }
  }

  private createStatusPanels() {
    this.createStatusPanel(72, 408, this.player.name, true)
    this.createStatusPanel(72, 108, this.enemy.name, false)
  }

  private createStatusPanel(x: number, y: number, title: string, isPlayer: boolean) {
    this.add
      .rectangle(x, y, 320, 128, BATTLE_PANEL_COLOR, 0.84)
      .setOrigin(0)
      .setStrokeStyle(3, BATTLE_PANEL_STROKE, 0.55)

    this.add.text(x + 28, y + 20, title, {
      fontFamily: GAME_UI_FONT_FAMILY,
      fontSize: '22px',
      fontStyle: '700',
      color: '#f6f8ff',
    })

    const hpText = this.add.text(x + 28, y + 54, '', {
      fontFamily: GAME_UI_FONT_FAMILY,
      fontSize: '16px',
      fontStyle: '700',
      color: '#d7e0ff',
    })
    const mpText = this.add.text(x + 28, y + 88, '', {
      fontFamily: GAME_UI_FONT_FAMILY,
      fontSize: '16px',
      fontStyle: '700',
      color: '#d7e0ff',
    })
    const hpFill = this.createBar(x + 118, y + 62, 0x6ff0a3)
    const mpFill = this.createBar(x + 118, y + 96, 0x7eb6ff)

    if (isPlayer) {
      this.playerHpText = hpText
      this.playerMpText = mpText
      this.playerHpFill = hpFill
      this.playerMpFill = mpFill
      return
    }

    this.enemyHpText = hpText
    this.enemyMpText = mpText
    this.enemyHpFill = hpFill
    this.enemyMpFill = mpFill
  }

  private createBar(x: number, y: number, color: number) {
    this.add.rectangle(x, y, BAR_WIDTH, BAR_HEIGHT, 0x111a2e, 0.92).setOrigin(0, 0.5)
    return this.add.rectangle(x, y, BAR_WIDTH, BAR_HEIGHT, color, 0.9).setOrigin(0, 0.5)
  }

  private createCommandMenu() {
    this.add
      .rectangle(72, GAME_HEIGHT - 178, 328, 138, BATTLE_PANEL_COLOR, 0.88)
      .setOrigin(0)
      .setStrokeStyle(3, BATTLE_PANEL_STROKE, 0.6)

    this.commandTexts = this.encounter.actions.map((actionId, index) => {
      const action = getBattleAction(actionId, this.language)
      const commandText = this.add
        .text(112, GAME_HEIGHT - 150 + index * 38, '', {
          fontFamily: GAME_UI_FONT_FAMILY,
          fontSize: '24px',
          fontStyle: '700',
          color: '#d7e0ff',
        })
        .setInteractive({ useHandCursor: true })

      commandText.on('pointerover', () => {
        if (!this.canUseMenu()) {
          return
        }

        this.selectedActionIndex = index
        this.refreshCommandMenu()
      })
      commandText.on('pointerdown', () => {
        if (!this.canUseMenu()) {
          return
        }

        this.selectedActionIndex = index
        this.chooseAction(action.id)
      })

      return commandText
    })
  }

  private createCombatLog() {
    this.add
      .rectangle(426, GAME_HEIGHT - 178, 782, 138, BATTLE_PANEL_COLOR, 0.88)
      .setOrigin(0)
      .setStrokeStyle(3, BATTLE_PANEL_STROKE, 0.6)

    this.logText = this.add.text(462, GAME_HEIGHT - 146, '', {
      fontFamily: GAME_UI_FONT_FAMILY,
      fontSize: '21px',
      fontStyle: '700',
      color: '#f6f8ff',
      lineSpacing: 8,
      wordWrap: { width: 700 },
    })
    this.logText.setStroke('#01040b', 2)
  }

  private bindBattleInput() {
    this.input.keyboard?.on('keydown-UP', () => this.moveSelection(-1))
    this.input.keyboard?.on('keydown-W', () => this.moveSelection(-1))
    this.input.keyboard?.on('keydown-DOWN', () => this.moveSelection(1))
    this.input.keyboard?.on('keydown-S', () => this.moveSelection(1))
    this.input.keyboard?.on('keydown-ENTER', () => this.chooseSelectedAction())
    this.input.keyboard?.on('keydown-SPACE', () => this.chooseSelectedAction())
    this.input.keyboard?.on('keydown-E', () => this.chooseSelectedAction())
  }

  private processVirtualActions() {
    const upPressed = isHeldVirtualControlPressed('up')
    const downPressed = isHeldVirtualControlPressed('down')

    if (upPressed && !this.lastVirtualUpPressed) {
      this.moveSelection(-1)
    }

    if (downPressed && !this.lastVirtualDownPressed) {
      this.moveSelection(1)
    }

    this.lastVirtualUpPressed = upPressed
    this.lastVirtualDownPressed = downPressed

    if (consumeQueuedVirtualControlAction('a')) {
      this.chooseSelectedAction()
    }

    if (consumeQueuedVirtualControlAction('b')) {
      playSfx(this, SFX_KEYS.errorLocked, { volume: 0.32 })
      this.pushLog(this.battleText.focusedTrialLog)
    }
  }

  private moveSelection(direction: number) {
    if (!this.canUseMenu()) {
      return
    }

    this.selectedActionIndex =
      (this.selectedActionIndex + direction + this.encounter.actions.length) %
      this.encounter.actions.length
    playSfx(this, SFX_KEYS.uiCursor, { volume: 0.3 })
    this.refreshCommandMenu()
  }

  private chooseSelectedAction() {
    if (!this.canUseMenu()) {
      return
    }

    this.chooseAction(this.encounter.actions[this.selectedActionIndex])
  }

  private chooseAction(actionId: BattleActionId) {
    if (!this.canUseMenu()) {
      return
    }

    const action = getBattleAction(actionId, this.language)
    const effect = action.effect

    if (effect.kind === 'damage') {
      const mpCost = effect.mpCost ?? 0

      if (this.player.mp < mpCost) {
        playSfx(this, SFX_KEYS.errorLocked, { volume: 0.32 })
        this.pushLog(this.battleText.notEnoughMp)
        return
      }

      playSfx(this, SFX_KEYS.uiConfirm)
      this.turnLocked = true
      this.player.mp -= mpCost
      void this.runDamageAction(action.id, effect.amount)
      return
    }

    if (this.itemUsed) {
      playSfx(this, SFX_KEYS.errorLocked, { volume: 0.32 })
      this.pushLog(this.battleText.noPotionRemains)
      return
    }

    playSfx(this, SFX_KEYS.uiConfirm)
    this.turnLocked = true
    this.itemUsed = true
    const healed = this.applyHealing(this.player, effect.amount)
    playSfx(this, SFX_KEYS.itemUse, { volume: 0.42 })
    this.pushLog(
      healed > 0
        ? this.battleText.potionHeal(healed)
        : this.battleText.potionSteady,
    )
    this.refreshUi()
    this.resolveAfterPlayerAction()
  }

  private async runDamageAction(actionId: BattleActionId, amount: number) {
    const animationKind = actionId === 'magic' ? 'magic' : 'physical'
    await this.playAttackAnimation(this.playerSprite, this.enemySprite, animationKind)

    if (this.battleEnded) {
      return
    }

    const damage = this.applyDamage(this.enemy, amount)
    this.showDamageNumber(this.enemySprite, damage.toString(), '#fff1a8')
    this.pushLog(
      actionId === 'magic'
        ? this.battleText.magicDamage(damage)
        : this.battleText.attackDamage(damage),
    )
    this.refreshUi()
    this.resolveAfterPlayerAction()
  }

  private resolveAfterPlayerAction() {
    if (this.enemy.hp <= 0) {
      this.finishVictory()
      return
    }

    this.time.delayedCall(700, () => this.runEnemyTurn())
  }

  private async runEnemyTurn() {
    if (this.battleEnded) {
      return
    }

    await this.playAttackAnimation(this.enemySprite, this.playerSprite, 'physical')

    if (this.battleEnded) {
      return
    }

    const damage = this.applyDamage(this.player, this.enemy.attackDamage)
    this.showDamageNumber(this.playerSprite, damage.toString(), '#ffb4a8')
    playSfx(this, SFX_KEYS.damagePlayer, { volume: 0.42 })
    this.pushLog(this.battleText.enemyCounter(this.enemy.name, damage))
    this.refreshUi()

    if (this.player.hp <= 0) {
      this.finishDefeat()
      return
    }

    this.turnLocked = false
    this.refreshCommandMenu()
    playSfx(this, SFX_KEYS.battleTurn, { volume: 0.34 })
  }

  private finishVictory() {
    this.battleEnded = true
    markBattleDefeated(this.encounter.reward.defeatedBattleId)
    playSfx(this, SFX_KEYS.battleVictory, { volume: 0.5 })
    this.pushLog(this.encounter.victoryLog)
    this.refreshCommandMenu()
    this.time.delayedCall(1400, () => {
      if (this.encounter.reward.kind === 'final') {
        this.openFinalReward()
        return
      }

      this.openCrystalReward()
    })
  }

  private finishDefeat() {
    this.battleEnded = true
    playSfx(this, SFX_KEYS.battleDefeat, { volume: 0.5 })
    this.pushLog(this.battleText.playerDefeatLog)
    this.refreshCommandMenu()
    this.time.delayedCall(1400, () =>
      this.returnFromBattle({
        title: this.enemy.name,
        message: this.encounter.defeatMessage,
      }),
    )
  }

  private returnFromBattle(initialDialogue?: InteriorSceneDialogue) {
    this.cameras.main.fadeOut(140, 0, 0, 0)
    this.time.delayedCall(150, () => {
      if (this.isWorldReturnData(this.returnData)) {
        this.scene.start('world', {
          initialDialogue,
          spawn: this.returnData.spawn,
        })
        return
      }

      this.scene.start('interior', {
        ...this.returnData,
        initialDialogue,
      } satisfies InteriorSceneData)
    })
  }

  private openCrystalReward() {
    if (this.encounter.reward.kind !== 'crystal' || this.isWorldReturnData(this.returnData)) {
      return
    }

    this.cameras.main.fadeOut(140, 0, 0, 0)
    this.time.delayedCall(150, () => {
      this.scene.start('crystal-reward', {
        encounterId: this.encounter.id as CrystalBattleEncounterId,
        returnData: this.returnData,
      })
    })
  }

  private openFinalReward() {
    this.cameras.main.fadeOut(140, 0, 0, 0)
    this.time.delayedCall(150, () => {
      this.scene.start('final-prize', {
        returnData: this.isWorldReturnData(this.returnData)
          ? this.returnData
          : {
              returnScene: 'world',
              spawn: { x: 348, y: 384 },
            },
      })
    })
  }

  private isWorldReturnData(returnData: BattleReturnData): returnData is WorldBattleReturnData {
    return 'returnScene' in returnData && returnData.returnScene === 'world'
  }

  private applyDamage(target: FighterState, amount: number) {
    const previousHp = target.hp
    target.hp = Phaser.Math.Clamp(target.hp - amount, 0, target.maxHp)
    return previousHp - target.hp
  }

  private applyHealing(target: FighterState, amount: number) {
    const previousHp = target.hp
    target.hp = Phaser.Math.Clamp(target.hp + amount, 0, target.maxHp)
    return target.hp - previousHp
  }

  private playAttackAnimation(
    attacker: Phaser.GameObjects.Sprite | undefined,
    target: Phaser.GameObjects.Sprite | undefined,
    kind: 'magic' | 'physical',
  ) {
    return new Promise<void>((resolve) => {
      if (!attacker || !target) {
        resolve()
        return
      }

      if (kind === 'magic') {
        this.playMagicAnimation(attacker, target, resolve)
        return
      }

      this.playPhysicalAttackAnimation(attacker, target, resolve)
    })
  }

  private playPhysicalAttackAnimation(
    attacker: Phaser.GameObjects.Sprite,
    target: Phaser.GameObjects.Sprite,
    onComplete: () => void,
  ) {
    const startX = attacker.x
    const startY = attacker.y
    const lunge = new Phaser.Math.Vector2(target.x - startX, target.y - startY)
      .normalize()
      .scale(78)

    playSfx(this, SFX_KEYS.attackSwing, { volume: 0.38 })
    this.tweens.add({
      targets: attacker,
      duration: 120,
      ease: 'Quad.easeOut',
      x: startX + lunge.x,
      y: startY + lunge.y,
      onComplete: () => {
        playSfx(this, SFX_KEYS.attackHit, { volume: 0.44 })
        this.createImpactBurst(target.x, target.y - 40, 0xfff1a8)
        this.flashSprite(target, 0xffffff)
        this.tweens.add({
          targets: attacker,
          duration: 160,
          ease: 'Quad.easeIn',
          x: startX,
          y: startY,
          onComplete,
        })
      },
    })
  }

  private playMagicAnimation(
    attacker: Phaser.GameObjects.Sprite,
    target: Phaser.GameObjects.Sprite,
    onComplete: () => void,
  ) {
    const castVector = new Phaser.Math.Vector2(target.x - attacker.x, target.y - attacker.y)
      .normalize()
      .scale(64)
    const projectile = this.add
      .circle(attacker.x + castVector.x, attacker.y + castVector.y, 12, 0x9bd7ff, 0.95)
      .setDepth(35)
    const aura = this.add.circle(projectile.x, projectile.y, 24, 0x7eb6ff, 0.22).setDepth(34)

    playSfx(this, SFX_KEYS.magicCast, { volume: 0.42 })
    this.time.delayedCall(120, () => playSfx(this, SFX_KEYS.magicProjectile, { volume: 0.34 }))

    this.tweens.add({
      targets: [projectile, aura],
      duration: 260,
      ease: 'Sine.easeInOut',
      x: target.x,
      y: target.y - 54,
      onComplete: () => {
        projectile.destroy()
        aura.destroy()
        playSfx(this, SFX_KEYS.magicImpact, { volume: 0.44 })
        this.createImpactBurst(target.x, target.y - 50, 0x9bd7ff)
        this.flashSprite(target, 0x9bd7ff)
        onComplete()
      },
    })
  }

  private createImpactBurst(x: number, y: number, color: number) {
    const burst = this.add.star(x, y, 8, 10, 34, color, 0.9).setDepth(40)

    this.tweens.add({
      targets: burst,
      alpha: 0,
      duration: 220,
      ease: 'Quad.easeOut',
      scale: 1.5,
      onComplete: () => burst.destroy(),
    })
  }

  private flashSprite(sprite: Phaser.GameObjects.Sprite | undefined, color: number) {
    if (!sprite) {
      return
    }

    sprite.setTint(color)
    this.time.delayedCall(120, () => sprite.clearTint())
  }

  private showDamageNumber(
    target: Phaser.GameObjects.Sprite | undefined,
    text: string,
    color: string,
  ) {
    if (!target) {
      return
    }

    const damageText = this.add
      .text(target.x, target.y - 118, text, {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '26px',
        fontStyle: '700',
        color,
      })
      .setOrigin(0.5)
      .setDepth(60)
      .setStroke('#01040b', 4)

    this.tweens.add({
      targets: damageText,
      alpha: 0,
      duration: 620,
      ease: 'Quad.easeOut',
      y: damageText.y - 34,
      onComplete: () => damageText.destroy(),
    })
  }

  private refreshUi() {
    this.refreshStatus()
    this.refreshCommandMenu()
  }

  private refreshStatus() {
    this.playerHpText?.setText(`HP ${this.player.hp}/${this.player.maxHp}`)
    this.playerMpText?.setText(`MP ${this.player.mp}/${this.player.maxMp}`)
    this.enemyHpText?.setText(`HP ${this.enemy.hp}/${this.enemy.maxHp}`)
    this.enemyMpText?.setText(`MP ${this.enemy.mp}/${this.enemy.maxMp}`)
    this.playerHpFill?.setScale(this.player.hp / this.player.maxHp, 1)
    this.playerMpFill?.setScale(this.player.mp / this.player.maxMp, 1)
    this.enemyHpFill?.setScale(this.enemy.hp / this.enemy.maxHp, 1)
    this.enemyMpFill?.setScale(this.enemy.maxMp === 0 ? 0 : this.enemy.mp / this.enemy.maxMp, 1)
  }

  private refreshCommandMenu() {
    this.commandTexts.forEach((text, index) => {
      const action = getBattleAction(this.encounter.actions[index], this.language)
      const isSelected = index === this.selectedActionIndex
      const prefix = isSelected ? '> ' : '  '

      text.setText(prefix + action.label)
      text.setColor(this.canUseMenu() ? (isSelected ? '#fff1a8' : '#d7e0ff') : '#7080a8')
      text.setStroke('#01040b', isSelected ? 4 : 2)
    })
  }

  private pushLog(message: string) {
    this.combatLog.push(message)
    this.combatLog = this.combatLog.slice(-4)
    this.logText?.setText(this.combatLog.join('\n'))
  }

  private canUseMenu() {
    return !this.turnLocked && !this.battleEnded
  }

  private cleanupSceneControls() {
    clearVirtualControlInputs()
    setGameplayControlContext(null)
  }
}
