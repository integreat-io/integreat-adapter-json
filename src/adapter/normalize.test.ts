import test from 'ava'

import json from '.'
const adapter = json()

// Setup

const request = { action: 'GET' }

// Tests

test('should normalize response', async (t) => {
  const data = '{ "id": "ent1", "type": "entry", "attributes": { "title": "Entry 1" } }'
  const response = { status: 'ok', data }
  const expected = {
    status: 'ok',
    data: { id: 'ent1', type: 'entry', attributes: { title: 'Entry 1' } }
  }

  const ret = await adapter.normalize(response, request)

  t.deepEqual(ret, expected)
})

test('should normalize null as null', async (t) => {
  const response = { status: 'ok', data: null }

  const ret = await adapter.normalize(response, request)

  t.deepEqual(ret, response)
})

test('should normalize undefined as null', async (t) => {
  const response = { status: 'ok' }
  const expected = { status: 'ok', data: null }

  const ret = await adapter.normalize(response, request)

  t.deepEqual(ret, expected)
})

test('should normalize empty string as null', async (t) => {
  const response = { status: 'ok', data: '' }
  const expected = { status: 'ok', data: null }

  const ret = await adapter.normalize(response, request)

  t.deepEqual(ret, expected)
})

test('should not touch data object when already parsed', async (t) => {
  const response = {
    status: 'ok',
    data: { id: 'ent1', type: 'entry', attributes: { title: 'Entry 1' } }
  }

  const ret = await adapter.normalize(response, request)

  t.deepEqual(ret, response)
})

test('should not touch data array when already parsed', async (t) => {
  const response = {
    status: 'ok',
    data: [{ id: 'ent1', type: 'entry', attributes: { title: 'Entry 1' } }]
  }

  const ret = await adapter.normalize(response, request)

  t.deepEqual(ret, response)
})

test('should return error on invalid json', async (t) => {
  const response = {
    status: 'ok',
    data: 'invalid'
  }
  const expected = {
    status: 'badresponse',
    error: 'Response data is not valid JSON'
  }

  const ret = await adapter.normalize(response, request)

  t.deepEqual(ret, expected)
})
