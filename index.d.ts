/** opt / -o / --opt / -- */
type option = string

interface OptionValueModel {
    /** default value, determines the type of this option */
    def: string | boolean | OptionModuleModel | string[] 
    /** options to set the value */
    set?: option[]
    /** options to reset the value */
    reset?: option[]
}

interface OptionModuleModel {
    [key: string]: OptionValueModel
}

/** parsed argv */
interface OptionModule {
    [key: string]: string | boolean | OptionModule | string[] 
}

/**
 * parse argv
 * @param argv arguments, may be temporarily modified
 * @param i index of first item to start parsing
 * @param module results
 * @param moduleName name of module
 * @param moduleModel defination of module
 * @param callback return true to contiune, called on error or entering a sub-module
 */
declare function parse (argv: ArrayLike<string>, i: number, module: OptionModule, moduleName: string, moduleModel: OptionModuleModel, callback: (err: string, arg: string, module: OptionModule, moduleName: string, moduleModel: OptionModuleModel) => boolean): void

export = parse