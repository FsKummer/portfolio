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
  floorFrame: number
  wallFrame: number
  accentFrames: readonly [number, ...number[]]
  objects: InteriorObject[]
}

const createRoomBounds = (wallFrame: number): InteriorObject[] => {
  const objects: InteriorObject[] = []

  for (let x = 0; x < 12; x += 1) {
    objects.push({ kind: 'decor', frame: wallFrame, x, y: 0, solid: true })
    objects.push({ kind: 'decor', frame: wallFrame, x, y: 8, solid: true })
  }

  for (let y = 1; y < 8; y += 1) {
    objects.push({ kind: 'decor', frame: wallFrame, x: 0, y, solid: true })
    objects.push({ kind: 'decor', frame: wallFrame, x: 11, y, solid: true })
  }

  return objects
}

export const INTERIORS: Record<InteriorDefinition['id'], InteriorDefinition> = {
  projects: {
    id: 'projects',
    title: 'Projects House',
    spawn: { x: 6, y: 7 },
    floorFrame: 124,
    wallFrame: 5,
    accentFrames: [332, 333, 334],
    objects: [
      ...createRoomBounds(5),
      { kind: 'decor', frame: 306, x: 2, y: 1, solid: true },
      { kind: 'decor', frame: 307, x: 3, y: 1, solid: true },
      { kind: 'decor', frame: 310, x: 8, y: 1, solid: true },
      { kind: 'decor', frame: 311, x: 9, y: 1, solid: true },
      { kind: 'decor', frame: 320, x: 2, y: 5, solid: true },
      { kind: 'decor', frame: 321, x: 3, y: 5, solid: true },
      {
        kind: 'npc',
        sprite: 'alex-idle',
        label: 'Project Curator',
        message: portfolioDialogues.projectsNpc,
        x: 7,
        y: 4,
        solid: true,
      },
      {
        kind: 'sign',
        frame: 320,
        label: 'Projects Board',
        message: portfolioDialogues.projectsSign,
        x: 8,
        y: 6,
        solid: true,
      },
      { kind: 'exit', x: 5, y: 8 },
      { kind: 'exit', x: 6, y: 8 },
    ],
  },
  about: {
    id: 'about',
    title: 'About House',
    spawn: { x: 6, y: 7 },
    floorFrame: 199,
    wallFrame: 14,
    accentFrames: [338, 339],
    objects: [
      ...createRoomBounds(14),
      { kind: 'decor', frame: 306, x: 2, y: 1, solid: true },
      { kind: 'decor', frame: 307, x: 3, y: 1, solid: true },
      { kind: 'decor', frame: 310, x: 8, y: 1, solid: true },
      { kind: 'decor', frame: 311, x: 9, y: 1, solid: true },
      { kind: 'decor', frame: 320, x: 2, y: 4, solid: true },
      { kind: 'decor', frame: 321, x: 3, y: 4, solid: true },
      {
        kind: 'npc',
        sprite: 'bob-idle',
        label: 'House Guide',
        message: portfolioDialogues.aboutNpc,
        x: 7,
        y: 4,
        solid: true,
      },
      {
        kind: 'sign',
        frame: 320,
        label: 'Biography Note',
        message: portfolioDialogues.aboutSign,
        x: 8,
        y: 6,
        solid: true,
      },
      { kind: 'exit', x: 5, y: 8 },
      { kind: 'exit', x: 6, y: 8 },
    ],
  },
  skills: {
    id: 'skills',
    title: 'Skills House',
    spawn: { x: 6, y: 7 },
    floorFrame: 164,
    wallFrame: 23,
    accentFrames: [306, 307, 310, 311],
    objects: [
      ...createRoomBounds(23),
      { kind: 'decor', frame: 306, x: 2, y: 1, solid: true },
      { kind: 'decor', frame: 307, x: 3, y: 1, solid: true },
      { kind: 'decor', frame: 310, x: 4, y: 1, solid: true },
      { kind: 'decor', frame: 311, x: 5, y: 1, solid: true },
      { kind: 'decor', frame: 306, x: 7, y: 1, solid: true },
      { kind: 'decor', frame: 307, x: 8, y: 1, solid: true },
      { kind: 'decor', frame: 310, x: 9, y: 1, solid: true },
      { kind: 'decor', frame: 311, x: 10, y: 1, solid: true },
      { kind: 'decor', frame: 320, x: 8, y: 4, solid: true },
      { kind: 'decor', frame: 321, x: 9, y: 4, solid: true },
      {
        kind: 'npc',
        sprite: 'alex-idle',
        label: 'Stack Keeper',
        message: portfolioDialogues.skillsNpc,
        x: 4,
        y: 4,
        solid: true,
      },
      {
        kind: 'sign',
        frame: 320,
        label: 'Skills Index',
        message: portfolioDialogues.skillsSign,
        x: 7,
        y: 6,
        solid: true,
      },
      { kind: 'exit', x: 5, y: 8 },
      { kind: 'exit', x: 6, y: 8 },
    ],
  },
}
