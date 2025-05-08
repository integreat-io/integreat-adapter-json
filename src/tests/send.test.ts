import test from 'node:test'
import assert from 'node:assert/strict'
import nock from 'nock'

import json from '../index.js'

// Setup

test('log', async (t) => {
  t.after(() => {
    nock.restore()
  })

  // Tests

  await t.test('should prepare, serialize, send, and normalize', async () => {
    const adapter = json()
    const scope = nock('http://json3.test')
      .put('/entries', '[{"id":"ent1","type":"entry"}]')
      .reply(
        200,
        { ok: true },
        { 'Content-Type': 'application/json; charset=utf-8' },
      )
    const request = {
      action: 'SET',
      data: [{ id: 'ent1', type: 'entry' }],
      endpoint: adapter.prepareEndpoint({ uri: 'http://json3.test/entries' }),
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

    assert.deepEqual(normalized, expected)
    assert.ok(scope.isDone())
  })

  await t.test('should call with Integreat as user-agent', async () => {
    const adapter = json()
    const scope = nock('http://json4.test', {
      reqheaders: {
        'user-agent': 'integreat-adapter-json/0.4',
      },
    })
      .get('/entries')
      .reply(200, { ok: true })
    const request = {
      action: 'GET',
      endpoint: adapter.prepareEndpoint({ uri: 'http://json4.test/entries' }),
      params: { type: 'entry' },
    }

    // We skip normalization and serialization here, as we're just interested in
    // seeing that we call with the right user-agent
    await adapter.send(request)

    assert.ok(scope.isDone())
  })
})
