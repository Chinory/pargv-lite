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
    if (argv[i].startsWith('-')) {
      if (optNeedArg) {
        throw new Error(`missing option argument -- ${nameNeedArg}`)
      }
      if (argv[i].startsWith('--')) {
        if (argv[i].length === 2) {
          ++i
          break
        } else {
          const eq = argv[i].indexOf('=', 2)
          if (eq === -1) {
            const name = argv[i].slice(2)
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
            const name = argv[i].slice(2, eq)
            const opt = names[name]
            if (opt) {
              if (typeof opts[opt] === 'boolean') {
                opts[opt] = !options[opt].def
              } else if (opts[opt] instanceof Array) {
                opts[opt].push(argv[i].slice(eq + 1))
              } else {
                opts[opt] = argv[i].slice(eq + 1)
              }
            } else {
              throw new Error(`invalid option -- ${name}`)
            }
          }
        }
      } else {
        for (const name of argv[i].slice(1, -1)) {
          const opt = names[name]
          if (opt) {
            if (typeof opts[opt] === 'boolean') {
              opts[opt] = !options[opt].def
            } else {
              throw new Error(`missing option argument -- ${name}`)
            }
          } else {
            throw new Error(`invalid option -- ${name}`)
          }
        }
        for (const name of argv[i].slice(-1)) {
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
    } else if (optNeedArg) {
      if (opts[optNeedArg] instanceof Array) {
        opts[optNeedArg].push(argv[i])
      } else {
        opts[optNeedArg] = argv[i]
      }
      optNeedArg = undefined
    } else {
      opts._.push(argv[i])
    }
  }
  if (optNeedArg) {
    throw new Error(`missing option argument -- ${nameNeedArg}`)
  }
  for (const nopt = opts._; i < argv.length; ++i) {
    nopt.push(arg[i])
  }
  return opts
}
