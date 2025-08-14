const { HTTP_STATUS, ERROR_MESSAGES } = require('../../shared/constants/constants');

// In-memory store for failed login attempts (in production, use Redis)
const failedAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Middleware для блокировки аккаунта после неудачных попыток входа
 */
const accountLockout = (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next();
  }

  const attempts = failedAttempts.get(email) || [];
  const now = Date.now();
  
  // Remove old attempts (older than lockout duration)
  const recentAttempts = attempts.filter(time => now - time < LOCKOUT_DURATION);
  
  // Check if account is locked
  if (recentAttempts.length >= MAX_ATTEMPTS) {
    const lockoutTime = recentAttempts[0] + LOCKOUT_DURATION;
    const remainingTime = Math.ceil((lockoutTime - now) / 1000 / 60);
    
    return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: {
        message: `Аккаунт временно заблокирован. Попробуйте снова через ${remainingTime} минут.`,
        code: 'ACCOUNT_LOCKED',
        lockoutTime: lockoutTime
      }
    });
  }
  
  // Add this attempt
  recentAttempts.push(now);
  failedAttempts.set(email, recentAttempts);
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance on each request
    cleanupOldAttempts();
  }
  
  next();
};

/**
 * Middleware для сброса счетчика при успешном входе
 */
const resetAttempts = (req, res, next) => {
  const { email } = req.body;
  
  if (email && failedAttempts.has(email)) {
    failedAttempts.delete(email);
  }
  
  next();
};

/**
 * Очистка старых записей о неудачных попытках
 */
function cleanupOldAttempts() {
  const now = Date.now();
  
  for (const [email, attempts] of failedAttempts.entries()) {
    const recentAttempts = attempts.filter(time => now - time < LOCKOUT_DURATION);
    
    if (recentAttempts.length === 0) {
      failedAttempts.delete(email);
    } else {
      failedAttempts.set(email, recentAttempts);
    }
  }
}

/**
 * Получение информации о блокировке для аккаунта
 */
const getLockoutInfo = (email) => {
  const attempts = failedAttempts.get(email) || [];
  const now = Date.now();
  
  const recentAttempts = attempts.filter(time => now - time < LOCKOUT_DURATION);
  
  if (recentAttempts.length >= MAX_ATTEMPTS) {
    const lockoutTime = recentAttempts[0] + LOCKOUT_DURATION;
    const remainingTime = Math.ceil((lockoutTime - now) / 1000 / 60);
    
    return {
      isLocked: true,
      remainingTime,
      lockoutTime,
      attempts: recentAttempts.length
    };
  }
  
  return {
    isLocked: false,
    attempts: recentAttempts.length,
    maxAttempts: MAX_ATTEMPTS,
    nextLockoutThreshold: MAX_ATTEMPTS - recentAttempts.length
  };
};

module.exports = {
  accountLockout,
  resetAttempts,
  getLockoutInfo,
  MAX_ATTEMPTS,
  LOCKOUT_DURATION
};