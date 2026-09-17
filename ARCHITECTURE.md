
# Pirate Battle — Architecture

## 1. Project Overview

Pirate Battle is a single-player 2D naval shooter developed with React, TypeScript, and PixiJS.

The application is divided into two main responsibilities:

- React manages menus, configuration screens, HUD panels, dialogs, and remote data.
- PixiJS renders the game arena, entities, projectiles, and visual effects.

The gameplay simulation remains independent from React rendering.

## 2. Main Architectural Areas

### React Application

Responsible for:

- Main menu
- Options screen
- Game screen
- Result screen
- Ranking screen
- Match history screen
- Accessibility and responsive interface
- Displaying game state summaries

### Game Simulation

Responsible for:

- Player movement and rotation
- Enemy behavior
- Projectile movement
- Collision detection
- Damage and destruction
- Enemy spawning
- Score calculation
- Match timing
- Pause and resume rules

The simulation must not depend on React component rendering.

### PixiJS Rendering

Responsible for:

- Arena rendering
- Ships
- Islands
- Projectiles
- Visual effects
- Health indicators

Rendering reads the simulation state but does not define gameplay rules.

### Network Services

Responsible for:

- Ranking requests
- Match history requests
- Match registration
- Error handling
- Retry and pending registration recovery

Axios will be used for HTTP communication.

TanStack Query will manage remote queries, caching, invalidation, and mutations.

### Local Storage

Responsible for:

- Persisting gameplay options
- Persisting the last completed match
- Persisting confirmed match records
- Persisting pending match registrations

## 3. Configuration

Gameplay parameters will be centralized in a typed configuration.

Each match will receive a configuration snapshot when it starts.

Changes made in the Options screen will affect future matches and will not modify an active match.

## 4. Simulation

The simulation will be time-based rather than frame-dependent.

Movement, cooldowns, spawning, and damage calculations must use elapsed time.

The simulation must pause when:

- The player manually pauses the game.
- The browser tab becomes hidden.
- The game loses the required focus.

Resuming requires an explicit player action.

The simulation must not accumulate movement or firing actions while paused.

## 5. React and PixiJS Integration

React will control the lifecycle of the game screen.

The PixiJS application must:

- Initialize correctly.
- Load required assets before gameplay starts.
- Register and remove listeners correctly.
- Start and stop its ticker correctly.
- Release resources when the game screen is exited.
- Work correctly with React Strict Mode.

React should not re-render every simulation frame.

The game will expose only the state required by the interface, such as:

- Remaining player health
- Score
- Remaining match time
- Pause status
- Match status

## 6. Network and Persistence

Ranking and match history will use mocked REST APIs through MSW.

The mock layer will be shared between development and testing.

The system must support:

- Successful requests
- Empty results
- Pagination
- Latency
- Timeouts
- HTTP errors
- Pending registration recovery
- Duplicate registration prevention

A completed match must produce only one logical registration.

## 7. Testing Strategy

Playwright will be used for end-to-end tests.

Tests will cover:

- Navigation
- Options persistence
- Gameplay controls
- Collisions
- Combat
- Enemy behavior
- Pause and resume
- Match completion
- Ranking and history
- Network failure recovery
- Responsive layouts

Tests should use controlled time and deterministic scenarios whenever possible.

## 8. Initial Technical Decisions

- React is responsible for the application interface.
- PixiJS is responsible for game rendering.
- Gameplay rules are separated from rendering.
- TypeScript strict mode is enabled.
- Gameplay configuration is centralized and typed.
- Match configuration is captured as a snapshot at match start.
- Network failures must not prevent the player from accessing the game.
- Local persistence is used for options and pending registrations.

## 9. Known Future Decisions

## 10. Current MVP Implementation Notes

- `App` owns a small screen union and mounts `GameCanvas` only during gameplay. Leaving the game runs the existing PixiJS cleanup.
- `gameStateStore.ts` exposes only HUD values. `useSyncExternalStore` prevents React from owning the continuous simulation.
- Enemy spawn validation lives in `src/game/systems/enemySpawn.ts`. Spawned enemies are tracked separately from the initial Chaser and Shooter to keep this MVP change incremental.
- Pause uses the existing `GameStatus` transitions. Escape, the HUD button, window blur, and hidden-tab events clear movement input; the ticker returns before advancing simulation time or cooldowns.
- Options are persisted defensively in `src/services/storage/gameOptions.ts`. `App` creates a configuration snapshot before mounting each match.
- Ranking and Match History use Axios clients, TanStack Query hooks, and MSW browser handlers. Match registration is deduplicated by `matchId` in the mock handler.
- Touch controls dispatch the same logical actions used by the keyboard path through Pointer Events.
- The current asset integration is intentionally limited: the water tile is loaded through PixiJS with a fallback, while gameplay entities remain `Graphics` until a broader texture migration is safe.
- The current asset integration uses cached PNG textures for ships, projectiles, islands, and water, with per-asset `Graphics` fallbacks. Sprite rotation is a rendering correction; simulation vectors remain unchanged.
- Enemy movement validates the next position against island geometry before committing it, while player and projectile collision rules remain in the existing pure collision system.
- The HUD includes player/enemy health bars, a pause overlay, and short impact feedback; full audio and particle systems remain outside the MVP.

## 10. Current MVP Implementation Notes

- `App` owns a small screen union and mounts `GameCanvas` only during gameplay. Leaving the game therefore runs the existing PixiJS cleanup.
- `gameStateStore.ts` exposes only HUD values. `useSyncExternalStore` prevents React from owning the continuous simulation.
- Enemy spawn validation lives in `src/game/systems/enemySpawn.ts`. Spawned enemies are tracked separately from the initial Chaser and Shooter to keep this MVP change incremental.
- Pause is driven by the existing `GameStatus` transitions. Escape, the HUD button, window blur, and hidden-tab events clear movement input; the ticker returns before advancing simulation time or cooldowns.
- Options are persisted defensively in `src/services/storage/gameOptions.ts`. `App` creates a configuration snapshot before mounting each match.
- Ranking and Match History use Axios clients, TanStack Query hooks, and MSW browser handlers. Match registration is deduplicated by `matchId` in the mock handler.
- Touch controls dispatch the same logical actions used by the keyboard path through Pointer Events.
- The current asset integration is intentionally limited: the water tile is loaded through PixiJS with a fallback, while gameplay entities remain `Graphics` until a broader texture migration is safe.

The following details will be defined during implementation:

- Exact entity data structures
- Collision detection strategy
- Spatial optimization strategy
- Rendering synchronization method
- Touch control layout
- Network scenario selection interface
- Match ranking tie-breaker
- Performance measurement methodology