# 🚀 pargv-lite

A lightning-fast, single-pass command line argument parser with structural validation and elegant JSON configuration.

## ✨ Features

- **Concise JSON Configuration**: Define your entire command structure in a single JSON object
- **Single-Pass Processing**: Parses, validates, and populates all in one efficient scan
- **Type Safety**: Built-in structure and type validation during parsing
- **Error Resilience**: Configurable error handling with continue/abort control
- **Seamless Subcommand Support**: First-class "exit" mechanism for complex command structures
- **Zero Dependencies**: Pure JavaScript with no external libraries
- **Predictable Results**: No type errors or undefined values (all variables are initialized)

## 📦 Installation

```bash
npm install pargv-lite
```

## 🔍 Elegant Usage Example

```javascript
import parse from 'pargv-lite';

// Define your application's command structure
const gitReq = {
  // Global options
  help: {
    def: false,
    set: ['-h', '--help']
  },
  verbose: {
    def: false,
    set: ['-v', '--verbose']
  },
  // Subcommands (direct string array format for exit options)
  command: ['clone', 'push', 'pull', 'commit', 'checkout']
};

// Commit subcommand config
const commitReq = {
  message: {
    def: '',
    set: ['-m', '--message']
  },
  all: {
    def: false,
    set: ['-a', '--all']
  },
  amend: {
    def: false,
    set: ['--amend']
  }
};

function main() {
  const gitRes = {};
  
  // First parse to handle global options and identify subcommand
  const ret = parse(process.argv, 2, gitReq, gitRes, errorHandler);
  
  // Handle help flag
  if (gitRes.help) {
    showHelp();
    return;
  }
  
  // Check if a subcommand was encountered (returns object with next position)
  if (typeof ret === 'object') {
    // ret contains { i, key, opt }:
    // - ret.i is the index to continue parsing from (already incremented)
    // - ret.key is the variable name in gitReq that triggered the exit ('command')
    // - ret.opt is the option string that triggered the exit (subcommand name)
    
    console.log(`Executing ${ret.opt} command...`);
    
    switch (ret.opt) {
      case 'commit':
        // Parse commit-specific options starting from ret.i
        const commitRes = {};
        parse(process.argv, ret.i, commitReq, commitRes, errorHandler);
        
        // Use the results
        console.log(
          `Committing with message: ${commitRes.message}`,
          commitRes.all ? '(all files)' : '',
          commitRes.amend ? '(amending)' : ''
        );
        break;
        
      case 'push':
        // Handle push command...
        break;
        
      // Handle other commands...
    }
  }
}

// Error handler
function errorHandler(err) {
  console.error(`Error at arg ${err.i}: ${err.msg}`);
  return false; // Continue parsing
}
```

## 🛠️ API

```javascript
parse(argv, i, req, res, err)
```

- **argv**: Array of command line arguments (usually `process.argv`)
- **i**: Starting index for parsing (usually 2)
- **req**: Configuration object defining your command structure
- **res**: Object that will be populated with parsed results
- **err**: Error handler function, receives `{msg, i, opt, key, val}` and returns boolean

### Return Value

The function returns either:
- A number (the next index after parsing completed normally)
- An object `{ i, key, opt }` when exiting early due to an exit option, where:
  - `i`: The next index to resume parsing from (already incremented past the exit option)
  - `key`: The variable name in the req object that triggered the exit
  - `opt`: The option string that triggered the exit (e.g., the subcommand name)

### Configuration Format

```javascript
{
  // Regular variable with default value and option definitions
  variableName: {
    def: defaultValue,    // Required: Boolean, string, or string[]
    set: optionDefinition, // Options that set this variable
    rst: optionDefinition  // Options that reset this variable to default
  },
  
  // Exit option (shorthand format) - exits parsing when encountered
  exitOptionName: optionDefinition
}
```

Option definitions can be:
- A string: `'--option'`
- An array of strings: `['--option', '-o']`
- Include `null` in an array to use the variable name as an option: `[null, '-o']`

## ⚡ Powerful Features

### Boolean Options

```javascript
// Simple flags (no value needed)
verbose: {
  def: false,
  set: ['-v', '--verbose']
}
```

### String Options

```javascript
// String option with default value
output: {
  def: 'stdout',
  set: ['-o', '--output']
}
```

### Array Collection

```javascript
// Collect multiple values in an array
files: {
  def: [],
  set: ['-i', '--input'] // -i 1.txt --input 2.txt -i3.txt --input=4.txt
}

// '--' automatically collects all the anonymous arguments. 
// If you write it out, it collects all the rest arguments.
allFiles: {
  def: [],
  set: ['--', '-i'] // -i 1.txt 2.txt -- --this-will-be-collected-too
}
```

### Reset Options

```javascript
// Option to reset value back to default
// For boolean values:
color: {
  def: false,
  set: ['--color'],   // Sets to true (!def)
  rst: ['--no-color'] // Resets to false (def)
}

big: {
  def: true,
  set: ['--small']  // Sets to false (!def)
  rst: ['--big'],   // Resets to true (def)
}

// For strings or arrays, reset restores the original default:
files: {
  def: ['default.txt'],
  set: ['--files'],    // Adds files to array
  rst: ['--no-files']  // Resets back to ['default.txt']
}
```

Note: Inverting a boolean value is not supported now. 

### Combined Short Options

```javascript
// -abc is equivalent to -a -b -c
const res = {};
parse(['node', 'app.js', '-abc'], 2, {
  a: { def: false, set: '-a' },
  b: { def: false, set: '-b' },
  c: { def: false, set: '-c' }
}, res, errorHandler);
// res = { a: true, b: true, c: true }
```

## 🔄 Subcommand Handling

The exit feature enables elegant subcommand handling:

```javascript
// Main CLI configuration
const mainReq = {
  help: {
    def: false,
    set: ['-h', '--help']
  },
  // Direct array format for exit options
  command: ['build', 'serve', 'test']
};

const mainRes = {};
const ret = parse(process.argv, 2, mainReq, mainRes, errorHandler);

if (typeof ret === 'object') {
  // When a command is found via the exit mechanism:
  // - ret.i is already positioned after the subcommand
  // - ret.key contains the variable name in req ('command' in this case)
  // - ret.opt contains the matched option (the subcommand name)
  
  switch(ret.opt) {
    case 'build':
      const buildReq = { /* build options */ };
      const buildRes = {};
      parse(process.argv, ret.i, buildReq, buildRes, errorHandler);
      break;
  }
}
```

## 📜 License

MIT 