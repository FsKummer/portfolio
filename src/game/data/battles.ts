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
        `Felipe's craft crystal is not about one feature. At Runa, he builds and operates payroll and HR systems that real companies depend on.

His work lives where product, compliance, and operations meet: Rails services, React interfaces, database changes, reports, tax rules, integrations, CI/CD, observability, and production support.

The curator calls that craft: understand the business problem, ship the smallest reliable fix, watch the system in production, and keep improving the tool for the people who depend on it.`,
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
        name: 'AWS Knowledge Crystal',
        colors: {
          body: 0xffb84d,
          detail: 0xff9900,
          edge: 0xffe3a3,
          glow: 0xffa329,
        },
      },
      defeatedBattleId: 'school-guide-trial',
      unlockedMessage:
        `Felipe's story starts long before code. Since he was young, he showed a natural talent for math, physics, and languages, and an unusual ability to learn quickly when a challenge caught his attention.

As a young man, he set his sights on becoming an Officer of the Merchant Navy. He earned his place through a difficult and competitive entrance exam, then trained for a life where discipline, precision, and responsibility matter every day.

At sea, he became a Nautical Officer aboard LNG carriers. Navigation, cargo operations, safety procedures, emergency response, and multinational crews taught him to stay calm, communicate clearly, and respect complex systems.

In 2022, he chose a new horizon: technology. He began with Harvard's CS50, building the fundamentals that later carried him into Le Wagon's full stack web development bootcamp.

Since then, he has kept moving: React, Go, mobile development, DevOps, Python, cloud infrastructure, and whatever the next problem required. He enjoys learning because every new tool is another way to solve a real problem.

In 2024, he returned to Le Wagon for Data Engineering, expanding his knowledge of data pipelines, warehouses, analytics, and the infrastructure around modern data work.`,
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
        `Felipe's vitality crystal comes from more than code. He has always been drawn to sports, especially basketball.

Through school and college, he played competitive basketball, built discipline with his teams, and earned many medals along the way.

The game taught him timing, resilience, communication, and how to stay useful under pressure - habits that still show up in his engineering work.

Nowadays he still enjoys an occasional game, but most days the routine is simpler: show up at the gym, train consistently, and keep the body ready for the next challenge.`,
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
        'The guide opens the last path: contact Felipe by email, LinkedIn, GitHub, CV, or a 15 minute call.',
    },
  },
}
