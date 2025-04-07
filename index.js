'use strict';
const isA = Array.isArray;
/**
 * @typedef {string} Key Variable name, in most cases, or kit name
 * @typedef {string} Option Option string, e.g. '--', '-o', '--option'
 * @typedef {Option | null} OptDef Option definition, e.g. '--', '-o', '--option' or `null` to refer to the variable name `Key`
 * @typedef {OptDef | OptDef[]} OptKit one or more option definitions, for a shortest expression
 * 
 * @typedef {boolean | null} Bool actually `Optional<Boolean>`
 * @typedef {string | number} Text Values that can be written as text IN JSON. it's the project POSITIONING
 * @typedef {Text[]} List
 * 
 * @typedef {Object} BoolKit only appearance matters don't give some extensions to it
 * @property {Bool} def Variable **def**inition & **def**ault value (pun intended)
 * @property {OptKit} [set] Options to set `!def`. Call `err` with `null`. Identical with `not`
 * @property {OptKit} [yes] Options to set `true`
 * @property {OptKit} [no]  Options to set `false`
 * @property {OptKit} [on]  Options to set `true`
 * @property {OptKit} [off] Options to set `false`
 * @property {OptKit} [not] Options to set `!def`. Call `err` with `null`
 * @property {OptKit} [inv] Options to set `!cur`. Call `err` with `null`
 * @property {OptKit} [rst] Options to set `def`
 * 
 * @typedef {Object} TextKit you have to use something. but if i say, when ext=0, it is just Bool..hmmmm BUT you can't name a zero size setter, it must be 'set', 'set_set', 'str_num', but not ''(???)
 * @property {Text} def Variable **def**inition & **def**ault value (pun intended)
 * property {number} [ext] Deprecated(it's in setter name now) consume such number of arguments as extension at once. only available when def is an array. so we shall ban the -- for '' the ambiguous feature
 * @property {OptKit} [set] Options to set by referring the data type of `def`
 * property {OptKit} [str] Options to set `arg: string` // which name is better?
 * property {OptKit} [num] Options to set `Number(arg)`. Call `err` with `NaN` // dute hmmm..,
 * property {OptKit} [int] Options to set `BigInt(arg)`. Call `err` when throw // but since not available in JSON ... and this name confilct with parseInt
 * property {OptKit} [sym] Options to set `Symbol(arg)`. // but since not available in JSON ... // omg it doesn't even available in most of other languages
 * @property {OptKit} [rst] Options to set `def`. The short name is reasonable, so you don't match `reset` when you search `set`, it IS `rst`
 * 
 * @typedef {Object} ListKit now you can put 'set', 'set_set', 'str_num', here. OR add another param to parse() to define how to initialize a var from raw string. YES! It's not my duty! Something like `{ num: v => { if (isNaN(v = Number(v)) throw 'not a number'; return v; } }`, ` { i64: v => { throw 'This is in JAVASCRIPT you Rust guy' } }`, ` { bigint: BigInt } // it throws`. AND throw directly if there's a mistake in `req` as it's a compile time error not a runtime one
 * @property {List} def
 * @property {OptKit} [set] Options to set by referring the data type of `def` of the value in respective postion
 * @property {OptKit} [rst]
 * 
 * @typedef {OptDef | OptDef[]} ExitKit there are only two types of container in JSON: list, dict. And this the list one
 * @typedef {BoolKit | TextKit | ListKit} VarKit
 * @typedef {{ [key: Key]: ExitKit | VarKit }} KitMap The `req` arg of `parse`. `ExitKit` has higher priority (extension is even higher. '--' is highest)
 * 
 * @typedef {Bool | Text | List} VarVal
 * @typedef {{ [key: Key]: VarVal }} VarValMap The `req` arg of `parse`.
 * @typedef {{ avi: number, key: Key, opt: Option }} ExitVal 
 * 
 * @callback IsFatal
 * @param {{ msg: string, avi: number, opt: Option, key?: Key, val?: VarVal }} err
 * @returns {boolean} Whether the parsing should continue (false) or quit (true)
 * @typedef {(k: Key, v: VarVal) => void} Act
 * @typedef {{ [opt: Option]: { a: Act, k: Key } }} OptReg internal type
 */
/** Get OD! @param {OptKit} ok */
const god = ok => ok === undefined ? [] : isA(ok) ? ok : [ok];

/**
 * Command line argument parser function
 * @param {string[]} argv Command line arguments array, e.g. `process.argv`
 * @param {number} i Index of current argument being processed, e.g. `2`
 * @param {KitMap} req Options structure definition
 * @param {VarValMap} res Object to store parsed results
 * @param {IsFatal} err Error handler function, return true to quit parsing
 * @returns {ExitVal?} `ret` provided when an Exit option applied `@type { avi: number, key: Key, opt: Option }`
 */
export default function parse(argv, i, req, res, err) {
	/** @type {Option} */
	let opt = '';
	/** @type {Key}  */
	let key;

	/** @type {Key | undefined} */
	let _key, _exit = false;

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


	}, k = o => o === null ? key : o,
	ask = (msg, val) => err({msg, avi: i, opt, key, val}),
	exit = c => ({ avi: i+c, key, opt });


	const a_b1 = k => { res[k] = true; }
	const a_b0 = k => { res[k] = false; }
	const a_bn = k => { res[k] = req[k].def; }
	const a_bi = k => { 
		const def = res[k].def;

		res[k] = !res[k];
	}

	/** 
	 * @param {OptKit} k 
	 * @param {OptReg} r 
	 * @param {Act} a
	 * @param {Key} k
	 * */
	const lo = (k, r, a) => {
		if (k === undefined) return;
		for (let o of isA(k) ? k : [k]) {
			if (o === undefined) continue;
			if (o === null) o = key;
			if (o !== '--') r[o] = { a, k };
			
		}
	}, go = (k, r) => {
		if (k === undefined) return;
		for (let o of isA(k) ? k : [k]) {
			if (o === undefined) continue;
			if (o === null) o = key;
			if (o !== '--') r[o] = key;
			else _key = key, _exit = false;
		}
	};


	// prepare
	/** @type {OptReg} */
	const exit_ = {}, rst_ = {}, bk_ = {}, tk_ = {},
		str_ = {}, num_ = {}, int_ = {}, sym_ = {},
		b1_ = {}, b0_ = {}, bn_ = {}, bi_ = {};

	for (key in req) {
		const vk = req[key];
		if (vk === undefined) continue;
		xk: { let xk;
			if (typeof vk === 'object') {
				if (vk === null) xk = [vk];
				else if (isA(vk)) xk = vk;
				else break xk;
			} else xk = [vk];
			for (let o of xk) {
				if (o === undefined) continue;
				if (o === null) o = key;
				if (o !== '--') exit_[o] = key;
				else _key = key, _exit = true;
			} continue; }
		const def = vk.def;
		res[key] = isA(def) ? def.slice() : def;
		lo(vk.rst, rst_);
		// BoolKit
		switch (typeof def) {
			case 'object':
			if (def !== null) break;
			case 'boolean':
			lo(vk.yes, b1_);
			lo(vk.no, b0_);
			lo(vk.on, b1_);
			lo(vk.off, b0_); 
			lo(vk.not, bn_);
			lo(vk.inv, bi_);
			continue; }
		// TextKit
		go(vk.str, str_);
		go(vk.num, num_);
		go(vk.int, int_);
		go(vk.sym, sym_);
	}
	// process
	let ext = false; // this can be a number, so that a multiple extension is naturally available but how do I configure it
	s: for (; i < argv.length; ++i) {
		const s = argv[i];
		// extension :: ASSERT key===set_[opt]
		if (ext) { ext = false;
			if (key) { set(s); continue; }
			if (ask('invalid option', s)) return null;
		}
		// abc
		if (s.length < 2 || s[0] !== '-') {
			opt = s;

			const ak = exit_[opt];
			if (ak) {
				const {a, k} = ak;
				
			}
			

			if (key = exit_[opt]) return exit(1);
			else if (key = rst_[opt]) rst();


			if (key = str_[opt = s]) ext = noB(); 
			else if (key = rst_[opt]) rst();
			else if (key = exit_[opt]) return exit(1);
			else if (key = _key) if (_exit) return exit(0); else set(s);
			else if (ask('invalid option')) return null;
			continue;
		}
		// -abc
		if (s[1] !== '-') {
			// maybe support '-opt' ? wtf
			const J = s.length - 1;
			for (let j = 1; j < J; ++j) {
				// -ab :: no extension, no anonymous, no exit
				opt = '-' + s[j];
				if (key = str_[opt]) { if (noB()) { set(s.slice(j + 1)); continue s; } }
				else if (key = rst_[opt]) rst();
				else if (key = exit_[opt]) { if (ask('cannot exit within an argument')) return null; }
				else if (ask('invalid option')) return null;
			}
			// -c :: no anonymous
			opt = '-' + s[J];
			if (key = str_[opt]) ext = noB();
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
				if (key = str_[opt = s]) ext = noB();
				else if (key = rst_[opt]) rst();
				else if (key = exit_[opt]) return exit(1);
				else if (ask('invalid option')) return null;
				continue;
			} 
			// --opt=val
			let t; opt = s.slice(0, J);
			const v = s.slice(J + 1);
			if (key = str_[opt])
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