import test from 'node:test'
import assert from 'node:assert/strict'
import greatUriTemplate from 'great-uri-template'

import json from './index.js'

// Setup

const adapter = json()

// Tests

test('should return endpoint object', () => {
  const options = {
    uri: 'http://example.com/',
    headers: {
      'If-Match': '3-871801934',
    },
    method: 'POST' as const,
  }
  const expected = {
    uri: ['http://example.com/'],
    headers: {
      'If-Match': '3-871801934',
    },
    method: 'POST' as const,
  }

  const ret = adapter.prepareEndpoint(options)

  assert.deepEqual(ret, expected)
})

test('should merge service options and endpoint options', () => {
  const options = {
    uri: 'http://example.com/',
    fromEndpoint: '1',
  }
  const serviceOptions = {
    baseUri: null,
  }
  const expected = {
    uri: ['http://example.com/'],
    fromEndpoint: '1',
    baseUri: null,
  }

  const ret = adapter.prepareEndpoint(options, serviceOptions)

  assert.deepEqual(ret, expected)
})

test('should set uri to undefined when missing', () => {
  const options = {}
  const expected = {
    uri: undefined,
  }

  const ret = adapter.prepareEndpoint(options)

  assert.deepEqual(ret, expected)
})

test('should compile uri', () => {
  const uri = 'http://example.com/{type}/{id}{?first,max}'
  const options = { uri }
  const expected = greatUriTemplate.compile(uri)

  const ret = adapter.prepareEndpoint(options)

  assert.ok(ret)
  assert.deepEqual(ret.uri, expected)
})

test('should use baseUri from service options', () => {
  const serviceOptions = { baseUri: 'http://example.com/' }
  const options = { uri: '{type}/{id}{?first,max}' }
  const expected = greatUriTemplate.compile(
    'http://example.com/{type}/{id}{?first,max}',
  )

  const ret = adapter.prepareEndpoint(options, serviceOptions)

  assert.deepEqual(ret.uri, expected)
})

test('should remove extra slash from baseUri and uri', () => {
  const serviceOptions = { baseUri: 'http://example.com/' }
  const options = { uri: '/{type}/{id}{?first,max}' }
  const expected = greatUriTemplate.compile(
    'http://example.com/{type}/{id}{?first,max}',
  )

  const ret = adapter.prepareEndpoint(options, serviceOptions)

  assert.deepEqual(ret.uri, expected)
})

test('should add missing slash between baseUri and uri', () => {
  const serviceOptions = { baseUri: 'http://example.com' }
  const options = { uri: '{type}/{id}{?first,max}' }
  const expected = greatUriTemplate.compile(
    'http://example.com/{type}/{id}{?first,max}',
  )

  const ret = adapter.prepareEndpoint(options, serviceOptions)

  assert.deepEqual(ret.uri, expected)
})

test('should not prepend unset baseUri', () => {
  const serviceOptions = {}
  const options = { uri: 'http://example.com/{type}/{id}{?first,max}' }
  const expected = greatUriTemplate.compile(
    'http://example.com/{type}/{id}{?first,max}',
  )

  const ret = adapter.prepareEndpoint(options, serviceOptions)

  assert.ok(ret)
  assert.deepEqual(ret.uri, expected)
})

test('should not prepend with baseUri when null', () => {
  const serviceOptions = { baseUri: null }
  const options = { uri: 'http://example.com/{type}/{id}{?first,max}' }
  const expected = greatUriTemplate.compile(
    'http://example.com/{type}/{id}{?first,max}',
  )

  const ret = adapter.prepareEndpoint(options, serviceOptions)

  assert.ok(ret)
  assert.deepEqual(ret.uri, expected)
})
