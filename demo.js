#!/usr/bin/env node
'use strict'
const BASENAME = require('path').basename(process.argv[1])

const opts = (() => {
  const parseArgv = require('.')
  const options = {
    action: { use: ['n', 'dry-run'], def: true },
    verbose: { use: ['v', 'verbose'], def: false },
    mode: { use: ['m', 'mode'], def: 'default' },
    includes: { use: ['i', 'include'], def: [] },
    unopened_option: { use: [], def: false },
    help: { use: ['h', 'help'], def: false },
    version: { use: ['version'], def: false },
    rm: { use: ['r', 'rm'], def: {
      force: { use: ['f', 'force'], def: false },
      prompt: { use: ['i'], def: false },
      prompt_once: { use: ['I'], def: false },
      interactive: { use: ['interactive'], def: 'always' },
      one_file_system: { use: ['one-file-system'], def: false },
      preserve_root: { use: ['no-preserve-root'], def: true },
      recursive: { use: ['r', 'R', 'recursive'], def: false },
      remove_empty_dir: { use: ['d', 'dir'], def: false },
      verbose: { use: ['v', 'verbose'], def: false },
      help: { use: ['h', 'help'], def: false },
      dev: { use: ['dev'], def: {
        action: { use: ['n', 'dry-run'], def: true },
        verbose: { use: ['v', 'verbose'], def: false },
        help: { use: ['h', 'help'], def: false },
      }}
    }}
  }
  try {
    return parseArgv(process.argv.slice(2), options)
  } catch (err) {
    console.error(`${BASENAME}: ${err.message}`)
    console.error(`Try '${BASENAME} --help' for more information.`)
    process.exit(1)
  }
})()

const pkg = require('./package')
if (opts.help) {
  console.log(`Usage: ${BASENAME} [OPTIONS]`)
} else if (opts.version) {
  console.log(`${pkg.name} ${pkg.version}`)
} else {
  console.log(opts)
}
