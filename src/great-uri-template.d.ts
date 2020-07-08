declare module 'great-uri-template' {
  function compile(template: string): (Record<string, unknown> | string)[]
  function generate(
    compiled: (string | Record<string, unknown>)[],
    params: Record<string, unknown> | boolean
  ): string
}
