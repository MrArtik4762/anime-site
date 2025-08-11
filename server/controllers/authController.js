const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const { HTTP_STATUS, ERROR_MESSAGES } = require('/app/shared/constants/constants');
const crypto = require('crypto');

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

      // РЎРѕР·РґР°РµРј РЅРѕРІРѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
      const user = new User({
        username,
        email,
        password
      });

      // РЎРѕР·РґР°РµРј С‚РѕРєРµРЅ РІРµСЂРёС„РёРєР°С†РёРё email
      const verificationToken = user.createEmailVerificationToken();
      await user.save();

      // Р“РµРЅРµСЂРёСЂСѓРµРј JWT С‚РѕРєРµРЅС‹
      const accessToken = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // РЎРѕС…СЂР°РЅСЏРµРј refresh С‚РѕРєРµРЅ РІ Р±Р°Р·Рµ (РјРѕР¶РЅРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РѕС‚РґРµР»СЊРЅСѓСЋ РєРѕР»Р»РµРєС†РёСЋ)
      user.refreshToken = refreshToken;
      await user.save();

      // РћС‚РїСЂР°РІР»СЏРµРј email РІРµСЂРёС„РёРєР°С†РёРё (Р·Р°РіР»СѓС€РєР°)
      // await emailService.sendVerificationEmail(user.email, verificationToken);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified
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

      // РќР°С…РѕРґРёРј РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РїРѕ email РёР»Рё username
      const user = await User.findByEmailOrUsername(email);
      console.log('рџ”Ќ LOGIN DEBUG - User found:', !!user);
      if (user) {
        console.log('рџ”Ќ LOGIN DEBUG - User details:', {
          id: user._id,
          username: user.username,
          email: user.email,
          isActive: user.isActive
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

      // РџСЂРѕРІРµСЂСЏРµРј Р°РєС‚РёРІРЅРѕСЃС‚СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
      if (!user.isUserActive()) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: {
            message: 'РђРєРєР°СѓРЅС‚ Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅ РёР»Рё РЅРµР°РєС‚РёРІРµРЅ'
          }
        });
      }

      // Р“РµРЅРµСЂРёСЂСѓРµРј РЅРѕРІС‹Рµ С‚РѕРєРµРЅС‹
      const accessToken = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // РћР±РЅРѕРІР»СЏРµРј refresh С‚РѕРєРµРЅ Рё РІСЂРµРјСЏ РїРѕСЃР»РµРґРЅРµРіРѕ РІС…РѕРґР°
      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save();

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified,
            preferences: user.preferences
          },
          tokens: {
            accessToken,
            refreshToken
          }
        },
        message: 'РЈСЃРїРµС€РЅС‹Р№ РІС…РѕРґ РІ СЃРёСЃС‚РµРјСѓ'
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
      const user = await User.findOne({ refreshToken });
      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'РќРµРґРµР№СЃС‚РІРёС‚РµР»СЊРЅС‹Р№ refresh С‚РѕРєРµРЅ'
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

      // Р“РµРЅРµСЂРёСЂСѓРµРј РЅРѕРІС‹Рµ С‚РѕРєРµРЅС‹
      const newAccessToken = generateToken(user._id);
      const newRefreshToken = generateRefreshToken(user._id);

      // РћР±РЅРѕРІР»СЏРµРј refresh С‚РѕРєРµРЅ
      user.refreshToken = newRefreshToken;
      await user.save();

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
        user.refreshToken = undefined;
        await user.save();
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
      const user = await User.findById(req.user.id)
        .populate('watchLists')
        .select('-password -refreshToken');

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
          user
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

      const user = await User.findOne({ email });
      if (!user) {
        // РќРµ СЂР°СЃРєСЂС‹РІР°РµРј, СЃСѓС‰РµСЃС‚РІСѓРµС‚ Р»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ
        return res.json({
          success: true,
          message: 'Р•СЃР»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ СЃ С‚Р°РєРёРј email СЃСѓС‰РµСЃС‚РІСѓРµС‚, РёРЅСЃС‚СЂСѓРєС†РёРё РѕС‚РїСЂР°РІР»РµРЅС‹ РЅР° РїРѕС‡С‚Сѓ'
        });
      }

      // РЎРѕР·РґР°РµРј С‚РѕРєРµРЅ СЃР±СЂРѕСЃР° РїР°СЂРѕР»СЏ
      const resetToken = user.createPasswordResetToken();
      await user.save();

      // РћС‚РїСЂР°РІР»СЏРµРј email СЃ РёРЅСЃС‚СЂСѓРєС†РёСЏРјРё (Р·Р°РіР»СѓС€РєР°)
      // await emailService.sendPasswordResetEmail(user.email, resetToken);

      res.json({
        success: true,
        message: 'Р•СЃР»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ СЃ С‚Р°РєРёРј email СЃСѓС‰РµСЃС‚РІСѓРµС‚, РёРЅСЃС‚СЂСѓРєС†РёРё РѕС‚РїСЂР°РІР»РµРЅС‹ РЅР° РїРѕС‡С‚Сѓ'
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
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
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
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      // Р“РµРЅРµСЂРёСЂСѓРµРј РЅРѕРІС‹Рµ С‚РѕРєРµРЅС‹
      const accessToken = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

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

      // РҐРµС€РёСЂСѓРµРј С‚РѕРєРµРЅ РґР»СЏ РїРѕРёСЃРєР°
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // РќР°С…РѕРґРёРј РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ СЃ РґРµР№СЃС‚РІСѓСЋС‰РёРј С‚РѕРєРµРЅРѕРј
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРґРµР№СЃС‚РІРёС‚РµР»СЊРЅС‹Р№ РёР»Рё РёСЃС‚РµРєС€РёР№ С‚РѕРєРµРЅ РІРµСЂРёС„РёРєР°С†РёРё'
          }
        });
      }

      // РџРѕРґС‚РІРµСЂР¶РґР°РµРј email
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

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

