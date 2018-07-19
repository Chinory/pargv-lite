# Benchmarks

[pargv](../README.md) vs. [mri](https://github.com/lukeed/mri), [yargs](https://github.com/yargs/yargs), [getopts](https://github.com/jorgebucaran/getopts) and [minimist](https://github.com/substack/minimist) benchmark results.

## Run

```
npm i && node .
```

## Results

- 8x Intel CPU @ 2.60GHz, 16G DDR3 Memory


- Node.js v10.7.0

```
mri × 371,267 ops/sec
yargs × 34,039 ops/sec
getopts × 1,590,231 ops/sec
minimist × 284,519 ops/sec
pargv × 1,425,378 ops/sec
```

