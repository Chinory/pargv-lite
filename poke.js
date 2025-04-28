'use strict';
import parse from './index.js';

const $ = console.log, 
  e = a => console.error('💥', a), 
  hr = '-'.repeat(42);
$(hr);

const poke = (title, argv, req) => {
  $('🤓', title);
  $('⌨️ ', argv.length, argv);
  $('🔍', req);
  const res = {}, ret = parse(argv, 0, req, res, e);
  $('🎁', res);
  $('😇', ret);
  $(hr);
};

poke('give all to a bool', ['awawaw'], {
  bool: { def: false, set: ['--'] },
}); // else if (typeof def !== 'boolean') _key = key, _exit = false;

poke('My key is two dashes but I dont know how to set', ['awawaw', 'sdfsdf'], {
  '--': { def: [], set: null },
});

poke('super long dash', ['awawaw', '-----D', 'sdfsdf'], {
  '--': { def: [], set: null },
  '-----D': null
});

poke('Set Bool Get Chain Bomb', ['-bawawaw', 'sdfsdf'], {
  bool: { def: false, set: ['--', '-b'] },
});

poke('Assign Bool', ['--b=awawaw', 'sdfsdf'], {
  bool: { def: false, set: ['--', '--b'] },
});

poke('Assign Bool + Pool', ['--b=awawaw', 'sdfsdf'], {
  bool: { def: false, set: ['--', '--b'] },
  pool: { def: [], set: ['--', '--b'] },
}); // Overwritten all, which is expected behavior.

poke('Assign Pool + Bool', ['--b=awawaw', 'sdfsdf'], {
  pool: { def: [], set: ['--', '--b'] },
  bool: { def: false, set: ['--', '--b'] },
}); // bool only overwrites '--b', which is expected

poke('My New Home is in Random Place After a b', ['--b=awawaw', 'sdfsdf'], {
  '--': null
});

poke('My New Home is in Random Place', ['awawaw', 'sdfsdf'], {
  '--': null
});

poke('My New Home is after two Dashes', ['--', 'awawaw', 'sdfsdf'], {
  '--': null
});

poke('My New Home is An Empty Bad Guy', ['awawaw', 'sdfsdf'], {
  good: { def: [], set: '--' },
  home: { set: '--' }
}); // if (def === undefined) continue;

poke('My set is undefined', ['awawaw', 'sdfsdf'], {
  '--': { def: [], set: undefined }
});

poke('My set is null', ['awawaw', 'sdfsdf'], {
  '--': { def: [], set: null }
});

poke('My exit is [null]', ['awawaw', 'sdfsdf'], {
  '--': [null]
});

poke('My exit is [undefined]', ['awawaw', 'sdfsdf'], {
  '--': [undefined]
}); // this is I said undefined acts like null in OptKit

poke('My Dashes are undefined', ['awawaw', 'sdfsdf'], {
  '--': undefined
}); // Can't use undefined in ExitKit 

poke('My Dashes are null', ['awawaw', 'sdfsdf'], {
  '--': null
}); // But null is ok

poke('cannot exit within an argument && default named exit option', ['-abcd'], {
  a: { def: false, set: '-a' },
  b: '-b',
  '-c': undefined,
  '-d': null,
});
/*
🤓 cannot exit within an argument && default named exit option
⌨️  1 [ '-abcd' ]
🔍 { a: { def: false, set: '-a' }, b: '-b', '-c': undefined, '-d': null }
💥 {
  msg: 'cannot exit within an argument',
  i: 0,
  opt: '-b',
  key: 'b',
  val: undefined
}
💥 {
  msg: 'invalid option',
  i: 0,
  opt: '-c',
  key: undefined,
  val: undefined
}
🎁 { a: true }
😇 { i: 1, key: '-d', opt: '-d' }
*/