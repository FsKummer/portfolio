import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const COLLISION_BLOCKER = 1025
const COLLISION_COLUMNS = 70

function readWorldCollisions() {
  const source = readFileSync(new URL('../src/game/data/worldMap.ts', import.meta.url), 'utf8')
  const match = source.match(/export const WORLD_COLLISIONS = \[([\s\S]*?)\] as const/)

  assert.ok(match, 'WORLD_COLLISIONS export should be present')

  return Function(`return [${match[1]}]`)()
}

const worldCollisions = readWorldCollisions()

test('world collision grid keeps the expected dimensions and values', () => {
  assert.equal(worldCollisions.length, 30)

  worldCollisions.forEach((row, rowIndex) => {
    assert.equal(row.length, COLLISION_COLUMNS, `row ${rowIndex} should have ${COLLISION_COLUMNS} columns`)
    row.forEach((value, columnIndex) => {
      assert.ok(
        value === 0 || value === COLLISION_BLOCKER,
        `row ${rowIndex}, column ${columnIndex} should be empty or a blocker`,
      )
    })
  })
})

test('project house lower tree blockers match the authored collision cells', () => {
  const expectedBlockedColumnsByRow = new Map([
    [17, [5, 6, 7, 8, 9, 10, 11]],
    [18, [5, 6, 11, 12]],
    [19, [5, 6, 11, 12]],
    [20, []],
  ])

  expectedBlockedColumnsByRow.forEach((expectedColumns, rowIndex) => {
    const actualColumns = worldCollisions[rowIndex]
      .map((value, columnIndex) => (value === COLLISION_BLOCKER ? columnIndex : null))
      .filter((columnIndex) => columnIndex !== null && columnIndex >= 5 && columnIndex <= 12)

    assert.deepEqual(actualColumns, expectedColumns, `row ${rowIndex} project-house tree columns`)
  })
})
