const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const User = require('../utils/database').user;

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Geçersiz token tipi');
    }
    const user = await User.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    console.log(error)
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
