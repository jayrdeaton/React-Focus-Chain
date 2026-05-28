# @rific/focus-chain

A React hook that wires up return-key focus chaining across form inputs with no explicit indices or refs.

## Installation

```sh
npm install @rific/focus-chain
```

## Usage

Call `register()` once per input in render order. It returns `ref` and `onSubmitEditing` as spreadable props — no index tracking required.

```tsx
import { useFocusChain } from '@rific/focus-chain'

function MyForm() {
  const register = useFocusChain()

  return (
    <>
      <TextInput {...register()} returnKeyType='next' placeholder='First name' />
      <TextInput {...register()} returnKeyType='next' placeholder='Last name' />
      <TextInput {...register()} returnKeyType='done' placeholder='Email' />
    </>
  )
}
```

Pressing return on any input automatically focuses the next one. The last input receives no `onSubmitEditing` target, so nothing happens (pair it with `returnKeyType='done'` and your own submit handler).

## API

### `useFocusChain(): () => Registration`

Returns a `register` function. Call `register()` once per input during render, in the order inputs should be focused.

### `Registration`

```ts
type Registration = {
  ref: (el: { focus: () => void } | null) => void
  onSubmitEditing: () => void
  focus: () => void
}
```

Both props are spread directly onto the input component.

## Notes

- **Stable render trees only** — inputs registered conditionally (e.g. inside `{show && ...}`) will shift indices when the condition changes. For conditional inputs, split them into separate chains or always render with `editable={false}`.
- Works with any focusable component, not just React Native `TextInput`.
