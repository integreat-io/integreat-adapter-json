import test from 'node:test'
import assert from 'node:assert/strict'

import json from './index.js'

// Setup

const adapter = json()

// Tests

test('should be an Integreat adapter', () => {
  assert.ok(json)
  assert.equal(typeof adapter.prepareEndpoint, 'function')
  assert.equal(typeof adapter.send, 'function')
  assert.equal(typeof adapter.normalize, 'function')
  assert.equal(typeof adapter.serialize, 'function')
  assert.equal(typeof adapter.connect, 'function')
  assert.equal(typeof adapter.disconnect, 'function')
})

test('should have authentication string', () => {
  assert.equal(adapter.authentication, 'asHttpHeaders')
})

test('connect should return connection object', async () => {
  const connection = { status: 'ok' }

  const ret = await adapter.connect({}, {}, connection)

  assert.deepEqual(ret, connection)
})

test('should do nothing when callling disconnect', async () => {
  const ret = await adapter.disconnect(null)

  assert.equal(ret, undefined)
})
