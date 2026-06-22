import Phaser from 'phaser'
import { SFX_KEYS, playSfx } from './audio'

type TypewriteTextOptions = {
  shouldContinue?: () => boolean
}

export function formatDialogueText(message: string) {
  return message
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
}

export function paginateDialogueText(message: string, maxCharacters = 190) {
  const normalizedBlocks = message
    .split(/\n\s*\n/)
    .map((block) => formatDialogueText(block))
    .filter(Boolean)

  const pages = normalizedBlocks.flatMap((block) => splitDialogueBlock(block, maxCharacters))

  return pages.length > 0 ? pages : ['']
}

function splitDialogueBlock(block: string, maxCharacters: number) {
  if (block.length <= maxCharacters) {
    return [block]
  }

  const sentences = block.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) ?? [block]
  const pages: string[] = []
  let currentPage = ''

  sentences.forEach((sentence) => {
    const normalizedSentence = sentence.replace(/\s+/g, ' ').trim()

    if (!normalizedSentence) {
      return
    }

    const nextPage = currentPage ? `${currentPage} ${normalizedSentence}` : normalizedSentence

    if (nextPage.length <= maxCharacters || !currentPage) {
      currentPage = nextPage
      return
    }

    pages.push(currentPage)
    currentPage = normalizedSentence
  })

  if (currentPage) {
    pages.push(currentPage)
  }

  return pages
}

export function typewriteText(
  scene: Phaser.Scene,
  textNode: Phaser.GameObjects.Text,
  text: string,
  speed = 28,
  options: TypewriteTextOptions = {},
) {
  return new Promise<void>((resolve) => {
    let index = 0
    let resolved = false

    const finish = () => {
      if (resolved) {
        return
      }

      resolved = true
      resolve()
    }

    textNode.setText('')

    const timer = scene.time.addEvent({
      delay: speed,
      repeat: Math.max(text.length - 1, 0),
      callback: () => {
        if (options.shouldContinue && !options.shouldContinue()) {
          timer.remove(false)
          finish()
          return
        }

        index += 1
        textNode.setText(text.slice(0, index))

        const currentCharacter = text[index - 1]
        if (currentCharacter?.trim() && index % 2 === 0) {
          playSfx(scene, SFX_KEYS.textBlip, { volume: 0.18 })
        }

        if (index >= text.length) {
          finish()
        }
      },
    })

    if (text.length === 0) {
      timer.remove(false)
      finish()
    }
  })
}

export function waitForConfirm(scene: Phaser.Scene) {
  return new Promise<void>((resolve) => {
    let resolved = false

    const finish = () => {
      if (resolved) {
        return
      }

      resolved = true
      playSfx(scene, SFX_KEYS.textAdvance, { volume: 0.28 })
      cleanup()
      resolve()
    }

    const cleanup = () => {
      scene.input.keyboard?.off('keydown-ENTER', finish)
      scene.input.keyboard?.off('keydown-SPACE', finish)
      scene.input.off('pointerdown', finish)
    }

    scene.input.keyboard?.once('keydown-ENTER', finish)
    scene.input.keyboard?.once('keydown-SPACE', finish)
    scene.input.once('pointerdown', finish)
  })
}
