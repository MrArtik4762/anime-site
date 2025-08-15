const jwt = require('jsonwebtoken');

function signJwt(payload, secret, expiresIn) {
  return jwt.sign(payload, secret, { expiresIn });
}

module.exports = { signJwt };