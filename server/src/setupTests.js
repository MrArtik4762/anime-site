// Mock для process.env
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

// Mock для консольных методов в тестах
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock для модулей, которые не должны загружаться в тестах
jest.mock('express-rate-limit', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
}));

jest.mock('helmet', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
}));

jest.mock('cors', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
}));

jest.mock('compression', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
}));

jest.mock('morgan', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
}));

// Mock для Redis
jest.mock('ioredis', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    on: jest.fn(),
    quit: jest.fn(),
  })),
}));

// Mock для Socket.IO
jest.mock('socket.io', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
  })),
}));

// Mock для базы данных
jest.mock('../db/knex', () => ({
  __esModule: true,
  default: {
    migrate: {
      latest: jest.fn(),
      rollback: jest.fn(),
    },
    seed: {
      run: jest.fn(),
    },
    transaction: jest.fn((fn) => fn({})),
    raw: jest.fn(),
    destroy: jest.fn(),
  },
}));

// Mock для моделей
jest.mock('../models/UserKnex', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findById: jest.fn(),
    findByUsername: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    usernameExists: jest.fn(),
    emailExists: jest.fn(),
    checkPassword: jest.fn(),
    hashPassword: jest.fn(),
    findAll: jest.fn(),
  },
}));

jest.mock('../models/WatchProgressKnex', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findById: jest.fn(),
    getUserAnimeProgress: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getUserProgressStats: jest.fn(),
    getUserEpisodeProgress: jest.fn(),
  },
}));

jest.mock('../models/WatchListKnex', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findById: jest.fn(),
    getUserWatchlist: jest.fn(),
    animeInWatchlist: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteByUserAndAnime: jest.fn(),
    getUserWatchlistStats: jest.fn(),
  },
}));

// Mock для middleware
jest.mock('../middleware/auth', () => ({
  __esModule: true,
  default: jest.fn((req, res, next) => {
    req.user = { id: 1, username: 'testuser', role: 'user' };
    next();
  }),
}));

jest.mock('../middleware/validation', () => ({
  __esModule: true,
  default: {
    validate: jest.fn((schema) => (req, res, next) => next()),
  },
}));

jest.mock('../middleware/errorHandler', () => ({
  __esModule: true,
  default: jest.fn((err, req, res, next) => {
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
      errors: err.errors || [],
    });
  }),
}));

// Mock для контроллеров
jest.mock('../controllers/authController', () => ({
  __esModule: true,
  default: {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    uploadAvatar: jest.fn(),
    deleteAvatar: jest.fn(),
  },
}));

jest.mock('../controllers/userController', () => ({
  __esModule: true,
  default: {
    getUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    getUserWatchlist: jest.fn(),
    addToWatchlist: jest.fn(),
    updateWatchlist: jest.fn(),
    removeFromWatchlist: jest.fn(),
    getUserStats: jest.fn(),
  },
}));

jest.mock('../controllers/animeController', () => ({
  __esModule: true,
  default: {
    getAnime: jest.fn(),
    getAnimeById: jest.fn(),
    createAnime: jest.fn(),
    updateAnime: jest.fn(),
    deleteAnime: jest.fn(),
    getAnimeEpisodes: jest.fn(),
    searchAnime: jest.fn(),
    getGenres: jest.fn(),
    getStats: jest.fn(),
  },
}));

jest.mock('../controllers/watchListController', () => ({
  __esModule: true,
  default: {
    getWatchlist: jest.fn(),
    addToWatchlist: jest.fn(),
    updateWatchlist: jest.fn(),
    removeFromWatchlist: jest.fn(),
    getStats: jest.fn(),
    exportWatchlist: jest.fn(),
    importWatchlist: jest.fn(),
    getSharedWatchlist: jest.fn(),
    getSuggestions: jest.fn(),
  },
}));

// Mock для роутов
jest.mock('../routes/auth', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../routes/users', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../routes/anime', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../routes/watchlist', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock для utility функций
jest.mock('../utils/helpers', () => ({
  __esModule: true,
  default: {
    generateToken: jest.fn(),
    verifyToken: jest.fn(),
    hashPassword: jest.fn(),
    comparePassword: jest.fn(),
    sanitizeInput: jest.fn(),
    validateEmail: jest.fn(),
    validatePassword: jest.fn(),
    formatResponse: jest.fn(),
    errorHandler: jest.fn(),
  },
}));

// Mock для внешних API
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Установка глобальных переменных тестирования
global.describe = describe;
global.it = it;
global.test = test;
global.expect = expect;
global.jest = jest;

// Установка таймаута для тестов
jest.setTimeout(30000);

// Очистка моков после каждого теста
afterEach(() => {
  jest.clearAllMocks();
});