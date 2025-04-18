import { isObject } from './utils/is.js'
import type { Transformer } from 'integreat'

const isParsed = (data: unknown) => Array.isArray(data) || isObject(data)

function parse(data: unknown) {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch {
      return undefined
    }
  } else if (isParsed(data)) {
    return data
  }
  return undefined
}

function stringify(data: unknown) {
  return JSON.stringify(data)
}

const json: Transformer = () => () => (data, state) =>
  state.rev ? stringify(data) : parse(data)

export default json
