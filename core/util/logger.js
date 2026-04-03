const chalk = require('chalk');
const _ = require('lodash');
const util = require('util');
const makeSpaces = require('./makeSpaces');

// Save references to original console methods to avoid infinite loops when overriding
const _originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error
};

function identity (string) { return string; }

const typeToColor = {
  error: identity,
  warn: identity,
  log: identity,
  info: identity,
  debug: identity,
  success: identity
};

const typeToTitleColor = {
  error: chalk.red,
  warn: chalk.yellow,
  log: chalk.white,
  info: chalk.grey,
  debug: chalk.blue,
  success: chalk.green
};

let longestTitle = 5;

function paddedString (length, string) {
  const padding = makeSpaces(length + 3);

  if (string instanceof Error) {
    string = string.stack;
  }

  if (typeof string !== 'string') {
    string = util.inspect(string, { depth: null, colors: false });
  }

  const lines = string.split('\n');
  const paddedLines = lines
    .slice(1)
    .map(function addPadding (string) {
      return padding + string;
    });
  paddedLines.unshift(lines[0]);

  return paddedLines.join('\n');
}

function message (type, subject, ...args) {
  const verbosity = parseInt(process.env.BACKSTOP_VERBOSITY || 0);

  // Filter based on verbosity
  // 0: error, warn, success (only if subject is COMMAND)
  // 1: + log, success (any)
  // 2: + info
  // 3: + debug
  if (verbosity === 0) {
    if (type === 'log' || type === 'info' || type === 'debug') {
      return;
    }
    if (type === 'success' && subject !== 'COMMAND') {
      return;
    }
  }

  if (verbosity === 1 && (type === 'info' || type === 'debug')) {
    return;
  }

  if (verbosity === 2 && type === 'debug') {
    return;
  }

  if (!_.has(typeToColor, type)) {
    type = 'info';
    _originalConsole.log(typeToColor.warn('Type ' + type + ' is not defined as logging type'));
  }

  const string = args.map(arg => {
    if (typeof arg === 'string') {
      return arg;
    }
    return util.inspect(arg, { depth: null, colors: true });
  }).join(' ');

  let currentSubject = subject;
  if (currentSubject.length < longestTitle) {
    const appendChar = ' ';
    while (currentSubject.length < longestTitle) {
      currentSubject = appendChar + currentSubject;
    }
  } else {
    longestTitle = currentSubject.length;
  }

  // Use the original console.log to print to avoid recursion
  _originalConsole.log(typeToTitleColor[type](currentSubject + ' ') + '| ' + paddedString(longestTitle, typeToColor[type](string)));
}

const loggerUtility = function (subject) {
  return {
    error: message.bind(null, 'error', subject),
    warn: message.bind(null, 'warn', subject),
    log: message.bind(null, 'log', subject),
    info: message.bind(null, 'info', subject),
    debug: message.bind(null, 'debug', subject),
    success: message.bind(null, 'success', subject)
  };
};

/**
 * Globally overrides console.log, console.info, console.warn, and console.error
 * to use the BackstopJS logger with the 'USER' subject.
 */
loggerUtility.globalize = function () {
  const userLogger = loggerUtility('USER');
  console.log = userLogger.log;
  console.info = userLogger.info;
  console.warn = userLogger.warn;
  console.error = userLogger.error;
};

module.exports = loggerUtility;
