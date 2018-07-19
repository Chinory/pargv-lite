# Benchmarks

[pargv-lite](../README.md) vs. [mri](https://github.com/lukeed/mri), [yargs](https://github.com/yargs/yargs), [getopts](https://github.com/jorgebucaran/getopts) and [minimist](https://github.com/substack/minimist) benchmark results.

## Run

```
npm i && node .
```

## Results

- 8x Intel CPU @ 2.60GHz, 16G DDR3 Memory


- Node.js v10.7.0

```
mri × 394,782 ops/sec
yargs × 34,095 ops/sec
getopts × 1,521,811 ops/sec
minimist × 302,338 ops/sec
pargv-lite × 1,022,394 ops/sec
```

