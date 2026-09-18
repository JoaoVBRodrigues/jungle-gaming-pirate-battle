
# Pirate Battle

A browser-based top-down naval shooter developed as a technical challenge for the Junior Frontend Game Developer position at Jungle Gaming.

## Live Demo

**[Play Pirate Battle](https://jungle-gaming-pirate-battle.vercel.app/)**

The application is deployed on Vercel and runs entirely in the browser. Ranking and match history use REST API mocks powered by MSW, without requiring a private backend.

## Tech Stack

- React
- TypeScript (strict mode)
- PixiJS
- TanStack Query
- Axios
- MSW
- Vitest
- Playwright
- Vite

## Features

- Top-down 2D naval shooter gameplay.
- Player movement, rotation, and combat.
- Front firing and left/right broadside attacks.
- Chaser and Shooter enemy types.
- Island collision detection for ships and projectiles.
- Enemy health bars and visual damage feedback.
- Shooting and destruction effects.
- Configurable match duration and enemy spawn interval.
- Manual and automatic pause handling.
- Keyboard and touch controls.
- Ranking and paginated match history.
- Mocked network scenarios for success, latency, timeouts, and errors.
- Persistent options and pending match registration recovery.
- Responsive desktop and mobile interface.
- Unit tests, Playwright E2E tests, and profiling.

## Setup

### Requirements

- Node.js
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The MSW browser worker is started by `src/main.tsx`. This allows ranking and match history to work during development, preview, and production builds without a private backend.

## Available Commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run profile
```

The `profile` command builds the application, starts a preview server, samples animation frames in Chromium, and reports performance measurements such as average FPS, frame-time p95, and available JavaScript heap information.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move forward | `W` / `ArrowUp` | Movement control |
| Turn left | `A` / `ArrowLeft` | Left movement control |
| Turn right | `D` / `ArrowRight` | Right movement control |
| Front fire | `Space` | Fire control |
| Left broadside | `Q` | Left attack control |
| Right broadside | `E` | Right attack control |
| Pause / Resume | `Escape` | Pause button |

The player can move and fire simultaneously. Touch controls are available on coarse pointer devices.

## Gameplay Configuration

Gameplay options are persisted in `localStorage`.

Available options:

- **Game session time:** 60–180 seconds.
- **Enemy spawn interval:** 1–30 seconds.

Each match receives an immutable configuration snapshot when the player selects **Play**. Balance parameters are centralized in:

```text
src/game/config/gameConfig.ts
```

Changes to the configuration apply to new matches and do not modify an ongoing match.

## Gameplay Rules

- Each enemy destroyed by the player's attacks awards 1 point.
- A Chaser that self-destructs by colliding with the player does not award a point.
- The match ends when the timer reaches zero or the player's health reaches zero.
- Movement, attacks, damage, spawning, and scoring stop when the match ends.
- Restarting creates a new match with a reset timer, health, score, and entities.
- Manual pause and automatic pause suspend the simulation, cooldowns, and timer.
- Resuming requires an explicit player action.
- Reloading the page or leaving the gameplay screen abandons the current match.
- Abandoned matches are not registered in the ranking or match history.

## Network Scenarios

The Ranking and Match History screens provide a network scenario selector.

Available scenarios:

- `success`
- `empty`
- `paginated`
- `slow`
- `out-of-order`
- `timeout`
- `server-error`
- `connection-error`

Use **Reset Mock Data** to restore the initial fixture data.

The selected scenario is persisted in `localStorage`.

Completed match submissions are saved as pending records before the request is sent. Failed submissions can be retried after a refresh or manually from the match result screen.

Registration is idempotent by `matchId`, preventing duplicate ranking and history entries when a request is retried.

## Architecture

React is responsible for:

- Menus and navigation.
- Forms and options.
- HUD and result dialogs.
- Ranking and match history.
- Remote data queries.
- Accessibility and semantic interface elements.

PixiJS is responsible for:

- Arena rendering.
- Ships and projectiles.
- Visual effects.
- Health indicators.
- Gameplay rendering.

Pure systems under `src/game/systems` handle:

- Movement.
- Enemy steering.
- Projectiles.
- Damage.
- Collisions.
- Enemy spawning.
- Score.
- Match timing.

The continuous gameplay state remains inside the game simulation. React receives coarse-grained HUD updates through an external store instead of re-rendering on every animation frame.

More details are available in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Testing

The project includes:

- Unit tests using Vitest.
- End-to-end tests using Playwright.
- Desktop and mobile test coverage.
- Network failure and recovery scenarios.
- Match registration and retry tests.
- Gameplay and enemy behavior tests.

Run unit tests:

```bash
npm test
```

Run Playwright tests:

```bash
npm run test:e2e
```

Playwright HTML reports are generated by the E2E command. Traces are enabled on the first retry.

## Performance Profiling

Run:

```bash
npm run profile
```

The profiling script measures the game in a Chromium preview environment, including:

- Average FPS.
- Frame-time p95.
- JavaScript heap information.
- Animation frame behavior.

The measured results depend on the hardware, browser, resolution, and game configuration used during profiling.

## Deployment

The application is deployed using Vercel:

**[https://jungle-gaming-pirate-battle.vercel.app/](https://jungle-gaming-pirate-battle.vercel.app/)**

### Vercel Configuration

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

The project does not require private environment variables. MSW serves the demo API from the published application bundle.

The included `vercel.json` defines the Vite output directory.

## Project Structure

```text
src/
├── app/              # Application hooks and state
├── components/       # React UI components
├── game/             # PixiJS rendering and gameplay systems
├── mocks/            # MSW handlers and fixtures
├── services/         # API and local persistence
├── types/            # Shared TypeScript contracts
└── main.tsx          # Application entry point
```

## Delivery Notes

The repository includes:

- Application source code.
- TypeScript configuration.
- Source assets and sound files.
- MSW worker, handlers, and fixtures.
- Package lockfile.
- Unit tests.
- Playwright E2E tests.
- Performance profiling script.
- Architecture documentation.
- Vercel deployment configuration.

The deployed version is available through the Live Demo link at the beginning of this document.

## Documentation

- [Live Demo](https://jungle-gaming-pirate-battle.vercel.app/)
- [Architecture Documentation](./ARCHITECTURE.md)