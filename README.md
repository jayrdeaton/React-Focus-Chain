# @rific/focus-chain

A React hook that wires up return-key focus chaining across form inputs with no explicit indices or refs.

**[Live demo](https://rific.jaydeaton.com/demos/focus-chain)**

## Installation

```sh
npm install @rific/focus-chain
```

## Usage

Call `register()` once per input in render order. It returns `{ ref, props }`: destructure it, pass the ref to the input's `ref` prop, and spread the props for the rest.

```tsx
import { useFocusChain } from '@rific/focus-chain'

function MyForm() {
  const register = useFocusChain()
  const { ref: firstRef, props: first } = register()
  const { ref: lastRef, props: last } = register()
  const { ref: emailRef, props: email } = register()

  return (
    <>
      <TextInput ref={firstRef} {...first} returnKeyType='next' placeholder='First name' />
      <TextInput ref={lastRef} {...last} returnKeyType='next' placeholder='Last name' />
      <TextInput ref={emailRef} {...email} returnKeyType='done' placeholder='Email' />
    </>
  )
}
```

Pressing return on any input automatically focuses the next one. The last input receives no `onSubmitEditing` target, so nothing happens (pair it with `returnKeyType='done'` and your own submit handler).

## Plain React / web

The hook has no React Native dependency - its only requirement is elements exposing `focus()`, which DOM inputs do. On the web, wire `onSubmitEditing` to the Enter key yourself:

```tsx
function WebForm() {
  const register = useFocusChain()
  const { ref: firstRef, props: first } = register()
  const { ref: secondRef, props: second } = register()

  return (
    <>
      <input ref={firstRef} onKeyDown={(e) => e.key === 'Enter' && first.onSubmitEditing()} />
      <input ref={secondRef} onKeyDown={(e) => e.key === 'Enter' && second.onSubmitEditing()} />
    </>
  )
}
```

## React Compiler

Destructure the registration rather than writing `ref={email.ref}`. The React Compiler's `react-hooks/refs` lint rule checks each component on its own, so it can't see that `register()` hands back plain callbacks: it treats any `object.property` passed to a `ref` prop as reading a ref during render, then flags every other read of that object too (`email.props.onSubmitEditing` included). That happens with any object, not just this hook's. A destructured ref is a plain local, which the rule accepts, and a component that passes the rule is one the compiler can optimize rather than skip.

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

`ref` goes on the input's `ref` prop (destructured first, see React Compiler above); `props` is meant to be spread directly onto the input component. `blurOnSubmit` is always `false`: React Native's `TextInput` defaults it to `true` for single-line fields, which blurs (and starts dismissing the keyboard) as part of handling the return key itself, racing against the `focus()` call this hook makes on the next field. Without it, the keyboard visibly closes and reopens between fields instead of staying up.

## Notes

- **Stable render trees only**: inputs registered conditionally (e.g. inside `{show && ...}`) will shift indices when the condition changes. For conditional inputs, split them into separate chains or always render with `editable={false}`.
- Works with any focusable component, not just React Native `TextInput`.
