const jwt = require('jsonwebtoken');
const User = require('../models/UserKnex');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../shared/constants/constants');
// Middleware РґР»СЏ РїСЂРѕРІРµСЂРєРё JWT С‚РѕРєРµРЅР°
const authenticate = async (req, res, next) => {
  try {
    let token;

    // РџРѕР»СѓС‡Р°РµРј С‚РѕРєРµРЅ РёР· Р·Р°РіРѕР»РѕРІРєР° Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // РџСЂРѕРІРµСЂСЏРµРј РЅР°Р»РёС‡РёРµ С‚РѕРєРµРЅР°
    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.INVALID_TOKEN
        }
      });
    }

    try {
      // Р’РµСЂРёС„РёС†РёСЂСѓРµРј С‚РѕРєРµРЅ
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // РџРѕР»СѓС‡Р°РµРј РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РёР· Р±Р°Р·С‹ РґР°РЅРЅС‹С…
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            message: ERROR_MESSAGES.USER_NOT_FOUND,
            code: 'USER_NOT_FOUND'
          }
        });
      }

      // РџСЂРѕРІРµСЂСЏРµРј Р°РєС‚РёРІРЅРѕСЃС‚СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
      if (!user.isUserActive()) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: {
            message: 'РђРєРєР°СѓРЅС‚ Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅ РёР»Рё РЅРµР°РєС‚РёРІРµРЅ',
            code: 'ACCOUNT_INACTIVE'
          }
        });
      }

      // Р”РѕР±Р°РІР»СЏРµРј РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РІ РѕР±СЉРµРєС‚ Р·Р°РїСЂРѕСЃР°
      req.user = user;
      next();

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'Срок действия токена истек',
            code: 'TOKEN_EXPIRED'
          }
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'Недействительный токен',
            code: 'INVALID_TOKEN'
          }
        });
      } else if (error.name === 'NotBeforeError') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'Токен еще не активен',
            code: 'TOKEN_NOT_ACTIVE'
          }
        });
      } else {
        console.error('Token verification error:', error);
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'Ошибка проверки токена',
            code: 'TOKEN_VERIFICATION_ERROR'
          }
        });
      }
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.SERVER_ERROR
      }
    });
  }
};

// Middleware РґР»СЏ РїСЂРѕРІРµСЂРєРё СЂРѕР»РµР№ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.ACCESS_DENIED
        }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          message: 'РќРµРґРѕСЃС‚Р°С‚РѕС‡РЅРѕ РїСЂР°РІ РґР»СЏ РІС‹РїРѕР»РЅРµРЅРёСЏ СЌС‚РѕРіРѕ РґРµР№СЃС‚РІРёСЏ'
        }
      });
    }

    next();
  };
};

// Middleware РґР»СЏ РѕРїС†РёРѕРЅР°Р»СЊРЅРѕР№ Р°СѓС‚РµРЅС‚РёС„РёРєР°С†РёРё (РЅРµ РѕР±СЏР·Р°С‚РµР»СЊРЅР°СЏ)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // РџРѕР»СѓС‡Р°РµРј С‚РѕРєРµРЅ РёР· Р·Р°РіРѕР»РѕРІРєР° Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Р•СЃР»Рё С‚РѕРєРµРЅР° РЅРµС‚, РїСЂРѕРґРѕР»Р¶Р°РµРј Р±РµР· Р°СѓС‚РµРЅС‚РёС„РёРєР°С†РёРё
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      // Р’РµСЂРёС„РёС†РёСЂСѓРµРј С‚РѕРєРµРЅ
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // РџРѕР»СѓС‡Р°РµРј РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РёР· Р±Р°Р·С‹ РґР°РЅРЅС‹С…
      const user = await User.findById(decoded.id);

      if (user && user.isUserActive()) {
        req.user = user;
      } else {
        req.user = null;
      }

    } catch (error) {
      // Р•СЃР»Рё С‚РѕРєРµРЅ РЅРµРІР°Р»РёРґРЅС‹Р№, РїСЂРѕСЃС‚Рѕ РїСЂРѕРґРѕР»Р¶Р°РµРј Р±РµР· РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
      req.user = null;
    }

    next();

  } catch (error) {
    console.error('Optional authentication error:', error);
    req.user = null;
    next();
  }
};

// Middleware РґР»СЏ РїСЂРѕРІРµСЂРєРё РІР»Р°РґРµР»СЊС†Р° СЂРµСЃСѓСЂСЃР°
const checkOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Р РµСЃСѓСЂСЃ РЅРµ РЅР°Р№РґРµРЅ'
          }
        });
      }

      // РџСЂРѕРІРµСЂСЏРµРј, СЏРІР»СЏРµС‚СЃСЏ Р»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ РІР»Р°РґРµР»СЊС†РµРј СЂРµСЃСѓСЂСЃР°
      const isOwner = resource.user_id && resource.user_id.toString() === req.user.id.toString();
      const isAdmin = req.user.role === 'admin';
      const isModerator = req.user.role === 'moderator';

      if (!isOwner && !isAdmin && !isModerator) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: {
            message: ERROR_MESSAGES.ACCESS_DENIED
          }
        });
      }

      // Р”РѕР±Р°РІР»СЏРµРј СЂРµСЃСѓСЂСЃ РІ РѕР±СЉРµРєС‚ Р·Р°РїСЂРѕСЃР°
      req.resource = resource;
      req.isOwner = isOwner;
      next();

    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  };
};

// Middleware РґР»СЏ РїСЂРѕРІРµСЂРєРё СЃР°РјРѕРіРѕ СЃРµР±СЏ РёР»Рё Р°РґРјРёРЅР°
const checkSelfOrAdmin = (userIdParam = 'userId') => {
  return (req, res, next) => {
    const targetUserId = req.params[userIdParam];
    const currentUserId = req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (targetUserId !== currentUserId && !isAdmin) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.ACCESS_DENIED
        }
      });
    }

    next();
  };
};

// Utility С„СѓРЅРєС†РёСЏ РґР»СЏ РіРµРЅРµСЂР°С†РёРё JWT С‚РѕРєРµРЅР°
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Utility С„СѓРЅРєС†РёСЏ РґР»СЏ РіРµРЅРµСЂР°С†РёРё refresh С‚РѕРєРµРЅР°
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  checkOwnership,
  checkSelfOrAdmin,
  generateToken,
  generateRefreshToken
};

