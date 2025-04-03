'use strict';
const isA = Array.isArray;
const isB = x => typeof x === 'boolean';
/**
 * @typedef {(boolean | string | string[])} VarVal Variable value
 * @typedef {string} VarKey Variable name, just a string
 * @typedef {string} OptStr Option string, e.g. '--', '-o', '--option'
 * @typedef {Record<OptStr, VarKey>} OptToVarMap
 * 
 * @typedef {object} VarKit Variable configuration object
 * @property {VarVal} def Default value and the variable definition (pun intended)
 * @property {OptStr[]} [set] Array of options to set the variable value
 * @property {OptStr[]} [rst] Array of options to reset the variable value
 * 
 * @typedef {Record<VarKey, VarKit>} VarKitMap Mapping of variable names to their configurations
 * 
 * @callback CanQuit
 * @param {string} err The error message to handle
 * @param {string} opt The related option that caused the error
 * @returns {boolean} Whether the parsing should continue (false) or quit (true)
 */
/**
 * Command line argument parser function
 * 
 * @param {string[]} argv Command line arguments array
 * @param {number} i Index of current argument being processed
 * @param {VarKitMap} vkm Options structure definition
 * @param {object} res Object to store parsed results
 * @param {CanQuit} ask Error handler function
 * @returns {void}
 * 
 * @example
 * const res = {};
 * parse(process.argv, 2, {
 *   help: {
 *     def: false,
 *     set: ['-h', '--help']
 *   }
 * }, res, (err, opt) => {
 *   console.error(`Error: ${err} (option: ${opt})`);
 *   return true; // Quit parsing
 * });
 * 
 * @warning This function may modify `argv` for convenient. 
 */
export default function parse(argv, i, vkm, res, ask) {
	/** @type {OptToVarMap} options to call set */
	const set_ = {};
	/** @type {OptToVarMap} options to call reset */
	const rst_ = {};
	/** @type {OptStr} option */
	let opt;
	/** @type {OptStr} option of an extension */
	let ext;
	/** @type {VarKey} key */
	let key;
	/** @type {VarKey} key of anonymous variable */
	let ann;

	const set = val => {
		const arr = res[key];
		if (isA(arr)) arr.push(val); else res[key] = val;
	};
	const rst = () => {
		const def = vkm[key].def;
		res[key] = isA(def) ? def.slice() : def;
	}
	const nsB = () => {
		const def = vkm[key].def;
		if (isB(def)) res[key] = !def; else return true;
	}

	for (key in vkm) {
		const vk = vkm[key];
		const def = vk.def;
		let opts = vk.set;
		if (isA(def)) {
			if (opts) for (opt of opts) if (opt !== '--') set_[opt] = key; else ann = key;
			res[key] = def.slice();
		} else {
			if (opts) for (opt of opts) if (opt !== '--') set_[opt] = key;
			res[key] = def;
		}
		if (opts = vk.rst) for (opt of opts) if (opt !== '--') rst_[opt] = key;
	}

	for (; i < argv.length; ++i) I: {
		const s = argv[i];
		// extension
		if (ext) {
			const e2 = ext;
			ext = null;
			if (key = set_[e2]) {
				set(s);
				break I;
			} else {
				if (ask('invalid option', e2)) return;
				// can use s as sth else
			}
		}
		// ordinary
		if (s.length < 2 || s[0] !== '-') {
			if (key = set_[s]) {
				if (nsB()) ext = s;
			} else if (key = rst_[s]) {
				rst();
			} else if (ann) {
				res[ann].push(s);
			} else {
				if (ask('invalid option', s)) return;
			}
			break I;
		}
		// ultimate
		if (s === '--') {
			if (ann) {
				const arr = res[ann];
				for (++i; i < argv.length; ++i) arr.push(argv[i]);
				return;
			} else {
				if (ask('unexpected argument', s)) return;
			}
			break I;
		}
		// --opt?val
		if (s[1] === '-') {
			const j = s.indexOf('=');
			// --opt val -> extension
			if (j < 0) { 
				ext = s;
				break I;
			}
			// --opt=val
			opt = s.slice(0, j);
			if (key = set_[opt]) {
				if (isB(res[key])) {
					if (ask('Cannot assign a value to a boolean-type option', opt)) return;
				} else {
					set(s.slice(j + 1));
				}
			} else if (rst_[opt]) {
				if (ask('Cannot assign a value to a reset-type option', opt)) return;
			} else {
				if (ask('invalid option', opt)) return;
			}
			break I;
		} 
		// ab in -abc123
		const J = s.length - 1;
		for (let j = 1; j < J; ++j) {
			opt = '-' + s[j];
			if (key = set_[opt]) {
				if (nsB()) {
					set(s.slice(j + 1));
					break I;
				}
			} else if (key = rst_[opt]) {
				rst();
			} else {
				if (ask('invalid option', opt)) return;
			}
		}
		// c in -abc123
		opt = '-' + s[J];
		if (key = set_[opt]) {
			if (nsB()) ext = opt;
		} else if (key = rst_[opt]) {
			rst();
		} else {
			if (ask('invalid option', opt)) return;
		}
	}
	if (ext) ask('This option requires an argument', ext);
};