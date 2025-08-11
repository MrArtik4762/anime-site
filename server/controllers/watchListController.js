const WatchList = require('../models/WatchList');
const Anime = require('../models/Anime');
const { HTTP_STATUS, ERROR_MESSAGES } = require('/app/shared/constants/constants');
const mongoose = require('mongoose');

class WatchListController {
  // РџРѕР»СѓС‡РµРЅРёРµ СЃРїРёСЃРєР° РїСЂРѕСЃРјРѕС‚СЂР° РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
  async getWatchList(req, res) {
    try {
      const { status, page = 1, limit = 20, sort = 'lastWatched', order = 'desc' } = req.query;
      const userId = req.user.id;

      // РџРѕСЃС‚СЂРѕРµРЅРёРµ С„РёР»СЊС‚СЂР°
      const filter = { userId };
      if (status) {
        filter.status = status;
      }

      // РџРѕСЃС‚СЂРѕРµРЅРёРµ СЃРѕСЂС‚РёСЂРѕРІРєРё
      const sortOrder = order === 'desc' ? -1 : 1;
      const sortObj = {};
      sortObj[sort] = sortOrder;

      // Р’С‹РїРѕР»РЅРµРЅРёРµ Р·Р°РїСЂРѕСЃР°
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [watchList, total] = await Promise.all([
        WatchList.find(filter)
          .populate('animeId', 'title images rating episodes status type year genres')
          .sort(sortObj)
          .skip(skip)
          .limit(parseInt(limit)),
        WatchList.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          watchList,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: total,
            itemsPerPage: parseInt(limit),
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      console.error('Get watch list error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // Р”РѕР±Р°РІР»РµРЅРёРµ Р°РЅРёРјРµ РІ СЃРїРёСЃРѕРє РїСЂРѕСЃРјРѕС‚СЂР°
  async addToWatchList(req, res) {
    try {
      const { animeId } = req.params;
      const { status, rating, notes, priority, isPrivate } = req.body;
      const userId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(animeId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРІРµСЂРЅС‹Р№ ID Р°РЅРёРјРµ'
          }
        });
      }

      // РџСЂРѕРІРµСЂСЏРµРј СЃСѓС‰РµСЃС‚РІРѕРІР°РЅРёРµ Р°РЅРёРјРµ
      const anime = await Anime.findById(animeId).where({ isActive: true, approved: true });
      if (!anime) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'РђРЅРёРјРµ РЅРµ РЅР°Р№РґРµРЅРѕ'
          }
        });
      }

      // РџСЂРѕРІРµСЂСЏРµРј, РЅРµ РґРѕР±Р°РІР»РµРЅРѕ Р»Рё СѓР¶Рµ Р°РЅРёРјРµ РІ СЃРїРёСЃРѕРє
      const existingEntry = await WatchList.findOne({ userId, animeId });
      if (existingEntry) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РђРЅРёРјРµ СѓР¶Рµ РґРѕР±Р°РІР»РµРЅРѕ РІ СЃРїРёСЃРѕРє РїСЂРѕСЃРјРѕС‚СЂР°'
          }
        });
      }

      // РЎРѕР·РґР°РµРј РЅРѕРІСѓСЋ Р·Р°РїРёСЃСЊ
      const watchListEntry = new WatchList({
        userId,
        animeId,
        status,
        rating,
        notes,
        priority,
        isPrivate,
        startDate: status === 'watching' ? new Date() : undefined
      });

      await watchListEntry.save();

      // Р—Р°РїРѕР»РЅСЏРµРј РґР°РЅРЅС‹Рµ Р°РЅРёРјРµ РґР»СЏ РѕС‚РІРµС‚Р°
      await watchListEntry.populate('animeId', 'title images rating episodes status type');

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: {
          watchListEntry
        },
        message: 'РђРЅРёРјРµ РґРѕР±Р°РІР»РµРЅРѕ РІ СЃРїРёСЃРѕРє РїСЂРѕСЃРјРѕС‚СЂР°'
      });

    } catch (error) {
      console.error('Add to watch list error:', error);
      
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

  // РћР±РЅРѕРІР»РµРЅРёРµ Р·Р°РїРёСЃРё РІ СЃРїРёСЃРєРµ РїСЂРѕСЃРјРѕС‚СЂР°
  async updateWatchListEntry(req, res) {
    try {
      const { id } = req.params;
      const { status, rating, notes, priority, isPrivate } = req.body;
      const userId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРІРµСЂРЅС‹Р№ ID Р·Р°РїРёСЃРё'
          }
        });
      }

      // РќР°С…РѕРґРёРј Р·Р°РїРёСЃСЊ
      const watchListEntry = await WatchList.findOne({ _id: id, userId });
      if (!watchListEntry) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Р—Р°РїРёСЃСЊ РЅРµ РЅР°Р№РґРµРЅР°'
          }
        });
      }

      // РћР±РЅРѕРІР»СЏРµРј РїРѕР»СЏ
      const updateData = {};
      if (status !== undefined) {
        updateData.status = status;
        
        // РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРё СѓСЃС‚Р°РЅР°РІР»РёРІР°РµРј РґР°С‚С‹
        if (status === 'watching' && !watchListEntry.startDate) {
          updateData.startDate = new Date();
        }
        if (status === 'completed' && !watchListEntry.finishDate) {
          updateData.finishDate = new Date();
        }
      }
      
      if (rating !== undefined) updateData.rating = rating;
      if (notes !== undefined) updateData.notes = notes;
      if (priority !== undefined) updateData.priority = priority;
      if (isPrivate !== undefined) updateData.isPrivate = isPrivate;

      const updatedEntry = await WatchList.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('animeId', 'title images rating episodes status type');

      res.json({
        success: true,
        data: {
          watchListEntry: updatedEntry
        },
        message: 'Р—Р°РїРёСЃСЊ СѓСЃРїРµС€РЅРѕ РѕР±РЅРѕРІР»РµРЅР°'
      });

    } catch (error) {
      console.error('Update watch list entry error:', error);
      
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

  // РЈРґР°Р»РµРЅРёРµ РёР· СЃРїРёСЃРєР° РїСЂРѕСЃРјРѕС‚СЂР°
  async removeFromWatchList(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРІРµСЂРЅС‹Р№ ID Р·Р°РїРёСЃРё'
          }
        });
      }

      // РќР°С…РѕРґРёРј Рё СѓРґР°Р»СЏРµРј Р·Р°РїРёСЃСЊ
      const watchListEntry = await WatchList.findOneAndDelete({ _id: id, userId });
      if (!watchListEntry) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Р—Р°РїРёСЃСЊ РЅРµ РЅР°Р№РґРµРЅР°'
          }
        });
      }

      res.json({
        success: true,
        message: 'РђРЅРёРјРµ СѓРґР°Р»РµРЅРѕ РёР· СЃРїРёСЃРєР° РїСЂРѕСЃРјРѕС‚СЂР°'
      });

    } catch (error) {
      console.error('Remove from watch list error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РћР±РЅРѕРІР»РµРЅРёРµ РїСЂРѕРіСЂРµСЃСЃР° РїСЂРѕСЃРјРѕС‚СЂР°
  async updateProgress(req, res) {
    try {
      const { id } = req.params;
      const { episodesWatched, timeWatched } = req.body;
      const userId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРІРµСЂРЅС‹Р№ ID Р·Р°РїРёСЃРё'
          }
        });
      }

      // РќР°С…РѕРґРёРј Р·Р°РїРёСЃСЊ
      const watchListEntry = await WatchList.findOne({ _id: id, userId })
        .populate('animeId', 'episodes');
        
      if (!watchListEntry) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Р—Р°РїРёСЃСЊ РЅРµ РЅР°Р№РґРµРЅР°'
          }
        });
      }

      // РћР±РЅРѕРІР»СЏРµРј РїСЂРѕРіСЂРµСЃСЃ
      await watchListEntry.updateProgress(episodesWatched, timeWatched);

      res.json({
        success: true,
        data: {
          watchListEntry
        },
        message: 'РџСЂРѕРіСЂРµСЃСЃ РѕР±РЅРѕРІР»РµРЅ'
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

  // РџРѕР»СѓС‡РµРЅРёРµ СЃС‚Р°С‚РёСЃС‚РёРєРё СЃРїРёСЃРєР° РїСЂРѕСЃРјРѕС‚СЂР°
  async getWatchListStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await WatchList.getUserStats(userId);

      res.json({
        success: true,
        data: {
          statistics: stats
        }
      });

    } catch (error) {
      console.error('Get watch list stats error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ Р·Р°РїРёСЃРё РїРѕ Р°РЅРёРјРµ
  async getWatchListEntry(req, res) {
    try {
      const { animeId } = req.params;
      const userId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(animeId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРІРµСЂРЅС‹Р№ ID Р°РЅРёРјРµ'
          }
        });
      }

      const watchListEntry = await WatchList.findUserEntry(userId, animeId);

      if (!watchListEntry) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Р—Р°РїРёСЃСЊ РЅРµ РЅР°Р№РґРµРЅР°'
          }
        });
      }

      res.json({
        success: true,
        data: {
          watchListEntry
        }
      });

    } catch (error) {
      console.error('Get watch list entry error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РњР°СЃСЃРѕРІРѕРµ РѕР±РЅРѕРІР»РµРЅРёРµ СЃС‚Р°С‚СѓСЃР°
  async bulkUpdateStatus(req, res) {
    try {
      const { entryIds, status } = req.body;
      const userId = req.user.id;

      if (!Array.isArray(entryIds) || entryIds.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРѕР±С…РѕРґРёРјРѕ СѓРєР°Р·Р°С‚СЊ ID Р·Р°РїРёСЃРµР№'
          }
        });
      }

      // РџСЂРѕРІРµСЂСЏРµРј РІР°Р»РёРґРЅРѕСЃС‚СЊ ID
      const validIds = entryIds.filter(id => mongoose.Types.ObjectId.isValid(id));
      if (validIds.length !== entryIds.length) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРєРѕСЂСЂРµРєС‚РЅС‹Рµ ID Р·Р°РїРёСЃРµР№'
          }
        });
      }

      // РћР±РЅРѕРІР»СЏРµРј Р·Р°РїРёСЃРё
      const updateData = { status };
      if (status === 'watching') {
        updateData.startDate = new Date();
      } else if (status === 'completed') {
        updateData.finishDate = new Date();
      }

      const result = await WatchList.updateMany(
        { 
          _id: { $in: validIds },
          userId 
        },
        updateData
      );

      res.json({
        success: true,
        data: {
          updatedCount: result.modifiedCount
        },
        message: `РћР±РЅРѕРІР»РµРЅРѕ Р·Р°РїРёСЃРµР№: ${result.modifiedCount}`
      });

    } catch (error) {
      console.error('Bulk update status error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // Р­РєСЃРїРѕСЂС‚ СЃРїРёСЃРєР° РїСЂРѕСЃРјРѕС‚СЂР°
  async exportWatchList(req, res) {
    try {
      const userId = req.user.id;
      const { format = 'json' } = req.query;

      const watchList = await WatchList.find({ userId })
        .populate('animeId', 'title episodes year genres rating')
        .sort({ updatedAt: -1 });

      if (format === 'csv') {
        // Р“РµРЅРµСЂРёСЂСѓРµРј CSV
        const csvHeader = 'Title,Status,Rating,Episodes Watched,Start Date,Finish Date,Notes\n';
        const csvRows = watchList.map(entry => {
          const anime = entry.animeId;
          return [
            `"${anime.title.english || anime.title.romaji}"`,
            entry.status,
            entry.rating || '',
            entry.progress.episodesWatched,
            entry.startDate ? entry.startDate.toISOString().split('T')[0] : '',
            entry.finishDate ? entry.finishDate.toISOString().split('T')[0] : '',
            `"${entry.notes || ''}"`
          ].join(',');
        }).join('\n');

        const csvContent = csvHeader + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="watchlist.csv"');
        res.send(csvContent);
      } else {
        // JSON С„РѕСЂРјР°С‚
        res.json({
          success: true,
          data: {
            watchList,
            exportDate: new Date().toISOString(),
            totalEntries: watchList.length
          }
        });
      }

    } catch (error) {
      console.error('Export watch list error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }
}

module.exports = new WatchListController();
