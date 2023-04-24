# JSON adapter for Integreat

Adapter that lets
[Integreat](https://github.com/integreat-io/integreat) send and receive content
in JSON.

[![npm Version](https://img.shields.io/npm/v/integreat-adapter-json.svg)](https://www.npmjs.com/package/integreat-adapter-json)
[![Build Status](https://travis-ci.org/integreat-io/integreat-adapter-json.svg?branch=master)](https://travis-ci.org/integreat-io/integreat-adapter-json)
[![Coverage Status](https://coveralls.io/repos/github/integreat-io/integreat-adapter-json/badge.svg?branch=master)](https://coveralls.io/github/integreat-io/integreat-adapter-json?branch=master)
[![Dependencies Status](https://tidelift.com/badges/github/integreat-io/integreat-adapter-json?style=flat)](https://tidelift.com/repo/github/integreat-io/integreat-adapter-json)
[![Maintainability](https://api.codeclimate.com/v1/badges/95c9ac1d21d1ab2424ac/maintainability)](https://codeclimate.com/github/integreat-io/integreat-adapter-json/maintainability)

## Getting started

### Prerequisits

Requires node v18 and Integreat v0.8.

### Installing and using

Install from npm:

```
npm install integreat-adapter-json
```

Example of use:

```javascript
import integreat from 'integreat'
import httpTransporter from 'integreat-transporter-http'
import jsonAdapter from 'integreat-adapter-json'
const defs = require('./config')

const great = Integreat.create(
  { schemas, services },
  { transporters: { http: httpTransporter }, adapters: { json: jsonAdapter } }
)

// ... and then dispatch actions as usual
```

Example source configuration:

```javascript
{
  id: 'store',
  transporter: 'http',
  adapters: ['json'],
  options: {
    includeHeaders: true
  },
  endpoints: [
    { options: { uri: 'https://api.com/jsonApi' } }
  ]
}
```

Data headers for sending with content-type `application/json`, will be set when
you set the `includeHeaders` option to `true`.

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
