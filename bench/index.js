const { Suite } = require("benchmark")
const mri = require("mri")
const yargs = require("yargs-parser")
const getopts = require("getopts")
const minimist = require("minimist")
const pargvlite = require("..") 
const pargvlite_options = {
  super: { set: ['super'], def: '' },
  lock: { set: ['no-lock'], def: true },
  a: { set: ['a'], def: false },
  ultra: { set: ['u', 'ultra'], def: [] },
}

const argv = ["--super=sonic", "--no-lock", "-au9000", "--", "game", "over"]


new Suite()
  .on("cycle", ({ target: { name, hz } }) =>
    console.log(`${name} × ${Math.floor(hz).toLocaleString()} ops/sec`)
  )
  .add("mri", () => mri(argv))
  .add("yargs", () => yargs(argv))
  .add("getopts", () => getopts(argv))
  .add("minimist", () => minimist(argv))
  .add("pargv-lite", () => pargvlite(argv, pargvlite_options))
  .run()
