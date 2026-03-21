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
  id: 'projects' | 'about' | 'skills'
  title: string
  spawn: { x: number; y: number }
  width: number
  height: number
  imageKey: string
  jsonKey: string
  blockingLayers: string[]
  objects: InteriorObject[]
}

const MAP_WIDTH = 15
const MAP_HEIGHT = 15
const SHARED_EXITS: InteriorObject[] = [
  { kind: 'exit', x: 7, y: 14 },
  { kind: 'exit', x: 8, y: 14 },
]

export const INTERIORS: Record<InteriorDefinition['id'], InteriorDefinition> = {
  projects: {
    id: 'projects',
    title: 'Projects House',
    spawn: { x: 7, y: 13 },
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
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
    spawn: { x: 7, y: 13 },
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    imageKey: 'education-interior-map',
    jsonKey: 'education-interior-json',
    blockingLayers: ['Wall 1', 'border', 'chairs', 'teacher stuff', 'teacher stuff 2'],
    objects: [
      {
        kind: 'npc',
        sprite: 'bob-idle',
        label: 'House Guide',
        message: portfolioDialogues.aboutNpc,
        x: 11,
        y: 5,
        solid: true,
      },
      {
        kind: 'sign',
        label: 'Biography Note',
        message: portfolioDialogues.aboutSign,
        x: 3,
        y: 11,
        solid: true,
      },
      ...SHARED_EXITS,
    ],
  },
  skills: {
    id: 'skills',
    title: 'Skills House',
    spawn: { x: 7, y: 13 },
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
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
