// Wraps async route handlers so rejected promises are forwarded to the
// Express error middleware instead of being repeated in every try/catch.
export const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
