#!/usr/bin/env node
'use strict'
const fs = require('fs')
const path = require('path')
const yaml = require('yaml').default
const BASENAME = path.basename(process.argv[1])

const config = yaml.parse(fs.readFileSync('demo/' + process.argv[2] + '.yaml', {encoding: 'utf-8'}))

const opts = (() => {
  const parseArgv = require('../index')
  const options = config
  const modulePath = []
  const optionPath = [BASENAME]
  try {
    const argv = process.argv.slice(3)
    return parseArgv(argv, options, modulePath, optionPath)
  } catch (err) {
    console.error(`${optionPath.join(': ')}: ${err.message}`)
    console.error(`Try '${BASENAME} --help' for more information.`)
    process.exit(1)
  }
})()

console.log(opts)