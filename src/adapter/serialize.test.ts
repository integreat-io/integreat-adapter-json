import test from 'node:test'
import assert from 'node:assert/strict'

import json from './index.js'

// Setup

const adapter = json()

// Tests

test('should serialize request', async () => {
  const request = {
    action: 'SET',
    data: { id: 'ent1', type: 'entry', attributes: { title: 'Entry 1' } },
  }
  const expected = {
    action: 'SET',
    data: '{"id":"ent1","type":"entry","attributes":{"title":"Entry 1"}}',
  }

  const ret = await adapter.serialize(request)

  assert.deepEqual(ret, expected)
})

test('should serialize null as null', async () => {
  const request = {
    action: 'SET',
    data: null,
  }

  const ret = await adapter.serialize(request)

  assert.deepEqual(ret, request)
})

test('should serialize undefined as null', async () => {
  const request = {
    action: 'GET',
  }
  const expected = {
    action: 'GET',
    data: null,
  }

  const ret = await adapter.serialize(request)

  assert.deepEqual(ret, expected)
})
