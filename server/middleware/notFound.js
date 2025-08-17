import { HTTP_STATUS } from '../../shared/constants/constants.js';

const notFound = (req, res, next) => {
  const error = new Error(`Маршрут ${req.originalUrl} не найден`);
  res.status(HTTP_STATUS.NOT_FOUND);
  next(error);
};

export default notFound;