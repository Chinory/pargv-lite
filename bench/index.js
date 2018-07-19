const { Suite } = require("benchmark")
const mri = require("mri")
const yargs = require("yargs-parser")
const getopts = require("getopts")
const minimist = require("minimist")
const argvlite = require("..") 
const argvlite_options = require('./options')

const argv = ["--super=sonic", "--no-lock", "-au9000", "--", "game", "over"]


new Suite()
  .on("cycle", ({ target: { name, hz } }) =>
    console.log(`${name} × ${Math.floor(hz).toLocaleString()} ops/sec`)
  )
  .add("mri", () => mri(argv))
  .add("yargs", () => yargs(argv))
  .add("getopts", () => getopts(argv))
  .add("minimist", () => minimist(argv))
  .add("argv-lite", () => argvlite(argv, argvlite_options))
  .run()
