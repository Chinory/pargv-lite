# pargv-lite

A pure, fast and powerful argv parser with force strict option checking.

- **Pure**: Just one function `parseArgv()`
- **Fast**: 2x to 20x faster than the alternatives. See [Benchmarks](#Benchmarks)
- **Powerful**: Please read on!

## Installation

```shell
$ npm i pargv-lite
```

## Usage

### Quick start

```javascript
const BASENAME = require('path').basename(process.argv[1])
const opts = (() => {
  const parseArgv = require('pargv-lite')
  const options = {
    action: { def: true, set: ['n', 'dry-run'], reset: ['a'] },
    verbose: { def: false, set: ['v', 'verbose'] },
    mode: { def: 'default', set: ['m', 'mode'] },
    includes: { def: [], set: ['i', 'include'], reset: ['clear-includes'] },
    unopened_option: { def: false },
    help: { def: false, set: ['h', 'help'] },
    version: { def: false, set: ['version'] }
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
**Have a try**: Change directory to the repository's root then:


```shell
$ node demo app1 -na file1 --verbose --mode=old -mnew -i- --include -- -- --help
{ _: [ 'file1', '--help' ],
  action: true,
  verbose: true,
  mode: 'new',
  includes: [ '-', '--' ],
  unopened_option: false,
  help: false,
  version: false }
```

### API

```javascript
opts = require('pargv-lite')(argv, options)
```

**argv**: Arguments array, usually set to `process.argv.slice(2)`.

**options**: An **Object** that declares options. The key of `options` is the internal name of an option while the value is its attribute.

`options.*.set = []`  The external names to set the option. Empty or **undefined** means users can't set it externally.

`options.*.def` is the default value. Its type determined the option's type and behavior:

1. **boolean**: When set, the value will be set to the negative of the default. 
2. **Array**: When set, the new string value will be appended to the array.
3. **Object**: When set, enter a submodule. See Advanced / Module Option.
3. **any**: When set, the old value will be overwritten by the new string value.

`options.*.reset = []`  The external names to reset the option. When used, the value will be reset to the default. No arguments needed. This can be used to implement options such as `--no-*`, which has the advantage that you don't have to use a specific prefix.

`options._` The setting of extra arguments which returned by `opts._`. Its type also determined the behavior:

1. **null**: Reject any extra arguments. Settings will cause an error. `opts._` will always be **null**.
2. **undefined**: Create an **Array** as `opts._`.
3. **any**: Use `options._.slice()` to make a copy of it as `opts._`.

## Advanced

### Module Option

Setting a module option means to use its `def` as `options` to parse subsequent `argv` , and take the parsed `opts` as the value of this option. This provides a explicit way to access submodules with their own option namespace from anywhere. Module option can't be reset, that guarantees a single module path, which can be obtained this way:

```javascript
const modulePath = []
opts = require('pargv-lite')(argv, options, modulePath)
```

If a module option isn't used, its value will be **null**.

**For Example**: 

```javascript
const options = {
  add: { set: ['a'], def: {
    verbose: { set: ['v'], def: false },
    file: { set: ['f'], def: {
      copy: { set: ['c'], def: false }
    }}
  }},
  remove: { set: ['r'], def: {
    recursive: { set: ['r'], def: false },
  }},
}
```

**Have a try**:

```shell
$ node demo app2 repo1 -avfc file1
{ _: [ 'repo1' ],
  add:
   { _: [],
     verbose: true,
     file: { _: [ 'file1' ], copy: true } },
  remove: null }
$ node demo app2 repo1 -rr dir1
{ _: [ 'repo1' ],
  add: null,
  remove: { _: [ 'dir1' ], recursive: true } }
```

### Keyword External Name

This type of external name doesn't need `-` or `--` prefix to use. Just prefix the external name with `-`. Together with the module option, you can easily implement common interfaces of sub-module CLI program.

**For Example**:

```javascript
const options = { _: null,
  git: { set: '-git', def: { _: null,
    clone: { set: ['-clone'], def: {
      bare: { set: ['bare'], def: false }
    }}
  }}
}
```

**Have a try**:

```shell
$ node demo app3 git clone repo --bare
{ _: null, git: { _: null, clone: { _: [ 'repo' ], bare: true } } }
```

## Demos

`options` can be written in JSON, also yaml. There are more `.yaml` options demos in `demo/`. Try:

```shell
$ node demo git
```

## Benchmarks

```
mri × 404,080 ops/sec
yargs × 36,174 ops/sec
getopts × 1,570,883 ops/sec
minimist × 314,133 ops/sec
pargv-lite × 986,109 ops/sec
```

## License

MIT © Chinory