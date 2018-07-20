'use strict'
module.exports = function parseArgv (argv, options, modulePath=[], optionPath=[]) {
  const opts = {_: options._ === null ? null : (options._ && options._.slice() || [])}
  const namesSet = {}
  const namesReset = {}
  const keywordsSet = {}
  const keywordsReset = {}
  for (const opt in options) {
    if (opt !== '_') {
      if (options[opt].def instanceof Array) {
        opts[opt] = options[opt].def.slice()
      } else if (options[opt].def instanceof Object) {
        opts[opt] = null
      } else {
        opts[opt] = options[opt].def
      }
      if (options[opt].set) {
        for (const name of options[opt].set) {
          if (name[0] === '-') {
            keywordsSet[name.slice(1)] = opt
          } else {
            namesSet[name] = opt
          }
        }
      }
      if (options[opt].reset) {
        for (const name of options[opt].reset) {
          // if (!(options[opt].def instanceof Array) && options[opt].def instanceof Object) {
          //   throw new Error(`can't reset module option -- ${name}`)
          // }
          if (name[0] === '-') {
            keywordsReset[name.slice(1)] = opt
          } else {
            namesReset[name] = opt
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
            if (options[optNeedArg].def instanceof Array) {
              opts[optNeedArg].push(cur)
            } else {
              opts[optNeedArg] = cur
            }
            optNeedArg = undefined
          } else {
            if (opts._ === null) {
              throw new Error(`doesn't accept more arguments -- ${opts._[i]}`)
            }
            for (++i; i < argv.length; ++i) {
              opts._.push(argv[i])
            }
          }
        } else {
          if (optNeedArg) {
            throw new Error(`missing option argument -- ${nameNeedArg}`)
          }
          const eq = cur.indexOf('=', 2)
          if (eq === -1) {
            const name = cur.slice(2)
            const optSet = namesSet[name]
            if (optSet) {
              if (typeof options[optSet].def === 'boolean') {
                opts[optSet] = !options[optSet].def
              } else if (options[optSet].def instanceof Array) {
                optNeedArg = optSet
                nameNeedArg = name
              } else if (options[optSet].def instanceof Object) {
                modulePath.push(optSet)
                optionPath.push(name)
                opts[optSet] = parseArgv(argv.slice(i + 1), options[optSet].def, modulePath, optionPath)
                return opts
              } else {
                optNeedArg = optSet
                nameNeedArg = name
              }
            } else {
              const optReset = namesReset[name]
              if (optReset) {
                if (options[optReset].def instanceof Array) {
                  opts[optReset] = options[optReset].def.slice()
                } else {
                  opts[optReset] = options[optReset].def
                }
              } else {
                throw new Error(`invalid option -- ${name}`)
              }
            }
          } else {
            const name = cur.slice(2, eq)
            const optSet = namesSet[name]
            if (optSet) {
              if (typeof options[optSet].def === 'boolean') {
                throw new Error(`can't set value of option -- ${name}`)
              } else if (options[optSet].def instanceof Array) {
                opts[optSet].push(cur.slice(eq + 1))
              } else if (options[optSet].def instanceof Object) {
                throw new Error(`can't set value of option -- ${name}`)
              } else {
                opts[optSet] = cur.slice(eq + 1)
              }
            } else {
              const optReset = namesReset[name]
              if (optReset) {
                throw new Error(`can't set value of option -- ${name}`)
              } else {
                throw new Error(`invalid option -- ${name}`)
              }
            }
          }
        }
      } else {
        if (cur.length === 1) {
          if (optNeedArg) {
            if (options[optNeedArg].def instanceof Array) {
              opts[optNeedArg].push(cur)
            } else {
              opts[optNeedArg] = cur
            }
            optNeedArg = undefined
          } else {
            if (opts._ === null) {
              throw new Error(`doesn't accept more arguments -- ${cur}`)
            }
            opts._.push(cur)
          }
        } else {
          if (optNeedArg) {
            throw new Error(`missing option argument -- ${nameNeedArg}`)
          }
          let last = cur.length - 1
          for (let j = 1; j < last; ++j) {
            const name = cur[j]
            const optSet = namesSet[name]
            if (optSet) {
              if (typeof options[optSet].def === 'boolean') {
                opts[optSet] = !options[optSet].def
              } else {
                if (options[optSet].def instanceof Array) {
                  opts[optSet].push(cur.slice(j + 1))
                } else if (options[optSet].def instanceof Object) {
                  const argv_sub = argv.slice(i)
                  argv_sub[0] = '-' + argv_sub[0].slice(j + 1)
                  modulePath.push(optSet)
                  optionPath.push(name)
                  opts[optSet] = parseArgv(argv_sub, options[optSet].def, modulePath, optionPath)
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
                if (options[optReset].def instanceof Array) {
                  opts[optReset] = options[optReset].def.slice()
                } else {
                  opts[optReset] = options[optReset].def
                }
              } else {
                throw new Error(`invalid option -- ${name}`)
              }
            }
          }
          if (last) {
            const name = cur[last]
            const optSet = namesSet[name]
            if (optSet) {
              if (typeof options[optSet].def === 'boolean') {
                opts[optSet] = !options[optSet].def
              } else if (options[optSet].def instanceof Array) {
                optNeedArg = optSet
                nameNeedArg = name
              } else if (options[optSet].def instanceof Object) {
                modulePath.push(optSet)
                optionPath.push(name)
                opts[optSet] = parseArgv(argv.slice(i + 1), options[optSet].def, modulePath, optionPath)
                return opts
              } else {
                optNeedArg = optSet
                nameNeedArg = name
              }
            } else {
              const optReset = namesReset[name]
              if (optReset) {
                if (options[optReset].def instanceof Array) {
                  opts[optReset] = options[optReset].def.slice()
                } else {
                  opts[optReset] = options[optReset].def
                }
              } else {
                throw new Error(`invalid option -- ${name}`)
              }
            }
          }
        }
      }
    } else {
      if (optNeedArg) {
        if (options[optNeedArg].def instanceof Array) {
          opts[optNeedArg].push(cur)
        } else {
          opts[optNeedArg] = cur
        }
        optNeedArg = undefined
      } else {
        const optSet = keywordsSet[cur]
        if (optSet) {
          if (typeof options[optSet].def === 'boolean') {
            opts[optSet] = !options[optSet].def
          } else if (options[optSet].def instanceof Array) {
            optNeedArg = optSet
            nameNeedArg = cur
          } else if (options[optSet].def instanceof Object) {
            modulePath.push(optSet)
            optionPath.push(cur)
            opts[optSet] = parseArgv(argv.slice(i + 1), options[optSet].def, modulePath, optionPath)
            return opts
          } else {
            optNeedArg = optSet
            nameNeedArg = cur
          }
        } else {
          const optReset = keywordsReset[cur]
          if (optReset) {
            if (options[optReset].def instanceof Array) {
              opts[optReset] = options[optReset].def.slice()
            } else {
              opts[optReset] = options[optReset].def
            }
          } else {
            if (opts._ === null) {
              throw new Error(`doesn't accept more arguments -- ${cur}`)
            }
            opts._.push(cur)
          }
        }
      }
    }
  }
  if (optNeedArg) {
    throw new Error(`missing option argument -- ${nameNeedArg}`)
  }
  return opts
}
