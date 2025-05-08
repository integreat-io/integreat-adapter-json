import test from 'node:test'
import assert from 'node:assert/strict'

import adapter from '../index.js'

test('should be adapter', () => {
  assert.equal(typeof adapter(), 'object')
  assert.equal(typeof adapter().send, 'function')
})
