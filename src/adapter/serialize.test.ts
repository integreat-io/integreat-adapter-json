import test from 'ava'

import adapter from '.'

test('should serialize request', async (t) => {
  const request = {
    method: 'MUTATION',
    data: { id: 'ent1', type: 'entry', attributes: { title: 'Entry 1' } }
  }
  const expected = {
    method: 'MUTATION',
    data: '{"id":"ent1","type":"entry","attributes":{"title":"Entry 1"}}'
  }

  const ret = await adapter.serialize(request)

  t.deepEqual(ret, expected)
})

test('should serialize null as null', async (t) => {
  const request = {
    method: 'MUTATION',
    data: null
  }

  const ret = await adapter.serialize(request)

  t.deepEqual(ret, request)
})

test('should serialize undefined as null', async (t) => {
  const request = {
    method: 'QUERY'
  }
  const expected = {
    method: 'QUERY',
    data: null
  }

  const ret = await adapter.serialize(request)

  t.deepEqual(ret, expected)
})
