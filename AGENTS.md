# AGENTS.md

## Project Status

This project is no longer in architecture exploration mode.

Core technical decisions are fixed unless Felipe explicitly changes them.

## Product Definition

Build a personal portfolio as a playable 2D JRPG-inspired web experience.

The portfolio is game-first, not a conventional website with game-like styling.

The visitor flow is:

1. Visitor lands on a black starfield screen.
2. A retro JRPG-style text sequence starts.
3. The visitor is asked for their name.
4. The visitor chooses a boy or girl avatar.
5. The game welcomes them to Felipe Kummer's adventure portfolio.
6. The visitor enters a top-down 2D world.

## Locked Technical Decisions

The stack for the MVP is:

- Vite
- TypeScript
- Phaser 3
- localStorage

Do not propose or introduce these alternatives unless Felipe explicitly asks:

- Next.js
- backend services
- SQLite
- Prisma
- Supabase
- Postgres
- authentication
- CMS tooling

## Persistence Decision

Persistence for the MVP must use only `localStorage`.

Use it for:

- visitor name
- selected avatar
- lightweight local progress if needed

Do not add a backend for MVP gameplay or MVP persistence.

## Delivery Strategy

The implementation priority is:

1. Build the MVP.
2. Make it playable end-to-end.
3. Polish the game after the MVP works.

Do not expand scope before the MVP is complete.

## MVP Definition

The MVP includes only:

- starfield intro
- retro dialogue flow
- name input
- avatar selection
- transition into the game world
- one small top-down map
- character movement
- idle/walk animation
- basic interaction foundations if they do not delay the core loop

The MVP does not include:

- turn-based combat implementation
- inventory systems
- quests
- online persistence
- analytics backend
- admin tools
- multiplayer

Combat may be planned in code structure, but it must not delay MVP delivery.

## Architecture Rules

Use a thin app shell and keep gameplay logic inside Phaser.

Preferred structure:

- app bootstrap in Vite
- Phaser scenes for flow and gameplay
- small shared store/modules for session data
- asset-driven content where practical

Keep concerns separated:

- shell/bootstrap code should not contain gameplay logic
- scene logic should not depend on React-heavy state patterns
- shared data should be explicit and minimal

## Scene Plan

Current planned scenes:

- `BootScene`
- `IntroScene`
- `CharacterSelectScene`
- `WorldScene`

A future `BattleScene` can exist as a placeholder, but battle implementation is not part of the MVP.

## Interaction Rules

Support both keyboard and mouse where practical.

Expected controls:

- `WASD` and arrow keys for movement
- `Enter` or `Space` for confirm/interaction
- keyboard navigation for menu/select flows

## Design Rules

The experience should feel like a coherent retro adventure.

Design priorities:

- black-space intro with stars
- strong JRPG dialogue presentation
- clear avatar selection states
- readable pixel-inspired world presentation
- game-first presentation instead of standard portfolio layout patterns

Avoid generic SaaS or template-site aesthetics.

## Content Mapping Direction

Portfolio content should later be embedded into the world through places, NPCs, signs, or interaction zones.

Likely mappings:

- spawn area = intro
- project board = projects
- library = skills/stack
- tavern or NPC = about Felipe
- shrine/terminal = contact

## How Codex Should Operate In This Repo

When working in this repository:

- treat the stack choice as fixed
- treat `localStorage` as fixed for MVP persistence
- favor implementation over renewed architecture debate
- avoid re-opening decisions that are already locked here
- keep scope tight and finish playable slices before polish work

If Felipe asks for new architecture discussion, follow the request. Otherwise, execute against these decisions.

## Commit Policy

All commits in this repository must follow the Conventional Commits 1.0.0 format:

- `<type>[optional scope]: <description>`

Use lowercase commit types.

Preferred types in this repository:

- `feat`
- `fix`
- `docs`
- `refactor`
- `style`
- `test`
- `build`
- `chore`

Use a scope when it improves clarity, for example:

- `feat(game): mount phaser scene pipeline`
- `docs(agents): define commit policy`

Use `!` or a `BREAKING CHANGE:` footer only for actual breaking changes.

Keep commits small and meaningful:

- one focused concern per commit
- do not mix unrelated refactors with feature work
- commit working states that build successfully whenever practical

This policy is based on the Conventional Commits 1.0.0 spec:

- https://www.conventionalcommits.org/en/v1.0.0/

## Relationship To project.md

`project.md` is the broader product and architecture spec.

`AGENTS.md` is the execution contract for agent behavior in this repository.
