import adapter, { Logger } from './adapter/index.js'

export default Object.assign((logger?: Logger) => adapter(logger), {
  default: adapter,
})
