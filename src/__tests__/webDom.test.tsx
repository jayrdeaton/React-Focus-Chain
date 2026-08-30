/** @jest-environment jsdom */
import { fireEvent, render } from '@testing-library/react'

import { useFocusChain } from '../useFocusChain'

function WebForm() {
  const register = useFocusChain()
  const first = register()
  const second = register()
  // first.ref/second.ref are callback refs (see useFocusChain.ts) - React invokes them on
  // mount/unmount, not during render, so this isn't the ref.current-during-render pattern
  // react-hooks/refs exists to catch; the rule's heuristics false-positive on a custom hook
  // returning a callback ref through a wrapper object.
  return (
    <>
      {/* eslint-disable-next-line react-hooks/refs */}
      <input data-testid='a' onKeyDown={(e) => e.key === 'Enter' && first.props.onSubmitEditing()} ref={first.ref} />
      {/* eslint-disable-next-line react-hooks/refs */}
      <input data-testid='b' onKeyDown={(e) => e.key === 'Enter' && second.props.onSubmitEditing()} ref={second.ref} />
    </>
  )
}

describe('plain React (DOM) support', () => {
  it('advances focus between plain DOM inputs on Enter', () => {
    const { getByTestId } = render(<WebForm />)
    const a = getByTestId('a') as unknown as { focus: () => void }
    const b = getByTestId('b') as unknown as { focus: () => void }
    a.focus()
    expect(document.activeElement).toBe(a)
    fireEvent.keyDown(getByTestId('a'), { key: 'Enter' })
    expect(document.activeElement).toBe(b)
  })
})
