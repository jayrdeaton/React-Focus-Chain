import { renderHook } from '@testing-library/react'

import { useFocusChain } from '../useFocusChain'

describe('useFocusChain', () => {
  it('returns a register function', () => {
    const { result } = renderHook(() => useFocusChain())
    expect(typeof result.current).toBe('function')
  })

  it('register() returns ref and onSubmitEditing', () => {
    const { result } = renderHook(() => {
      const register = useFocusChain()
      return register()
    })
    expect(typeof result.current.ref).toBe('function')
    expect(typeof result.current.onSubmitEditing).toBe('function')
  })

  it('onSubmitEditing focuses the next input', () => {
    const { result } = renderHook(() => {
      const register = useFocusChain()
      return [register(), register()] as const
    })

    const mockFocus = jest.fn()
    result.current[1].ref({ focus: mockFocus })
    result.current[0].onSubmitEditing()

    expect(mockFocus).toHaveBeenCalledTimes(1)
  })

  it('onSubmitEditing at last index does nothing', () => {
    const { result } = renderHook(() => {
      const register = useFocusChain()
      return register()
    })
    expect(() => result.current.onSubmitEditing()).not.toThrow()
  })

  it('ref(null) clears the stored element', () => {
    const { result } = renderHook(() => {
      const register = useFocusChain()
      return [register(), register()] as const
    })

    const mockFocus = jest.fn()
    result.current[1].ref({ focus: mockFocus })
    result.current[1].ref(null)
    result.current[0].onSubmitEditing()

    expect(mockFocus).not.toHaveBeenCalled()
  })

  // Regression test: without this, single-line TextInput's default blurOnSubmit=true races the
  // native auto-blur against our own focus() call on the next field, closing the keyboard and
  // reopening it instead of handing focus straight across.
  it('register() returns blurOnSubmit: false, so native auto-blur never races the focus handoff', () => {
    const { result } = renderHook(() => {
      const register = useFocusChain()
      return register()
    })
    expect(result.current.blurOnSubmit).toBe(false)
  })
})
