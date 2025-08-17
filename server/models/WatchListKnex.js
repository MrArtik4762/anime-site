import { db } from '../db/knex.js';

class WatchListKnex {
  // Создание новой записи в списке просмотра
  static async create(data) {
    try {
      const [id] = await db('watchlist').insert(data).returning('id');
      return this.findById(id);
    } catch (error) {
      console.error('Error creating watchlist entry:', error);
      throw error;
    }
  }

  // Поиск записи по ID
  static async findById(id) {
    try {
      const entry = await db('watchlist')
        .where('id', id)
        .first();
      
      if (!entry) {
        return null;
      }
      
      // Парсим JSON поля
      if (entry.progress) {
        entry.progress = JSON.parse(entry.progress);
      }
      
      return entry;
    } catch (error) {
      console.error('Error finding watchlist entry by ID:', error);
      throw error;
    }
  }

  // Поиск записей по пользователю и статусу
  static async findByUserAndStatus(userId, status, options = {}) {
    try {
      const query = db('watchlist')
        .where('user_id', userId)
        .where('status', status);

      if (options.sort) {
        query.orderBy(options.sort);
      } else {
        query.orderBy('last_watched', 'desc');
      }

      if (options.limit) {
        query.limit(options.limit);
      }

      if (options.skip) {
        query.offset(options.skip);
      }

      const entries = await query;
      
      // Парсим JSON поля для каждой записи
      return entries.map(entry => ({
        ...entry,
        progress: entry.progress ? JSON.parse(entry.progress) : null
      }));
    } catch (error) {
      console.error('Error finding watchlist entries by user and status:', error);
      throw error;
    }
  }

  // Поиск записи по пользователю и аниме
  static async findUserEntry(userId, animeId) {
    try {
      const entry = await db('watchlist')
        .where('user_id', userId)
        .where('anime_id', animeId)
        .first();
      
      if (!entry) {
        return null;
      }
      
      // Парсим JSON поля
      if (entry.progress) {
        entry.progress = JSON.parse(entry.progress);
      }
      
      return entry;
    } catch (error) {
      console.error('Error finding user watchlist entry:', error);
      throw error;
    }
  }

  // Обновление записи
  static async update(id, data) {
    try {
      await db('watchlist')
        .where('id', id)
        .update(data);
      
      return this.findById(id);
    } catch (error) {
      console.error('Error updating watchlist entry:', error);
      throw error;
    }
  }

  // Удаление записи
  static async delete(id) {
    try {
      const deleted = await db('watchlist')
        .where('id', id)
        .del();
      
      return deleted > 0;
    } catch (error) {
      console.error('Error deleting watchlist entry:', error);
      throw error;
    }
  }

  // Получение статистики пользователя
  static async getUserStats(userId) {
    try {
      const stats = await db('watchlist')
        .where('user_id', userId)
        .select('status')
        .count('* as count')
        .sum('progress->>episodes_watched as total_episodes')
        .sum('progress->>time_watched as total_time')
        .avg('rating as average_rating')
        .groupBy('status');

      const result = {
        watching: { count: 0, totalEpisodes: 0, totalTime: 0 },
        completed: { count: 0, totalEpisodes: 0, totalTime: 0, averageRating: 0 },
        planToWatch: { count: 0, totalEpisodes: 0, totalTime: 0 },
        dropped: { count: 0, totalEpisodes: 0, totalTime: 0 },
        onHold: { count: 0, totalEpisodes: 0, totalTime: 0 },
        total: { count: 0, totalEpisodes: 0, totalTime: 0 }
      };

      stats.forEach(stat => {
        if (result[stat.status]) {
          result[stat.status] = {
            count: parseInt(stat.count),
            totalEpisodes: parseInt(stat.total_episodes) || 0,
            totalTime: parseInt(stat.total_time) || 0,
            averageRating: parseFloat(stat.average_rating) || 0
          };
        }
      });

      // Подсчет общей статистики
      Object.keys(result).forEach(key => {
        if (key !== 'total') {
          result.total.count += result[key].count;
          result.total.totalEpisodes += result[key].totalEpisodes;
          result.total.totalTime += result[key].totalTime;
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting user watchlist stats:', error);
      throw error;
    }
  }

  // Обновление прогресса просмотра
  static async updateProgress(id, episodesWatched, timeWatched) {
    try {
      const currentEntry = await this.findById(id);
      if (!currentEntry) {
        throw new Error('Watchlist entry not found');
      }

      const progress = currentEntry.progress || {};
      progress.episodes_watched = episodesWatched;
      progress.time_watched = (progress.time_watched || 0) + (timeWatched || 0);

      await db('watchlist')
        .where('id', id)
        .update({
          progress: JSON.stringify(progress),
          last_watched: new Date()
        });

      return this.findById(id);
    } catch (error) {
      console.error('Error updating watchlist progress:', error);
      throw error;
    }
  }

  // Установка рейтинга
  static async setRating(id, rating) {
    try {
      if (rating < 1 || rating > 10 || !Number.isInteger(rating)) {
        throw new Error('Рейтинг должен быть целым числом от 1 до 10');
      }

      await db('watchlist')
        .where('id', id)
        .update({ rating });

      return this.findById(id);
    } catch (error) {
      console.error('Error setting watchlist rating:', error);
      throw error;
    }
  }

  // Добавление тега
  static async addTag(id, tag) {
    try {
      const entry = await this.findById(id);
      if (!entry) {
        throw new Error('Watchlist entry not found');
      }

      const tags = entry.tags || [];
      if (!tags.includes(tag)) {
        tags.push(tag);
        await db('watchlist')
          .where('id', id)
          .update({ tags: JSON.stringify(tags) });
      }

      return this.findById(id);
    } catch (error) {
      console.error('Error adding tag to watchlist entry:', error);
      throw error;
    }
  }

  // Удаление тега
  static async removeTag(id, tag) {
    try {
      const entry = await this.findById(id);
      if (!entry) {
        throw new Error('Watchlist entry not found');
      }

      const tags = (entry.tags || []).filter(t => t !== tag);
      await db('watchlist')
        .where('id', id)
        .update({ tags: JSON.stringify(tags) });

      return this.findById(id);
    } catch (error) {
      console.error('Error removing tag from watchlist entry:', error);
      throw error;
    }
  }
}

export default WatchListKnex;