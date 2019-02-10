# pargv-lite

Simple and reliable high performance command-line options parser.

Using a readable JSON object to define what you want, pargv-lite will ensure you get the right data.

## Installation

```shell
npm i pargv-lite
```

## Usage

```javascript
let opts = {}, path = "", model = {
  bool: { set: ["-b", "--bool"], reset: ["-B", "--nega"], def: false },
  str: { set: ["--str"], reset: ["--reset"], def: "string" },
  array: { set: ["--", "-a"], reset: ["--clear"], def: ["by default"] },
  module: { set: ["m", "-m"], def: {
    x: { def: "1", set: ["x", "-x"] },
    y: { def: "2", set: ["y", "-y"] }
  } }
};
require("pargv-lite")(process.argv, 2, opts, "", model, (err, arg, opts, name) => {
  err ? console.error("[error] %s %s -- %s", path, err, arg) 
    : console.log("[module] %s %j", path += name + "/", opts);
  return true; // continue parsing
});
console.log(`[result] ${path}\n`, opts);
```
```shell
$ node demo --what -what --bool=str --nega=str --str='new string'
[error]  invaild option -- -w
[error]  invaild option -- -h
[error]  can not set value of boolean option -- --bool
[error]  can not set value of reset option -- --nega
[module] / {"bool":false,"str":"new string","array":["by default","--what","t"],"module":null}
[result] /
 { bool: false,
  str: 'new string',
  array: [ 'by default', '--what', 't' ],
  module: null }
$ node demo --str 'new string' --reset -a "by -a" "by --" -bmx 100 no-more-arg
[module] / {"bool":true,"str":"string","array":["by default","by -a","by --"],"module":null}
[error] / uncaptured argument -- no-more-arg
[module] /module/ {"x":"100","y":"2"}
[result] /module/
 { bool: true,
  str: 'string',
  array: [ 'by default', 'by -a', 'by --' ],
  module: { x: '100', y: '2' } }
```

For detailed, see [index.d.ts](index.d.ts)

## Benchmarks

```
mri x 542,287 ops/sec ±2.07% (89 runs sampled)
yargs x 34,837 ops/sec ±2.44% (89 runs sampled)
getopts x 1,218,598 ops/sec ±1.44% (93 runs sampled)
minimist x 324,039 ops/sec ±0.11% (96 runs sampled)
pargv-lite x 1,093,233 ops/sec ±0.27% (93 runs sampled)
```

## License

MIT © Chinory

