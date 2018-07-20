'use strict'
const reKwHd = /^(\^?)(.+?)(\$?)$/
module.exports = function parseArgv (argv, options, modePath = '') {
  const opts = {_: options._ === null ? null : (options._ && options._.slice() || [])}
  const namesSet = {}
  const namesReset = {}
  const keywordsSet = {}
  const keywordsReset = {}
  const headerNamesSet = {}
  const headerNamesReset = {}
  const headerKeywordsSet = {}
  const headerKeywordsReset = {}
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
          const ma = reKwHd.exec(name)
          if (ma[2]) {
            if (ma[1] && ma[3]) {
              headerKeywordsSet[ma[2]] = opt
            } else if (ma[3]) {
              headerNamesSet[ma[2]] = opt
            } else if (ma[1]) {
              keywordsSet[ma[2]] = opt
            } else {
              namesSet[ma[2]] = opt
            }
          }
        }
      }
      if (options[opt].reset) {
        for (const name of options[opt].reset) {
          // if (!options[opt].def instanceof Array && options[opt].def instanceof Object) {
          //   throw new Error(`${modePath}can not reset module option -- ${name}`)
          // }
          const ma = reKwHd.exec(name)
          if (ma[2]) {
            if (ma[1] && ma[3]) {
              headerKeywordsReset[ma[2]] = opt
            } else if (ma[3]) {
              headerNamesReset[ma[2]] = opt
            } else if (ma[1]) {
              keywordsReset[ma[2]] = opt
            } else {
              namesReset[ma[2]] = opt
            }
          }
        }
      }
    }
  }
  let i, optNeedArg, nameNeedArg
  let iHeader = 0
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
            ++i
            break
          }
        } else {
          if (optNeedArg) {
            throw new Error(`${modePath}missing option argument -- ${nameNeedArg}`)
          }
          const eq = cur.indexOf('=', 2)
          if (eq === -1) {
            const name = cur.slice(2)
            const optHeaderSet = i > iHeader ? undefined : headerNamesSet[name]
            if (optHeaderSet) ++iHeader
            const optSet = optHeaderSet || namesSet[name]
            if (optSet) {
              if (typeof options[optSet].def === 'boolean') {
                opts[optSet] = !options[optSet].def
              } else if (options[optSet].def instanceof Array) {
                optNeedArg = optSet
                nameNeedArg = name
              } else if (options[optSet].def instanceof Object) {
                opts[optSet] = parseArgv(argv.slice(i + 1), options[optSet].def, modePath + `${name}: `)
                return opts
              } else {
                optNeedArg = optSet
                nameNeedArg = name
              }
            } else {
              const optHeaderReset = i > iHeader ? undefined : headerNamesReset[name]
              if (optHeaderReset) ++iHeader
              const optReset = optHeaderReset || namesReset[name]
              if (optReset) {
                if (options[optReset].def instanceof Array) {
                  opts[optReset] = options[optReset].def.slice()
                } else {
                  opts[optReset] = options[optReset].def
                }
              } else {
                if (headerNamesSet[name] || headerNamesReset[name]) {
                  throw new Error(`${modePath}option should be in front -- ${name}`)
                } else {
                  throw new Error(`${modePath}invalid option -- ${name}`)
                }
              }
            }
          } else {
            const name = cur.slice(2, eq)
            const optHeaderSet = i > iHeader ? undefined : headerNamesSet[name]
            if (optHeaderSet) ++iHeader
            const optSet = optHeaderSet || namesSet[name]
            if (optSet) {
              if (typeof options[optSet].def === 'boolean') {
                throw new Error(`${modePath}can't set value of boolean option -- ${name}`)
              } else if (options[optSet].def instanceof Array) {
                opts[optSet].push(cur.slice(eq + 1))
              } else if (options[optSet].def instanceof Object) {
                throw new Error(`${modePath}can't set value of module option -- ${name}`)
              } else {
                opts[optSet] = cur.slice(eq + 1)
              }
            } else {
              const optHeaderReset = i > iHeader ? undefined : headerNamesReset[name]
              if (optHeaderReset) ++iHeader
              const optReset = optHeaderReset || namesReset[name]
              if (optReset) {
                throw new Error(`${modePath}can't set value of reset option -- ${name}`)
              } else if (headerNamesSet[name] || headerNamesReset[name]) {
                throw new Error(`${modePath}option should be in front -- ${name}`)
              } else {
                throw new Error(`${modePath}invalid option -- ${name}`)
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
              throw new Error(`${modePath}don't accept additional arguments -- ${cur}`)
            }
            opts._.push(cur)
          }
        } else {
          if (optNeedArg) {
            throw new Error(`${modePath}missing option argument -- ${nameNeedArg}`)
          }
          let last = cur.length - 1
          for (let j = 1; j < last; ++j) {
            const name = cur[j]
            const optHeaderSet = i > iHeader ? undefined : headerNamesSet[name]
            if (optHeaderSet) ++iHeader
            const optSet = optHeaderSet || namesSet[name]
            if (optSet) {
              if (typeof options[optSet].def === 'boolean') {
                opts[optSet] = !options[optSet].def
              } else {
                if (options[optSet].def instanceof Array) {
                  opts[optSet].push(cur.slice(j + 1))
                } else if (options[optSet].def instanceof Object) {
                  const argv_sub = argv.slice(i)
                  argv_sub[0] = '-' + argv_sub[0].slice(j + 1)
                  opts[optSet] = parseArgv(argv_sub, options[optSet].def, modePath + `${name}: `)
                  return opts
                } else {
                  opts[optSet] = cur.slice(j + 1)
                }
                last = undefined
                break
              }
            } else {
              const optHeaderReset = i > iHeader ? undefined : headerNamesReset[name]
              if (optHeaderReset) ++iHeader
              const optReset = optHeaderReset || namesReset[name]
              if (optReset) {
                if (options[optReset].def instanceof Array) {
                  opts[optReset] = options[optReset].def.slice()
                } else {
                  opts[optReset] = options[optReset].def
                }
              } else {
                if (headerNamesSet[name] || headerNamesReset[name]) {
                  throw new Error(`${modePath}option should be in front -- ${name}`)
                } else {
                  throw new Error(`${modePath}invalid option -- ${name}`)
                }
              }
            }
          }
          if (last) {
            const name = cur[last]
            const optHeaderSet = i > iHeader ? undefined : headerNamesSet[name]
            if (optHeaderSet) ++iHeader
            const optSet = optHeaderSet || namesSet[name]
            if (optSet) {
              if (typeof options[optSet].def === 'boolean') {
                opts[optSet] = !options[optSet].def
              } else if (options[optSet].def instanceof Array) {
                optNeedArg = optSet
                nameNeedArg = name
              } else if (options[optSet].def instanceof Object) {
                opts[optSet] = parseArgv(argv.slice(i + 1), options[optSet].def, modePath + `${name}: `)
                return opts
              } else {
                optNeedArg = optSet
                nameNeedArg = name
              }
            } else {
              const optHeaderReset = i > iHeader ? undefined : headerNamesReset[name]
              if (optHeaderReset) ++iHeader
              const optReset = optHeaderReset || namesReset[name]
              if (optReset) {
                if (options[optReset].def instanceof Array) {
                  opts[optReset] = options[optReset].def.slice()
                } else {
                  opts[optReset] = options[optReset].def
                }
              } else {
                if (headerNamesSet[name] || headerNamesReset[name]) {
                  throw new Error(`${modePath}option should be in front -- ${name}`)
                } else {
                  throw new Error(`${modePath}invalid option -- ${name}`)
                }
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
        ++iHeader
        optNeedArg = undefined
      } else {
        const optHeaderSet = i > iHeader ? undefined : headerKeywordsSet[cur]
        if (optHeaderSet) ++iHeader
        const optSet = optHeaderSet || keywordsSet[cur]
        if (optSet) {
          if (typeof options[optSet].def === 'boolean') {
            opts[optSet] = !options[optSet].def
          } else if (options[optSet].def instanceof Array) {
            optNeedArg = optSet
            nameNeedArg = cur
          } else if (options[optSet].def instanceof Object) {
            opts[optSet] = parseArgv(argv.slice(i + 1), options[optSet].def, modePath + `${cur}: `)
            return opts
          } else {
            optNeedArg = optSet
            nameNeedArg = cur
          }
        } else {
          const optHeaderReset = i > iHeader ? undefined : headerKeywordsReset[cur]
          if (optHeaderReset) ++iHeader
          const optReset = optHeaderReset || keywordsReset[cur]
          if (optReset) {
            if (options[optReset].def instanceof Array) {
              opts[optReset] = options[optReset].def.slice()
            } else {
              opts[optReset] = options[optReset].def
            }
          } else {
            if (opts._ === null) {
              throw new Error(`${modePath}don't accept additional arguments -- ${cur}`)
            }
            opts._.push(cur)
          }
        }
      }
    }
  }
  if (optNeedArg) {
    throw new Error(`${modePath}missing option argument -- ${nameNeedArg}`)
  }
  if (i < argv.length) {
      if (opts._ === null) {
        throw new Error(`${modePath}don't accept additional arguments -- ${opts._[i]}`)
      }
      for (const _ = opts._; i < argv.length; ++i) {
        _.push(argv[i])
      }
    }
  return opts
}
