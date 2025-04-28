'use strict';
const isA = Array.isArray;
/**
 * @typedef {string} KeyStr Variable name, in most cases, or kit name
 * @typedef {string} OptStr Option string, e.g. '--', '-o', '--option'
 * @typedef {OptStr | null} OptDef Option definition, e.g. '--', '-o', '--option', or `null` to refer to the variable name
 * @typedef {OptDef | OptDef[]} OptKit one or more option definitions, for a shortest one
 * 
 * @typedef {object} VarKit Variable configuration object
 * @property {VarVal} [def] Variable **def**inition & **def**ault value (pun intended)
 * @property {OptKit} [set] Array of options to set the variable value
 * @property {OptKit} [rst] Array of options to reset the variable value
 * @typedef {string | boolean | string[]} VarVal Variable value
 * 
 * @typedef {OptDef | OptDef[]} ExitKit Exit options
 * @typedef {Record<KeyStr, VarKit | ExitKit>} KeyKitMap `req`
 * @typedef {Record<KeyStr, VarVal>} KeyValMap `res`
 * 
 * @callback IsFatal
 * @param {{msg: string, i: number, opt: OptStr, key?: KeyStr, val?: VarVal }} err
 * @returns {boolean} Whether the parsing should continue (false) or quit (true)
 * @typedef {Record<OptStr, KeyStr>} OptKeyMap internal type
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
 * @returns {{ i: number, key: KeyStr, opt: OptStr }?} `ret` is object when an exit option applied
 */
export default function parse(argv, i, req, res, err) {
	/** @type {OptStr} option */
	let opt = '';
	/** @type {KeyStr | undefined} key */
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
	}, k = o => o == null ? key : o, // undefined is... well
	ask = (msg, val) => err({msg, i: i, opt, key, val}),
	exit = c => ({ i: i+c, key, opt });
	// prepare
	/** @type {OptKeyMap} */
	const set_ = {}, rst_ = {}, exit_ = {};
	/** @type {KeyStr | undefined} */
	let _key, _exit = false;
	for (key in req) {
		const vk = req[key];
		X: { let xk;
			switch (typeof vk) {
				case 'object':
					if (vk === null) xk = [vk];
					else if (isA(vk)) xk = vk; 
					else break X; break;
				case 'undefined': continue;
				default: xk = [vk]; }
			for (let o of xk) if ((o=k(o))!=='--') exit_[o] = key;
				else _key = key, _exit = true;
			continue; }
		const def = vk.def; // if (def === undefined) continue;
		res[key] = isA(def) ? def.slice() : def;
		for (let o of god(vk.set)) if ((o=k(o))!=='--') set_[o] = key;
			else if (typeof def !== 'boolean') _key = key, _exit = false;
		for (let o of god(vk.rst)) if ((o=k(o))!=='--') rst_[o] = key;
	}
	// process
	let ext = false;
	S: for (; i < argv.length; ++i) {
		const s = argv[i];
		// extension :: ASSERT key===set_[opt]
		if (ext) { ext = false;
			if (key) { set(s); continue; }
			if (ask('invalid option', s)) return null;
		}
		// abc
		if (s.length < 2 || s[0] !== '-') {
			if (key = set_[opt = s]) ext = noB(); 
			else if (key = rst_[opt]) rst();
			else if (key = exit_[opt]) return exit(1);
			else if (key = _key) if (_exit) return exit(0); else set(s);
			else if (ask('invalid option')) return null;
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
				else if (key = exit_[opt]) { if (ask('cannot exit within an argument')) return null; }
				else if (ask('invalid option')) return null;
			}
			// -c :: no anonymous
			opt = '-' + s[J];
			if (key = set_[opt]) ext = noB();
			else if (key = rst_[opt]) rst();
			else if (key = exit_[opt]) return exit(1);
			else if (ask('invalid option')) return null;
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
				else if (ask('invalid option')) return null;
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
			else if (ask('invalid option', v)) return null;
			else continue;
			if (ask(`cannot assign value to ${t} option`, v)) return null;
			continue;
		}
		opt = '--';
		if (key = _key) {
			if (_exit) return exit(1);
			const a = res[key], l = argv.length; ++i;
			if (isA(a)) while (i < l) a.push(argv[i++]);
			else if (i < l) res[key] = argv[(i = l) - 1];
			return null;
		}
		if (ask('anonymous arguments are not allowed')) return null;
	}
	if (ext) ask('this option requires an argument');
	return null;
};