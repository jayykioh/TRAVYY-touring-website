// touring-be/utils/logger.js
// Simple configurable logger wrapper to replace console.* usage across the project.
const util = require('util');

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const DEFAULT_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
let currentLevel = DEFAULT_LEVEL;

function shouldLog(level) {
  return levels[level] <= levels[currentLevel];
}

function formatArgs(args) {
  return args
    .map((a) => (typeof a === 'string' ? a : util.inspect(a, { depth: 3, colors: false })))
    .join(' ');
}

module.exports = {
  setLevel: (lv) => { if (levels[lv] !== undefined) currentLevel = lv; },
  error: (...args) => { if (!shouldLog('error')) return; console.error(new Date().toISOString(), '[ERROR]', formatArgs(args)); },
  warn: (...args) => { if (!shouldLog('warn')) return; console.warn(new Date().toISOString(), '[WARN]', formatArgs(args)); },
  info: (...args) => { if (!shouldLog('info')) return; console.log(new Date().toISOString(), '[INFO]', formatArgs(args)); },
  debug: (...args) => { if (!shouldLog('debug')) return; console.log(new Date().toISOString(), '[DEBUG]', formatArgs(args)); },
  trace: (...args) => { console.log(new Date().toISOString(), '[TRACE]', formatArgs(args)); }
};
