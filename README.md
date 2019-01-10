# JSON adapter for Integreat

Adapter that lets
[Integreat](https://github.com/integreat-io/integreat) send and receive content
in JSON.

[![npm Version](https://img.shields.io/npm/v/integreat-adapter-json.svg)](https://www.npmjs.com/package/integreat-adapter-json)
[![Build Status](https://travis-ci.org/integreat-io/integreat-adapter-json.svg?branch=master)](https://travis-ci.org/integreat-io/integreat-adapter-json)
[![Coverage Status](https://coveralls.io/repos/github/integreat-io/integreat-adapter-json/badge.svg?branch=master)](https://coveralls.io/github/integreat-io/integreat-adapter-json?branch=master)
[![Dependencies Status](https://tidelift.com/badges/github/integreat-io/integreat-adapter-json?style=flat)](https://tidelift.com/repo/github/integreat-io/integreat-adapter-json)
[![Maintainability](https://api.codeclimate.com/v1/badges/6331723a6ff61de5f232/maintainability)](https://codeclimate.com/github/integreat-io/integreat-adapter-json/maintainability)

## Getting started

### Prerequisits

Requires node v8.6 and Integreat v0.7.

### Installing and using

Install from npm:

```
npm install integreat-adapter-json
```

Example of use:
```javascript
const integreat = require('integreat')
const jsonAdapter = require('integreat-adapter-json')
const defs = require('./config')

const resources = integreat.resources(jsonAdapter)
const great = integreat(defs, resources)

// ... and then dispatch actions as usual
```

Example source configuration:

```javascript
{
  id: 'store',
  adapter: 'json',
  endpoints: [
    { options: { uri: 'https://api.com/jsonApi' } }
  ]
}
```

Data will be sent with application/json.

### Running the tests

The tests can be run with `npm test`.

## Contributing

Please read
[CONTRIBUTING](https://github.com/integreat-io/integreat-adapter-json/blob/master/CONTRIBUTING.md)
for details on our code of conduct, and the process for submitting pull
requests.

## License

This project is licensed under the ISC License - see the
[LICENSE](https://github.com/integreat-io/integreat-adapter-json/blob/master/LICENSE)
file for details.
