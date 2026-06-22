import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../core/config'
import { GAME_UI_FONT_FAMILY } from '../core/ui'
import { SCHEDULE_CALL_URL } from '../data/battles'
import { portfolioContact } from '../data/portfolioContent'
import {
  clearVirtualControlInputs,
  consumeQueuedVirtualControlAction,
  setGameplayControlContext,
} from '../store/virtualControls'
import { SFX_KEYS, playSfx, stopMusic } from '../systems/audio'
import type { WorldBattleReturnData } from './BattleScene'

type FinalPrizeSceneData = {
  returnData: WorldBattleReturnData
}

const PANEL_COLOR = 0x04070f
const PANEL_STROKE = 0xa4b6ff

export class FinalPrizeScene extends Phaser.Scene {
  private returnData!: WorldBattleReturnData
  private returning = false

  constructor() {
    super('final-prize')
  }

  init(data: FinalPrizeSceneData) {
    this.returnData = data.returnData
    this.returning = false
  }

  create() {
    this.cameras.main.setBackgroundColor('#030715')
    stopMusic()
    playSfx(this, SFX_KEYS.finalUnlock, { volume: 0.52 })
    this.createStarfield()
    this.createGuide()
    this.createPrizePanel()
    this.bindInput()
    setGameplayControlContext('reward')
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanupSceneControls, this)
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanupSceneControls, this)
  }

  update() {
    if (consumeQueuedVirtualControlAction('a')) {
      this.openScheduleLink()
    }

    if (consumeQueuedVirtualControlAction('b')) {
      this.returnToWorld()
    }
  }

  private createStarfield() {
    for (let index = 0; index < 120; index += 1) {
      const star = this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.FloatBetween(1, 3.2),
        0xe7f0ff,
        Phaser.Math.FloatBetween(0.28, 0.92),
      )

      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.14, 1),
        duration: Phaser.Math.Between(900, 2200),
        repeat: -1,
        yoyo: true,
      })
    }
  }

  private createGuide() {
    const outerGlow = this.add
      .ellipse(0, 0, 260, 360, 0x9bb1ff, 0.08)
      .setBlendMode(Phaser.BlendModes.ADD)
    const glow = this.add
      .ellipse(0, 0, 150, 250, 0xcdd8ff, 0.16)
      .setBlendMode(Phaser.BlendModes.ADD)
    const guide = this.add.image(0, -18, 'mystic-guide').setScale(6)
    const shadow = this.add.ellipse(0, 118, 92, 18, 0x01040b, 0.48)
    const guideContainer = this.add.container(GAME_WIDTH / 2, 214, [
      outerGlow,
      glow,
      shadow,
      guide,
    ])

    this.tweens.add({
      targets: guideContainer,
      y: guideContainer.y - 16,
      duration: 1400,
      ease: 'Sine.easeInOut',
      repeat: -1,
      yoyo: true,
    })
    this.tweens.add({
      targets: [outerGlow, glow],
      alpha: '+=0.1',
      duration: 900,
      repeat: -1,
      yoyo: true,
    })
  }

  private createPrizePanel() {
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 174, 1060, 312, PANEL_COLOR, 0.92)
      .setStrokeStyle(3, PANEL_STROKE, 0.6)

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 310, 'Mysterious Guide', {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '24px',
        fontStyle: '700',
        color: '#d7e0ff',
      })
      .setOrigin(0.5)
      .setStroke('#01040b', 3)

    this.add.text(
      164,
      GAME_HEIGHT - 270,
      'You gathered every crystal and passed the final trial. The final prize is a direct path to Felipe Kummer.',
      {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '22px',
        fontStyle: '700',
        color: '#f6f8ff',
        lineSpacing: 10,
        wordWrap: { width: 952 },
      },
    )

    this.createContactLink(GAME_HEIGHT - 200, 'Email', portfolioContact.email, `mailto:${portfolioContact.email}`)
    this.createContactLink(
      GAME_HEIGHT - 168,
      'LinkedIn',
      portfolioContact.linkedIn,
      portfolioContact.linkedInUrl,
    )
    this.createContactLink(
      GAME_HEIGHT - 136,
      'GitHub',
      portfolioContact.github,
      portfolioContact.githubUrl,
    )
    this.createContactLink(GAME_HEIGHT - 104, 'CV', 'Download PDF', portfolioContact.cvPath)

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 70, 'Schedule a 15 minute call', {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '24px',
        fontStyle: '700',
        color: '#fff1a8',
      })
      .setOrigin(0.5)
      .setStroke('#01040b', 4)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.openScheduleLink())

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 42, SCHEDULE_CALL_URL, {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '15px',
        fontStyle: '700',
        color: '#b7c4ff',
      })
      .setOrigin(0.5)
      .setStroke('#01040b', 2)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.openScheduleLink())

    this.add
      .text(GAME_WIDTH - 92, GAME_HEIGHT - 26, 'enter opens calendar   esc returns', {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '14px',
        fontStyle: '700',
        color: '#d7e0ff',
      })
      .setOrigin(1, 0.5)
      .setStroke('#01040b', 2)
  }

  private createContactLink(y: number, label: string, value: string, url: string) {
    this.add
      .text(164, y, `${label}:`, {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '19px',
        fontStyle: '700',
        color: '#d7e0ff',
      })
      .setStroke('#01040b', 2)

    this.add
      .text(292, y, value, {
        fontFamily: GAME_UI_FONT_FAMILY,
        fontSize: '19px',
        fontStyle: '700',
        color: '#fff1a8',
      })
      .setStroke('#01040b', 2)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.openContactLink(url))
  }

  private bindInput() {
    this.input.keyboard?.on('keydown-ENTER', () => this.openScheduleLink())
    this.input.keyboard?.on('keydown-SPACE', () => this.openScheduleLink())
    this.input.keyboard?.on('keydown-E', () => this.openScheduleLink())
    this.input.keyboard?.on('keydown-ESC', () => this.returnToWorld())
  }

  private openScheduleLink() {
    playSfx(this, SFX_KEYS.uiConfirm)
    window.open(SCHEDULE_CALL_URL, '_blank', 'noopener,noreferrer')
  }

  private openContactLink(url: string) {
    playSfx(this, SFX_KEYS.uiConfirm)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  private returnToWorld() {
    if (this.returning) {
      return
    }

    this.returning = true
    playSfx(this, SFX_KEYS.uiCancel, { volume: 0.32 })
    this.cameras.main.fadeOut(140, 0, 0, 0)
    this.time.delayedCall(150, () => {
      this.scene.start('world', {
        spawn: this.returnData.spawn,
      })
    })
  }

  private cleanupSceneControls() {
    clearVirtualControlInputs()
    setGameplayControlContext(null)
  }
}
