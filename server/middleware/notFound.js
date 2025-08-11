const { HTTP_STATUS } = require('/app/shared/constants/constants');

const notFound = (req, res, next) => {
  const error = new Error(`Маршрут ${req.originalUrl} не найден`);
  res.status(HTTP_STATUS.NOT_FOUND);
  next(error);
};

module.exports = notFound;