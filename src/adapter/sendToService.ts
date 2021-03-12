import got, { HTTPError } from 'got'
import { Response, SendOptions } from '.'

const extractFromError = (error: HTTPError | Error) =>
  error instanceof HTTPError
    ? {
        statusCode: error.response.statusCode,
        statusMessage: error.response.statusMessage,
      }
    : {
        statusCode: undefined,
        statusMessage: error.message,
      }

async function handleError(
  { uri, auth }: SendOptions,
  error: HTTPError | Error
) {
  const { statusCode, statusMessage } = extractFromError(error)
  const response = {
    status: 'error',
    error: `Server returned ${statusCode} for ${uri}`,
  }

  if (statusCode === undefined) {
    response.error = `Server returned '${statusMessage}' for ${uri}`
  } else {
    switch (statusCode) {
      case 400:
        response.status = 'badrequest'
        break
      case 401:
      case 403:
        response.status = 'noaccess'
        response.error = auth
          ? 'Not authorized'
          : 'Service requires authentication'
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

export default async function sendToService(
  sendOptions: SendOptions
): Promise<Response> {
  const { uri, method, body, headers, retries, timeout } = sendOptions

  try {
    const response = await got(uri, {
      method,
      body,
      headers,
      retry: retries,
      timeout,
    })
    return {
      status: 'ok',
      data: response.body,
      headers: response.headers as Record<string, string>,
    }
  } catch (err) {
    return handleError(sendOptions, err)
  }
}
