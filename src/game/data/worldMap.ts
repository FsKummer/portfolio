export const WORLD_TILE_SIZE = 64

export const WORLD_LAYOUT = [
  'cccccccccccccccccccc',
  'ctttggggggggggggtttc',
  'ctggggggggggggggggtc',
  'ctggghhggbbggllgggtc',
  'ctggghhggppggllgggtc',
  'ctggggggppggggggggtc',
  'ctgggwwgppppppggggtc',
  'ctgggwwgggaappggggtc',
  'ctggggggggaappggggtc',
  'ctggssggggggppggfftc',
  'ctggssggggggppggggtc',
  'ctggggggggggppggggtc',
  'ctttggggggggggggtttc',
  'cccccccccccccccccccc',
] as const

export const WORLD_SPAWN = {
  x: 8 * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2,
  y: 11 * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2,
}

export type InteractionZone = {
  id: string
  label: string
  message: string
  x: number
  y: number
  width: number
  height: number
}

export const WORLD_INTERACTIONS: InteractionZone[] = [
  {
    id: 'projects-board',
    label: 'Projects Board',
    message:
      'This board will become the projects hub. Each quest posting will point to a featured build.',
    x: 8 * WORLD_TILE_SIZE,
    y: 3 * WORLD_TILE_SIZE,
    width: 2 * WORLD_TILE_SIZE,
    height: 2 * WORLD_TILE_SIZE,
  },
  {
    id: 'skills-library',
    label: 'Skills Library',
    message:
      'The library will hold Felipe\'s stack, engineering principles, and favorite tools.',
    x: 12 * WORLD_TILE_SIZE,
    y: 3 * WORLD_TILE_SIZE,
    width: 2 * WORLD_TILE_SIZE,
    height: 2 * WORLD_TILE_SIZE,
  },
  {
    id: 'about-tavern',
    label: 'About Tavern',
    message:
      'This tavern will become the about-me zone: story, background, and the human side of the portfolio.',
    x: 10 * WORLD_TILE_SIZE,
    y: 7 * WORLD_TILE_SIZE,
    width: 2 * WORLD_TILE_SIZE,
    height: 2 * WORLD_TILE_SIZE,
  },
  {
    id: 'contact-shrine',
    label: 'Contact Shrine',
    message:
      'The shrine will become the contact terminal, where visitors can leave a message for Felipe.',
    x: 4 * WORLD_TILE_SIZE,
    y: 9 * WORLD_TILE_SIZE,
    width: 2 * WORLD_TILE_SIZE,
    height: 2 * WORLD_TILE_SIZE,
  },
  {
    id: 'flagship-gate',
    label: 'Flagship Gate',
    message:
      'This gate is reserved for the flagship project encounter, the big set-piece of the portfolio world.',
    x: 16 * WORLD_TILE_SIZE,
    y: 9 * WORLD_TILE_SIZE,
    width: 2 * WORLD_TILE_SIZE,
    height: 2 * WORLD_TILE_SIZE,
  },
]
