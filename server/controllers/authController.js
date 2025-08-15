const User = require('../models/UserKnex');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const { accountLockout, resetAttempts } = require('../middleware/accountLockout');
const { require2FA } = require('../middleware/2fa');
const { setAuthCookies } = require('../middleware/cookieAuth');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../shared/constants/constants');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class AuthController {
  // Регистрация нового пользователя
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Проверяем, существует ли пользователь
      const existingUser = await User.findByEmailOrUsername(email);
      if (existingUser) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Пользователь с таким email или именем уже существует'
          }
        });
      }

      // Проверяем уникальность username
      const isUsernameUnique = await User.isUsernameUnique(username);
      if (!isUsernameUnique) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Имя пользователя занято'
          }
        });
      }

      // Хешируем пароль
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Создаем нового пользователя
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

      // Создаем токен верификации email
      const verificationToken = crypto.randomBytes(32).toString('hex');
      userData.email_verification_token = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
      userData.email_verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

      const user = await User.create(userData);

      // Генерируем JWT токены
      const accessToken = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // Сохраняем refresh токен
      await user.update({ refresh_token: refreshToken });

      // Отправляем email верификации (заглушка)
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
        message: 'Пользователь успешно зарегистрирован'
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

  // Вход в систему
  async login(req, res) {
    try {
      console.log('🔐 LOGIN DEBUG - Request body:', req.body);
      console.log('🔐 LOGIN DEBUG - Request headers:', req.headers);
      
      const { email, password } = req.body;
      console.log('🔐 LOGIN DEBUG - Extracted email:', email);
      console.log('🔐 LOGIN DEBUG - Password provided:', !!password);

      // Проверяем блокировку аккаунта
      const { getLockoutInfo } = require('../middleware/accountLockout');
      const lockoutInfo = getLockoutInfo(email);
      
      if (lockoutInfo.isLocked) {
        return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
          success: false,
          error: {
            message: `Аккаунт заблокирован. Попробуйте через ${lockoutInfo.remainingTime} минут.`,
            code: 'ACCOUNT_LOCKED',
            lockoutTime: lockoutInfo.lockoutTime
          }
        });
      }

      // Находим пользователя по email или username
      const user = await User.findByEmailOrUsername(email, ['id', 'username', 'email', 'password_hash', 'role', 'avatar', 'is_email_verified', 'preferences', 'refresh_token', 'last_login', 'is_2fa_enabled', 'secret_2fa', 'backup_codes_2fa']);
      console.log('🔐 LOGIN DEBUG - User found:', !!user);
      if (user) {
        console.log('🔐 LOGIN DEBUG - User details:', {
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
            message: 'Неверные учетные данные'
          }
        });
      }

      // Проверяем активность пользователя
      if (!user.isUserActive()) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Аккаунт заблокирован или неактивен'
          }
        });
      }

      // Проверяем пароль
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'Неверные учетные данные'
          }
        });
      }

      // Проверяем, требуется ли 2FA
      if (user.is_2fa_enabled) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'Нужен код двухфакторной аутентификации',
            code: '2FA_REQUIRED',
            userId: user.id
          }
        });
        return;
      }

      // Генерируем новые токены
      const accessToken = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // Обновляем refresh токен и время последнего входа
      await user.update({
        refresh_token: refreshToken,
        last_login: new Date()
      });

      // Устанавливаем токены в cookies
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
          message: 'Успешный вход в систему'
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

  // Обновление токена
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'Refresh токен не предоставлен'
          }
        });
      }

      // Находим пользователя с данным refresh токеном
      const user = await User.findByRefreshToken(refreshToken);
      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'Недействительный refresh токен'
          }
        });
      }

      // Проверяем активность пользователя
      if (!user.is_active) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Аккаунт заблокирован или неактивен'
          }
        });
      }

      // Генерируем новые токены
      const newAccessToken = generateToken(user.id);
      const newRefreshToken = generateRefreshToken(user.id);

      // Обновляем refresh токен
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

  // Выход из системы
  async logout(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (user) {
        // Удаляем refresh токен
        await User.findByIdAndUpdate(user.id, {
          refresh_token: null
        });
      }

      res.json({
        success: true,
        message: 'Успешный выход из системы'
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

  // Получение текущего пользователя
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

  // Забыли пароль
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        // Не раскрываем, существует ли пользователь
        return res.json({
          success: true,
          message: 'Если пользователь с таким email существует, инструкции отправлены на почту'
        });
      }

      // Создаем токен сброса пароля
      const resetToken = await User.createPasswordResetToken(user.id);
      await User.findByIdAndUpdate(user.id, {
        password_reset_token: resetToken.token,
        password_reset_expires: resetToken.expires
      });

      // Отправляем email с инструкциями (заглушка)
      // await emailService.sendPasswordResetEmail(user.email, resetToken.token);

      res.json({
        success: true,
        message: 'Если пользователь с таким email существует, инструкции отправлены на почту'
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

  // Сброс пароля
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      // Хешируем токен для поиска
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Находим пользователя с действующим токеном
      const user = await User.findOne({
        password_reset_token: hashedToken,
        password_reset_expires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Недействительный или истекший токен'
          }
        });
      }

      // Обновляем пароль
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      await User.findByIdAndUpdate(user.id, {
        password_hash: password_hash,
        password_reset_token: null,
        password_reset_expires: null
      });

      // Генерируем новые токены
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
        message: 'Пароль успешно изменен'
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

  // Верификация email
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      // Хешируем токен для поиска
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Находим пользователя с действующим токеном
      const user = await User.findOne({
        email_verification_token: hashedToken,
        email_verification_expires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Недействительный или истекший токен верификации'
          }
        });
      }

      // Подтверждаем email
      await User.findByIdAndUpdate(user.id, {
        is_email_verified: true,
        email_verification_token: null,
        email_verification_expires: null
      });

      res.json({
        success: true,
        message: 'Email успешно подтвержден'
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
          backupCodes: (() => {
            const codes = [];
            for (let i = 0; i < 10; i++) {
              codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
            }
            return codes;
          })()
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

  // Генерация резервных кодов для 2FA
  generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }
}

module.exports = new AuthController();
