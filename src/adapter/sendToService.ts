import got = require('got')
import { SendOptions } from '.'

interface HttpError extends Error {
  statusCode?: number
}

const handleError = async ({ uri, auth }: SendOptions, error: HttpError) => {
  const response = {
    status: 'error',
    error: `Server returned ${error.statusCode} for ${uri}`
  }

  if (typeof error.statusCode === 'undefined') {
    response.error = `Server returned '${error}' for ${uri}`
  } else {
    switch (error.statusCode) {
      case 400:
        response.status = 'badrequest'
        break
      case 401:
      case 403:
        response.status = 'noaccess'
        response.error = (auth) ? 'Not authorized' : 'Service requires authentication'
        break
      case 404:
        response.status = 'notfound'
        response.error = `Could not find the url ${uri}`
        break
      case 408:
        response.status = 'timeout'
    }
  }

  return response
}

export default async function sendToService (sendOptions: SendOptions) {
  const { uri, method, body, headers, retries } = sendOptions

  try {
    const response = await got(uri, {
      method,
      body,
      headers,
      retry: { retries }
    })
    return { status: 'ok', data: response.body }
  } catch (err) {
    return handleError(sendOptions, err)
  }
}
