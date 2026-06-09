import type { InteriorDefinition } from './interiors'

export type BattleActionId = 'attack' | 'magic' | 'item'

export type BattleActionEffect =
  | {
      amount: number
      kind: 'damage'
      mpCost?: number
    }
  | {
      amount: number
      itemKey: 'field-potion'
      kind: 'heal'
    }

export type BattleAction = {
  effect: BattleActionEffect
  id: BattleActionId
  label: string
}

export type BattleParticipant = {
  attackDamage: number
  id: string
  maxHp: number
  maxMp: number
  name: string
  spriteKey: 'alex-idle' | 'bob-idle' | 'mystic-guide'
}

export type BattleTilePosition = {
  x: number
  y: number
}

export type BattleField = {
  backgroundOffset: {
    x: number
    y: number
  }
  backgroundScale?: number
  characterScale?: number
  enemyTile: BattleTilePosition
  imageKey?: 'world-map'
  interiorId?: InteriorDefinition['id']
  playerTile: BattleTilePosition
}

export type CrystalBattleEncounterId =
  | 'project-curator-trial'
  | 'school-guide-trial'
  | 'workout-buddy-trial'

export type FinalBattleEncounterId = 'mystic-guide-final'

export type BattleEncounterId = CrystalBattleEncounterId | FinalBattleEncounterId

export type CrystalBattleReward = {
  crystal: {
    colors: {
      body: number
      detail: number
      edge: number
      glow: number
    }
    id: string
    name: string
  }
  defeatedBattleId: CrystalBattleEncounterId
  kind: 'crystal'
  unlockedMessage: string
}

export type FinalBattleReward = {
  defeatedBattleId: FinalBattleEncounterId
  kind: 'final'
  scheduleUrl: string
  unlockedMessage: string
}

export type BattleReward = CrystalBattleReward | FinalBattleReward

export type BattleEncounter = {
  actions: BattleActionId[]
  battlefield: BattleField
  defeatMessage: string
  enemy: BattleParticipant
  id: BattleEncounterId
  introLog: string
  reward: BattleReward
  title: string
  victoryLog: string
}

export const SCHEDULE_CALL_URL = 'https://calendar.app.google/C7M4Y6x4j3RpTKV76'

export const FINAL_GUIDE_ENCOUNTER_ID: FinalBattleEncounterId = 'mystic-guide-final'

export const CRYSTAL_BATTLE_ENCOUNTER_IDS: CrystalBattleEncounterId[] = [
  'project-curator-trial',
  'school-guide-trial',
  'workout-buddy-trial',
]

export const BATTLE_ACTIONS: Record<BattleActionId, BattleAction> = {
  attack: {
    id: 'attack',
    label: 'Attack',
    effect: {
      kind: 'damage',
      amount: 16,
    },
  },
  magic: {
    id: 'magic',
    label: 'Magic',
    effect: {
      kind: 'damage',
      amount: 28,
      mpCost: 8,
    },
  },
  item: {
    id: 'item',
    label: 'Item',
    effect: {
      kind: 'heal',
      amount: 30,
      itemKey: 'field-potion',
    },
  },
}

export const BATTLE_ENCOUNTERS: Record<BattleEncounterId, BattleEncounter> = {
  'project-curator-trial': {
    id: 'project-curator-trial',
    title: 'Project Curator Trial',
    actions: ['attack', 'magic', 'item'],
    battlefield: {
      interiorId: 'projects',
      backgroundOffset: { x: 280, y: 0 },
      characterScale: 3,
      enemyTile: { x: 7, y: 3 },
      playerTile: { x: 8, y: 8 },
    },
    introLog: 'The project curator tests your eye for finished work.',
    victoryLog: 'The curator smiles. The first portfolio crystal is yours.',
    defeatMessage:
      'The curator closes the case file. "Rework the plan and try the trial again."',
    enemy: {
      id: 'project-curator',
      name: 'Project Curator',
      spriteKey: 'alex-idle',
      maxHp: 80,
      maxMp: 0,
      attackDamage: 10,
    },
    reward: {
      kind: 'crystal',
      crystal: {
        id: 'craft-crystal',
        name: 'Ruby Craft Crystal',
        colors: {
          body: 0xff8ca0,
          detail: 0xd9446a,
          edge: 0xffd1d8,
          glow: 0xff6f8f,
        },
      },
      defeatedBattleId: 'project-curator-trial',
      unlockedMessage:
        'Felipe approaches projects like playable product stories: clear scope, strong interaction details, and practical code paths that can keep evolving after launch.',
    },
  },
  'school-guide-trial': {
    id: 'school-guide-trial',
    title: 'School Guide Trial',
    actions: ['attack', 'magic', 'item'],
    battlefield: {
      interiorId: 'about',
      backgroundOffset: { x: 0, y: -448 },
      characterScale: 5.6,
      enemyTile: { x: 22, y: 13 },
      playerTile: { x: 20, y: 18 },
    },
    introLog: 'The school guide tests whether you are ready to hear more.',
    victoryLog: 'The guide nods. You earned the next page of Felipe Kummer.',
    defeatMessage:
      'The guide lowers his book. "Close, but not yet. Come back when you are ready to ask again."',
    enemy: {
      id: 'school-guide',
      name: 'School Guide',
      spriteKey: 'bob-idle',
      maxHp: 90,
      maxMp: 0,
      attackDamage: 12,
    },
    reward: {
      kind: 'crystal',
      crystal: {
        id: 'knowledge-crystal',
        name: 'Azure Knowledge Crystal',
        colors: {
          body: 0xa7f1ff,
          detail: 0x6db9ff,
          edge: 0xf4fbff,
          glow: 0x7fe7ff,
        },
      },
      defeatedBattleId: 'school-guide-trial',
      unlockedMessage:
        'Felipe turns complex product ideas into focused, playable experiences. His work balances polished interaction design with practical engineering choices, so the final product feels clear, intentional, and easy to keep improving.',
    },
  },
  'workout-buddy-trial': {
    id: 'workout-buddy-trial',
    title: 'Workout Buddy Trial',
    actions: ['attack', 'magic', 'item'],
    battlefield: {
      interiorId: 'skills',
      backgroundOffset: { x: 160, y: -32 },
      characterScale: 3.6,
      enemyTile: { x: 15, y: 4 },
      playerTile: { x: 12, y: 9 },
    },
    introLog: 'The workout buddy turns discipline into a friendly spar.',
    victoryLog: 'The workout buddy nods. Another crystal joins your path.',
    defeatMessage:
      'The workout buddy offers a hand. "Reset your stance and challenge me again."',
    enemy: {
      id: 'workout-buddy',
      name: 'Workout Buddy',
      spriteKey: 'alex-idle',
      maxHp: 95,
      maxMp: 0,
      attackDamage: 14,
    },
    reward: {
      kind: 'crystal',
      crystal: {
        id: 'vitality-crystal',
        name: 'Emerald Vitality Crystal',
        colors: {
          body: 0x9dffb0,
          detail: 0x52d67c,
          edge: 0xf0ffe8,
          glow: 0x76ff9d,
        },
      },
      defeatedBattleId: 'workout-buddy-trial',
      unlockedMessage:
        'Felipe keeps momentum through discipline outside the screen too: training, hobbies, and recovery all feed back into steadier creative work.',
    },
  },
  'mystic-guide-final': {
    id: 'mystic-guide-final',
    title: 'Mysterious Guide Trial',
    actions: ['attack', 'magic', 'item'],
    battlefield: {
      imageKey: 'world-map',
      backgroundOffset: { x: 280, y: 88 },
      backgroundScale: 4,
      characterScale: 3.4,
      enemyTile: { x: 5.833, y: 3.5 },
      playerTile: { x: 7, y: 8 },
    },
    introLog: 'The mysterious guide raises the final light.',
    victoryLog: 'The guide bows. The final prize is yours.',
    defeatMessage:
      'The guide steadies the light. "Your crystals are true. Return when your focus is sharper."',
    enemy: {
      id: 'mystic-guide',
      name: 'Mysterious Guide',
      spriteKey: 'mystic-guide',
      maxHp: 112,
      maxMp: 0,
      attackDamage: 12,
    },
    reward: {
      kind: 'final',
      defeatedBattleId: 'mystic-guide-final',
      scheduleUrl: SCHEDULE_CALL_URL,
      unlockedMessage:
        'The guide opens the last path: a 15 minute call with Felipe Kummer.',
    },
  },
}
