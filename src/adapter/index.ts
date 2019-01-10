import { compile as compileUri, generate as generateUri } from 'great-uri-template'
import sendToService from './sendToService'

type DataProperty = string | number | boolean | object

interface Data {
  [key: string]: DataProperty
}

export type RequestData = Data | Data[] | DataProperty | null

interface Params {
  [key: string]: any
}

export interface Headers {
  [key: string]: string
}

export interface Request {
  method: string,
  data?: string | RequestData,
  endpoint?: CompiledOptions,
  params?: Params,
  auth?: object | boolean | null
}

export interface Response {
  status: string,
  data?: any,
  error?: string
}

export interface Options {
  baseUri?: string | null,
  uri?: string,
  headers?: Headers | {},
  method?: string
}

export interface CompiledOptions {
  baseUri?: string | null,
  uri: (string | object)[],
  headers?: Headers | {},
  method?: string
}

const selectMethod = (endpoint: CompiledOptions, data?: string | RequestData) =>
  endpoint.method || ((data) ? 'PUT' : 'GET')

export default {
  authentication: 'asHttpHeaders',

  /**
   * Prepare endpoint options for later use by the adapter.
   * The endpoint options are only used by the adapter.
   * Might also be given service options, which are also adapter specific.
   */
  prepareEndpoint (endpointOptions: Options, serviceOptions?: Options) {
    const options = { ...serviceOptions, ...endpointOptions }
    const { uri: uriTemplate, baseUri } = options

    if (!uriTemplate) {
      throw new TypeError('The uri prop is required')
    }

    const uri = compileUri((baseUri || '') + uriTemplate)

    return { ...options, uri }
  },

  connect: async (_serviceOptions: Options, _auth: object | null, connection: object | null) => connection,

  /**
   * Serialize request data before sending to the service.
   * Returns request with the data stringified as JSON.
   */
  async serialize (request: Request): Promise<Request> {
    const { data } = request
    return {
      ...request,
      data: (data) ? JSON.stringify(data) : null
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
  async send ({ endpoint, data = null, auth, params = {} }: Request): Promise<Response> {
    if (!endpoint) {
      return { status: 'error', error: 'No endpoint specified in the request' }
    }

    if (typeof data !== 'string' && data !== null) {
      return { status: 'badrequest', error: 'Request data is not valid JSON' }
    }

    const uri = generateUri(endpoint.uri, params)
    const method = selectMethod(endpoint, data)
    const headers = {
      ...endpoint.headers,
      ...((auth === true) ? {} : auth)
    }

    if (params.dryrun) {
      return {
        status: 'dryrun',
        data: { uri, method, body: data, headers }
      }
    }

    return sendToService({ uri, method, data, headers, auth })
  },

  /**
   * Normalize response data from the service.
   * Returns the response parsed from a JSON string.
   */
  async normalize (response: Response, _request: Request): Promise<Response> {
    const { data = null } = response
    try {
      return {
        ...response,
        data: (typeof data !== 'object') ? JSON.parse(data) : data || null
      }
    } catch (error) {
      return { status: 'badresponse', error: 'Response data is not valid JSON' }
    }
  },

  disconnect: async (_connection: {} | null) => { return }
}
