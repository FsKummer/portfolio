import Phaser from 'phaser'
import { introDialogue } from '../data/dialogue'
import { GAME_HEIGHT, GAME_WIDTH } from '../core/config'
import { typewriteText, waitForConfirm } from '../systems/dialogue'
import {
  type VisitorProfile,
  loadVisitorProfile,
  resetVisitorProfile,
  updateVisitorProfile,
} from '../store/sessionStore'

type StartMenuOption = 'continue' | 'new-game'

type StartMenuButton = {
  container: Phaser.GameObjects.Container
  label: Phaser.GameObjects.Text
  option: StartMenuOption
}

export class IntroScene extends Phaser.Scene {
  private dialogueText?: Phaser.GameObjects.Text

  private promptText?: Phaser.GameObjects.Text

  private nameForm?: Phaser.GameObjects.DOMElement

  private startMenu?: Phaser.GameObjects.Container

  private startMenuButtons: StartMenuButton[] = []

  private selectedStartMenuIndex = 0

  private startMenuActive = false

  constructor() {
    super('intro')
  }

  create() {
    const profile = loadVisitorProfile()

    this.cameras.main.setBackgroundColor('#02040d')
    this.createStarfield()

    if (this.canContinueProfile(profile)) {
      this.createStartMenu(profile)
      return
    }

    this.startNewIntroFlow()
  }

  private async runIntroFlow() {
    if (!this.dialogueText || !this.promptText) {
      return
    }

    for (const line of introDialogue) {
      this.promptText.setText('')
      await typewriteText(this, this.dialogueText, line)
      this.promptText.setText('press enter to continue')
      await waitForConfirm(this)
    }

    const profile = loadVisitorProfile()
    const visitorName = await this.captureName(profile.visitorName)

    updateVisitorProfile({ visitorName })
    this.scene.start('character-select')
  }

  private startNewIntroFlow() {
    this.createDialogueFrame()
    void this.runIntroFlow()
  }

  private canContinueProfile(profile: VisitorProfile) {
    return Boolean(profile.visitorName.trim() && profile.avatar)
  }

  private createStartMenu(profile: VisitorProfile) {
    this.startMenuActive = true
    this.selectedStartMenuIndex = 0

    const title = this.add
      .text(GAME_WIDTH / 2, 124, 'Felipe Kummer', {
        fontFamily: 'monospace',
        fontSize: '46px',
        color: '#f4f7ff',
      })
      .setOrigin(0.5)
    title.setStroke('#02040d', 4)

    const subtitle = this.add
      .text(GAME_WIDTH / 2, 176, 'adventure portfolio', {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#9bb1ff',
      })
      .setOrigin(0.5)
    subtitle.setStroke('#02040d', 3)

    const panel = this.add
      .rectangle(0, 0, 560, 244, 0x050913, 0.9)
      .setStrokeStyle(2, 0x90a3ff, 0.5)
    const welcome = this.add
      .text(0, -82, 'welcome back, ' + profile.visitorName, {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#edf2ff',
      })
      .setOrigin(0.5)

    this.startMenuButtons = [
      this.createStartMenuButton(0, -18, 'continue', 'Continue'),
      this.createStartMenuButton(0, 54, 'new-game', 'New Game'),
    ]

    const menuPanel = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, [
      panel,
      welcome,
      ...this.startMenuButtons.map((button) => button.container),
    ])
    this.startMenu = this.add.container(0, 0, [title, subtitle, menuPanel])

    this.addStartMenuInput()
    this.applyStartMenuSelection()
  }

  private createStartMenuButton(
    x: number,
    y: number,
    option: StartMenuOption,
    labelText: string,
  ): StartMenuButton {
    const frame = this.add.rectangle(0, 0, 360, 54, 0x0f1730, 0.94)
    const label = this.add
      .text(0, 0, labelText, {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#edf2ff',
      })
      .setOrigin(0.5)
    const container = this.add.container(x, y, [frame, label])

    container.setSize(360, 54)
    container.setInteractive(
      new Phaser.Geom.Rectangle(-180, -27, 360, 54),
      Phaser.Geom.Rectangle.Contains,
    )
    container.on('pointerover', () => {
      if (!this.startMenuActive) {
        return
      }

      this.selectedStartMenuIndex = this.startMenuButtons.findIndex(
        (button) => button.option === option,
      )
      this.applyStartMenuSelection()
    })
    container.on('pointerdown', () => this.chooseStartMenuOption(option))

    return {
      container,
      label,
      option,
    }
  }

  private addStartMenuInput() {
    this.input.keyboard?.on('keydown', this.handleStartMenuKeyDown, this)
  }

  private removeStartMenuInput() {
    this.input.keyboard?.off('keydown', this.handleStartMenuKeyDown, this)
  }

  private handleStartMenuKeyDown(event: KeyboardEvent) {
    if (!this.startMenuActive) {
      return
    }

    const key = event.key.toLowerCase()

    if (key === 'arrowup' || key === 'w') {
      event.preventDefault()
      this.changeStartMenuSelection(-1)
      return
    }

    if (key === 'arrowdown' || key === 's') {
      event.preventDefault()
      this.changeStartMenuSelection(1)
      return
    }

    if (key === 'enter' || key === ' ') {
      event.preventDefault()
      this.confirmStartMenuSelection()
    }
  }

  private changeStartMenuSelection(direction: -1 | 1) {
    if (!this.startMenuActive) {
      return
    }

    this.selectedStartMenuIndex = Phaser.Math.Wrap(
      this.selectedStartMenuIndex + direction,
      0,
      this.startMenuButtons.length,
    )
    this.applyStartMenuSelection()
  }

  private confirmStartMenuSelection() {
    if (!this.startMenuActive) {
      return
    }

    const option = this.startMenuButtons[this.selectedStartMenuIndex]?.option

    if (!option) {
      return
    }

    this.chooseStartMenuOption(option)
  }

  private chooseStartMenuOption(option: StartMenuOption) {
    if (!this.startMenuActive) {
      return
    }

    this.startMenuActive = false
    this.removeStartMenuInput()

    if (option === 'continue') {
      this.scene.start('world')
      return
    }

    resetVisitorProfile()
    this.startMenu?.destroy()
    this.startMenu = undefined
    this.startMenuButtons = []
    this.startNewIntroFlow()
  }

  private applyStartMenuSelection() {
    this.startMenuButtons.forEach((button, index) => {
      const selected = index === this.selectedStartMenuIndex
      const frame = button.container.list[0] as Phaser.GameObjects.Rectangle

      frame.setStrokeStyle(selected ? 3 : 1, selected ? 0xf6f8ff : 0x90a3ff, selected ? 0.9 : 0.45)
      frame.setFillStyle(selected ? 0x172141 : 0x0f1730, 0.94)
      button.label.setColor(selected ? '#f6f8ff' : '#9bb1ff')
      button.container.setScale(selected ? 1.04 : 1)
    })
  }

  private createDialogueFrame() {
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 132, 1100, 196, 0x050913, 0.92)
      .setStrokeStyle(2, 0x90a3ff, 0.35)

    this.dialogueText = this.add.text(128, GAME_HEIGHT - 194, '', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#edf2ff',
      wordWrap: { width: 1024 },
      lineSpacing: 10,
    })

    this.promptText = this.add
      .text(GAME_WIDTH - 128, GAME_HEIGHT - 84, '', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#9bb1ff',
      })
      .setOrigin(1, 0.5)
  }

  private captureName(defaultName: string) {
    return new Promise<string>((resolve) => {
      this.promptText?.setText('type your name and press enter')

      this.nameForm = this.add.dom(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 24).createFromHTML(`
        <div style="display:flex;flex-direction:column;gap:12px;align-items:center;min-width:420px;">
          <input
            id="traveler-name"
            maxlength="14"
            style="width:100%;padding:16px 18px;border:1px solid rgba(144,163,255,0.5);background:rgba(7,11,24,0.92);color:#edf2ff;font-family:monospace;font-size:22px;outline:none;text-align:center;"
            placeholder="Traveler name"
          />
          <div style="font-family:monospace;font-size:16px;color:#b6c3ff;">letters, spaces, apostrophes, hyphens</div>
        </div>
      `)

      const input = this.nameForm.getChildByID('traveler-name') as HTMLInputElement | null

      if (!input) {
        resolve('traveler')
        return
      }

      input.value = defaultName

      this.time.delayedCall(30, () => {
        input.focus()
        input.select()
      })

      input.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') {
          return
        }

        event.preventDefault()
        const sanitizedName = input.value
          .replace(/[^A-Za-zÀ-ÿ' -]/g, '')
          .trim()
          .replace(/\s+/g, ' ')

        if (!sanitizedName) {
          return
        }

        this.nameForm?.destroy()
        this.nameForm = undefined
        resolve(sanitizedName.slice(0, 14))
      })
    })
  }

  private createStarfield() {
    for (let index = 0; index < 160; index += 1) {
      const x = Phaser.Math.Between(0, GAME_WIDTH)
      const y = Phaser.Math.Between(0, GAME_HEIGHT)
      const star = this.add.image(x, y, 'star')
      const scale = Phaser.Math.FloatBetween(0.16, 0.82)

      star.setScale(scale)
      star.setAlpha(Phaser.Math.FloatBetween(0.28, 0.95))

      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.15, 1),
        duration: Phaser.Math.Between(900, 2400),
        yoyo: true,
        repeat: -1,
      })
    }
  }
}
