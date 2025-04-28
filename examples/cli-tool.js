#!/usr/bin/env node
'use strict';
import parse from '../index.js';

// Main CLI configuration
const mainReq = {
  // Help option
  help: {
    def: false,
    set: ['-h', '--help']
  },
  // Version option
  version: {
    def: false,
    set: ['-v', '--version']
  },
  // Verbose logging
  verbose: {
    def: false,
    set: ['--verbose']
  },
  // Commands exit to subcommand handlers
  command: ['build', 'serve', 'test', 'deploy', 'init']
};

// Build command configuration
const buildReq = {
  help: {
    def: false,
    set: ['-h', '--help']
  },
  watch: {
    def: false,
    set: ['-w', '--watch']
  },
  minify: {
    def: true,
    set: ['--no-minify'],
    rst: ['--minify']
  },
  target: {
    def: 'dist',
    set: ['-t', '--target']
  },
  files: {
    def: [],
    set: ['--']
  }
};

// Serve command configuration
const serveReq = {
  help: {
    def: false,
    set: ['-h', '--help']
  },
  port: {
    def: '8080',
    set: ['-p', '--port']
  },
  host: {
    def: 'localhost',
    set: ['--host']
  },
  open: {
    def: false,
    set: ['-o', '--open']
  }
};

// Error handler
const errorHandler = (err) => {
  console.error(`Error at arg ${err.i}: ${err.msg} (${err.opt})`);
  return false; // Continue parsing
};

// Main function
function main() {
  const res = {};
  const ret = parse(process.argv, 2, mainReq, res, errorHandler);
  
  // Handle help and version flags first
  if (res.help) {
    showMainHelp();
    return;
  }
  
  if (res.version) {
    console.log('myapp v1.0.0');
    return;
  }
  
  // If verbose, show debug info
  if (res.verbose) {
    console.log('Debug mode enabled');
  }
  
  // Handle subcommands - check if ret is an object (exit case)
  if (typeof ret === 'object') {
    // When a command is found via the exit mechanism,
    // ret contains {i, key, opt} where:
    // - ret.i is the index to resume parsing from
    // - ret.key is the variable name in req that triggered the exit (here: 'command')
    // - ret.opt is the value that matched (here: the command name itself)
    
    switch (ret.opt) {
      case 'build':
        handleBuildCommand(ret.i);
        break;
      case 'serve':
        handleServeCommand(ret.i);
        break;
      case 'test':
        console.log('Running tests...');
        break;
      case 'deploy':
        console.log('Deploying application...');
        break;
      case 'init':
        console.log('Initializing new project...');
        break;
    }
  } else {
    showMainHelp();
  }
}

// Handle the build command
function handleBuildCommand(startIndex) {
  console.log('Build arguments:', process.argv.slice(startIndex));
  
  const res = {};
  const parsedResult = parse(process.argv, startIndex, buildReq, res, errorHandler);
  
  console.log('Parse result:', parsedResult);
  console.log('Parsed options:', res);
  
  if (res.help) {
    showBuildHelp();
    return;
  }
  
  console.log(`Building project...`);
  console.log(`Target directory: ${res.target}`);
  console.log(`Minification: ${res.minify ? 'enabled' : 'disabled'}`);
  console.log(`Watch mode: ${res.watch ? 'enabled' : 'disabled'}`);
  
  if (res.files.length > 0) {
    console.log(`Building specific files: ${res.files.join(', ')}`);
  } else {
    console.log('Building all files');
  }
}

// Handle the serve command
function handleServeCommand(startIndex) {
  const res = {};
  parse(process.argv, startIndex, serveReq, res, errorHandler);
  
  if (res.help) {
    showServeHelp();
    return;
  }
  
  console.log(`Starting development server...`);
  console.log(`Server running at http://${res.host}:${res.port}`);
  
  if (res.open) {
    console.log('Opening browser automatically');
  }
}

// Show main help
function showMainHelp() {
  console.log(`
myapp - A demo CLI application

Usage:
  myapp [options] [command]

Options:
  -h, --help     Display this help message
  -v, --version  Display version information
  --verbose      Enable verbose output

Commands:
  build          Build the project
  serve          Start development server
  test           Run tests
  deploy         Deploy the application
  init           Initialize a new project

Run 'myapp [command] --help' for more information on a specific command.
`);
}

// Show build command help
function showBuildHelp() {
  console.log(`
myapp build - Build the project

Usage:
  myapp build [options] [files...]

Options:
  -h, --help       Display this help message
  -w, --watch      Watch for changes and rebuild
  --minify         Enable minification (default: true)
  --no-minify      Disable minification
  -t, --target DIR Set output directory (default: 'dist')
  -- [files...]    Specify files to build (default: all)
`);
}

// Show serve command help
function showServeHelp() {
  console.log(`
myapp serve - Start development server

Usage:
  myapp serve [options]

Options:
  -h, --help       Display this help message
  -p, --port PORT  Specify port (default: 8080)
  --host HOST      Specify host (default: localhost)
  -o, --open       Open browser automatically
`);
}

// Run the application
main(); 