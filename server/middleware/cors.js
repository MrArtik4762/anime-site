const cors = require('cors');

/**
 * Настройка CORS для продакшена
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Разрешенные домены из переменной окружения или по умолчанию
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [
          'http://localhost:3000',
          'http://localhost:8080',
          'https://anime-site.com',
          'https://www.anime-site.com',
          'https://api.anime-site.com'
        ];
    
    // В разработке разрешаем все
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Проверяем, что origin в списке разрешенных
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      return callback(new Error(`Недопустимый источник CORS: ${origin}`), false);
    }
  },
  credentials: true, // Разрешаем передачу credentials
  optionsSuccessStatus: 200, // Для legacy браузеров
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-CSRF-Token', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400 // 24 часа
};

/**
 * Middleware для предварительной проверки CORS
 */
const preflight = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', corsOptions.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

/**
 * Основной CORS middleware
 */
const corsMiddleware = cors(corsOptions);

module.exports = {
  corsOptions,
  preflight,
  corsMiddleware
};