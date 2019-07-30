import adapter from './adapter'

export = Object.assign(() => adapter(), { default: adapter })
