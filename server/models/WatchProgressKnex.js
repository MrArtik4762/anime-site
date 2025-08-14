const knex = require('../db/knex');

class WatchProgressKnex {
  // Создание или обновление прогресса просмотра
  static async upsert(data) {
    try {
      const existing = await knex('watch_progress')
        .where('user_id', data.user_id)
        .where('anime_id', data.anime_id)
        .first();

      if (existing) {
        // Обновляем существующую запись
        const updated = await knex('watch_progress')
          .where('id', existing.id)
          .update(data)
          .returning('*');
        return updated[0];
      } else {
        // Создаем новую запись
        const [id] = await knex('watch_progress').insert(data).returning('id');
        return this.findById(id);
      }
    } catch (error) {
      console.error('Error upserting watch progress:', error);
      throw error;
    }
  }

  // Поиск прогресса по ID
  static async findById(id) {
    try {
      const progress = await knex('watch_progress')
        .where('id', id)
        .first();
      
      if (!progress) {
        return null;
      }
      
      return progress;
    } catch (error) {
      console.error('Error finding watch progress by ID:', error);
      throw error;
    }
  }

  // Поиск прогресса пользователя по аниме
  static async findByUserAndAnime(userId, animeId) {
    try {
      const progress = await knex('watch_progress')
        .where('user_id', userId)
        .where('anime_id', animeId)
        .first();
      
      if (!progress) {
        return null;
      }
      
      return progress;
    } catch (error) {
      console.error('Error finding watch progress by user and anime:', error);
      throw error;
    }
  }

  // Получение прогресса пользователя для всех аниме
  static async findByUser(userId, options = {}) {
    try {
      let query = knex('watch_progress')
        .where('user_id', userId);

      if (options.animeIds && options.animeIds.length > 0) {
        query = query.whereIn('anime_id', options.animeIds);
      }

      if (options.sort) {
        query = query.orderBy(options.sort);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.skip) {
        query = query.offset(options.skip);
      }

      const results = await query;
      return results;
    } catch (error) {
      console.error('Error finding watch progress by user:', error);
      throw error;
    }
  }

  // Обновление прогресса просмотра
  static async updateProgress(id, progressData) {
    try {
      await knex('watch_progress')
        .where('id', id)
        .update(progressData);

      return this.findById(id);
    } catch (error) {
      console.error('Error updating watch progress:', error);
      throw error;
    }
  }

  // Удаление прогресса
  static async delete(id) {
    try {
      const deleted = await knex('watch_progress')
        .where('id', id)
        .del();
      
      return deleted > 0;
    } catch (error) {
      console.error('Error deleting watch progress:', error);
      throw error;
    }
  }

  // Получение статистики просмотра пользователя
  static async getUserStats(userId) {
    try {
      const stats = await knex('watch_progress')
        .where('user_id', userId)
        .count('* as total_anime')
        .sum('episodes_watched as total_episodes')
        .sum('time_watched as total_time')
        .avg('score as average_score')
        .first();

      return {
        totalAnime: parseInt(stats.total_anime) || 0,
        totalEpisodes: parseInt(stats.total_episodes) || 0,
        totalTime: parseInt(stats.total_time) || 0,
        averageScore: parseFloat(stats.average_score) || 0
      };
    } catch (error) {
      console.error('Error getting user watch progress stats:', error);
      throw error;
    }
  }

  // Получение прогресса для конкретного эпизода
  static async getEpisodeProgress(userId, animeId, episodeNumber) {
    try {
      const progress = await knex('watch_progress')
        .where('user_id', userId)
        .where('anime_id', animeId)
        .first();

      if (!progress) {
        return null;
      }

      // Проверяем, просмотрен ли этот эпизод
      const episodesWatched = JSON.parse(progress.episodes_watched || '[]');
      const isWatched = episodesWatched.includes(episodeNumber);

      return {
        ...progress,
        isWatched,
        episodeNumber
      };
    } catch (error) {
      console.error('Error getting episode progress:', error);
      throw error;
    }
  }

  // Отметка эпизода как просмотренного
  static async markEpisodeWatched(userId, animeId, episodeNumber) {
    try {
      const progress = await this.findByUserAndAnime(userId, animeId);
      
      let episodesWatched = [];
      if (progress) {
        episodesWatched = JSON.parse(progress.episodes_watched || '[]');
        
        // Если эпизод уже отмечен, ничего не делаем
        if (episodesWatched.includes(episodeNumber)) {
          return progress;
        }
        
        episodesWatched.push(episodeNumber);
        
        await knex('watch_progress')
          .where('id', progress.id)
          .update({
            episodes_watched: JSON.stringify(episodesWatched),
            last_watched: new Date()
          });
        
        return this.findByUserAndAnime(userId, animeId);
      } else {
        // Если прогресса еще нет, создаем его
        episodesWatched = [episodeNumber];
        
        const newProgress = await this.upsert({
          user_id: userId,
          anime_id: animeId,
          episodes_watched: JSON.stringify(episodesWatched),
          last_watched: new Date()
        });
        
        return newProgress;
      }
    } catch (error) {
      console.error('Error marking episode as watched:', error);
      throw error;
    }
  }

  // Снятие отметки с эпизода
  static async unmarkEpisodeWatched(userId, animeId, episodeNumber) {
    try {
      const progress = await this.findByUserAndAnime(userId, animeId);
      
      if (!progress) {
        return null;
      }
      
      let episodesWatched = JSON.parse(progress.episodes_watched || '[]');
      episodesWatched = episodesWatched.filter(ep => ep !== episodeNumber);
      
      await knex('watch_progress')
        .where('id', progress.id)
        .update({
          episodes_watched: JSON.stringify(episodesWatched),
          last_watched: new Date()
        });
      
      return this.findByUserAndAnime(userId, animeId);
    } catch (error) {
      console.error('Error unmarking episode as watched:', error);
      throw error;
    }
  }
}

module.exports = WatchProgressKnex;