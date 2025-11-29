/**
 * Console Filter Utility
 * Reduces noise from React and browser development tools
 * Allows important app logs to stand out
 */

export const setupConsoleFilters = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  // List of patterns to filter out
  const filterPatterns = [
    // React DevTools
    /Download the React DevTools/i,
    /You might have forgotten/i,
    /Warning: ReactDOM.render/i,
    /You are calling ReactDOM.render/i,
    /\[react-dom\]/i,
    
    // Ant Design
    /deprecated/i,
    /\[antd:/i,
    
    // Browser extensions
    /extension/i,
    /chrome-extension/i,
    
    // Double-render warnings
    /StrictMode/i,
    /double.invoke/i,
    /double-invoke/i,
    
    // API timeouts and errors (unless app-marked)
    /timeout of \d+ms exceeded/i,
    /\[API Response Error\] undefined/i,
    /Error fetching notifications/i,
  ];

  // Enhanced console.log - Show all app logs clearly
  console.log = (...args) => {
    const message = args[0]?.toString?.() || '';
    
    // Allow all our app logs (with emoji prefixes or custom tags)
    if (
      message.includes('[') && message.includes(']') ||
      message.includes('🚀') || message.includes('📋') ||
      message.includes('✅') || message.includes('❌') ||
      message.includes('📁') || message.includes('📄') ||
      message.includes('📝') || message.includes('🌐') ||
      message.includes('🏁') || message.includes('📸') ||
      message.includes('✓') || message.includes('⚠️')
    ) {
      originalLog.apply(console, args);
      return;
    }

    // Check if should be filtered
    const shouldFilter = filterPatterns.some(pattern => 
      pattern.test(message)
    );

    if (!shouldFilter) {
      originalLog.apply(console, args);
    }
  };

  // Enhanced console.error - Show only app errors
  console.error = (...args) => {
    const message = args[0]?.toString?.() || '';

    // Filter out known noisy patterns
    const shouldFilter = filterPatterns.some(pattern => 
      pattern.test(message)
    );

    if (!shouldFilter && message.length > 0) {
      originalError.apply(console, args);
    }
  };

  // Enhanced console.warn - Show only app warnings
  console.warn = (...args) => {
    const message = args[0]?.toString?.() || '';

    // Filter out known noisy patterns
    const shouldFilter = filterPatterns.some(pattern => 
      pattern.test(message)
    );

    if (!shouldFilter && message.length > 0) {
      originalWarn.apply(console, args);
    }
  };

  // Log that filters are active
  originalLog('%c🔇 Console filters enabled - Only app logs shown', 'color: #666; font-size: 12px;');
};

/**
 * Alternative: Disable all console in production
 */
export const disableConsoleInProduction = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.error = () => {};
    console.warn = () => {};
    console.info = () => {};
    console.debug = () => {};
  }
};

/**
 * Create a namespaced logger for cleaner console output
 * Usage: const logger = createLogger('FeatureName');
 *        logger.log('Message');
 *        logger.error('Error message');
 */
export const createLogger = (namespace) => {
  const prefix = `[${namespace}]`;
  const color = 'color: #0066cc; font-weight: bold;';

  return {
    log: (...args) => console.log(`%c${prefix}`, color, ...args),
    error: (...args) => console.error(`%c${prefix} ❌`, `${color}color: #cc0000;`, ...args),
    warn: (...args) => console.warn(`%c${prefix} ⚠️`, `${color}color: #ff9900;`, ...args),
    info: (...args) => console.info(`%c${prefix} ℹ️`, `${color}color: #0099ff;`, ...args),
    success: (...args) => console.log(`%c${prefix} ✅`, `${color}color: #00cc00;`, ...args),
  };
};
