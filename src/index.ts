import type { Action, Adapter } from 'integreat'
import { isErrorStatus } from './utils/is.js'
import { setErrorOnAction } from './utils/action.js'

export interface Options extends Record<string, unknown> {
  includeHeaders?: boolean
}

function normalizeJson(data: unknown) {
  if (typeof data === 'string') {
    return data === '' ? null : JSON.parse(data)
  } else {
    return data
  }
}

function serializeJSON(data: unknown) {
  if (data !== null && data !== undefined) {
    return JSON.stringify(data)
  } else {
    return data
  }
}

const setActionData = (
  action: Action,
  payloadData: unknown,
  responseData: unknown,
) => ({
  ...action,
  payload: {
    ...action.payload,
    ...(payloadData === undefined ? {} : { data: payloadData }),
  },
  ...(action.response && {
    response: {
      ...action.response,
      ...(responseData === undefined ? {} : { data: responseData }),
    },
  }),
})

const removeContentType = (
  headers: Record<string, string | string[] | undefined>,
) =>
  Object.fromEntries(
    Object.entries(headers).filter(
      ([key]) => key.toLowerCase() !== 'content-type',
    ),
  )

function setContentType(
  defaultType: string,
  headers: Record<string, string | string[] | undefined> = {},
) {
  const contentKey = Object.keys(headers).find(
    (key) => key.toLowerCase() === 'content-type',
  )
  const contentType =
    (typeof contentKey === 'string' && headers[contentKey]) || defaultType // eslint-disable-line security/detect-object-injection
  return { ...removeContentType(headers), 'Content-Type': contentType }
}

// Set on headers on payload for outgoing action, and on response for incoming
// action
const setJSONHeaders = (action: Action) => ({
  ...action,
  payload: action.payload.data
    ? {
        ...action.payload,
        headers: setContentType('application/json', action.payload.headers),
      }
    : action.payload,
  response: action.response?.data
    ? {
        ...action.response,
        headers: setContentType('application/json', action.response?.headers),
      }
    : action.response,
})

const wrapResponseData = (action: Action) => ({
  ...action,
  response: { ...action.response, data: { $value: action.response?.data } },
})

const adapter: Adapter = {
  prepareOptions({ includeHeaders = true }: Options, _serviceId) {
    return { includeHeaders }
  },

  async normalize(action, _options) {
    let payloadData, responseData

    try {
      payloadData = normalizeJson(action.payload.data)
    } catch {
      return setErrorOnAction(
        action,
        'Payload data was not valid JSON',
        'badrequest',
      )
    }
    try {
      responseData = normalizeJson(action.response?.data)
    } catch {
      if (!isErrorStatus(action.response?.status)) {
        return setErrorOnAction(
          action,
          'Response data was not valid JSON',
          'badresponse',
        )
      } else {
        return wrapResponseData(action)
      }
    }

    return setActionData(action, payloadData, responseData)
  },

  async serialize(action, { includeHeaders = true }: Options) {
    const payloadData = serializeJSON(action.payload.data)
    const responseData = serializeJSON(action.response?.data)

    const ret = setActionData(action, payloadData, responseData)

    return includeHeaders ? setJSONHeaders(ret) : ret
  },
}

export default adapter
