import Phaser from 'phaser'
import {
  characterSelectConfirm,
  characterSelectPrompt,
} from '../data/dialogue'
import { GAME_HEIGHT, GAME_WIDTH } from '../core/config'
import { typewriteText, waitForConfirm } from '../systems/dialogue'
import {
  type AvatarChoice,
  loadVisitorProfile,
  updateVisitorProfile,
} from '../store/sessionStore'

type CardKey = AvatarChoice

type CharacterCard = {
  accent: string
  baseY: number
  container: Phaser.GameObjects.Container
  key: CardKey
}

export class CharacterSelectScene extends Phaser.Scene {
  private dialogueText?: Phaser.GameObjects.Text

  private promptText?: Phaser.GameObjects.Text

  private cards: CharacterCard[] = []

  private selectedIndex = 0

  private selectionLocked = false

  constructor() {
    super('character-select')
  }

  create() {
    const profile = loadVisitorProfile()

    this.selectedIndex = profile.avatar === 'girl' ? 1 : 0
    this.cameras.main.setBackgroundColor('#070b18')
    this.createBackdrop()
    this.createDialogueFrame()
    this.createCards()
    this.bindInput()
    void this.runSelectionFlow(profile.visitorName || 'traveler')
  }

  private async runSelectionFlow(visitorName: string) {
    if (!this.dialogueText || !this.promptText) {
      return
    }

    for (const line of characterSelectPrompt(visitorName)) {
      this.promptText.setText('')
      await typewriteText(this, this.dialogueText, line)
      this.promptText.setText('choose with arrows or click a card')
      await this.waitForSelection()
    }

    const selectedAvatar = this.cards[this.selectedIndex]?.key ?? 'boy'
    updateVisitorProfile({ avatar: selectedAvatar })
    this.selectionLocked = true

    this.promptText.setText('')
    await typewriteText(this, this.dialogueText, characterSelectConfirm(visitorName))
    this.promptText.setText('press enter to start')
    await waitForConfirm(this)

    this.scene.start('world')
  }

  private createBackdrop() {
    this.add
      .text(GAME_WIDTH / 2, 92, 'choose your traveler', {
        fontFamily: 'monospace',
        fontSize: '32px',
        color: '#f4f7ff',
      })
      .setOrigin(0.5)
  }

  private createDialogueFrame() {
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 112, 1100, 156, 0x050913, 0.9)
      .setStrokeStyle(2, 0x90a3ff, 0.35)

    this.dialogueText = this.add.text(128, GAME_HEIGHT - 152, '', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#edf2ff',
      wordWrap: { width: 980 },
      lineSpacing: 8,
    })

    this.promptText = this.add
      .text(GAME_WIDTH - 128, GAME_HEIGHT - 72, '', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#9bb1ff',
      })
      .setOrigin(1, 0.5)
  }

  private createCards() {
    const leftCardY = GAME_HEIGHT / 2 - 24
    const rightCardY = GAME_HEIGHT / 2 - 24

    this.cards = [
      this.buildCard(GAME_WIDTH / 2 - 190, leftCardY, 'boy', '#7bdff6', 'adam'),
      this.buildCard(GAME_WIDTH / 2 + 190, rightCardY, 'girl', '#f7a1ff', 'amelia'),
    ]

    this.applySelectionState()
  }

  private buildCard(
    x: number,
    y: number,
    key: CardKey,
    accent: string,
    spritePrefix: 'adam' | 'amelia',
  ): CharacterCard {
    const frame = this.add.rectangle(0, 0, 230, 286, 0x0f1730, 0.94)
    const portrait = this.add.sprite(0, -18, `${spritePrefix}-idle`, 18).setScale(4)
    portrait.play(`${spritePrefix}-idle-down`)
    const label = this.add
      .text(0, 96, key, {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: accent,
      })
      .setOrigin(0.5)

    const container = this.add.container(x, y, [frame, portrait, label])
    container.setSize(230, 286)
    container.setInteractive(
      new Phaser.Geom.Rectangle(-115, -143, 230, 286),
      Phaser.Geom.Rectangle.Contains,
    )

    container.on('pointerover', () => {
      if (this.selectionLocked) {
        return
      }

      this.selectedIndex = this.cards.findIndex((card) => card.key === key)
      this.applySelectionState()
    })

    container.on('pointerdown', () => {
      if (this.selectionLocked) {
        return
      }

      this.selectedIndex = this.cards.findIndex((card) => card.key === key)
      this.applySelectionState()
      this.selectionLocked = true
    })

    return {
      key,
      accent,
      baseY: y,
      container,
    }
  }

  private bindInput() {
    this.input.keyboard?.on('keydown-LEFT', () => this.changeSelection(-1))
    this.input.keyboard?.on('keydown-RIGHT', () => this.changeSelection(1))
    this.input.keyboard?.on('keydown-A', () => this.changeSelection(-1))
    this.input.keyboard?.on('keydown-D', () => this.changeSelection(1))
    this.input.keyboard?.on('keydown-ENTER', () => this.confirmSelection())
    this.input.keyboard?.on('keydown-SPACE', () => this.confirmSelection())
  }

  private changeSelection(direction: -1 | 1) {
    if (this.selectionLocked) {
      return
    }

    this.selectedIndex = Phaser.Math.Wrap(
      this.selectedIndex + direction,
      0,
      this.cards.length,
    )
    this.applySelectionState()
  }

  private confirmSelection() {
    if (this.selectionLocked) {
      return
    }

    this.selectionLocked = true
  }

  private waitForSelection() {
    return new Promise<void>((resolve) => {
      const poll = () => {
        if (this.selectionLocked) {
          resolve()
          return
        }

        this.time.delayedCall(16, poll)
      }

      poll()
    })
  }

  private applySelectionState() {
    this.cards.forEach((card, index) => {
      const isSelected = index === this.selectedIndex
      const borderColor = Phaser.Display.Color.HexStringToColor(card.accent).color
      const frame = card.container.list[0] as Phaser.GameObjects.Rectangle

      frame.setStrokeStyle(isSelected ? 4 : 2, borderColor, isSelected ? 1 : 0.5)
      card.container.setScale(isSelected ? 1.03 : 1)
      card.container.setY(card.baseY + (isSelected ? -4 : 0))
    })
  }
}
