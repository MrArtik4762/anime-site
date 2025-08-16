module.exports = function errorMiddleware(err, _req, res, _next) {
  const code = err.response?.status || err.status || 500;
  
  // Определяем пользовательское сообщение об ошибке для клиента
  let clientMessage = 'Произошла внутренняя ошибка сервера';
  
  // Обработка специфических типов ошибок
  if (err.response?.data?.error) {
    // Ошибка от внешнего API (например, Anilibria)
    if (err.response.data.error.includes('внешний API временно недоступен')) {
      clientMessage = 'Внешний сервис временно недоступен. Пожалуйста, попробуйте позже.';
    } else if (err.response.data.error.includes('Request failed with status code 500')) {
      clientMessage = 'Сервис аниме временно недоступен. Показываются placeholder данные.';
    } else {
      clientMessage = err.response.data.error;
    }
  } else if (err.message?.includes('Маршрут') && err.message?.includes('не найден')) {
    // Ошибка маршрута не найден
    clientMessage = 'Запрашиваемый ресурс не найден';
  } else if (err.code === 'ECONNABORTED') {
    // Ошибка таймаута
    clientMessage = 'Запрос занял слишком много времени. Пожалуйста, попробуйте снова.';
  } else if (!err.response && err.code !== 'ECONNREFUSED') {
    // Ошибка сети, но не отказ в подключении
    clientMessage = 'Ошибка сети. Проверьте подключение к интернету.';
  }
  
  const payload = {
    ok: false,
    code,
    message: clientMessage,
    details: process.env.NODE_ENV === 'development' ? {
      originalError: err.message,
      stack: err.stack,
      response: err.response?.data
    } : undefined,
    timestamp: new Date().toISOString()
  };
  
  // Улучшенное логирование
  if (process.env.NODE_ENV !== 'production') {
    console.error('[API ERROR]', {
      error: err.message,
      code,
      clientMessage,
      stack: err.stack,
      response: err.response?.data,
      timestamp: payload.timestamp
    });
  } else {
    // В продакшене логируем только важную информацию
    console.error('[API ERROR]', {
      code,
      clientMessage,
      timestamp: payload.timestamp
    });
  }
  
  res.status(code).json(payload);
};