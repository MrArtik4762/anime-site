import WatchProgress from '../models/WatchProgress.js';
import Anime from '../models/Anime.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../shared/constants/constants.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

class WatchController {
  // POST /api/watch/progress - Сохранение прогресса просмотра
  async saveProgress(req, res) {
    try {
      // Валидация входных данных
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Ошибка валидации данных',
            details: errors.array()
          }
        });
      }

      const userId = req.user.id;
      const { animeId, episode, position, duration, quality = 'auto', audioLanguage = 'japanese', subtitleLanguage = 'off' } = req.body;

      // Проверка валидности ID аниме
      if (!mongoose.Types.ObjectId.isValid(animeId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Неверный ID аниме'
          }
        });
      }

      // Проверка существования аниме
      const anime = await Anime.findById(animeId);
      if (!anime || !anime.isActive || !anime.approved) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: ERROR_MESSAGES.ANIME_NOT_FOUND
          }
        });
      }

      // Проверка валидности номера эпизода
      if (episode < 1 || episode > (anime.episodes || 999)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Неверный номер эпизода'
          }
        });
      }

      // Проверка валидности времени и длительности
      if (position < 0 || duration <= 0 || position > duration) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Неверные значения времени или длительности'
          }
        });
      }

      // Ищем существующий прогресс для этого эпизода
      let progress = await WatchProgress.findOne({ 
        userId, 
        animeId, 
        episode 
      });

      const progressData = {
        userId,
        animeId,
        episode,
        position,
        duration,
        quality,
        audioLanguage,
        subtitleLanguage,
        device: req.device.type || 'desktop',
        sessionId: req.sessionID || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      if (progress) {
        // Обновляем существующий прогресс
        Object.assign(progress, progressData);
        progress = await progress.save();
      } else {
        // Создаем новую запись прогресса
        progress = new WatchProgress(progressData);
        await progress.save();
      }

      // Возвращаем обновленный прогресс
      await progress.populate('anime', 'title images episodes year');

      res.status(progress.isNew ? HTTP_STATUS.CREATED : HTTP_STATUS.OK).json({
        success: true,
        data: progress.getSafeObject(),
        message: progress.isNew ? 'Прогресс просмотра создан' : 'Прогресс просмотра обновлен'
      });

    } catch (error) {
      console.error('Save progress error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // GET /api/watch/progress?animeId=... - Получение прогресса просмотра
  async getProgress(req, res) {
    try {
      const userId = req.user.id;
      const { animeId, episode } = req.query;

      // Базовый запрос для прогресса пользователя
      let query = { userId };

      // Фильтрация по аниме если указан animeId
      if (animeId) {
        if (!mongoose.Types.ObjectId.isValid(animeId)) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: {
              message: 'Неверный ID аниме'
            }
          });
        }
        query.animeId = animeId;

        // Если указан номер эпизода, фильтруем по нему
        if (episode) {
          const episodeNum = parseInt(episode);
          if (isNaN(episodeNum) || episodeNum < 1) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              error: {
                message: 'Неверный номер эпизода'
              }
            });
          }
          query.episode = episodeNum;
        }
      }

      // Выполняем запрос
      let progress;
      if (query.episode) {
        // Получаем прогресс конкретного эпизода
        progress = await WatchProgress.findOne(query)
          .populate('anime', 'title images episodes year')
          .lean();
      } else if (query.animeId) {
        // Получаем прогресс для всех эпизодов аниме
        progress = await WatchProgress.find(query)
          .sort({ episode: 1 })
          .populate('anime', 'title images episodes year')
          .lean();
      } else {
        // Получаем прогресс для всех аниме пользователя
        progress = await WatchProgress.find(query)
          .sort({ lastUpdated: -1 })
          .limit(50)
          .populate('anime', 'title images episodes year')
          .lean();
      }

      if (!progress || (Array.isArray(progress) && progress.length === 0)) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Прогресс просмотра не найден'
          }
        });
      }

      // Форматируем ответ
      const response = {
        success: true,
        data: Array.isArray(progress) ? progress : [progress]
      };

      res.json(response);

    } catch (error) {
      console.error('Get progress error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // GET /api/watch/progress/stats - Получение статистики просмотра
  async getProgressStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await WatchProgress.getUserStats(userId);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get progress stats error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // GET /api/watch/progress/continue - Получение списка для продолжения просмотра
  async getContinueWatching(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;

      const continueWatching = await WatchProgress.getContinueWatching(userId, parseInt(limit));

      res.json({
        success: true,
        data: continueWatching
      });

    } catch (error) {
      console.error('Get continue watching error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // GET /api/watch/progress/recent - Получение недавно просмотренного
  async getRecentProgress(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;

      const recentProgress = await WatchProgress.getRecentProgress(userId, parseInt(limit));

      res.json({
        success: true,
        data: recentProgress
      });

    } catch (error) {
      console.error('Get recent progress error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // PUT /api/watch/progress/:id/mark-completed - Отметка эпизода как просмотренного
  async markEpisodeCompleted(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Неверный ID прогресса'
          }
        });
      }

      const progress = await WatchProgress.findOne({ _id: id, userId });
      if (!progress) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Запись прогресса не найдена'
          }
        });
      }

      await progress.markAsCompleted();

      res.json({
        success: true,
        data: progress.getSafeObject(),
        message: 'Эпизод отмечен как просмотренный'
      });

    } catch (error) {
      console.error('Mark episode completed error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // PUT /api/watch/progress/:id/rate - Установка рейтинга эпизода
  async rateEpisode(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { rating } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Неверный ID прогресса'
          }
        });
      }

      if (!rating || rating < 1 || rating > 10 || !Number.isInteger(rating)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Рейтинг должен быть целым числом от 1 до 10'
          }
        });
      }

      const progress = await WatchProgress.findOne({ _id: id, userId });
      if (!progress) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Запись прогресса не найдена'
          }
        });
      }

      await progress.setRating(rating);

      res.json({
        success: true,
        data: progress.getSafeObject(),
        message: 'Рейтинг установлен'
      });

    } catch (error) {
      console.error('Rate episode error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // DELETE /api/watch/progress/:id - Удаление записи прогресса
  async deleteProgress(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Неверный ID прогресса'
          }
        });
      }

      const progress = await WatchProgress.findOneAndDelete({ _id: id, userId });
      if (!progress) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Запись прогресса не найдена'
          }
        });
      }

      res.json({
        success: true,
        message: 'Запись прогресса удалена'
      });

    } catch (error) {
      console.error('Delete progress error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // DELETE /api/watch/progress - Массовое удаление прогресса
  async deleteMultipleProgress(req, res) {
    try {
      const userId = req.user.id;
      const { animeId, episodes } = req.body;

      const deleteQuery = { userId };

      if (animeId) {
        if (!mongoose.Types.ObjectId.isValid(animeId)) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: {
              message: 'Неверный ID аниме'
            }
          });
        }
        deleteQuery.animeId = animeId;
      }

      if (episodes && Array.isArray(episodes)) {
        deleteQuery.episode = { $in: episodes };
      }

      const result = await WatchProgress.deleteMany(deleteQuery);

      res.json({
        success: true,
        message: `Удалено записей прогресса: ${result.deletedCount}`
      });

    } catch (error) {
      console.error('Delete multiple progress error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // GET /api/watch/progress/anime/:animeId - Получение прогресса для конкретного аниме
  async getAnimeProgress(req, res) {
    try {
      const userId = req.user.id;
      const { animeId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(animeId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Неверный ID аниме'
          }
        });
      }

      const animeProgress = await WatchProgress.findByUserAndAnime(userId, animeId);

      if (!animeProgress || animeProgress.length === 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Прогресс просмотра для этого аниме не найден'
          }
        });
      }

      res.json({
        success: true,
        data: animeProgress
      });

    } catch (error) {
      console.error('Get anime progress error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // POST /api/watch/progress/batch - Пакетное сохранение прогресса
  async batchSaveProgress(req, res) {
    try {
      const userId = req.user.id;
      const { progressData } = req.body;

      if (!progressData || !Array.isArray(progressData) || progressData.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Данные прогресса обязательны и должны быть массивом'
          }
        });
      }

      // Валидация и обработка каждого элемента
      const results = [];
      const errors = [];

      for (const data of progressData) {
        try {
          // Базовая валидация
          if (!data.animeId || !data.episode || typeof data.position !== 'number' || typeof data.duration !== 'number') {
            errors.push({
              data,
              error: 'Отсутствуют обязательные поля или неверный тип данных'
            });
            continue;
          }

          // Проверка существования аниме
          const anime = await Anime.findById(data.animeId);
          if (!anime || !anime.isActive || !anime.approved) {
            errors.push({
              data,
              error: 'Аниме не найдено или неактивно'
            });
            continue;
          }

          // Поиск или создание прогресса
          let progress = await WatchProgress.findOne({ 
            userId, 
            animeId: data.animeId, 
            episode: data.episode 
          });

          const progressDataObj = {
            userId,
            animeId: data.animeId,
            episode: data.episode,
            position: data.position,
            duration: data.duration,
            quality: data.quality || 'auto',
            audioLanguage: data.audioLanguage || 'japanese',
            subtitleLanguage: data.subtitleLanguage || 'off',
            device: req.device.type || 'desktop',
            sessionId: req.sessionID || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };

          if (progress) {
            Object.assign(progress, progressDataObj);
            await progress.save();
          } else {
            progress = new WatchProgress(progressDataObj);
            await progress.save();
          }

          results.push(progress.getSafeObject());

        } catch (error) {
          console.error('Batch progress item error:', error);
          errors.push({
            data,
            error: error.message
          });
        }
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          results,
          errors: errors.length > 0 ? errors : undefined
        },
        message: `Обработано записей: ${results.length}${errors.length > 0 ? `, ошибок: ${errors.length}` : ''}`
      });

    } catch (error) {
      console.error('Batch save progress error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }
}

export default new WatchController();