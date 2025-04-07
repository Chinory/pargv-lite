'use strict';
const isA = Array.isArray;
/**
 * @typedef {string} Key Variable name, in most cases, or kit name
 * @typedef {string} Opt Option string, e.g. '--', '-o', '--option'
 * @typedef {Opt | null} OptDef Option definition(or default option(pun again?)), e.g. '--', '-o', '--option' or `null` to refer to the variable name `Key`
 * @typedef {OptDef | OptDef[]} OptKit one or more option definitions, for a shortest expression
 * 
 * @typedef {boolean | undefined} Bool actually `Optional<Boolean>`. yes since a bool can't be inside an array in this project, this design is good, very good, PERFECT
 * @typedef {string | number | null} Text Values that can be written as text IN JSON. it's the project POSITIONING
 * @typedef {Text[]} List only adding or resetting for now. oh this is enough as this is just a configurer not a programming language
 * 
 * @typedef {Object} BoolKit only appearance matters don't give some extensions to it
 * @property {Bool} [def] Variable **def**inition & **def**ault value (pun intended)
 * @property {OptKit} [set] Options to set `!def`. Raise `err` with `undefined`. Identical with `not`. // maybe not like this?? any other behavior?
 * @property {OptKit} [yes] Options to set `true`
 * @property {OptKit} [no]  Options to set `false`
 * @property {OptKit} [on]  Options to set `true`
 * @property {OptKit} [off] Options to set `false`
 * @property {OptKit} [not] Options to set `!def`. Raise `err` with `undefined`
 * @property {OptKit} [inv] Options to set `!cur`. Raise `err` with `undefined`
 * @property {OptKit} [nul] Options to set `undefined`. (what??) maybe the user wants to cause some NullExceptions
 * @property {OptKit} [rst] Options to set `def`
 * 
 * @typedef {Object} TextKit you have to use something. but if i say, when ext=0, it is just Bool..hmmmm BUT you can't name a zero size setter, it must be 'set', 'set_set', 'str_num', but not ''(???)
 * @property {Text?} def Variable **def**inition & **def**ault value (pun intended)  can be `null`, maybe this is the only way to provide `Optional<Text>`
 * @property {OptKit} [set] Options to set the raw string slice from the argv
 * @property {OptKit} [nul] Options to set `null`. (what??) maybe the user wants to cause some NullExceptions
 * @property {OptKit} [rst] Options to set `def`. The short name is reasonable, so you don't match `reset` when you search `set`, it IS `rst`
 * @property {number} [ext] Deprecated (it's in setter name now) consume such number of arguments as extension at once. only available when def is an array. so we shall ban the -- for '' the ambiguous feature
 * @property {OptKit} [str] External Options to set a string, can escape the quotes
 * @property {OptKit} [num] External Options to set `Number(arg)`. Raise `err` with `NaN`. Provide a JSON Number Type in other language, naturally
 * @property {OptKit} [int] Deprecated External Options to set `BigInt(arg)`. Raise `err` when throw // but since not available in JSON ... and this name confilct with parseInt
 * @property {OptKit} [sym] Deprecated External Options to set `Symbol(arg)`. // but since not available in JSON ... // omg it doesn't even available in most of other languages
 * 
 * @typedef {Object} ListKit now you can put 'set', 'set_set', 'str_num', here. OR add another param to parse() to define how to initialize a var from raw string. YES! It's not my duty! Something like `{ num: v => { if (isNaN(v = Number(v)) throw 'not a number'; return v; } }`, ` { i64: v => { throw 'This is in JAVASCRIPT you Rust guy' } }`, ` { bigint: BigInt } // it throws`. AND throw directly if there's a mistake in `req` as it's a compile time error not a runtime one
 * @property {List} def there is no `Optional<List>` for sure because it's stupid for an emptiable container. All set option in `TextKit` is available to push the value into the array
 * @property {OptKit} [set] Options to set the raw string slice from the argv
 * @property {OptKit} [rst] Options to set the array back to `def`
 * 
 * @typedef {OptDef | OptDef[]} ExitKit there are only two types of container in JSON: list, dict. And this the list one
 * @typedef {BoolKit | TextKit | ListKit} VarKit
 * @typedef {{ [key: Key]: ExitKit | VarKit }} KitMap The `req` arg of `parse`. `ExitKit` has higher priority (extension is even higher. '--' is highest)
 * 
 * @typedef {Bool | Text | List} VarVal // `undefined` is from `Bool`, `null` is from `Text`
 * @typedef {{ [key: Key]: VarVal }} VarValMap The `req` arg of `parse`.
 * @typedef {{ i: number, key: Key, opt: Opt }} ExitVal 
 * 
 * @callback IsFatal
 * @param {{ i: number, msg: string, opt: Opt, key?: Key, val?: VarVal }} err
 * @returns {boolean} Whether the parsing should continue (false) or quit (true)
 * @typedef {(k: Key, v: VarVal) => void} Act
 * @typedef {{ [cmd: string]: Act }} KitImpl
 * @typedef {{ [opt: Opt]: { a: Act, k: Key } }} OptReg internal type
 */
/** Get OD! @param {OptKit} ok */
const god = ok => ok === undefined ? [] : isA(ok) ? ok : [ok];
export const Config = {
	// WTF feature
	/** dash sign @type {'-'} */
	d: '-',
	/** equal sign @type {'='} */
	eq: '=',
	/** `'-opt'` => `{ opt: '-opt' }` @type {false} */
	d_opt: false,
	/** `'-abc'` => `'-a', '-b', '-c'` @type {true} */
	d_abc: true,
	/** `'-oval'` => `{ opt: '-o', val: 'val' }` @type {true} */
	d_o_val: true,
	/** `'--'` => Consume **all** the rest arguments @type {true} */  // modify the compile time behavior
	dd_all: true, 
	/** `'--opt=val'` => `{ opt: '--opt', val: 'val' }` @type {true} */
	dd_opt_eq_val: true,
};


/** @type {KitImpl} */
const bki = {
	set: function(k, v) {
		
	}
};



export { bki as BoolKitImpl };

/**
 * Command line argument parser function
 * @param {string[]} argv Command line arguments array, e.g. `process.argv`
 * @param {number} i Index of current argument being processed, e.g. `2`
 * @param {KitMap} req Options structure definition
 * @param {VarValMap} res Object to store parsed results
 * @param {IsFatal} err Error handler function, return `true` to quit parsing. It'a clean quit, no bad data in `res`
 * @returns {ExitVal?} `ret` provided when an Exit option applied `@type { i: number, key: Key, opt: Opt }`
 */
export default function parse(argv, i, req, res, err = console.error, cfg = Config) {
	/** @type {Opt} */
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
	ask = (msg, val) => err({ i, msg, opt, key, val }),
	exit = c => ({ i: i+c, key, opt });


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

	// TODO: const d0 = {}, d1 = {}, d2 = {}
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
	// maxOptLen += 1; // TODO // cfg.eq.length; // wtf is this
	let ext = false; // this can be a number, so that a multiple extension is naturally available but how do I configure it
	s: for (; i < argv.length; ++i) {
		const s = argv[i];
		// const h = s.length > maxOptLen ? s.slice(0, maxOptLen) : s; // TODO
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
		// -abc or -opt
		if (s[1] !== '-') {
			// -opt
			if (cfg.d_opt) {
				// WTF maybe support '-opt' ? wtf // maybe should record the max length of '-opt's
			}
			const J = s.length - 1; // this can't be negative
			// -abc

			// -a :: yes new branch TODO TODO TODO

			if (cfg.d_abc) {
				// -b :: no extension, no anonymous, no exit
				for (let j = 2; j < J; ++j) {
					opt = '-' + s[j];
					if (key = str_[opt]) { if (noB()) { set(s.slice(j + 1)); continue s; } } // TODO feature.d_o_val
					else if (key = rst_[opt]) rst();
					else if (key = exit_[opt]) { if (ask('cannot exit within an argument')) return null; }
					else if (ask('invalid option')) return null;
				}
			} else if (J > 1) {
				// opt? key?
				opt = s[2]; // check it
				if (ask('invalid option')) return null;
				continue;
			}
			// -c or -o :: no anonymous
			opt = '-' + s[J];
			if (key = str_[opt]) ext = noB();
			else if (key = rst_[opt]) rst();
			else if (key = exit_[opt]) return exit(1);
			else if (ask('invalid option')) return null;
			continue;
		}
		// --opt
		if (s.length > 2) {
			// --opt=val
			if (cfg.dd_opt_eq_val) eq: { 
				let J = s.indexOf('='); // TODO s.slice(2, maxOptLen).indexOf('=')
				if (J < 0) break eq; // TODO else J += 2;
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
			// --opt ...
			if (key = str_[opt = s]) ext = noB();
			else if (key = rst_[opt]) rst();
			else if (key = exit_[opt]) return exit(1);
			else if (ask('invalid option')) return null;
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