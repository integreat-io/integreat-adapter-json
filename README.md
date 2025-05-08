# JSON adapter for Integreat

Adapter that lets
[Integreat](https://github.com/integreat-io/integreat) send and receive content
in JSON.

## Getting started

### Prerequisits

Requires node v20 and Integreat v0.7.

### Installing and using

Install from npm:

```
npm install integreat-adapter-json
```

Example of use:

```javascript
import integreat from 'integreat'
import jsonAdapter from 'integreat-adapter-json'
import defs from './config'

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
