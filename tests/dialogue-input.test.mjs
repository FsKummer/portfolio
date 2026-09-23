import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { test } from 'node:test'
import { typewriteText, waitForConfirm } from '../src/game/systems/dialogue.ts'

test('a click reveals animated text immediately, without also skipping the dialogue', async () => {
  let timer
  const input = Object.assign(new EventEmitter(), { keyboard: new EventEmitter() })
  const scene = {
    input,
    sound: { locked: true },
    time: {
      addEvent: ({ callback }) => {
        timer = { callback, removed: false, remove() { this.removed = true } }
        return timer
      },
    },
  }
  const text = {
    text: '',
    getWrappedText: (value) => value.split('\n'),
    setText(value) { this.text = value },
  }
  let advanced = false
  const typing = typewriteText(scene, text, 'Welcome, traveler.', 28, { skipOnConfirm: true })
  const flow = typing.then(() => waitForConfirm(scene)).then(() => { advanced = true })
  input.emit('pointerdown')
  await typing
  assert.equal(text.text, 'Welcome, traveler.')
  assert.equal(timer.removed, true)
  assert.equal(advanced, false, 'the same click must not reveal and advance')
  assert.equal(input.listenerCount('pointerdown'), 1, 'only the continue handler should remain')
  assert.equal(input.keyboard.listenerCount('keydown-ENTER'), 1)
  input.emit('pointerdown')
  await flow
  assert.equal(advanced, true)
  assert.equal(input.listenerCount('pointerdown'), 0)
  assert.equal(input.keyboard.listenerCount('keydown-ENTER'), 0)
  assert.equal(input.keyboard.listenerCount('keydown-SPACE'), 0)

  const cancelled = typewriteText(scene, text, 'Choose a traveler.', 28, {
    shouldContinue: () => false,
    skipOnConfirm: true,
  })
  timer.callback()
  await cancelled
  assert.equal(input.listenerCount('pointerdown'), 0, 'choosing a card cancels its old text handler')
  assert.equal(input.keyboard.listenerCount('keydown-ENTER'), 0)
})
