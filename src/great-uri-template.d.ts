declare module 'great-uri-template' {
  function compile (template: string): (object | string)[]
  function generate (compiled: object, params: object): string
}
