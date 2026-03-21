export const WORLD_TILE_SIZE = 32

export const WORLD_LAYOUT = [
  '########################',
  '#......................#',
  '#......................#',
  '#..wwwwww....cccccc....#',
  '#..wwwwww....cccccc....#',
  '#......................#',
  '#....rrrrrrrrrrrr......#',
  '#....rrrrrrrrrrrr......#',
  '#......................#',
  '#..hhhhhh....gggggg....#',
  '#..hhhhhh....gggggg....#',
  '#......................#',
  '#......................#',
  '########################',
] as const

export const FLOOR_FRAMES = {
  '.': 124,
  w: 109,
  c: 154,
  r: 332,
  h: 164,
  g: 199,
} as const

export const WORLD_SPAWN = {
  x: 12 * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2,
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

export type Decoration = {
  frame: number
  heightTiles?: number
  id: string
  solid?: boolean
  tileset: 'interiors' | 'room-builder'
  widthTiles?: number
  x: number
  y: number
}

export const WORLD_DECORATIONS: Decoration[] = [
  { id: 'projects-left-shelf', frame: 306, tileset: 'interiors', x: 3, y: 2, solid: true },
  { id: 'projects-right-shelf', frame: 307, tileset: 'interiors', x: 5, y: 2, solid: true },
  { id: 'skills-left-shelf', frame: 310, tileset: 'interiors', x: 15, y: 2, solid: true },
  { id: 'skills-right-shelf', frame: 311, tileset: 'interiors', x: 17, y: 2, solid: true },
  { id: 'about-lounge-left', frame: 338, tileset: 'interiors', x: 9, y: 5, solid: true },
  { id: 'about-lounge-right', frame: 339, tileset: 'interiors', x: 10, y: 5, solid: true },
  { id: 'contact-console-left', frame: 320, tileset: 'interiors', x: 4, y: 8, solid: true },
  { id: 'contact-console-right', frame: 321, tileset: 'interiors', x: 5, y: 8, solid: true },
  { id: 'flagship-display-left', frame: 332, tileset: 'interiors', x: 16, y: 8 },
  { id: 'flagship-display-center', frame: 333, tileset: 'interiors', x: 17, y: 8 },
  { id: 'flagship-display-right', frame: 334, tileset: 'interiors', x: 18, y: 8 },
]

export const WORLD_INTERACTIONS: InteractionZone[] = [
  {
    id: 'projects-board',
    label: 'Projects Zone',
    message:
      'This modern workstation wing will become the projects hub. Each desk or board can open a featured build.',
    x: 2 * WORLD_TILE_SIZE,
    y: 3 * WORLD_TILE_SIZE,
    width: 6 * WORLD_TILE_SIZE,
    height: 3 * WORLD_TILE_SIZE,
  },
  {
    id: 'skills-library',
    label: 'Skills Zone',
    message:
      'This catalog wall will become Felipe\'s stack and engineering toolbox area.',
    x: 14 * WORLD_TILE_SIZE,
    y: 3 * WORLD_TILE_SIZE,
    width: 6 * WORLD_TILE_SIZE,
    height: 3 * WORLD_TILE_SIZE,
  },
  {
    id: 'about-lounge',
    label: 'About Lounge',
    message:
      'This lounge will become the about-me area: background, story, and the human side of the portfolio.',
    x: 8 * WORLD_TILE_SIZE,
    y: 6 * WORLD_TILE_SIZE,
    width: 8 * WORLD_TILE_SIZE,
    height: 3 * WORLD_TILE_SIZE,
  },
  {
    id: 'contact-terminal',
    label: 'Contact Terminal',
    message:
      'This console corner will become the message and contact area for the portfolio.',
    x: 2 * WORLD_TILE_SIZE,
    y: 9 * WORLD_TILE_SIZE,
    width: 6 * WORLD_TILE_SIZE,
    height: 3 * WORLD_TILE_SIZE,
  },
  {
    id: 'flagship-display',
    label: 'Flagship Display',
    message:
      'This highlighted platform is reserved for the flagship project showcase.',
    x: 14 * WORLD_TILE_SIZE,
    y: 9 * WORLD_TILE_SIZE,
    width: 6 * WORLD_TILE_SIZE,
    height: 3 * WORLD_TILE_SIZE,
  },
]
