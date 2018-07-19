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
mri × 369,246 ops/sec
yargs × 33,532 ops/sec
getopts × 1,603,122 ops/sec
minimist × 291,907 ops/sec
pargv × 1,034,929 ops/sec
```

