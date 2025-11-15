// Client-side logger wrapper — patches console on import if desired.
const isProd = process.env.NODE_ENV === 'production';

function formatArgs(args) {
  return args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
}

module.exports = {
  debug: (...args) => { if (!isProd) window.console.debug(formatArgs(args)); },
  info: (...args) => { if (!isProd) window.console.info(formatArgs(args)); else window.console.info(formatArgs(args)); },
  warn: (...args) => { window.console.warn(formatArgs(args)); },
  error: (...args) => { window.console.error(formatArgs(args)); },
};
