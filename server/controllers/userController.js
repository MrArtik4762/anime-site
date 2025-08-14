const User = require('../models/User');
const WatchList = require('../models/WatchList');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../shared/constants/constants');
const multer = require('multer');
const sharp = require('../utils/sharpAdapter');
const path = require('path');
const fs = require('fs').promises;

class UserController {
  // РџРѕР»СѓС‡РµРЅРёРµ РїСЂРѕС„РёР»СЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id)
        .select('-password -refreshToken -emailVerificationToken -passwordResetToken')
        .populate({
          path: 'watchLists',
          populate: {
            path: 'animeId',
            select: 'title images rating episodes'
          }
        });

      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: ERROR_MESSAGES.USER_NOT_FOUND
          }
        });
      }

      // РџРѕР»СѓС‡Р°РµРј СЃС‚Р°С‚РёСЃС‚РёРєСѓ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
      const stats = await WatchList.getUserStats(user._id);

      res.json({
        success: true,
        data: {
          user,
          statistics: stats
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РћР±РЅРѕРІР»РµРЅРёРµ РїСЂРѕС„РёР»СЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
  async updateProfile(req, res) {
    try {
      const { username, bio, preferences } = req.body;
      const userId = req.user.id;

      // РџСЂРѕРІРµСЂСЏРµРј СѓРЅРёРєР°Р»СЊРЅРѕСЃС‚СЊ username, РµСЃР»Рё РѕРЅ РёР·РјРµРЅРёР»СЃСЏ
      if (username && username !== req.user.username) {
        const existingUser = await User.findOne({ 
          username, 
          _id: { $ne: userId } 
        });
        
        if (existingUser) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: {
              message: 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ СЃ С‚Р°РєРёРј РёРјРµРЅРµРј СѓР¶Рµ СЃСѓС‰РµСЃС‚РІСѓРµС‚'
            }
          });
        }
      }

      // РћР±РЅРѕРІР»СЏРµРј РїСЂРѕС„РёР»СЊ
      const updateData = {};
      if (username) updateData.username = username;
      if (bio !== undefined) updateData.bio = bio;
      if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password -refreshToken -emailVerificationToken -passwordResetToken');

      res.json({
        success: true,
        data: {
          user
        },
        message: 'РџСЂРѕС„РёР»СЊ СѓСЃРїРµС€РЅРѕ РѕР±РЅРѕРІР»РµРЅ'
      });

    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РћС€РёР±РєР° РІР°Р»РёРґР°С†РёРё РґР°РЅРЅС‹С…',
            details: Object.values(error.errors).map(err => err.message)
          }
        });
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РЎРјРµРЅР° РїР°СЂРѕР»СЏ
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // РџРѕР»СѓС‡Р°РµРј РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ СЃ РїР°СЂРѕР»РµРј
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: ERROR_MESSAGES.USER_NOT_FOUND
          }
        });
      }

      // РџСЂРѕРІРµСЂСЏРµРј С‚РµРєСѓС‰РёР№ РїР°СЂРѕР»СЊ
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРІРµСЂРЅС‹Р№ С‚РµРєСѓС‰РёР№ РїР°СЂРѕР»СЊ'
          }
        });
      }

      // РћР±РЅРѕРІР»СЏРµРј РїР°СЂРѕР»СЊ
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'РџР°СЂРѕР»СЊ СѓСЃРїРµС€РЅРѕ РёР·РјРµРЅРµРЅ'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // Р—Р°РіСЂСѓР·РєР° Р°РІР°С‚Р°СЂР°
  async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Р¤Р°Р№Р» РЅРµ РїСЂРµРґРѕСЃС‚Р°РІР»РµРЅ'
          }
        });
      }

      const userId = req.user.id;
      const filename = `avatar_${userId}_${Date.now()}.jpg`;
      const avatarPath = path.join('uploads', 'avatars', filename);

      // РЎРѕР·РґР°РµРј РґРёСЂРµРєС‚РѕСЂРёСЋ РµСЃР»Рё РЅРµ СЃСѓС‰РµСЃС‚РІСѓРµС‚
      await fs.mkdir(path.dirname(avatarPath), { recursive: true });

      // РћР±СЂР°Р±Р°С‚С‹РІР°РµРј РёР·РѕР±СЂР°Р¶РµРЅРёРµ
      await sharp(req.file.buffer)
        .resize(200, 200)
        .jpeg({ quality: 90 })
        .toFile(avatarPath);

      // РЈРґР°Р»СЏРµРј СЃС‚Р°СЂС‹Р№ Р°РІР°С‚Р°СЂ РµСЃР»Рё РѕРЅ РЅРµ РґРµС„РѕР»С‚РЅС‹Р№
      const user = await User.findById(userId);
      if (user.avatar && !user.avatar.includes('placeholder')) {
        const oldAvatarPath = user.avatar.replace('/uploads/', 'uploads/');
        try {
          await fs.unlink(oldAvatarPath);
        } catch (error) {
          console.warn('Could not delete old avatar:', error.message);
        }
      }

      // РћР±РЅРѕРІР»СЏРµРј РїСѓС‚СЊ Рє Р°РІР°С‚Р°СЂСѓ РІ Р±Р°Р·Рµ РґР°РЅРЅС‹С…
      const avatarUrl = `/uploads/avatars/${filename}`;
      await User.findByIdAndUpdate(userId, { avatar: avatarUrl });

      res.json({
        success: true,
        data: {
          avatarUrl
        },
        message: 'РђРІР°С‚Р°СЂ СѓСЃРїРµС€РЅРѕ Р·Р°РіСЂСѓР¶РµРЅ'
      });

    } catch (error) {
      console.error('Upload avatar error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ РїСѓР±Р»РёС‡РЅРѕРіРѕ РїСЂРѕС„РёР»СЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
  async getPublicProfile(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId)
        .select('username avatar bio createdAt statistics preferences.publicProfile');

      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: ERROR_MESSAGES.USER_NOT_FOUND
          }
        });
      }

      // РџСЂРѕРІРµСЂСЏРµРј, РїСѓР±Р»РёС‡РЅС‹Р№ Р»Рё РїСЂРѕС„РёР»СЊ
      if (!user.preferences.publicProfile) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: {
            message: 'РџСЂРѕС„РёР»СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РїСЂРёРІР°С‚РЅС‹Р№'
          }
        });
      }

      // РџРѕР»СѓС‡Р°РµРј РїСѓР±Р»РёС‡РЅСѓСЋ СЃС‚Р°С‚РёСЃС‚РёРєСѓ
      const stats = await WatchList.getUserStats(userId);

      // РџРѕР»СѓС‡Р°РµРј РїСѓР±Р»РёС‡РЅС‹Рµ СЃРїРёСЃРєРё РїСЂРѕСЃРјРѕС‚СЂР°
      const publicWatchLists = await WatchList.find({
        userId,
        isPrivate: false
      })
      .populate('animeId', 'title images rating')
      .sort({ updatedAt: -1 })
      .limit(10);

      res.json({
        success: true,
        data: {
          user: user.getPublicProfile(),
          statistics: stats,
          recentActivity: publicWatchLists
        }
      });

    } catch (error) {
      console.error('Get public profile error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ СЃС‚Р°С‚РёСЃС‚РёРєРё РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
  async getUserStats(req, res) {
    try {
      const { userId } = req.params;
      
      // РџСЂРѕРІРµСЂСЏРµРј РїСЂР°РІР° РґРѕСЃС‚СѓРїР°
      if (userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: {
            message: ERROR_MESSAGES.ACCESS_DENIED
          }
        });
      }

      const stats = await WatchList.getUserStats(userId);

      // Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅР°СЏ СЃС‚Р°С‚РёСЃС‚РёРєР°
      const additionalStats = await User.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'userId',
            as: 'comments'
          }
        },
        {
          $project: {
            totalComments: { $size: '$comments' },
            joinDate: '$createdAt',
            lastActivity: '$lastLogin'
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          watchingStats: stats,
          additionalStats: additionalStats[0] || {}
        }
      });

    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РЈРґР°Р»РµРЅРёРµ Р°РєРєР°СѓРЅС‚Р°
  async deleteAccount(req, res) {
    try {
      const userId = req.user.id;
      const { password } = req.body;

      // РџРѕР»СѓС‡Р°РµРј РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ СЃ РїР°СЂРѕР»РµРј РґР»СЏ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: ERROR_MESSAGES.USER_NOT_FOUND
          }
        });
      }

      // РџСЂРѕРІРµСЂСЏРµРј РїР°СЂРѕР»СЊ
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРІРµСЂРЅС‹Р№ РїР°СЂРѕР»СЊ'
          }
        });
      }

      // РЈРґР°Р»СЏРµРј СЃРІСЏР·Р°РЅРЅС‹Рµ РґР°РЅРЅС‹Рµ
      await Promise.all([
        WatchList.deleteMany({ userId }),
        // Comment.deleteMany({ userId }), // РњРѕР¶РЅРѕ РѕСЃС‚Р°РІРёС‚СЊ РєРѕРјРјРµРЅС‚Р°СЂРёРё РєР°Рє Р°РЅРѕРЅРёРјРЅС‹Рµ
      ]);

      // РЈРґР°Р»СЏРµРј Р°РІР°С‚Р°СЂ РµСЃР»Рё РѕРЅ РЅРµ РґРµС„РѕР»С‚РЅС‹Р№
      if (user.avatar && !user.avatar.includes('placeholder')) {
        const avatarPath = user.avatar.replace('/uploads/', 'uploads/');
        try {
          await fs.unlink(avatarPath);
        } catch (error) {
          console.warn('Could not delete avatar:', error.message);
        }
      }

      // РЈРґР°Р»СЏРµРј РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
      await User.findByIdAndDelete(userId);

      res.json({
        success: true,
        message: 'РђРєРєР°СѓРЅС‚ СѓСЃРїРµС€РЅРѕ СѓРґР°Р»РµРЅ'
      });

    } catch (error) {
      console.error('Delete account error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }
}

// РљРѕРЅС„РёРіСѓСЂР°С†РёСЏ multer РґР»СЏ Р·Р°РіСЂСѓР·РєРё Р°РІР°С‚Р°СЂРѕРІ
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('РўРѕР»СЊРєРѕ РёР·РѕР±СЂР°Р¶РµРЅРёСЏ СЂР°Р·СЂРµС€РµРЅС‹'), false);
    }
  }
});

module.exports = {
  userController: new UserController(),
  avatarUpload
};
