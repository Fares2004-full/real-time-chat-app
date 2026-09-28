// Express 4 does not catch rejected promises from async handlers. Wrapping a
// controller with this forwards any thrown error to the central error handler
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
