import test from 'node:test'
import assert from 'node:assert/strict'
import nock from 'nock'

import json, { Request } from './index.js'

// Setup

const adapter = json()

test.after(() => {
  nock.restore()
})

// Tests

test('should send data and return status', async () => {
  const data = '{"id":"ent1","title":"Entry 1"}'
  const scope = nock('http://json1.test', {
    reqheaders: { 'Content-Type': 'application/json' },
  })
    .put('/entries/ent1', data)
    .reply(200, { id: 'ent1' })
  const request = {
    action: 'SET',
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json1.test/entries/ent1',
      retries: 0,
    }),
    data,
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'ok', ret.error)
  assert.deepEqual(ret.data, '{"id":"ent1"}')
  assert.ok(scope.isDone())
})

test('should use GET method as default when no data', async () => {
  const scope = nock('http://json2.test')
    .get('/entries/ent1')
    .reply(200, { id: 'ent1', type: 'entry' })
  const request = {
    action: 'GET',
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json2.test/entries/ent1',
    }),
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'ok', ret.error)
  assert.deepEqual(ret.data, '{"id":"ent1","type":"entry"}')
  assert.ok(scope.isDone())
})

test('should not set content-type header when no body', async () => {
  const scope = nock('http://json19.test', { badheaders: ['Content-Type'] })
    .get('/entries/ent1')
    .reply(200, { id: 'ent1', type: 'entry' })
  const request = {
    action: 'GET',
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json19.test/entries/ent1',
    }),
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'ok', ret.error)
  assert.deepEqual(ret.data, '{"id":"ent1","type":"entry"}')
  assert.ok(scope.isDone())
})

test('should use method from endpoint', async () => {
  const data = '{"id":"ent1","title":"Entry 1"}'
  const scope = nock('http://json3.test')
    .post('/entries/ent1', data)
    .reply(200, { id: 'ent1' })
  const request = {
    action: 'SET',
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json3.test/entries/ent1',
      method: 'POST',
    }),
    data,
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'ok', ret.error)
  assert.ok(scope.isDone())
})

test('should generate url from endpoint params and options', async () => {
  const data = '{"id":"ent1","title":"Entry 1"}'
  const scope = nock('http://json4.test')
    .put('/entries/ent1', data)
    .query({ filter: 'archive' })
    .reply(200, { id: 'ent1' })
  const endpoint = adapter.prepareEndpoint({
    uri: 'http://json4.test/entries/{id}{?filter}',
    method: 'PUT',
    filter: 'archive',
  })
  const request = {
    action: 'SET',
    endpoint,
    data,
    params: { id: 'ent1', type: 'entry' },
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'ok', ret.error)
  assert.deepEqual(ret.data, '{"id":"ent1"}')
  assert.ok(scope.isDone())
})

test('should return ok status on all 200-range statuses', async () => {
  const data = '{"id":"ent2","title":"Entry 2"}'
  const scope = nock('http://json5.test')
    .put('/entries/ent2', data)
    .reply(202, { id: 'ent2' })
  const request = {
    action: 'SET',
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json5.test/entries/ent2',
    }),
    data,
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'ok')
  assert.ok(scope.isDone())
})

test('should return error on not found', async () => {
  nock('http://json6.test').get('/entries/unknown').reply(404)
  const request = {
    action: 'GET',
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json6.test/entries/unknown',
    }),
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'notfound')
  assert.equal(
    ret.error,
    'Could not find the url http://json6.test/entries/unknown',
  )
  assert.equal(ret.data, undefined)
})

test('should return error on other error', async () => {
  nock('http://json7.test').get('/entries/error').reply(500)
  const request = {
    action: 'GET',
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json7.test/entries/error',
    }),
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'error')
  assert.equal(
    ret.error,
    'Server returned 500 for http://json7.test/entries/error',
  )
  assert.equal(ret.data, undefined)
})

test('should return error on request error', async () => {
  nock('http://json8.test')
    .get('/entries/ent1')
    .replyWithError('An awful error')
  const request = {
    action: 'GET',
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json8.test/entries/ent1',
    }),
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'error')
})

test('should retrieve with headers from endpoint', async () => {
  nock('http://json9.test', {
    reqheaders: {
      authorization: 'The_token',
      'If-Match': '3-871801934',
    },
  })
    .put('/entries/ent1', '{}')
    .reply(200)
  const auth = { Authorization: 'The_token' }
  const request = {
    action: 'SET',
    endpoint: adapter.prepareEndpoint({
      headers: { 'If-Match': '3-871801934' },
      uri: 'http://json9.test/entries/ent1',
    }),
    data: '{}',
    auth,
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'ok')
})

test('should retrieve with auth headers', async () => {
  nock('http://json10.test', {
    reqheaders: {
      authorization: 'The_token',
    },
  })
    .put('/entries/ent1', '{}')
    .reply(200)
  const auth = { Authorization: 'The_token' }
  const request = {
    action: 'SET',
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json10.test/entries/ent1',
    }),
    data: '{}',
    auth,
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'ok')
})

test('should retrieve with headers from request', async () => {
  nock('http://json17.test', {
    reqheaders: {
      authorization: 'The_token',
      'If-Match': '3-871801934',
      'x-correlation-id': '1234567890',
    },
  })
    .put('/entries/ent1', '{}')
    .reply(200)
  const auth = { Authorization: 'The_token' }
  const request = {
    action: 'SET',
    endpoint: adapter.prepareEndpoint({
      headers: { 'If-Match': '3-871801934' },
      uri: 'http://json17.test/entries/ent1',
    }),
    headers: { 'x-correlation-id': '1234567890' },
    data: '{}',
    auth,
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'ok', ret.error)
})

test('should retrieve with auth params in querystring', async () => {
  nock('http://json10.test')
    .put('/entries/ent1', '{}')
    .query({ authorization: 'Th@&t0k3n', timestamp: 1554407539 })
    .reply(200)
  const auth = { Authorization: 'Th@&t0k3n', timestamp: 1554407539 }
  const request = {
    action: 'SET',
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json10.test/entries/ent1',
      authAsQuery: true,
    }),
    data: '{}',
    auth,
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'ok', ret.error)
})

test('should retrieve with auth params in querystring when uri has querystring', async () => {
  nock('http://json10.test')
    .put('/entries/ent1', '{}')
    .query({ page: 1, authorization: 'Th@&t0k3n', timestamp: 1554407539 })
    .reply(200)
  const auth = { Authorization: 'Th@&t0k3n', timestamp: 1554407539 }
  const request = {
    action: 'SET',
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json10.test/entries/ent1?page=1',
      authAsQuery: true,
    }),
    data: '{}',
    auth,
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'ok', ret.error)
})

test('should retrieve with auth params in querystring when uri has unused querystring params', async () => {
  nock('http://json18.test')
    .put((uri) => !uri.includes('?&')) // Check for faulty use of question mark followed by ampersand
    .reply(200)
  const auth = { Authorization: 'Th@&t0k3n', timestamp: 1554407539 }
  const request = {
    action: 'SET',
    params: { orderId: '12345' },
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json18.test/orders/{orderId}/refunds{?per_page=pageSize?,page=page?,after=createdAfter?}',
      authAsQuery: true,
    }),
    data: '{}',
    auth,
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'ok', ret.error)
})

test('should not throw when auth=true', async () => {
  nock('http://json11.test').put('/entries/ent3', {}).reply(200)
  const request = {
    action: 'SET',
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json11.test/entries/ent3',
    }),
    data: '{}',
    auth: true,
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'ok')
})

test('should respond with badrequest on 400', async () => {
  nock('http://json14.test').put('/entries/ent1', '{}').reply(400, {})
  const request = {
    action: 'SET',
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json14.test/entries/ent1',
    }),
    data: '{}',
    auth: {},
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'badrequest')
  assert.equal(typeof ret.error, 'string')
})

test('should respond with timeout on 408', async () => {
  nock('http://json15.test').put('/entries/ent1', '{}').reply(408, {})
  const request = {
    action: 'SET',
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json15.test/entries/ent1',
    }),
    data: '{}',
    auth: {},
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'timeout')
  assert.equal(typeof ret.error, 'string')
})

test('should reject on 401 with auth', async () => {
  nock('http://json12.test').put('/entries/ent1', '{}').reply(401, {})
  const request = {
    action: 'SET',
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json12.test/entries/ent1',
    }),
    data: '{}',
    auth: {},
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'noaccess')
  assert.equal(typeof ret.error, 'string')
})

test('should reject on 401 without auth', async () => {
  nock('http://json13.test').put('/entries/ent1', '{}').reply(401, {})
  const request = {
    action: 'SET',
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json13.test/entries/ent1',
    }),
    data: '{}',
    auth: null,
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'noaccess')
  assert.equal(typeof ret.error, 'string')
})

test('should reject on 403 ', async () => {
  nock('http://json16.test').put('/entries/ent1', '{}').reply(403, {})
  const request = {
    action: 'SET',
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json16.test/entries/ent1',
    }),
    data: '{}',
    auth: null,
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'noaccess')
  assert.equal(typeof ret.error, 'string')
})

test('should return with badrequest when data is not a string', async () => {
  const request = {
    action: 'SET',
    endpoint: adapter.prepareEndpoint({
      uri: 'http://json0.test/entries/ent1',
    }),
    data: {},
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'badrequest')
  assert.equal(typeof ret.error, 'string')
})

test('should return request props on dry-run', async () => {
  const data = '{"id":"ent1","title":"Entry 1"}'
  const endpoint = adapter.prepareEndpoint({
    uri: 'http://json0.test/entries/{id}',
    method: 'PUT',
  })
  const request = {
    action: 'SET',
    endpoint,
    data,
    params: { id: 'ent1', type: 'entry', dryrun: true },
  }
  const expectedData = {
    uri: 'http://json0.test/entries/ent1',
    method: 'PUT',
    body: data,
    retries: 0,
    timeout: 120000,
    headers: {
      'Content-Type': 'application/json',
      'user-agent': 'integreat-adapter-json/0.4',
    },
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'dryrun')
  assert.deepEqual(ret.data, expectedData)
})

test('should should set retries and timeout from endpiont', async () => {
  const data = '{"id":"ent1","title":"Entry 1"}'
  const endpoint = adapter.prepareEndpoint({
    uri: 'http://json0.test/entries/{id}',
    method: 'PUT',
    retries: 3,
    timeout: 30000,
  })
  const request = {
    action: 'SET',
    endpoint,
    data,
    params: { id: 'ent1', type: 'entry', dryrun: true },
  }
  const expectedData = {
    uri: 'http://json0.test/entries/ent1',
    method: 'PUT',
    body: data,
    retries: 3,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'user-agent': 'integreat-adapter-json/0.4',
    },
  }

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'dryrun')
  assert.deepEqual(ret.data, expectedData)
})

test('should return error when no endpoint', async () => {
  const request = {} as Request

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'error')
})

test('should return error when no uri', async () => {
  const request = { endpoint: { uri: undefined } } as Request

  const ret = await adapter.send(request)

  assert.equal(ret.status, 'error')
})
