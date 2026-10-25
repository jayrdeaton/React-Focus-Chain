# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# React-Native-Focus-Chain

Standalone React hook for wiring return-key focus chains across form inputs. Published as `@rific/focus-chain` on npm. Part of the `@rific/` package ecosystem - see also `@rific/react-native-resizable-input` (`../React-Native-Resizable-Input`).

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
- `simple-import-sort` - imports and exports must be sorted
- `no-console` - no console statements
- `react-hooks/rules-of-hooks` - error (not a warning); the rest of the `react-hooks` and `react-native` rule sets apply too, at warn

## Architecture

Single hook, single file: `src/useFocusChain.ts`.

`useFocusChain()` returns a `register` function. Each call to `register()` during render auto-increments an index and returns a `Registration`: `{ ref, props }`, where `ref` is a separate top-level key (not bundled into `props`) and `props` holds `{ blurOnSubmit, onSubmitEditing, focus }` to spread onto the input. `i` resets to 0 on every render; `refs` is stable via `useRef`. This means render order determines chain order - works correctly for stable trees, breaks for conditional inputs.

**Call sites destructure the registration** (`const { ref: emailRef, props: email } = register()`), and the README and tests do too. The React Compiler's `react-hooks/refs` rule (eslint-plugin-react-hooks 7) checks each component alone, so nothing in this hook's body can change what it reports: it treats any `ref={x.y}` as reading a ref during render and then flags every other read of `x` (`x.props.onSubmitEditing`), even for a plain object literal or a prop. A destructured `ref` is a plain local it accepts. The `[ref, props]` tuple of 0.4.0 and 0.4.1 was clean for the same reason; 0.4.2's switch to `{ ref, props }`, with `ref={first.ref}` in the README, brought the warnings back (Lumber had 10, two per field). `src/__tests__/compilerLint.test.ts` lints both forms with the real rule.

Uses a generic `Focusable` type (`{ focus: () => void }`) instead of importing from react-native, so the only peer dep is `react`.

## Publishing

```bash
npm run release:patch   # bump patch, push tags
npm run release:minor   # bump minor, push tags
npm run release:major   # bump major, push tags
```

`prepublishOnly` runs `build` automatically. `preversion` runs `verify` (lint + test + typecheck + build).
