import test from 'node:test'
import assert from 'node:assert/strict'
import nock from 'nock'

import adapter from '../index.js'

// Tests

test('should prepare, serialize, send, and normalize', async () => {
  const json = adapter()
  const scope = nock('http://json1.test')
    .get('/entries/ent1')
    .reply(200, { id: 'ent1', type: 'entry', attributes: { title: 'Entry 1' } })
  const request = {
    action: 'GET',
    endpoint: json.prepareEndpoint({ uri: 'http://json1.test/entries/{id}' }),
    params: { type: 'entry', id: 'ent1' },
  }
  const expected = {
    status: 'ok',
    data: { id: 'ent1', type: 'entry', attributes: { title: 'Entry 1' } },
    headers: { 'content-type': 'application/json' },
  }

  const serialized = await json.serialize(request)
  const response = await json.send(serialized)
  const normalized = await json.normalize(response, serialized)

  assert.deepEqual(normalized, expected)
  assert.ok(scope.isDone())

  nock.restore()
})
