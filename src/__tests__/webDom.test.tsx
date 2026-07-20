/** @jest-environment jsdom */
import { fireEvent, render } from '@testing-library/react'

import { useFocusChain } from '../useFocusChain'

// tsconfig lib is ES2020 (no DOM) — declare the one global this test touches
declare const document: { activeElement: unknown }

function WebForm() {
  const register = useFocusChain()
  const first = register()
  const second = register()
  return (
    <>
      <input data-testid='a' onKeyDown={(e) => e.key === 'Enter' && first.onSubmitEditing()} ref={first.ref} />
      <input data-testid='b' onKeyDown={(e) => e.key === 'Enter' && second.onSubmitEditing()} ref={second.ref} />
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
