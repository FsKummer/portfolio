import Phaser from 'phaser'
import { introDialogue } from '../data/dialogue'
import { GAME_HEIGHT, GAME_WIDTH } from '../core/config'
import { typewriteText, waitForConfirm } from '../systems/dialogue'
import { loadVisitorProfile, updateVisitorProfile } from '../store/sessionStore'

export class IntroScene extends Phaser.Scene {
  private dialogueText?: Phaser.GameObjects.Text

  private promptText?: Phaser.GameObjects.Text

  private nameForm?: Phaser.GameObjects.DOMElement

  constructor() {
    super('intro')
  }

  create() {
    this.cameras.main.setBackgroundColor('#02040d')
    this.createStarfield()
    this.createDialogueFrame()
    void this.runIntroFlow()
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
