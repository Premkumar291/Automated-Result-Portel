/**
 * Logger utility for consistent logging across the application
 * Provides structured logging with timestamps, log levels, and context information
 */

// Log levels with corresponding colors for console output
const LOG_LEVELS = {
  ERROR: { level: 0, color: '\x1b[31m' }, // Red
  WARN: { level: 1, color: '\x1b[33m' },  // Yellow
  INFO: { level: 2, color: '\x1b[36m' },   // Cyan
  DEBUG: { level: 3, color: '\x1b[32m' },  // Green
  TRACE: { level: 4, color: '\x1b[37m' }   // White
};

// Reset color code
const RESET_COLOR = '\x1b[0m';

// Current log level (can be set via environment variable)
let currentLogLevel = process.env.LOG_LEVEL ? 
  (LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO).level : 
  LOG_LEVELS.INFO.level;

/**
 * Format the log message with timestamp, level, and context
 * @param {string} level - Log level (ERROR, WARN, INFO, DEBUG, TRACE)
 * @param {string} message - Log message
 * @param {Object} context - Additional context information
 * @returns {string} - Formatted log message
 */
const formatLogMessage = (level, message, context = {}) => {
  const timestamp = new Date().toISOString();
  const contextStr = Object.keys(context).length > 0 ? 
    `| ${JSON.stringify(context)}` : '';
  
  return `[${timestamp}] [${level}] ${message} ${contextStr}`;
};

/**
 * Log a message with the specified level if it's at or below the current log level
 * @param {string} level - Log level (ERROR, WARN, INFO, DEBUG, TRACE)
 * @param {string} message - Log message
 * @param {Object} context - Additional context information
 */
const log = (level, message, context = {}) => {
  const logLevelObj = LOG_LEVELS[level];
  
  if (!logLevelObj) {
    console.error(`Invalid log level: ${level}`);
    return;
  }
  
  if (logLevelObj.level <= currentLogLevel) {
    const formattedMessage = formatLogMessage(level, message, context);
    
    // Use appropriate console method based on level
    if (level === 'ERROR') {
      console.error(`${logLevelObj.color}${formattedMessage}${RESET_COLOR}`);
    } else if (level === 'WARN') {
      console.warn(`${logLevelObj.color}${formattedMessage}${RESET_COLOR}`);
    } else {
      console.log(`${logLevelObj.color}${formattedMessage}${RESET_COLOR}`);
    }
  }
};

/**
 * Set the current log level
 * @param {string} level - Log level (ERROR, WARN, INFO, DEBUG, TRACE)
 */
const setLogLevel = (level) => {
  const logLevelObj = LOG_LEVELS[level.toUpperCase()];
  
  if (!logLevelObj) {
    console.error(`Invalid log level: ${level}`);
    return;
  }
  
  currentLogLevel = logLevelObj.level;
  log('INFO', `Log level set to ${level}`);
};

// Convenience methods for different log levels
const error = (message, context = {}) => log('ERROR', message, context);
const warn = (message, context = {}) => log('WARN', message, context);
const info = (message, context = {}) => log('INFO', message, context);
const debug = (message, context = {}) => log('DEBUG', message, context);
const trace = (message, context = {}) => log('TRACE', message, context);

// Create a logger with a specific context
const createLogger = (defaultContext = {}) => ({
  error: (message, context = {}) => error(message, { ...defaultContext, ...context }),
  warn: (message, context = {}) => warn(message, { ...defaultContext, ...context }),
  info: (message, context = {}) => info(message, { ...defaultContext, ...context }),
  debug: (message, context = {}) => debug(message, { ...defaultContext, ...context }),
  trace: (message, context = {}) => trace(message, { ...defaultContext, ...context })
});

export default {
  log,
  error,
  warn,
  info,
  debug,
  trace,
  setLogLevel,
  createLogger
};