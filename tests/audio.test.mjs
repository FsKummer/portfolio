import assert from 'node:assert/strict'
import { test } from 'node:test'
import { playSfx, SFX_KEYS } from '../src/game/systems/audio.ts'

test('effects never pile up while audio is locked, and menu feedback stays quiet', () => {
  const played = []
  const scene = {
    cache: { audio: { exists: () => true } },
    sound: {
      locked: true,
      context: { state: 'suspended' },
      play: (key, config) => played.push({ key, ...config }),
    },
  }
  for (let i = 0; i < 12; i++) playSfx(scene, SFX_KEYS.uiCursor, { volume: 0.3 })
  assert.equal(played.length, 0, 'hovering before the first click must not queue sounds')

  scene.sound.locked = false
  playSfx(scene, SFX_KEYS.textBlip)
  assert.equal(played.length, 0, 'a suspended audio context must not queue sounds either')

  scene.sound.context.state = 'running'
  playSfx(scene, SFX_KEYS.uiConfirm)
  playSfx(scene, SFX_KEYS.uiCursor, { volume: 0.3, rate: 0.9 })
  playSfx(scene, SFX_KEYS.uiCancel, { volume: 0.32 })
  playSfx(scene, SFX_KEYS.textAdvance, { volume: 0.28 })
  playSfx(scene, SFX_KEYS.textBlip, { volume: 0.18 })
  assert.equal(played.length, 5, 'unlocking must not replay any earlier effects')
  assert.ok(played.every(({ volume }) => volume > 0 && volume <= 0.15))
  assert.equal(played[1].rate, 0.9)

  playSfx(scene, SFX_KEYS.uiConfirm, { volume: 0 })
  assert.equal(played.at(-1).volume, 0)
  playSfx(scene, SFX_KEYS.attackHit, { volume: 0.44 })
  assert.equal(played.at(-1).volume, 0.44, 'combat keeps its existing mix')

  delete scene.sound.context
  scene.sound.locked = true
  const count = played.length
  playSfx(scene, SFX_KEYS.uiConfirm)
  assert.equal(played.length, count, 'HTML audio also respects the audio lock')
  scene.sound.locked = false
  playSfx(scene, SFX_KEYS.uiConfirm)
  assert.equal(played.length, count + 1)

  scene.cache.audio.exists = () => false
  playSfx(scene, SFX_KEYS.uiConfirm)
  assert.equal(played.length, count + 1, 'missing sounds stay silent')
})
