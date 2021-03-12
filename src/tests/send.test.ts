import test from 'ava'
import nock = require('nock')

import json from '..'

test('should prepare, serialize, send, and normalize', async (t) => {
  const adapter = json()
  const scope = nock('http://json1.test')
    .put('/entries', '[{"id":"ent1","type":"entry"}]')
    .reply(
      200,
      { ok: true },
      { 'Content-Type': 'application/json; charset=utf-8' }
    )
  const request = {
    action: 'SET',
    data: [{ id: 'ent1', type: 'entry' }],
    endpoint: adapter.prepareEndpoint({ uri: 'http://json1.test/entries' }),
    params: { type: 'entry' },
  }
  const expected = {
    status: 'ok',
    data: { ok: true },
    headers: { 'content-type': 'application/json; charset=utf-8' },
  }

  const serialized = await adapter.serialize(request)
  const response = await adapter.send(serialized)
  const normalized = await adapter.normalize(response, serialized)

  t.deepEqual(normalized, expected)
  t.true(scope.isDone())

  nock.restore()
})

test('should call with Integreat as user-agent', async (t) => {
  const adapter = json()
  const scope = nock('http://json2.test', {
    reqheaders: {
      'user-agent': 'integreat-adapter-json/0.4',
    },
  })
    .get('/entries')
    .reply(200, { ok: true })
  const request = {
    action: 'GET',
    endpoint: adapter.prepareEndpoint({ uri: 'http://json2.test/entries' }),
    params: { type: 'entry' },
  }

  // We skip normalization and serialization here, as we're just interested in
  // seeing that we call with the right user-agent
  await adapter.send(request)

  t.true(scope.isDone())

  nock.restore()
})
