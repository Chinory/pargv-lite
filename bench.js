#!/usr/bin/env node
const benchmark = require("benchmark");

const mri = require("mri");
const yargs = require("yargs-parser");
const getopts = require("getopts");
const minimist = require("minimist");
const pargvlite = require("."); 

const model = {
  super: { set: ["--super"], def: "" },
  lock: { set: ["--no-lock"], def: true },
  a: { set: ["-a"], def: false },
  u: { set: ["-u"], def: [] },
  words: { set: ["--"], def: [] }
};

const argv = ["node", "bench", "--super=sonic", "--no-lock", "-au9000", "--", "game", "over"];

new benchmark.Suite()
  .on("cycle", e => console.log(String(e.target)))
  .add("mri", () => mri(argv.slice(2)))
  .add("yargs", () => yargs(argv.slice(2)))
  .add("getopts", () => getopts(argv.slice(2)))
  .add("minimist", () => minimist(argv.slice(2)))
  .add("pargv-lite", () => pargvlite(argv, 2, {}, "", model, () => true))
  .run();
