/**
 * Simple logger utility
 */

const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  constructor() {
    this.colors = {
      info: '\x1b[36m',    // Cyan
      warn: '\x1b[33m',    // Yellow
      error: '\x1b[31m',   // Red
      debug: '\x1b[35m',   // Magenta
      reset: '\x1b[0m'     // Reset
    };
  }

  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const color = this.colors[level] || this.colors.reset;
    const reset = this.colors.reset;
    
    return `${color}[${timestamp}] ${level.toUpperCase()}:${reset} ${message}`;
  }

  info(message, ...args) {
    console.log(this.formatMessage('info', message), ...args);
  }

  warn(message, ...args) {
    console.warn(this.formatMessage('warn', message), ...args);
  }

  error(message, ...args) {
    console.error(this.formatMessage('error', message), ...args);
  }

  debug(message, ...args) {
    if (isDevelopment) {
      console.log(this.formatMessage('debug', message), ...args);
    }
  }
}

export const logger = new Logger();
