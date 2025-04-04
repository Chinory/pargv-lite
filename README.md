# pargv-lite

JSON configurable command-line options parser

3.x Under developing... not tested yet

```javascript
/**
 * @typedef {string} VarKey Variable name
 * @typedef {string | boolean | string[]} VarVal Variable value
 * @typedef {string} OptStr Option string, e.g. '--', '-o', '--option'
 * @typedef {OptStr | null} OptDef Option definitions, e.g. '--', '-o', '--option', or `null` to refer to the variable name
 * @typedef {OptDef | OptDef[]} OptKit one or more option definitions
 * 
 * @typedef {object} VarKit Variable configuration object
 * @property {VarVal} def Variable **def**inition & **def**ault value (pun intended)
 * @property {OptKit} [set] Array of options to set the variable value
 * @property {OptKit} [rst] Array of options to reset the variable value
 * 
 * @typedef {OptKit} HaltKit Halt options, identical to `OptKit`, for now...
 * @typedef {{opt: OptStr, key: VarKey}} HaltRes
 * @typedef {Record<VarKey, VarKit | HaltKit>} KeyKitMap
 * @typedef {Record<VarKey, VarVal>} KeyValMap
 * 
 * @callback CanQuit
 * @param {{msg: string, i: number, opt: OptStr, key?: VarKey, val?: VarVal }} err
 * @returns {boolean} Whether the parsing should continue (false) or quit (true)
 * @typedef {Record<OptStr, VarKey>} OptKeyMap internal type
 */
/**
 * Command line argument parser function
 * @param {string[]} argv Command line arguments array
 * @param {number} i Index of current argument being processed
 * @param {KeyKitMap} req Options structure definition
 * @param {KeyValMap} res Object to store parsed results
 * @param {CanQuit} err Error handler function
 * @returns {{ i: number, halt?: HaltRes }}
 * @example
 */
export default function parse(argv, i, req, res, err);
```