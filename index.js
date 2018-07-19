'use strict'
module.exports = function parseArgv (argv, options) {
  const opts = {_: []}
  const names = {}
  for (const opt in options) {
    opts[opt] = options[opt].def
    for (const name of options[opt].use) {
      names[name] = opt
    }
  }
  let i, optNeedArg, nameNeedArg
  for (i = 0; i < argv.length; ++i) {
    const cur = argv[i]
    if (cur.startsWith('-')) {
      if (cur.startsWith('-', 1)) {
        if (cur.length === 2) {
          if (optNeedArg) {
            if (opts[optNeedArg] instanceof Array) {
              opts[optNeedArg].push('--')
            } else {
              opts[optNeedArg] = '--'
            }
            optNeedArg = undefined
          } else {
            ++i
            break
          }
        } else {
          const eq = cur.indexOf('=', 2)
          if (eq === -1) {
            const name = cur.slice(2)
            const opt = names[name]
            if (opt) {
              if (typeof opts[opt] === 'boolean') {
                opts[opt] = !options[opt].def
              } else {
                optNeedArg = opt
                nameNeedArg = name
              }
            } else {
              throw new Error(`invalid option -- ${name}`)
            }
          } else {
            const name = cur.slice(2, eq)
            const opt = names[name]
            if (opt) {
              if (typeof opts[opt] === 'boolean') {
                opts[opt] = !options[opt].def
              } else if (opts[opt] instanceof Array) {
                opts[opt].push(cur.slice(eq + 1))
              } else {
                opts[opt] = cur.slice(eq + 1)
              }
            } else {
              throw new Error(`invalid option -- ${name}`)
            }
          }
        }
      } else {
        if (optNeedArg) {
          if (cur.length === 1) {
            if (opts[optNeedArg] instanceof Array) {
              opts[optNeedArg].push('-')
            } else {
              opts[optNeedArg] = '-'
            }
            optNeedArg = undefined
          } else {
            throw new Error(`missing option argument -- ${nameNeedArg}`)
          }
        } else {
          let last = cur.length - 1
          for (let j = 1; j < last; ++j) {
            const name = cur[j]
            const opt = names[name]
            if (opt) {
              if (typeof opts[opt] === 'boolean') {
                opts[opt] = !options[opt].def
              } else {
                if (opts[opt] instanceof Array) {
                  opts[opt].push(cur.slice(j + 1))
                } else {
                  opts[opt] = cur.slice(j + 1)
                }
                last = undefined
                break
              }
            } else {
              throw new Error(`invalid option -- ${name}`)
            }
          }
          if (last) {
            const name = cur[last]
            const opt = names[name]
            if (opt) {
              if (typeof opts[opt] === 'boolean') {
                opts[opt] = !options[opt].def
              } else {
                optNeedArg = opt
                nameNeedArg = name
              }
            } else {
              throw new Error(`invalid option -- ${name}`)
            }
          }
        }
      }
    } else {
      if (optNeedArg) {
        if (opts[optNeedArg] instanceof Array) {
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
    throw new Error(`missing option argument -- ${nameNeedArg}`)
  }
  for (const nopt = opts._; i < argv.length; ++i) {
    nopt.push(argv[i])
  }
  return opts
}
