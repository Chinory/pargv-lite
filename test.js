'use strict';
import parse from './index.js';
import assert from 'assert';

// Test suite for json-parse-argv
console.log('🧪 Running json-parse-argv tests...');

// Helper function to run tests
function runTest(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`   ${error.message}`);
    process.exitCode = 1;
  }
}

// Error handler for tests
const errorHandler = (err) => {
  console.log(`   Test error: ${err.msg} at position ${err.i} for option ${err.opt}`);
  return false; // Continue parsing
};

// TEST 1: Basic boolean flags
runTest('Basic boolean flags', () => {
  const req = {
    help: {
      def: false,
      set: ['-h', '--help']
    },
    version: {
      def: false,
      set: ['-v', '--version']
    }
  };
  
  
  // Test --help
  const res1 = {};
  parse(['node', 'script.js', '--help'], 2, req, res1, errorHandler);
  assert.strictEqual(res1.help, true);
  assert.strictEqual(res1.version, false);
  
  // Test -h
  const res2 = {};
  parse(['node', 'script.js', '-h'], 2, req, res2, errorHandler);
  assert.strictEqual(res2.help, true);
  assert.strictEqual(res2.version, false);
  
  // Test --version
  const res3 = {};
  parse(['node', 'script.js', '--version'], 2, req, res3, errorHandler);
  assert.strictEqual(res3.help, false);
  assert.strictEqual(res3.version, true);
  
  // Test -v
  const res4 = {};
  parse(['node', 'script.js', '-v'], 2, req, res4, errorHandler);
  assert.strictEqual(res4.help, false);
  assert.strictEqual(res4.version, true);
  
  // Test multiple flags
  const res5 = {};
  parse(['node', 'script.js', '-h', '-v'], 2, req, res5, errorHandler);
  assert.strictEqual(res5.help, true);
  assert.strictEqual(res5.version, true);
});

// TEST 2: String options
runTest('String options', () => {
  const req = {
    output: {
      def: 'stdout',
      set: ['-o', '--output']
    }
  };
  
  // Test --output=file.txt
  const res1 = {};
  parse(['node', 'script.js', '--output=file.txt'], 2, req, res1, errorHandler);
  assert.strictEqual(res1.output, 'file.txt');
  
  // Test -o file.txt
  const res2 = {};
  parse(['node', 'script.js', '-o', 'file.txt'], 2, req, res2, errorHandler);
  assert.strictEqual(res2.output, 'file.txt');
  
  // Test default value
  const res3 = {};
  parse(['node', 'script.js'], 2, req, res3, errorHandler);
  assert.strictEqual(res3.output, 'stdout');
});

// TEST 3: Array options
runTest('Array options', () => {
  const req = {
    files: {
      def: [],
      set: ['--files']
    },
    allFiles: {
      def: [],
      set: ['--']
    }
  };
  
  // Test --files file1.txt
  const res1 = {};
  parse(['node', 'script.js', '--files', 'file1.txt'], 2, req, res1, errorHandler);
  assert.deepStrictEqual(res1.files, ['file1.txt']);
  
  // Test -- file1.txt file2.txt
  const res2 = {};
  parse(['node', 'script.js', '--', 'file1.txt', 'file2.txt', 'file3.txt'], 2, req, res2, errorHandler);
  assert.deepStrictEqual(res2.allFiles, ['file1.txt', 'file2.txt', 'file3.txt']);
});

// TEST 4: Reset options
runTest('Reset options', () => {
  const req = {
    verbose: {
      def: false,
      set: ['-v', '--verbose'],
      rst: ['--quiet']
    },
    files: {
      def: ['default.txt'],
      set: ['--files'],
      rst: ['--no-files']
    }
  };
  
  // Test setting and resetting
  const res1 = {};
  parse(['node', 'script.js', '--verbose', '--quiet'], 2, req, res1, errorHandler);
  assert.strictEqual(res1.verbose, false);
  
  // Test resetting array
  const res2 = {};
  parse(['node', 'script.js', '--files', 'file1.txt', '--no-files'], 2, req, res2, errorHandler);
  assert.deepStrictEqual(res2.files, ['default.txt']);
});

// TEST 5: Exit options for subcommands
runTest('Exit options', () => {
  const req = {
    help: {
      def: false,
      set: ['-h', '--help']
    },
    command: ['build', 'test', 'deploy']
  };
  
  // Test exit on command
  const res = {};
  const ret = parse(['node', 'script.js', 'build', '--extra'], 2, req, res, errorHandler);
  assert.strictEqual(ret.key, 'command');
  assert.strictEqual(ret.opt, 'build');
  assert.strictEqual(ret.i, 3);
});

// TEST 6: Combined short options
runTest('Combined short options', () => {
  const req = {
    verbose: {
      def: false,
      set: ['-v']
    },
    help: {
      def: false,
      set: ['-h']
    },
    force: {
      def: false,
      set: ['-f']
    }
  };
  
  // Test -vhf
  const res = {};
  parse(['node', 'script.js', '-vhf'], 2, req, res, errorHandler);
  assert.strictEqual(res.verbose, true);
  assert.strictEqual(res.help, true);
  assert.strictEqual(res.force, true);
});

// TEST 7: Value with short option
runTest('Value with short option', () => {
  const req = {
    port: {
      def: '8080',
      set: ['-p']
    }
  };
  
  // Test -p3000
  const res = {};
  parse(['node', 'script.js', '-p3000'], 2, req, res, errorHandler);
  assert.strictEqual(res.port, '3000');
});

// TEST 8: Default naming (using key as option)
runTest('Default naming', () => {
  // Use string format for exit option
  const req1 = {
    help: null // This sets up 'help' as both the key and option name as an exit option
  };
  
  // Test that the exit option works using the key as name
  const res1 = {};
  const ret1 = parse(['node', 'script.js', 'help'], 2, req1, res1, errorHandler);
  assert.strictEqual(ret1.key, 'help');
  assert.strictEqual(ret1.opt, 'help');
  
  // Test using null for direct naming
  const req2 = {
    verbose: {
      def: false,
      set: null // null means use 'verbose' as option name
    }
  }, res2 = {};
  parse(['node', 'script.js', 'verbose'], 2, req2, res2, errorHandler);
  assert.strictEqual(res2.verbose, true);

  // Test using null in array for direct naming
  const req3 = {
    verbose: {
      def: false,
      set: [null] // null means use 'verbose' as option name
    }
  }, res3 = {};
  parse(['node', 'script.js', 'verbose'], 2, req3, res3, errorHandler);
  assert.strictEqual(res3.verbose, true);  

  const req3a = {
    verbose: {
      def: false,
      set: [null, '-v'] 
    }
  }, res3a = {};
  parse(['node', 'script.js', '-v'], 2, req3a, res3a, errorHandler);
  assert.strictEqual(res3a.verbose, true);  

  // Test using '' for direct naming
  const req4 = {
    verbose: {
      def: false,
      set: '' // '' doesn't mean use 'verbose' as option name
    }
  }, res4 = {};
  parse(['node', 'script.js', ''], 2, req4, res4, errorHandler);
  assert.strictEqual(res4.verbose, true);

  // Test using '' in array for direct naming
  const req5 = {
    verbose: {
      def: false,
      set: [''] // '' doesn't mean use 'verbose' as option name
    }
  }, res5 = {};
  parse(['node', 'script.js', ''], 2, req5, res5, errorHandler);
  assert.strictEqual(res5.verbose, true);  

  const req5a = {
    verbose: {
      def: false,
      set: ['', '-v'] 
    }
  }, res5a = {};
  parse(['node', 'script.js', '-v'], 2, req5a, res5a, errorHandler);
  assert.strictEqual(res5a.verbose, true);  


});

// TEST 9: Error handling
runTest('Error handling', () => {
  const req = {
    verbose: {
      def: false,
      set: ['-v', '--verbose']
    }
  };
  
  let errorCaught = false;
  
  const customErrorHandler = (err) => {
    errorCaught = true;
    return false; // Continue parsing
  };
  
  const res = {};
  parse(['node', 'script.js', '--unknown'], 2, req, res, customErrorHandler);
  assert.strictEqual(errorCaught, true);
});

// TEST 10: Exit on anonymous arguments
runTest('Exit on anonymous arguments', () => {
  const req = {
    help: {
      def: false,
      set: ['-h', '--help']
    },
    files: '--'
  };
  
  // Test exit on command
  const res = {};
  const ret = parse(['node', 'script.js', '--help', '1.txt', '2.txt'], 2, req, res, errorHandler);
  assert.strictEqual(ret.key, 'files');
  assert.strictEqual(ret.opt, '1.txt');
  assert.strictEqual(ret.i, 3);
});

console.log('🎉 All tests completed!'); 