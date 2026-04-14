---
name: portfolio-rpg-playtester
description: Use in Felipe Kummer's portfolio RPG repository to launch the local Vite and Phaser game in Playwright, drive the intro to character-select to world flow, probe movement and collisions, test interiors and interactions, and report concrete bugs plus improvement opportunities in gameplay flow, collision feel, and animation behavior. Do not use for unrelated repos.
---

# Portfolio RPG Playtester

Use this skill only in this repository. Treat it as a repo-owned playtesting workflow, not a generic Playwright recipe.

## Workflow

1. Read [references/repo-map.md](references/repo-map.md) before launching the browser.
2. Reset client state before each pass by clearing the portfolio profile `localStorage` key or using a fresh browser context.
3. Launch the game from repo root with the repo's own dev server.
4. Reach a playable world state before judging collisions, animation, or flow.
5. Run focused passes instead of one long exploratory session:
   - intro and onboarding
   - avatar selection with keyboard and mouse
   - world movement and camera feel
   - house entrances, blockers, and diagonal collision behavior
   - interior exits, NPC solids, and sign interactions
   - idle and walk animation coherence
6. Capture evidence:
   - screenshots before and after suspicious movement
   - console errors or page exceptions
   - exact key sequences, hold durations, and approach angles
   - whether the issue reproduces while walking and sprinting
7. Report findings in severity order. Keep broken behavior separate from polish opportunities.

## Quick Start

From repo root:

1. Run `./.codex/skills/portfolio-rpg-playtester/scripts/run-smoke.sh`.
2. Use the smoke pass to confirm the game boots and the main flow still works.
3. For deeper investigation, extend the temporary Playwright probe instead of committing tests by default.

## What To Test

### Flow

- intro dialogue advancement
- name input acceptance and sanitization
- avatar selection with keyboard and mouse
- transition into world
- repeated enter and leave loops for each interior

### Collisions

- world boundaries
- each house entrance from straight and diagonal approaches
- sprinting into walls, corners, and thresholds
- releasing one axis while pressed into a blocker to detect snagging
- NPC and sign solids inside interiors
- exit tiles when leaving interiors

### Animation

- idle animation resumes immediately after movement stops
- walk animation does not continue while blocked against solids
- facing direction stays coherent after dialogue, collision, and scene transitions
- left and right swaps feel visually correct during rapid movement changes

### Interaction And UX

- prompts appear only when the player can act
- dialogue opens and closes reliably
- HUD toggle does not hide critical state permanently
- persistence does not skip required onboarding unexpectedly

## Diagnosis Rules

- Prefer browser evidence over guesses.
- If a collision bug is ambiguous, add a temporary dev-only hook or overlay to inspect player coordinates, scene state, or Arcade body bounds instead of speculating.
- Do not leave temporary probes in the repo unless the user explicitly asks for committed coverage.

## Output

Return:

- findings with severity, reproduction steps, expected behavior, and actual behavior
- likely code areas involved
- a separate list of improvement opportunities for collision feel, animation clarity, and flow
