import test from 'ava'
import sinon = require('sinon')
import nock = require('nock')

import json from '..'

test('should log request and response', async t => {
  const logger = {
    info: sinon.stub(),
    error: sinon.stub()
  }
  const adapter = json(logger)
  nock('http://json1.test')
    .put('/entries', '[{"id":"ent1","type":"entry"}]')
    .reply(200, { ok: true })
  const request = {
    action: 'SET',
    data: JSON.stringify([{ id: 'ent1', type: 'entry' }]),
    endpoint: adapter.prepareEndpoint({ uri: 'http://json1.test/entries' }),
    params: { type: 'entry' }
  }
  const expectedPreMessage = 'Sending PUT http://json1.test/entries'
  const expectedPreMeta = {
    method: 'PUT',
    uri: 'http://json1.test/entries',
    body: request.data,
    headers: { 'Content-Type': 'application/json' },
    retries: 0
  }
  const expectedPostMessage = 'Success from PUT http://json1.test/entries'
  const expectedPostMeta = {
    status: 'ok',
    data: JSON.stringify({ ok: true })
  }

  await adapter.send(request)

  t.is(logger.info.callCount, 2)
  t.is(logger.error.callCount, 0)
  t.is(logger.info.args[0][0], expectedPreMessage)
  t.deepEqual(logger.info.args[0][1], expectedPreMeta)
  t.is(logger.info.args[1][0], expectedPostMessage)
  t.deepEqual(logger.info.args[1][1], expectedPostMeta)

  nock.restore()
})

test('should log error response', async t => {
  const logger = {
    info: sinon.stub(),
    error: sinon.stub()
  }
  const adapter = json(logger)
  nock('http://json2.test')
    .put('/entries', '[{"id":"ent1","type":"entry"}]')
    .reply(404)
  const request = {
    action: 'SET',
    data: JSON.stringify([{ id: 'ent1', type: 'entry' }]),
    endpoint: adapter.prepareEndpoint({ uri: 'http://json2.test/entries' }),
    params: { type: 'entry' }
  }
  const expectedPostMessage = 'Error \'notfound\' from PUT http://json2.test/entries: Could not find the url http://json2.test/entries'
  const expectedPostMeta = {
    status: 'notfound',
    error: 'Could not find the url http://json2.test/entries'
  }

  await adapter.send(request)

  t.is(logger.info.callCount, 1)
  t.is(logger.error.callCount, 1)
  t.is(logger.error.args[0][0], expectedPostMessage)
  t.deepEqual(logger.error.args[0][1], expectedPostMeta)

  nock.restore()
})
