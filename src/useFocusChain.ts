import { useRef } from 'react'

type Focusable = { focus: () => void }

export type FocusChainRef = (el: Focusable | null) => void

export type RegistrationProps = {
  blurOnSubmit: boolean
  onSubmitEditing: () => void
  focus: () => void
}

export type Registration = readonly [FocusChainRef, RegistrationProps]

export function useFocusChain(): () => Registration {
  const refs = useRef<Map<number, Focusable | null>>(new Map())
  let i = 0

  return function register(): Registration {
    const idx = i++
    return [
      (el: Focusable | null) => refs.current.set(idx, el),
      {
        // Single-line TextInput defaults blurOnSubmit to true, so without this the native side
        // blurs (and starts dismissing the keyboard) as part of handling the Return key itself,
        // racing against the focus() call below - the keyboard visibly closes then reopens on the
        // next field instead of staying up continuously. false lets onSubmitEditing hand focus
        // straight to the next field with no native auto-blur in the way.
        blurOnSubmit: false,
        onSubmitEditing: () => refs.current.get(idx + 1)?.focus(),
        focus: () => refs.current.get(idx)?.focus()
      }
    ] as const
  }
}
