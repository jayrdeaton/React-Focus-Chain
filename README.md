# @rific/focus-chain

A React hook that wires up return-key focus chaining across form inputs with no explicit indices or refs.

## Installation

```sh
npm install @rific/focus-chain
```

## Usage

Call `register()` once per input in render order. It returns `{ ref, props }` — pass `ref` to the input's `ref` prop, and spread `props` for the rest. Keeping the ref out of the props object (as its own named key, not bundled in) is what keeps this safe under the React Compiler: bundling a callback-ref together with plain fields in one object causes the compiler to treat every field as a ref read.

```tsx
import { useFocusChain } from '@rific/focus-chain'

function MyForm() {
  const register = useFocusChain()
  const first = register()
  const last = register()
  const email = register()

  return (
    <>
      <TextInput ref={first.ref} {...first.props} returnKeyType='next' placeholder='First name' />
      <TextInput ref={last.ref} {...last.props} returnKeyType='next' placeholder='Last name' />
      <TextInput ref={email.ref} {...email.props} returnKeyType='done' placeholder='Email' />
    </>
  )
}
```

Pressing return on any input automatically focuses the next one. The last input receives no `onSubmitEditing` target, so nothing happens (pair it with `returnKeyType='done'` and your own submit handler).

## Plain React / web

The hook has no React Native dependency — its only requirement is elements exposing `focus()`, which DOM inputs do. On the web, wire `onSubmitEditing` to the Enter key yourself:

```tsx
function WebForm() {
  const register = useFocusChain()
  const first = register()
  const second = register()

  return (
    <>
      <input ref={first.ref} onKeyDown={(e) => e.key === 'Enter' && first.props.onSubmitEditing()} />
      <input ref={second.ref} onKeyDown={(e) => e.key === 'Enter' && second.props.onSubmitEditing()} />
    </>
  )
}
```

## API

### `useFocusChain(): () => Registration`

Returns a `register` function. Call `register()` once per input during render, in the order inputs should be focused.

### `Registration`

```ts
type Registration = {
  ref: (el: { focus: () => void } | null) => void
  props: {
    blurOnSubmit: boolean
    onSubmitEditing: () => void
    focus: () => void
  }
}
```

`ref` goes on the input's `ref` prop; `props` is meant to be spread directly onto the input component. `blurOnSubmit` is always `false`: React Native's `TextInput` defaults it to `true` for single-line fields, which blurs (and starts dismissing the keyboard) as part of handling the return key itself, racing against the `focus()` call this hook makes on the next field. Without it, the keyboard visibly closes and reopens between fields instead of staying up.

## Notes

- **Stable render trees only** — inputs registered conditionally (e.g. inside `{show && ...}`) will shift indices when the condition changes. For conditional inputs, split them into separate chains or always render with `editable={false}`.
- Works with any focusable component, not just React Native `TextInput`.
