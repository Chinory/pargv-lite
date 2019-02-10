#!/usr/bin/env node
let opts = {}, path = "", model = {
  bool: { set: ["-b", "--bool"], reset: ["-B", "--nega"], def: false },
  str: { set: ["--str"], reset: ["--reset"], def: "string" },
  array: { set: ["--", "-a"], reset: ["--clear"], def: ["default"] },
  module: { set: ["m", "-m", "--mod"], def: {
    x: { def: "1", set: ["x", "-x"] },
    y: { def: "2", set: ["y", "-y"] }
  } }
};
require(".")(process.argv, 2, opts, "", model, (err, arg, opts, name) => {
  err ? console.error("[error] %s %s -- %s", path + name + "/", err, arg) 
    : console.log("[module] %s %j", path += name + "/", opts);
  return true; // continue parsing
});
console.log(`[result] ${path}\n`, opts);