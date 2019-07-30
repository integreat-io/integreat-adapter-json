import test from 'ava'

import json from '.'
const adapter = json()

test('should be an Integreat adapter', (t) => {
  t.truthy(json)
  t.is(typeof adapter.prepareEndpoint, 'function')
  t.is(typeof adapter.send, 'function')
  t.is(typeof adapter.normalize, 'function')
  t.is(typeof adapter.serialize, 'function')
  t.is(typeof adapter.connect, 'function')
  t.is(typeof adapter.disconnect, 'function')
})

test('should have authentication string', (t) => {
  t.is(adapter.authentication, 'asHttpHeaders')
})

test('connect should return connection object', async (t) => {
  const connection = { status: 'ok' }

  const ret = await adapter.connect({}, {}, connection)

  t.deepEqual(ret, connection)
})

test('should do nothing when callling disconnect', async (t) => {
  const ret = await adapter.disconnect(null)

  t.is(ret, undefined)
})
