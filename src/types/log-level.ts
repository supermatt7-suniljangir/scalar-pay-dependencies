/**
 * Enum for log levels to provide named levels for logging.
 *
 * Levels:
 * - DEBUG (4): Logs debug messages and higher levels.
 * - INFO (3): Logs informational messages and higher levels.
 * - WARN (2): Logs warnings and errors.
 * - ERROR (1): Logs only errors.
 * - OFF (0): Disables all logging.
 */
export enum LogLevel {
  DEBUG = 4,
  INFO = 3,
  WARN = 2,
  ERROR = 1,
  OFF = 0, // To completely turn off logging
}
