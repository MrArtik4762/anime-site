const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const User = require('../models/User');
const WatchList = require('../models/WatchList');
const { HTTP_STATUS, ERROR_MESSAGES } = require('/app/shared/constants/constants');

class AchievementController {
  // РџРѕР»СѓС‡РµРЅРёРµ РІСЃРµС… РґРѕСЃС‚РёР¶РµРЅРёР№ РґР»СЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
  async getUserAchievements(req, res) {
    try {
      const userId = req.user.id;
      const { category, completed, page = 1, limit = 20 } = req.query;

      const options = {};
      if (category) options.category = category;
      if (completed !== undefined) options.completed = completed === 'true';

      const userAchievements = await UserAchievement.getUserAchievements(userId, options);
      
      // РџРѕР»СѓС‡Р°РµРј СЃС‚Р°С‚РёСЃС‚РёРєСѓ
      const stats = await UserAchievement.getUserStats(userId);
      const progressByCategory = await UserAchievement.getProgressByCategory(userId);

      res.json({
        success: true,
        data: {
          achievements: userAchievements,
          statistics: stats,
          progressByCategory,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: userAchievements.length
          }
        }
      });

    } catch (error) {
      console.error('Get user achievements error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ РЅРµРґР°РІРЅРѕ СЂР°Р·Р±Р»РѕРєРёСЂРѕРІР°РЅРЅС‹С… РґРѕСЃС‚РёР¶РµРЅРёР№
  async getRecentUnlocks(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 5 } = req.query;

      const recentUnlocks = await UserAchievement.getRecentUnlocks(userId, parseInt(limit));

      res.json({
        success: true,
        data: {
          recentUnlocks
        }
      });

    } catch (error) {
      console.error('Get recent unlocks error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџСЂРѕРІРµСЂРєР° РїСЂРѕРіСЂРµСЃСЃР° РґРѕСЃС‚РёР¶РµРЅРёР№ РґР»СЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
  async checkAchievements(req, res) {
    try {
      const userId = req.user.id;

      // РџРѕР»СѓС‡Р°РµРј СЃС‚Р°С‚РёСЃС‚РёРєСѓ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
      const user = await User.findById(userId);
      const watchStats = await WatchList.getUserStats(userId);
      
      const userStats = {
        ...user.statistics.toObject(),
        ...watchStats
      };

      // РџСЂРѕРІРµСЂСЏРµРј РґРѕСЃС‚РёР¶РµРЅРёСЏ
      const newAchievements = await Achievement.checkUserAchievements(userId, userStats);

      // РћР±РЅРѕРІР»СЏРµРј РїСЂРѕРіСЂРµСЃСЃ РґР»СЏ РІСЃРµС… Р°РєС‚РёРІРЅС‹С… РґРѕСЃС‚РёР¶РµРЅРёР№
      const activeAchievements = await Achievement.find({ isActive: true });
      const progressUpdates = [];

      for (const achievement of activeAchievements) {
        const userAchievement = await UserAchievement.findOne({
          userId,
          achievementId: achievement._id
        });

        if (!userAchievement || !userAchievement.isCompleted) {
          const progress = await this.calculateProgress(achievement, userId, userStats);
          
          if (progress !== null) {
            await UserAchievement.findOneAndUpdate(
              { userId, achievementId: achievement._id },
              {
                $set: {
                  'progress.current': progress,
                  'progress.target': achievement.criteria.target || 1,
                  'metadata.points': achievement.rewards.points
                }
              },
              { upsert: true, new: true }
            );
            
            progressUpdates.push({
              achievement: achievement.name,
              progress,
              target: achievement.criteria.target || 1
            });
          }
        }
      }

      res.json({
        success: true,
        data: {
          newAchievements,
          progressUpdates,
          userStats
        },
        message: newAchievements.length > 0 ? 
          `Р Р°Р·Р±Р»РѕРєРёСЂРѕРІР°РЅРѕ РЅРѕРІС‹С… РґРѕСЃС‚РёР¶РµРЅРёР№: ${newAchievements.length}` : 
          'РџСЂРѕРіСЂРµСЃСЃ РѕР±РЅРѕРІР»РµРЅ'
      });

    } catch (error) {
      console.error('Check achievements error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ РІСЃРµС… РґРѕСЃС‚СѓРїРЅС‹С… РґРѕСЃС‚РёР¶РµРЅРёР№ (РєР°С‚Р°Р»РѕРі)
  async getAllAchievements(req, res) {
    try {
      const { category, rarity, showSecret = false } = req.query;
      const userId = req.user.id;

      const filter = { isActive: true };
      if (category) filter.category = category;
      if (rarity) filter.rarity = rarity;
      if (showSecret !== 'true') filter.isSecret = false;

      const achievements = await Achievement.find(filter)
        .sort({ category: 1, rarity: 1, createdAt: 1 });

      // РџРѕР»СѓС‡Р°РµРј РїСЂРѕРіСЂРµСЃСЃ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РґР»СЏ РєР°Р¶РґРѕРіРѕ РґРѕСЃС‚РёР¶РµРЅРёСЏ
      const userAchievements = await UserAchievement.find({
        userId,
        achievementId: { $in: achievements.map(a => a._id) }
      });

      const userAchievementMap = {};
      userAchievements.forEach(ua => {
        userAchievementMap[ua.achievementId.toString()] = ua;
      });

      const achievementsWithProgress = achievements.map(achievement => {
        const userProgress = userAchievementMap[achievement._id.toString()];
        return {
          ...achievement.toObject(),
          userProgress: userProgress || {
            progress: { current: 0, target: achievement.criteria.target || 1, percentage: 0 },
            isCompleted: false
          }
        };
      });

      // Р“СЂСѓРїРїРёСЂСѓРµРј РїРѕ РєР°С‚РµРіРѕСЂРёСЏРј
      const categorizedAchievements = {};
      achievementsWithProgress.forEach(achievement => {
        if (!categorizedAchievements[achievement.category]) {
          categorizedAchievements[achievement.category] = [];
        }
        categorizedAchievements[achievement.category].push(achievement);
      });

      res.json({
        success: true,
        data: {
          achievements: achievementsWithProgress,
          categorized: categorizedAchievements,
          categories: Object.keys(categorizedAchievements)
        }
      });

    } catch (error) {
      console.error('Get all achievements error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РћР±РЅРѕРІР»РµРЅРёРµ РїСЂРѕРіСЂРµСЃСЃР° РґРѕСЃС‚РёР¶РµРЅРёСЏ
  async updateProgress(req, res) {
    try {
      const { achievementName, increment = 1, metadata = {} } = req.body;
      const userId = req.user.id;

      const userAchievement = await UserAchievement.updateProgress(
        userId, 
        achievementName, 
        increment, 
        metadata
      );

      if (!userAchievement) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Р”РѕСЃС‚РёР¶РµРЅРёРµ РЅРµ РЅР°Р№РґРµРЅРѕ'
          }
        });
      }

      let message = 'РџСЂРѕРіСЂРµСЃСЃ РѕР±РЅРѕРІР»РµРЅ';
      if (userAchievement.isCompleted) {
        message = `Р”РѕСЃС‚РёР¶РµРЅРёРµ "${userAchievement.achievementId.title}" СЂР°Р·Р±Р»РѕРєРёСЂРѕРІР°РЅРѕ!`;
      }

      res.json({
        success: true,
        data: {
          userAchievement
        },
        message
      });

    } catch (error) {
      console.error('Update progress error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РЎРєСЂС‹С‚СЊ/РїРѕРєР°Р·Р°С‚СЊ РґРѕСЃС‚РёР¶РµРЅРёРµ
  async toggleAchievementVisibility(req, res) {
    try {
      const { achievementId } = req.params;
      const { isDisplayed } = req.body;
      const userId = req.user.id;

      const userAchievement = await UserAchievement.findOneAndUpdate(
        { userId, achievementId },
        { isDisplayed },
        { new: true }
      ).populate('achievementId');

      if (!userAchievement) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Р”РѕСЃС‚РёР¶РµРЅРёРµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РЅРµ РЅР°Р№РґРµРЅРѕ'
          }
        });
      }

      res.json({
        success: true,
        data: {
          userAchievement
        },
        message: `Р”РѕСЃС‚РёР¶РµРЅРёРµ ${isDisplayed ? 'РїРѕРєР°Р·Р°РЅРѕ' : 'СЃРєСЂС‹С‚Рѕ'}`
      });

    } catch (error) {
      console.error('Toggle achievement visibility error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ С‚РѕРїР° РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№ РїРѕ РґРѕСЃС‚РёР¶РµРЅРёСЏРј
  async getLeaderboard(req, res) {
    try {
      const { category, limit = 20 } = req.query;

      let matchStage = {};
      if (category) {
        const categoryAchievements = await Achievement.find({ 
          category, 
          isActive: true 
        }).select('_id');
        matchStage.achievementId = { 
          $in: categoryAchievements.map(a => a._id) 
        };
      }

      const leaderboard = await UserAchievement.aggregate([
        { $match: { isCompleted: true, ...matchStage } },
        {
          $lookup: {
            from: 'achievements',
            localField: 'achievementId',
            foreignField: '_id',
            as: 'achievement'
          }
        },
        { $unwind: '$achievement' },
        {
          $group: {
            _id: '$userId',
            totalPoints: { 
              $sum: '$achievement.rewards.points' 
            },
            completedAchievements: { $sum: 1 },
            lastUnlock: { $max: '$unlockedAt' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            userId: '$_id',
            username: '$user.username',
            avatar: '$user.avatar',
            totalPoints: 1,
            completedAchievements: 1,
            lastUnlock: 1
          }
        },
        { $sort: { totalPoints: -1, completedAchievements: -1 } },
        { $limit: parseInt(limit) }
      ]);

      res.json({
        success: true,
        data: {
          leaderboard,
          category: category || 'all'
        }
      });

    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // Р’СЃРїРѕРјРѕРіР°С‚РµР»СЊРЅС‹Р№ РјРµС‚РѕРґ РґР»СЏ СЂР°СЃС‡РµС‚Р° РїСЂРѕРіСЂРµСЃСЃР°
  async calculateProgress(achievement, userId, userStats) {
    const { type, target, field } = achievement.criteria;

    switch (type) {
      case 'count':
        return Math.min(userStats[field] || 0, target);
      
      case 'streak': {
        const recentWatches = await WatchList.find({ userId })
          .sort({ updatedAt: -1 })
          .limit(target);
        return recentWatches.length;
      }
      
      case 'diversity': {
        const uniqueGenres = await WatchList.aggregate([
          { $match: { userId: mongoose.Types.ObjectId(userId) } },
          { $lookup: { from: 'animes', localField: 'animeId', foreignField: '_id', as: 'anime' } },
          { $unwind: '$anime' },
          { $unwind: '$anime.genres' },
          { $group: { _id: '$anime.genres' } },
          { $count: 'uniqueGenres' }
        ]);
        return Math.min(uniqueGenres[0]?.uniqueGenres || 0, target);
      }
      
      case 'time':
        return Math.min(userStats[field] || 0, target);
      
      case 'rating':
        return userStats[field] >= target ? target : userStats[field] || 0;
      
      default:
        return null;
    }
  }
}

module.exports = new AchievementController();
