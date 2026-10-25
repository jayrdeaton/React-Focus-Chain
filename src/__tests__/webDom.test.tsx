/** @jest-environment jsdom */
import { fireEvent, render } from '@testing-library/react'

import { useFocusChain } from '../useFocusChain'

function WebForm() {
  const register = useFocusChain()
  // Destructured, as the README shows: ref={first.ref} would trip react-hooks/refs (see
  // compilerLint.test.ts)
  const { ref: firstRef, props: first } = register()
  const { ref: secondRef, props: second } = register()
  return (
    <>
      <input data-testid='a' onKeyDown={(e) => e.key === 'Enter' && first.onSubmitEditing()} ref={firstRef} />
      <input data-testid='b' onKeyDown={(e) => e.key === 'Enter' && second.onSubmitEditing()} ref={secondRef} />
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
