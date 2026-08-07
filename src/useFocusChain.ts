import { useRef } from 'react'

type Focusable = { focus: () => void }

export type Registration = {
  blurOnSubmit: boolean
  ref: (el: Focusable | null) => void
  onSubmitEditing: () => void
  focus: () => void
}

export function useFocusChain(): () => Registration {
  const refs = useRef<Map<number, Focusable | null>>(new Map())
  let i = 0

  return function register(): Registration {
    const idx = i++
    return {
      // Single-line TextInput defaults blurOnSubmit to true, so without this the native side
      // blurs (and starts dismissing the keyboard) as part of handling the Return key itself,
      // racing against the focus() call below - the keyboard visibly closes then reopens on the
      // next field instead of staying up continuously. false lets onSubmitEditing hand focus
      // straight to the next field with no native auto-blur in the way.
      blurOnSubmit: false,
      ref: (el: Focusable | null) => refs.current.set(idx, el),
      onSubmitEditing: () => refs.current.get(idx + 1)?.focus(),
      focus: () => refs.current.get(idx)?.focus()
    }
  }
}
