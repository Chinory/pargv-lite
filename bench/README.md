# Benchmarks

[argv-lite](../README.md) vs. [mri](https://github.com/lukeed/mri), [yargs](https://github.com/yargs/yargs), [getopts](https://github.com/jorgebucaran/getopts) and [minimist](https://github.com/substack/minimist) benchmark results.

## Run

```
npm i && node .
```

## Results

- 8x Intel CPU @ 2.60GHz, 16G DDR3 Memory


- Node.js v10.7.0

```
mri × 403,563 ops/sec
yargs × 35,612 ops/sec
getopts × 1,563,881 ops/sec
minimist × 312,715 ops/sec
argv-lite × 1,335,350 ops/sec
```

