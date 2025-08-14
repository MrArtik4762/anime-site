const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../shared/constants/constants');

/**
 * Middleware для проверки двухфакторной аутентификации
 */
const require2FA = (req, res, next) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.INVALID_TOKEN
      }
    });
  }

  // Если 2FA не настроен, пропускаем
  if (!req.user.is_2fa_enabled) {
    return next();
  }

  const { token } = req.body;
  
  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: {
        message: 'Требуется код двухфакторной аутентификации',
        code: '2FA_REQUIRED'
      }
    });
  }

  // Проверяем токен
  const verified = speakeasy.totp.verify({
    secret: req.user.secret_2fa,
    encoding: 'base32',
    token: token,
    window: 2 // Разрешаем +-1 шаг (30 секунд)
  });

  if (!verified) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: {
        message: 'Неверный код двухфакторной аутентификации',
        code: 'INVALID_2FA_TOKEN'
      }
    });
  }

  next();
};

/**
 * Генерация секретного ключа и QR-кода для 2FA
 */
const generate2FASecret = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'Email обязателен'
        }
      });
    }

    // Генерируем секретный ключ
    const secret = speakeasy.generateSecret({
      name: `AnimeSite (${email})`,
      issuer: 'AnimeSite'
    });

    // Генерируем QR-код
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCodeUrl,
        backupCodes: generateBackupCodes()
      }
    });

  } catch (error) {
    console.error('2FA generation error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.SERVER_ERROR
      }
    });
  }
};

/**
 * Включение 2FA для пользователя
 */
const enable2FA = async (req, res) => {
  try {
    const { token, secret, backupCodes } = req.body;
    
    if (!token || !secret) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'Токен и секрет обязательны'
        }
      });
    }

    // Проверяем токен
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          message: 'Неверный код двухфакторной аутентификации',
          code: 'INVALID_2FA_TOKEN'
        }
      });
    }

    // Включаем 2FA для пользователя
    await req.user.update({
      is_2fa_enabled: true,
      secret_2fa: secret,
      backup_codes_2fa: JSON.stringify(backupCodes)
    });

    res.json({
      success: true,
      message: 'Двухфакторная аутентификация включена'
    });

  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.SERVER_ERROR
      }
    });
  }
};

/**
 * Отключение 2FA для пользователя
 */
const disable2FA = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'Пароль обязателен'
        }
      });
    }

    // Проверяем пароль
    const isPasswordValid = await req.user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          message: 'Неверный пароль'
        }
      });
    }

    // Отключаем 2FA
    await req.user.update({
      is_2fa_enabled: false,
      secret_2fa: null,
      backup_codes_2fa: null
    });

    res.json({
      success: true,
      message: 'Двухфакторная аутентификация отключена'
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.SERVER_ERROR
      }
    });
  }
};

/**
 * Проверка резервного кода 2FA
 */
const verifyBackupCode = async (req, res, next) => {
  try {
    const { backupCode } = req.body;
    
    if (!backupCode) {
      return res.status(HTTP.Status.UNAUTHORIZED).json({
        success: false,
        error: {
          message: 'Требуется резервный код',
          code: 'BACKUP_CODE_REQUIRED'
        }
      });
    }

    const backupCodes = req.user.backup_codes_2fa ? JSON.parse(req.user.backup_codes_2fa) : [];
    
    // Проверяем, что код не использован
    const codeIndex = backupCodes.indexOf(backupCode);
    if (codeIndex === -1) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          message: 'Неверный резервный код',
          code: 'INVALID_BACKUP_CODE'
        }
      });
    }

    // Удаляем использованный код
    backupCodes.splice(codeIndex, 1);
    await req.user.update({
      backup_codes_2fa: JSON.stringify(backupCodes)
    });

    next();

  } catch (error) {
    console.error('Backup code verification error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.SERVER_ERROR
      }
    });
  }
};

/**
 * Генерация резервных кодов
 */
function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(generateRandomCode());
  }
  return codes;
}

/**
 * Генерация случайного кода
 */
function generateRandomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = {
  require2FA,
  generate2FASecret,
  enable2FA,
  disable2FA,
  verifyBackupCode
};