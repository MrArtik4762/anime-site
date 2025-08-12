const UnifiedAnime = require('../models/UnifiedAnime');
const anilibriaService = require('./anilibriaService');
const anilibertyService = require('./anilibertyService');
const anilistService = require('./anilistService');

class DataConversionService {
  /**
   * Конвертирует данные из указанного источника в унифицированный формат
   * @param {string} source - Источник данных ('anilist', 'anilibria', 'aniliberty')
   * @param {Object} data - Сырые данные из источника
   * @returns {Object} - Объект в унифицированном формате
   */
  static convertToUnifiedFormat(source, data) {
    if (!source || !data) {
      throw new Error('Источник данные и данные обязательны для конвертации');
    }

    try {
      const normalizedData = UnifiedAnime.converters.normalizeData(source, data);
      if (!normalizedData) {
        throw new Error(`Не удалось нормализовать данные из источника: ${source}`);
      }
      
      return normalizedData;
    } catch (error) {
      console.error(`Ошибка при конвертации данных из ${source}:`, error);
      throw error;
    }
  }

  /**
   * Конвертирует массив данных из указанного источника
   * @param {string} source - Источник данных
   * @param {Array} dataArray - Массив сырых данных
   * @returns {Array} - Массив объектов в унифицированном формате
   */
  static convertArrayToUnifiedFormat(source, dataArray) {
    if (!Array.isArray(dataArray)) {
      throw new Error('Данные должны быть массивом');
    }

    return dataArray.map(data => this.convertToUnifiedFormat(source, data));
  }

  /**
   * Получает данные из AniLibria и конвертирует их
   * @param {Object} options - Опции для запроса
   * @returns {Promise<Array>} - Массив унифицированных объектов
   */
  static async getAndConvertAnilibria(options = {}) {
    try {
      const rawData = await anilibriaService.getPopular(options);
      return this.convertArrayToUnifiedFormat('anilibria', rawData.list || []);
    } catch (error) {
      console.error('Ошибка при получении и конвертации данных из AniLibria:', error);
      throw error;
    }
  }

  /**
   * Получает данные из AniLiberty и конвертирует их
   * @param {Object} options - Опции для запроса
   * @returns {Promise<Array>} - Массив унифицированных объектов
   */
  static async getAndConvertAniliberty(options = {}) {
    try {
      const rawData = await anilibertyService.getPopularAnime(options);
      return this.convertArrayToUnifiedFormat('aniliberty', rawData || []);
    } catch (error) {
      console.error('Ошибка при получении и конвертации данных из AniLiberty:', error);
      throw error;
    }
  }

  /**
   * Получает данные из AniList и конвертирует их
   * @param {Object} options - Опции для запроса
   * @returns {Promise<Array>} - Массив унифицированных объектов
   */
  static async getAndConvertAniList(options = {}) {
    try {
      const rawData = await anilistService.getPopular(options);
      return this.convertArrayToUnifiedFormat('anilist', rawData.data?.Page?.media || []);
    } catch (error) {
      console.error('Ошибка при получении и конвертации данных из AniList:', error);
      throw error;
    }
  }

  /**
   * Ищет аниме по названию в разных источниках и объединяет результаты
   * @param {string} query - Поисковый запрос
   * @param {Object} options - Опции поиска
   * @returns {Promise<Array>} - Объединенные результаты поиска
   */
  static async searchInAllSources(query, options = {}) {
    const results = {
      anilist: [],
      anilibria: [],
      aniliberty: [],
      combined: []
    };

    try {
      // Параллельный поиск во всех источниках
      const [anilistData, anilibriaData, anilibertyData] = await Promise.allSettled([
        this.searchInAniList(query, options),
        this.searchInAnilibria(query, options),
        this.searchInAniliberty(query, options)
      ]);

      // Обработка результатов
      if (anilistData.status === 'fulfilled') {
        results.anilist = anilistData.value;
        results.combined = results.combined.concat(anilistData.value);
      }

      if (anilibriaData.status === 'fulfilled') {
        results.anilibria = anilibriaData.value;
        results.combined = results.combined.concat(anilibriaData.value);
      }

      if (anilibertyData.status === 'fulfilled') {
        results.aniliberty = anilibertyData.value;
        results.combined = results.combined.concat(anilibertyData.value);
      }

      // Удаление дубликатов по названию
      results.combined = this.removeDuplicates(results.combined);

      return results;
    } catch (error) {
      console.error('Ошибка при поиске во всех источниках:', error);
      throw error;
    }
  }

  /**
   * Ищет аниме только в AniList
   */
  static async searchInAniList(query, options = {}) {
    try {
      const rawData = await anilistService.searchAnime(query, options);
      return this.convertArrayToUnifiedFormat('anilist', rawData.data?.Page?.media || []);
    } catch (error) {
      console.error('Ошибка при поиске в AniList:', error);
      return [];
    }
  }

  /**
   * Ищет аниме только в AniLibria
   */
  static async searchInAnilibria(query, options = {}) {
    try {
      const rawData = await anilibriaService.searchTitles(query, options);
      return this.convertArrayToUnifiedFormat('anilibria', rawData.list || []);
    } catch (error) {
      console.error('Ошибка при поиске в AniLibria:', error);
      return [];
    }
  }

  /**
   * Ищет аниме только в AniLiberty
   */
  static async searchInAniliberty(query, options = {}) {
    try {
      const rawData = await anilibertyService.searchAnime(query, options);
      return this.convertArrayToUnifiedFormat('aniliberty', rawData || []);
    } catch (error) {
      console.error('Ошибка при поиске в AniLiberty:', error);
      return [];
    }
  }

  /**
   * Удаляет дубликаты из массива аниме по названию
   * @param {Array} animeArray - Массив аниме
   * @returns {Array} - Массив без дубликатов
   */
  static removeDuplicates(animeArray) {
    const seenTitles = new Set();
    return animeArray.filter(anime => {
      const title = anime.title?.main?.toLowerCase() || '';
      if (seenTitles.has(title)) {
        return false;
      }
      seenTitles.add(title);
      return true;
    });
  }

  /**
   * Синхронизирует данные из всех источников
   * @param {Object} options - Опции синхронизации
   * @returns {Promise<Object>} - Результаты синхронизации
   */
  static async syncAllSources(options = {}) {
    const results = {
      anilist: { success: false, count: 0, errors: [] },
      anilibria: { success: false, count: 0, errors: [] },
      aniliberty: { success: false, count: 0, errors: [] }
    };

    try {
      // Синхронизация AniLibria
      try {
        const anilibriaData = await this.getAndConvertAnilibria(options);
        results.anilibria.count = await this.saveToDatabase(anilibriaData, 'anilibria');
        results.anilibria.success = true;
      } catch (error) {
        results.anilibria.errors.push(error.message);
      }

      // Синхронизация AniLiberty
      try {
        const anilibertyData = await this.getAndConvertAniliberty(options);
        results.aniliberty.count = await this.saveToDatabase(anilibertyData, 'aniliberty');
        results.aniliberty.success = true;
      } catch (error) {
        results.aniliberty.errors.push(error.message);
      }

      // Синхронизация AniList
      try {
        const anilistData = await this.getAndConvertAniList(options);
        results.anilist.count = await this.saveToDatabase(anilistData, 'anilist');
        results.anilist.success = true;
      } catch (error) {
        results.anilist.errors.push(error.message);
      }

      return results;
    } catch (error) {
      console.error('Ошибка при синхронизации всех источников:', error);
      throw error;
    }
  }

  /**
   * Сохраняет данные в базу данных
   * @param {Array} animeArray - Массив аниме для сохранения
   * @param {string} source - Источник данных
   * @returns {Promise<number>} - Количество сохраненных записей
   */
  static async saveToDatabase(animeArray, source) {
    if (!Array.isArray(animeArray) || animeArray.length === 0) {
      return 0;
    }

    let savedCount = 0;
    const updateOptions = { upsert: true, new: true, setDefaultsOnInsert: true };

    for (const animeData of animeArray) {
      try {
        // Проверяем, существует ли уже аниме с таким же названием
        const existingAnime = await UnifiedAnime.findOne({
          'title.main': { $regex: animeData.title?.main, $options: 'i' }
        });

        if (existingAnime) {
          // Обновляем существующую запись
          await UnifiedAnime.updateOne(
            { _id: existingAnime._id },
            { $set: { ...animeData, lastSynced: { [source]: new Date() } } }
          );
        } else {
          // Создаем новую запись
          const newAnime = new UnifiedAnime(animeData);
          await newAnime.save();
        }

        savedCount++;
      } catch (error) {
        console.error(`Ошибка при сохранении аниме "${animeData.title?.main}":`, error);
      }
    }

    return savedCount;
  }

  /**
   * Получает статистику по всем источникам данных
   * @returns {Promise<Object>} - Статистика по источникам
   */
  static async getSourcesStatistics() {
    try {
      const [totalAnimes, anilistCount, anilibriaCount, anilibertyCount] = await Promise.all([
        UnifiedAnime.countDocuments({ isActive: true, approved: true }),
        UnifiedAnime.countDocuments({ 'externalIds.anilist': { $exists: true } }),
        UnifiedAnime.countDocuments({ 'externalIds.anilibria': { $exists: true } }),
        UnifiedAnime.countDocuments({ 'externalIds.aniliberty': { $exists: true } })
      ]);

      return {
        total: totalAnimes,
        sources: {
          anilist: anilistCount,
          anilibria: anilibriaCount,
          aniliberty: anilibertyCount
        },
        coverage: {
          anilist: totalAnimes > 0 ? (anilistCount / totalAnimes * 100).toFixed(2) : 0,
          anilibria: totalAnimes > 0 ? (anilibriaCount / totalAnimes * 100).toFixed(2) : 0,
          aniliberty: totalAnimes > 0 ? (anilibertyCount / totalAnimes * 100).toFixed(2) : 0
        }
      };
    } catch (error) {
      console.error('Ошибка при получении статистики источников:', error);
      throw error;
    }
  }
}

module.exports = DataConversionService;