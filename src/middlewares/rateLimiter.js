const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

const heartBeatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
});

module.exports = {
  authLimiter,
  heartBeatLimiter
};
