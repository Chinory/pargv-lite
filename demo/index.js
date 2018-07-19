#!/usr/bin/env node
'use strict'
const BASENAME = require('path').basename(process.argv[1])

const opts = (() => {
  const options = require('./options')
  const parseArgv = require('..')
  try {
    return parseArgv(process.argv.slice(2), options)
  } catch (err) {
    console.error(`${BASENAME}: ${err.message}`)
    console.error(`Try '${BASENAME} --help' for more information.`)
    process.exit(1)
  }
})()

const pkg = require('../package')
if (opts.help) {
  const options = require('./options')
  console.log(`Usage: ${BASENAME} [OPTIONS]`)
  console.log(options)
} else if (opts.version) {
  console.log(`${pkg.name} ${pkg.version}`)
} else {
  console.log(opts)
}
