import adapter, { Logger } from './adapter'

export = Object.assign(
  (logger?: Logger) => adapter(logger),
  { default: adapter }
)
