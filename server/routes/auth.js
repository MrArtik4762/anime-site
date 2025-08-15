const express = require('express');
const axios = require('axios');
const router = express.Router();
const cookie = require('cookie');

const V1 = process.env.ANILIBRIA_V1_BASE || 'https://anilibria.top/api/v1';
const COOKIE_NAME = 'al_session';
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
};

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, username } = req.body || {};
    const { data } = await axios.post(`${V1}/accounts/users/registration`, { email, password, username }, { timeout: 15000 });
    return res.status(200).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { login, password } = req.body || {};
    const { data } = await axios.post(`${V1}/accounts/users/login`, { login, password }, { timeout: 15000 });
    const token = data?.token || data?.access_token || data?.session;
    if (!token) return res.status(401).json({ ok: false, message: 'No token from upstream' });
    res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, token, COOKIE_OPTS));
    res.json({ ok: true, user: data?.user || null });
  } catch (e) {
    next(e);
  }
});

router.post('/logout', async (_req, res) => {
  res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, '', { ...COOKIE_OPTS, maxAge: 0 }));
  res.json({ ok: true });
});

router.get('/me', async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ ok: false });
    const { data } = await axios.get(`${V1}/accounts/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000,
    });
    res.json({ ok: true, user: data });
  } catch (e) { next(e); }
});

module.exports = router;