/** @jest-environment node */
import { Linter, type Rule } from 'eslint'
import reactHooks from 'eslint-plugin-react-hooks'

// The React Compiler's refs rule checks each component on its own, so it only ever sees the call
// site, never this hook's body. These pin the call-site form the README documents.
// The plugin's own types only list its classic rules, not the compiler ones like refs.
const { refs } = reactHooks.rules as Record<string, Rule.RuleModule>
const linter = new Linter()
const config: Linter.Config[] = [
  {
    files: ['**/*.jsx'],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { 'react-hooks': { rules: { refs } } },
    rules: { 'react-hooks/refs': 'error' }
  }
]

function lintForm(body: string) {
  const code = `import { useFocusChain } from '@rific/focus-chain'
export function Form() {
  const register = useFocusChain()
${body}
}`
  const lines = code.split('\n')
  // Each message as the rule and the source it underlines
  return linter.verify(code, config, 'Form.jsx').map((m) => `${m.ruleId}: ${lines[m.line - 1].slice(m.column - 1, m.endColumn && m.endColumn - 1)}`)
}

describe('React Compiler refs rule at the call site', () => {
  it('accepts a destructured registration', () => {
    const messages = lintForm(`  const { ref: emailRef, props: email } = register()
  const { ref: passwordRef, props: password } = register()
  return (
    <>
      <input ref={emailRef} onKeyDown={(e) => e.key === 'Enter' && email.onSubmitEditing()} />
      <TextInput ref={emailRef} {...email} />
      <TextInput ref={passwordRef} onSubmitEditing={password.onSubmitEditing} />
    </>
  )`)
    expect(messages).toEqual([])
  })

  // If this starts failing, the compiler no longer flags ref={x.ref} and the README's advice to
  // destructure can be relaxed.
  it('flags ref={registration.ref} and the reads of registration after it', () => {
    const messages = lintForm(`  const email = register()
  return <TextInput ref={email.ref} onSubmitEditing={email.props.onSubmitEditing} />`)
    expect(messages).toEqual(['react-hooks/refs: email.ref', 'react-hooks/refs: email.props.onSubmitEditing'])
  })
})
