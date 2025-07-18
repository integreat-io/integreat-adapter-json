# JSON adapter for Integreat

Adapter that lets
[Integreat](https://github.com/integreat-io/integreat) parse and stringify JSON.

[![npm Version](https://img.shields.io/npm/v/integreat-adapter-json.svg)](https://www.npmjs.com/package/integreat-adapter-json)
[![Maintainability](https://qlty.sh/gh/integreat-io/projects/integreat-adapter-json/maintainability.svg)](https://qlty.sh/gh/integreat-io/projects/integreat-adapter-json)

## Getting started

### Prerequisits

Requires node v18 and Integreat v1.0.

### Installing and using

Install from npm:

```
npm install integreat-adapter-json
```

Example of use:

```javascript
import Integreat from 'integreat'
import httpTransporter from 'integreat-transporter-http'
import jsonAdapter from 'integreat-adapter-json'
import defs from './config.js'

const great = Integreat.create(defs, {
  transporters: { http: httpTransporter },
  adapters: { json: jsonAdapter },
})

// ... and then dispatch actions as usual
```

Example service configuration:

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

Data headers for sending with content-type `application/json` will be set unless
you set the `includeHeaders` option to `false` (it's `true` by default). Headers
will be set where there is data, unless a content-type header is already set.
The case of the header will always be changed to `'Content-Type'`.

### JSON transformer

The package also includes a transformer, that works exactly like the adapter,
except it is intended for use in mutation pipelines with
`{ $transform: 'json' }`. You may use it like this:

Example of use:

```javascript
import integreat from 'integreat'
import httpTransporter from 'integreat-transporter-http'
import jsonTransformer from 'integreat-adapter-json/transformer.js'
import defs from './config.js'

const great = Integreat.create(defs, {
  transporters: { http: httpTransporter },
  transformers: { json: jsonTransformer },
})

// In a mutation pipeline:

const mutation = ['response.data', { $transform: 'json' }]
```

The `includeHeaders` option from the adapter, does not apply to the transformer.

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
