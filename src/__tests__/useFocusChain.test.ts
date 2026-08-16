import { renderHook } from '@testing-library/react'

import { useFocusChain } from '../useFocusChain'

describe('useFocusChain', () => {
  it('returns a register function', () => {
    const { result } = renderHook(() => useFocusChain())
    expect(typeof result.current).toBe('function')
  })

  it('register() returns a [ref, props] tuple with onSubmitEditing', () => {
    const { result } = renderHook(() => {
      const register = useFocusChain()
      return register()
    })
    const [ref, props] = result.current
    expect(typeof ref).toBe('function')
    expect(typeof props.onSubmitEditing).toBe('function')
  })

  it('onSubmitEditing focuses the next input', () => {
    const { result } = renderHook(() => {
      const register = useFocusChain()
      return [register(), register()] as const
    })

    const mockFocus = jest.fn()
    const [[, firstProps], [secondRef]] = result.current
    secondRef({ focus: mockFocus })
    firstProps.onSubmitEditing()

    expect(mockFocus).toHaveBeenCalledTimes(1)
  })

  it('onSubmitEditing at last index does nothing', () => {
    const { result } = renderHook(() => {
      const register = useFocusChain()
      return register()
    })
    const [, props] = result.current
    expect(() => props.onSubmitEditing()).not.toThrow()
  })

  it('ref(null) clears the stored element', () => {
    const { result } = renderHook(() => {
      const register = useFocusChain()
      return [register(), register()] as const
    })

    const mockFocus = jest.fn()
    const [[, firstProps], [secondRef]] = result.current
    secondRef({ focus: mockFocus })
    secondRef(null)
    firstProps.onSubmitEditing()

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
    const [, props] = result.current
    expect(props.blurOnSubmit).toBe(false)
  })
})
