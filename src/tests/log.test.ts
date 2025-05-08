import test from 'node:test'
import assert from 'node:assert/strict'
import sinon from 'sinon'
import nock from 'nock'

import json from '../index.js'

// Setup

test('log', async (t) => {
  t.after(() => {
    nock.restore()
  })

  // Tests

  await t.test('should log request and response', async () => {
    const logger = {
      info: sinon.stub(),
      error: sinon.stub(),
    }
    const adapter = json(logger)
    nock('http://json5.test')
      .put('/entries', '[{"id":"ent1","type":"entry"}]')
      .reply(200, { ok: true })
    const request = {
      action: 'SET',
      data: JSON.stringify([{ id: 'ent1', type: 'entry' }]),
      endpoint: adapter.prepareEndpoint({ uri: 'http://json5.test/entries' }),
      params: { type: 'entry' },
    }
    const expectedPreMessage = 'Sending PUT http://json5.test/entries'
    const expectedPreMeta = {
      method: 'PUT',
      uri: 'http://json5.test/entries',
      body: request.data,
      headers: {
        'Content-Type': 'application/json',
        'user-agent': 'integreat-adapter-json/0.4',
      },
      retries: 0,
      timeout: 120000,
    }
    const expectedPostMessage = 'Success from PUT http://json5.test/entries'
    const expectedPostMeta = {
      status: 'ok',
      data: JSON.stringify({ ok: true }),
      headers: { 'content-type': 'application/json' },
    }

    await adapter.send(request)

    assert.equal(logger.info.callCount, 2)
    assert.equal(logger.error.callCount, 0)
    assert.equal(logger.info.args[0][0], expectedPreMessage)
    assert.deepEqual(logger.info.args[0][1], expectedPreMeta)
    assert.equal(logger.info.args[1][0], expectedPostMessage)
    assert.deepEqual(logger.info.args[1][1], expectedPostMeta)
  })

  await t.test('should log error response', async () => {
    const logger = {
      info: sinon.stub(),
      error: sinon.stub(),
    }
    const adapter = json(logger)
    nock('http://json6.test')
      .put('/entries', '[{"id":"ent1","type":"entry"}]')
      .reply(404)
    const request = {
      action: 'SET',
      data: JSON.stringify([{ id: 'ent1', type: 'entry' }]),
      endpoint: adapter.prepareEndpoint({ uri: 'http://json6.test/entries' }),
      params: { type: 'entry' },
    }
    const expectedPostMessage =
      "Error 'notfound' from PUT http://json6.test/entries: Could not find the url http://json6.test/entries"
    const expectedPostMeta = {
      status: 'notfound',
      error: 'Could not find the url http://json6.test/entries',
    }

    await adapter.send(request)

    assert.equal(logger.info.callCount, 1)
    assert.equal(logger.error.callCount, 1)
    assert.equal(logger.error.args[0][0], expectedPostMessage)
    assert.deepEqual(logger.error.args[0][1], expectedPostMeta)
  })
})
