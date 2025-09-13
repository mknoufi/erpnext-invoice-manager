// src/utils/logger.ts
const LEVEL = process.env.REACT_APP_LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug');

export const logger = {
  debug: (...args: any[]) => { if (LEVEL === 'debug') console.debug(...args); },
  info:  (...args: any[]) => { if (['debug','info'].includes(LEVEL)) console.info(...args); },
  warn:  (...args: any[]) => console.warn(...args),
  error: (...args: any[]) => console.error(...args)
};
export default logger;
