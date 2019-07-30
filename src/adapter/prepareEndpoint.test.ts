import test from 'ava'
import { compile as compileUri } from 'great-uri-template'

import json from '.'
const adapter = json()

test('should return endpoint object', (t) => {
  const options = {
    uri: 'http://example.com/',
    headers: {
      'If-Match': '3-871801934'
    },
    method: 'POST'
  }
  const expected = {
    uri: ['http://example.com/'],
    headers: {
      'If-Match': '3-871801934'
    },
    method: 'POST'
  }

  const ret = adapter.prepareEndpoint(options)

  t.deepEqual(ret, expected)
})

test('should merge service options and endpoint options', (t) => {
  const options = {
    uri: 'http://example.com/',
    fromEndpoint: '1'
  }
  const serviceOptions = {
    baseUri: null
  }
  const expected = {
    uri: ['http://example.com/'],
    fromEndpoint: '1',
    baseUri: null
  }

  const ret = adapter.prepareEndpoint(options, serviceOptions)

  t.deepEqual(ret, expected)
})

test('should throw when no uri', (t) => {
  const options = {}

  t.throws(() => adapter.prepareEndpoint(options))
})

test('should compile uri', (t) => {
  const uri = 'http://example.com/{type}/{id}{?first,max}'
  const options = { uri }
  const expected = compileUri(uri)

  const ret = adapter.prepareEndpoint(options)

  t.truthy(ret)
  t.deepEqual(ret.uri, expected)
})

test('should use baseUri from service options', (t) => {
  const serviceOptions = { baseUri: 'http://example.com/' }
  const options = { uri: '{type}/{id}{?first,max}' }
  const expected = compileUri('http://example.com/{type}/{id}{?first,max}')

  const ret = adapter.prepareEndpoint(options, serviceOptions)

  t.deepEqual(ret.uri, expected)
})

test('should not prepend unset baseUri', (t) => {
  const serviceOptions = {}
  const options = { uri: 'http://example.com/{type}/{id}{?first,max}' }
  const expected = compileUri('http://example.com/{type}/{id}{?first,max}')

  const ret = adapter.prepareEndpoint(options, serviceOptions)

  t.truthy(ret)
  t.deepEqual(ret.uri, expected)
})

test('should not prepend with baseUri when null', (t) => {
  const serviceOptions = { baseUri: null }
  const options = { uri: 'http://example.com/{type}/{id}{?first,max}' }
  const expected = compileUri('http://example.com/{type}/{id}{?first,max}')

  const ret = adapter.prepareEndpoint(options, serviceOptions)

  t.truthy(ret)
  t.deepEqual(ret.uri, expected)
})
