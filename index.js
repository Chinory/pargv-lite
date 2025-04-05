'use strict';
const isA = Array.isArray;
/**
 * @typedef {string} VarKey Variable name
 * @typedef {string | boolean | string[]} VarVal Variable value
 * @typedef {string} OptStr Option string, e.g. '--', '-o', '--option'
 * @typedef {OptStr | null} OptDef Option definitions, e.g. '--', '-o', '--option', or null to refer to the variable name
 * @typedef {OptDef | OptDef[]} OptKit one or more option definitions
 * 
 * @typedef {object} VarKit Variable configuration object
 * @property {VarVal} def Variable **def**inition & **def**ault value (pun intended)
 * @property {OptKit} [set] Array of options to set the variable value
 * @property {OptKit} [rst] Array of options to reset the variable value
 * 
 * @typedef {OptDef | OptDef[]} HaltKit Halt options, identical to `OptKit`, for now...
 * @typedef {{opt: OptStr, key: VarKey}} HaltRes
 * @typedef {Record<VarKey, VarKit | HaltKit>} KeyKitMap
 * @typedef {Record<VarKey, VarVal>} KeyValMap
 * 
 * @callback CanQuit
 * @param {{msg: string, i: number, opt: OptStr, key?: VarKey, val?: VarVal }} err
 * @returns {boolean} Whether the parsing should continue (false) or quit (true)
 * @typedef {Record<OptStr, VarKey>} OptKeyMap internal type
 */
/** @param {OptKit} ok */
const god = ok => typeof ok === 'string' ? [ok] : isA(ok) ? ok : [];
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
export default function parse(argv, i, req, res, err) {
	/** @type {OptKeyMap} options to set var */
	const set_ = {};
	/** @type {OptKeyMap} options to reset var */
	const rst_ = {};
	/** @type {OptKeyMap} options to halt parse */
	const hlt_ = {};
	/** @type {OptStr} option */
	let opt = '';
	/** @type {OptStr} option of the extension */
	let ext = '';
	/** @type {VarKey | undefined} key */
	let key;
	/** @type {VarKey | undefined} key to set the universe variable */
	let suv;
	/** @type {boolean} set universe variable to halt (?) */
	let sun = false;
	// methodsze
	/** @param {string} msg @param {VarVal} [val] */
	const ask = (msg, val) => err({msg, i, opt, key, val});
	// below: assert(key != null)
	/** @param {VarVal} val */
	const set = val => {
		const cur = res[key];
		if (isA(cur)) cur.push(val); else res[key] = val;
	};
	const rst = () => {
		const def = req[key].def;
		res[key] = isA(def) ? def.slice() : def;
	};
	const noB = () => {
		const def = req[key].def;
		if (typeof def === 'boolean') {
			res[key] = !def;
			return false;
		 } return true;
	};
	/** @param {string} s */
	const one = s => {
		if (key = set_[opt = s]) {
			if (noB()) ext = opt;
		} else if (key = rst_[opt]) rst();
		else return ask('invalid option');
		return false;
	};
	// prepare
	for (key in req) {
		const vk = req[key];
		H: { let hk; 
			switch (typeof vk) {
				case 'object':
					if (vk == null) hk = [key];
					else if (isA(vk)) hk = vk; 
					else break H; break;
				case 'string': hk = [vk]; break;
				default: continue; }
			for (const o of hk) if (o!=='--') hlt_[o||key] = key; else suv = key, sun = true; // lol
			continue; }
		const def = vk.def;
		res[key] = isA(def) ? def.slice() : def; // just rst() with known `def`
		for (const o of god(vk.set)) if (o!=='--') set_[o||key] = key; else suv = key, sun = false;
		for (const o of god(vk.rst)) if (o!=='--') rst_[o||key] = key; // ?? wanna reset around?
	}
	// process
	/** @type {HaltRes} */
	let halt = null;
	I: for (; i < argv.length; ++i) {
		const s = argv[i];
		// extension ~ Just one more thing
		if (ext) { // fact(const val = s)
			ext = ''; // assert(opt === ext)
			if (key) { // assert(key === set_[opt])
				set(s);
				continue;
			}
			if (ask('invalid option', s)) break;
		}
		// halt ~ Basic so that `i` is usable for resuming parsing
		if (key = hlt_[opt = s]) { ++i; halt = {opt, key}; break; }
		// abc
		if (s.length < 2 || s[0] !== '-') {
			if (key = set_[opt = s]) {
				if (noB()) ext = opt;
			} else if (key = rst_[opt]) rst();
			else if (key = suv) if (sun) { ++i; halt = {opt, key}; break; } else set(s);
			else if (ask('invalid option', s)) break;
			continue;
		}
		// -abc
		if (s[1] !== '-') {
			// -ab ~ no extension
			const J = s.length - 1;
			for (let j = 1; j < J; ++j) {
				opt = '-' + s[j];
				if (key = set_[opt]) {
					if (noB()) {
						set(s.slice(j + 1));
						continue I;
					}
				} else if (key = rst_[opt]) rst();
				else if (ask('invalid option')) break I;
			}
			// -c ~ not universe
			if (one('-' + s[J])) break;
			continue;
		} 
		// --abc
		if (s.length > 2) {
			const k = s.indexOf('=');
			// --opt ~ not universe
			if (k < 0) if (one(s)) break; else continue;
			// --opt=val ~ explicit assignment
			opt = s.slice(0, k);
			const val = s.slice(k + 1);
			if (key = set_[opt]) {
				if (typeof res[key] === 'boolean') {
					if (ask('Cannot assign a value to a boolean-type option', val)) break;
				} else set(val);
			} else if (key = rst_[opt]) {
				if (ask('Cannot assign a value to a reset-type option', val)) break;
			} else {
				if (ask('invalid option', val)) break;
			}
			continue;
		} 
		// -- ~ collect all
		opt = '--';
		if (key = suv) { ++i;
			if (sun) { halt = {opt, key}; break; }
			const cur = res[key], len = argv.length;
			if (isA(cur)) while (i < len) cur.push(argv[i++]);
			else if (i < len) res[key] = argv[(i = len) - 1];
			break;
		}
		if (ask('unexpected argument')) break;
	}
	if (ext) ask('This option requires an argument'); // assertion same as above
	return {i, halt};
};