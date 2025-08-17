import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';
// HTTP статус коды
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};
import knexConfig from './knexfile.js';
import knex from 'knex';

const db = knex(knexConfig[process.env.NODE_ENV || 'development']);

// Import routes
import authRoutes from './routes/auth.js';
import animeRoutes from './routes/anime.js';
import animeApiRoutes from './routes/animeRoutes.js';
import userRoutes from './routes/users.js';
import commentRoutes from './routes/comments.js';
import externalRoutes from './routes/external.js';
import watchlistRoutes from './routes/watchlist.js';
import anilibriaRoutes from './routes/anilibria.js';
import videoRoutes from './routes/video.js';
import episodeRoutes from './routes/episode.js';
import proxyRoutes from './routes/proxy.js';
import searchRoutes from './routes/search.js';
import streamRoutes from './routes/stream.js';
import watchRoutes from './routes/watchRoutes.js';
import sourcesRoutes from './routes/sources.js';
// New AniLiberty API routes
import apiRoutes from './routes/api.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import notFound from './middleware/notFound.js';

// Import monitoring and logging
import { logger, httpLogger, logRequest } from './config/logger.js';
import { metricsMiddleware } from './utils/metrics.js';
import healthRoutes from './routes/health.js';
import metricsRoutes from './routes/metrics.js';

// Import socket handlers
import socketHandler from './socket/socketHandler.js';

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

// Metrics middleware (must be before routes)
app.use(metricsMiddleware);

// Static files
app.use('/uploads', express.static('uploads'));

// Favicon handler
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Health check routes
app.use('/health', healthRoutes);
app.use('/metrics', metricsRoutes);

// Enhanced health check endpoint (keeping for backward compatibility)
app.get('/health/simple', async (req, res) => {
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
    await db.raw('SELECT 1');
    health.database = 'connected';
  } catch (error) {
    health.database = 'error';
    health.status = 'degraded';
    health.databaseError = error.message;
  }
  
  // Redis status not implemented in this version
  
  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

// API routes
// AniLiberty API routes (должны быть первыми)
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/anime', animeRoutes);
app.use('/api/anime', animeApiRoutes);
app.use('/api/anime', searchRoutes); // Маршруты поиска
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/anilibria', anilibriaRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/episode', episodeRoutes);
app.use('/api/stream', streamRoutes); // Маршруты стриминга
app.use('/api/proxy', proxyRoutes);
app.use('/api/sources', sourcesRoutes); // Маршруты источников эпизодов

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  socketHandler(io, socket);
});

// Error handling middleware (must be last)
app.use(notFound);
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous'
  });
  
  errorHandler(err, req, res, next);
});

// Database connection
const connectDB = async () => {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    console.log(`Database connected successfully`);
    
    // Run migrations if needed
    if (process.env.NODE_ENV === 'development') {
      const migrations = await db.migrate.list();
      if (migrations.length > 0) {
        console.log('Running pending migrations...');
        await db.migrate.latest();
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
        await db.destroy();
        console.log('Database connection closed.');
      } catch (dbError) {
        console.error('Error closing database connection:', dbError.message);
      }
      
      // Redis connection not implemented in this version
      
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

export { app, server, connectDB };
