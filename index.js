'use strict';
const isA = Array.isArray,
	isB = x => typeof x === 'boolean';
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
export default function parse(argv, i, req, res, err) {
	/** @type {OptKeyMap} options to set var */
	const set_ = {};
	/** @type {OptKeyMap} options to reset var */
	const rst_ = {};
	/** @type {OptKeyMap} options to halt parse */
	const hlt_ = {};
	/** @type {OptStr} option */
	let opt = '';
	/** @type {OptStr | null} option of an extension */
	let ext = null;
	/** @type {VarKey | undefined} key (because of using object...) */
	let key;
	/** @type {VarKey | undefined} key of anonymous variable */
	let ann;
	// methods
	const ask = (msg, val) => err({msg, i, opt, key, val});
	// assert(key != null)
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
		if (isB(def)) res[key] = !def; else return true;
	};
	// prepare
	for (key in req) {
		const vk = req[key];
		H: {
			/** @type {HaltKit} */
			let hk; 
			if (vk == null) hk = [key];
			else if (isA(vk)) hk = vk; 
			else if (typeof vk === 'object') break H;
			else hk = [vk];
			for (const od of hk)
				if (od!=='--') hlt_[od||key] = key;
			continue;
		}
		let ok = vk.set;
		const def = vk.def;
		if (isA(def)) {
			res[key] = def.slice();
			if (ok !== undefined)
				for (const od of isA(ok)?ok:[ok])
					if (od!=='--') set_[od||key] = key; else ann = key;
		} else {
			res[key] = def;
			if (ok !== undefined)
				for (const od of isA(ok)?ok:[ok])
					if (od!=='--') set_[od||key] = key; // no stomach
		}
		if ((ok = vk.rst) !== undefined)
			for (const od of isA(ok)?ok:[ok]) 
				if (od!=='--') rst_[od||key] = key;
	}
	// process
	/** @type {HaltRes} */
	let halt = null;
	I: for (; i < argv.length; ++i) {
		const s = argv[i];
		// extension ~ Just bite one more thing
		if (ext != null) { // fact(const val = s)
			ext = null; // assert(opt === ext)
			if (key != null) { // assert(key === set_[opt])
				set(s);
				continue I;
			} else {
				if (ask('invalid option', s)) break I;
			}
		}
		// halt ~ It should be this simple, right?
		if (key = hlt_[s]) {
			opt = s;
			halt = {opt, key};
			break I;
		}
		// ordinary ~ No more dashes!
		if (s.length < 2 || s[0] !== '-') {
			opt = s;
			if (key = set_[opt]) {
				if (noB()) ext = opt;
			} else if (key = rst_[opt]) {
				rst();
			} else if (ann) {
				res[ann].push(opt);
			} else {
				if (ask('invalid option')) break I;
			}
			continue I;
		}
		// ultimate ~ Eat you all nom nom
		if (s === '--') {
			opt = s;
			if (key = ann) { 
				const val = res[key];  // assert(isA(val))
				for (++i; i < argv.length; ++i) val.push(argv[i]);
				break I;
			} else {
				if (ask('unexpected argument')) break I;
			}
			continue I;
		}
		// --opt?val
		if (s[1] === '-') {
			const j = s.indexOf('=');
			// --opt val ~ Make extension
			if (j < 0) { 
				opt = s;
				key = set_[opt]; // for the assertion
				ext = opt;
				continue I;
			}
			// --opt=val ~ Explicit assignment
			opt = s.slice(0, j);
			if (key = set_[opt]) {
				const val = s.slice(j + 1);
				if (isB(res[key])) {
					if (ask('Cannot assign a value to a boolean-type option', val)) break I;
				} else {
					set(val);
				}
			} else if (key = rst_[opt]) {
				if (ask('Cannot assign a value to a reset-type option')) break I;
			} else {
				if (ask('invalid option')) break I;
			}
			continue I;
		} 
		// ab in -abc123 ~ Cannot make extension
		const J = s.length - 1;
		for (let j = 1; j < J; ++j) {
			opt = '-' + s[j];
			if (key = set_[opt]) {
				if (noB()) {
					set(s.slice(j + 1));
					continue I;
				}
			} else if (key = rst_[opt]) {
				rst();
			} else {
				if (ask('invalid option')) break I;
			}
		}
		// c in -abc123 ~ You can't be annonymous
		opt = '-' + s[J];
		if (key = set_[opt]) {
			if (noB()) ext = opt;
		} else if (key = rst_[opt]) {
			rst();
		} else {
			if (ask('invalid option')) break I;
		}
	}
	if (ext) ask('This option requires an argument'); // assertion same as above
	return {i, halt};
};