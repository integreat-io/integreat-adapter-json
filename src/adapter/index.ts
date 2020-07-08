/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import debugFn = require('debug')
import { Method } from 'got'
import {
  compile as compileUri,
  generate as generateUri,
} from 'great-uri-template'
import sendToService from './sendToService'

const debug = debugFn('great:adapter:json')

type Connection = Record<string, unknown>

type DataProperty = string | number | boolean | Record<string, unknown>

interface Data {
  [key: string]: DataProperty
}

export type RequestData = Data | Data[] | DataProperty | null

interface Params {
  [key: string]: DataProperty
}

export type Headers = Record<string, string>

export interface Request {
  action: string
  data?: string | RequestData
  endpoint?: CompiledOptions
  params?: Params
  headers?: Headers
  auth?: Record<string, string | number> | boolean | null
}

export interface Response {
  status: string
  data?: Data | Data[] | DataProperty | null
  error?: string
}

export interface Options {
  baseUri?: string | null
  uri?: string
  headers?: Headers
  method?: Method
  retries?: number
  timeout?: number
  authAsQuery?: boolean
  [key: string]: unknown
}

export interface CompiledOptions {
  baseUri?: string | null
  uri?: (string | Record<string, unknown>)[]
  headers?: Headers
  method?: Method
  retries?: number
  timeout?: number
  authAsQuery?: boolean
  [key: string]: unknown
}

export interface Logger {
  info: (message: string, ...meta: unknown[]) => void
  error: (message: string, ...meta: unknown[]) => void
}

export interface SendOptions {
  uri: string
  method: Method
  body?: string
  headers: Headers
  retries?: number
  timeout?: number
  auth?: Record<string, unknown> | boolean | null
}

const selectMethod = (endpoint: CompiledOptions, data?: string | RequestData) =>
  endpoint.method || (data ? 'PUT' : 'GET')

const isValidData = (data?: string | RequestData): data is string | undefined =>
  typeof data === 'string' || data === undefined

const createHeaders = (
  endpoint: CompiledOptions,
  hasData: boolean,
  headers?: Headers,
  auth?: Record<string, unknown> | boolean | null
) => ({
  ...(hasData ? { 'Content-Type': 'application/json' } : {}),
  ...endpoint.headers,
  ...headers,
  ...(auth === true || endpoint.authAsQuery === true ? {} : auth),
})

const createQueryString = (params: Params) =>
  Object.keys(params)
    .map(
      // eslint-disable-next-line security/detect-object-injection
      (key) => `${key.toLowerCase()}=${encodeURIComponent(String(params[key]))}`
    )
    .join('&')

const appendQueryParams = (uri: string, params: Params) =>
  `${uri}${uri.indexOf('?') >= 0 ? '&' : '?'}${createQueryString(params)}`

const removeDanglingQuestionMark = (uri: string) =>
  uri.endsWith('?') ? uri.slice(0, -1) : uri

const addAuthToUri = (
  uri: string,
  endpoint: CompiledOptions,
  auth?: Record<string, string | number> | boolean | null
) => {
  if (uri && endpoint.authAsQuery === true && auth && auth !== true) {
    return appendQueryParams(removeDanglingQuestionMark(uri), auth)
  }
  return uri
}

const logRequest = (request: SendOptions, logger?: Logger) => {
  const message = `Sending ${request.method} ${request.uri}`
  debug('%s: %o', message, request.body)
  if (logger) {
    logger.info(message, request)
  }
}

const logResponse = (
  response: Response,
  { uri, method }: SendOptions,
  logger?: Logger
) => {
  const { status, error } = response
  const message =
    status === 'ok'
      ? `Success from ${method} ${uri}`
      : `Error '${status}' from ${method} ${uri}: ${error}`
  debug('%s: %o', message, response)
  if (logger) {
    if (status === 'ok') {
      logger.info(message, response)
    } else {
      logger.error(message, response)
    }
  }
}

function joinUris(baseUri?: string | null, uri?: string) {
  if (baseUri && uri) {
    if (baseUri.endsWith('/') && uri.startsWith('/')) {
      return baseUri + uri.substr(1)
    } else if (!baseUri.endsWith('/') && !uri.startsWith('/')) {
      return baseUri + '/' + uri
    } else {
      return baseUri + uri
    }
  } else {
    return uri ? uri : baseUri
  }
}

export default (logger?: Logger) => ({
  authentication: 'asHttpHeaders',

  /**
   * Prepare endpoint options for later use by the adapter.
   * The endpoint options are only used by the adapter.
   * Might also be given service options, which are also adapter specific.
   */
  prepareEndpoint(endpointOptions: Options, serviceOptions?: Options) {
    const options = { ...serviceOptions, ...endpointOptions }
    const { uri: uriTemplate, baseUri } = options

    const uri = joinUris(baseUri, uriTemplate)

    return {
      ...options,
      uri: uri ? compileUri(uri) : undefined,
    }
  },

  /**
   * Connect to service.
   * For the json adapter, this will only return the connection object –
   * whatever it is.
   */
  connect: async (
    _serviceOptions: Options,
    _auth: Record<string, unknown> | null,
    connection: Connection | null
  ) => connection,

  /**
   * Serialize request data before sending to the service.
   * Returns request with the data stringified as JSON.
   */
  async serialize(request: Request): Promise<Request> {
    const { data } = request
    return {
      ...request,
      data: data ? JSON.stringify(data) : null,
    }
  },

  /**
   * Send the given data to the url, and return status and data.
   * This is used for both retrieving and sending data, and Integreat will
   * handle the preparation of the sent and the retrieved data.
   *
   * If an auth object is provided, it is expected to be in the form of http
   * headers and added to the request's headers.
   */
  async send(
    { endpoint, data, auth, params = {}, headers: reqHeaders }: Request,
    _connection?: Connection | null
  ): Promise<Response> {
    if (!endpoint || !endpoint.uri) {
      return { status: 'error', error: 'No endpoint specified in the request' }
    }

    if (data === null || data === '') {
      data = undefined
    }

    if (!isValidData(data)) {
      return { status: 'badrequest', error: 'Request data is not valid JSON' }
    }

    const uri = addAuthToUri(
      generateUri(endpoint.uri, { ...endpoint, ...params }),
      endpoint,
      auth
    )
    const method = selectMethod(endpoint, data)
    const retries = endpoint.retries ?? 0
    const timeout = endpoint.timeout ?? 120000
    const headers = createHeaders(
      endpoint,
      data !== undefined,
      reqHeaders,
      auth
    )

    const request = { uri, method, body: data, headers, retries, timeout }

    if (params.dryrun) {
      return { status: 'dryrun', data: request }
    }

    logRequest(request, logger)
    const response = await sendToService({ ...request, auth })
    logResponse(response, request, logger)

    return response
  },

  /**
   * Normalize response data from the service.
   * Returns the response parsed from a JSON string.
   */
  async normalize(response: Response, _request: Request): Promise<Response> {
    const data =
      response.data === undefined || response.data === '' ? null : response.data

    try {
      return {
        ...response,
        data: typeof data === 'string' ? JSON.parse(data) : data,
      }
    } catch (error) {
      return {
        status: 'badresponse',
        error: 'Response data is not valid JSON',
      }
    }
  },

  /**
   * Disconnect from service.
   * For the json adapter, this will do nothing.
   */
  disconnect: async (_connection: Connection | null) => {
    return
  },
})
