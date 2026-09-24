import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { test } from 'node:test'
import { installPauseMenu } from '../src/game/systems/pause.ts'
import { loadVisitorProfile, updateVisitorProfile } from '../src/game/store/sessionStore.ts'
import { getVirtualControlsSnapshot, pressHeldVirtualControl, setGameplayControlContext } from '../src/game/store/virtualControls.ts'

test('pause resumes the same run, restart clears progress, and teardown removes the menu', t => {
  const previousWindow = globalThis.window
  const previousDocument = globalThis.document
  const stored = new Map()
  const calls = []
  const velocity = { x: 180, y: 0 }
  const title = {}
  const buttons = [0, 1].map(() => ({ focus() { document.activeElement = this } }))
  const dialog = Object.assign(new EventTarget(), {
    open: false,
    setAttribute() {},
    querySelector: () => title,
    querySelectorAll: () => buttons,
    showModal() { this.open = true },
    remove() { calls.push('remove') },
  })
  globalThis.window = Object.assign(new EventTarget(), {
    localStorage: { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) },
  })
  globalThis.document = { createElement: () => dialog, activeElement: null }
  t.after(() => {
    globalThis.window = previousWindow
    globalThis.document = previousDocument
    setGameplayControlContext(null)
  })
  const game = {
    canvas: { parentElement: { append() {} } },
    events: new EventEmitter(),
    pause: () => calls.push('pause'),
    resume: () => calls.push('resume'),
    sound: {
      pauseAll: () => calls.push('pause-sound'),
      resumeAll: () => calls.push('resume-sound'),
      stopAll: () => calls.push('stop-sound'),
    },
    scene: {
      getScenes: () => [{
        scene: { key: 'world' },
        input: { keyboard: { resetKeys: () => calls.push('reset-keys') } },
        physics: { world: { bodies: { entries: [{ setVelocity(x, y) { Object.assign(velocity, { x, y }) } }] } } },
      }],
      stop: key => calls.push(`stop-${key}`),
      start: key => calls.push(`start-${key}`),
    },
  }
  const keydown = (target, key, repeat = false) => {
    const event = Object.assign(new Event('keydown', { cancelable: true }), { key, repeat })
    target.dispatchEvent(event)
    return event
  }
  const close = value => {
    dialog.returnValue = value
    dialog.open = false
    dialog.dispatchEvent(new Event('close'))
  }
  installPauseMenu(game)
  keydown(window, 'Escape')
  assert.deepEqual(calls, [], 'intro does not open the gameplay pause menu')
  setGameplayControlContext('world')
  const profile = updateVisitorProfile({ visitorName: 'Traveler', avatar: 'girl', language: 'pt-BR' })
  updateVisitorProfile({ progress: { ...profile.progress, crystalIds: ['test-crystal'], guideIntroSeen: true } })
  const before = loadVisitorProfile()
  pressHeldVirtualControl('right')
  assert.equal(keydown(window, 'Escape').defaultPrevented, true)
  assert.equal(dialog.open, true)
  assert.equal(title.textContent, 'Pausado')
  assert.deepEqual(buttons.map(button => button.textContent), ['Continuar', 'Reiniciar'])
  assert.equal(document.activeElement, buttons[0])
  assert.equal(getVirtualControlsSnapshot().held.right, false)
  assert.deepEqual(velocity, { x: 0, y: 0 }, 'the first resumed physics step must not move the player')
  assert.deepEqual(calls, ['reset-keys', 'pause', 'pause-sound'])
  keydown(window, 'Escape', true)
  assert.equal(calls.length, 3, 'a held Escape key cannot repeatedly pause')
  keydown(dialog, 'ArrowDown')
  assert.equal(document.activeElement, buttons[1])
  keydown(dialog, 'w')
  assert.equal(document.activeElement, buttons[0])
  close('continue')
  assert.deepEqual(loadVisitorProfile(), before)
  assert.deepEqual(calls.slice(-3), ['reset-keys', 'resume-sound', 'resume'])
  keydown(window, 'Escape')
  close('restart')
  assert.deepEqual(loadVisitorProfile(), {
    visitorName: '', avatar: null, language: 'pt-BR',
    progress: { crystalIds: [], defeatedBattleIds: [], guideIntroSeen: false, questMapGranted: false },
  })
  assert.deepEqual(calls.slice(-5), ['reset-keys', 'stop-sound', 'stop-world', 'start-intro', 'resume'])
  game.events.emit('destroy')
  const count = calls.length
  keydown(window, 'Escape')
  assert.equal(calls.length, count, 'destroyed games must not respond to Escape')
  assert.equal(calls.at(-1), 'remove')
})
