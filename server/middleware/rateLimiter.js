import rateLimit from 'express-rate-limit';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../shared/constants/constants.js';

/**
 * Временная правка: убран onLimitReached для тишины логов до обновления express-rate-limit v7.
 */
/**
 * Временная правка: убран onLimitReached для тишины логов до обновления express-rate-limit v7.
 */
/**
 * Временная правка: убираем устаревший onLimitReached, чтобы не засорять логи предупреждениями
 * (опция будет удалена в express-rate-limit v7)
 */
/**
 * Middleware РґР»СЏ РѕРіСЂР°РЅРёС‡РµРЅРёСЏ РєРѕР»РёС‡РµСЃС‚РІР° Р·Р°РїСЂРѕСЃРѕРІ
 * РџСЂРµРґРѕС‚РІСЂР°С‰Р°РµС‚ Р·Р»РѕСѓРїРѕС‚СЂРµР±Р»РµРЅРёСЏ API Рё Р·Р°С‰РёС‰Р°РµС‚ РѕС‚ DDoS Р°С‚Р°Рє
 */

/**
 * Р›РёРјРёС‚РµСЂ РґР»СЏ РІРёРґРµРѕ Р·Р°РїСЂРѕСЃРѕРІ
 * Р‘РѕР»РµРµ СЃС‚СЂРѕРіРёРµ РѕРіСЂР°РЅРёС‡РµРЅРёСЏ РґР»СЏ СЂРµСЃСѓСЂСЃРѕРµРјРєРёС… РѕРїРµСЂР°С†РёР№
 */
const videoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 РјРёРЅСѓС‚
  max: 100, // РјР°РєСЃРёРјСѓРј 100 Р·Р°РїСЂРѕСЃРѕРІ Р·Р° РѕРєРЅРѕ
  message: {
    success: false,
    error: {
      message: 'РЎР»РёС€РєРѕРј РјРЅРѕРіРѕ Р·Р°РїСЂРѕСЃРѕРІ РЅР° РІРёРґРµРѕ. РџРѕРїСЂРѕР±СѓР№С‚Рµ РїРѕР·Р¶Рµ.',
      code: 'VIDEO_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true, // Р’РѕР·РІСЂР°С‰Р°РµС‚ РёРЅС„РѕСЂРјР°С†РёСЋ Рѕ Р»РёРјРёС‚Рµ РІ Р·Р°РіРѕР»РѕРІРєР°С… `RateLimit-*`
  legacyHeaders: false, // РћС‚РєР»СЋС‡Р°РµС‚ Р·Р°РіРѕР»РѕРІРєРё `X-RateLimit-*`
  keyGenerator: (req) => {
    // РСЃРїРѕР»СЊР·СѓРµРј IP Р°РґСЂРµСЃ Рё user ID (РµСЃР»Рё Р°РІС‚РѕСЂРёР·РѕРІР°РЅ) РґР»СЏ Р±РѕР»РµРµ С‚РѕС‡РЅРѕРіРѕ Р»РёРјРёС‚РёСЂРѕРІР°РЅРёСЏ
    return req.user?.id ? `${req.ip}:${req.user.id}` : req.ip;
  },
  skip: (req) => {
    // РџСЂРѕРїСѓСЃРєР°РµРј Р»РёРјРёС‚РёСЂРѕРІР°РЅРёРµ РґР»СЏ Р°РґРјРёРЅРѕРІ
    return req.user?.role === 'admin';
  },
  // onLimitReached callback removed (deprecated)
});

/**
 * РћР±С‰РёР№ Р»РёРјРёС‚РµСЂ РґР»СЏ API Р·Р°РїСЂРѕСЃРѕРІ
 * Р‘Р°Р·РѕРІС‹Рµ РѕРіСЂР°РЅРёС‡РµРЅРёСЏ РґР»СЏ РІСЃРµС… СЌРЅРґРїРѕРёРЅС‚РѕРІ
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 РјРёРЅСѓС‚
  max: 1000, // РјР°РєСЃРёРјСѓРј 1000 Р·Р°РїСЂРѕСЃРѕРІ Р·Р° РѕРєРЅРѕ
  message: {
    success: false,
    error: {
      message: 'РЎР»РёС€РєРѕРј РјРЅРѕРіРѕ Р·Р°РїСЂРѕСЃРѕРІ. РџРѕРїСЂРѕР±СѓР№С‚Рµ РїРѕР·Р¶Рµ.',
      code: 'GENERAL_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id ? `${req.ip}:${req.user.id}` : req.ip;
  },
  skip: (req) => {
    return req.user?.role === 'admin';
  }
});

/**
 * РЎС‚СЂРѕРіРёР№ Р»РёРјРёС‚РµСЂ РґР»СЏ Р°СѓС‚РµРЅС‚РёС„РёРєР°С†РёРё
 * Р—Р°С‰РёС‚Р° РѕС‚ Р±СЂСѓС‚С„РѕСЂСЃ Р°С‚Р°Рє РЅР° Р»РѕРіРёРЅ/СЂРµРіРёСЃС‚СЂР°С†РёСЋ
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 РјРёРЅСѓС‚
  max: 5, // РјР°РєСЃРёРјСѓРј 5 РїРѕРїС‹С‚РѕРє Р·Р° РѕРєРЅРѕ
  message: {
    success: false,
    error: {
      message: 'РЎР»РёС€РєРѕРј РјРЅРѕРіРѕ РїРѕРїС‹С‚РѕРє РІС…РѕРґР°. РџРѕРїСЂРѕР±СѓР№С‚Рµ РїРѕР·Р¶Рµ.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // РќРµ СЃС‡РёС‚Р°РµРј СѓСЃРїРµС€РЅС‹Рµ Р·Р°РїСЂРѕСЃС‹
});

/**
 * Р›РёРјРёС‚РµСЂ РґР»СЏ РїРѕРёСЃРєР°
 * РџСЂРµРґРѕС‚РІСЂР°С‰Р°РµС‚ Р·Р»РѕСѓРїРѕС‚СЂРµР±Р»РµРЅРёСЏ РїРѕРёСЃРєРѕРІС‹РјРё Р·Р°РїСЂРѕСЃР°РјРё
 */
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 РјРёРЅСѓС‚Р°
  max: 30, // РјР°РєСЃРёРјСѓРј 30 РїРѕРёСЃРєРѕРІС‹С… Р·Р°РїСЂРѕСЃРѕРІ РІ РјРёРЅСѓС‚Сѓ
  message: {
    success: false,
    error: {
      message: 'РЎР»РёС€РєРѕРј РјРЅРѕРіРѕ РїРѕРёСЃРєРѕРІС‹С… Р·Р°РїСЂРѕСЃРѕРІ. РџРѕРїСЂРѕР±СѓР№С‚Рµ РїРѕР·Р¶Рµ.',
      code: 'SEARCH_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id ? `${req.ip}:${req.user.id}` : req.ip;
  },
  skip: (req) => {
    return req.user?.role === 'admin';
  }
});

/**
 * Р›РёРјРёС‚РµСЂ РґР»СЏ API РІРЅРµС€РЅРёС… СЃРµСЂРІРёСЃРѕРІ
 * РћРіСЂР°РЅРёС‡РµРЅРёСЏ РґР»СЏ Р·Р°РїСЂРѕСЃРѕРІ Рє AniLiberty, AniLibria Рё РґСЂСѓРіРёРј РІРЅРµС€РЅРёРј API
 */
const externalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 РјРёРЅСѓС‚Р°
  max: 60, // РјР°РєСЃРёРјСѓРј 60 Р·Р°РїСЂРѕСЃРѕРІ РІ РјРёРЅСѓС‚Сѓ
  message: {
    success: false,
    error: {
      message: 'РЎР»РёС€РєРѕРј РјРЅРѕРіРѕ Р·Р°РїСЂРѕСЃРѕРІ Рє РІРЅРµС€РЅРёРј API. РџРѕРїСЂРѕР±СѓР№С‚Рµ РїРѕР·Р¶Рµ.',
      code: 'EXTERNAL_API_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id ? `${req.ip}:${req.user.id}` : req.ip;
  },
  skip: (req) => {
    return req.user?.role === 'admin';
  }
});

/**
 * Р›РёРјРёС‚РµСЂ РґР»СЏ Р·Р°РіСЂСѓР·РєРё С„Р°Р№Р»РѕРІ
 * РЎС‚СЂРѕРіРёРµ РѕРіСЂР°РЅРёС‡РµРЅРёСЏ РґР»СЏ РѕРїРµСЂР°С†РёР№ Р·Р°РіСЂСѓР·РєРё
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 С‡Р°СЃ
  max: 10, // РјР°РєСЃРёРјСѓРј 10 Р·Р°РіСЂСѓР·РѕРє РІ С‡Р°СЃ
  message: {
    success: false,
    error: {
      message: 'РЎР»РёС€РєРѕРј РјРЅРѕРіРѕ Р·Р°РіСЂСѓР·РѕРє С„Р°Р№Р»РѕРІ. РџРѕРїСЂРѕР±СѓР№С‚Рµ РїРѕР·Р¶Рµ.',
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id ? `${req.ip}:${req.user.id}` : req.ip;
  },
  skip: (req) => {
    return req.user?.role === 'admin' || req.user?.role === 'moderator';
  }
});

/**
 * РЎРѕР·РґР°РЅРёРµ РєР°СЃС‚РѕРјРЅРѕРіРѕ Р»РёРјРёС‚РµСЂР° СЃ Р·Р°РґР°РЅРЅС‹РјРё РїР°СЂР°РјРµС‚СЂР°РјРё
 * @param {Object} options - РїР°СЂР°РјРµС‚СЂС‹ Р»РёРјРёС‚РµСЂР°
 * @param {number} options.windowMs - РѕРєРЅРѕ РІСЂРµРјРµРЅРё РІ РјРёР»Р»РёСЃРµРєСѓРЅРґР°С…
 * @param {number} options.max - РјР°РєСЃРёРјР°Р»СЊРЅРѕРµ РєРѕР»РёС‡РµСЃС‚РІРѕ Р·Р°РїСЂРѕСЃРѕРІ
 * @param {string} options.message - СЃРѕРѕР±С‰РµРЅРёРµ РѕР± РѕС€РёР±РєРµ
 * @param {string} options.code - РєРѕРґ РѕС€РёР±РєРё
 * @returns {Function} middleware С„СѓРЅРєС†РёСЏ
 */
const createCustomLimiter = (options) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'РЎР»РёС€РєРѕРј РјРЅРѕРіРѕ Р·Р°РїСЂРѕСЃРѕРІ',
    code = 'RATE_LIMIT_EXCEEDED'
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        message,
        code
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.user?.id ? `${req.ip}:${req.user.id}` : req.ip;
    },
    skip: (req) => {
      return req.user?.role === 'admin';
    }
  });
};

/**
 * Middleware РґР»СЏ Р»РѕРіРёСЂРѕРІР°РЅРёСЏ РїСЂРµРІС‹С€РµРЅРёР№ Р»РёРјРёС‚РѕРІ
 * @param {Object} req - РѕР±СЉРµРєС‚ Р·Р°РїСЂРѕСЃР° Express
 * @param {Object} res - РѕР±СЉРµРєС‚ РѕС‚РІРµС‚Р° Express
 * @param {Function} next - СЃР»РµРґСѓСЋС‰РёР№ middleware
 */
const rateLimitLogger = (req, res, next) => {
  const originalSend = res.send;

  res.send = function(data) {
    if (res.statusCode === HTTP_STATUS.TOO_MANY_REQUESTS) {
      console.warn('Rate limit exceeded:', {
        ip: req.ip,
        userId: req.user?.id,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

export {
  videoLimiter,
  generalLimiter,
  authLimiter,
  searchLimiter,
  externalApiLimiter,
  uploadLimiter,
  createCustomLimiter,
  rateLimitLogger
};

