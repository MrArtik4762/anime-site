const AnimeLiberty = require('../models/AnimeLiberty');
const anilibertyService = require('../services/anilibertyService');
const { HTTP_STATUS, ERROR_MESSAGES } = require('/app/shared/constants/constants');

/**
 * РљРѕРЅС‚СЂРѕР»Р»РµСЂ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ AniLiberty API
 * РћР±РµСЃРїРµС‡РёРІР°РµС‚ РїРѕР»СѓС‡РµРЅРёРµ РґР°РЅРЅС‹С… РѕР± Р°РЅРёРјРµ С‡РµСЂРµР· AniLiberty СЃРµСЂРІРёСЃ
 * СЃ РєСЌС€РёСЂРѕРІР°РЅРёРµРј РІ Р»РѕРєР°Р»СЊРЅРѕР№ Р±Р°Р·Рµ РґР°РЅРЅС‹С…
 * @class AnilibertyController
 */
class AnilibertyController {
  /**
   * РџРѕР»СѓС‡РµРЅРёРµ РїРѕРїСѓР»СЏСЂРЅС‹С… Р°РЅРёРјРµ
   * @param {Object} req - РѕР±СЉРµРєС‚ Р·Р°РїСЂРѕСЃР° Express
   * @param {Object} req.query - РїР°СЂР°РјРµС‚СЂС‹ Р·Р°РїСЂРѕСЃР°
   * @param {number} [req.query.limit=10] - РєРѕР»РёС‡РµСЃС‚РІРѕ СЂРµР·СѓР»СЊС‚Р°С‚РѕРІ
   * @param {Object} res - РѕР±СЉРµРєС‚ РѕС‚РІРµС‚Р° Express
   * @returns {Promise<void>}
   */
  async getPopularAnime(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;

      // РЎРЅР°С‡Р°Р»Р° РїС‹С‚Р°РµРјСЃСЏ РїРѕР»СѓС‡РёС‚СЊ РёР· Р»РѕРєР°Р»СЊРЅРѕР№ Р±Р°Р·С‹ РґР°РЅРЅС‹С…
      console.log('Fetching popular anime from cache...');
      const cachedAnime = await AnimeLiberty.getPopular(limit);
      console.log('Cached anime count:', cachedAnime ? cachedAnime.length : 0);

      if (cachedAnime && cachedAnime.length > 0) {
        return res.json({
          success: true,
          data: cachedAnime,
          source: 'cache',
          pagination: {
            total: cachedAnime.length,
            page: 1,
            perPage: limit
          }
        });
      }

      // Р•СЃР»Рё РєРµС€Р° РЅРµС‚, РїС‹С‚Р°РµРјСЃСЏ РїРѕР»СѓС‡РёС‚СЊ РѕС‚ AniLiberty API
      console.log('Fetching from AniLiberty API...');
      const result = await anilibertyService.getPopularAnime(limit);
      console.log('API result:', result);

      if (result.success && result.data && result.data.length > 0) {
        // РЎРѕС…СЂР°РЅСЏРµРј РІ РєРµС€
        const savedAnime = await this.cacheAnimeList(result.data);

        return res.json({
          success: true,
          data: savedAnime,
          source: 'api',
          pagination: result.pagination
        });
      }

      // Р’РѕР·РІСЂР°С‰Р°РµРј РїСѓСЃС‚РѕР№ РјР°СЃСЃРёРІ, РµСЃР»Рё РґР°РЅРЅС‹С… РЅРµС‚
      return res.json({
        success: true,
        data: [],
        source: 'empty',
        message: 'РќРµС‚ РґРѕСЃС‚СѓРїРЅС‹С… РґР°РЅРЅС‹С…',
        pagination: {
          total: 0,
          page: 1,
          perPage: limit
        }
      });

    } catch (error) {
      console.error('Error in getPopularAnime:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR,
          details: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РїРѕРїСѓР»СЏСЂРЅС‹С… Р°РЅРёРјРµ'
        }
      });
    }
  }

  /**
   * РџРѕР»СѓС‡РµРЅРёРµ РЅРѕРІС‹С… СЌРїРёР·РѕРґРѕРІ
   * @param {Object} req - РѕР±СЉРµРєС‚ Р·Р°РїСЂРѕСЃР° Express
   * @param {Object} req.query - РїР°СЂР°РјРµС‚СЂС‹ Р·Р°РїСЂРѕСЃР°
   * @param {number} [req.query.limit=15] - РєРѕР»РёС‡РµСЃС‚РІРѕ СЂРµР·СѓР»СЊС‚Р°С‚РѕРІ
   * @param {Object} res - РѕР±СЉРµРєС‚ РѕС‚РІРµС‚Р° Express
   * @returns {Promise<void>}
   */
  async getNewEpisodes(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 15;

      // РЎРЅР°С‡Р°Р»Р° РїС‹С‚Р°РµРјСЃСЏ РїРѕР»СѓС‡РёС‚СЊ РёР· Р»РѕРєР°Р»СЊРЅРѕР№ Р±Р°Р·С‹ РґР°РЅРЅС‹С…
      const cachedAnime = await AnimeLiberty.getNewEpisodes(limit);

      if (cachedAnime && cachedAnime.length > 0) {
        return res.json({
          success: true,
          data: cachedAnime,
          source: 'cache',
          pagination: {
            total: cachedAnime.length,
            page: 1,
            perPage: limit
          }
        });
      }

      // Р•СЃР»Рё РєРµС€Р° РЅРµС‚, РїС‹С‚Р°РµРјСЃСЏ РїРѕР»СѓС‡РёС‚СЊ РѕС‚ AniLiberty API
      const result = await anilibertyService.getNewEpisodes(limit);

      if (result.success && result.data.length > 0) {
        // РЎРѕС…СЂР°РЅСЏРµРј РІ РєРµС€
        const savedAnime = await this.cacheAnimeList(result.data);

        return res.json({
          success: true,
          data: savedAnime,
          source: 'api',
          pagination: result.pagination
        });
      }

      // Р’РѕР·РІСЂР°С‰Р°РµРј РѕС€РёР±РєСѓ РµСЃР»Рё РЅРµ СѓРґР°Р»РѕСЃСЊ РїРѕР»СѓС‡РёС‚СЊ РґР°РЅРЅС‹Рµ
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: result.error || 'РќРµ СѓРґР°Р»РѕСЃСЊ РїРѕР»СѓС‡РёС‚СЊ РЅРѕРІС‹Рµ СЌРїРёР·РѕРґС‹',
          details: 'РџРѕРїСЂРѕР±СѓР№С‚Рµ РїРѕР·Р¶Рµ'
        }
      });

    } catch (error) {
      console.error('Error in getNewEpisodes:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR,
          details: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РЅРѕРІС‹С… СЌРїРёР·РѕРґРѕРІ'
        }
      });
    }
  }

  /**
   * РџРѕР»СѓС‡РµРЅРёРµ РґРµС‚Р°Р»РµР№ Р°РЅРёРјРµ РїРѕ ID
   * @param {Object} req - РѕР±СЉРµРєС‚ Р·Р°РїСЂРѕСЃР° Express
   * @param {Object} req.params - РїР°СЂР°РјРµС‚СЂС‹ РјР°СЂС€СЂСѓС‚Р°
   * @param {string} req.params.id - ID Р°РЅРёРјРµ РІ СЃРёСЃС‚РµРјРµ AniLiberty
   * @param {Object} res - РѕР±СЉРµРєС‚ РѕС‚РІРµС‚Р° Express
   * @returns {Promise<void>}
   */
  async getAnimeDetails(req, res) {
    try {
      const { id } = req.params;
      const anilibertyId = parseInt(id);

      if (!anilibertyId || isNaN(anilibertyId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РќРµРєРѕСЂСЂРµРєС‚РЅС‹Р№ ID Р°РЅРёРјРµ',
            details: 'ID Р°РЅРёРјРµ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ С‡РёСЃР»РѕРј'
          }
        });
      }

      // РЎРЅР°С‡Р°Р»Р° РёС‰РµРј РІ Р»РѕРєР°Р»СЊРЅРѕР№ Р±Р°Р·Рµ РґР°РЅРЅС‹С…
      let anime = await AnimeLiberty.findByAnilibertyId(anilibertyId);

      if (anime) {
        return res.json({
          success: true,
          data: anime,
          source: 'cache'
        });
      }

      // Р•СЃР»Рё РЅРµ РЅР°Р№РґРµРЅРѕ РІ РєРµС€Рµ, Р·Р°РїСЂР°С€РёРІР°РµРј Сѓ AniLiberty API
      const result = await anilibertyService.getAnimeDetails(anilibertyId);

      if (result.success && result.data) {
        // РљРѕРЅРІРµСЂС‚РёСЂСѓРµРј Рё СЃРѕС…СЂР°РЅСЏРµРј РІ РєРµС€
        const convertedData = anilibertyService.convertToAnimeModel(result.data);
        anime = new AnimeLiberty(convertedData);
        await anime.save();

        return res.json({
          success: true,
          data: anime,
          source: 'api'
        });
      }

      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          message: result.error || 'РђРЅРёРјРµ РЅРµ РЅР°Р№РґРµРЅРѕ',
          details: 'РђРЅРёРјРµ СЃ СѓРєР°Р·Р°РЅРЅС‹Рј ID РЅРµ СЃСѓС‰РµСЃС‚РІСѓРµС‚'
        }
      });

    } catch (error) {
      console.error('Error in getAnimeDetails:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR,
          details: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РґРµС‚Р°Р»РµР№ Р°РЅРёРјРµ'
        }
      });
    }
  }

  /**
   * РџРѕР»СѓС‡РµРЅРёРµ РґР°РЅРЅС‹С… СЌРїРёР·РѕРґР°
   * @param {Object} req - РѕР±СЉРµРєС‚ Р·Р°РїСЂРѕСЃР° Express
   * @param {Object} req.params - РїР°СЂР°РјРµС‚СЂС‹ РјР°СЂС€СЂСѓС‚Р°
   * @param {string} req.params.id - ID СЌРїРёР·РѕРґР° РІ СЃРёСЃС‚РµРјРµ AniLiberty
   * @param {Object} res - РѕР±СЉРµРєС‚ РѕС‚РІРµС‚Р° Express
   * @returns {Promise<void>}
   */
  async getEpisodeData(req, res) {
    try {
      const { id } = req.params;
      const episodeId = parseInt(id);

      if (!episodeId || isNaN(episodeId)) {
        return res.status(400).json({
          success: false,
          error: 'РќРµРєРѕСЂСЂРµРєС‚РЅС‹Р№ ID СЌРїРёР·РѕРґР°',
          message: 'ID СЌРїРёР·РѕРґР° РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ С‡РёСЃР»РѕРј'
        });
      }

      // Р—Р°РїСЂР°С€РёРІР°РµРј РґР°РЅРЅС‹Рµ СЌРїРёР·РѕРґР° Сѓ AniLiberty API
      const result = await anilibertyService.getEpisodeData(episodeId);

      if (result.success && result.data) {
        return res.json({
          success: true,
          data: result.data
        });
      }

      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          message: result.error || 'Р­РїРёР·РѕРґ РЅРµ РЅР°Р№РґРµРЅ',
          details: 'Р­РїРёР·РѕРґ СЃ СѓРєР°Р·Р°РЅРЅС‹Рј ID РЅРµ СЃСѓС‰РµСЃС‚РІСѓРµС‚'
        }
      });

    } catch (error) {
      console.error('Error in getEpisodeData:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR,
          details: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РґР°РЅРЅС‹С… СЌРїРёР·РѕРґР°'
        }
      });
    }
  }

  /**
   * РџРѕРёСЃРє Р°РЅРёРјРµ РїРѕ РЅР°Р·РІР°РЅРёСЋ
   * @param {Object} req - РѕР±СЉРµРєС‚ Р·Р°РїСЂРѕСЃР° Express
   * @param {Object} req.query - РїР°СЂР°РјРµС‚СЂС‹ Р·Р°РїСЂРѕСЃР°
   * @param {string} req.query.query - РїРѕРёСЃРєРѕРІС‹Р№ Р·Р°РїСЂРѕСЃ
   * @param {number} [req.query.limit=20] - РєРѕР»РёС‡РµСЃС‚РІРѕ СЂРµР·СѓР»СЊС‚Р°С‚РѕРІ
   * @param {Object} res - РѕР±СЉРµРєС‚ РѕС‚РІРµС‚Р° Express
   * @returns {Promise<void>}
   */
  async searchAnime(req, res) {
    try {
      const { query, limit } = req.query;

      if (!query || query.trim().length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'РџРѕРёСЃРєРѕРІС‹Р№ Р·Р°РїСЂРѕСЃ РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ РїСѓСЃС‚С‹Рј',
            details: 'Р’РІРµРґРёС‚Рµ РЅР°Р·РІР°РЅРёРµ Р°РЅРёРјРµ РґР»СЏ РїРѕРёСЃРєР°'
          }
        });
      }

      const searchLimit = parseInt(limit) || 20;

      // РЎРЅР°С‡Р°Р»Р° РёС‰РµРј РІ Р»РѕРєР°Р»СЊРЅРѕР№ Р±Р°Р·Рµ РґР°РЅРЅС‹С…
      const cachedResults = await AnimeLiberty.searchByTitle(query.trim(), { limit: searchLimit });

      if (cachedResults && cachedResults.length > 0) {
        return res.json({
          success: true,
          data: cachedResults,
          source: 'cache',
          pagination: {
            total: cachedResults.length,
            page: 1,
            perPage: searchLimit
          }
        });
      }

      // Р•СЃР»Рё РІ РєРµС€Рµ РЅРёС‡РµРіРѕ РЅРµ РЅР°Р№РґРµРЅРѕ, РёС‰РµРј С‡РµСЂРµР· API
      const result = await anilibertyService.searchAnime(query.trim(), searchLimit);

      if (result.success && result.data.length > 0) {
        // РЎРѕС…СЂР°РЅСЏРµРј СЂРµР·СѓР»СЊС‚Р°С‚С‹ РІ РєРµС€
        const savedAnime = await this.cacheAnimeList(result.data);

        return res.json({
          success: true,
          data: savedAnime,
          source: 'api',
          pagination: result.pagination
        });
      }

      return res.json({
        success: true,
        data: [],
        message: 'РџРѕ РІР°С€РµРјСѓ Р·Р°РїСЂРѕСЃСѓ РЅРёС‡РµРіРѕ РЅРµ РЅР°Р№РґРµРЅРѕ',
        pagination: {
          total: 0,
          page: 1,
          perPage: searchLimit
        }
      });

    } catch (error) {
      console.error('Error in searchAnime:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR,
          details: 'РћС€РёР±РєР° РїРѕРёСЃРєР° Р°РЅРёРјРµ'
        }
      });
    }
  }

  /**
   * РџРѕР»СѓС‡РµРЅРёРµ РєР°С‚Р°Р»РѕРіР° Р°РЅРёРјРµ СЃ С„РёР»СЊС‚СЂР°С†РёРµР№
   * @param {Object} req - РѕР±СЉРµРєС‚ Р·Р°РїСЂРѕСЃР° Express
   * @param {Object} req.query - РїР°СЂР°РјРµС‚СЂС‹ Р·Р°РїСЂРѕСЃР°
   * @param {number} [req.query.page=1] - РЅРѕРјРµСЂ СЃС‚СЂР°РЅРёС†С‹
   * @param {number} [req.query.limit=20] - РєРѕР»РёС‡РµСЃС‚РІРѕ СЌР»РµРјРµРЅС‚РѕРІ РЅР° СЃС‚СЂР°РЅРёС†Рµ
   * @param {string} [req.query.genres] - С„РёР»СЊС‚СЂ РїРѕ Р¶Р°РЅСЂР°Рј (С‡РµСЂРµР· Р·Р°РїСЏС‚СѓСЋ)
   * @param {number} [req.query.year] - С„РёР»СЊС‚СЂ РїРѕ РіРѕРґСѓ РІС‹РїСѓСЃРєР°
   * @param {string} [req.query.season] - С„РёР»СЊС‚СЂ РїРѕ СЃРµР·РѕРЅСѓ
   * @param {string} [req.query.status] - С„РёР»СЊС‚СЂ РїРѕ СЃС‚Р°С‚СѓСЃСѓ
   * @param {string} [req.query.type] - С„РёР»СЊС‚СЂ РїРѕ С‚РёРїСѓ
   * @param {string} [req.query.orderBy='updated_at'] - РїРѕР»Рµ РґР»СЏ СЃРѕСЂС‚РёСЂРѕРІРєРё
   * @param {string} [req.query.sort='desc'] - РЅР°РїСЂР°РІР»РµРЅРёРµ СЃРѕСЂС‚РёСЂРѕРІРєРё
   * @param {Object} res - РѕР±СЉРµРєС‚ РѕС‚РІРµС‚Р° Express
   * @returns {Promise<void>}
   */
  async getCatalog(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        genres,
        year,
        season,
        status,
        type,
        orderBy = 'updated_at',
        sort = 'desc'
      } = req.query;

      const options = {
        page: parseInt(page),
        perPage: parseInt(limit),
        sort: { [orderBy]: sort === 'asc' ? 1 : -1 }
      };

      if (genres) {
        options.genres = genres.split(',').map(g => g.trim()).filter(Boolean);
      }
      if (year) options.year = parseInt(year);
      if (season) options.season = season;
      if (status) options.status = status;
      if (type) options.type = type;

      // РџРѕР»СѓС‡Р°РµРј РёР· Р»РѕРєР°Р»СЊРЅРѕР№ Р±Р°Р·С‹ РґР°РЅРЅС‹С…
      const catalogAnime = await AnimeLiberty.getCatalog(options);

      // РџРѕРґСЃС‡РёС‚С‹РІР°РµРј РѕР±С‰РµРµ РєРѕР»РёС‡РµСЃС‚РІРѕ РґР»СЏ РїР°РіРёРЅР°С†РёРё
      const totalQuery = { isActive: true, approved: true };
      if (options.genres) totalQuery.genres = { $in: options.genres };
      if (options.year) totalQuery.year = options.year;
      if (options.season) totalQuery.season = options.season;
      if (options.status) totalQuery.status = options.status;
      if (options.type) totalQuery.type = options.type;

      const total = await AnimeLiberty.countDocuments(totalQuery);

      return res.json({
        success: true,
        data: catalogAnime,
        source: 'cache',
        pagination: {
          total,
          page: parseInt(page),
          perPage: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Error in getCatalog:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR,
          details: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РєР°С‚Р°Р»РѕРіР°'
        }
      });
    }
  }

  /**
   * РџРѕР»СѓС‡РµРЅРёРµ СЃРїРёСЃРєР° РґРѕСЃС‚СѓРїРЅС‹С… Р¶Р°РЅСЂРѕРІ
   * @param {Object} req - РѕР±СЉРµРєС‚ Р·Р°РїСЂРѕСЃР° Express
   * @param {Object} res - РѕР±СЉРµРєС‚ РѕС‚РІРµС‚Р° Express
   * @returns {Promise<void>}
   */
  async getGenres(req, res) {
    try {
      // РЎРЅР°С‡Р°Р»Р° РїС‹С‚Р°РµРјСЃСЏ РїРѕР»СѓС‡РёС‚СЊ СѓРЅРёРєР°Р»СЊРЅС‹Рµ Р¶Р°РЅСЂС‹ РёР· Р»РѕРєР°Р»СЊРЅРѕР№ Р±Р°Р·С‹
      const localGenres = await AnimeLiberty.distinct('genres', { isActive: true });

      if (localGenres && localGenres.length > 0) {
        return res.json({
          success: true,
          data: localGenres.sort(),
          source: 'cache'
        });
      }

      // Р•СЃР»Рё Р»РѕРєР°Р»СЊРЅС‹С… Р¶Р°РЅСЂРѕРІ РЅРµС‚, Р·Р°РїСЂР°С€РёРІР°РµРј Сѓ API
      const result = await anilibertyService.getGenres();

      if (result.success) {
        return res.json({
          success: true,
          data: result.data,
          source: 'api'
        });
      }

      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: result.error || 'РќРµ СѓРґР°Р»РѕСЃСЊ РїРѕР»СѓС‡РёС‚СЊ Р¶Р°РЅСЂС‹',
          details: 'РџРѕРїСЂРѕР±СѓР№С‚Рµ РїРѕР·Р¶Рµ'
        }
      });

    } catch (error) {
      console.error('Error in getGenres:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR,
          details: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ Р¶Р°РЅСЂРѕРІ'
        }
      });
    }
  }

  /**
   * Р’СЃРїРѕРјРѕРіР°С‚РµР»СЊРЅС‹Р№ РјРµС‚РѕРґ РґР»СЏ РєРµС€РёСЂРѕРІР°РЅРёСЏ СЃРїРёСЃРєР° Р°РЅРёРјРµ РІ Р»РѕРєР°Р»СЊРЅРѕР№ Р±Р°Р·Рµ РґР°РЅРЅС‹С…
   * @param {Array} animeList - РјР°СЃСЃРёРІ РґР°РЅРЅС‹С… Р°РЅРёРјРµ РѕС‚ AniLiberty API
   * @returns {Promise<Array>} РјР°СЃСЃРёРІ СЃРѕС…СЂР°РЅРµРЅРЅС‹С… РѕР±СЉРµРєС‚РѕРІ Р°РЅРёРјРµ
   * @private
   */
  async cacheAnimeList(animeList) {
    const savedAnime = [];

    for (const animeData of animeList) {
      try {
        const convertedData = anilibertyService.convertToAnimeModel(animeData);

        // РџСЂРѕРІРµСЂСЏРµРј, СЃСѓС‰РµСЃС‚РІСѓРµС‚ Р»Рё СѓР¶Рµ С‚Р°РєРѕРµ Р°РЅРёРјРµ
        let existingAnime = await AnimeLiberty.findByAnilibertyId(convertedData.anilibertyId);

        if (existingAnime) {
          // РћР±РЅРѕРІР»СЏРµРј СЃСѓС‰РµСЃС‚РІСѓСЋС‰РµРµ Р°РЅРёРјРµ
          Object.assign(existingAnime, convertedData);
          existingAnime.lastSynced = new Date();
          await existingAnime.save();
          savedAnime.push(existingAnime);
        } else {
          // РЎРѕР·РґР°РµРј РЅРѕРІРѕРµ Р°РЅРёРјРµ
          const newAnime = new AnimeLiberty(convertedData);
          await newAnime.save();
          savedAnime.push(newAnime);
        }
      } catch (error) {
        console.error('Error caching anime:', error);
        // РџСЂРѕРїСѓСЃРєР°РµРј РїСЂРѕР±Р»РµРјРЅС‹Рµ Р·Р°РїРёСЃРё, РЅРѕ РїСЂРѕРґРѕР»Р¶Р°РµРј РѕР±СЂР°Р±РѕС‚РєСѓ
      }
    }

    return savedAnime;
  }

  /**
   * РЎРёРЅС…СЂРѕРЅРёР·Р°С†РёСЏ РґР°РЅРЅС‹С… СЃ AniLiberty API
   * @param {Object} req - РѕР±СЉРµРєС‚ Р·Р°РїСЂРѕСЃР° Express
   * @param {Object} req.query - РїР°СЂР°РјРµС‚СЂС‹ Р·Р°РїСЂРѕСЃР°
   * @param {string} [req.query.type='popular'] - С‚РёРї СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёРё ('popular' РёР»Рё 'new-episodes')
   * @param {number} [req.query.limit=50] - РєРѕР»РёС‡РµСЃС‚РІРѕ СЌР»РµРјРµРЅС‚РѕРІ РґР»СЏ СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёРё
   * @param {Object} res - РѕР±СЉРµРєС‚ РѕС‚РІРµС‚Р° Express
   * @returns {Promise<void>}
   */
  async syncWithAPI(req, res) {
    try {
      const { type = 'popular', limit = 50 } = req.query;

      let result;

      switch (type) {
        case 'popular':
          result = await anilibertyService.getPopularAnime(parseInt(limit));
          break;
        case 'new-episodes':
          result = await anilibertyService.getNewEpisodes(parseInt(limit));
          break;
        default:
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: {
              message: 'РќРµРїРѕРґРґРµСЂР¶РёРІР°РµРјС‹Р№ С‚РёРї СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёРё',
              details: 'Р”РѕСЃС‚СѓРїРЅС‹Рµ С‚РёРїС‹: popular, new-episodes'
            }
          });
      }

      if (result.success && result.data.length > 0) {
        const syncedAnime = await this.cacheAnimeList(result.data);

        return res.json({
          success: true,
          message: `РЎРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅРѕ ${syncedAnime.length} Р°РЅРёРјРµ`,
          data: {
            synced: syncedAnime.length,
            type: type
          }
        });
      }

      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: result.error || 'РћС€РёР±РєР° СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёРё',
          details: 'РќРµ СѓРґР°Р»РѕСЃСЊ СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°С‚СЊ РґР°РЅРЅС‹Рµ'
        }
      });

    } catch (error) {
      console.error('Error in syncWithAPI:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR,
          details: 'РћС€РёР±РєР° СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёРё СЃ API'
        }
      });
    }
  }
}

module.exports = new AnilibertyController();

