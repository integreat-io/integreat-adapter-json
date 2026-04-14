import adapter, { type Logger } from './adapter/index.js'

export type {
  Logger,
  Request,
  RequestData,
  Response,
  Options,
  CompiledOptions,
  Headers,
  SendOptions,
} from './adapter/index.js'

export default Object.assign((logger?: Logger) => adapter(logger), {
  default: adapter,
})
