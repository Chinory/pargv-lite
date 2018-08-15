interface OptionModel {
  def?: boolean | string | string[] | OptionModule
  set?: string[]
  reset?: string[]
}

interface OptionModule {
  [opt: string]: OptionModel
}

interface Options {
  [opt: string]: boolean | string | string[] | Options
}

/**
 * @param argv Arguments to parse.
 * @param options Declaration of options.
 * @param modulePath Parsed module path.
 * @param optionPath Option names of modulePath.
 * @returns Parsed options.
 */
declare function parse (argv: string[], options: OptionModule, modulePath?: string[], optionPath?: string[]): ParsedOptions

export = parse