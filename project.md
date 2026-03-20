# Felipe Kummer Portfolio RPG

## 1. Product Vision

Build a personal portfolio as a playable 2D JRPG-inspired web experience.

The visitor does not land on a normal website first. They enter a short narrative onboarding:

1. A black space backdrop with stars.
2. A retro dialogue box introduces the experience.
3. The visitor types their name.
4. The visitor chooses a boy or girl avatar with keyboard or mouse.
5. The game welcomes them into Felipe Kummer's adventure portfolio.
6. The visitor enters a top-down world and explores it like an old JRPG.

For the first demo, the playable scope is intentionally small:

- Intro sequence
- Name input
- Avatar selection
- Transition into game world
- Character movement
- Basic idle/walk animation
- One small map

Combat should be designed into the architecture now, but not fully implemented in v1.

## 2. Product Goals

- Make the portfolio memorable and personal instead of a standard scrolling page.
- Present Felipe's work through exploration rather than a static UI.
- Keep the first version technically small enough to finish quickly.
- Build the codebase so later features like NPC dialogue, interactive project areas, and turn-based combat can be added without rewriting the core.

## 3. Design Direction

### Experience Tone

- Retro JRPG
- Space-fantasy opening
- Playful, narrative, slightly mysterious
- Strong "start of an adventure" feeling

### Visual Language

- Opening scene: black sky, parallax stars, subtle glow, minimal UI
- Dialogue UI: classic RPG textbox, typewriter effect, small portrait support later
- Character select: clean split layout with two avatars and keyboard focus states
- World scene: colorful pixel-art inspired map with clear interaction zones

### Interaction Rules

- Mouse and keyboard should both work in menu flows
- In-world movement should support arrow keys and `WASD`
- `Enter` / `Space` should confirm interactions
- UI should feel game-first, not like a marketing site with game elements pasted on top

## 4. Recommended Architecture

### Decision

Use a frontend-first architecture built around:

- `Vite` for the app shell and development workflow
- `Phaser 3` for the actual game runtime
- `TypeScript` for all app and game code
- `SQLite` only if and when persistence is truly needed

This should be built as a web app that contains a game, not as a traditional website with heavy game decorations.

### Why Vite

Vite is a strong fit because:

- the experience is primarily client-side
- the game runtime does not need SSR
- setup is simpler than Next.js for this type of app
- the dev loop is fast, which matters when iterating on game feel
- it keeps the architecture focused on the actual product instead of framework features we may not use

Compared with Next.js:

- Vite is lighter and cleaner for a game-first portfolio
- Next.js would matter more if we wanted SEO-heavy content pages, SSR, or built-in API routes from day one
- for the first playable version, those benefits are not essential

### Why Phaser

Phaser is a good fit for this project because:

- 2D top-down movement is straightforward
- sprite animation pipelines are mature
- scene/state systems are well suited for intro -> menu -> world flow
- keyboard input and camera control are already solved problems
- future combat can be added as a separate scene/system

Compared with alternatives:

- Plain React canvas would be more custom work with no benefit here
- Three.js is the wrong abstraction for a 2D JRPG
- Godot Web export is possible, but heavier operationally for a portfolio site and less aligned with a web-native stack

## 5. High-Level System Design

### Layers

#### 1. App Shell Layer

Responsible for:

- bootstrapping the app
- mounting the Phaser game client-side
- handling global CSS and fonts
- hosting any non-game overlay UI if needed later
- providing a clean entrypoint for the portfolio experience

Suggested responsibility boundary:

- the Vite/React shell manages app mounting and non-game wrappers
- Phaser manages gameplay scenes, input, world simulation, dialogue presentation, and transitions inside the experience

#### 2. Game Runtime Layer

Responsible for:

- scenes
- player entity
- map loading
- movement
- animation
- camera
- dialogue state
- interaction triggers
- future battle system

#### 3. Backend/Storage Layer

Initially optional.

Responsible later for:

- visitor session persistence
- contact/messages
- analytics
- save/progress state if desired

For the first demo, persistence can stay in local storage. That is enough.

## 6. Recommended Project Structure

```text
portfolio/
  public/
    assets/
      sprites/
      tilesets/
      maps/
      ui/
      audio/
  src/
    main.tsx
    App.tsx
    styles/
      globals.css
    components/
      game/
        GameCanvas.tsx
        GameLoader.tsx
    game/
      core/
        config.ts
        bootGame.ts
        eventBus.ts
      scenes/
        BootScene.ts
        IntroScene.ts
        CharacterSelectScene.ts
        WorldScene.ts
        BattleScene.ts
      entities/
        Player.ts
      systems/
        input.ts
        movement.ts
        dialogue.ts
        interactions.ts
      data/
        dialogue.ts
        avatars.ts
        maps.ts
      store/
        sessionStore.ts
      types/
        game.ts
  docs/
  index.html
  vite.config.ts
```

Notes:

- `BattleScene.ts` can exist as a placeholder from day one even if unfinished.
- Game state shared across scenes should live in a small store module, not inside one scene.
- Asset paths and content definitions should be data-driven where possible.
- If React starts feeling unnecessary, this structure can be simplified further to a pure Vite + Phaser app later.

## 7. Scene Architecture

### BootScene

Responsibilities:

- preload core assets
- initialize global game state
- route into intro

### IntroScene

Responsibilities:

- render starfield / opening ambience
- run typewriter dialogue
- capture player name
- store chosen name

### CharacterSelectScene

Responsibilities:

- show male/female avatar cards
- allow keyboard and mouse selection
- store avatar choice
- transition into world

### WorldScene

Responsibilities:

- load map
- spawn player
- handle movement and collision
- play idle/walk animations
- allow simple interactive triggers

### BattleScene

Deferred for later phase, but architect now.

Responsibilities later:

- encounter transition
- turn order
- action menu
- enemy/player stats

## 8. State Model

Keep state minimal and explicit.

```ts
type VisitorProfile = {
  visitorName: string;
  avatar: "male" | "female" | null;
};

type GameProgress = {
  introCompleted: boolean;
  characterCreated: boolean;
  currentScene: "intro" | "character-select" | "world" | "battle";
};
```

Suggested storage strategy:

- In-memory store during runtime
- Mirror to `localStorage` for refresh persistence
- Add backend persistence only after there is a concrete use case

## 9. Backend Recommendation

Do not start with a backend for core gameplay.

That would slow down the first milestone with little payoff.

### Best approach for v1

- No mandatory backend
- Local storage for visitor name and avatar
- Simple analytics only if you already know what decisions it will inform

### When a backend becomes useful

- contact/messages form
- admin dashboard for received messages
- analytics beyond pageview-level tracking
- persistent save data across devices
- content management for NPC/project data

### If you want backend soon

Recommended options:

#### Option A: Vite frontend + small Node API + SQLite + Prisma

Best for:

- simple local persistence
- quick iteration
- low complexity

Good tables:

- `visitor_sessions`
- `contact_messages`
- `analytics_events`

Tradeoffs:

- SQLite is fine early, but not ideal if we later move to a more distributed deployment model

#### Option B: Vite frontend + hosted Postgres + Prisma or Supabase

Best for:

- cleaner production path
- easier hosted persistence
- fewer migration concerns later

Tradeoffs:

- heavier setup for an MVP

#### Option C: No custom DB yet

Use:

- local storage
- Plausible or Umami
- a simple form/email service later if needed

This is my recommendation for the first milestone.

## 10. Analytics Recommendation

Keep analytics light and respectful.

Track only high-value events such as:

- portfolio started
- name entered
- avatar selected
- world entered
- project interaction triggered
- contact interaction opened

Recommended approach:

- start with privacy-friendly analytics like Plausible or Umami
- only add custom event storage if you need deeper funnel analysis

## 11. MVP Scope

### Must Have

- Responsive shell
- Phaser embedded in app
- Intro text sequence
- Name input
- Avatar selection
- Scene transitions
- One top-down map
- Character movement
- Camera follow
- Walk/idle animations

### Should Have

- Sound toggle
- Simple interaction prompt
- One NPC or one signpost
- Local storage for visitor profile

### Not In First Demo

- full combat
- inventory
- quest system
- deep persistence
- authentication
- admin CMS
- multiplayer

## 12. Technical Principles

- Keep gameplay logic separate from shell/UI logic
- Prefer scene-specific responsibilities over one giant scene
- Use data files for dialogue and content so writing content is easy later
- Build combat as an extension, not something tightly coupled to map movement
- Keep asset loading organized from the start
- Do not introduce backend complexity before there is a clear product need

## 13. Risks And Mitigations

### Risk: Scope explosion

Mitigation:

- treat v1 as a polished vertical slice, not a full game

### Risk: Phaser and React lifecycle conflicts

Mitigation:

- mount Phaser only once
- keep one controlled game instance
- keep the React shell thin

### Risk: Art pipeline delay

Mitigation:

- use placeholder assets for gameplay first
- replace art later without changing scene logic

### Risk: Combat slows delivery

Mitigation:

- define battle interfaces now, postpone implementation

## 14. Phased Delivery Plan

### Phase 1: Foundation

- initialize Vite + TypeScript project
- mount Phaser client-side
- create scene pipeline
- setup asset folders and base config

### Phase 2: Onboarding Flow

- build starfield intro
- typewriter dialogue system
- name input flow
- avatar selection flow
- persist visitor profile locally

### Phase 3: World Slice

- create one small map
- implement player movement
- implement animations
- add collision and camera

### Phase 4: Portfolio Layer

- convert world areas into portfolio content zones
- create NPCs/signs for projects, about, skills, contact
- add interaction prompts and dialogue panels

### Phase 5: Battle Prototype

- build battle scene entry and exit
- create one mock battle loop
- use it as a portfolio storytelling device, not a full RPG system

## 15. Portfolio Content Mapping

A good long-term structure is to map portfolio sections into world spaces:

- Home village / spawn zone = introduction
- Guild board = projects
- Library = skills / tech stack
- Tavern NPC = about me
- Castle / boss gate = major flagship project
- Shrine / terminal = contact

This gives the portfolio structure without needing traditional page sections.

## 16. Recommendation Summary

Recommended stack:

- Vite
- TypeScript
- Phaser 3
- localStorage for MVP persistence
- optional Prisma + SQLite later
- privacy-friendly analytics instead of heavy custom analytics first

Recommended implementation strategy:

- build the intro and movement slice first
- avoid backend work until there is a real need
- architect for combat, but do not build combat in the first milestone

## 17. First Build Target

The first playable demo should be:

"A visitor enters a starfield intro, types their name, picks an avatar, and walks around a small world as the protagonist of Felipe Kummer's portfolio."

If this slice feels polished, the project is on the right track.
