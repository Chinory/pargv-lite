'use strict'
const isArray = Array.isArray
const isObject = x => x !== null && typeof x === 'object'
class ParseError extends Error {
  constructor (message, optionName, modulePath, optionPath) {
    super(`${message} -- ${optionName}`)
    this.name = 'ParseError'
    this.optionName = optionName
    this.modulePath = modulePath
    this.optionPath = optionPath
  }
}
const strings = {
  NO_EXTRA_ARGUMENT: "doesn't accept extra arguments",
  MISSING_ARGUMENT: 'missing option argument',
  INVAILD_OPTION: 'invalid option',
  CANT_SET_VALUE: "can't set value of option"
}
function parse (argv, options, modulePath=[], optionPath=[]) {
  const opts = {_: options._ === null ? null : (options._ === undefined ? [] : options._.slice())}
  const namesSet = {}
  const namesReset = {}
  const keywordsSet = {}
  const keywordsReset = {}
  for (const opt in options) {
    if (opt !== '_') {
      const option = options[opt]
      if (isArray(option.def)) {
        opts[opt] = option.def.slice()
      } else if (isObject(option.def)) {
        opts[opt] = null
      } else {
        opts[opt] = option.def
      }
      if (option.set) {
        for (const name of option.set) {
          if (name.length !== 0) {
            if (name[0] === '-') {
              if (name.length !== 1) {
                keywordsSet[name.slice(1)] = opt
              }
            } else {
              namesSet[name] = opt  
            }
          }
        }
      }
      if (option.reset && (isArray(option.def) || !isObject(option.def))) {
        for (const name of option.reset) {
          if (name.length !== 0) {
            if (name[0] === '-') {
              if (name.length !== 1) {
                keywordsReset[name.slice(1)] = opt
              }
            } else {
              namesReset[name] = opt
            }
          }
        }
      }
    }
  }
  let i, optNeedArg, nameNeedArg
  for (i = 0; i < argv.length; ++i) {
    const cur = argv[i]
    if (cur[0] === '-') {
      if (cur[1] === '-') {
        if (cur.length === 2) {
          if (optNeedArg) {
            if (isArray(options[optNeedArg].def)) {
              opts[optNeedArg].push(cur)
            } else {
              opts[optNeedArg] = cur
            }
            optNeedArg = undefined
          } else {
            if (opts._ === null) {
              throw new ParseError(strings.NO_EXTRA_ARGUMENT, cur, modulePath, optionPath)
            }
            for (++i; i < argv.length; ++i) {
              opts._.push(argv[i])
            }
            return opts
          }
        } else {
          if (optNeedArg) {
            throw new ParseError(strings.MISSING_ARGUMENT, nameNeedArg, modulePath, optionPath)
          }
          const eq = cur.indexOf('=', 2)
          if (eq === -1) {
            const name = cur.slice(2)
            const optSet = namesSet[name]
            if (optSet) {
              const def = options[optSet].def
              if (typeof def === 'boolean') {
                opts[optSet] = !def
              } else if (isArray(def)) {
                optNeedArg = optSet
                nameNeedArg = name
              } else if (isObject(def)) {
                modulePath.push(optSet)
                optionPath.push(name)
                opts[optSet] = parse(argv.slice(i + 1), def, modulePath, optionPath)
                return opts
              } else {
                optNeedArg = optSet
                nameNeedArg = name
              }
            } else {
              const optReset = namesReset[name]
              if (optReset) {
                const def = options[optReset].def
                if (isArray(def)) {
                  opts[optReset] = def.slice()
                } else {
                  opts[optReset] = def
                }
              } else {
                throw new ParseError(strings.INVAILD_OPTION, name, modulePath, optionPath)
              }
            }
          } else {
            const name = cur.slice(2, eq)
            const optSet = namesSet[name]
            if (optSet) {
              const def = options[optSet].def
              if (typeof def === 'boolean') {
                throw new ParseError(strings.CANT_SET_VALUE, name, modulePath, optionPath)
              } else if (isArray(def)) {
                opts[optSet].push(cur.slice(eq + 1))
              } else if (isObject(def)) {
                throw new ParseError(strings.CANT_SET_VALUE, name, modulePath, optionPath)
              } else {
                opts[optSet] = cur.slice(eq + 1)
              }
            } else {
              const optReset = namesReset[name]
              if (optReset) {
                throw new ParseError(strings.CANT_SET_VALUE, name, modulePath, optionPath)
              } else {
                throw new ParseError(strings.INVAILD_OPTION, name, modulePath, optionPath)
              }
            }
          }
        }
      } else {
        if (cur.length === 1) {
          if (optNeedArg) {
            if (isArray(options[optNeedArg].def)) {
              opts[optNeedArg].push(cur)
            } else {
              opts[optNeedArg] = cur
            }
            optNeedArg = undefined
          } else {
            if (opts._ === null) {
              throw new ParseError(strings.NO_EXTRA_ARGUMENT, cur, modulePath, optionPath)
            }
            opts._.push(cur)
          }
        } else {
          if (optNeedArg) {
            throw new ParseError(strings.MISSING_ARGUMENT, nameNeedArg, modulePath, optionPath)
          }
          let last = cur.length - 1
          for (let j = 1; j < last; ++j) {
            const name = cur[j]
            const optSet = namesSet[name]
            if (optSet) {
              const def = options[optSet].def
              if (typeof def === 'boolean') {
                opts[optSet] = !def
              } else {
                if (isArray(def)) {
                  opts[optSet].push(cur.slice(j + 1))
                } else if (isObject(def)) {
                  const argvSub = argv.slice(i)
                  argvSub[0] = '-' + argvSub[0].slice(j + 1)
                  modulePath.push(optSet)
                  optionPath.push(name)
                  opts[optSet] = parse(argvSub, def, modulePath, optionPath)
                  return opts
                } else {
                  opts[optSet] = cur.slice(j + 1)
                }
                last = undefined
                break
              }
            } else {
              const optReset = namesReset[name]
              if (optReset) {
                const def = options[optReset].def
                if (isArray(def)) {
                  opts[optReset] = def.slice()
                } else {
                  opts[optReset] = def
                }
              } else {
                throw new ParseError(strings.INVAILD_OPTION, name, modulePath, optionPath)
              }
            }
          }
          if (last) {
            const name = cur[last]
            const optSet = namesSet[name]
            if (optSet) {
              const def = options[optSet].def
              if (typeof def === 'boolean') {
                opts[optSet] = !def
              } else if (isArray(def)) {
                optNeedArg = optSet
                nameNeedArg = name
              } else if (isObject(def)) {
                modulePath.push(optSet)
                optionPath.push(name)
                opts[optSet] = parse(argv.slice(i + 1), def, modulePath, optionPath)
                return opts
              } else {
                optNeedArg = optSet
                nameNeedArg = name
              }
            } else {
              const optReset = namesReset[name]
              if (optReset) {
                const def = options[optReset].def
                if (isArray(def)) {
                  opts[optReset] = def.slice()
                } else {
                  opts[optReset] = def
                }
              } else {
                throw new ParseError(strings.INVAILD_OPTION, name, modulePath, optionPath)
              }
            }
          }
        }
      }
    } else {
      if (optNeedArg) {
        if (isArray(options[optNeedArg].def)) {
          opts[optNeedArg].push(cur)
        } else {
          opts[optNeedArg] = cur
        }
        optNeedArg = undefined
      } else {
        const optSet = keywordsSet[cur]
        if (optSet) {
          const def = options[optSet].def
          if (typeof def === 'boolean') {
            opts[optSet] = !def
          } else if (isArray(def)) {
            optNeedArg = optSet
            nameNeedArg = cur
          } else if (isObject(def)) {
            modulePath.push(optSet)
            optionPath.push(cur)
            opts[optSet] = parse(argv.slice(i + 1), def, modulePath, optionPath)
            return opts
          } else {
            optNeedArg = optSet
            nameNeedArg = cur
          }
        } else {
          const optReset = keywordsReset[cur]
          if (optReset) {
            const def = options[optReset].def
            if (isArray(def)) {
              opts[optReset] = def.slice()
            } else {
              opts[optReset] = def
            }
          } else {
            if (opts._ === null) {
              throw new ParseError(strings.NO_EXTRA_ARGUMENT, cur, modulePath, optionPath)
            }
            opts._.push(cur)
          }
        }
      }
    }
  }
  if (optNeedArg) {
    throw new ParseError(strings.MISSING_ARGUMENT, nameNeedArg, modulePath, optionPath)
  }
  return opts
}
module.exports = parse
