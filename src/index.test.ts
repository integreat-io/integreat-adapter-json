import test from 'node:test'
import assert from 'node:assert/strict'

import adapter from './index.js'

// Setup

const options = { includeHeaders: false }

// Tests -- prepareOptions

test('should prepare empty options', () => {
  const options = {}
  const expected = { includeHeaders: true }

  const ret = adapter.prepareOptions(options, 'api')

  assert.deepEqual(ret, expected)
})

test('should only keep known options', () => {
  const options = { includeHeaders: false, dontKnow: 'whatthisis' }
  const expected = { includeHeaders: false }

  const ret = adapter.prepareOptions(options, 'api')

  assert.deepEqual(ret, expected)
})

// Tests -- normalize

test('should normalize json string data in response', async () => {
  const action = {
    type: 'GET',
    payload: { type: 'entry' },
    response: { status: 'ok', data: '[{"id":"ent1","title":"Entry 1"}]' },
    meta: { ident: { id: 'johnf' } },
  }
  const expected = {
    type: 'GET',
    payload: { type: 'entry' },
    response: { status: 'ok', data: [{ id: 'ent1', title: 'Entry 1' }] },
    meta: { ident: { id: 'johnf' } },
  }

  const ret = await adapter.normalize(action, options)

  assert.deepEqual(ret, expected)
})

test('should normalize json string data in payload', async () => {
  const action = {
    type: 'SET',
    payload: {
      type: 'entry',
      data: '[{"id":"ent1","title":"Entry 1"}]',
      sourceService: 'api',
    },
    meta: { ident: { id: 'anonymous' } },
  }
  const expected = {
    type: 'SET',
    payload: {
      type: 'entry',
      data: [{ id: 'ent1', title: 'Entry 1' }],
      sourceService: 'api',
    },
    meta: { ident: { id: 'anonymous' } },
  }

  const ret = await adapter.normalize(action, options)

  assert.deepEqual(ret, expected)
})

test('should normalize empty json string as null', async () => {
  const action = {
    type: 'GET',
    payload: { type: 'entry' },
    response: { status: 'ok', data: '' },
    meta: { ident: { id: 'johnf' } },
  }
  const expected = {
    type: 'GET',
    payload: { type: 'entry' },
    response: { status: 'ok', data: null },
    meta: { ident: { id: 'johnf' } },
  }

  const ret = await adapter.normalize(action, options)

  assert.deepEqual(ret, expected)
})

test('should return error when parsing payload data fails', async () => {
  const action = {
    type: 'GET',
    payload: { type: 'entry', data: 'Not JSON' },
    response: { status: 'ok' },
    meta: { ident: { id: 'johnf' } },
  }
  const expected = {
    type: 'GET',
    payload: { type: 'entry', data: 'Not JSON' },
    response: {
      status: 'badrequest',
      error: 'Payload data was not valid JSON',
    },
    meta: { ident: { id: 'johnf' } },
  }

  const ret = await adapter.normalize(action, options)

  assert.deepEqual(ret, expected)
})

test('should return error when parsing response data fails', async () => {
  const action = {
    type: 'GET',
    payload: { type: 'entry' },
    response: { status: 'ok', data: 'Not JSON' },
    meta: { ident: { id: 'johnf' } },
  }
  const expected = {
    type: 'GET',
    payload: { type: 'entry' },
    response: {
      status: 'badresponse',
      error: 'Response data was not valid JSON',
      data: 'Not JSON',
    },
    meta: { ident: { id: 'johnf' } },
  }

  const ret = await adapter.normalize(action, options)

  assert.deepEqual(ret, expected)
})

test('should not override existing error error with response data parsing error', async () => {
  const action = {
    type: 'GET',
    payload: { type: 'entry' },
    response: { status: 'timeout', error: 'Too slow!', data: 'Not JSON' },
    meta: { ident: { id: 'johnf' } },
  }
  const expected = {
    type: 'GET',
    payload: { type: 'entry' },
    response: {
      status: 'timeout',
      error: 'Too slow!',
      data: { $value: 'Not JSON' },
    },
    meta: { ident: { id: 'johnf' } },
  }

  const ret = await adapter.normalize(action, options)

  assert.deepEqual(ret, expected)
})

// Tests -- serialize

test('should serialize data in response', async () => {
  const action = {
    type: 'GET',
    payload: { type: 'entry', sourceService: 'api' },
    response: { status: 'ok', data: [{ id: 'ent1', title: 'Entry 1' }] },
    meta: { ident: { id: 'johnf' } },
  }
  const expected = {
    type: 'GET',
    payload: { type: 'entry', sourceService: 'api' },
    response: { status: 'ok', data: '[{"id":"ent1","title":"Entry 1"}]' },
    meta: { ident: { id: 'johnf' } },
  }

  const ret = await adapter.serialize(action, options)

  assert.deepEqual(ret, expected)
})

test('should serialize data in payload', async () => {
  const action = {
    type: 'SET',
    payload: {
      type: 'entry',
      data: [{ id: 'ent1', title: 'Entry 1' }],
    },
    meta: { ident: { id: 'anonymous' } },
  }
  const expected = {
    type: 'SET',
    payload: {
      type: 'entry',
      data: '[{"id":"ent1","title":"Entry 1"}]',
    },
    meta: { ident: { id: 'anonymous' } },
  }

  const ret = await adapter.serialize(action, options)

  assert.deepEqual(ret, expected)
})

test('should not serialize null or undefined', async () => {
  const action = {
    type: 'GET',
    payload: { type: 'entry', data: null },
    response: { status: 'ok', data: undefined },
    meta: { ident: { id: 'johnf' } },
  }
  const expected = {
    type: 'GET',
    payload: { type: 'entry', data: null },
    response: { status: 'ok', data: undefined },
    meta: { ident: { id: 'johnf' } },
  }

  const ret = await adapter.serialize(action, options)

  assert.deepEqual(ret, expected)
})

test('should include JSON headers in payload on outgoing service', async () => {
  const options = {}
  const action = {
    type: 'GET',
    payload: { type: 'entry', data: [{ id: 'ent1', title: 'Entry 1' }] },
    response: { status: 'ok' },
    meta: { ident: { id: 'johnf' } },
  }
  const expected = {
    type: 'GET',
    payload: {
      type: 'entry',
      data: '[{"id":"ent1","title":"Entry 1"}]',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    response: { status: 'ok' },
    meta: { ident: { id: 'johnf' } },
  }

  const ret = await adapter.serialize(action, options)

  assert.deepEqual(ret, expected)
})

test('should include JSON headers in resonse on incoming request', async () => {
  const options = {}
  const action = {
    type: 'GET',
    payload: { type: 'entry', sourceService: 'api' },
    response: { status: 'ok', data: [{ id: 'ent1', title: 'Entry 1' }] },
    meta: { ident: { id: 'johnf' } },
  }
  const expected = {
    type: 'GET',
    payload: {
      type: 'entry',
      sourceService: 'api',
    },
    response: {
      status: 'ok',
      data: '[{"id":"ent1","title":"Entry 1"}]',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    meta: { ident: { id: 'johnf' } },
  }

  const ret = await adapter.serialize(action, options)

  assert.deepEqual(ret, expected)
})

test('should include JSON headers in payload on outgoing service even when sourceService is set', async () => {
  const options = {}
  const action = {
    type: 'GET',
    payload: {
      type: 'entry',
      data: [{ id: 'ent1', title: 'Entry 1' }],
      sourceService: 'api',
    },
    response: { status: 'ok' },
    meta: { ident: { id: 'johnf' } },
  }
  const expected = {
    type: 'GET',
    payload: {
      type: 'entry',
      data: '[{"id":"ent1","title":"Entry 1"}]',
      sourceService: 'api',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    response: { status: 'ok' },
    meta: { ident: { id: 'johnf' } },
  }

  const ret = await adapter.serialize(action, options)

  assert.deepEqual(ret, expected)
})

test('should not replace existing content-type', async () => {
  const options = {}
  const action = {
    type: 'GET',
    payload: {
      type: 'entry',
      headers: { 'Content-Type': 'text/plain' },
      data: [{ id: 'ent1', title: 'Entry 1' }],
    },
    response: {
      status: 'ok',
      headers: { 'content-type': 'text/plain' },
      data: [{ id: 'ent1', title: 'Entry 1' }],
    },
    meta: { ident: { id: 'johnf' } },
  }
  const expected = {
    type: 'GET',
    payload: {
      type: 'entry',
      data: '[{"id":"ent1","title":"Entry 1"}]',
      headers: {
        'Content-Type': 'text/plain',
      },
    },
    response: {
      status: 'ok',
      headers: { 'Content-Type': 'text/plain' },
      data: '[{"id":"ent1","title":"Entry 1"}]',
    },
    meta: { ident: { id: 'johnf' } },
  }

  const ret = await adapter.serialize(action, options)

  assert.deepEqual(ret, expected)
})
