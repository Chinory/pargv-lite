# argv-lite

A simple & fast argv parser with option checking.

Provides an easy way to launch program with right options.

## Installation

```shell
$ npm i argv-lite
```

## Usage

### Example

```javascript
const BASENAME = require('path').basename(process.argv[1])
const opts = (() => {
  const parseArgv = require('argv-lite')
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
console.log(opts)
```
### Have a try

Change directory to the repository's root then:


```shell
$ node demo -nnn file1 --verbose --mode=old -mnew -i- --include -- -- --help
{ _: [ 'file1', '--help' ],
  action: false,
  verbose: true,
  mode: 'new',
  includes: [ '-', '--' ],
  unopened_opt: false,
  help: false,
  version: false }
```

### API

```javascript
opts = require('argv-lite')(argv, options)
```

**argv**: Argument vector, usually set to `process.argv.slice(2)`

**options**: Declare options before use. The key of the Object is the internal name of option while the value describes how to get this option from argv.

`options.*.def` is the default value and its type determines how we handle this option:

1. **boolean**: The value will be set to the negative of the default value. 
2. **Array**: The new string value will be appended to that array.
3. **other**: The old value will be overwritten by the new string value.

`options.*.use` contains the external names of option, which doesn't need to be same as the internal name, or even not needed.

## License

- MIT

