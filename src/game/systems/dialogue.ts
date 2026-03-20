import Phaser from 'phaser'

export function typewriteText(
  scene: Phaser.Scene,
  textNode: Phaser.GameObjects.Text,
  text: string,
  speed = 28,
) {
  return new Promise<void>((resolve) => {
    let index = 0

    textNode.setText('')

    const timer = scene.time.addEvent({
      delay: speed,
      repeat: Math.max(text.length - 1, 0),
      callback: () => {
        index += 1
        textNode.setText(text.slice(0, index))

        if (index >= text.length) {
          resolve()
        }
      },
    })

    if (text.length === 0) {
      timer.remove(false)
      resolve()
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
