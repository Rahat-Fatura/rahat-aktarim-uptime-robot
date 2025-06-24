const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Lütfen giriş yapın'));
  }
  req.user = user;
  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    console.log(userRights)
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    console.log(hasRequiredRights)
    // eslint-disable-next-line eqeqeq
    if (!hasRequiredRights && req.params.userId != user.id) {
      console.log('Buraya geldiiiii');
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = auth;
