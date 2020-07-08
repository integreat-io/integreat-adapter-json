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

const resources = integreat.mergeResources(integreat.resources(), {
  adapters: { json: jsonAdapter() },
})
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

Data will be sent with content-type `application/json`.

An optional logger may be provided to the `jsonAdapter()` function, to log out
the request sent to the service, and its response. The logger must be an object
with an `info()` and an `error()` function. Both should accept a string message
as first argument, and a meta object as the second.

Available endpoint options:

- `uri`: The uri to send requests to for this endpoint.
- `baseUri`: An option base uri prepended to `uri`.
- `headers`: An object of headers to set on the request.
- `method`: Override the http method used to send the request. Default is `PUT`
  when the request has a body, otherwise `GET`.
- `authAsQuery`: Set to `true` to include auth options in query string rather
  than as request headers. Default is `false`.
- `retries`: Number of times to retry a request. Default is `0`.
- `timeout`: Milliseconds to wait until a request is timed out. Default is
  `120000`.

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
