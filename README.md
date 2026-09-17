# Pirate Battle

Pirate Battle is a top-down 2D naval shooter built with React, TypeScript, and PixiJS.

## Run locally

```text
npm install
npm run dev
```

## Commands

```text
npm test
npm run lint
npm run build
npm run preview
npm run test:e2e
```

## Controls

- `W`, `ArrowUp`: move forward.
- `A`, `ArrowLeft`: turn left.
- `D`, `ArrowRight`: turn right.
- `Space`: frontal fire.
- `Shift`: lateral fire.
- `Escape`: pause or resume.
- Touch controls are available on coarse-pointer and narrow screens.

## MVP features

- PixiJS arena with player, islands, projectiles, Chasers, and Shooters.
- Configurable match duration and enemy spawn interval.
- Persistent Options using `localStorage`.
- Pause by key, button, window blur, or hidden tab.
- Mocked Ranking and Match History using Axios, TanStack Query, and MSW.
- Idempotent match registration by `matchId`.
- React HUD and result screen separate from PixiJS rendering.

## Options

`Game session time` is clamped to 60-180 seconds. `Enemy spawn time` is clamped to 1-30 seconds. Values are saved locally and copied into an immutable match configuration when `Play` is selected.

## Known limitations

- The current renderer still uses simple PixiJS `Graphics` for ships and entities. The water tile is loaded from `assets/` with a color fallback.
- Ranking and history use browser MSW fixtures and local in-memory mock data; they are not a remote service.
- Playwright currently covers the primary navigation flow. Combat and mobile scenarios still need broader coverage.
- Deploy configuration is not connected to a provider account.

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
