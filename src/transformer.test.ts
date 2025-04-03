import test from 'node:test'
import assert from 'node:assert/strict'

import json from './transformer.js'

// Setup

const operands = {}
const options = {}
const state = {
  rev: false,
  onlyMappedValues: false,
  context: [],
  value: {},
}
const stateRev = {
  rev: true,
  onlyMappedValues: false,
  context: [],
  value: {},
}

// Tests -- from service

test('should parse json from service', () => {
  const data = '[{"key":"ent1"},{"key":"ent2"}]'
  const expected = [{ key: 'ent1' }, { key: 'ent2' }]

  const ret = json(operands)(options)(data, state)

  assert.deepEqual(ret, expected)
})

test('should return array as is', () => {
  const data = [{ key: 'ent1' }, { key: 'ent2' }]

  const ret = json(operands)(options)(data, state)

  assert.deepEqual(ret, data)
})

test('should return object as is', () => {
  const data = { key: 'ent1', title: 'Entry 1', tags: ['news', 'sports'] }

  const ret = json(operands)(options)(data, state)

  assert.deepEqual(ret, data)
})

test('should parse iso date strings from service as strings', () => {
  const data = '{"date":"2020-03-18T18:43:11.000Z"}'
  const expected = { date: '2020-03-18T18:43:11.000Z' }

  const ret = json(operands)(options)(data, state)

  assert.deepEqual(ret, expected)
})

test('should return undefined from service when invalid json', () => {
  const data = 'Not json'

  const ret = json(operands)(options)(data, state)

  assert.equal(ret, undefined)
})

test('should return undefined from service when not JSON', () => {
  assert.equal(json(operands)(options)(1, state), undefined)
  assert.equal(json(operands)(options)(false, state), undefined)
  assert.equal(json(operands)(options)(null, state), undefined)
  assert.equal(json(operands)(options)(undefined, state), undefined)
})

// Tests -- to service

test('should stringify json to service', () => {
  const data = [{ key: 'ent1' }, { key: 'ent2' }]
  const expected = '[{"key":"ent1"},{"key":"ent2"}]'

  const ret = json(operands)(options)(data, stateRev)

  assert.equal(ret, expected)
})

test('should not stringify undefined to service', () => {
  const data = undefined

  const ret = json(operands)(options)(data, stateRev)

  assert.equal(ret, undefined)
})

test('should stringify null to service', () => {
  const data = null

  const ret = json(operands)(options)(data, stateRev)

  assert.equal(ret, 'null')
})

test('should stringify date as iso string', () => {
  const data = { date: new Date('2020-03-18T18:43:11Z') }
  const expected = '{"date":"2020-03-18T18:43:11.000Z"}'

  const ret = json(operands)(options)(data, stateRev)

  assert.equal(ret, expected)
})
