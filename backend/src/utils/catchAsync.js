/**
 * Utility function to catch errors in async route handlers
 * Wraps async functions to automatically catch and forward errors to Express error handler
 * 
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function that catches errors
 */
module.exports = (fn) => {
  return (req, res, next) => {
    // Execute the async function and catch any errors
    // If an error occurs, pass it to Express error handler via next()
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

