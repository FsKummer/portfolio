import Phaser from 'phaser'

export const MUSIC_KEYS = {
  battle: 'music-battle-the-world-awaits',
  finalBoss: 'music-final-boss-the-world-awaits',
  overworld: 'music-cozy-overworld',
} as const

export const SFX_KEYS = {
  attackHit: 'sfx-attack-hit',
  attackSwing: 'sfx-attack-swing',
  battleDefeat: 'sfx-battle-defeat',
  battleStart: 'sfx-battle-start',
  battleTurn: 'sfx-battle-turn',
  battleVictory: 'sfx-battle-victory',
  crystalReward: 'sfx-crystal-reward',
  damagePlayer: 'sfx-damage-player',
  errorLocked: 'sfx-error-locked',
  finalUnlock: 'sfx-final-unlock',
  itemUse: 'sfx-item-use',
  magicCast: 'sfx-magic-cast',
  magicImpact: 'sfx-magic-impact',
  magicProjectile: 'sfx-magic-projectile',
  textAdvance: 'sfx-text-advance',
  textBlip: 'sfx-text-blip',
  transitionDoor: 'sfx-transition-door',
  uiCancel: 'sfx-ui-cancel',
  uiConfirm: 'sfx-ui-confirm',
  uiCursor: 'sfx-ui-cursor',
  walkFloorA: 'sfx-walk-floor-a',
  walkFloorB: 'sfx-walk-floor-b',
  walkGrassA: 'sfx-walk-grass-a',
  walkGrassB: 'sfx-walk-grass-b',
} as const

export type MusicKey = (typeof MUSIC_KEYS)[keyof typeof MUSIC_KEYS]
export type SfxKey = (typeof SFX_KEYS)[keyof typeof SFX_KEYS]

const MUSIC_PATHS: Record<MusicKey, string> = {
  [MUSIC_KEYS.battle]: '/assets/audio/music/battle-the-world-awaits.mp3',
  [MUSIC_KEYS.finalBoss]: '/assets/audio/music/final-boss-the-world-awaits.mp3',
  [MUSIC_KEYS.overworld]: '/assets/audio/music/cozy-overworld.mp3',
}

const MUSIC_VOLUMES: Record<MusicKey, number> = {
  [MUSIC_KEYS.battle]: 0.34,
  [MUSIC_KEYS.finalBoss]: 0.38,
  [MUSIC_KEYS.overworld]: 0.28,
}

const SFX_PATHS: Record<SfxKey, string> = {
  [SFX_KEYS.attackHit]: '/assets/audio/sfx/attack_hit.wav',
  [SFX_KEYS.attackSwing]: '/assets/audio/sfx/attack_swing.wav',
  [SFX_KEYS.battleDefeat]: '/assets/audio/sfx/battle_defeat.wav',
  [SFX_KEYS.battleStart]: '/assets/audio/sfx/battle_start.wav',
  [SFX_KEYS.battleTurn]: '/assets/audio/sfx/battle_turn.wav',
  [SFX_KEYS.battleVictory]: '/assets/audio/sfx/battle_victory.wav',
  [SFX_KEYS.crystalReward]: '/assets/audio/sfx/crystal_reward.wav',
  [SFX_KEYS.damagePlayer]: '/assets/audio/sfx/damage_player.wav',
  [SFX_KEYS.errorLocked]: '/assets/audio/sfx/error_locked.wav',
  [SFX_KEYS.finalUnlock]: '/assets/audio/sfx/final_unlock.wav',
  [SFX_KEYS.itemUse]: '/assets/audio/sfx/item_use.wav',
  [SFX_KEYS.magicCast]: '/assets/audio/sfx/magic_cast.wav',
  [SFX_KEYS.magicImpact]: '/assets/audio/sfx/magic_impact.wav',
  [SFX_KEYS.magicProjectile]: '/assets/audio/sfx/magic_projectile.wav',
  [SFX_KEYS.textAdvance]: '/assets/audio/sfx/text_advance.wav',
  [SFX_KEYS.textBlip]: '/assets/audio/sfx/text_blip_01.wav',
  [SFX_KEYS.transitionDoor]: '/assets/audio/sfx/transition_door.wav',
  [SFX_KEYS.uiCancel]: '/assets/audio/sfx/ui_cancel.wav',
  [SFX_KEYS.uiConfirm]: '/assets/audio/sfx/ui_confirm.wav',
  [SFX_KEYS.uiCursor]: '/assets/audio/sfx/ui_cursor.wav',
  [SFX_KEYS.walkFloorA]: '/assets/audio/sfx/walk_floor_01.wav',
  [SFX_KEYS.walkFloorB]: '/assets/audio/sfx/walk_floor_02.wav',
  [SFX_KEYS.walkGrassA]: '/assets/audio/sfx/walk_grass_01.wav',
  [SFX_KEYS.walkGrassB]: '/assets/audio/sfx/walk_grass_02.wav',
}

let activeMusic: Phaser.Sound.BaseSound | undefined
let activeMusicKey: MusicKey | undefined

export function preloadAudio(scene: Phaser.Scene) {
  Object.entries(MUSIC_PATHS).forEach(([key, path]) => {
    scene.load.audio(key, path)
  })

  Object.entries(SFX_PATHS).forEach(([key, path]) => {
    scene.load.audio(key, path)
  })
}

export function playMusic(scene: Phaser.Scene, key: MusicKey) {
  if (!scene.cache.audio.exists(key)) {
    return
  }

  if (activeMusicKey === key && activeMusic?.isPlaying) {
    return
  }

  stopMusic()

  activeMusicKey = key
  activeMusic = scene.sound.add(key, {
    loop: true,
    volume: MUSIC_VOLUMES[key],
  })
  activeMusic.play()
}

export function stopMusic() {
  activeMusic?.stop()
  activeMusic?.destroy()
  activeMusic = undefined
  activeMusicKey = undefined
}

export function playSfx(
  scene: Phaser.Scene,
  key: SfxKey,
  config: Phaser.Types.Sound.SoundConfig = {},
) {
  if (!scene.cache.audio.exists(key)) {
    return
  }

  scene.sound.play(key, {
    volume: 0.42,
    ...config,
  })
}
