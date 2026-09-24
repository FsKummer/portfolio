import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import Rectangle from 'phaser/src/geom/rectangle/Rectangle.js'
import intersects from 'phaser/src/geom/intersects/RectangleToRectangle.js'

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

test('project house keeps its walls and tree trunks solid with a path behind the canopies', () => {
  const expectedBlockedColumnsByRow = new Map([
    [17, [7, 8, 9, 10]],
    [18, []],
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

test('trees in front of both houses have a clear path behind solid trunks', () => {
  for (const [row, column] of [[7, 26], [7, 30], [18, 5], [18, 11]]) {
    for (const x of [column, column + 1]) {
      assert.equal(worldCollisions[row][x], 0, `canopy at ${row}, ${x} should be passable`)
      assert.equal(worldCollisions[row + 1][x], COLLISION_BLOCKER, `trunk at ${row + 1}, ${x} should block`)
    }
  }
})

test('contact dock is reachable on the pier, but not from the right island', () => {
  const source = readFileSync(new URL('../src/game/data/worldMap.ts', import.meta.url), 'utf8')
  const match = source.match(/\{\s+id: 'contact-dock',[\s\S]*?\n  }/)
  assert.ok(match, 'contact dock zone should be present')
  const zone = Function('WORLD_SCALE', 'portfolioDialogues', `return (${match[0]})`)(4, { contactSign: '' })
  const dock = new Rectangle(zone.x, zone.y, zone.width, zone.height)

  for (const x of [504, 528, 612]) {
    assert.equal(intersects(new Rectangle(x * 4, 156 * 4, 24, 18), dock), false, `right island at ${x}`)
  }
  for (const x of [416, 436, 448]) {
    assert.equal(intersects(new Rectangle(x * 4, 100 * 4, 24, 18), dock), true, `pier at ${x}`)
  }
})
