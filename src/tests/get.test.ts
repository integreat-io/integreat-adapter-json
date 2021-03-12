import test from 'ava'
import nock = require('nock')

import adapter from '..'

test('should prepare, serialize, send, and normalize', async (t) => {
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

  t.deepEqual(normalized, expected)
  t.true(scope.isDone())

  nock.restore()
})
