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
 * @typedef {OptDef | OptDef[]} ExitKit Exit options, identical to `OptKit` for now
 * @typedef {Record<VarKey, VarKit | ExitKit>} KeyKitMap
 * @typedef {Record<VarKey, VarVal>} KeyValMap
 * 
 * @callback IsFatal
 * @param {{msg: string, i: number, opt: OptStr, key?: VarKey, val?: VarVal }} err
 * @returns {boolean} Whether the parsing should continue (false) or quit (true)
 * @typedef {Record<OptStr, VarKey>} OptKeyMap internal type
 */
/** Get OD! @param {OptKit} ok */
const god = ok => ok === undefined ? [] : isA(ok) ? ok : [ok];
/**
 * Command line argument parser function
 * @param {string[]} argv Command line arguments array, e.g. `process.argv`
 * @param {number} i Index of current argument being processed, e.g. `2`
 * @param {KeyKitMap} req Options structure definition
 * @param {KeyValMap} res Object to store parsed results
 * @param {IsFatal} err Error handler function, return true to quit parsing
 * @returns {number | { i: number, key: VarKey, opt: OptStr }}
 * @example
 */
export default function parse(argv, i, req, res, err) {
	/** @type {OptStr} option */
	let opt = '';
	/** @type {VarKey | undefined} key */
	let key;
	/** @param {VarVal} val */
	const set = val => {
		const cur = res[key];
		if (isA(cur)) cur.push(val); else res[key] = val;
	}, rst = () => {
		const def = req[key].def;
		res[key] = isA(def) ? def.slice() : def;
	}, noB = () => {
		const def = req[key].def;
		if (typeof def === 'boolean') {
			res[key] = !def;
			return false;
		 } return true;
	}, k = o => o == null ? key : o, // split undefined? hmm ugly
	ask = (msg, val) => err({msg, i, opt, key, val}),
	exit = c => ({ i: i + c, key, opt });
	// prepare
	/** @type {OptKeyMap} */
	const set_ = {}, rst_ = {}, exit_ = {};
	/** @type {VarKey | undefined} */
	let _key, _exit = false;
	for (key in req) {
		const vk = req[key];
		X: { let xk; // stricter than god()
			switch (typeof vk) {
				case 'object':
					if (vk === null) xk = [vk];
					else if (isA(vk)) xk = vk; 
					else break X; break;
				case 'string': xk = [vk]; break;
				default: continue; }
			for (const o of xk) if (o!=='--') exit_[k(o)] = key; else _key = key, _exit = true;
			continue; }
		const def = vk.def;
		res[key] = isA(def) ? def.slice() : def;
		for (const o of god(vk.set)) if (o!=='--') set_[k(o)] = key; else _key = key, _exit = false;
		for (const o of god(vk.rst)) if (o!=='--') rst_[k(o)] = key; // do not reset around
	}
	// process
	let ext = false;
	S: for (; i < argv.length; ++i) {
		const s = argv[i];
		// extension :: ASSERT key===set_[opt]
		if (ext) { ext = false;
			if (key) { set(s); continue; }
			if (ask('invalid option', s)) return i;
		}
		// abc
		if (s.length < 2 || s[0] !== '-') {
			if (key = set_[opt = s]) ext = noB(); 
			else if (key = rst_[opt]) rst();
			else if (key = exit_[opt]) return exit(1);
			else if (key = _key) if (_exit) return exit(0); else set(s);
			else if (ask('invalid option')) return i;
			continue;
		}
		// -abc
		if (s[1] !== '-') { 
			const J = s.length - 1;
			for (let j = 1; j < J; ++j) {
				// -ab :: no extension, no anonymous, no exit
				opt = '-' + s[j];
				if (key = set_[opt]) { if (noB()) { set(s.slice(j + 1)); continue S; } }
				else if (key = rst_[opt]) rst();
				else if (key = exit_[opt]) { if (ask('cannot exit within an argument')) return i; }
				else if (ask('invalid option')) return i;
			}
			// -c :: no anonymous
			opt = '-' + s[J];
			if (key = set_[opt]) ext = noB();
			else if (key = rst_[opt]) rst();
			else if (key = exit_[opt]) return exit(1);
			else if (ask('invalid option')) return i;
			continue;
		}
		// --opt
		if (s.length > 2) {
			const J = s.indexOf('=');
			if (J < 0) {
				// --opt ...
				if (key = set_[opt = s]) ext = noB();
				else if (key = rst_[opt]) rst();
				else if (key = exit_[opt]) return exit(1);
				else if (ask('invalid option')) return i;
				continue;
			} 
			// --opt=val
			let t; opt = s.slice(0, J);
			const v = s.slice(J + 1);
			if (key = set_[opt])
				switch (t = typeof res[key]) {
					case 'boolean': break;
					default: set(v); continue; }
			else if (key = rst_[opt]) t = 'reset';
			else if (key = exit_[opt]) t = 'exit';
			else if (ask('invalid option', v)) return i; else continue;
			if (ask(`cannot assign value to ${t} option`, v)) return i;
			continue;
		}
		opt = '--';
		if (key = _key) {
			if (_exit) return exit(1);
			const a = res[key], l = argv.length; ++i;
			if (isA(a)) while (i < l) a.push(argv[i++]);
			else if (i < l) res[key] = argv[(i = l) - 1];
			return i;
		}
		if (ask('anonymous arguments are not allowed')) return i;
	}
	if (ext) ask('this option requires an argument');
	return i;
};