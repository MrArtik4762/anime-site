// const anilibriaService = require('../services/anilibriaService'); // Временно отключен
const { HTTP_STATUS } = require('../../shared/constants/constants');

/**
 * РџРѕР»СѓС‡РёС‚СЊ РїРѕРїСѓР»СЏСЂРЅС‹Рµ Р°РЅРёРјРµ РёР· AniLibria
 */
const getPopular = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    
    // const data = await anilibriaService.getPopular({
    //   limit: parseInt(limit),
    //   page: parseInt(page)
    // });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: data.list || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: data.pagination?.total || data.list?.length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching popular anime from AniLibria:', error);
    
    // Р’РѕР·РІСЂР°С‰Р°РµРј С‚РµСЃС‚РѕРІС‹Рµ РґР°РЅРЅС‹Рµ РїСЂРё РѕС€РёР±РєРµ API
    const mockData = [
      {
        id: 9919,
        names: {
          ru: "Р”РµРІРѕС‡РєРё-Р±Р°Р±РѕС‡РєРё",
          en: "Butterfly Girls",
          alternative: "Chou Shoujo"
        },
        description: "РСЃС‚РѕСЂРёСЏ Рѕ РґРµРІРѕС‡РєР°С…, РєРѕС‚РѕСЂС‹Рµ РїСЂРµРІСЂР°С‰Р°СЋС‚СЃСЏ РІ Р±Р°Р±РѕС‡РµРє Рё СЃСЂР°Р¶Р°СЋС‚СЃСЏ СЃРѕ Р·Р»РѕРј.",
        type: { string: "TV", episodes: 24 },
        status: { string: "Р’ СЂР°Р±РѕС‚Рµ" },
        genres: ["РњР°РіРёСЏ", "РЁРєРѕР»Р°", "Р”СЂР°РјР°"],
        year: 2025,
        season: { string: "Р»РµС‚Рѕ" },
        posters: {
          small: { url: "https://www.anilibria.tv/storage/releases/posters/9919/small.jpg" },
          medium: { url: "https://www.anilibria.tv/storage/releases/posters/9919/medium.jpg" },
          original: { url: "https://www.anilibria.tv/storage/releases/posters/9919/original.jpg" }
        },
        player: {
          episodes: { last: 17 },
          list: {
            "1": {
              name: "РџРµСЂРІР°СЏ РІСЃС‚СЂРµС‡Р°",
              preview: "/storage/releases/episodes/previews/9919/1/preview.jpg",
              hls: {
                fhd: "/videos/media/ts/9919/1/1080/video.m3u8",
                hd: "/videos/media/ts/9919/1/720/video.m3u8",
                sd: "/videos/media/ts/9919/1/480/video.m3u8"
              }
            }
          }
        },
        blocked: { copyrights: false, geoip: false }
      },
      {
        id: 9988,
        names: {
          ru: "РўСЂСѓСЃСЊРєР°, Р§СѓР»РєРѕ Рё РїСЂРµСЃРІСЏС‚РѕР№ РџРѕРґРІСЏР· 2",
          en: "New Panty & Stocking with Garterbelt",
          alternative: null
        },
        description: "РџСЂРѕРґРѕР»Р¶РµРЅРёРµ РїСЂРёРєР»СЋС‡РµРЅРёР№ РґРІСѓС… РїР°РґС€РёС… Р°РЅРіРµР»РѕРІ РІ Р”Р°С‚СЌРЅ-СЃРёС‚Рё.",
        type: { string: "TV", episodes: 13 },
        status: { string: "Р’ СЂР°Р±РѕС‚Рµ" },
        genres: ["РљРѕРјРµРґРёСЏ", "РџР°СЂРѕРґРёСЏ", "Р¤СЌРЅС‚РµР·Рё", "Р­РєС€РµРЅ"],
        year: 2025,
        season: { string: "Р»РµС‚Рѕ" },
        posters: {
          small: { url: "https://www.anilibria.tv/storage/releases/posters/9988/small.jpg" },
          medium: { url: "https://www.anilibria.tv/storage/releases/posters/9988/medium.jpg" },
          original: { url: "https://www.anilibria.tv/storage/releases/posters/9988/original.jpg" }
        },
        player: {
          episodes: { last: 4 },
          list: {
            "1": {
              name: "Р’РѕР·РІСЂР°С‰РµРЅРёРµ",
              preview: "/storage/releases/episodes/previews/9988/1/preview.jpg",
              hls: {
                fhd: "/videos/media/ts/9988/1/1080/video.m3u8",
                hd: "/videos/media/ts/9988/1/720/video.m3u8",
                sd: "/videos/media/ts/9988/1/480/video.m3u8"
              }
            }
          }
        },
        blocked: { copyrights: false, geoip: false }
      }
    ];

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: mockData.slice(0, parseInt(req.query.limit || 12)),
      pagination: {
        page: parseInt(req.query.page || 1),
        limit: parseInt(req.query.limit || 12),
        total: mockData.length
      }
    });
  }
};

/**
 * РџРѕР»СѓС‡РёС‚СЊ РїРѕСЃР»РµРґРЅРёРµ РѕР±РЅРѕРІР»РµРЅРёСЏ РёР· AniLibria
 */
const getUpdates = async (req, res) => {
  try {
    const { limit = 12, page = 1 } = req.query;
    
    // const data = await anilibriaService.getUpdates({
    //   limit: parseInt(limit),
    //   page: parseInt(page)
    // });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: data.list || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: data.pagination?.total || data.list?.length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching updates from AniLibria:', error);
    
    // Р’РѕР·РІСЂР°С‰Р°РµРј С‚РµСЃС‚РѕРІС‹Рµ РґР°РЅРЅС‹Рµ РїСЂРё РѕС€РёР±РєРµ API
    const mockData = [
      {
        id: 10027,
        names: {
          ru: "РЎРІРµРґС‘РЅРЅС‹Рµ РєСѓРєСѓС€РєРѕР№ 2",
          en: "Kakkou no Iinazuke Season 2",
          alternative: null
        },
        description: "РџСЂРѕРґРѕР»Р¶РµРЅРёРµ СЂРѕРјР°РЅС‚РёС‡РµСЃРєРѕР№ РєРѕРјРµРґРёРё Рѕ РїРµСЂРµРїСѓС‚Р°РЅРЅС‹С… РІ СЂРѕРґРґРѕРјРµ РґРµС‚СЏС….",
        type: { string: "TV", episodes: 12 },
        status: { string: "Р’ СЂР°Р±РѕС‚Рµ" },
        genres: ["РљРѕРјРµРґРёСЏ", "Р РѕРјР°РЅС‚РёРєР°"],
        year: 2025,
        season: { string: "Р»РµС‚Рѕ" },
        posters: {
          small: { url: "https://www.anilibria.tv/storage/releases/posters/10027/small.jpg" },
          medium: { url: "https://www.anilibria.tv/storage/releases/posters/10027/medium.jpg" },
          original: { url: "https://www.anilibria.tv/storage/releases/posters/10027/original.jpg" }
        },
        player: {
          episodes: { last: 4 },
          list: {
            "1": {
              name: "РљС‚Рѕ Р±С‹Р» РїРµСЂРІРѕР№ Р»СЋР±РѕРІСЊСЋ РЈРјРёРЅРѕ?",
              preview: "/storage/releases/episodes/previews/10027/1/preview.jpg",
              hls: {
                fhd: "/videos/media/ts/10027/1/1080/video.m3u8",
                hd: "/videos/media/ts/10027/1/720/video.m3u8",
                sd: "/videos/media/ts/10027/1/480/video.m3u8"
              }
            }
          }
        },
        blocked: { copyrights: false, geoip: false }
      },
      {
        id: 9984,
        names: {
          ru: "РЇ РїРµСЂРµСЂРѕРґРёР»СЃСЏ С‚РѕСЂРіРѕРІС‹Рј Р°РІС‚РѕРјР°С‚РѕРј Рё СЃРєРёС‚Р°СЋСЃСЊ РїРѕ Р»Р°Р±РёСЂРёРЅС‚Сѓ 2",
          en: "Jidou Hanbaiki ni Umarekawatta Ore wa Meikyuu wo Samayou 2nd Season",
          alternative: null
        },
        description: "РџСЂРѕРґРѕР»Р¶РµРЅРёРµ РїСЂРёРєР»СЋС‡РµРЅРёР№ С‚РѕСЂРіРѕРІРѕРіРѕ Р°РІС‚РѕРјР°С‚Р° РІ С„СЌРЅС‚РµР·РёР№РЅРѕРј РјРёСЂРµ.",
        type: { string: "TV", episodes: null },
        status: { string: "Р’ СЂР°Р±РѕС‚Рµ" },
        genres: ["РСЃРµРєР°Р№", "РљРѕРјРµРґРёСЏ", "Р¤СЌРЅС‚РµР·Рё"],
        year: 2025,
        season: { string: "Р»РµС‚Рѕ" },
        posters: {
          small: { url: "https://www.anilibria.tv/storage/releases/posters/9984/small.jpg" },
          medium: { url: "https://www.anilibria.tv/storage/releases/posters/9984/medium.jpg" },
          original: { url: "https://www.anilibria.tv/storage/releases/posters/9984/original.jpg" }
        },
        player: {
          episodes: { last: 5 },
          list: {
            "1": {
              name: "РџР»Р°РЅ РѕС…РѕС‚РЅРёРєРѕРІ",
              preview: "/storage/releases/episodes/previews/9984/1/preview.jpg",
              hls: {
                fhd: "/videos/media/ts/9984/1/1080/video.m3u8",
                hd: "/videos/media/ts/9984/1/720/video.m3u8",
                sd: "/videos/media/ts/9984/1/480/video.m3u8"
              }
            }
          }
        },
        blocked: { copyrights: false, geoip: false }
      }
    ];

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: mockData.slice(0, parseInt(req.query.limit || 12)),
      pagination: {
        page: parseInt(req.query.page || 1),
        limit: parseInt(req.query.limit || 12),
        total: mockData.length
      }
    });
  }
};

/**
 * РџРѕРёСЃРє Р°РЅРёРјРµ РІ AniLibria
 */
const search = async (req, res) => {
  try {
    const {
      search: query,
      limit = 20,
      page = 1,
      year,
      season,
      genres,
      type
    } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'РџРѕРёСЃРєРѕРІС‹Р№ Р·Р°РїСЂРѕСЃ РґРѕР»Р¶РµРЅ СЃРѕРґРµСЂР¶Р°С‚СЊ РјРёРЅРёРјСѓРј 2 СЃРёРјРІРѕР»Р°'
        }
      });
    }

    // const data = await anilibriaService.search({
    //   search: query.trim(),
    //   limit: parseInt(limit),
    //   page: parseInt(page),
    //   year: year ? parseInt(year) : undefined,
    //   season,
    //   genres: genres ? genres.split(',') : undefined,
    //   type
    // });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: data.list || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: data.pagination?.total || data.list?.length || 0
      }
    });
  } catch (error) {
    console.error('Error searching anime in AniLibria:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: 'РћС€РёР±РєР° РїСЂРё РїРѕРёСЃРєРµ Р°РЅРёРјРµ',
        details: error.message
      }
    });
  }
};

/**
 * Fallback РїРѕРёСЃРє Р°РЅРёРјРµ СЃ СЂР°СЃС€РёСЂРµРЅРЅС‹РјРё РІРѕР·РјРѕР¶РЅРѕСЃС‚СЏРјРё
 */
const searchFallback = async (req, res) => {
  try {
    const {
      query,
      limit = 20,
      page = 1,
      year,
      season,
      genres,
      type
    } = req.query;

    if (!query || query.trim().length < 1) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'РџРѕРёСЃРєРѕРІС‹Р№ Р·Р°РїСЂРѕСЃ РѕР±СЏР·Р°С‚РµР»РµРЅ'
        }
      });
    }

    // РСЃРїРѕР»СЊР·СѓРµРј РјРµС‚РѕРґ searchWithFallback РґР»СЏ Р±РѕР»РµРµ РЅР°РґРµР¶РЅРѕРіРѕ РїРѕРёСЃРєР°
    // const result = await anilibriaService.searchWithFallback(
    //   query.trim(),
    //   parseInt(limit)
    // );

    // Р•СЃР»Рё СЂРµР·СѓР»СЊС‚Р°С‚ РїСѓСЃС‚РѕР№, РёСЃРїРѕР»СЊР·СѓРµРј mock РґР°РЅРЅС‹Рµ
    if (!result.data || result.data.length === 0) {
      const mockSearchResults = [
        {
          id: 9988,
          names: {
            ru: "РўСЂСѓСЃСЊРєР°, Р§СѓР»РєРѕ Рё РїСЂРµСЃРІСЏС‚РѕР№ РџРѕРґРІСЏР· 2",
            en: "New Panty & Stocking with Garterbelt",
            alternative: null
          },
          description: "РџСЂРѕРґРѕР»Р¶РµРЅРёРµ РїСЂРёРєР»СЋС‡РµРЅРёР№ РґРІСѓС… РїР°РґС€РёС… Р°РЅРіРµР»РѕРІ РІ Р”Р°С‚СЌРЅ-СЃРёС‚Рё.",
          type: { string: "TV", episodes: 13 },
          status: { string: "Р’ СЂР°Р±РѕС‚Рµ" },
          genres: ["РљРѕРјРµРґРёСЏ", "РџР°СЂРѕРґРёСЏ", "Р¤СЌРЅС‚РµР·Рё", "Р­РєС€РµРЅ"],
          year: 2025,
          season: { string: "Р»РµС‚Рѕ" },
          posters: {
            small: { url: "https://www.anilibria.tv/storage/releases/posters/9988/small.jpg" },
            medium: { url: "https://www.anilibria.tv/storage/releases/posters/9988/medium.jpg" },
            original: { url: "https://www.anilibria.tv/storage/releases/posters/9988/original.jpg" }
          },
          player: {
            episodes: { last: 4 },
            list: {
              "1": {
                name: "Р’РѕР·РІСЂР°С‰РµРЅРёРµ",
                preview: "/storage/releases/episodes/previews/9988/1/preview.jpg",
                hls: {
                  fhd: "/videos/media/ts/9988/1/1080/video.m3u8",
                  hd: "/videos/media/ts/9988/1/720/video.m3u8",
                  sd: "/videos/media/ts/9988/1/480/video.m3u8"
                }
              }
            }
          },
          blocked: { copyrights: false, geoip: false }
        }
      ].filter(anime =>
        anime.names.ru.toLowerCase().includes(query.toLowerCase()) ||
        anime.names.en.toLowerCase().includes(query.toLowerCase())
      );

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: mockSearchResults,
        source: 'mock',
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockSearchResults.length
        }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result.data || [],
      source: result.source,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.total || 0
      }
    });
  } catch (error) {
    console.error('Error in fallback search:', error);
    
    // Р’РѕР·РІСЂР°С‰Р°РµРј mock РґР°РЅРЅС‹Рµ РїСЂРё РїРѕР»РЅРѕРј РѕС‚РєР°Р·Рµ API
    const mockSearchResults = [
      {
        id: 9988,
        names: {
          ru: "РўСЂСѓСЃСЊРєР°, Р§СѓР»РєРѕ Рё РїСЂРµСЃРІСЏС‚РѕР№ РџРѕРґРІСЏР· 2",
          en: "New Panty & Stocking with Garterbelt",
          alternative: null
        },
        description: "РџСЂРѕРґРѕР»Р¶РµРЅРёРµ РїСЂРёРєР»СЋС‡РµРЅРёР№ РґРІСѓС… РїР°РґС€РёС… Р°РЅРіРµР»РѕРІ РІ Р”Р°С‚СЌРЅ-СЃРёС‚Рё.",
        type: { string: "TV", episodes: 13 },
        status: { string: "Р’ СЂР°Р±РѕС‚Рµ" },
        genres: ["РљРѕРјРµРґРёСЏ", "РџР°СЂРѕРґРёСЏ", "Р¤СЌРЅС‚РµР·Рё", "Р­РєС€РµРЅ"],
        year: 2025,
        season: { string: "Р»РµС‚Рѕ" },
        posters: {
          small: { url: "https://www.anilibria.tv/storage/releases/posters/9988/small.jpg" },
          medium: { url: "https://www.anilibria.tv/storage/releases/posters/9988/medium.jpg" },
          original: { url: "https://www.anilibria.tv/storage/releases/posters/9988/original.jpg" }
        },
        player: {
          episodes: { last: 4 },
          list: {
            "1": {
              name: "Р’РѕР·РІСЂР°С‰РµРЅРёРµ",
              preview: "/storage/releases/episodes/previews/9988/1/preview.jpg",
              hls: {
                fhd: "/videos/media/ts/9988/1/1080/video.m3u8",
                hd: "/videos/media/ts/9988/1/720/video.m3u8",
                sd: "/videos/media/ts/9988/1/480/video.m3u8"
              }
            }
          }
        },
        blocked: { copyrights: false, geoip: false }
      }
    ].filter(anime =>
      anime.names.ru.toLowerCase().includes(query.toLowerCase()) ||
      anime.names.en.toLowerCase().includes(query.toLowerCase())
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: mockSearchResults,
      source: 'mock',
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockSearchResults.length
      }
    });
  }
};

/**
 * РџРѕР»СѓС‡РёС‚СЊ РёРЅС„РѕСЂРјР°С†РёСЋ РѕР± Р°РЅРёРјРµ РїРѕ ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'ID Р°РЅРёРјРµ РѕР±СЏР·Р°С‚РµР»РµРЅ'
        }
      });
    }

    // const data = await anilibriaService.getById(id);

    if (!data) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          message: 'РђРЅРёРјРµ РЅРµ РЅР°Р№РґРµРЅРѕ'
        }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching anime by ID from AniLibria:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: 'РћС€РёР±РєР° РїСЂРё РїРѕР»СѓС‡РµРЅРёРё РёРЅС„РѕСЂРјР°С†РёРё РѕР± Р°РЅРёРјРµ',
        details: error.message
      }
    });
  }
};

/**
 * РџРѕР»СѓС‡РёС‚СЊ СЃР»СѓС‡Р°Р№РЅРѕРµ Р°РЅРёРјРµ
 */
const getRandom = async (req, res) => {
  try {
    const { limit = 1 } = req.query;
    
    // const data = await anilibriaService.getRandom({
    //   limit: parseInt(limit)
    // });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: Array.isArray(data) ? data : [data]
    });
  } catch (error) {
    console.error('Error fetching random anime from AniLibria:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: 'РћС€РёР±РєР° РїСЂРё РїРѕР»СѓС‡РµРЅРёРё СЃР»СѓС‡Р°Р№РЅРѕРіРѕ Р°РЅРёРјРµ',
        details: error.message
      }
    });
  }
};

/**
 * РџРѕР»СѓС‡РёС‚СЊ Р¶Р°РЅСЂС‹
 */
const getGenres = async (req, res) => {
  try {
    // const data = await anilibriaService.getGenres();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching genres from AniLibria:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: 'РћС€РёР±РєР° РїСЂРё РїРѕР»СѓС‡РµРЅРёРё Р¶Р°РЅСЂРѕРІ',
        details: error.message
      }
    });
  }
};

/**
 * РџРѕР»СѓС‡РёС‚СЊ СЂР°СЃРїРёСЃР°РЅРёРµ
 */
const getSchedule = async (req, res) => {
  try {
    const { days } = req.query;
    
    // const data = await anilibriaService.getSchedule({
    //   days: days ? days.split(',') : undefined
    // });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching schedule from AniLibria:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: 'РћС€РёР±РєР° РїСЂРё РїРѕР»СѓС‡РµРЅРёРё СЂР°СЃРїРёСЃР°РЅРёСЏ',
        details: error.message
      }
    });
  }
};

/**
 * РџРѕР»СѓС‡РёС‚СЊ РёРЅС„РѕСЂРјР°С†РёСЋ Рѕ YouTube РєР°РЅР°Р»Рµ
 */
const getYouTube = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    // const data = await anilibriaService.getYouTube({
    //   limit: parseInt(limit)
    // });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching YouTube data from AniLibria:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: 'РћС€РёР±РєР° РїСЂРё РїРѕР»СѓС‡РµРЅРёРё РґР°РЅРЅС‹С… YouTube',
        details: error.message
      }
    });
  }
};

module.exports = {
  getPopular,
  getUpdates,
  search,
  searchFallback,
  getById,
  getRandom,
  getGenres,
  getSchedule,
  getYouTube
};
