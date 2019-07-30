import adapter from './adapter'

const adapters = {
  json: adapter()
}

export = {
  adapters,
  default: { adapters }
}
