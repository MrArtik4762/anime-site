const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const { HTTP_STATUS } = require('../shared/constants/constants');
const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig[process.env.NODE_ENV || 'development']);

// Import routes
const authRoutes = require('./routes/auth');
const animeRoutes = require('./routes/anime');
const animeApiRoutes = require('./routes/animeRoutes');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const externalRoutes = require('./routes/external');
const watchlistRoutes = require('./routes/watchlist');
const anilibriaRoutes = require('./routes/anilibria');
const videoRoutes = require('./routes/video');
const episodeRoutes = require('./routes/episode');
const proxyRoutes = require('./routes/proxy');
// New AniLiberty API routes
const apiRoutes = require('./routes/api');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import socket handlers
const socketHandler = require('./socket/socketHandler');

// Create Express app
const app = express();
const server = createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      mediaSrc: ["'self'", "https:", "http:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 1000,
  message: {
    error: process.env.NODE_ENV === 'development'
      ? 'Rate limit exceeded for development testing'
      : 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check and some critical routes in development
    if (process.env.NODE_ENV === 'development' && (
      req.path === '/health' ||
      req.path.startsWith('/api/auth') ||
      req.path.startsWith('/api/proxy')
    )) {
      return true;
    }
    return false;
  }
});

app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Favicon handler
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    memory: process.memoryUsage(),
    database: 'unknown'
  };
  
  try {
    // Check database connection
    await knex.raw('SELECT 1');
    health.database = 'connected';
  } catch (error) {
    health.database = 'error';
    health.status = 'degraded';
    health.databaseError = error.message;
  }
  
  // Add Redis status if available
  if (redisConnected !== undefined) {
    health.redis = redisConnected ? 'connected' : 'disconnected';
  }
  
  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

// API routes
// AniLiberty API routes (должны быть первыми)
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/anime', animeRoutes);
app.use('/api/anime', animeApiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/anilibria', anilibriaRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/episode', episodeRoutes);
app.use('/api/proxy', proxyRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  socketHandler(io, socket);
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    // Test database connection
    await knex.raw('SELECT 1');
    console.log(`Database connected successfully`);
    
    // Run migrations if needed
    if (process.env.NODE_ENV === 'development') {
      const migrations = await knex.migrate.list();
      if (migrations.length > 0) {
        console.log('Running pending migrations...');
        await knex.migrate.latest();
        console.log('Migrations completed');
      }
    }
    
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Create database indexes
const createIndexes = async () => {
  try {
    console.log('Skipping index creation to avoid conflicts...');
    console.log('Database indexes will be created automatically by models');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

// Enhanced graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  
  try {
    // Stop accepting new connections
    server.close(async () => {
      console.log('HTTP server closed.');
      
      // Close database connections
      try {
        await knex.destroy();
        console.log('Database connection closed.');
      } catch (dbError) {
        console.error('Error closing database connection:', dbError.message);
      }
      
      // Close Redis connection if available
      if (redis && redisConnected) {
        try {
          await redis.quit();
          console.log('Redis connection closed.');
        } catch (redisError) {
          console.error('Error closing Redis connection:', redisError.message);
        }
      }
      
      process.exit(0);
    });
    
    // Force shutdown after timeout
    setTimeout(() => {
      console.error('Force shutdown after timeout');
      process.exit(1);
    }, 10000); // 10 seconds timeout
    
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  gracefulShutdown('UnhandledRejection');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('UncaughtException');
});

module.exports = { app, server, connectDB };
