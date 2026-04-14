# Repo Map

## Launch Surface

- repo root script: `npm run dev`
- game mount: `#game-root` in `src/components/game/GameCanvas.tsx`
- Phaser scenes: `BootScene`, `IntroScene`, `CharacterSelectScene`, `WorldScene`, `InteriorScene`

## Persistence

- `localStorage` key: `felipe-kummer-portfolio-profile`
- shape:
  - `visitorName: string`
  - `avatar: "boy" | "girl" | null`

Clear or overwrite this key before repeatable onboarding tests.

## Controls

### Intro

- `Enter` advances dialogue
- DOM input id: `#traveler-name`

### Character Select

- `ArrowLeft` or `A` and `ArrowRight` or `D` change selection
- `Enter` or `Space` confirms selection and starts the world flow
- pointer hover and click also change or lock selection

### World

- movement: `WASD` or arrow keys
- interact: `E` or `Space`
- close dialogue: `Enter`
- sprint: `Shift`
- toggle HUD: `H`

### Interiors

- movement: `WASD` or arrow keys
- interact: `E` or `Space`
- close dialogue: `Enter`
- sprint: `Shift`

## Main Flow

1. `IntroScene`
   - advance three dialogue lines with `Enter`
   - fill `#traveler-name`
2. `CharacterSelectScene`
   - choose `boy` or `girl`
   - confirm
3. `WorldScene`
   - spawn near `{ x: 1402, y: 420 }`
   - world interactions include Projects House, About House, Skills House, and Contact Dock
4. `InteriorScene`
   - enter from a house interaction zone
   - leave through the bottom-center exit tiles

## Important Source Files

- `src/game/scenes/IntroScene.ts`
- `src/game/scenes/CharacterSelectScene.ts`
- `src/game/scenes/WorldScene.ts`
- `src/game/scenes/InteriorScene.ts`
- `src/game/store/sessionStore.ts`
- `src/game/data/worldMap.ts`
- `src/game/data/interiors.ts`

## High-Value Regression Areas

- input focus after DOM name entry
- selection lock behavior when mixing hover, click, and keyboard confirm
- house re-entry suppression after leaving an interior
- collision blockers generated from `WORLD_COLLISIONS`
- interior blockers generated from JSON tile layers plus object solids
- player body size and offset in world and interiors
- diagonal normalization against walls and corners
- prompt visibility while dialogue is open or when zones overlap

## Good Targeted Checks

- hit each exterior house entrance from the front and from diagonals
- sprint into corners and immediately change direction
- interact at the edge of prompt zones
- open dialogue, close it, and resume movement quickly
- enter and leave each interior more than once
- verify movement still works after toggling HUD and after any dialogue
