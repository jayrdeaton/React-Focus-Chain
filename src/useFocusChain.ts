import { useRef } from 'react'

type Focusable = { focus: () => void }

export type FocusChainRef = (el: Focusable | null) => void

export type RegistrationProps = {
  blurOnSubmit: boolean
  onSubmitEditing: () => void
  focus: () => void
}

// A named { ref, props } object, not a [ref, props] tuple — a tuple only communicates "ref is
// first" positionally, forcing every call site to already know or look up which slot is which.
// Naming the two keys keeps that same guarantee (ref stays a genuinely separate top-level value,
// never bundled into the same object as the plain reactive props below) self-documenting instead.
export type Registration = {
  ref: FocusChainRef
  props: RegistrationProps
}

export function useFocusChain(): () => Registration {
  const refs = useRef<Map<number, Focusable | null>>(new Map())
  let i = 0

  return function register(): Registration {
    const idx = i++
    return {
      ref: (el: Focusable | null) => refs.current.set(idx, el),
      props: {
        // Single-line TextInput defaults blurOnSubmit to true, so without this the native side
        // blurs (and starts dismissing the keyboard) as part of handling the Return key itself,
        // racing against the focus() call below - the keyboard visibly closes then reopens on the
        // next field instead of staying up continuously. false lets onSubmitEditing hand focus
        // straight to the next field with no native auto-blur in the way.
        blurOnSubmit: false,
        onSubmitEditing: () => refs.current.get(idx + 1)?.focus(),
        focus: () => refs.current.get(idx)?.focus()
      }
    }
  }
}
