import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../core/config'
import { GAME_UI_FONT_FAMILY } from '../core/ui'
import {
  BATTLE_ENCOUNTERS,
  CRYSTAL_BATTLE_ENCOUNTER_IDS,
  type BattleEncounter,
  type CrystalBattleEncounterId,
  type CrystalBattleReward,
} from '../data/battles'
import { collectCrystal, hasCrystal, loadVisitorProfile } from '../store/sessionStore'
import {
  clearVirtualControlInputs,
  consumeQueuedVirtualControlAction,
  setGameplayControlContext,
} from '../store/virtualControls'
import { SFX_KEYS, playSfx, stopMusic } from '../systems/audio'
import type { InteriorSceneData } from './InteriorScene'

type CrystalRewardSceneData = {
  encounterId: CrystalBattleEncounterId
  returnData: InteriorSceneData
}

const PANEL_COLOR = 0x04070f
const PANEL_STROKE = 0xa4b6ff

export class CrystalRewardScene extends Phaser.Scene {
  private encounter!: BattleEncounter
  private returnData!: InteriorSceneData
  private returning = false

  constructor() {
    super('crystal-reward')
  }

  init(data: CrystalRewardSceneData) {
    this.encounter = BATTLE_ENCOUNTERS[data.encounterId]
    this.returnData = data.returnData
    this.returning = false
  }

  create() {
    const reward = this.getCrystalReward()
    const crystal = reward.crystal
    const alreadyHadCrystal = hasCrystal(crystal.id)

    collectCrystal(crystal.id)
    const collectedCrystalCount = this.getCollectedBattleCrystalCount()
    const totalCrystalCount = this.getTotalBattleCrystalCount()
    this.cameras.main.setBackgroundColor('#030715')
    stopMusic()
    playSfx(this, SFX_KEYS.crystalReward, { volume: 0.52 })
    this.createStarfield()
    this.createCrystal(crystal.name, crystal.colors, alreadyHadCrystal)
    this.createDialogue(crystal.name, alreadyHadCrystal, collectedCrystalCount, totalCrystalCount)
    this.bindInput()
    setGameplayControlContext('reward')
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanupSceneControls, this)
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanupSceneControls, this)
  }

  update() {
    if (consumeQueuedVirtualControlAction('a') || consumeQueuedVirtualControlAction('b')) {
      this.returnToInterior()
    }
  }

  private createStarfield() {
    for (let index = 0; index < 90; index += 1) {
      const star = this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.FloatBetween(1, 3),
        0xe7f0ff,
        Phaser.Math.FloatBetween(0.28, 0.9),
      )

      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.12, 1),
        duration: Phaser.Math.Between(900, 2200),
        repeat: -1,
        yoyo: true,
      })
    }
  }

  private createCrystal(
    crystalName: string,
    colors: CrystalBattleReward['crystal']['colors'],
    alreadyHadCrystal: boolean,
  ) {
    const glow = this.add.circle(0, 0, 118, colors.glow, 0.18)
    const outerGlow = this.add.circle(0, 0, 180, colors.detail, 0.08)
    const crystalBody = this.add.graphics()

    crystalBody.fillStyle(colors.body, 1)
    crystalBody.beginPath()
    crystalBody.moveTo(0, -96)
    crystalBody.lineTo(70, -22)
    crystalBody.lineTo(42, 82)
    crystalBody.lineTo(0, 118)
    crystalBody.lineTo(-42, 82)
    crystalBody.lineTo(-70, -22)
    crystalBody.closePath()
    crystalBody.fillPath()
    crystalBody.lineStyle(5, colors.edge, 0.85)
    crystalBody.strokePath()

    crystalBody.lineStyle(3, colors.detail, 0.65)
    crystalBody.beginPath()
    crystalBody.moveTo(0, -96)
    crystalBody.lineTo(0, 118)
    crystalBody.moveTo(-70, -22)
    crystalBody.lineTo(0, 18)
    crystalBody.lineTo(70, -22)
    crystalBody.moveTo(-42, 82)
    crystalBody.lineTo(0, 18)
    crystalBody.lineTo(42, 82)
    crystalBody.strokePath()

    const shine = this.add.circle(-26, -34, 16, 0xffffff, 0.86)
    const crystalContainer = this.add.container(GAME_WIDTH / 2, 220, [
      outerGlow,
      glow,
      crystalBody,
      shine,
    ])
    crystalContainer.setScale(0.86)

    this.add
      .text(
        GAME_WIDTH / 2,
        388,
        alreadyHadCrystal
          ? `The ${crystalName} shines again`
          : `You received the ${crystalName}`,
        {
          fontFamily: GAME_UI_FONT_FAMILY,
          fontSize: '30px',
          fontStyle: '700',
          color: '#f6f8ff',
        },
      )
      .setOrigin(0.5)
      .setStroke('#01040b', 4)

    this.tweens.add({
      targets: crystalContainer,
      duration: 1500,
      ease: 'Sine.easeInOut',
      repeat: -1,
      yoyo: true,
      y: crystalContainer.y - 18,
    })
    this.tweens.add({
      targets: [glow, outerGlow],
      alpha: '+=0.12',
      duration: 900,
      repeat: -1,
      yoyo: true,
    })
    this.tweens.add({
      targets: shine,
      alpha: 0.28,
      duration: 640,
      repeat: -1,
      yoyo: true,
    })
  }

  private createDialogue(
    crystalName: string,
    alreadyHadCrystal: boolean,
    collectedCrystalCount: number,
    totalCrystalCount: number,
  ) {
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 126, 1060, 184, PANEL_COLOR, 0.9)
      .setStrokeStyle(3, PANEL_STROKE, 0.55)

    this.add.text(172, GAME_HEIGHT - 188, this.encounter.enemy.name, {
      fontFamily: GAME_UI_FONT_FAMILY,
      fontSize: '22px',
      fontStyle: '700',
      color: '#d7e0ff',
    })

    const crystalLine = alreadyHadCrystal
      ? `The ${crystalName} answers your call again.`
      : `Take this ${crystalName}.`
    const progressLine =
      collectedCrystalCount >= totalCrystalCount
        ? `All ${totalCrystalCount} crystals are ready to unlock a surprise.`
        : `Collect all ${totalCrystalCount} crystals to unlock a surprise.`

    this.add.text(
      172,
      GAME_HEIGHT - 146,
      `${crystalLine} ${progressLine}`,
      {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '24px',
        fontStyle: '700',
        color: '#f6f8ff',
        lineSpacing: 10,
        wordWrap: { width: 936 },
      },
    )

    this.add
      .text(GAME_WIDTH - 172, GAME_HEIGHT - 66, 'enter / space continues', {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '16px',
        fontStyle: '700',
        color: '#d7e0ff',
      })
      .setOrigin(1, 0.5)
  }

  private bindInput() {
    this.input.keyboard?.on('keydown-ENTER', () => this.returnToInterior())
    this.input.keyboard?.on('keydown-SPACE', () => this.returnToInterior())
    this.input.keyboard?.on('keydown-E', () => this.returnToInterior())
    this.input.once('pointerdown', () => this.returnToInterior())
  }

  private getCollectedBattleCrystalCount() {
    const battleCrystalIds = new Set(
      CRYSTAL_BATTLE_ENCOUNTER_IDS.map((encounterId) => {
        const reward = BATTLE_ENCOUNTERS[encounterId].reward

        return reward.kind === 'crystal' ? reward.crystal.id : ''
      }),
    )

    return loadVisitorProfile().progress.crystalIds.filter((crystalId) =>
      battleCrystalIds.has(crystalId),
    ).length
  }

  private getTotalBattleCrystalCount() {
    return new Set(
      CRYSTAL_BATTLE_ENCOUNTER_IDS.map((encounterId) => {
        const reward = BATTLE_ENCOUNTERS[encounterId].reward

        return reward.kind === 'crystal' ? reward.crystal.id : ''
      }),
    ).size
  }

  private getCrystalReward() {
    if (this.encounter.reward.kind !== 'crystal') {
      throw new Error('CrystalRewardScene requires a crystal battle encounter.')
    }

    return this.encounter.reward
  }

  private returnToInterior() {
    if (this.returning) {
      return
    }

    this.returning = true
    playSfx(this, SFX_KEYS.uiConfirm)
    this.cameras.main.fadeOut(140, 0, 0, 0)
    this.time.delayedCall(150, () => {
      this.scene.start('interior', this.returnData)
    })
  }

  private cleanupSceneControls() {
    clearVirtualControlInputs()
    setGameplayControlContext(null)
  }
}
