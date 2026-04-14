import { portfolioDialogues } from './portfolioContent'

export type InteriorObject = {
  frame?: number
  kind: 'decor' | 'npc' | 'sign' | 'exit'
  label?: string
  message?: string
  solid?: boolean
  sprite?: 'alex-idle' | 'bob-idle'
  x: number
  y: number
}

export type InteriorDefinition = {
  cameraZoom?: number
  characterScale?: number
  collisionLayer?: {
    blockedTileIds?: number[]
    emptyTileIds?: number[]
    name: string
  }
  id: 'projects' | 'about' | 'skills'
  title: string
  runSpeed?: number
  spawn: { x: number; y: number }
  walkSpeed?: number
  width: number
  height: number
  imageKey: string
  jsonKey: string
  blockingLayers: string[]
  objects: InteriorObject[]
}

const STANDARD_MAP_WIDTH = 15
const STANDARD_MAP_HEIGHT = 15
const SCHOOL_MAP_WIDTH = 30
const SCHOOL_MAP_HEIGHT = 30
const SHARED_EXITS: InteriorObject[] = [
  { kind: 'exit', x: 7, y: 14 },
  { kind: 'exit', x: 8, y: 14 },
]

export const INTERIORS: Record<InteriorDefinition['id'], InteriorDefinition> = {
  projects: {
    id: 'projects',
    title: 'Projects House',
    spawn: { x: 7, y: 13 },
    width: STANDARD_MAP_WIDTH,
    height: STANDARD_MAP_HEIGHT,
    imageKey: 'skills-interior-map',
    jsonKey: 'skills-interior-json',
    blockingLayers: ['walls', 'stuff'],
    objects: [
      {
        kind: 'npc',
        sprite: 'alex-idle',
        label: 'Project Curator',
        message: portfolioDialogues.projectsNpc,
        x: 3,
        y: 4,
        solid: true,
      },
      {
        kind: 'sign',
        label: 'Projects Board',
        message: portfolioDialogues.projectsSign,
        x: 12,
        y: 4,
        solid: true,
      },
      ...SHARED_EXITS,
    ],
  },
  about: {
    id: 'about',
    title: 'Education House',
    cameraZoom: 0.78,
    characterScale: 5.6,
    walkSpeed: 250,
    runSpeed: 400,
    spawn: { x: 14, y: 27 },
    width: SCHOOL_MAP_WIDTH,
    height: SCHOOL_MAP_HEIGHT,
    imageKey: 'school-house-map',
    jsonKey: 'school-house-json',
    blockingLayers: ['Collision layer'],
    collisionLayer: {
      name: 'Collision layer',
      emptyTileIds: [282],
      blockedTileIds: [7315],
    },
    objects: [
      {
        kind: 'npc',
        sprite: 'bob-idle',
        label: 'House Guide',
        message: portfolioDialogues.aboutNpc,
        x: 22,
        y: 12,
        solid: true,
      },
      {
        kind: 'sign',
        label: 'Biography Note',
        message: portfolioDialogues.aboutSign,
        x: 24,
        y: 4,
        solid: false,
      },
      { kind: 'exit', x: 13, y: 29 },
      { kind: 'exit', x: 14, y: 29 },
      { kind: 'exit', x: 15, y: 29 },
      { kind: 'exit', x: 16, y: 29 },
    ],
  },
  skills: {
    id: 'skills',
    title: 'Skills House',
    spawn: { x: 7, y: 13 },
    width: STANDARD_MAP_WIDTH,
    height: STANDARD_MAP_HEIGHT,
    imageKey: 'skills-interior-map',
    jsonKey: 'skills-interior-json',
    blockingLayers: ['walls', 'stuff'],
    objects: [
      {
        kind: 'npc',
        sprite: 'alex-idle',
        label: 'Stack Keeper',
        message: portfolioDialogues.skillsNpc,
        x: 12,
        y: 4,
        solid: true,
      },
      {
        kind: 'sign',
        label: 'Skills Index',
        message: portfolioDialogues.skillsSign,
        x: 13,
        y: 10,
        solid: true,
      },
      ...SHARED_EXITS,
    ],
  },
}
