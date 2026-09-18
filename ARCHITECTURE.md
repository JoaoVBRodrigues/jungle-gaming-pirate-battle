# Pirate Battle Architecture

## Responsibilities

- React owns menus, Options, ranking/history queries, HUD, result state, touch controls, and accessible semantic summaries.
- PixiJS owns the water arena, islands, ships, projectiles, health indicators, impact effects, and cached textures.
- Pure game systems under `src/game/systems` implement movement, steering, projectile creation/movement, damage, collisions, spawning, score, and timing.
- `gameStateStore.ts` exposes only low-frequency HUD state through `useSyncExternalStore`; React does not render every simulation frame.

## Match Lifecycle

`App` creates a fresh configuration snapshot and `matchId` for Play and Play Again. `GameCanvas` initializes Pixi, loads cached textures, registers keyboard/touch/visibility listeners, and attaches one ticker callback. The callback advances active time, movement, cooldowns, spawns, collisions, damage, score, and visuals. Pause clears movement input and returns before advancing time. Finish is idempotent, removes the ticker/listeners, destroys dynamic visuals, and publishes the final HUD state. React unmount then destroys the Pixi application and audio resources.

The ticker caps a single simulation step at 100 ms to avoid teleporting after a long browser frame. Enemy steering tests direct and angular alternatives against island circles and retains the selected side while blocked. Enemy rotation uses the configured rotation speed.

## Assets and Rendering

`gameAssets.ts` loads each PNG once through a cached promise. Missing assets fall back to Graphics. The explosion texture is reused for short-lived impact sprites. Player and enemy health bars use frame/fill textures, clamp `health / maxHealth` to 0-1, and destroy their containers with the entity. The Pixi canvas has an accessible label; HUD values are exposed semantically.

## Network Contracts

Axios calls `/api/ranking` and `/api/matches`. TanStack Query keys include the requested page, retries failed reads once, and invalidates ranking/history after a confirmed registration. MSW provides fixtures, deterministic page slicing, scenario-controlled latency/errors, local persistence, deterministic score/match-id ordering, and idempotent POST behavior.

Network scenarios are selected with `pirate-battle.network-scenario` and exposed in the Ranking/History UI: success, empty, paginated, slow, out-of-order, timeout, server-error, and connection-error.

## Pending Registrations

A completed match payload is stored in `pendingMatches.ts` before the POST. The payload is removed only after a successful response. `useRegisterMatch` retries all persisted payloads on mount, so a refresh from the menu can recover an interrupted submission. `MatchResult` also exposes Retry Save. The mock uses `matchId` as the idempotency key, preventing duplicate history/ranking entries.

## Input

Keyboard listeners are mounted only with the gameplay component. `Space` fires forward; `Q` and `E` fire left/right three-projectile broadsides. Touch buttons dispatch the same logical `game:touch-input` actions. Blur and hidden-tab events pause the game and clear held movement.

## Testing and Profiling

Vitest covers pure systems and pending storage. Playwright covers navigation, Options persistence, paginated/scenario-driven menu states, accessible game surfaces, and mobile controls. `npm run profile` measures 300 Chromium animation frames, frame-time p95, average FPS, and available JS heap data against the production preview.

Known remaining evidence for a final external submission is the generated visual baseline set, a recorded profiling run on reference hardware, and the public Vercel URL.
