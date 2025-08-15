module.exports = function errorMiddleware(err, _req, res, _next) {
  const code = err.response?.status || 500;
  const payload = {
    ok: false,
    code,
    message: err.response?.data?.message || err.message || 'Internal error',
    details: err.response?.data || undefined,
  };
  if (process.env.NODE_ENV !== 'production') {
    console.error('[API ERROR]', payload);
  }
  res.status(code).json(payload);
};