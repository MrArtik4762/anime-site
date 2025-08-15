const Anime = require('../models/Anime');
const WatchList = require('../models/WatchList');
const Comment = require('../models/Comment');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../shared/constants/constants');
const mongoose = require('mongoose');
// const anilibriaService = require('../services/anilibriaService'); // Временно отключен

class AnimeController {
  // РџРѕР»СѓС‡РµРЅРёРµ СЃРїРёСЃРєР° Р°РЅРёРјРµ СЃ С„РёР»СЊС‚СЂР°С†РёРµР№ Рё РїР°РіРёРЅР°С†РёРµР№
  async getAnimeList(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        genres,
        year,
        status,
        type,
        sort = 'rating.score',
        sortBy = 'rating.score',
        order = 'desc',
        sortOrder = 'desc',
        search
      } = req.query;

      // РџРѕСЃС‚СЂРѕРµРЅРёРµ С„РёР»СЊС‚СЂР° - СѓРїСЂРѕС‰РµРЅРЅР°СЏ РІРµСЂСЃРёСЏ РґР»СЏ С‚РµСЃС‚РёСЂРѕРІР°РЅРёСЏ
      const filter = {};

      if (genres) {
        const genreArray = Array.isArray(genres) ? genres : [genres];
        filter.genres = { $in: genreArray };
      }

      if (year) {
        filter.year = parseInt(year);
      }

      if (status) {
        filter.status = status;
      }

      if (type) {
        filter.type = type;
      }

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { titleEn: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // РџРѕСЃС‚СЂРѕРµРЅРёРµ СЃРѕСЂС‚РёСЂРѕРІРєРё - СѓРїСЂРѕС‰РµРЅРЅР°СЏ РІРµСЂСЃРёСЏ
      const finalSortBy = 'rating'; // СѓРїСЂРѕС‰РµРЅРѕ
      const finalSortOrder = sortOrder || order;
      const sortOrderValue = finalSortOrder === 'desc' ? -1 : 1;
      const sortObj = {};
      sortObj[finalSortBy] = sortOrderValue;

      // Р’С‹РїРѕР»РЅРµРЅРёРµ Р·Р°РїСЂРѕСЃР°
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [anime, total] = await Promise.all([
        Anime.find(filter)
          .select('title titleEn poster rating episodes status type year genres description videoUrl')
          .sort(sortObj)
          .skip(skip)
          .limit(parseInt(limit)),
        Anime.countDocuments(filter)
      ]);

      // Fallback РЅР° AniLibria РµСЃР»Рё Р±Р°Р·Р° РїСѓСЃС‚Р°
      if ((!anime || anime.length === 0) && !search) {
        try {
          const anilibriaResult = await anilibriaService.getPopular({ items_per_page: parseInt(limit), page: parseInt(page) });
          const list = anilibriaResult.list || [];
          return res.json({
            success: true,
            data: {
              anime: list.map(anilibriaService.convertToAnimeModel),
              pagination: {
                currentPage: parseInt(page),
                totalPages: 1,
                totalItems: list.length,
                itemsPerPage: parseInt(limit),
                hasNextPage: false,
                hasPrevPage: false
              }
            }
          });
        } catch (e) {
          // Р•СЃР»Рё Рё AniLibria РЅРµ РґРѕСЃС‚СѓРїРµРЅ вЂ” РІРѕР·РІСЂР°С‰Р°РµРј РѕС€РёР±РєСѓ
        }
      }

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          anime,
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
      console.error('Get anime list error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ РїРѕРїСѓР»СЏСЂРЅРѕРіРѕ Р°РЅРёРјРµ
  async getPopularAnime(req, res) {
    try {
      const { limit = 50 } = req.query;

      const anime = await Anime.getPopular(parseInt(limit));

      res.json({
        success: true,
        data: {
          anime
        }
      });

    } catch (error) {
      console.error('Get popular anime error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ С‚РѕРї СЂРµР№С‚РёРЅРіРѕРІРѕРіРѕ Р°РЅРёРјРµ
  async getTopRatedAnime(req, res) {
    try {
      const { limit = 50 } = req.query;

      const anime = await Anime.getTopRated(parseInt(limit));

      res.json({
        success: true,
        data: {
          anime
        }
      });

    } catch (error) {
      console.error('Get top rated anime error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ РЅРµРґР°РІРЅРѕ РґРѕР±Р°РІР»РµРЅРЅРѕРіРѕ Р°РЅРёРјРµ
  async getRecentAnime(req, res) {
    try {
      const { limit = 50 } = req.query;

      const anime = await Anime.getRecent(parseInt(limit));

      res.json({
        success: true,
        data: {
          anime
        }
      });

    } catch (error) {
      console.error('Get recent anime error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕРёСЃРє Р°РЅРёРјРµ
  async searchAnime(req, res) {
    try {
      const { q, limit = 20, page = 1 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РџРѕРёСЃРєРѕРІС‹Р№ Р·Р°РїСЂРѕСЃ РґРѕР»Р¶РµРЅ СЃРѕРґРµСЂР¶Р°С‚СЊ РјРёРЅРёРјСѓРј 2 СЃРёРјРІРѕР»Р°'
          }
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const anime = await Anime.searchByTitle(q.trim(), {
        limit: parseInt(limit),
        skip
      });

      res.json({
        success: true,
        data: {
          anime,
          query: q.trim()
        }
      });

    } catch (error) {
      console.error('Search anime error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ РґРµС‚Р°Р»РµР№ Р°РЅРёРјРµ
  async getAnimeDetails(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРІРµСЂРЅС‹Р№ ID Р°РЅРёРјРµ'
          }
        });
      }

      const anime = await Anime.findById(id)
        .populate('relations.animeId', 'title images rating')
        .populate('recommendations.animeId', 'title images rating');

      if (!anime || !anime.isActive || !anime.approved) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'РђРЅРёРјРµ РЅРµ РЅР°Р№РґРµРЅРѕ'
          }
        });
      }

      // РџРѕР»СѓС‡Р°РµРј СЃС‚Р°С‚РёСЃС‚РёРєСѓ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РґР»СЏ СЌС‚РѕРіРѕ Р°РЅРёРјРµ (РµСЃР»Рё Р°РІС‚РѕСЂРёР·РѕРІР°РЅ)
      let userStats = null;
      if (req.user) {
        userStats = await WatchList.findUserEntry(req.user.id, id);
      }

      // РџРѕР»СѓС‡Р°РµРј РєРѕР»РёС‡РµСЃС‚РІРѕ РєРѕРјРјРµРЅС‚Р°СЂРёРµРІ
      const commentsCount = await Comment.countDocuments({
        animeId: id,
        status: 'approved'
      });

      res.json({
        success: true,
        data: {
          anime,
          userStats,
          commentsCount
        }
      });

    } catch (error) {
      console.error('Get anime details error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ СЌРїРёР·РѕРґР° РїРѕ ID
  async getEpisodeById(req, res) {
    try {
      const { id, episodeId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРІРµСЂРЅС‹Р№ ID Р°РЅРёРјРµ'
          }
        });
      }

      const anime = await Anime.findById(id)
        .select('title videos episodes')
        .where({ isActive: true, approved: true });

      if (!anime) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'РђРЅРёРјРµ РЅРµ РЅР°Р№РґРµРЅРѕ'
          }
        });
      }

      // РќР°С…РѕРґРёРј СЌРїРёР·РѕРґ
      const episode = anime.videos.find(video => video.episode === parseInt(episodeId));

      if (!episode) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Р­РїРёР·РѕРґ РЅРµ РЅР°Р№РґРµРЅ'
          }
        });
      }

      res.json({
        success: true,
        data: {
          animeTitle: anime.title,
          totalEpisodes: anime.episodes,
          episode: {
            number: episode.episode,
            title: episode.title,
            duration: episode.duration,
            thumbnail: episode.thumbnail,
            videoUrl: episode.sources?.[0]?.url,
            sources: episode.sources,
            subtitles: episode.subtitles
          }
        }
      });

    } catch (error) {
      console.error('Get episode by ID error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ СЌРїРёР·РѕРґРѕРІ Р°РЅРёРјРµ
  async getAnimeEpisodes(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРІРµСЂРЅС‹Р№ ID Р°РЅРёРјРµ'
          }
        });
      }

      const anime = await Anime.findById(id)
        .select('title videos episodes')
        .where({ isActive: true, approved: true });

      if (!anime) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'РђРЅРёРјРµ РЅРµ РЅР°Р№РґРµРЅРѕ'
          }
        });
      }

      // РЎРѕСЂС‚РёСЂСѓРµРј СЌРїРёР·РѕРґС‹ РїРѕ РЅРѕРјРµСЂСѓ
      const episodes = anime.videos.sort((a, b) => a.episode - b.episode);

      res.json({
        success: true,
        data: {
          animeTitle: anime.title,
          totalEpisodes: anime.episodes,
          availableEpisodes: episodes.length,
          episodes: episodes.map(episode => ({
            episode: episode.episode,
            title: episode.title,
            thumbnail: episode.thumbnail,
            duration: episode.duration,
            hasVideo: episode.sources && episode.sources.length > 0,
            hasSubtitles: episode.subtitles && episode.subtitles.length > 0
          }))
        }
      });

    } catch (error) {
      console.error('Get anime episodes error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ СЃРІСЏР·Р°РЅРЅРѕРіРѕ Р°РЅРёРјРµ
  async getRelatedAnime(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРІРµСЂРЅС‹Р№ ID Р°РЅРёРјРµ'
          }
        });
      }

      const anime = await Anime.findById(id)
        .select('relations')
        .populate('relations.animeId', 'title images rating episodes status type')
        .where({ isActive: true, approved: true });

      if (!anime) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'РђРЅРёРјРµ РЅРµ РЅР°Р№РґРµРЅРѕ'
          }
        });
      }

      // Р¤РёР»СЊС‚СЂСѓРµРј С‚РѕР»СЊРєРѕ Р°РєС‚РёРІРЅС‹Рµ Рё РѕРґРѕР±СЂРµРЅРЅС‹Рµ СЃРІСЏР·Р°РЅРЅС‹Рµ Р°РЅРёРјРµ
      const relatedAnime = anime.relations.filter(relation => 
        relation.animeId && relation.animeId.isActive && relation.animeId.approved
      );

      res.json({
        success: true,
        data: {
          relatedAnime
        }
      });

    } catch (error) {
      console.error('Get related anime error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ СЂРµРєРѕРјРµРЅРґР°С†РёР№
  async getRecommendations(req, res) {
    try {
      const { id } = req.params;
      const { limit = 10 } = req.query;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРІРµСЂРЅС‹Р№ ID Р°РЅРёРјРµ'
          }
        });
      }

      const anime = await Anime.findById(id)
        .select('recommendations genres')
        .populate('recommendations.animeId', 'title images rating episodes status type')
        .where({ isActive: true, approved: true });

      if (!anime) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'РђРЅРёРјРµ РЅРµ РЅР°Р№РґРµРЅРѕ'
          }
        });
      }

      // РџРѕР»СѓС‡Р°РµРј СЂРµРєРѕРјРµРЅРґР°С†РёРё РёР· Р±Р°Р·С‹
      let recommendations = anime.recommendations
        .filter(rec => rec.animeId && rec.animeId.isActive && rec.animeId.approved)
        .sort((a, b) => b.votes - a.votes)
        .slice(0, parseInt(limit));

      // Р•СЃР»Рё СЂРµРєРѕРјРµРЅРґР°С†РёР№ РјР°Р»Рѕ, РґРѕР±Р°РІР»СЏРµРј РїРѕС…РѕР¶РёРµ РїРѕ Р¶Р°РЅСЂР°Рј
      if (recommendations.length < parseInt(limit) && anime.genres.length > 0) {
        const additionalCount = parseInt(limit) - recommendations.length;
        const existingIds = [id, ...recommendations.map(r => r.animeId._id)];

        const similarAnime = await Anime.find({
          _id: { $nin: existingIds },
          genres: { $in: anime.genres },
          isActive: true,
          approved: true
        })
        .select('title images rating episodes status type')
        .sort({ 'rating.score': -1 })
        .limit(additionalCount);

        // Р”РѕР±Р°РІР»СЏРµРј РїРѕС…РѕР¶РёРµ Р°РЅРёРјРµ РєР°Рє СЂРµРєРѕРјРµРЅРґР°С†РёРё
        const additionalRecs = similarAnime.map(similar => ({
          animeId: similar,
          votes: 0,
          type: 'similar'
        }));

        recommendations = [...recommendations, ...additionalRecs];
      }

      res.json({
        success: true,
        data: {
          recommendations
        }
      });

    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РћС†РµРЅРєР° Р°РЅРёРјРµ РїРѕР»СЊР·РѕРІР°С‚РµР»РµРј
  async rateAnime(req, res) {
    try {
      const { id } = req.params;
      const { rating } = req.body;
      const userId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРІРµСЂРЅС‹Р№ ID Р°РЅРёРјРµ'
          }
        });
      }

      if (!rating || rating < 1 || rating > 10 || !Number.isInteger(rating)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Р РµР№С‚РёРЅРі РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ С†РµР»С‹Рј С‡РёСЃР»РѕРј РѕС‚ 1 РґРѕ 10'
          }
        });
      }

      // РџСЂРѕРІРµСЂСЏРµРј СЃСѓС‰РµСЃС‚РІРѕРІР°РЅРёРµ Р°РЅРёРјРµ
      const anime = await Anime.findById(id).where({ isActive: true, approved: true });
      if (!anime) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'РђРЅРёРјРµ РЅРµ РЅР°Р№РґРµРЅРѕ'
          }
        });
      }

      // РћР±РЅРѕРІР»СЏРµРј РёР»Рё СЃРѕР·РґР°РµРј Р·Р°РїРёСЃСЊ РІ СЃРїРёСЃРєРµ РїСЂРѕСЃРјРѕС‚СЂР°
      let watchListEntry = await WatchList.findOne({ userId, animeId: id });
      
      if (watchListEntry) {
        watchListEntry.rating = rating;
        await watchListEntry.save();
      } else {
        watchListEntry = new WatchList({
          userId,
          animeId: id,
          status: 'planToWatch',
          rating
        });
        await watchListEntry.save();
      }

      // РћР±РЅРѕРІР»СЏРµРј СЃС‚Р°С‚РёСЃС‚РёРєСѓ Р°РЅРёРјРµ
      await anime.updateStatistics();

      res.json({
        success: true,
        data: {
          rating,
          watchListEntry
        },
        message: 'РћС†РµРЅРєР° СѓСЃРїРµС€РЅРѕ СЃРѕС…СЂР°РЅРµРЅР°'
      });

    } catch (error) {
      console.error('Rate anime error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ Р¶Р°РЅСЂРѕРІ
  async getGenres(req, res) {
    try {
      const genres = await Anime.distinct('genres', { 
        isActive: true, 
        approved: true 
      });

      // РџРѕРґСЃС‡РёС‚С‹РІР°РµРј РєРѕР»РёС‡РµСЃС‚РІРѕ Р°РЅРёРјРµ РґР»СЏ РєР°Р¶РґРѕРіРѕ Р¶Р°РЅСЂР°
      const genresWithCount = await Promise.all(
        genres.map(async (genre) => {
          const count = await Anime.countDocuments({
            genres: genre,
            isActive: true,
            approved: true
          });
          return { name: genre, count };
        })
      );

      // РЎРѕСЂС‚РёСЂСѓРµРј РїРѕ РїРѕРїСѓР»СЏСЂРЅРѕСЃС‚Рё
      genresWithCount.sort((a, b) => b.count - a.count);

      res.json({
        success: true,
        data: {
          genres: genresWithCount
        }
      });

    } catch (error) {
      console.error('Get genres error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РРјРїРѕСЂС‚ РїРѕРїСѓР»СЏСЂРЅС‹С… Р°РЅРёРјРµ РёР· AniLibria
  async importFromAnilibria(req, res) {
    try {
      const { limit = 50 } = req.query;
      // const imported = await anilibriaService.importPopularAnime(Number(limit));
      res.json({ success: true, imported });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new AnimeController();
