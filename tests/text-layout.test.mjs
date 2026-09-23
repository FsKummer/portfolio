import assert from 'node:assert/strict'
import { test } from 'node:test'
import { paginateText } from '../src/game/core/ui.ts'

test('dialogue pages use measured height, retain every wrapped line, and restore the text node', () => {
  const text = {
    text: 'Previously visible text',
    height: 38,
    getWrappedText: (value) => value.split('\n'),
    setText(value) {
      this.text = value
      this.height = value.split('\n').length * 30 + 8
      return this
    },
  }
  const message = 'Welcome, traveler.\nConhecimento e ação.\nUna nueva aventura.\n\nYour reward awaits.'
  const pages = paginateText(text, message, 68)
  assert.deepEqual(pages, ['Welcome, traveler.\nConhecimento e ação.', 'Una nueva aventura.', 'Your reward awaits.'])
  assert.equal(text.text, 'Previously visible text')
  for (const page of pages) {
    text.setText(page)
    assert.ok(text.height <= 68, 'text must leave room for the prompt below it')
  }
  assert.deepEqual(paginateText(text, '   ', 68), [''])
})
