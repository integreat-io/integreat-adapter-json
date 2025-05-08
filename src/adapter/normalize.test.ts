import test from 'node:test'
import assert from 'node:assert/strict'

import json from './index.js'

// Setup

const adapter = json()
const request = { action: 'GET' }

// Tests

test('should normalize response', async () => {
  const data =
    '{ "id": "ent1", "type": "entry", "attributes": { "title": "Entry 1" } }'
  const response = { status: 'ok', data }
  const expected = {
    status: 'ok',
    data: { id: 'ent1', type: 'entry', attributes: { title: 'Entry 1' } },
  }

  const ret = await adapter.normalize(response, request)

  assert.deepEqual(ret, expected)
})

test('should normalize null as null', async () => {
  const response = { status: 'ok', data: null }

  const ret = await adapter.normalize(response, request)

  assert.deepEqual(ret, response)
})

test('should normalize undefined as null', async () => {
  const response = { status: 'ok' }
  const expected = { status: 'ok', data: null }

  const ret = await adapter.normalize(response, request)

  assert.deepEqual(ret, expected)
})

test('should normalize empty string as null', async () => {
  const response = { status: 'ok', data: '' }
  const expected = { status: 'ok', data: null }

  const ret = await adapter.normalize(response, request)

  assert.deepEqual(ret, expected)
})

test('should not touch data object when already parsed', async () => {
  const response = {
    status: 'ok',
    data: { id: 'ent1', type: 'entry', attributes: { title: 'Entry 1' } },
  }

  const ret = await adapter.normalize(response, request)

  assert.deepEqual(ret, response)
})

test('should not touch data array when already parsed', async () => {
  const response = {
    status: 'ok',
    data: [{ id: 'ent1', type: 'entry', attributes: { title: 'Entry 1' } }],
  }

  const ret = await adapter.normalize(response, request)

  assert.deepEqual(ret, response)
})

test('should return primitive value on object', async () => {
  const response = {
    status: 'ok',
    data: 'Ok',
  }
  const expected = {
    status: 'ok',
    data: { value: 'Ok' },
  }

  const ret = await adapter.normalize(response, request)

  assert.deepEqual(ret, expected)
})
