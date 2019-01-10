import got = require('got')
import { Headers } from '.'

interface SendOptions {
  uri: string,
  method: string,
  data?: string,
  headers: Headers | {},
  auth?: object | boolean | null
}

interface HttpError extends Error {
  statusCode: number
}

const handleError = async (sendOptions: SendOptions, error: HttpError) => {
  const { uri } = sendOptions
  const { statusCode } = error

  const response = {
    status: 'error',
    error: `Server returned ${statusCode} for ${uri}`
  }

  if (typeof statusCode === 'undefined') {
    // No http error
    response.error = `Server returned '${error}' for ${uri}`
  } else if (statusCode === 404) {
    // Not found
    response.status = 'notfound'
    response.error = `Could not find the url ${uri}`
  } else if (statusCode === 401) {
    // Unauthorized
    response.status = 'noaccess'
    response.error = (sendOptions.auth) ? 'Not authorized' : 'Service requires authentication'
  }

  return response
}

export default async function sendToService (sendOptions: SendOptions) {
  const { uri, method, data, headers } = sendOptions

  try {
    const response = await got(uri, {
      method,
      body: data,
      headers
    })
    return { status: 'ok', data: response.body }
  } catch (err) {
    return handleError(sendOptions, err)
  }
}
