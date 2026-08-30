# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# React-Native-Focus-Chain

Standalone React hook for wiring return-key focus chains across form inputs. Published as `@rific/focus-chain` on npm. Part of the `@rific/` package ecosystem — see also `@rific/react-native-resizable-input` (`../React-Native-Resizable-Input`).

## Commands

```bash
npm run lint      # ESLint check
npm run fix       # Auto-fix lint issues
npm run build     # tsup → dist/ (CJS + ESM + .d.ts)
npm test          # Jest
npm run typecheck # tsc --noEmit
```

Always run `npm run lint` before finishing any task.

## Code Style

Enforced by ESLint + Prettier.

**Prettier config:**
- Single quotes, JSX single quotes
- No semicolons
- No trailing commas
- Print width: 1000 (effectively disabled)

**ESLint rules (warnings):**
- `simple-import-sort` — imports and exports must be sorted
- `no-console` — no console statements
- `react-hooks/rules-of-hooks` — error (not a warning); the rest of the `react-hooks` and `react-native` rule sets apply too, at warn

## Architecture

Single hook, single file: `src/useFocusChain.ts`.

`useFocusChain()` returns a `register` function. Each call to `register()` during render auto-increments an index and returns a `Registration`: `{ ref, props }`, where `ref` is a separate top-level key (not bundled into `props`) and `props` holds `{ blurOnSubmit, onSubmitEditing, focus }` to spread onto the input. `i` resets to 0 on every render; `refs` is stable via `useRef`. This means render order determines chain order — works correctly for stable trees, breaks for conditional inputs.

Uses a generic `Focusable` type (`{ focus: () => void }`) instead of importing from react-native, so the only peer dep is `react`.

## Publishing

```bash
npm run release:patch   # bump patch, push tags
npm run release:minor   # bump minor, push tags
npm run release:major   # bump major, push tags
```

`prepublishOnly` runs `build` automatically. `preversion` runs `verify` (lint + test + typecheck + build).
