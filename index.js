'use strict'
const isArray = Array.isArray
const isObject = x => x !== null && typeof x === 'object'
const isBoolean = x => typeof x === 'boolean'
class ParseError extends Error {
  constructor (message, optionName, modulePath, optionPath) {
    super(`${message} -- ${optionName}`)
    this.optionName = optionName
    this.modulePath = modulePath
    this.optionPath = optionPath
  }
}
ParseError.prototype.name = 'ParseError'
const constants = {
  NO_EXTRA_ARGUMENT: "doesn't accept extra arguments",
  MISSING_ARGUMENT: 'missing option argument',
  INVAILD_OPTION: 'invalid option',
  CANT_SET_VALUE: "can't set value of option"
}
function parse (argv, options, modulePath = [], optionPath = []) {
  // return value
  const opts = {_:
    options._ === null
      ? null
      : options._ === undefined
        ? []
        : options._.slice()
  }

  // cache options
  const set = [{}, {}, {}]
  const reset = [{}, {}, {}]

  for (const opt in options) {
    const option = options[opt]

    // proc option.def
    if (isArray(option.def)) {
      opts[opt] = option.def.slice()
    } else if (isObject(option.def)) {
      opts[opt] = null
    } else {
      opts[opt] = option.def
    }

    // proc option.set
    if (option.set) {
      for (const name of option.set) {

        if (name[0] === '-') {
          if (name[1] === '-') {

          }
          if (name.length !== 1) {
            keywordsSet[name.slice(1)] = opt
          }
        } else {
          keywordsSet[name] = opt
        }
      }
      
    }

    // proc option.reset
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

  // main loop: an on-line algorithm
  let i, optNeedArg, nameNeedArg
  for (i = 0; i < argv.length; ++i) {
    const cur = argv[i]
    if (cur[0] === '-') {
      if (cur[1] === '-') {
        if (cur.length === 2) {
          if (optNeedArg) { // leaf (/^--$/.test(cur) && optNeedArg) // example: --opt-need-arg --
            if (isArray(options[optNeedArg].def)) {
              opts[optNeedArg].push(cur)
            } else {
              opts[optNeedArg] = cur
            }
            optNeedArg = undefined
          } else { // leaf (/^--$/.test(cur) && !optNeedArg) // example: --
            if (opts._ === null) {
              throw new ParseError(constants.NO_EXTRA_ARGUMENT, cur, modulePath, optionPath)
            } else {
              for (++i; i < argv.length; ++i) {
                opts._.push(argv[i])
              }
              return opts
            }
          }
        } else {
          if (optNeedArg) { // leaf (optNeedArg && leaf: /^--.+$/.test(cur)) // example: --opt-need-arg --opt
            throw new ParseError(constants.MISSING_ARGUMENT, nameNeedArg, modulePath, optionPath)
          } else {
            const eq = cur.indexOf('=', 2)
            if (~eq) { // leaf (!optNeedArg && /^--.+=.*$/.test(cur)) // example: --opt-need-arg=value
              const name = cur.slice(2)
              const optSet = namesSet[name]
              if (optSet) {
                const def = options[optSet].def
                if (isBoolean(def)) {
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
                  throw new ParseError(constants.INVAILD_OPTION, name, modulePath, optionPath)
                }
              }
            } else { // leaf (!optNeedArg && /^--[^=]+$/.test(cur)) // example: --opt-need-arg value
              const name = cur.slice(2, eq)
              const optSet = namesSet[name]
              if (optSet) {
                const def = options[optSet].def
                if (isBoolean(def)) {
                  throw new ParseError(constants.CANT_SET_VALUE, name, modulePath, optionPath)
                } else if (isArray(def)) {
                  opts[optSet].push(cur.slice(eq + 1))
                } else if (isObject(def)) {
                  throw new ParseError(constants.CANT_SET_VALUE, name, modulePath, optionPath)
                } else {
                  opts[optSet] = cur.slice(eq + 1)
                }
              } else {
                const optReset = namesReset[name]
                if (optReset) {
                  throw new ParseError(constants.CANT_SET_VALUE, name, modulePath, optionPath)
                } else {
                  throw new ParseError(constants.INVAILD_OPTION, name, modulePath, optionPath)
                }
              }
            }
          }
        }
      } else {
        if (cur.length === 1) {
          if (optNeedArg) { // leaf (/^-$/.test(cur) && optNeedArg) // example: --opt-need-arg -
            if (isArray(options[optNeedArg].def)) {
              opts[optNeedArg].push(cur)
            } else {
              opts[optNeedArg] = cur
            }
            optNeedArg = undefined
          } else { // leaf (/^-$/.test(cur) && !optNeedArg) // example: -
            if (opts._ === null) {
              throw new ParseError(constants.NO_EXTRA_ARGUMENT, cur, modulePath, optionPath)
            } else {
              opts._.push(cur)
            }
          }
        } else { // leaf (/^-[^-].*$/.test(cur)) // example: -czf value
          if (optNeedArg) {
            throw new ParseError(constants.MISSING_ARGUMENT, nameNeedArg, modulePath, optionPath)
          } else {
            let last = cur.length - 1
            for (let j = 1; j < last; ++j) {
              const name = cur[j]
              const optSet = namesSet[name]
              if (optSet) {
                const def = options[optSet].def
                if (isBoolean(def)) {
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
                  throw new ParseError(constants.INVAILD_OPTION, name, modulePath, optionPath)
                }
              }
            }
            if (last) {
              const name = cur[last]
              const optSet = namesSet[name]
              if (optSet) {
                const def = options[optSet].def
                if (isBoolean(def)) {
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
                  throw new ParseError(constants.INVAILD_OPTION, name, modulePath, optionPath)
                }
              }
            }
          }
        }
      }
    } else {
      if (optNeedArg) { // leaf (/^[^-]/.test(cur) && optNeedArg) // example: --opt-need-arg some-words
        if (isArray(options[optNeedArg].def)) {
          opts[optNeedArg].push(cur)
        } else {
          opts[optNeedArg] = cur
        }
        optNeedArg = undefined
      } else { // leaf (/^[^-]/.test(cur) && !optNeedArg) // example: some-words
        const optSet = keywordsSet[cur]
        if (optSet) {
          const def = options[optSet].def
          if (isBoolean(def)) {
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
              throw new ParseError(constants.NO_EXTRA_ARGUMENT, cur, modulePath, optionPath)
            }
            opts._.push(cur)
          }
        }
      }
    }
  }

  // last check: if there are an option need argument
  if (optNeedArg) {
    throw new ParseError(constants.MISSING_ARGUMENT, nameNeedArg, modulePath, optionPath)
  }

  return opts
}
module.exports = parse
