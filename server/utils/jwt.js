import jwt from 'jsonwebtoken';

function signJwt(payload, secret, expiresIn) {
  return jwt.sign(payload, secret, { expiresIn });
}

export { signJwt };