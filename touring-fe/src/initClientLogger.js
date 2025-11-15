// Importing this file will patch window.console to the client logger wrapper.
try {
  const logger = require('./utils/logger');
  if (logger && typeof window !== 'undefined') {
    console.log = (...args) => logger.info(...args);
    console.info = (...args) => logger.info(...args);
    console.debug = (...args) => logger.debug(...args);
    console.warn = (...args) => logger.warn(...args);
    console.error = (...args) => logger.error(...args);
  }
} catch (e) {
  // noop
}
