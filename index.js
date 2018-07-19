'use strict'
module.exports = function parseArgv (argv, options, modePath = '') {
  const opts = {_: []}
  const names = {}
  for (const opt in options) {
    if (typeof options[opt].def === 'boolean' || options[opt].def instanceof Array) {
      opts[opt] = options[opt].def
    } else if (options[opt].def instanceof Object) {
      opts[opt] = null
    } else {
      opts[opt] = options[opt].def
    }
    for (const name of options[opt].use) {
      names[name] = opt
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
            const opt = names[name]
            if (opt) {
              if (typeof options[opt].def === 'boolean') {
                opts[opt] = !options[opt].def
              } else if (options[opt].def instanceof Array) {
                optNeedArg = opt
                nameNeedArg = name
              } else if (options[opt].def instanceof Object) {
                opts[opt] = parseArgv(argv.slice(i + 1), options[opt].def, modePath + `${name}: `)
                return opts
              } else {
                optNeedArg = opt
                nameNeedArg = name
              }
            } else {
              throw new Error(`${modePath}invalid option -- ${name}`)
            }
          } else {
            const name = cur.slice(2, eq)
            const opt = names[name]
            if (opt) {
              if (typeof options[opt].def === 'boolean') {
                opts[opt] = !options[opt].def
              } else if (options[opt].def instanceof Array) {
                opts[opt].push(cur.slice(eq + 1))
              } else if (options[opt].def instanceof Object) {
                throw new Error(`${modePath}mode option syntax error -- ${name}`)
              } else {
                opts[opt] = cur.slice(eq + 1)
              }
            } else {
              throw new Error(`${modePath}invalid option -- ${name}`)
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
            opts._.push(cur)
          }
        } else {
          if (optNeedArg) {
            throw new Error(`${modePath}missing option argument -- ${nameNeedArg}`)
          }
          let last = cur.length - 1
          for (let j = 1; j < last; ++j) {
            const name = cur[j]
            const opt = names[name]
            if (opt) {
              if (typeof options[opt].def === 'boolean') {
                opts[opt] = !options[opt].def
              } else {
                if (options[opt].def instanceof Array) {
                  opts[opt].push(cur.slice(j + 1))
                } else if (options[opt].def instanceof Object) {
                  throw new Error(`${modePath}mode option syntax error -- ${name}`)
                } else {
                  opts[opt] = cur.slice(j + 1)
                }
                last = undefined
                break
              }
            } else {
              throw new Error(`${modePath}invalid option -- ${name}`)
            }
          }
          if (last) {
            const name = cur[last]
            const opt = names[name]
            if (opt) {
              if (typeof options[opt].def === 'boolean') {
                opts[opt] = !options[opt].def
              } else if (options[opt].def instanceof Object) {
                opts[opt] = parseArgv(argv.slice(i + 1), options[opt].def, modePath + `${name}: `)
                return opts
              } else {
                optNeedArg = opt
                nameNeedArg = name
              }
            } else {
              throw new Error(`${modePath}invalid option -- ${name}`)
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
        opts._.push(cur)
      }
    }
  }
  if (optNeedArg) {
    throw new Error(`${modePath}missing option argument -- ${nameNeedArg}`)
  }
  for (const _ = opts._; i < argv.length; ++i) {
    _.push(argv[i])
  }
  return opts
}
