import test from 'node:test'
import assert from 'node:assert/strict'

import resources from '../resources.js'

test('should have json adapter as commonjs', () => {
  assert.equal(typeof resources, 'object')
  assert.equal(typeof resources.adapters.json, 'object')
  assert.equal(typeof resources.adapters.json.send, 'function')
})
