import test from 'ava'

import defaultResources from '../resources'
import commonResources = require('../resources')

test('should have json adapter on default', (t) => {
  t.is(typeof defaultResources, 'object')
  t.is(typeof defaultResources.adapters.json, 'object')
  t.is(typeof defaultResources.adapters.json.send, 'function')
})

test('should have json adapter as commonjs', (t) => {
  t.is(typeof commonResources, 'object')
  t.is(typeof commonResources.adapters.json, 'object')
  t.is(typeof commonResources.adapters.json.send, 'function')
})
