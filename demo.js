#!/usr/bin/env node
'use strict'
const BASENAME = require('path').basename(process.argv[1])

const opts = (() => {
  const parseArgv = require('.')
  const options = {
    action: { def: true, use: ['n', 'dry-run'] },
    verbose: { def: false, use: ['v', 'verbose'] },
    mode: { def: 'default', use: ['m', 'mode'] },
    includes: { def: [], use: ['i', 'include'] },
    unopened_option: { def: false, use: [] },
    help: { def: false, use: ['h', 'help'] },
    version: { def: false, use: ['version'] }
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
