import type Phaser from 'phaser'
import { loadVisitorProfile, resetVisitorProfile, updateVisitorProfile } from '../store/sessionStore.ts'
import { clearVirtualControlInputs, getVirtualControlsSnapshot } from '../store/virtualControls.ts'
import { stopMusic } from './audio.ts'

const LABELS = {
  en: ['Paused', 'Continue', 'Restart'],
  es: ['Pausa', 'Continuar', 'Reiniciar'],
  'pt-BR': ['Pausado', 'Continuar', 'Reiniciar'],
} as const

export function installPauseMenu(game: Phaser.Game) {
  const dialog = document.createElement('dialog')
  dialog.className = 'pause-menu'
  dialog.setAttribute('aria-labelledby', 'pause-menu-title')
  dialog.innerHTML = `
    <h2 id="pause-menu-title"></h2>
    <form method="dialog">
      <button value="continue" autofocus></button>
      <button value="restart"></button>
    </form>
  `
  game.canvas.parentElement!.append(dialog)
  const title = dialog.querySelector('h2')!
  const buttons = [...dialog.querySelectorAll('button')]

  const resetInputs = () => {
    clearVirtualControlInputs()
    game.scene.getScenes(true).forEach(scene => {
      scene.input.keyboard?.resetKeys()
      scene.physics?.world.bodies.entries.forEach(body => body.setVelocity(0, 0))
    })
  }

  const open = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || event.repeat || dialog.open || !getVirtualControlsSnapshot().context) {
      return
    }
    event.preventDefault()
    event.stopImmediatePropagation()
    const [heading, continueLabel, restartLabel] = LABELS[loadVisitorProfile().language]
    title.textContent = heading
    buttons[0].textContent = continueLabel
    buttons[1].textContent = restartLabel
    dialog.returnValue = 'continue'
    resetInputs()
    game.pause()
    game.sound.pauseAll()
    dialog.showModal()
    buttons[0].focus()
  }

  dialog.addEventListener('keydown', event => {
    event.stopPropagation()
    if (event.key === 'Escape' && event.repeat) event.preventDefault()
    if (['arrowup', 'arrowdown', 'w', 's'].includes(event.key.toLowerCase())) {
      event.preventDefault()
      buttons[document.activeElement === buttons[0] ? 1 : 0].focus()
    }
  })
  dialog.addEventListener('keyup', event => event.stopPropagation())
  dialog.addEventListener('close', () => {
    resetInputs()
    if (dialog.returnValue === 'restart') {
      const { language } = loadVisitorProfile()
      resetVisitorProfile()
      updateVisitorProfile({ language })
      stopMusic()
      game.sound.stopAll()
      game.scene.getScenes(true).forEach(scene => game.scene.stop(scene.scene.key))
      game.scene.start('intro')
    } else {
      game.sound.resumeAll()
    }
    game.resume()
  })

  window.addEventListener('keydown', open, { capture: true })
  game.events.once('destroy', () => {
    window.removeEventListener('keydown', open, { capture: true })
    dialog.remove()
  })
}
