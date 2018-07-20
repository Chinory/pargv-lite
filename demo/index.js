#!/usr/bin/env node
'use strict'
const fs = require('fs')
const path = require('path')
const yaml = require('yaml').default
const BASENAME = path.basename(process.argv[1])

const config_name = path.basename(process.argv[2])
const config = yaml.parse(fs.readFileSync('demo/' + process.argv[2] + '.yaml', {encoding: 'utf-8'}))

console.log(config)

const opts = (() => {
  const parseArgv = require('../index')
  const options = config
  // const options = {
  //   config_name: { set: ['^' + config_name], def: config },
  //   help: { set: ['h', 'help'], def: false },
  //   version: { set: ['version'], def: false }
  // }
  // try {
    const argv = process.argv.slice(3)
    return parseArgv(argv, options)
  // } catch (err) {
  //   console.error(`${BASENAME}: ${err.message}`)
  //   console.error(`Try '${BASENAME} --help' for more information.`)
  //   process.exit(1)
  // }
})()

console.log(opts)