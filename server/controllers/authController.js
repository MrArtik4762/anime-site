const User = require('../models/UserKnex');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const { accountLockout, resetAttempts } = require('../middleware/accountLockout');
const { require2FA, generate2FASecret, enable2FA, disable2FA } = require('../middleware/2fa');
const { setAuthCookies } = require('../middleware/cookieAuth');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../shared/constants/constants');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class AuthController {
  // Р РµРіРёСЃС‚СЂР°С†РёСЏ РЅРѕРІРѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // РџСЂРѕРІРµСЂСЏРµРј, СЃСѓС‰РµСЃС‚РІСѓРµС‚ Р»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ
      const existingUser = await User.findByEmailOrUsername(email);
      if (existingUser) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ СЃ С‚Р°РєРёРј email РёР»Рё РёРјРµРЅРµРј СѓР¶Рµ СЃСѓС‰РµСЃС‚РІСѓРµС‚'
          }
        });
      }

      // РџСЂРѕРІРµСЂСЏРµРј СѓРЅРёРєР°Р»СЊРЅРѕСЃС‚СЊ username
      const isUsernameUnique = await User.isUsernameUnique(username);
      if (!isUsernameUnique) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РРјСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ Р·Р°РЅСЏС‚Рѕ'
          }
        });
      }

      // РҐРµС€РёСЂСѓРµРј РїР°СЂРѕР»СЊ
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // РЎРѕР·РґР°РµРј РЅРѕРІРѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
      const userData = {
        username,
        email,
        password_hash,
        role: 'user',
        preferences: {
          theme: 'dark',
          language: 'ru',
          emailNotifications: true,
          publicProfile: true
        }
      };

      // РЎРѕР·РґР°РµРј С‚РѕРєРµРЅ РІРµСЂРёС„РёРєР°С†РёРё email
      const verificationToken = crypto.randomBytes(32).toString('hex');
      userData.email_verification_token = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
      userData.email_verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 С‡Р°СЃР°

      const user = await User.create(userData);

      // Р“РµРЅРµСЂРёСЂСѓРµРј JWT С‚РѕРєРµРЅС‹
      const accessToken = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // РЎРѕС…СЂР°РЅСЏРµРј refresh С‚РѕРєРµРЅ
      await user.update({ refresh_token: refreshToken });

      // РћС‚РїСЂР°РІР»СЏРµРј email РІРµСЂРёС„РёРєР°С†РёРё (Р·Р°РіР»СѓС€РєР°)
      // await emailService.sendVerificationEmail(user.email, verificationToken);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isEmailVerified: user.is_email_verified
          },
          tokens: {
            accessToken,
            refreshToken
          }
        },
        message: 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ СѓСЃРїРµС€РЅРѕ Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°РЅ'
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // Р’С…РѕРґ РІ СЃРёСЃС‚РµРјСѓ
  async login(req, res) {
    try {
      console.log('рџ”Ќ LOGIN DEBUG - Request body:', req.body);
      console.log('рџ”Ќ LOGIN DEBUG - Request headers:', req.headers);
      
      const { email, password } = req.body;
      console.log('рџ”Ќ LOGIN DEBUG - Extracted email:', email);
      console.log('рџ”Ќ LOGIN DEBUG - Password provided:', !!password);

      // РџСЂРѕРІРµСЂСЏРµРј Р±Р»РѕРєРёСЂРѕРІРєСѓ Р°РєРєР°СѓРЅС‚Р°
      const { getLockoutInfo } = require('../middleware/accountLockout');
      const lockoutInfo = getLockoutInfo(email);
      
      if (lockoutInfo.isLocked) {
        return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
          success: false,
          error: {
            message: `РђРєРєР°СѓРЅС‚ Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅ. РџРѕРїСЂРѕР±СѓР№С‚Рµ С‡РµСЂРµР· ${lockoutInfo.remainingTime} РјРёРЅСѓС‚.`,
            code: 'ACCOUNT_LOCKED',
            lockoutTime: lockoutInfo.lockoutTime
          }
        });
      }

      // РќР°С…РѕРґРёРј РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РїРѕ email РёР»Рё username
      const user = await User.findByEmailOrUsername(email, ['id', 'username', 'email', 'password_hash', 'role', 'avatar', 'is_email_verified', 'preferences', 'refresh_token', 'last_login', 'is_2fa_enabled', 'secret_2fa', 'backup_codes_2fa']);
      console.log('рџ”Ќ LOGIN DEBUG - User found:', !!user);
      if (user) {
        console.log('рџ”Ќ LOGIN DEBUG - User details:', {
          id: user.id,
          username: user.username,
          email: user.email,
          is_2fa_enabled: user.is_2fa_enabled
        });
      }
      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'РќРµРІРµСЂРЅС‹Рµ СѓС‡РµС‚РЅС‹Рµ РґР°РЅРЅС‹Рµ'
          }
        });
      }

      // РџСЂРѕРІРµСЂСЏРµРј Р°РєС‚РёРІРЅРѕСЃС‚СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
      if (!user.isUserActive()) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: {
            message: 'РђРєРєР°СѓРЅС‚ Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅ РёР»Рё РЅРµР°РєС‚РёРІРµРЅ'
          }
        });
      }

      // РџСЂРѕРІРµСЂСЏРµРј РїР°СЂРѕР»СЊ
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'РќРµРІРµСЂРЅС‹Рµ СѓС‡РµС‚РЅС‹Рµ РґР°РЅРЅС‹Рµ'
          }
        });
      }

      // РџСЂРѕРІРµСЂСЏРµРј, С‚СЂРµР±СѓРµС‚СЃСЏ Р»Рё 2FA
      if (user.is_2fa_enabled) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'РќСѓР¶РµРЅ РєРѕРґ РґРІСѓС…С„Р°РєС‚РѕСЂРЅРѕР№ Р°СѓС‚РµРЅС‚РёС„РёРєР°С†РёРё',
            code: '2FA_REQUIRED',
            userId: user.id
          }
        });
        return;
      }

      // Р“РµРЅРµСЂРёСЂСѓРµРј РЅРѕРІС‹Рµ С‚РѕРєРµРЅС‹
      const accessToken = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // РћР±РЅРѕРІР»СЏРµРј refresh С‚РѕРєРµРЅ Рё РІСЂРµРјСЏ РїРѕСЃР»РµРґРЅРµРіРѕ РІС…РѕРґР°
      await user.update({
        refresh_token: refreshToken,
        last_login: new Date()
      });

      // РЈСЃС‚Р°РЅР°РІР»РёРІР°РµРј С‚РѕРєРµРЅС‹ РІ cookies
      setAuthCookies(req, res, () => {
        res.json({
          success: true,
          data: {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role,
              avatar: user.avatar,
              isEmailVerified: user.is_email_verified,
              preferences: JSON.parse(user.preferences || '{}'),
              is2faEnabled: user.is_2fa_enabled
            },
            tokens: {
              accessToken,
              refreshToken
            }
          },
          message: 'РЈСЃРїРµС€РЅС‹Р№ РІС…РѕРґ РІ СЃРёСЃС‚РµРјСѓ'
        });
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РћР±РЅРѕРІР»РµРЅРёРµ С‚РѕРєРµРЅР°
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'Refresh С‚РѕРєРµРЅ РЅРµ РїСЂРµРґРѕСЃС‚Р°РІР»РµРЅ'
          }
        });
      }

      // РќР°С…РѕРґРёРј РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ СЃ РґР°РЅРЅС‹Рј refresh С‚РѕРєРµРЅРѕРј
      const user = await User.findByRefreshToken(refreshToken);
      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'РќРµРґРµР№СЃС‚РІРёС‚РµР»СЊРЅС‹Р№ refresh С‚РѕРєРµРЅ'
          }
        });
      }

      // РџСЂРѕРІРµСЂСЏРµРј Р°РєС‚РёРІРЅРѕСЃС‚СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
      if (!user.is_active) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: {
            message: 'РђРєРєР°СѓРЅС‚ Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅ РёР»Рё РЅРµР°РєС‚РёРІРµРЅ'
          }
        });
      }

      // Р“РµРЅРµСЂРёСЂСѓРµРј РЅРѕРІС‹Рµ С‚РѕРєРµРЅС‹
      const newAccessToken = generateToken(user.id);
      const newRefreshToken = generateRefreshToken(user.id);

      // РћР±РЅРѕРІР»СЏРµРј refresh С‚РѕРєРµРЅ
      await User.findByIdAndUpdate(user.id, {
        refresh_token: newRefreshToken
      });

      res.json({
        success: true,
        data: {
          tokens: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
          }
        }
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // Р’С‹С…РѕРґ РёР· СЃРёСЃС‚РµРјС‹
  async logout(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (user) {
        // РЈРґР°Р»СЏРµРј refresh С‚РѕРєРµРЅ
        await User.findByIdAndUpdate(user.id, {
          refresh_token: null
        });
      }

      res.json({
        success: true,
        message: 'РЈСЃРїРµС€РЅС‹Р№ РІС‹С…РѕРґ РёР· СЃРёСЃС‚РµРјС‹'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ С‚РµРєСѓС‰РµРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
  async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id, ['id', 'username', 'email', 'role', 'avatar', 'bio', 'preferences', 'is_email_verified', 'last_login']);

      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: ERROR_MESSAGES.USER_NOT_FOUND
          }
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            ...user,
            preferences: JSON.parse(user.preferences || '{}')
          }
        }
      });

    } catch (error) {
      console.error('Get me error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // Р—Р°Р±С‹Р»Рё РїР°СЂРѕР»СЊ
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        // РќРµ СЂР°СЃРєСЂС‹РІР°РµРј, СЃСѓС‰РµСЃС‚РІСѓРµС‚ Р»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ
        return res.json({
          success: true,
          message: 'Р•СЃР»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ СЃ С‚Р°РєРёРј email СЃСѓС‰РµС‚РІСѓРµС‚, РёРЅСЃС‚СЂСѓРєС†РёРё РѕС‚РїСЂР°РІР»РµРЅС‹ РЅР° РїРѕС‡С‚Сѓ'
        });
      }

      // РЎРѕР·РґР°РµРј С‚РѕРєРµРЅ СЃР±СЂРѕСЃР° РїР°СЂРѕР»СЏ
      const resetToken = await User.createPasswordResetToken(user.id);
      await User.findByIdAndUpdate(user.id, {
        password_reset_token: resetToken.token,
        password_reset_expires: resetToken.expires
      });

      // РћС‚РїСЂР°РІР»СЏРµРј email СЃ РёРЅСЃС‚СЂСѓРєС†РёСЏРјРё (Р·Р°РіР»СѓС€РєР°)
      // await emailService.sendPasswordResetEmail(user.email, resetToken.token);

      res.json({
        success: true,
        message: 'Р•СЃР»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ СЃ С‚Р°РєРёРј email СЃСѓС‰РµС‚РІСѓРµС‚, РёРЅСЃС‚СЂСѓРєС†РёРё РѕС‚РїСЂР°РІР»РµРЅС‹ РЅР° РїРѕС‡С‚Сѓ'
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РЎР±СЂРѕСЃ РїР°СЂРѕР»СЏ
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      // РҐРµС€РёСЂСѓРµРј С‚РѕРєРµРЅ РґР»СЏ РїРѕРёСЃРєР°
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // РќР°С…РѕРґРёРј РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ СЃ РґРµР№СЃС‚РІСѓСЋС‰РёРј С‚РѕРєРµРЅРѕРј
      const user = await User.findOne({
        password_reset_token: hashedToken,
        password_reset_expires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРґРµР№СЃС‚РІРёС‚РµР»СЊРЅС‹Р№ РёР»Рё РёСЃС‚РµРєС€РёР№ С‚РѕРєРµРЅ'
          }
        });
      }

      // РћР±РЅРѕРІР»СЏРµРј РїР°СЂРѕР»СЊ
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      await User.findByIdAndUpdate(user.id, {
        password_hash: password_hash,
        password_reset_token: null,
        password_reset_expires: null
      });

      // Р“РµРЅРµСЂРёСЂСѓРµРј РЅРѕРІС‹Рµ С‚РѕРєРµРЅС‹
      const accessToken = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      await User.findByIdAndUpdate(user.id, {
        refresh_token: refreshToken
      });

      res.json({
        success: true,
        data: {
          tokens: {
            accessToken,
            refreshToken
          }
        },
        message: 'РџР°СЂРѕР»СЊ СѓСЃРїРµС€РЅРѕ РёР·РјРµРЅРµРЅ'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // Р’РµСЂРёС„РёРєР°С†РёСЏ email
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      // РҐРµС€РёСЂСѓРµРј С‚РѕРєРµРЅ РґР»СЏ РїРѕРёСЃРºР°
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // РќР°С…РѕРґРёРј РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ СЃ РґРµР№СЃС‚РІСѓСЋС‰РёРј С‚РѕРєРµРЅРѕРј
      const user = await User.findOne({
        email_verification_token: hashedToken,
        email_verification_expires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРґРµР№СЃС‚РІРёС‚РµР»СЊРЫР№ РёР»Рё РёСЃС‚РµРєС€РёР№ С‚РѕРєРµРЅ РІРµСЂРёС„РёРєР°С†РёРё'
          }
        });
      }

      // РџРѕРґС‚РІРµСЂР¶РґР°РµРј email
      await User.findByIdAndUpdate(user.id, {
        is_email_verified: true,
        email_verification_token: null,
        email_verification_expires: null
      });

      res.json({
        success: true,
        message: 'Email СѓСЃРїРµС€РЅРѕ РїРѕРґС‚РІРµСЂР¶РґРµРЅ'
      });

    } catch (error) {
      console.error('Verify email error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }
}

module.exports = new AuthController();


// GET /api/auth/2fa/generate - Генерация 2FA секрета
  async generate2FASecret(req, res) {
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
  }

  // POST /api/auth/2fa/enable - Включение 2FA
  async enable2FA(req, res) {
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
  }

  // POST /api/auth/2fa/disable - Отключение 2FA
  async disable2FA(req, res) {
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
  }

  // POST /api/auth/2fa/verify - Проверка 2FA токена
  async verify2FA(req, res) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Токен обязателен'
          }
        });
      }

      // Проверяем токен
      const verified = speakeasy.totp.verify({
        secret: req.user.secret_2fa,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (!verified) {
        // Проверяем резервный код
        const backupCodes = req.user.backup_codes_2fa ? JSON.parse(req.user.backup_codes_2fa) : [];
        const codeIndex = backupCodes.indexOf(token);
        
        if (codeIndex === -1) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            error: {
              message: 'Неверный код двухфакторной аутентификации',
              code: 'INVALID_2FA_TOKEN'
            }
          });
        }

        // Удаляем использованный код
        backupCodes.splice(codeIndex, 1);
        await req.user.update({
          backup_codes_2fa: JSON.stringify(backupCodes)
        });
      }

      res.json({
        success: true,
        message: 'Код подтвержден'
      });

    } catch (error) {
      console.error('2FA verification error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }
