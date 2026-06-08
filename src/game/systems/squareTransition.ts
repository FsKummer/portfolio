import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../core/config'

type SquareTransitionOptions = {
  color?: number
  depth?: number
  duration?: number
  squareSize?: number
  stagger?: number
}

type SquareCell = {
  distanceFromCenter: number
  square: Phaser.GameObjects.Rectangle
}

const DEFAULT_SQUARE_SIZE = 64
const DEFAULT_DURATION = 120
const DEFAULT_STAGGER = 34
const DEFAULT_DEPTH = 6000
const DEFAULT_COLOR = 0x01040b

export function playSquareCloseTransition(
  scene: Phaser.Scene,
  options: SquareTransitionOptions = {},
) {
  const transition = createTransitionSquares(scene, options)

  transition.cells.forEach(({ distanceFromCenter, square }) => {
    square.setScale(0)

    scene.tweens.add({
      targets: square,
      delay: (transition.maxDistance - distanceFromCenter) * transition.stagger,
      duration: transition.duration,
      ease: 'Quad.easeOut',
      scaleX: 1,
      scaleY: 1,
    })
  })

  return waitForTransition(scene, transition.totalDuration)
}

export function playSquareRevealTransition(
  scene: Phaser.Scene,
  options: SquareTransitionOptions = {},
) {
  const transition = createTransitionSquares(scene, options)

  transition.cells.forEach(({ distanceFromCenter, square }) => {
    square.setScale(1)

    scene.tweens.add({
      targets: square,
      delay: distanceFromCenter * transition.stagger,
      duration: transition.duration,
      ease: 'Quad.easeIn',
      scaleX: 0,
      scaleY: 0,
    })
  })

  return waitForTransition(scene, transition.totalDuration).then(() => {
    transition.cells.forEach(({ square }) => square.destroy())
  })
}

function createTransitionSquares(scene: Phaser.Scene, options: SquareTransitionOptions) {
  const squareSize = options.squareSize ?? DEFAULT_SQUARE_SIZE
  const columns = Math.ceil(GAME_WIDTH / squareSize)
  const rows = Math.ceil(GAME_HEIGHT / squareSize)
  const centerColumn = (columns - 1) / 2
  const centerRow = (rows - 1) / 2
  const cells: SquareCell[] = []
  let maxDistance = 0

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const distanceFromCenter = Phaser.Math.Distance.Between(
        column,
        row,
        centerColumn,
        centerRow,
      )
      maxDistance = Math.max(maxDistance, distanceFromCenter)

      const square = scene.add
        .rectangle(
          column * squareSize + squareSize / 2,
          row * squareSize + squareSize / 2,
          squareSize + 2,
          squareSize + 2,
          options.color ?? DEFAULT_COLOR,
          1,
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(options.depth ?? DEFAULT_DEPTH)

      cells.push({ distanceFromCenter, square })
    }
  }

  const duration = options.duration ?? DEFAULT_DURATION
  const stagger = options.stagger ?? DEFAULT_STAGGER

  return {
    cells,
    duration,
    maxDistance,
    stagger,
    totalDuration: maxDistance * stagger + duration,
  }
}

function waitForTransition(scene: Phaser.Scene, duration: number) {
  return new Promise<void>((resolve) => {
    scene.time.delayedCall(duration, resolve)
  })
}
