import test from 'ava'

import json from '.'
const adapter = json()

test('should serialize request', async (t) => {
  const request = {
    action: 'SET',
    data: { id: 'ent1', type: 'entry', attributes: { title: 'Entry 1' } }
  }
  const expected = {
    action: 'SET',
    data: '{"id":"ent1","type":"entry","attributes":{"title":"Entry 1"}}'
  }

  const ret = await adapter.serialize(request)

  t.deepEqual(ret, expected)
})

test('should serialize null as null', async (t) => {
  const request = {
    action: 'SET',
    data: null
  }

  const ret = await adapter.serialize(request)

  t.deepEqual(ret, request)
})

test('should serialize undefined as null', async (t) => {
  const request = {
    action: 'GET'
  }
  const expected = {
    action: 'GET',
    data: null
  }

  const ret = await adapter.serialize(request)

  t.deepEqual(ret, expected)
})
