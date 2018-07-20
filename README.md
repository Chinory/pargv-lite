# pargv-lite

A pure, fast and powerful argv parser with force strict option checking.

Focus on providing relaxed and elegant way to get right options to launch your program.

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
    includes: { def: [], set: ['i', 'include'] },
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
$ node demo -na file1 --verbose --mode=old -mnew -i- --include -- -- --help
{ _: [ 'file1', '--help' ],
  action: true,
  verbose: true,
  mode: 'new',
  includes: [ '-', '--' ],
  unopened_opt: false,
  help: false,
  version: false }
```

### API

```javascript
opts = require('pargv-lite')(argv, options)
```

**argv**: Argument vector, usually set to `process.argv.slice(2)`

**options**: Declare options before use. The key of `options` is the internal name of option while the value describes how to get this option from `argv`.

`options.*.def` is the default value and its type determines how we handle this option:

1. **boolean**: The value will be set to the negative of the default value. 
2. **Array**: The new string value will be appended to that array.
3. **Object**: see Advanced / module option 
3. **any**: The old value will be overwritten by the new string value.

`options.*.set = []`  the external names to set option.

`options.*.reset = []`  the external names to reset option. This can be used to implement `--no-*`, `--default-*` options.

## Advanced

### module option

Use `def` as new `options` to enter a sub module, pass all subsequent `argv` to it, then take returned `opts` as the value of this module option. If not used, the value will be `null`. Modules have their own option namespace. In fact, the first `options` is the `def` of the root module.

Once set, module option can not be reset. This guarantees a single module path.

**For Example**: Suppose your program has two sub module: `add` & `remove` , and `add` also owns two sub module, then you can configure like this:

```javascript
const options = {
  add: { set: ['a'], def: {
    quick: { set: ['q'], def: false },
    link: { set: ['l'], def: {} }, 
    file: { set: ['f'], def: {
      copy: { set: ['c'], def: false }
    }}
  }},
  remove: { set: ['r'], def: {
    force: { set: ['f'], def: false },
    recursive: { set: ['r'], def: false },
  }},
}
```

**Have a try**:

```shell
$ app table1 -aqfc file1
{ _: [ 'table1' ],
  add:
   { _: [],
     quick: true,
     link: null,
     file: { _: [ 'file1' ], copy: true } },
  remove: null }
$ app table1 -rr file1
{ _: [ 'table1' ],
  add: null,
  remove: { _: [ 'file1' ], force: false, recursive: true } }
```

### keyword option

Keyword option is option that doesn't need to prefix with `-` or `--` . Just prefix the external name with `^`.

**For Example**:

```javascript
const options = {
  clone: { set: '^clone', def: {
    checkout: { set: ['n', 'no-checkout'], def: true },
    bare: { set: ['bare'], def: false },
  }},
  init: { set: '^init', def: {
    template: { set: ['template'], def: '' },
    shared: { set: ['shared'], def: false }
  }}
}
```

**Have a try**:

```shell
$ git clone https://github.com/chinory/node-pargv-lite.git --bare
{ _: [],
  clone:
   { _: [ 'https://github.com/chinory/node-pargv-lite.git' ],
     checkout: true,
     bare: true },
  init: null }
```

### header option

Header option is option that should only appear in the front of a module. Just suffix the external name with `$`.

**For Example**:

```javascript
const options = {
  clone: { set: ['^clone$'], def: {
    bare: { set: ['bare$'], def: false },
    depth: { set: ['depth$'], def: Infinity },
  }}
}
```

**Have a try**:

```shell
$ git clone --depth 2 --bare repo
{ _: [], clone: { _: [ 'repo' ], bare: true, depth: '2' } }
$ git clone --bare repo --depth=3
git: clone: option should be in front -- depth
Try 'git --help' for more information.
```

## License

- MIT

