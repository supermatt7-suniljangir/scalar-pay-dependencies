import { config } from "../config/config";
import { LogLevel } from "../types/log-level";

/**
 * Logger class to manage logging with different levels.
 * Supports multiple parameters for each logging method and includes class name in logs.
 */
export class Logger {
  private level: LogLevel;
  private className: string;

  /**
   * Constructor initializes logger with a specific level and class name.
   * @param {LogLevel} level - The logging level (DEBUG, INFO, WARN, ERROR, OFF)
   * @param {string} className - The name of the class using this logger
   */
  constructor(level: LogLevel = LogLevel.INFO, className: string) {
    this.level = level;
    this.className = className;
  }

  /**
   * Format the log message with class name and timestamp
   * @param {string} level - The log level as a string
   * @param {any[]} args - The arguments to be logged
   * @returns {any[]} - Formatted array of arguments
   */
  private formatLogMessage(level: string, args: any[]): any[] {
    const timestamp = new Date().toISOString();
    return [`[${timestamp}] [${level}] [${this.className}]:`, ...args];
  }

  /**
   * Log debug messages with any number of parameters
   * @param {...any[]} args - Multiple arguments to be logged
   */
  debug(...args: any[]) {
    if (this.level >= LogLevel.DEBUG) {
      console.log(...this.formatLogMessage("DEBUG", args));
    }
  }

  /**
   * Log info messages with any number of parameters
   * @param {...any[]} args - Multiple arguments to be logged
   */
  info(...args: any[]) {
    if (this.level >= LogLevel.INFO) {
      console.log(...this.formatLogMessage("INFO", args));
    }
  }

  /**
   * Log warning messages with any number of parameters
   * @param {...any[]} args - Multiple arguments to be logged
   */
  warn(...args: any[]) {
    if (this.level >= LogLevel.WARN) {
      console.warn(...this.formatLogMessage("WARN", args));
    }
  }

  /**
   * Log error messages with any number of parameters
   * Always logs errors regardless of the current log level
   * @param {...any[]} args - Multiple arguments to be logged (e.g., error objects, context)
   */
  error(...args: any[]) {
    if (this.level >= LogLevel.ERROR) {
      console.error(...this.formatLogMessage("ERROR", args));
    }
  }
}

/**
 * Creates a new logger instance with the appropriate log level based on the stage.
 * @param {string} className - The name of the class using this logger
 * @returns {Logger} - A new Logger instance configured for the specified class.
 */
export const createLogger = (className: string): Logger => {
  return new Logger(config.LOG_LEVEL, className);
};
