interface Option {
  def?: boolean | string | string[] | Options | void
  set?: string[]
  reset?: string[]
}

interface Options {
  _?: string[] | null
  [opt: string]: Option
}

interface ParsedOptions {
  _: string[] | null
  [opt: string]: boolean | string | string[] | ParsedOptions | void
}

/**
 * @param argv Arguments to parse.
 * @param options Declaration of options.
 * @param modulePath Parsed module path.
 * @param optionPath Option names of modulePath.
 * @returns Parsed options.
 */
declare function parse (argv: string[], options: Options, modulePath?: string[], optionPath?: string[]): ParsedOptions

export = parse