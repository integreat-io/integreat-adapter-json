import test from 'ava'

import adapter = require('..')

test('should be adapter', (t) => {
  t.is(typeof adapter, 'object')
  t.is(typeof adapter.send, 'function')
})
