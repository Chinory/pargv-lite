# pargv

A redesigned Node.js CLI options parser, fast and lightweight, provides an easy way to launch a CLI program.

## Installation

```shell
$ npm i pargv
```

## Usage

### For example

```javascript
const BASENAME = require('path').basename(process.argv[1])
const opts = (() => {
  const options = require('./options')
  const parseArgv = require('pargv')
  try {
    return parseArgv(process.argv.slice(2), options)
  } catch (err) {
    console.error(`${BASENAME}: ${err.message}`)
    console.error(`Try '${BASENAME} --help' for more information.`)
    process.exit(1)
  }
})()
```

**./options.json**:

```json
{
  "action": { "def": true, "use": ["n", "dry-run", "no-action"] },
  "verbose": { "def": false, "use": ["v", "verbose"] },
  "mode": { "def": "default", "use": ["m", "mode"] },
  "includes": { "def": [], "use": ["i", "include"] },
  "help": { "def": false, "use": ["h", "help"] },
  "version": { "def": false, "use": ["version"] }
}
```

result **opts**: (no option used)

```javascript
{ _: [],
  action: true,
  verbose: false,
  mode: 'default',
  includes: [],
  help: false,
  version: false }
```

Pargv expects `options` as the prototype of the result `opts`. Both of them are designed to can be jsonify.

Pargv is strict. You must declare the options before using them or you will receive invalid option error.

The `def` means define and default. Pargv only supports three basic types of option value: **bool**, **string**, **string array**. The type of `def` determines the option's type. 

- Use a bool option, the value will be set to the negative of the default value. 
- Use a string option, the old value will be overwritten by the new value.
- Use a string array option, the new value will be appended to the array.

### Have a try

Change directory to the repository's root then:

```shell
$ node demo
```

## License

- MIT

